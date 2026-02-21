import { NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/fmp';

export const maxDuration = 10;

/**
 * GET /api/stock-price?symbol=AAPL
 * Returns current price and validation
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: '需要 symbol 參數' }, { status: 400 });
  }

  const quote = await getStockQuote(symbol);

  if (!quote) {
    return NextResponse.json({ 
      valid: false, 
      symbol,
      message: '找不到此股票代號' 
    });
  }

  return NextResponse.json({
    valid: true,
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    change: quote.change,
    changesPercentage: quote.changesPercentage,
  });
}
