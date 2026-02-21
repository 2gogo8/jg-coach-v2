import { NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/store';

export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { answer, by } = await request.json();
  if (!answer) return NextResponse.json({ error: '缺少回覆內容' }, { status: 400 });
  const { question, xpResult } = answerQuestion(id, answer, by || 'jg');
  if (!question) return NextResponse.json({ error: '找不到問題' }, { status: 404 });
  return NextResponse.json({ ...question, xpResult });
}
