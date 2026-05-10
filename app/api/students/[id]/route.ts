import { NextResponse } from 'next/server';
import { getStudent, updateStudent, deleteStudent } from '@/lib/store';

export const maxDuration = 30;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) return NextResponse.json({ error: '找不到學生' }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patch = await request.json();
  const updated = updateStudent(id, patch);
  if (!updated) return NextResponse.json({ error: '找不到學生' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteStudent(id);
  if (!ok) return NextResponse.json({ error: '找不到學生' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
