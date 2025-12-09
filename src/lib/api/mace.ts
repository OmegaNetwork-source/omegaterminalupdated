/**
 * MACE API Client
 * Monad DEX Aggregator API integration
 * Documentation: https://api.mace.ag/swaps/rapidoc
 */

const MACE_API_BASE_URL = "https://api.mace.ag/swaps";

// API Key - may be required for some endpoints
const MACE_API_KEY = process.env.NEXT_PUBLIC_MACE_API_KEY || "";

/**
 * Fetch with API key authentication if available
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (MACE_API_KEY) {
    headers.Authorization = `Bearer ${MACE_API_KEY}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `MACE API error (${response.status}): ${errorText || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get all supported tokens/assets
 */
export async function getSupportedAssets(params?: {
  page?: number;
  pageSize?: number;
  verification?: "any" | "verified" | "unverified";
  sortBy?: "volume24H" | "trades24H";
}) {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.pageSize !== undefined) {
    searchParams.append("pageSize", params.pageSize.toString());
  }
  if (params?.verification) {
    searchParams.append("verification", params.verification);
  }
  if (params?.sortBy) {
    searchParams.append("sortBy", params.sortBy);
  }

  const url = `${MACE_API_BASE_URL}/supported-assets${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return fetchWithAuth(url);
}

/**
 * Search for tokens/assets
 */
export async function searchAssets(query: string, params?: {
  amount?: number;
  verification?: "any" | "verified" | "unverified";
}) {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);
  if (params?.amount !== undefined) {
    searchParams.append("amount", params.amount.toString());
  }
  if (params?.verification) {
    searchParams.append("verification", params.verification);
  }

  const url = `${MACE_API_BASE_URL}/search-assets?${searchParams.toString()}`;
  return fetchWithAuth(url);
}

/**
 * Get token balances for a user address
 */
export async function getTokenBalances(
  userAddress: string,
  params?: {
    page?: number;
    pageSize?: number;
    verification?: "any" | "verified" | "unverified";
    sortBy?: "volume24H" | "trades24H";
    omitZeros?: boolean;
    omitErrors?: boolean;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.pageSize !== undefined) {
    searchParams.append("pageSize", params.pageSize.toString());
  }
  if (params?.verification) {
    searchParams.append("verification", params.verification);
  }
  if (params?.sortBy) {
    searchParams.append("sortBy", params.sortBy);
  }
  if (params?.omitZeros !== undefined) {
    searchParams.append("omitZeros", params.omitZeros.toString());
  }
  if (params?.omitErrors !== undefined) {
    searchParams.append("omitErrors", params.omitErrors.toString());
  }

  const url = `${MACE_API_BASE_URL}/token-balances/${userAddress}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return fetchWithAuth(url);
}

/**
 * Get exchange rate between two tokens
 */
export async function getExchangeRate(params: {
  inToken: string; // Token ID (e.g., "native" or "0x...")
  outToken: string;
  lastNSeconds?: number; // Default: 60
}) {
  const url = `${MACE_API_BASE_URL}/exchange-rate`;
  return fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify({
      inToken: params.inToken,
      outToken: params.outToken,
      lastNSeconds: params.lastNSeconds || 60,
    }),
  });
}

/**
 * Get best swap routes
 */
export async function getBestRoutes(params: {
  in: Array<{ token: string; amount: string }>; // Token ID and amount
  out: Array<{
    token: string;
    minAmount?: string;
    slippageToleranceBps?: number; // Default: 10000 (100%)
  }>;
  from?: string; // User address for simulation
  maxRoutes?: number; // Default: 1
  gasPrice?: string; // Gas price in wei
  solver?: {
    exchangeFilter?: {
      allowedAddresses?: string[];
      disallowedAddresses?: string[];
      allowedBrands?: string[];
      disallowedBrands?: string[];
    };
    exploreDuration?: number; // Max milliseconds for exploration
    maxAdditionalHops?: number;
    includeTransactionInfo?: boolean;
    includeSolverTrace?: boolean;
    includeStats?: boolean;
  };
}) {
  const url = `${MACE_API_BASE_URL}/get-best-routes`;
  return fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/**
 * Get all supported exchanges
 */
export async function getSupportedExchanges(params?: {
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.pageSize !== undefined) {
    searchParams.append("pageSize", params.pageSize.toString());
  }

  const url = `${MACE_API_BASE_URL}/supported-exchanges${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return fetchWithAuth(url);
}

/**
 * Get exchange information
 */
export async function getExchangeInfo(exchangeAddress: string) {
  const url = `${MACE_API_BASE_URL}/exchange-info/${exchangeAddress}`;
  return fetchWithAuth(url);
}

/**
 * Get router address
 */
export async function getRouterAddress() {
  const url = `${MACE_API_BASE_URL}/router-address`;
  const response = await fetch(url, {
    headers: {
      Accept: "text/plain",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch router address: ${response.statusText}`);
  }
  return response.text();
}

