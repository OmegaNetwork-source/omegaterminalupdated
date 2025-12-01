/**
 * Trading Account Types
 * 
 * Types for Kalshi and Polymarket account integration
 */

export type TradingVenue = 'kalshi' | 'polymarket';
export type AccountStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// =============================================================================
// Kalshi Types
// =============================================================================

export interface KalshiAccountConfig {
  apiKeyId: string;
  privateKey: string; // RSA private key for signing
}

export interface KalshiBalance {
  available_balance: number;
  portfolio_value: number;
  pnl: number;
  total_deposits: number;
  total_withdrawals: number;
}

export interface KalshiPosition {
  ticker: string;
  market_ticker: string;
  event_ticker: string;
  side: 'yes' | 'no';
  average_price: number;
  total_cost: number;
  quantity: number;
  resting_order_count: number;
  fees_paid: number;
  pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
}

export interface KalshiOrder {
  order_id: string;
  ticker: string;
  action: 'buy' | 'sell';
  side: 'yes' | 'no';
  type: 'limit' | 'market';
  status: 'pending' | 'open' | 'filled' | 'cancelled';
  price: number;
  count: number;
  remaining_count: number;
  created_time: string;
  expiration_time?: string;
}

export interface KalshiTradeRequest {
  ticker: string;
  action: 'buy' | 'sell';
  side: 'yes' | 'no';
  type: 'market' | 'limit';
  count: number;
  price?: number; // Required for limit orders (cents)
  expiration?: number; // Unix timestamp
  client_order_id?: string;
}

export interface KalshiTradeResponse {
  order_id: string;
  ticker: string;
  status: string;
  action: string;
  side: string;
  count: number;
  filled_count: number;
  remaining_count: number;
  average_fill_price?: number;
  created_time: string;
}

// =============================================================================
// Polymarket Types
// =============================================================================

export interface PolymarketAccountConfig {
  privateKey: string; // Ethereum private key for signing
  proxyWallet?: string; // CLOB proxy wallet address
  funderAddress?: string;
}

export interface PolymarketBalance {
  usdc: number;
  positions: number;
  total: number;
}

export interface PolymarketPosition {
  asset_id: string;
  market_slug: string;
  title: string;
  outcome: 'YES' | 'NO';
  size: number;
  average_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
}

export interface PolymarketOrder {
  id: string;
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  original_size: number;
  size_matched: number;
  status: 'LIVE' | 'MATCHED' | 'CANCELLED';
  created_at: string;
  expiration?: string;
}

export interface PolymarketTradeRequest {
  tokenID: string;
  side: 'BUY' | 'SELL';
  price: number; // 0-1
  size: number;
  feeRateBps?: number;
  nonce?: number;
  expiration?: number;
}

export interface PolymarketTradeResponse {
  success: boolean;
  orderID?: string;
  transactionHash?: string;
  status: string;
  message?: string;
}

// =============================================================================
// Connected Account State
// =============================================================================

export interface ConnectedAccount {
  venue: TradingVenue;
  status: AccountStatus;
  lastConnected?: number;
  error?: string;
  
  // Account info
  userId?: string;
  email?: string;
  displayName?: string;
  
  // Balance info
  balance?: {
    available: number;
    locked: number;
    total: number;
  };
  
  // Trading stats
  stats?: {
    totalTrades: number;
    winRate: number;
    pnl: number;
    volume: number;
  };
}

export interface TradingAccountsState {
  kalshi: ConnectedAccount;
  polymarket: ConnectedAccount;
  
  // Active positions across venues
  positions: Array<{
    venue: TradingVenue;
    marketId: string;
    side: 'yes' | 'no';
    size: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
  }>;
  
  // Pending orders
  pendingOrders: Array<{
    venue: TradingVenue;
    orderId: string;
    marketId: string;
    side: 'yes' | 'no';
    price: number;
    size: number;
    status: string;
  }>;
}

// =============================================================================
// Trade Execution Types
// =============================================================================

export interface ExecuteTradeRequest {
  venue: TradingVenue;
  marketId: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  size: number;
  price?: number; // Optional for market orders
  orderType: 'market' | 'limit';
}

export interface ExecuteTradeResponse {
  success: boolean;
  orderId?: string;
  status: string;
  filledSize?: number;
  averagePrice?: number;
  fee?: number;
  error?: string;
}

export interface BatchTradeRequest {
  trades: ExecuteTradeRequest[];
  sequential?: boolean; // Execute in order or parallel
}

export interface BatchTradeResponse {
  success: boolean;
  results: ExecuteTradeResponse[];
  totalFilled: number;
  totalFees: number;
  errors: string[];
}

// =============================================================================
// Parlay Execution Types
// =============================================================================

export interface ParlayExecutionRequest {
  parlayId: string;
  legs: Array<{
    venue: TradingVenue;
    marketId: string;
    side: 'yes' | 'no';
    allocation: number; // Percentage of stake (0-1)
  }>;
  totalStake: number;
  leverage: 1 | 2 | 3 | 4 | 5;
}

export interface ParlayExecutionResponse {
  success: boolean;
  parlayId: string;
  executedLegs: Array<{
    marketId: string;
    venue: TradingVenue;
    orderId: string;
    status: string;
    filledSize: number;
    filledPrice: number;
  }>;
  totalCost: number;
  fees: number;
  errors: string[];
}

// =============================================================================
// Context Types
// =============================================================================

export interface TradingAccountsContextValue {
  // State
  accounts: TradingAccountsState;
  isLoading: boolean;
  
  // Kalshi actions
  connectKalshi: (config: KalshiAccountConfig) => Promise<boolean>;
  disconnectKalshi: () => void;
  getKalshiBalance: () => Promise<KalshiBalance>;
  getKalshiPositions: () => Promise<KalshiPosition[]>;
  placeKalshiOrder: (request: KalshiTradeRequest) => Promise<KalshiTradeResponse>;
  cancelKalshiOrder: (orderId: string) => Promise<boolean>;
  
  // Polymarket actions
  connectPolymarket: (config: PolymarketAccountConfig) => Promise<boolean>;
  disconnectPolymarket: () => void;
  getPolymarketBalance: () => Promise<PolymarketBalance>;
  getPolymarketPositions: () => Promise<PolymarketPosition[]>;
  placePolymarketOrder: (request: PolymarketTradeRequest) => Promise<PolymarketTradeResponse>;
  cancelPolymarketOrder: (orderId: string) => Promise<boolean>;
  
  // Unified trading
  executeTrade: (request: ExecuteTradeRequest) => Promise<ExecuteTradeResponse>;
  executeBatch: (request: BatchTradeRequest) => Promise<BatchTradeResponse>;
  executeParlay: (request: ParlayExecutionRequest) => Promise<ParlayExecutionResponse>;
  
  // Sync
  refreshAccounts: () => Promise<void>;
  refreshPositions: () => Promise<void>;
}

