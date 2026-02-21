import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/store';

export const maxDuration = 30;

export async function GET() {
  return NextResponse.json(getLeaderboard());
}
