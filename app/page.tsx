'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CompassIcon, SparklesIcon, TrendUpIcon } from '@/lib/icons';

interface WeeklyDir {
  content: string;
  weekStart: string;
}

export default function LandingPage() {
  const [stats, setStats] = useState({ trades: 0, students: 0 });
  const [direction, setDirection] = useState<WeeklyDir | null>(null);

  useEffect(() => {
    fetch('/api/trades').then(r => r.json()).then(d => {
      setStats(prev => ({ ...prev, trades: d.length }));
    }).catch(() => {});
    fetch('/api/admin/students').then(r => r.json()).then(d => {
      setStats(prev => ({ ...prev, students: d.length }));
    }).catch(() => {});
    fetch('/api/weekly-direction').then(r => r.json()).then(d => {
      if (d) setDirection(d);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4 text-center">
          JG 交易教練
        </h1>
        <p className="text-[var(--text-secondary)] text-lg md:text-xl mb-10 text-center max-w-md">
          你的專屬交易教練平台 — 方向指引、AI 覆盤、成長追蹤
        </p>

        {/* Stats */}
        <div className="flex gap-6 mb-10">
          <div className="text-center count-animate">
            <div className="text-3xl font-bold text-[var(--blue)]">{stats.trades}</div>
            <div className="text-sm text-[var(--text-secondary)]">筆交易紀錄</div>
          </div>
          <div className="w-px bg-[var(--border)]" />
          <div className="text-center count-animate">
            <div className="text-3xl font-bold text-[var(--amber)]">{stats.students}</div>
            <div className="text-sm text-[var(--text-secondary)]">位學員</div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/auth"
            className="px-8 py-3 rounded-2xl bg-[var(--blue)] text-white font-semibold text-lg hover:bg-[var(--blue-light)] transition-colors"
          >
            開始學習
          </Link>
          <Link
            href="/auth"
            className="px-8 py-3 rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] font-semibold text-lg hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors"
          >
            教練入口
          </Link>
        </div>
      </section>

      {/* Value Props */}
      <section className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <CompassIcon className="w-8 h-8 text-[var(--blue)]" />, title: '方向指引', desc: '每週市場方向分析，讓你不再迷茫' },
            { icon: <SparklesIcon className="w-8 h-8 text-[var(--amber)]" />, title: 'AI 覆盤', desc: '截圖上傳，AI 自動辨識交易紀錄' },
            { icon: <TrendUpIcon className="w-8 h-8 text-[var(--green)]" />, title: '成長追蹤', desc: '視覺化數據，看見自己的進步' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Direction Teaser */}
      {direction && (
        <section className="px-6 pb-20 max-w-4xl mx-auto w-full">
          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-2">本週方向</h3>
            <p className="text-[var(--text-primary)] leading-relaxed line-clamp-3">
              {direction.content}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--navy-light)] to-transparent" />
            <Link href="/auth" className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-[var(--blue)] hover:underline">
              登入查看完整內容
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
