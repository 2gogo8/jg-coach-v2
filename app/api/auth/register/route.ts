import { NextResponse } from 'next/server';
import { addStudent } from '@/lib/store';

export const maxDuration = 30;

const INVITE_CODE = process.env.STUDENT_CODE || 'jg2026';

export async function POST(request: Request) {
  const { name, code } = await request.json();

  if (code !== INVITE_CODE) {
    return NextResponse.json({ error: '邀請碼錯誤' }, { status: 401 });
  }

  if (!name || name.trim().length < 1) {
    return NextResponse.json({ error: '請輸入姓名' }, { status: 400 });
  }

  const student = addStudent({
    name: name.trim(),
    joinDate: new Date().toISOString().split('T')[0],
    experience: 'beginner',
    style: '',
    goal: '',
    brokers: [],
    note: '',
    tags: [],
  });

  const res = NextResponse.json({ ok: true, studentId: student.id, name: student.name });
  res.cookies.set('jg_auth', `student:${student.id}`, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  res.cookies.set('jg_coach', JSON.stringify({ role: 'student', studentId: student.id, name: student.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  return res;
}
