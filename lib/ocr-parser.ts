// OCR text parser for trade screenshots
// Handles Taiwan brokers (富邦, 群益, 永豐) and US brokers

export interface ParsedTrade {
  symbol: string;
  action: 'buy' | 'sell' | '';
  price: string;
  shares: string;
  date: string;
  market: 'TW' | 'US' | '';
  confidence: number;
}

export interface OcrParseResult {
  trades: ParsedTrade[];
  rawText: string;
}

const ACTION_BUY = /買進|買入|買|BUY|BOUGHT/i;
const ACTION_SELL = /賣出|賣|SELL|SOLD/i;
const TW_STOCK_CODE = /\b(\d{4})\b/g;
const US_TICKER = /\b([A-Z]{1,5})\b/g;
const PRICE_PATTERN = /(\d+[.,]\d{1,4})/g;
const SHARES_PATTERN = /(\d{1,})\s*(?:股|shares?|qty|張)/i;
const SHARES_NUMBER = /(?:股數|數量|Qty|Shares?)[:\s]*(\d+)/i;
const DATE_FULL = /(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/;
const DATE_SHORT = /(\d{1,2})[/\-.](\d{1,2})/;

// Common words to exclude from US ticker detection
const TICKER_EXCLUDE = new Set([
  'THE', 'AND', 'FOR', 'BUY', 'SELL', 'QTY', 'USD', 'TWD', 'MKT', 'LMT',
  'DAY', 'GTC', 'IOC', 'FOK', 'ROD', 'OCR', 'API', 'GMT', 'EST', 'PST',
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'JAN', 'FEB', 'MAR',
  'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  'BOUGHT', 'SOLD', 'SHARES', 'SHARE', 'PRICE', 'TOTAL', 'ORDER', 'LIMIT',
  'MARKET', 'STOP', 'FILLED', 'STATUS', 'TYPE', 'SIDE', 'TIME', 'DATE',
]);

export function parseOcrText(rawText: string): OcrParseResult {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  // Detect action
  let action: 'buy' | 'sell' | '' = '';
  if (ACTION_BUY.test(fullText)) action = 'buy';
  else if (ACTION_SELL.test(fullText)) action = 'sell';

  // Detect date
  let date = '';
  const dateFull = fullText.match(DATE_FULL);
  if (dateFull) {
    date = `${dateFull[1]}/${dateFull[2].padStart(2, '0')}/${dateFull[3].padStart(2, '0')}`;
  } else {
    const dateShort = fullText.match(DATE_SHORT);
    if (dateShort) {
      const year = new Date().getFullYear();
      date = `${year}/${dateShort[1].padStart(2, '0')}/${dateShort[2].padStart(2, '0')}`;
    }
  }

  // Detect shares
  let shares = '';
  const sharesMatch = fullText.match(SHARES_PATTERN) || fullText.match(SHARES_NUMBER);
  if (sharesMatch) {
    shares = sharesMatch[1];
  }

  // Detect prices - get all numbers with decimals
  const prices = [...fullText.matchAll(PRICE_PATTERN)].map(m => m[1].replace(',', '.'));

  // Detect TW stock codes
  const twCodes = [...fullText.matchAll(TW_STOCK_CODE)].map(m => m[1])
    .filter(c => {
      const n = parseInt(c);
      return n >= 1000 && n <= 9999 && n !== new Date().getFullYear();
    });

  // Detect US tickers
  const usTickers = [...fullText.matchAll(US_TICKER)].map(m => m[1])
    .filter(t => !TICKER_EXCLUDE.has(t) && t.length >= 2);
  // Deduplicate
  const uniqueTickers = [...new Set(usTickers)];

  // Determine market and symbol
  let symbol = '';
  let market: 'TW' | 'US' | '' = '';

  // Check for TW broker keywords
  const isTW = /富邦|群益|永豐|元大|凱基|國泰|中信|台股|證券|台灣/.test(fullText);
  const isUS = /USD|\$|Robinhood|TD|IBKR|Schwab|Fidelity|Webull|Firstrade/.test(fullText);

  if (twCodes.length > 0 && (isTW || !isUS)) {
    symbol = twCodes[0];
    market = 'TW';
  } else if (uniqueTickers.length > 0) {
    symbol = uniqueTickers[0];
    market = 'US';
  } else if (twCodes.length > 0) {
    symbol = twCodes[0];
    market = 'TW';
  }

  // Pick the most likely price
  let price = '';
  if (prices.length > 0) {
    // Usually the trade price, pick the first reasonable one
    price = prices[0];
  }

  // Calculate confidence
  let confidence = 0;
  if (symbol) confidence += 30;
  if (action) confidence += 25;
  if (price) confidence += 20;
  if (shares) confidence += 15;
  if (date) confidence += 10;

  const trade: ParsedTrade = { symbol, action, price, shares, date, market, confidence };

  return {
    trades: [trade],
    rawText,
  };
}
