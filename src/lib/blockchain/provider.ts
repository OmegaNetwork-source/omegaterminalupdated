import { JsonRpcProvider, Wallet } from "ethers";
import config from "@/lib/config";

const NETWORK_RETRY_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 10_000,
  timeoutMs: 30_000,
} as const;

let cachedProvider: JsonRpcProvider | null = null;
let cachedSigner: Wallet | null = null;
const nonceLocks = new Map<string, Promise<void>>();

function getDelay(attempt: number): number {
  const delay = NETWORK_RETRY_CONFIG.baseDelay * 2 ** attempt;
  return Math.min(delay, NETWORK_RETRY_CONFIG.maxDelay);
}

function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error ? String(error.message) : "";
  const code = "code" in error ? String(error.code) : "";

  return [
    "ETIMEDOUT",
    "ECONNRESET",
    "ECONNREFUSED",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "ENOTFOUND",
  ].some(
    (networkCode) => code === networkCode || message.includes(networkCode)
  );
}

/**
 * Wraps network operations with exponential backoff retry logic and a hard
 * timeout to mimic the resilience patterns used in the legacy relayer server.
 */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  context = "operation"
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < NETWORK_RETRY_CONFIG.maxRetries) {
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Network timeout after ${NETWORK_RETRY_CONFIG.timeoutMs}ms`
                )
              ),
            NETWORK_RETRY_CONFIG.timeoutMs
          )
        ),
      ]);

      return result;
    } catch (error) {
      lastError = error;
      attempt += 1;

      const shouldRetry =
        attempt < NETWORK_RETRY_CONFIG.maxRetries && isNetworkError(error);

      console.warn(
        `withNetworkRetry(${context}) attempt ${attempt} failed:`,
        error
      );

      if (!shouldRetry) {
        break;
      }

      const delay = getDelay(attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error(`withNetworkRetry(${context}) failed`);
}

/**
 * Lazily creates and caches the main Omega Network provider that connects to
 * the configured JSON-RPC endpoint.
 */
export function getProvider(): JsonRpcProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  if (!config.OMEGA_RPC_URL) {
    throw new Error("OMEGA_RPC_URL is not configured");
  }

  cachedProvider = new JsonRpcProvider(config.OMEGA_RPC_URL, undefined, {
    pollingInterval: 10_000,
  });

  return cachedProvider;
}

/**
 * Returns a signer instance bound to the relayer private key. The signer is
 * reused across calls to preserve nonce tracking but always fetches the
 * latest provider state.
 */
export function getRelayerSigner(): Wallet {
  if (cachedSigner) {
    return cachedSigner;
  }

  const privateKey = process.env.RELAYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("RELAYER_PRIVATE_KEY is not configured");
  }

  cachedSigner = new Wallet(privateKey, getProvider());

  return cachedSigner;
}

/**
 * Retrieves a fresh nonce using the `pending` block tag to avoid collisions
 * when multiple transactions are queued in quick succession.
 */
export async function getFreshNonce(address: string): Promise<number> {
  const provider = getProvider();
  const nonce = await provider.getTransactionCount(address, "pending");
  console.debug(`Fetched nonce ${nonce} for address ${address}`);
  return nonce;
}

function normalizeAddress(address: string): string {
  if (!address) {
    throw new Error("Address is required for nonce locking");
  }

  return address.toLowerCase();
}

export async function withNonceLock<T>(
  address: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = normalizeAddress(address);
  const previous = nonceLocks.get(key) ?? Promise.resolve();
  let release: (() => void) | undefined;

  const current = new Promise<void>((resolve) => {
    release = () => {
      resolve();
    };
  });

  const chain = previous.then(() => current);
  nonceLocks.set(key, chain);

  try {
    await previous;
  } catch (error) {
    release?.();

    if (nonceLocks.get(key) === chain) {
      nonceLocks.delete(key);
    }

    throw error;
  }

  try {
    return await fn();
  } finally {
    release?.();

    if (nonceLocks.get(key) === chain) {
      nonceLocks.delete(key);
    }
  }
}

/**
 * Attempts to fetch the current network gas price and applies a 20% bump in
 * line with the relayer's original configuration. Falls back to 30 gwei when
 * fee data is unavailable.
 */
export async function getGasPrice(): Promise<bigint> {
  const provider = getProvider();

  try {
    const feeData = await provider.getFeeData();
    const networkGasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;

    if (networkGasPrice) {
      const bumped = (networkGasPrice * 120n) / 100n;
      return bumped;
    }
  } catch (error) {
    console.warn("Failed to fetch network gas price, using fallback:", error);
  }

  const fallback = 30n * 10n ** 9n;
  return fallback;
}

export { NETWORK_RETRY_CONFIG };
