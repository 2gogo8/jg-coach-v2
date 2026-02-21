import { NextResponse } from 'next/server';
import { getAllStudents, getStudentAnalytics } from '@/lib/store';

export const maxDuration = 30;

export async function GET() {
  const students = getAllStudents();
  const withAnalytics = students.map(s => ({
    ...s,
    analytics: getStudentAnalytics(s.id),
  }));
  return NextResponse.json(withAnalytics);
}
