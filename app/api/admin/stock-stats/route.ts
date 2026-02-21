import { NextResponse } from 'next/server';
import { getStockQueryStats, getStockQueries } from '@/lib/store';

export const maxDuration = 30;

export async function GET() {
  const topStocks = getStockQueryStats();
  const allQueries = getStockQueries();
  const recentQueries = allQueries.slice(0, 20).map(q => ({
    studentId: q.studentId,
    studentName: q.studentName,
    symbol: q.symbol,
    timestamp: q.createdAt,
  }));
  return NextResponse.json({ topStocks, recentQueries });
}
