import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

const DEFAULT_BASE_URL = "https://api.chaingpt.org";

function sanitizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function getBaseUrl(): string {
  const envUrl = process.env.CHAINGPT_BASE_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/$/, "");
  }
  return DEFAULT_BASE_URL;
}

function collectServerKeys(): string[] {
  const keys = new Set<string>();

  const primary = process.env.CHAINGPT_API_KEY?.trim();
  if (primary) {
    keys.add(primary);
  }

  const multiple = process.env.CHAINGPT_API_KEYS?.split(",") ?? [];
  for (const key of multiple) {
    const trimmed = key.trim();
    if (trimmed.length > 0) {
      keys.add(trimmed);
    }
  }

  return Array.from(keys);
}

function resolveApiKey(request: NextRequest): {
  key: string | null;
  source: "user" | "server" | null;
} {
  const userKey = request.headers.get("x-chaingpt-user-key")?.trim();
  if (userKey && userKey.length > 0) {
    return { key: userKey, source: "user" };
  }

  const serverKeys = collectServerKeys();
  if (serverKeys.length > 0) {
    return { key: serverKeys[0]!, source: "server" };
  }

  return { key: null, source: null };
}

async function parseUpstreamError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (typeof data?.error === "string" && data.error.trim().length > 0) {
        return data.error;
      }
      if (typeof data?.message === "string" && data.message.trim().length > 0) {
        return data.message;
      }
    } else {
      const text = await response.text();
      if (text.trim().length > 0) {
        return text;
      }
    }
  } catch {
    // Ignore parsing failures.
  }

  return `ChainGPT upstream error (${response.status})`;
}

export function getChainGptCapabilities(): {
  enabled: boolean;
  hasServerKey: boolean;
  features: typeof config.CHAINGPT.FEATURES & { stream: boolean };
  message?: string;
} {
  const serverKeys = collectServerKeys();
  const hasServerKey = serverKeys.length > 0;

  return {
    enabled: true,
    hasServerKey,
    features: {
      chat: config.CHAINGPT.FEATURES.chat,
      stream: config.CHAINGPT.FEATURES.stream,
      contract: config.CHAINGPT.FEATURES.contract,
      auditor: config.CHAINGPT.FEATURES.auditor,
      nft: config.CHAINGPT.FEATURES.nft,
    },
    message: hasServerKey
      ? undefined
      : "Server-side ChainGPT key is not configured.",
  };
}

export async function proxyChainGptJson(
  request: NextRequest,
  upstreamPath: string,
  transformText?: (text: string) => unknown
): Promise<NextResponse> {
  const { key, source } = resolveApiKey(request);

  if (!key) {
    // Log for debugging (only in development)
    if (process.env.NODE_ENV !== "production") {
      const serverKeys = collectServerKeys();
      console.warn("[ChainGPT] No API key available:", {
        serverKeysCount: serverKeys.length,
        hasUserKey: !!request.headers.get("x-chaingpt-user-key"),
      });
    }
    
    return NextResponse.json(
      {
        error:
          "ChainGPT API key is required. Use 'chat init <api-key>' to configure your own key, or ensure server keys are configured in .env.local as CHAINGPT_API_KEY.",
        code: "NO_API_KEY",
      },
      { status: 503 }
    );
  }
  
  if (process.env.NODE_ENV !== "production") {
    console.log(`[ChainGPT] Using API key from: ${source}`);
  }

  const requestPayload = await request.json();

  const upstream = await fetch(`${getBaseUrl()}${sanitizePath(upstreamPath)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
    body: JSON.stringify(requestPayload),
  });

  if (!upstream.ok) {
    const error = await parseUpstreamError(upstream);
    return NextResponse.json({ error }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  }

  const text = await upstream.text();
  const responsePayload = transformText ? transformText(text) : { data: text };
  return NextResponse.json(responsePayload, { status: upstream.status });
}

export async function proxyChainGptStream(
  request: NextRequest,
  upstreamPath: string,
  feature: string
): Promise<Response> {
  const { key } = resolveApiKey(request);

  if (!key) {
    return NextResponse.json(
      {
        error:
          "ChainGPT API key is required. Use 'chat init <api-key>' to configure your own key, or ensure server keys are configured.",
        code: "NO_API_KEY",
      },
      { status: 503 }
    );
  }

  const payload = await request.json();

  const upstream = await fetch(`${getBaseUrl()}${sanitizePath(upstreamPath)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const error = await parseUpstreamError(upstream);
    return NextResponse.json({ error }, { status: upstream.status });
  }

  if (!upstream.body) {
    return NextResponse.json(
      { error: `ChainGPT ${feature} response did not include a body.` },
      { status: 502 }
    );
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
