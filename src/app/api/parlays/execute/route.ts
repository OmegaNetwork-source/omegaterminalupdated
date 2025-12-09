/**
 * Parlay Execution API
 * 
 * Executes parlay trades across Kalshi and Polymarket.
 * Handles leverage, risk management, and trade confirmations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { KalshiService } from '@/lib/trading/kalshi-service';
import { PolymarketService } from '@/lib/trading/polymarket-service';

export const dynamic = 'force-dynamic';

interface ParlayLegExecution {
  marketId: string;
  venue: 'kalshi' | 'polymarket';
  side: 'yes' | 'no';
  allocation: number; // 0-1, percentage of stake
  question: string;
  entryOdds: number;
}

interface ExecuteParlayRequest {
  parlayName: string;
  totalStake: number;
  leverage: 1 | 2 | 3 | 4 | 5;
  legs: ParlayLegExecution[];
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
  // Smart contract integration
  useSmartContract?: boolean;
  contractAddress?: string;
  walletAddress?: string;
}

interface LegExecutionResult {
  marketId: string;
  venue: 'kalshi' | 'polymarket';
  success: boolean;
  orderId?: string;
  filledSize?: number;
  filledPrice?: number;
  error?: string;
  fee?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteParlayRequest = await request.json();
    
    // Validate request
    if (!body.parlayName || !body.totalStake || !body.legs || body.legs.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid parlay configuration' },
        { status: 400 }
      );
    }
    
    if (body.leverage < 1 || body.leverage > 5) {
      return NextResponse.json(
        { success: false, error: 'Leverage must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Group legs by venue
    const kalshiLegs = body.legs.filter(l => l.venue === 'kalshi');
    const polymarketLegs = body.legs.filter(l => l.venue === 'polymarket');
    
    // Check credentials
    if (kalshiLegs.length > 0 && !body.credentials?.kalshi) {
      return NextResponse.json(
        { success: false, error: 'Kalshi credentials required for Kalshi markets' },
        { status: 400 }
      );
    }
    
    if (polymarketLegs.length > 0 && !body.credentials?.polymarket) {
      return NextResponse.json(
        { success: false, error: 'Polymarket credentials required for Polymarket markets' },
        { status: 400 }
      );
    }
    
    // Calculate leveraged stake
    const leveragedStake = body.totalStake * body.leverage;
    
    // Execute trades
    const results: LegExecutionResult[] = [];
    let totalCost = 0;
    let totalFees = 0;
    const errors: string[] = [];
    
    // Initialize services
    let kalshiService: KalshiService | null = null;
    let polymarketService: PolymarketService | null = null;
    
    if (kalshiLegs.length > 0 && body.credentials?.kalshi) {
      kalshiService = new KalshiService(body.credentials.kalshi);
      try {
        await kalshiService.login();
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Kalshi authentication failed: ${err.message}` },
          { status: 401 }
        );
      }
    }
    
    if (polymarketLegs.length > 0 && body.credentials?.polymarket) {
      polymarketService = new PolymarketService(body.credentials.polymarket);
    }
    
    // Execute Kalshi legs
    for (const leg of kalshiLegs) {
      const stakeAmount = leveragedStake * leg.allocation;
      const contractCount = Math.round(stakeAmount / (leg.entryOdds * 100)); // Convert to contract count
      
      try {
        const response = await kalshiService!.placeOrder({
          ticker: leg.marketId,
          action: 'buy',
          side: leg.side,
          type: 'market',
          count: contractCount,
        });
        
        results.push({
          marketId: leg.marketId,
          venue: 'kalshi',
          success: true,
          orderId: response.order_id,
          filledSize: response.filled_count,
          filledPrice: response.average_fill_price,
        });
        
        totalCost += (response.filled_count || contractCount) * (response.average_fill_price || leg.entryOdds);
      } catch (err: any) {
        results.push({
          marketId: leg.marketId,
          venue: 'kalshi',
          success: false,
          error: err.message,
        });
        errors.push(`Kalshi ${leg.marketId}: ${err.message}`);
      }
    }
    
    // Execute Polymarket legs
    for (const leg of polymarketLegs) {
      const stakeAmount = leveragedStake * leg.allocation;
      const shareSize = stakeAmount / leg.entryOdds; // Convert to share size
      
      try {
        const response = await polymarketService!.placeOrder({
          tokenID: leg.marketId,
          side: 'BUY',
          price: leg.entryOdds,
          size: shareSize,
        });
        
        if (response.success) {
          results.push({
            marketId: leg.marketId,
            venue: 'polymarket',
            success: true,
            orderId: response.orderID,
          });
          totalCost += stakeAmount;
        } else {
          results.push({
            marketId: leg.marketId,
            venue: 'polymarket',
            success: false,
            error: response.message,
          });
          errors.push(`Polymarket ${leg.marketId}: ${response.message}`);
        }
      } catch (err: any) {
        results.push({
          marketId: leg.marketId,
          venue: 'polymarket',
          success: false,
          error: err.message,
        });
        errors.push(`Polymarket ${leg.marketId}: ${err.message}`);
      }
    }
    
    // Calculate combined odds and potential payout
    let combinedOdds = 1;
    for (const leg of body.legs) {
      combinedOdds *= 1 / leg.entryOdds;
    }
    
    const potentialPayout = leveragedStake * combinedOdds;
    const successfulLegs = results.filter(r => r.success).length;
    
    // Create parlay record
    const parlayId = `parlay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    return NextResponse.json({
      success: errors.length === 0,
      parlayId,
      parlayName: body.parlayName,
      totalStake: body.totalStake,
      leverage: body.leverage,
      leveragedStake,
      combinedOdds: combinedOdds.toFixed(4),
      potentialPayout: potentialPayout.toFixed(2),
      executedLegs: results,
      successfulLegs,
      totalLegs: body.legs.length,
      totalCost: totalCost.toFixed(2),
      totalFees: totalFees.toFixed(2),
      errors,
      timestamp: Date.now(),
      status: errors.length === 0 ? 'active' : 'partial',
    });
    
  } catch (error: any) {
    console.error('[Parlay Execute API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Parlay execution failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to check execution status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parlayId = searchParams.get('parlayId');
  
  if (!parlayId) {
    return NextResponse.json(
      { error: 'parlayId required' },
      { status: 400 }
    );
  }
  
  // In production, this would check database for parlay status
  return NextResponse.json({
    parlayId,
    status: 'active',
    message: 'Parlay status endpoint - database integration pending',
  });
}

