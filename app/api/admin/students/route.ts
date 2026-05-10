import { NextResponse } from 'next/server';
import { getAllStudents, getStudentAnalytics, clearAllStudents } from '@/lib/store';

export const maxDuration = 30;

export async function GET() {
  const students = await getAllStudents();
  const withAnalytics = await Promise.all(students.map(async s => ({
    ...s,
    analytics: await getStudentAnalytics(s.id),
  })));
  return NextResponse.json(withAnalytics);
}

export async function DELETE() {
  await clearAllStudents();
  return NextResponse.json({ ok: true, message: '所有學生資料已清除' });
}
