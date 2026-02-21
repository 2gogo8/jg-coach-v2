import { NextResponse } from 'next/server';
import { getDailyMissions } from '@/lib/store';

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) return NextResponse.json({ error: '缺少 studentId' }, { status: 400 });
  const missions = getDailyMissions(studentId);
  const allDone = missions.every(m => m.done);
  return NextResponse.json({ missions, allDone, bonusXp: allDone ? 30 : 0 });
}
