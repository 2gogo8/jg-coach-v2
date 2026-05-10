import { NextResponse } from 'next/server';
import { setWeeklyDirection, getWeeklyDirection } from '@/lib/store';

export const maxDuration = 30;

export async function GET() {
  const direction = await getWeeklyDirection();
  if (!direction) return NextResponse.json(null);
  return NextResponse.json(direction);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: '需要 content' }, { status: 400 });
    }

    const direction = await setWeeklyDirection(content.trim());
    return NextResponse.json(direction);
  } catch {
    return NextResponse.json({ error: '格式錯誤' }, { status: 400 });
  }
}
