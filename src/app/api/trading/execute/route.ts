/**
 * Trade Execution API
 * 
 * Executes trades on Kalshi and Polymarket through the backend.
 * Provides unified interface for all trading operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { KalshiService } from '@/lib/trading/kalshi-service';
import { PolymarketService } from '@/lib/trading/polymarket-service';

export const dynamic = 'force-dynamic';

// In production, these would come from user's encrypted credentials
interface TradeExecutionRequest {
  venue: 'kalshi' | 'polymarket';
  marketId: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  size: number;
  price?: number;
  orderType: 'market' | 'limit';
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
    const body: TradeExecutionRequest = await request.json();
    
    // Validate request
    if (!body.venue || !body.marketId || !body.side || !body.action || !body.size) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (body.venue === 'kalshi') {
      if (!body.credentials?.kalshi) {
        return NextResponse.json(
          { success: false, error: 'Kalshi credentials required' },
          { status: 400 }
        );
      }
      
      const service = new KalshiService(body.credentials.kalshi);
      const loginSuccess = await service.login();
      
      if (!loginSuccess) {
        return NextResponse.json(
          { success: false, error: 'Kalshi authentication failed' },
          { status: 401 }
        );
      }
      
      const response = await service.placeOrder({
        ticker: body.marketId,
        action: body.action,
        side: body.side,
        type: body.orderType,
        count: Math.round(body.size),
        price: body.price ? Math.round(body.price * 100) : undefined,
      });
      
      return NextResponse.json({
        success: true,
        orderId: response.order_id,
        status: response.status,
        filledCount: response.filled_count,
        remainingCount: response.remaining_count,
        averageFillPrice: response.average_fill_price,
        venue: 'kalshi',
      });
      
    } else if (body.venue === 'polymarket') {
      if (!body.credentials?.polymarket) {
        return NextResponse.json(
          { success: false, error: 'Polymarket credentials required' },
          { status: 400 }
        );
      }
      
      const service = new PolymarketService(body.credentials.polymarket);
      
      const response = await service.placeOrder({
        tokenID: body.marketId,
        side: body.action === 'buy' ? 'BUY' : 'SELL',
        price: body.price || (body.action === 'buy' ? 0.99 : 0.01),
        size: body.size,
      });
      
      return NextResponse.json({
        success: response.success,
        orderId: response.orderID,
        transactionHash: response.transactionHash,
        status: response.status,
        error: response.message,
        venue: 'polymarket',
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid venue' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('[Trade Execute API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Trade execution failed' },
      { status: 500 }
    );
  }
}

