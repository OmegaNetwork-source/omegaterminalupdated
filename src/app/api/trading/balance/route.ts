/**
 * Balance API
 * 
 * Fetches account balances from Kalshi and Polymarket.
 */

import { NextRequest, NextResponse } from 'next/server';
import { KalshiService } from '@/lib/trading/kalshi-service';
import { PolymarketService } from '@/lib/trading/polymarket-service';

export const dynamic = 'force-dynamic';

interface BalanceRequest {
  venue: 'kalshi' | 'polymarket' | 'all';
  credentials: {
    kalshi?: {
      apiKeyId: string;
      privateKey: string;
    };
    polymarket?: {
      privateKey: string;
      proxyWallet?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BalanceRequest = await request.json();
    
    const balances: any = {};
    
    // Fetch Kalshi balance
    if ((body.venue === 'kalshi' || body.venue === 'all') && body.credentials?.kalshi) {
      try {
        const service = new KalshiService(body.credentials.kalshi);
        await service.login();
        const balance = await service.getBalance();
        
        balances.kalshi = {
          available: balance.available_balance,
          portfolioValue: balance.portfolio_value,
          pnl: balance.pnl,
          totalDeposits: balance.total_deposits,
          totalWithdrawals: balance.total_withdrawals,
          total: balance.available_balance + balance.portfolio_value,
        };
      } catch (error: any) {
        balances.kalshi = { error: error.message };
      }
    }
    
    // Fetch Polymarket balance
    if ((body.venue === 'polymarket' || body.venue === 'all') && body.credentials?.polymarket) {
      try {
        const service = new PolymarketService(body.credentials.polymarket);
        const balance = await service.getBalance();
        
        balances.polymarket = {
          usdc: balance.usdc,
          positions: balance.positions,
          total: balance.total,
        };
      } catch (error: any) {
        balances.polymarket = { error: error.message };
      }
    }
    
    return NextResponse.json({
      success: true,
      balances,
      timestamp: Date.now(),
    });
    
  } catch (error: any) {
    console.error('[Balance API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}

