import { createSign, constants as cryptoConstants } from "crypto";

const KALSHI_API_KEY = process.env.KALSHI_API_KEY ?? "";
const KALSHI_PRIVATE_KEY = process.env.KALSHI_PRIVATE_KEY ?? "";

/**
 * Ensures Kalshi credentials are available before attempting to sign
 * requests. Throws an informative error when the project is not configured.
 */
function assertKalshiConfigured() {
  if (!KALSHI_API_KEY || !KALSHI_PRIVATE_KEY) {
    throw new Error("Kalshi credentials are not configured");
  }
}

export function isKalshiConfigured(): boolean {
  return Boolean(KALSHI_API_KEY && KALSHI_PRIVATE_KEY);
}

/**
 * Signs a Kalshi API message using RSA-PSS SHA-256 as required by their
 * service. The message format concatenates the timestamp, method, path, and
 * optional body payload.
 */
export function signKalshiRequest(message: string): string {
  assertKalshiConfigured();

  try {
    const signer = createSign("RSA-SHA256");
    signer.update(message);
    signer.end();

    const signature = signer.sign(
      {
        key: KALSHI_PRIVATE_KEY,
        padding: cryptoConstants.RSA_PKCS1_PSS_PADDING,
        saltLength: cryptoConstants.RSA_PSS_SALTLEN_DIGEST,
      },
      "base64"
    );

    return signature;
  } catch (error) {
    console.error("Failed to sign Kalshi request:", error);
    throw new Error("Kalshi request signing failed");
  }
}

/**
 * Generates the headers required for authenticated Kalshi API requests. The
 * `path` parameter should include the leading slash and any query string.
 */
export function createKalshiHeaders(
  method: string,
  path: string,
  body?: unknown
): Record<string, string> {
  assertKalshiConfigured();

  const timestamp = Date.now().toString();
  const serializedBody = body ? JSON.stringify(body) : "";
  const message = `${timestamp}${method.toUpperCase()}${path}${serializedBody}`;
  const signature = signKalshiRequest(message);

  return {
    "Content-Type": "application/json",
    "KALSHI-ACCESS-KEY": KALSHI_API_KEY,
    "KALSHI-ACCESS-SIGNATURE": signature,
    "KALSHI-ACCESS-TIMESTAMP": timestamp,
  };
}

export { KALSHI_API_KEY, KALSHI_PRIVATE_KEY };
