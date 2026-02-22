import { NextResponse } from 'next/server';
import { addTrade, getTradesByStudent, getAllTrades } from '@/lib/store';

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  if (studentId) return NextResponse.json(await getTradesByStudent(studentId));
  return NextResponse.json(await getAllTrades());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { studentId, symbol, market, action, price, shares, date, note } = body;
  if (!studentId || !symbol || !action || !price || !shares || !date) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
  }
  const { trade, xpResult } = await addTrade({
    studentId,
    symbol: symbol.toUpperCase(),
    market: market || 'US',
    action,
    price: Number(price),
    shares: Number(shares),
    date,
    note,
  });
  return NextResponse.json({ ...trade, xpResult }, { status: 201 });
}
