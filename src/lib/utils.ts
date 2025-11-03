/**
 * Utility Functions Module
 *
 * Collection of helper functions migrated from js/utils.js to TypeScript.
 * Provides utilities for encoding, formatting, validation, and cryptography.
 *
 * Note: Uses ethers v6 API (keccak256, toUtf8Bytes as top-level imports)
 */

import { keccak256, toUtf8Bytes } from "ethers";

/**
 * Base58 character set used for decoding
 */
const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Decode base58 string to Uint8Array
 *
 * @param str - Base58 encoded string
 * @returns Decoded Uint8Array
 * @throws Error if string contains invalid characters
 */
export function base58Decode(str: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const charIndex = BASE58_ALPHABET.indexOf(char);
    if (charIndex < 0) {
      throw new Error(`Invalid base58 character: ${char}`);
    }
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] *= 58;
    }
    bytes.push(charIndex);
    for (let j = bytes.length - 1; j >= 1; j--) {
      bytes[j - 1] += Math.floor(bytes[j] / 256);
      bytes[j] %= 256;
    }
  }

  // Handle leading zeros
  for (let i = 0; i < str.length && str[i] === "1"; i++) {
    bytes.unshift(0);
  }

  return new Uint8Array(bytes);
}

/**
 * Format duration in seconds to human-readable string
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1h 30m 45s")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Format large numbers with K/M/B suffixes
 *
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1.5K", "2.3M", "1.1B")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Generate random hex string
 *
 * @param length - Length of hex string (default: 64 characters)
 * @returns Random hex string with 0x prefix
 */
function getRuntimeCrypto(): Crypto {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    return globalThis.crypto;
  }

  throw new Error("Secure random generator unavailable in this environment.");
}

export function randomHex(length: number = 64): string {
  if (length % 2 !== 0) {
    throw new Error("randomHex length must be an even number of characters");
  }

  const bytes = new Uint8Array(length / 2);
  const cryptoApi = getRuntimeCrypto();
  cryptoApi.getRandomValues(bytes);

  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Wait for DOM element to exist
 *
 * @param selector - CSS selector
 * @param timeout - Maximum wait time in milliseconds (default: 5000)
 * @returns Promise that resolves with the element
 * @throws Error if element not found within timeout
 */
export function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("waitForElement can only be used in browser"));
      return;
    }

    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Copy text to clipboard
 *
 * @param text - Text to copy
 * @returns Promise that resolves to true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Validate Ethereum address format
 *
 * @param address - Address to validate
 * @returns True if valid Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Validate private key format
 *
 * @param key - Private key to validate
 * @returns True if valid private key format
 */
export function isValidPrivateKey(key: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(key);
}

/**
 * Shorten Ethereum address for display
 *
 * @param address - Address to shorten
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Generate mixer commitment
 *
 * Creates a commitment for the mixer using keccak256 hash of a random secret.
 *
 * @returns Object with secret and commitment
 */
export function generateMixerCommitment(): {
  secret: string;
  commitment: string;
} {
  // Generate random secret
  const secret = randomHex(32);

  // Generate commitment using keccak256 (ethers v6)
  const commitment = keccak256(toUtf8Bytes(secret));

  return {
    secret,
    commitment,
  };
}

/**
 * Parse command string into arguments array
 *
 * Handles quoted strings as single arguments.
 *
 * @param command - Command string to parse
 * @returns Array of command arguments
 */
export function parseCommandArgs(command: string): string[] {
  const args: string[] = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = "";
    } else if (char === " " && !inQuotes) {
      if (current) {
        args.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    args.push(current);
  }

  return args;
}

/**
 * Escape HTML special characters
 *
 * @param unsafe - Unsafe HTML string
 * @returns Escaped HTML string
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format balance for display
 *
 * @param balance - Balance value (string or number)
 * @param symbol - Token symbol (default: "OMEGA")
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted balance string
 */
export function formatBalance(
  balance: string | number,
  symbol: string = "OMEGA",
  decimals: number = 4
): string {
  const numBalance =
    typeof balance === "string" ? parseFloat(balance) : balance;
  return `${numBalance.toFixed(decimals)} ${symbol}`;
}

/**
 * Get current Unix timestamp
 *
 * @returns Current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Format Unix timestamp to readable date string
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Format currency values for display
 * Used for displaying USD values in API responses
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "1,234,567.89")
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  // For large numbers, use K/M/B suffixes
  if (value >= 1_000_000) {
    return formatNumber(value);
  }

  // For smaller numbers, format with commas and decimals
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
