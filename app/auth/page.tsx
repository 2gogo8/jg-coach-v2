'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/lib/auth';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'student' | 'coach'>('student');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth.role === 'admin') router.replace('/admin');
    else if (auth.role === 'student' && auth.studentId) router.replace(`/student/${auth.studentId}`);
  }, [router]);

  async function handleStudent() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/student/${data.studentId}`);
    } catch { setError('連線失敗'); }
    finally { setLoading(false); }
  }

  async function handleCoach() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (data.role === 'admin') router.push('/admin');
    } catch { setError('連線失敗'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8 gradient-text">JG 交易教練</h1>

        {/* Mode Toggle */}
        <div className="flex rounded-2xl bg-[var(--navy-light)] p-1 mb-6">
          {(['student', 'coach'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m
                  ? 'bg-[var(--blue)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {m === 'student' ? '學生' : '教練'}
            </button>
          ))}
        </div>

        {mode === 'student' ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="你的名字"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none transition-colors text-base"
            />
            <input
              type="text"
              placeholder="邀請碼"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none transition-colors text-base"
            />
            <button
              onClick={handleStudent}
              disabled={loading || !name.trim() || !code.trim()}
              className="w-full py-3.5 rounded-2xl bg-[var(--blue)] text-white font-semibold text-base hover:bg-[var(--blue-light)] transition-colors disabled:opacity-50"
            >
              {loading ? '登入中...' : '開始學習'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="教練密碼"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCoach()}
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--amber)] focus:outline-none transition-colors text-base"
            />
            <button
              onClick={handleCoach}
              disabled={loading || !password.trim()}
              className="w-full py-3.5 rounded-2xl bg-[var(--amber)] text-[var(--navy)] font-semibold text-base hover:bg-[var(--amber-light)] transition-colors disabled:opacity-50"
            >
              {loading ? '登入中...' : '教練入口'}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-[var(--red)]">{error}</p>
        )}
      </div>
    </div>
  );
}
