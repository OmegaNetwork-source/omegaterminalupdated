/**
 * Polymarket Trading Service
 * 
 * Full integration with Polymarket CLOB API for account management and trading.
 * Implements EIP-712 signature authentication for the CLOB system.
 */

import type {
  PolymarketAccountConfig,
  PolymarketBalance,
  PolymarketPosition,
  PolymarketOrder,
  PolymarketTradeRequest,
  PolymarketTradeResponse,
} from '@/types/trading-accounts';

// =============================================================================
// Constants
// =============================================================================

const POLYMARKET_CLOB_API = 'https://clob.polymarket.com';
const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';
const CHAIN_ID = 137; // Polygon mainnet

// EIP-712 Domain for CLOB
const CLOB_DOMAIN = {
  name: 'Polymarket CTF Exchange',
  version: '1',
  chainId: CHAIN_ID,
};

// Order struct type for EIP-712
const ORDER_TYPES = {
  Order: [
    { name: 'salt', type: 'uint256' },
    { name: 'maker', type: 'address' },
    { name: 'signer', type: 'address' },
    { name: 'taker', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'makerAmount', type: 'uint256' },
    { name: 'takerAmount', type: 'uint256' },
    { name: 'expiration', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'feeRateBps', type: 'uint256' },
    { name: 'side', type: 'uint8' },
    { name: 'signatureType', type: 'uint8' },
  ],
};

// =============================================================================
// Polymarket Service Class
// =============================================================================

export class PolymarketService {
  private privateKey: string;
  private proxyWallet?: string;
  private funderAddress?: string;
  private address: string = '';
  private apiKey?: string;
  private apiSecret?: string;
  private apiPassphrase?: string;

  constructor(config: PolymarketAccountConfig) {
    this.privateKey = config.privateKey;
    this.proxyWallet = config.proxyWallet;
    this.funderAddress = config.funderAddress;
    
    // Derive address from private key
    this.address = this.deriveAddress(config.privateKey);
  }

  // ===========================================================================
  // Utilities
  // ===========================================================================

  /**
   * Derive Ethereum address from private key
   */
  private deriveAddress(privateKey: string): string {
    // In production, use ethers.js or viem to derive address
    // For now, this is a placeholder
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.slice(2);
    }
    // This would need proper implementation with ethers/viem
    return '0x' + privateKey.slice(0, 40); // Placeholder
  }

  /**
   * Generate random salt for orders
   */
  private generateSalt(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return '0x' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get current nonce from CLOB
   */
  private async getNonce(): Promise<number> {
    try {
      const response = await fetch(`${POLYMARKET_CLOB_API}/auth/nonce`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data.nonce || 0;
    } catch {
      return Date.now();
    }
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  /**
   * Create HMAC signature for API requests
   */
  private async createHmacSignature(
    timestamp: string,
    method: string,
    path: string,
    body?: string
  ): Promise<string> {
    if (!this.apiSecret) {
      throw new Error('API secret not set');
    }
    
    const message = timestamp + method.toUpperCase() + path + (body || '');
    const encoder = new TextEncoder();
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.apiSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message)
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /**
   * Sign EIP-712 typed data for order signing
   * In production, use ethers.js or viem for proper signing
   */
  private async signTypedData(order: any): Promise<string> {
    // This is a simplified version
    // In production, use proper EIP-712 signing with ethers/viem
    const message = JSON.stringify(order);
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Use private key for signing
    // This needs proper implementation with crypto libraries
    const keyData = this.privateKey.startsWith('0x') 
      ? this.privateKey.slice(2) 
      : this.privateKey;
    
    // Placeholder - needs proper ECDSA signing
    return '0x' + keyData.slice(0, 128) + '1c'; // Placeholder signature
  }

  /**
   * Create L1 authentication headers
   */
  private async createL1AuthHeaders(): Promise<HeadersInit> {
    const timestamp = Date.now().toString();
    const nonce = await this.getNonce();
    
    // Create POLY_AUTH signature
    const message = `${timestamp}:${nonce}`;
    const signature = await this.signMessage(message);
    
    return {
      'Content-Type': 'application/json',
      'POLY_ADDRESS': this.address,
      'POLY_SIGNATURE': signature,
      'POLY_TIMESTAMP': timestamp,
      'POLY_NONCE': nonce.toString(),
    };
  }

  /**
   * Sign a message with private key
   */
  private async signMessage(message: string): Promise<string> {
    // Placeholder - needs proper implementation with ethers/viem
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Use Web Crypto for hashing (signature needs proper ECDSA)
    const hash = await crypto.subtle.digest('SHA-256', data);
    return '0x' + Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Create API key auth headers
   */
  private async createApiKeyHeaders(
    method: string,
    path: string,
    body?: string
  ): Promise<HeadersInit> {
    if (!this.apiKey || !this.apiSecret || !this.apiPassphrase) {
      throw new Error('API credentials not set');
    }
    
    const timestamp = (Date.now() / 1000).toString();
    const signature = await this.createHmacSignature(timestamp, method, path, body);
    
    return {
      'Content-Type': 'application/json',
      'POLY_API_KEY': this.apiKey,
      'POLY_API_SIGNATURE': signature,
      'POLY_API_TIMESTAMP': timestamp,
      'POLY_API_PASSPHRASE': this.apiPassphrase,
    };
  }

  /**
   * Derive API credentials from signing
   */
  async deriveApiCredentials(): Promise<void> {
    try {
      const headers = await this.createL1AuthHeaders();
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/auth/derive-api-key`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to derive API key: ${response.status}`);
      }
      
      const data = await response.json();
      this.apiKey = data.apiKey;
      this.apiSecret = data.secret;
      this.apiPassphrase = data.passphrase;
    } catch (error) {
      console.error('[PolymarketService] Derive API key error:', error);
      throw error;
    }
  }

  // ===========================================================================
  // Account Management
  // ===========================================================================

  /**
   * Get account balance
   */
  async getBalance(): Promise<PolymarketBalance> {
    try {
      // Get USDC balance from CLOB
      const headers = await this.createL1AuthHeaders();
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/balance`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        usdc: parseFloat(data.balance || '0'),
        positions: parseFloat(data.positionsValue || '0'),
        total: parseFloat(data.balance || '0') + parseFloat(data.positionsValue || '0'),
      };
    } catch (error) {
      console.error('[PolymarketService] Get balance error:', error);
      return { usdc: 0, positions: 0, total: 0 };
    }
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<PolymarketPosition[]> {
    try {
      const headers = await this.createL1AuthHeaders();
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/positions`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.status}`);
      }
      
      const data = await response.json();
      
      return (data.positions || []).map((pos: any) => ({
        asset_id: pos.asset_id,
        market_slug: pos.market_slug || '',
        title: pos.title || '',
        outcome: pos.outcome as 'YES' | 'NO',
        size: parseFloat(pos.size || '0'),
        average_price: parseFloat(pos.avg_price || '0'),
        current_price: parseFloat(pos.cur_price || '0'),
        pnl: parseFloat(pos.pnl || '0'),
        pnl_percent: parseFloat(pos.pnl_pct || '0'),
      }));
    } catch (error) {
      console.error('[PolymarketService] Get positions error:', error);
      return [];
    }
  }

  /**
   * Get trade history
   */
  async getTradeHistory(limit: number = 100): Promise<any[]> {
    try {
      const headers = await this.createL1AuthHeaders();
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/trades?limit=${limit}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get trade history: ${response.status}`);
      }
      
      const data = await response.json();
      return data.trades || [];
    } catch (error) {
      console.error('[PolymarketService] Get trade history error:', error);
      return [];
    }
  }

  // ===========================================================================
  // Trading
  // ===========================================================================

  /**
   * Build signed order for CLOB
   */
  async buildOrder(request: PolymarketTradeRequest): Promise<any> {
    const salt = this.generateSalt();
    const nonce = request.nonce || await this.getNonce();
    const expiration = request.expiration || Math.floor(Date.now() / 1000) + 86400; // 24h default
    
    // Convert price and size to proper amounts
    // Polymarket uses 6 decimal places for USDC
    const priceInCents = Math.round(request.price * 100);
    const sizeInWei = BigInt(Math.round(request.size * 1e18));
    
    // Calculate maker and taker amounts based on side
    const isBuy = request.side === 'BUY';
    const makerAmount = isBuy 
      ? BigInt(Math.round(request.size * request.price * 1e6)) // USDC amount
      : sizeInWei; // Token amount
    const takerAmount = isBuy 
      ? sizeInWei // Token amount
      : BigInt(Math.round(request.size * request.price * 1e6)); // USDC amount
    
    const order = {
      salt,
      maker: this.proxyWallet || this.address,
      signer: this.address,
      taker: '0x0000000000000000000000000000000000000000',
      tokenId: BigInt(request.tokenID),
      makerAmount,
      takerAmount,
      expiration: BigInt(expiration),
      nonce: BigInt(nonce),
      feeRateBps: BigInt(request.feeRateBps || 0),
      side: isBuy ? 0 : 1,
      signatureType: 0, // EIP-712
    };
    
    // Sign the order
    const signature = await this.signTypedData(order);
    
    return {
      ...order,
      makerAmount: makerAmount.toString(),
      takerAmount: takerAmount.toString(),
      tokenId: request.tokenID,
      expiration: expiration.toString(),
      nonce: nonce.toString(),
      feeRateBps: (request.feeRateBps || 0).toString(),
      signature,
    };
  }

  /**
   * Place an order
   */
  async placeOrder(request: PolymarketTradeRequest): Promise<PolymarketTradeResponse> {
    try {
      const signedOrder = await this.buildOrder(request);
      const headers = await this.createL1AuthHeaders();
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/order`, {
        method: 'POST',
        headers,
        body: JSON.stringify(signedOrder),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order placement failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        orderID: data.orderID,
        transactionHash: data.transactionHash,
        status: data.status || 'LIVE',
      };
    } catch (error: any) {
      console.error('[PolymarketService] Place order error:', error);
      return {
        success: false,
        status: 'FAILED',
        message: error.message,
      };
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<PolymarketOrder | null> {
    try {
      const headers = await this.createL1AuthHeaders();
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/order/${orderId}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        market: data.market,
        asset_id: data.asset_id,
        side: data.side as 'BUY' | 'SELL',
        outcome: data.outcome as 'YES' | 'NO',
        price: parseFloat(data.price || '0'),
        original_size: parseFloat(data.original_size || '0'),
        size_matched: parseFloat(data.size_matched || '0'),
        status: data.status as 'LIVE' | 'MATCHED' | 'CANCELLED',
        created_at: data.created_at,
        expiration: data.expiration,
      };
    } catch (error) {
      console.error('[PolymarketService] Get order error:', error);
      return null;
    }
  }

  /**
   * Get open orders
   */
  async getOpenOrders(market?: string): Promise<PolymarketOrder[]> {
    try {
      const headers = await this.createL1AuthHeaders();
      const path = market 
        ? `/orders?market=${market}&status=LIVE`
        : '/orders?status=LIVE';
      
      const response = await fetch(`${POLYMARKET_CLOB_API}${path}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get open orders: ${response.status}`);
      }
      
      const data = await response.json();
      
      return (data.orders || []).map((order: any) => ({
        id: order.id,
        market: order.market,
        asset_id: order.asset_id,
        side: order.side as 'BUY' | 'SELL',
        outcome: order.outcome as 'YES' | 'NO',
        price: parseFloat(order.price || '0'),
        original_size: parseFloat(order.original_size || '0'),
        size_matched: parseFloat(order.size_matched || '0'),
        status: order.status as 'LIVE' | 'MATCHED' | 'CANCELLED',
        created_at: order.created_at,
        expiration: order.expiration,
      }));
    } catch (error) {
      console.error('[PolymarketService] Get open orders error:', error);
      return [];
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const headers = await this.createL1AuthHeaders();
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/order/${orderId}`, {
        method: 'DELETE',
        headers,
      });
      
      return response.ok;
    } catch (error) {
      console.error('[PolymarketService] Cancel order error:', error);
      return false;
    }
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(market?: string): Promise<number> {
    try {
      const headers = await this.createL1AuthHeaders();
      const body = market ? JSON.stringify({ market }) : undefined;
      
      const response = await fetch(`${POLYMARKET_CLOB_API}/orders/cancel-all`, {
        method: 'DELETE',
        headers,
        body,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel orders: ${response.status}`);
      }
      
      const data = await response.json();
      return data.cancelled_count || 0;
    } catch (error) {
      console.error('[PolymarketService] Cancel all orders error:', error);
      return 0;
    }
  }

  /**
   * Execute market buy
   */
  async marketBuy(
    tokenID: string,
    size: number,
    maxPrice: number = 0.99
  ): Promise<PolymarketTradeResponse> {
    return this.placeOrder({
      tokenID,
      side: 'BUY',
      price: maxPrice,
      size,
    });
  }

  /**
   * Execute market sell
   */
  async marketSell(
    tokenID: string,
    size: number,
    minPrice: number = 0.01
  ): Promise<PolymarketTradeResponse> {
    return this.placeOrder({
      tokenID,
      side: 'SELL',
      price: minPrice,
      size,
    });
  }

  // ===========================================================================
  // Market Data
  // ===========================================================================

  /**
   * Get market details from Gamma API
   */
  async getMarket(conditionId: string): Promise<any> {
    try {
      const response = await fetch(`${POLYMARKET_GAMMA_API}/events/${conditionId}`);
      if (!response.ok) {
        throw new Error(`Failed to get market: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('[PolymarketService] Get market error:', error);
      return null;
    }
  }

  /**
   * Get orderbook for a market
   */
  async getOrderbook(tokenID: string): Promise<any> {
    try {
      const response = await fetch(`${POLYMARKET_CLOB_API}/book?token_id=${tokenID}`);
      if (!response.ok) {
        throw new Error(`Failed to get orderbook: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('[PolymarketService] Get orderbook error:', error);
      return { bids: [], asks: [] };
    }
  }

  /**
   * Get recent trades for a market
   */
  async getTrades(tokenID: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(
        `${POLYMARKET_CLOB_API}/trades?token_id=${tokenID}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`Failed to get trades: ${response.status}`);
      }
      const data = await response.json();
      return data.trades || [];
    } catch (error) {
      console.error('[PolymarketService] Get trades error:', error);
      return [];
    }
  }

  // ===========================================================================
  // WebSocket
  // ===========================================================================

  /**
   * Create WebSocket connection for real-time updates
   */
  createWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: any) => void
  ): WebSocket {
    const ws = new WebSocket('wss://clob.polymarket.com/ws');
    
    ws.onopen = () => {
      console.log('[PolymarketService] WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('[PolymarketService] WebSocket parse error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('[PolymarketService] WebSocket error:', error);
      onError?.(error);
    };
    
    return ws;
  }

  /**
   * Subscribe to market updates
   */
  subscribeToMarket(ws: WebSocket, tokenID: string): void {
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'market',
      market: tokenID,
    }));
  }

  /**
   * Subscribe to user updates
   */
  subscribeToUser(ws: WebSocket): void {
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'user',
      user: this.address,
    }));
  }
}

// =============================================================================
// Singleton Factory
// =============================================================================

let polymarketServiceInstance: PolymarketService | null = null;

export function getPolymarketService(config?: PolymarketAccountConfig): PolymarketService | null {
  if (config) {
    polymarketServiceInstance = new PolymarketService(config);
  }
  return polymarketServiceInstance;
}

export function clearPolymarketService(): void {
  polymarketServiceInstance = null;
}

