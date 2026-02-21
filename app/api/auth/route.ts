import { NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/store';

export const maxDuration = 30;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '290';

export async function POST(request: Request) {
  const { code } = await request.json();

  // Admin login
  if (code === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true, role: 'admin' });
    res.cookies.set('jg_auth', 'admin', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    res.cookies.set('jg_coach', JSON.stringify({ role: 'admin' }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    return res;
  }

  // Student login by invite code
  if (code === 'jg2026') {
    // Generic student login — redirect to register if no studentId
    const res = NextResponse.json({ ok: true, role: 'student', studentId: '', needsRegister: true });
    return res;
  }

  // Student login by their ID
  const students = getAllStudents();
  const student = students.find(s => s.id === code);
  if (student) {
    const res = NextResponse.json({ ok: true, role: 'student', studentId: student.id, name: student.name });
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

  return NextResponse.json({ error: '代碼錯誤' }, { status: 401 });
}
