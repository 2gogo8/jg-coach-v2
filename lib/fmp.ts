// FMP (Financial Modeling Prep) API Integration
// ⛔ ONLY use /stable/ endpoints! /api/v3/ and /api/v4/ deprecated since 2025/8/31

const FMP_KEY = process.env.FMP_API_KEY || '';
const FMP_BASE = 'https://financialmodelingprep.com/stable';

export interface StockQuote {
  symbol: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  name: string;
}

/**
 * Get real-time stock quote
 * Endpoint: /stable/quote?symbol=AAPL
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const url = `${FMP_BASE}/quote?symbol=${symbol}&apikey=${FMP_KEY}`;
    const res = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60s
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

/**
 * Validate if a stock symbol exists
 */
export async function validateSymbol(symbol: string): Promise<boolean> {
  const quote = await getStockQuote(symbol);
  return quote !== null;
}

/**
 * Get current price for a symbol (quick lookup)
 */
export async function getCurrentPrice(symbol: string): Promise<number | null> {
  const quote = await getStockQuote(symbol);
  return quote?.price || null;
}
