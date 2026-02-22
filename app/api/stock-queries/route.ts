import { NextResponse } from 'next/server';
import { addStockQuery, getStockQueries, getStudent } from '@/lib/store';

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId') || undefined;
  return NextResponse.json(await getStockQueries(studentId));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { studentId, symbol } = body;
  if (!studentId || !symbol) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
  }
  const student = await getStudent(studentId);
  const q = await addStockQuery({
    studentId,
    studentName: student?.name || '',
    symbol: symbol.toUpperCase(),
  });
  return NextResponse.json(q, { status: 201 });
}
