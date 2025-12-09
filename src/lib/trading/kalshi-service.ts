/**
 * Kalshi Trading Service
 * 
 * Full integration with Kalshi API for account management and trading.
 * Implements RSA-PSS signature authentication as required by Kalshi.
 */

import type {
  KalshiAccountConfig,
  KalshiBalance,
  KalshiPosition,
  KalshiOrder,
  KalshiTradeRequest,
  KalshiTradeResponse,
} from '@/types/trading-accounts';

// =============================================================================
// Constants
// =============================================================================

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';
const KALSHI_WS_URL = 'wss://api.elections.kalshi.com/trade-api/ws/v2';

// =============================================================================
// Kalshi Service Class
// =============================================================================

export class KalshiService {
  private apiKeyId: string;
  private privateKey: string;
  private token?: string;
  private tokenExpiry?: number;
  private userId?: string;

  constructor(config: KalshiAccountConfig) {
    this.apiKeyId = config.apiKeyId;
    this.privateKey = config.privateKey;
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  /**
   * Generate RSA-PSS signature for API request
   * Kalshi uses RSA-PSS with SHA-256 for request signing
   */
  private async generateSignature(
    timestamp: number,
    method: string,
    path: string,
    body?: string
  ): Promise<string> {
    // Message format: timestamp + method + path + body
    const message = `${timestamp}${method}${path}${body || ''}`;
    
    // Parse PEM private key
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    let keyContent = this.privateKey;
    
    if (keyContent.includes(pemHeader)) {
      keyContent = keyContent
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, '');
    }
    
    // Import the private key
    const binaryKey = Uint8Array.from(atob(keyContent), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
    
    // Sign the message
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      cryptoKey,
      encoder.encode(message)
    );
    
    // Convert to base64
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /**
   * Create authenticated headers for API request
   */
  private async createHeaders(
    method: string,
    path: string,
    body?: string
  ): Promise<HeadersInit> {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await this.generateSignature(timestamp, method, path, body);
    
    return {
      'Content-Type': 'application/json',
      'KALSHI-ACCESS-KEY': this.apiKeyId,
      'KALSHI-ACCESS-SIGNATURE': signature,
      'KALSHI-ACCESS-TIMESTAMP': timestamp.toString(),
    };
  }

  /**
   * Login and get auth token (alternative to per-request signing)
   */
  async login(): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/login';
      const body = JSON.stringify({ api_key_id: this.apiKeyId });
      
      const signature = await this.generateSignature(timestamp, 'POST', path, body);
      
      const response = await fetch(`${KALSHI_API_BASE}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'KALSHI-ACCESS-KEY': this.apiKeyId,
          'KALSHI-ACCESS-SIGNATURE': signature,
          'KALSHI-ACCESS-TIMESTAMP': timestamp.toString(),
        },
        body,
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }
      
      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hour expiry
      this.userId = data.member_id;
      
      return true;
    } catch (error) {
      console.error('[KalshiService] Login error:', error);
      return false;
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: object
  ): Promise<T> {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const headers = await this.createHeaders(method, path, bodyStr);
    
    const response = await fetch(`${KALSHI_API_BASE}${path}`, {
      method,
      headers,
      body: bodyStr,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kalshi API error ${response.status}: ${errorText}`);
    }
    
    return response.json();
  }

  // ===========================================================================
  // Account Management
  // ===========================================================================

  /**
   * Get account balance
   */
  async getBalance(): Promise<KalshiBalance> {
    const data = await this.request<{ balance: any }>('GET', '/portfolio/balance');
    
    return {
      available_balance: data.balance?.available_balance_cents / 100 || 0,
      portfolio_value: data.balance?.portfolio_value_cents / 100 || 0,
      pnl: data.balance?.pnl_cents / 100 || 0,
      total_deposits: data.balance?.total_deposits_cents / 100 || 0,
      total_withdrawals: data.balance?.total_withdrawals_cents / 100 || 0,
    };
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<KalshiPosition[]> {
    const data = await this.request<{ market_positions: any[] }>('GET', '/portfolio/positions');
    
    return (data.market_positions || []).map(pos => ({
      ticker: pos.ticker,
      market_ticker: pos.market_ticker,
      event_ticker: pos.event_ticker,
      side: pos.position > 0 ? 'yes' : 'no',
      average_price: pos.average_price_cents / 100,
      total_cost: pos.total_cost_cents / 100,
      quantity: Math.abs(pos.position),
      resting_order_count: pos.resting_order_count || 0,
      fees_paid: pos.fees_paid_cents / 100,
      pnl: pos.pnl_cents / 100,
      realized_pnl: pos.realized_pnl_cents / 100,
      unrealized_pnl: pos.unrealized_pnl_cents / 100,
    }));
  }

  /**
   * Get settlement history
   */
  async getSettlements(limit: number = 100): Promise<any[]> {
    const data = await this.request<{ settlements: any[] }>('GET', `/portfolio/settlements?limit=${limit}`);
    return data.settlements || [];
  }

  // ===========================================================================
  // Trading
  // ===========================================================================

  /**
   * Place an order
   */
  async placeOrder(request: KalshiTradeRequest): Promise<KalshiTradeResponse> {
    const body: any = {
      ticker: request.ticker,
      action: request.action,
      side: request.side,
      type: request.type,
      count: request.count,
    };
    
    if (request.type === 'limit' && request.price !== undefined) {
      body.yes_price = request.side === 'yes' ? request.price : 100 - request.price;
    }
    
    if (request.expiration) {
      body.expiration_ts = request.expiration;
    }
    
    if (request.client_order_id) {
      body.client_order_id = request.client_order_id;
    }
    
    const data = await this.request<{ order: any }>('POST', '/portfolio/orders', body);
    
    return {
      order_id: data.order.order_id,
      ticker: data.order.ticker,
      status: data.order.status,
      action: data.order.action,
      side: data.order.side,
      count: data.order.count,
      filled_count: data.order.filled_count || 0,
      remaining_count: data.order.remaining_count,
      average_fill_price: data.order.average_fill_price_cents / 100,
      created_time: data.order.created_time,
    };
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<KalshiOrder> {
    const data = await this.request<{ order: any }>('GET', `/portfolio/orders/${orderId}`);
    
    return {
      order_id: data.order.order_id,
      ticker: data.order.ticker,
      action: data.order.action,
      side: data.order.side,
      type: data.order.type,
      status: data.order.status,
      price: data.order.price_cents / 100,
      count: data.order.count,
      remaining_count: data.order.remaining_count,
      created_time: data.order.created_time,
      expiration_time: data.order.expiration_time,
    };
  }

  /**
   * Get open orders
   */
  async getOpenOrders(ticker?: string): Promise<KalshiOrder[]> {
    const path = ticker 
      ? `/portfolio/orders?ticker=${ticker}&status=resting`
      : '/portfolio/orders?status=resting';
    
    const data = await this.request<{ orders: any[] }>('GET', path);
    
    return (data.orders || []).map(order => ({
      order_id: order.order_id,
      ticker: order.ticker,
      action: order.action,
      side: order.side,
      type: order.type,
      status: order.status,
      price: order.price_cents / 100,
      count: order.count,
      remaining_count: order.remaining_count,
      created_time: order.created_time,
      expiration_time: order.expiration_time,
    }));
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.request('DELETE', `/portfolio/orders/${orderId}`);
      return true;
    } catch (error) {
      console.error('[KalshiService] Cancel order error:', error);
      return false;
    }
  }

  /**
   * Cancel all orders for a market
   */
  async cancelAllOrders(ticker?: string): Promise<number> {
    const body = ticker ? { ticker } : {};
    const data = await this.request<{ cancelled_count: number }>('DELETE', '/portfolio/orders', body);
    return data.cancelled_count || 0;
  }

  /**
   * Execute market buy
   */
  async marketBuy(
    ticker: string,
    side: 'yes' | 'no',
    count: number
  ): Promise<KalshiTradeResponse> {
    return this.placeOrder({
      ticker,
      action: 'buy',
      side,
      type: 'market',
      count,
    });
  }

  /**
   * Execute market sell
   */
  async marketSell(
    ticker: string,
    side: 'yes' | 'no',
    count: number
  ): Promise<KalshiTradeResponse> {
    return this.placeOrder({
      ticker,
      action: 'sell',
      side,
      type: 'market',
      count,
    });
  }

  // ===========================================================================
  // Market Data
  // ===========================================================================

  /**
   * Get market details
   */
  async getMarket(ticker: string): Promise<any> {
    const data = await this.request<{ market: any }>('GET', `/markets/${ticker}`);
    return data.market;
  }

  /**
   * Get orderbook
   */
  async getOrderbook(ticker: string, depth: number = 10): Promise<any> {
    const data = await this.request<{ orderbook: any }>('GET', `/markets/${ticker}/orderbook?depth=${depth}`);
    return data.orderbook;
  }

  /**
   * Get recent trades
   */
  async getTrades(ticker: string, limit: number = 50): Promise<any[]> {
    const data = await this.request<{ trades: any[] }>('GET', `/markets/${ticker}/trades?limit=${limit}`);
    return data.trades || [];
  }

  // ===========================================================================
  // WebSocket
  // ===========================================================================

  /**
   * Create WebSocket connection for real-time updates
   */
  createWebSocket(onMessage: (data: any) => void, onError?: (error: any) => void): WebSocket {
    const ws = new WebSocket(KALSHI_WS_URL);
    
    ws.onopen = () => {
      // Authenticate
      const authMessage = {
        id: 1,
        cmd: 'login',
        params: {
          api_key_id: this.apiKeyId,
        },
      };
      ws.send(JSON.stringify(authMessage));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('[KalshiService] WebSocket parse error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('[KalshiService] WebSocket error:', error);
      onError?.(error);
    };
    
    return ws;
  }

  /**
   * Subscribe to market updates
   */
  subscribeToMarket(ws: WebSocket, ticker: string): void {
    ws.send(JSON.stringify({
      id: Date.now(),
      cmd: 'subscribe',
      params: {
        channels: ['ticker'],
        market_ticker: ticker,
      },
    }));
  }

  /**
   * Subscribe to portfolio updates
   */
  subscribeToPortfolio(ws: WebSocket): void {
    ws.send(JSON.stringify({
      id: Date.now(),
      cmd: 'subscribe',
      params: {
        channels: ['fills', 'orders'],
      },
    }));
  }
}

// =============================================================================
// Singleton Factory
// =============================================================================

let kalshiServiceInstance: KalshiService | null = null;

export function getKalshiService(config?: KalshiAccountConfig): KalshiService | null {
  if (config) {
    kalshiServiceInstance = new KalshiService(config);
  }
  return kalshiServiceInstance;
}

export function clearKalshiService(): void {
  kalshiServiceInstance = null;
}

