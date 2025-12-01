/**
 * Positions API
 * 
 * Fetches open positions from Kalshi and Polymarket.
 */

import { NextRequest, NextResponse } from 'next/server';
import { KalshiService } from '@/lib/trading/kalshi-service';
import { PolymarketService } from '@/lib/trading/polymarket-service';

export const dynamic = 'force-dynamic';

interface PositionsRequest {
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
    const body: PositionsRequest = await request.json();
    
    const positions: any[] = [];
    
    // Fetch Kalshi positions
    if ((body.venue === 'kalshi' || body.venue === 'all') && body.credentials?.kalshi) {
      try {
        const service = new KalshiService(body.credentials.kalshi);
        await service.login();
        const kalshiPositions = await service.getPositions();
        
        for (const pos of kalshiPositions) {
          positions.push({
            venue: 'kalshi',
            marketId: pos.ticker,
            eventTicker: pos.event_ticker,
            side: pos.side,
            quantity: pos.quantity,
            averagePrice: pos.average_price,
            totalCost: pos.total_cost,
            pnl: pos.pnl,
            realizedPnl: pos.realized_pnl,
            unrealizedPnl: pos.unrealized_pnl,
            feesPaid: pos.fees_paid,
          });
        }
      } catch (error: any) {
        console.error('[Positions API] Kalshi error:', error);
      }
    }
    
    // Fetch Polymarket positions
    if ((body.venue === 'polymarket' || body.venue === 'all') && body.credentials?.polymarket) {
      try {
        const service = new PolymarketService(body.credentials.polymarket);
        const polyPositions = await service.getPositions();
        
        for (const pos of polyPositions) {
          positions.push({
            venue: 'polymarket',
            marketId: pos.asset_id,
            marketSlug: pos.market_slug,
            title: pos.title,
            side: pos.outcome === 'YES' ? 'yes' : 'no',
            size: pos.size,
            averagePrice: pos.average_price,
            currentPrice: pos.current_price,
            pnl: pos.pnl,
            pnlPercent: pos.pnl_percent,
          });
        }
      } catch (error: any) {
        console.error('[Positions API] Polymarket error:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      positions,
      total: positions.length,
      timestamp: Date.now(),
    });
    
  } catch (error: any) {
    console.error('[Positions API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

