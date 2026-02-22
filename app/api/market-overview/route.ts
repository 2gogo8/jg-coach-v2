import { NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/fmp';

export const maxDuration = 10;
export const revalidate = 300; // Cache for 5 minutes

/**
 * GET /api/market-overview
 * Returns major market indices (S&P 500, Nasdaq, Dow)
 */
export async function GET() {
  try {
    const [spx, qqq, dia] = await Promise.all([
      getStockQuote('SPY'),  // S&P 500 ETF
      getStockQuote('QQQ'),  // Nasdaq ETF
      getStockQuote('DIA'),  // Dow ETF
    ]);

    const indices = [
      { name: 'S&P 500', symbol: 'SPY', data: spx },
      { name: 'Nasdaq', symbol: 'QQQ', data: qqq },
      { name: 'Dow', symbol: 'DIA', data: dia },
    ].filter(idx => idx.data !== null);

    return NextResponse.json({
      indices: indices.map(idx => {
        const data = idx.data!;
        // Calculate changesPercentage if FMP doesn't provide it
        let pctChange = data.changesPercentage;
        if (pctChange === null || pctChange === undefined) {
          pctChange = data.previousClose > 0 
            ? (data.change / data.previousClose) * 100 
            : 0;
        }
        
        return {
          name: idx.name,
          symbol: idx.symbol,
          price: data.price,
          change: data.change,
          changesPercentage: pctChange,
        };
      }),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Market overview error:', error);
    return NextResponse.json({ error: '無法獲取市場數據' }, { status: 500 });
  }
}
