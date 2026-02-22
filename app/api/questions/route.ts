import { NextResponse } from 'next/server';
import { addQuestion, getQuestionsByStudent, getUnansweredQuestions, getAllQuestions } from '@/lib/store';

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const unanswered = searchParams.get('unanswered');

  if (unanswered === '1') return NextResponse.json(await getUnansweredQuestions());
  if (studentId) return NextResponse.json(await getQuestionsByStudent(studentId));
  return NextResponse.json(await getAllQuestions());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { studentId, studentName, content, category } = body;
  if (!studentId || !content) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
  }
  const { question, xpResult } = await addQuestion({ studentId, studentName: studentName || '', content, category: category || 'other' });
  return NextResponse.json({ ...question, xpResult }, { status: 201 });
}
