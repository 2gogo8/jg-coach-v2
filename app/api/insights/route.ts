import { NextResponse } from 'next/server';
import { addInsight, getInsights, deleteInsight } from '@/lib/store';

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeIntraDay = searchParams.get('includeIntraDay') === '1';
  let results = await getInsights();
  if (!includeIntraDay) {
    results = results.filter(i => i.category !== 'intra-day');
  }
  return NextResponse.json(results, {
    headers: { 'X-Version': 'v3-inline-seed' }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, tickers, category } = body;

    if (!content) {
      return NextResponse.json({ error: '需要 content' }, { status: 400 });
    }

    const insight = await addInsight({ content, tickers, category });
    return NextResponse.json(insight);
  } catch {
    return NextResponse.json({ error: '格式錯誤' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: '需要 id' }, { status: 400 });
    const ok = await deleteInsight(id);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ error: '格式錯誤' }, { status: 400 });
  }
}
