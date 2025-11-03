import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { createSecureResponse } from "./security-headers";
import { rateLimitError } from "./error-handler";

export type RateLimitTier =
  | "DEFAULT"
  | "BLOCKCHAIN"
  | "FAUCET"
  | "API_PROXY"
  | "USER_MANAGEMENT";

interface RateLimitConfigEntry {
  limit: number;
  window: number; // seconds
}

const RATE_LIMIT_CONFIG: Record<RateLimitTier, RateLimitConfigEntry> = {
  DEFAULT: { limit: 10, window: 10 },
  BLOCKCHAIN: { limit: 5, window: 60 },
  FAUCET: { limit: 1, window: 86_400 },
  API_PROXY: { limit: 30, window: 60 },
  USER_MANAGEMENT: { limit: 20, window: 60 },
};

const redisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redisClient = redisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    })
  : null;

const redisRatelimiters: Partial<Record<RateLimitTier, Ratelimit>> = {};

if (redisClient) {
  (Object.keys(RATE_LIMIT_CONFIG) as RateLimitTier[]).forEach((tier) => {
    const config = RATE_LIMIT_CONFIG[tier];
    redisRatelimiters[tier] = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
    });
  });
}

interface FallbackRecord {
  count: number;
  reset: number;
}

const fallbackStore = new Map<string, FallbackRecord>();

function namespaceIdentifier(tier: RateLimitTier, identifier: string): string {
  if (!identifier) {
    return `${tier}:anonymous`;
  }

  return identifier.startsWith(`${tier}:`)
    ? identifier
    : `${tier}:${identifier}`;
}

function getIdentifier(
  request: NextRequest,
  tier: RateLimitTier,
  provided?: string
): string {
  if (provided) {
    return namespaceIdentifier(tier, provided);
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = request.ip ?? forwarded?.split(",")[0]?.trim();

  if (ip) {
    return namespaceIdentifier(tier, ip);
  }

  return namespaceIdentifier(tier, "anonymous");
}

async function applyFallbackLimit(
  identifier: string,
  tier: RateLimitTier
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const config = RATE_LIMIT_CONFIG[tier];
  const now = Date.now();
  const windowMs = config.window * 1000;
  const entry = fallbackStore.get(identifier);

  if (!entry || entry.reset <= now) {
    const nextReset = now + windowMs;
    fallbackStore.set(identifier, { count: 1, reset: nextReset });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.floor(nextReset / 1000),
    };
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: Math.floor(entry.reset / 1000),
    };
  }

  entry.count += 1;
  fallbackStore.set(identifier, entry);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: Math.floor(entry.reset / 1000),
  };
}

async function executeRateLimit(
  tier: RateLimitTier,
  resolvedIdentifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const config = RATE_LIMIT_CONFIG[tier];

  try {
    const limiter = redisRatelimiters[tier];

    if (limiter) {
      const result = await limiter.limit(resolvedIdentifier);

      return {
        success: result.success,
        limit: config.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    }

    return applyFallbackLimit(resolvedIdentifier, tier);
  } catch (error) {
    console.error("Rate limiter error, allowing request by default:", error);
    const now = Date.now();
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Math.floor((now + config.window * 1000) / 1000),
    };
  }
}

/**
 * Applies rate limiting using Upstash Redis when available, falling back to an
 * in-memory sliding window implementation when running locally or when Redis
 * credentials have not been provisioned.
 */
export async function rateLimit(
  request: NextRequest,
  tier: RateLimitTier,
  identifier?: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const resolvedIdentifier = getIdentifier(request, tier, identifier);
  return executeRateLimit(tier, resolvedIdentifier);
}

/**
 * Higher-order helper that attaches rate limiting to any Next.js route handler.
 * Automatically injects rate limit headers into the handler response and emits
 * a 429 response when the active tier has been exceeded.
 */
export function withRateLimit<
  Handler extends (
    request: NextRequest,
    ...args: any[]
  ) => Promise<Response> | Response
>(
  handler: Handler,
  tier: RateLimitTier,
  identifierResolver?: (
    request: NextRequest,
    ...args: any[]
  ) => Promise<string | undefined> | string | undefined
): Handler {
  return (async (
    request: NextRequest,
    ...args: Parameters<Handler>
  ): Promise<Response> => {
    const identifier = identifierResolver
      ? await identifierResolver(request, ...args)
      : undefined;
    const result = await rateLimit(request, tier, identifier ?? undefined);

    if (!result.success) {
      const response = createSecureResponse(
        { success: false, error: "Too many requests" },
        429
      );

      response.headers.set("X-RateLimit-Limit", String(result.limit));
      response.headers.set("X-RateLimit-Remaining", String(result.remaining));
      response.headers.set("X-RateLimit-Reset", String(result.reset));

      return response;
    }

    const response = await handler(request, ...args);

    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.reset));

    return response;
  }) as Handler;
}

export async function limitByIdentifier(
  tier: RateLimitTier,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const sanitized = identifier.trim();
  const resolvedIdentifier = namespaceIdentifier(
    tier,
    sanitized || "anonymous"
  );

  return executeRateLimit(tier, resolvedIdentifier);
}

export async function enforceLimit(
  tier: RateLimitTier,
  identifier: string
): Promise<void> {
  const result = await limitByIdentifier(tier, identifier);

  if (!result.success) {
    throw rateLimitError("Too many requests", result.reset);
  }
}

export type RateLimitResult = Awaited<ReturnType<typeof rateLimit>>;
export type RateLimitConfig = typeof RATE_LIMIT_CONFIG;
