/**
 * ChainGPT API Client
 *
 * Client-side wrapper around the server-side ChainGPT proxy endpoints.
 * Handles local API key management, capability discovery, and streaming helpers.
 */

import { config } from "@/lib/config";
import type {
  ChainGPTAuditorRequest,
  ChainGPTCapabilities,
  ChainGPTChatRequest,
  ChainGPTChatResponse,
  ChainGPTContractRequest,
  ChainGPTNFTRequest,
  ChainGPTNFTResponse,
} from "@/types/chaingpt";

const CHAINGPT_STORAGE_KEY = "chaingpt-api-key";
const CHAINGPT_INIT_KEY = "chaingpt-initialized";

const API_BASE = "/api/chaingpt";
const CHAT_ENDPOINT = `${API_BASE}/chat`;
const CHAT_STREAM_ENDPOINT = `${API_BASE}/chat/stream`;
const CONTRACT_ENDPOINT = `${API_BASE}/contract`;
const AUDITOR_ENDPOINT = `${API_BASE}/auditor`;
const NFT_ENDPOINT = `${API_BASE}/nft`;

let capabilitiesCache: ChainGPTCapabilities | null = null;
let capabilitiesPromise: Promise<ChainGPTCapabilities> | null = null;

// Auto-fetch capabilities on load to detect server keys
if (typeof window !== "undefined" && config.CHAINGPT.AUTO_INITIALIZE) {
  void fetchCapabilities().then((caps) => {
    // Auto-initialize if server has keys available (no user key needed)
    if (caps.hasServerKey && !getUserApiKey()) {
      setInitializedFlag();
    }
  }).catch(() => {
    // Silent failure – capabilities can be retried on demand.
  });
}

function getUserApiKey(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = window.localStorage.getItem(CHAINGPT_STORAGE_KEY);
  if (!key || key.trim().length === 0) {
    return null;
  }

  return key;
}

function setInitializedFlag(): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHAINGPT_INIT_KEY, "true");
  }
}

export function setApiKey(apiKey: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHAINGPT_STORAGE_KEY, apiKey);
  setInitializedFlag();
  capabilitiesCache = null;
}

export function getApiKey(): string | null {
  return getUserApiKey();
}

export function getAllApiKeys(): string[] {
  const userKey = getUserApiKey();
  return userKey ? [userKey] : [];
}

async function fetchCapabilities(force = false): Promise<ChainGPTCapabilities> {
  if (!force && capabilitiesCache) {
    return capabilitiesCache;
  }

  if (!capabilitiesPromise || force) {
    capabilitiesPromise = config.CHAINGPT.loadCapabilities();
  }

  try {
    const capabilities = await capabilitiesPromise;
    capabilitiesCache = capabilities;

    if (
      typeof window !== "undefined" &&
      capabilities.enabled &&
      capabilities.hasServerKey
    ) {
      setInitializedFlag();
    }

    return capabilities;
  } catch (error) {
    const fallback: ChainGPTCapabilities = {
      enabled: false,
      hasServerKey: false,
      features: {
        chat: false,
        stream: false,
        contract: false,
        auditor: false,
        nft: false,
      },
      message:
        error instanceof Error
          ? error.message
          : "Failed to load ChainGPT capabilities.",
    };

    capabilitiesCache = fallback;
    return fallback;
  } finally {
    capabilitiesPromise = null;
  }
}

function hasServerKey(): boolean {
  return Boolean(capabilitiesCache?.enabled && capabilitiesCache?.hasServerKey);
}

export function isInitialized(): boolean {
  // Check if user has a custom API key
  if (getUserApiKey()) {
    return true;
  }
  
  // Check if server has API keys available (auto-initialize)
  if (capabilitiesCache?.hasServerKey) {
    return true;
  }
  
  // Always return true - commands should work immediately
  // Server-side API keys will be used automatically if available
  // If no keys available, error will be shown on API call
  return true;
}

interface InitializationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function initialize(
  apiKey?: string
): Promise<InitializationResult> {
  try {
    if (apiKey) {
      setApiKey(apiKey);
      return {
        success: true,
        message: `ChainGPT initialized with custom API key: ${maskApiKey(
          apiKey
        )}`,
      };
    }

    const capabilities = await fetchCapabilities(true);

    if (!capabilities.enabled) {
      return {
        success: false,
        error:
          capabilities.message ??
          "ChainGPT services are disabled for this deployment.",
      };
    }

    if (!capabilities.hasServerKey) {
      return {
        success: false,
        error:
          "No server-side ChainGPT key is configured. Provide your own key with 'chat init <api-key>'.",
      };
    }

    setInitializedFlag();

    return {
      success: true,
      message: "ChainGPT server integration ready.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize ChainGPT.";
    return {
      success: false,
      error: message,
    };
  }
}

function buildHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init ?? {});
  headers.set("Content-Type", "application/json");

  const userKey = getUserApiKey();
  if (userKey) {
    headers.set("x-chaingpt-user-key", userKey);
  }

  return headers;
}

async function throwApiError(response: Response): Promise<never> {
  let message = `ChainGPT request failed (${response.status})`;

  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const data = await response.json();
      // Check for error field first
      if (typeof data?.error === "string" && data.error.trim().length > 0) {
        message = data.error;
      } 
      // Check for message field, but ignore generic success messages that might be errors
      else if (
        typeof data?.message === "string" &&
        data.message.trim().length > 0
      ) {
        // If message is "Request Successful" but status is not 2xx, it's misleading
        if (data.message.toLowerCase().includes("successful") && !response.ok) {
          message = `API returned error status ${response.status} despite success message`;
        } else {
          message = data.message;
        }
      }
      // Check for code field (e.g., NO_API_KEY)
      else if (data?.code && typeof data.code === "string") {
        message = data.code;
        if (data.error) {
          message = `${data.code}: ${data.error}`;
        }
      }
    } else {
      const text = await response.text();
      if (text.trim().length > 0) {
        message = text;
      }
    }
  } catch {
    // Ignore JSON/text parsing failures and fall back to default message.
  }

  throw new Error(message);
}

async function fetchWithHandling(
  endpoint: string,
  body: unknown,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    ...init,
    headers: buildHeaders(init?.headers),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  return response;
}

async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetchWithHandling(endpoint, body);
  return (await response.json()) as T;
}

function ensureStream(
  response: Response,
  feature: string
): ReadableStreamDefaultReader<Uint8Array> {
  if (!response.body) {
    throw new Error(`ChainGPT ${feature} response did not include a stream.`);
  }
  return response.body.getReader();
}

export async function chatStream(
  request: ChainGPTChatRequest
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetchWithHandling(CHAT_STREAM_ENDPOINT, request);
  return ensureStream(response, "chat stream");
}

export async function chatBlob(
  request: ChainGPTChatRequest
): Promise<ChainGPTChatResponse> {
  return await postJson<ChainGPTChatResponse>(CHAT_ENDPOINT, request);
}

export async function generateContract(
  request: ChainGPTContractRequest
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetchWithHandling(CONTRACT_ENDPOINT, request);
  return ensureStream(response, "contract generation");
}

export async function auditContract(
  request: ChainGPTAuditorRequest
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetchWithHandling(AUDITOR_ENDPOINT, request);
  return ensureStream(response, "contract audit");
}

export async function generateNFT(
  request: ChainGPTNFTRequest
): Promise<ChainGPTNFTResponse> {
  return await postJson<ChainGPTNFTResponse>(NFT_ENDPOINT, request);
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) {
    return "****";
  }
  return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
}

export function parseStreamChunk(
  chunk: string,
  buffer: string = ""
): { content: string; buffer: string } {
  const fullText = buffer + chunk;
  const lines = fullText.split("\n");
  const newBuffer = chunk.endsWith("\n") ? "" : lines.pop() || "";

  let content = "";

  for (const line of lines) {
    let trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) {
      continue;
    }

    if (trimmed.startsWith("data:")) {
      trimmed = trimmed.substring(5).trim();
      if (!trimmed) {
        continue;
      }
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (parsed.content) {
        content += parsed.content;
      } else if (parsed.data?.content) {
        content += parsed.data.content;
      } else if (parsed.data?.bot) {
        content += parsed.data.bot;
      } else if (parsed.text) {
        content += parsed.text;
      } else if (parsed.message) {
        content += parsed.message;
      } else if (parsed.answer) {
        content += parsed.answer;
      } else if (parsed.bot) {
        content += parsed.bot;
      }
    } catch {
      if (trimmed.length > 0) {
        content += trimmed;
      }
    }
  }

  return { content, buffer: newBuffer };
}

export async function refreshCapabilities(): Promise<ChainGPTCapabilities> {
  return await fetchCapabilities(true);
}

export async function getCapabilities(): Promise<ChainGPTCapabilities> {
  if (capabilitiesCache) {
    return capabilitiesCache;
  }
  return await fetchCapabilities();
}
