"use client";

/**
 * Trading Accounts Provider
 * 
 * Manages connections to Kalshi and Polymarket trading accounts.
 * Provides unified interface for executing trades across venues.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import type {
  TradingVenue,
  AccountStatus,
  ConnectedAccount,
  TradingAccountsState,
  TradingAccountsContextValue,
  KalshiAccountConfig,
  KalshiBalance,
  KalshiPosition,
  KalshiTradeRequest,
  KalshiTradeResponse,
  PolymarketAccountConfig,
  PolymarketBalance,
  PolymarketPosition,
  PolymarketTradeRequest,
  PolymarketTradeResponse,
  ExecuteTradeRequest,
  ExecuteTradeResponse,
  BatchTradeRequest,
  BatchTradeResponse,
  ParlayExecutionRequest,
  ParlayExecutionResponse,
} from '@/types/trading-accounts';

import {
  KalshiService,
  getKalshiService,
  clearKalshiService,
} from '@/lib/trading/kalshi-service';

import {
  PolymarketService,
  getPolymarketService,
  clearPolymarketService,
} from '@/lib/trading/polymarket-service';

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = 'omega:trading-accounts';

const defaultAccount: ConnectedAccount = {
  venue: 'kalshi',
  status: 'disconnected',
};

const defaultState: TradingAccountsState = {
  kalshi: { ...defaultAccount, venue: 'kalshi' },
  polymarket: { ...defaultAccount, venue: 'polymarket' },
  positions: [],
  pendingOrders: [],
};

// =============================================================================
// Context
// =============================================================================

const TradingAccountsContext = createContext<TradingAccountsContextValue | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

export function TradingAccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<TradingAccountsState>(defaultState);
  const [isLoading, setIsLoading] = useState(false);
  
  // Service instances
  const [kalshiService, setKalshiService] = useState<KalshiService | null>(null);
  const [polymarketService, setPolymarketService] = useState<PolymarketService | null>(null);

  // ===========================================================================
  // Persistence
  // ===========================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Don't restore actual connection status, just the account info
        setAccounts(prev => ({
          ...prev,
          kalshi: { ...prev.kalshi, ...parsed.kalshi, status: 'disconnected' },
          polymarket: { ...prev.polymarket, ...parsed.polymarket, status: 'disconnected' },
        }));
      }
    } catch (err) {
      console.error('[TradingAccountsProvider] Failed to load from storage:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Only persist non-sensitive data
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        kalshi: {
          displayName: accounts.kalshi.displayName,
          email: accounts.kalshi.email,
        },
        polymarket: {
          displayName: accounts.polymarket.displayName,
        },
      }));
    } catch (err) {
      console.error('[TradingAccountsProvider] Failed to save to storage:', err);
    }
  }, [accounts]);

  // ===========================================================================
  // Kalshi Account Management
  // ===========================================================================

  const connectKalshi = useCallback(async (config: KalshiAccountConfig): Promise<boolean> => {
    setAccounts(prev => ({
      ...prev,
      kalshi: { ...prev.kalshi, status: 'connecting', error: undefined },
    }));
    
    try {
      const service = new KalshiService(config);
      const loginSuccess = await service.login();
      
      if (!loginSuccess) {
        throw new Error('Failed to authenticate with Kalshi');
      }
      
      // Get account info
      const balance = await service.getBalance();
      
      setKalshiService(service);
      setAccounts(prev => ({
        ...prev,
        kalshi: {
          ...prev.kalshi,
          status: 'connected',
          lastConnected: Date.now(),
          balance: {
            available: balance.available_balance,
            locked: balance.portfolio_value,
            total: balance.available_balance + balance.portfolio_value,
          },
          stats: {
            totalTrades: 0,
            winRate: 0,
            pnl: balance.pnl,
            volume: 0,
          },
        },
      }));
      
      return true;
    } catch (error: any) {
      console.error('[TradingAccountsProvider] Kalshi connect error:', error);
      setAccounts(prev => ({
        ...prev,
        kalshi: { ...prev.kalshi, status: 'error', error: error.message },
      }));
      return false;
    }
  }, []);

  const disconnectKalshi = useCallback(() => {
    clearKalshiService();
    setKalshiService(null);
    setAccounts(prev => ({
      ...prev,
      kalshi: { ...defaultAccount, venue: 'kalshi' },
      positions: prev.positions.filter(p => p.venue !== 'kalshi'),
      pendingOrders: prev.pendingOrders.filter(o => o.venue !== 'kalshi'),
    }));
  }, []);

  const getKalshiBalance = useCallback(async (): Promise<KalshiBalance> => {
    if (!kalshiService) {
      throw new Error('Kalshi not connected');
    }
    return kalshiService.getBalance();
  }, [kalshiService]);

  const getKalshiPositions = useCallback(async (): Promise<KalshiPosition[]> => {
    if (!kalshiService) {
      throw new Error('Kalshi not connected');
    }
    return kalshiService.getPositions();
  }, [kalshiService]);

  const placeKalshiOrder = useCallback(async (request: KalshiTradeRequest): Promise<KalshiTradeResponse> => {
    if (!kalshiService) {
      throw new Error('Kalshi not connected');
    }
    return kalshiService.placeOrder(request);
  }, [kalshiService]);

  const cancelKalshiOrder = useCallback(async (orderId: string): Promise<boolean> => {
    if (!kalshiService) {
      throw new Error('Kalshi not connected');
    }
    return kalshiService.cancelOrder(orderId);
  }, [kalshiService]);

  // ===========================================================================
  // Polymarket Account Management
  // ===========================================================================

  const connectPolymarket = useCallback(async (config: PolymarketAccountConfig): Promise<boolean> => {
    setAccounts(prev => ({
      ...prev,
      polymarket: { ...prev.polymarket, status: 'connecting', error: undefined },
    }));
    
    try {
      const service = new PolymarketService(config);
      await service.deriveApiCredentials();
      
      // Get account info
      const balance = await service.getBalance();
      
      setPolymarketService(service);
      setAccounts(prev => ({
        ...prev,
        polymarket: {
          ...prev.polymarket,
          status: 'connected',
          lastConnected: Date.now(),
          balance: {
            available: balance.usdc,
            locked: balance.positions,
            total: balance.total,
          },
        },
      }));
      
      return true;
    } catch (error: any) {
      console.error('[TradingAccountsProvider] Polymarket connect error:', error);
      setAccounts(prev => ({
        ...prev,
        polymarket: { ...prev.polymarket, status: 'error', error: error.message },
      }));
      return false;
    }
  }, []);

  const disconnectPolymarket = useCallback(() => {
    clearPolymarketService();
    setPolymarketService(null);
    setAccounts(prev => ({
      ...prev,
      polymarket: { ...defaultAccount, venue: 'polymarket' },
      positions: prev.positions.filter(p => p.venue !== 'polymarket'),
      pendingOrders: prev.pendingOrders.filter(o => o.venue !== 'polymarket'),
    }));
  }, []);

  const getPolymarketBalance = useCallback(async (): Promise<PolymarketBalance> => {
    if (!polymarketService) {
      throw new Error('Polymarket not connected');
    }
    return polymarketService.getBalance();
  }, [polymarketService]);

  const getPolymarketPositions = useCallback(async (): Promise<PolymarketPosition[]> => {
    if (!polymarketService) {
      throw new Error('Polymarket not connected');
    }
    return polymarketService.getPositions();
  }, [polymarketService]);

  const placePolymarketOrder = useCallback(async (request: PolymarketTradeRequest): Promise<PolymarketTradeResponse> => {
    if (!polymarketService) {
      throw new Error('Polymarket not connected');
    }
    return polymarketService.placeOrder(request);
  }, [polymarketService]);

  const cancelPolymarketOrder = useCallback(async (orderId: string): Promise<boolean> => {
    if (!polymarketService) {
      throw new Error('Polymarket not connected');
    }
    return polymarketService.cancelOrder(orderId);
  }, [polymarketService]);

  // ===========================================================================
  // Unified Trading Interface
  // ===========================================================================

  const executeTrade = useCallback(async (request: ExecuteTradeRequest): Promise<ExecuteTradeResponse> => {
    try {
      if (request.venue === 'kalshi') {
        if (!kalshiService) {
          return { success: false, status: 'error', error: 'Kalshi not connected' };
        }
        
        const response = await kalshiService.placeOrder({
          ticker: request.marketId,
          action: request.action,
          side: request.side,
          type: request.orderType,
          count: Math.round(request.size),
          price: request.price ? Math.round(request.price * 100) : undefined,
        });
        
        return {
          success: true,
          orderId: response.order_id,
          status: response.status,
          filledSize: response.filled_count,
          averagePrice: response.average_fill_price,
        };
      } else if (request.venue === 'polymarket') {
        if (!polymarketService) {
          return { success: false, status: 'error', error: 'Polymarket not connected' };
        }
        
        const response = await polymarketService.placeOrder({
          tokenID: request.marketId,
          side: request.action === 'buy' ? 'BUY' : 'SELL',
          price: request.price || (request.action === 'buy' ? 0.99 : 0.01),
          size: request.size,
        });
        
        return {
          success: response.success,
          orderId: response.orderID,
          status: response.status,
          error: response.message,
        };
      }
      
      return { success: false, status: 'error', error: 'Invalid venue' };
    } catch (error: any) {
      console.error('[TradingAccountsProvider] Execute trade error:', error);
      return { success: false, status: 'error', error: error.message };
    }
  }, [kalshiService, polymarketService]);

  const executeBatch = useCallback(async (request: BatchTradeRequest): Promise<BatchTradeResponse> => {
    const results: ExecuteTradeResponse[] = [];
    const errors: string[] = [];
    let totalFilled = 0;
    let totalFees = 0;
    
    if (request.sequential) {
      // Execute trades sequentially
      for (const trade of request.trades) {
        const result = await executeTrade(trade);
        results.push(result);
        if (!result.success) {
          errors.push(result.error || 'Unknown error');
        } else {
          totalFilled += result.filledSize || 0;
          totalFees += result.fee || 0;
        }
      }
    } else {
      // Execute trades in parallel
      const promises = request.trades.map(trade => executeTrade(trade));
      const responses = await Promise.all(promises);
      
      for (const result of responses) {
        results.push(result);
        if (!result.success) {
          errors.push(result.error || 'Unknown error');
        } else {
          totalFilled += result.filledSize || 0;
          totalFees += result.fee || 0;
        }
      }
    }
    
    return {
      success: errors.length === 0,
      results,
      totalFilled,
      totalFees,
      errors,
    };
  }, [executeTrade]);

  const executeParlay = useCallback(async (request: ParlayExecutionRequest): Promise<ParlayExecutionResponse> => {
    const executedLegs: ParlayExecutionResponse['executedLegs'] = [];
    const errors: string[] = [];
    let totalCost = 0;
    let fees = 0;
    
    // Group legs by venue for efficient execution
    const kalshiLegs = request.legs.filter(l => l.venue === 'kalshi');
    const polymarketLegs = request.legs.filter(l => l.venue === 'polymarket');
    
    // Execute Kalshi legs
    for (const leg of kalshiLegs) {
      const stakeAmount = request.totalStake * leg.allocation;
      
      const result = await executeTrade({
        venue: 'kalshi',
        marketId: leg.marketId,
        side: leg.side,
        action: 'buy',
        size: stakeAmount,
        orderType: 'market',
      });
      
      if (result.success) {
        executedLegs.push({
          marketId: leg.marketId,
          venue: 'kalshi',
          orderId: result.orderId || '',
          status: result.status,
          filledSize: result.filledSize || 0,
          filledPrice: result.averagePrice || 0,
        });
        totalCost += stakeAmount;
        fees += result.fee || 0;
      } else {
        errors.push(`Kalshi ${leg.marketId}: ${result.error}`);
      }
    }
    
    // Execute Polymarket legs
    for (const leg of polymarketLegs) {
      const stakeAmount = request.totalStake * leg.allocation;
      
      const result = await executeTrade({
        venue: 'polymarket',
        marketId: leg.marketId,
        side: leg.side,
        action: 'buy',
        size: stakeAmount,
        orderType: 'market',
      });
      
      if (result.success) {
        executedLegs.push({
          marketId: leg.marketId,
          venue: 'polymarket',
          orderId: result.orderId || '',
          status: result.status,
          filledSize: result.filledSize || 0,
          filledPrice: result.averagePrice || 0,
        });
        totalCost += stakeAmount;
        fees += result.fee || 0;
      } else {
        errors.push(`Polymarket ${leg.marketId}: ${result.error}`);
      }
    }
    
    return {
      success: errors.length === 0,
      parlayId: request.parlayId,
      executedLegs,
      totalCost,
      fees,
      errors,
    };
  }, [executeTrade]);

  // ===========================================================================
  // Sync Functions
  // ===========================================================================

  const refreshAccounts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Refresh Kalshi
      if (kalshiService && accounts.kalshi.status === 'connected') {
        const balance = await kalshiService.getBalance();
        setAccounts(prev => ({
          ...prev,
          kalshi: {
            ...prev.kalshi,
            balance: {
              available: balance.available_balance,
              locked: balance.portfolio_value,
              total: balance.available_balance + balance.portfolio_value,
            },
            stats: {
              ...prev.kalshi.stats!,
              pnl: balance.pnl,
            },
          },
        }));
      }
      
      // Refresh Polymarket
      if (polymarketService && accounts.polymarket.status === 'connected') {
        const balance = await polymarketService.getBalance();
        setAccounts(prev => ({
          ...prev,
          polymarket: {
            ...prev.polymarket,
            balance: {
              available: balance.usdc,
              locked: balance.positions,
              total: balance.total,
            },
          },
        }));
      }
    } catch (error) {
      console.error('[TradingAccountsProvider] Refresh accounts error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [kalshiService, polymarketService, accounts.kalshi.status, accounts.polymarket.status]);

  const refreshPositions = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const positions: TradingAccountsState['positions'] = [];
      
      // Get Kalshi positions
      if (kalshiService && accounts.kalshi.status === 'connected') {
        const kalshiPositions = await kalshiService.getPositions();
        for (const pos of kalshiPositions) {
          positions.push({
            venue: 'kalshi',
            marketId: pos.ticker,
            side: pos.side,
            size: pos.quantity,
            entryPrice: pos.average_price,
            currentPrice: pos.average_price, // Would need current market price
            pnl: pos.pnl,
          });
        }
      }
      
      // Get Polymarket positions
      if (polymarketService && accounts.polymarket.status === 'connected') {
        const polyPositions = await polymarketService.getPositions();
        for (const pos of polyPositions) {
          positions.push({
            venue: 'polymarket',
            marketId: pos.asset_id,
            side: pos.outcome === 'YES' ? 'yes' : 'no',
            size: pos.size,
            entryPrice: pos.average_price,
            currentPrice: pos.current_price,
            pnl: pos.pnl,
          });
        }
      }
      
      setAccounts(prev => ({ ...prev, positions }));
    } catch (error) {
      console.error('[TradingAccountsProvider] Refresh positions error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [kalshiService, polymarketService, accounts.kalshi.status, accounts.polymarket.status]);

  // ===========================================================================
  // Context Value
  // ===========================================================================

  const value: TradingAccountsContextValue = useMemo(
    () => ({
      accounts,
      isLoading,
      
      // Kalshi
      connectKalshi,
      disconnectKalshi,
      getKalshiBalance,
      getKalshiPositions,
      placeKalshiOrder,
      cancelKalshiOrder,
      
      // Polymarket
      connectPolymarket,
      disconnectPolymarket,
      getPolymarketBalance,
      getPolymarketPositions,
      placePolymarketOrder,
      cancelPolymarketOrder,
      
      // Unified
      executeTrade,
      executeBatch,
      executeParlay,
      
      // Sync
      refreshAccounts,
      refreshPositions,
    }),
    [
      accounts,
      isLoading,
      connectKalshi,
      disconnectKalshi,
      getKalshiBalance,
      getKalshiPositions,
      placeKalshiOrder,
      cancelKalshiOrder,
      connectPolymarket,
      disconnectPolymarket,
      getPolymarketBalance,
      getPolymarketPositions,
      placePolymarketOrder,
      cancelPolymarketOrder,
      executeTrade,
      executeBatch,
      executeParlay,
      refreshAccounts,
      refreshPositions,
    ]
  );

  return (
    <TradingAccountsContext.Provider value={value}>
      {children}
    </TradingAccountsContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useTradingAccounts(): TradingAccountsContextValue {
  const context = useContext(TradingAccountsContext);
  if (!context) {
    throw new Error('useTradingAccounts must be used within a TradingAccountsProvider');
  }
  return context;
}

