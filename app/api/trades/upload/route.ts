import { NextResponse } from 'next/server';
import { addTrade } from '@/lib/store';

export const maxDuration = 30;

export async function POST(request: Request) {
  const formData = await request.formData();
  const studentId = formData.get('studentId') as string;
  const symbol = formData.get('symbol') as string;
  const market = (formData.get('market') as string) || 'US';
  const action = formData.get('action') as 'buy' | 'sell';
  const price = Number(formData.get('price'));
  const shares = Number(formData.get('shares'));
  const date = formData.get('date') as string;
  const note = formData.get('note') as string | undefined;
  const imageFile = formData.get('image') as File | null;

  if (!studentId || !symbol || !action || !price || !shares || !date) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
  }

  let imageBase64: string | undefined;
  if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    imageBase64 = `data:${imageFile.type};base64,${Buffer.from(buffer).toString('base64')}`;
  }

  const trade = addTrade({
    studentId,
    symbol: symbol.toUpperCase(),
    market: market as 'US' | 'TW',
    action,
    price,
    shares,
    date,
    note: note || undefined,
    imageBase64,
  });

  return NextResponse.json(trade, { status: 201 });
}
