'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CompassIcon, SparklesIcon, TrendUpIcon } from '@/lib/icons';

interface WeeklyDir {
  content: string;
  weekStart: string;
}

// 精選學員亮點（靜態，從操作拆解文件摘取）
const FEATURED_STUDENTS = [
  {
    name: "陳治豪",
    market: "台指期貨",
    grade: "B+",
    gradeColor: "text-blue-400",
    pnl: "+645,276",
    pnlUnit: "TWD",
    trades: 106,
    highlight: "微台指67筆勝率70.1%，分批建倉+分批了結，1月13筆單月獲利30萬",
    symbol: "微台期",
    style: "波段操作"
  },
  {
    name: "阿丁",
    market: "台股個股期貨",
    grade: "優",
    gradeColor: "text-green-400",
    pnl: "+254,218",
    pnlUnit: "TWD",
    trades: 139,
    highlight: "家登17筆100%全勝，勝率56%但賺賠比1.77:1，個股期貨精準部位管理",
    symbol: "家登 3680",
    style: "短波段"
  },
  {
    name: "Finn",
    market: "台股選擇權",
    grade: "B+",
    gradeColor: "text-blue-400",
    pnl: "+318,924",
    pnlUnit: "TWD",
    trades: null,
    highlight: "PCB供應鏈三劍客（金像電+台燿+凡甲）合計獲利28萬，精準卡位AI伺服器周期",
    symbol: "金像電 2368",
    style: "主題選股"
  },
  {
    name: "Emma",
    market: "台股",
    grade: "B-",
    gradeColor: "text-yellow-400",
    pnl: "+241,813",
    pnlUnit: "TWD",
    trades: 204,
    highlight: "高力(8996)從500元庫存分批出貨至758元，獲利+156,555，展現出色的趨勢管理能力",
    symbol: "高力 8996",
    style: "庫存管理"
  },
  {
    name: "張建凱",
    market: "美國期貨",
    grade: "中上",
    gradeColor: "text-blue-300",
    pnl: "+$16,377",
    pnlUnit: "USD",
    trades: 42,
    highlight: "83.3%高勝率，黃金期貨12口持有2個月從4,151漲到4,856，耐心抱住大波段",
    symbol: "黃金期貨 GC",
    style: "趨勢跟隨"
  },
  {
    name: "JYL",
    market: "台股",
    grade: "優",
    gradeColor: "text-green-400",
    pnl: "+264,759",
    pnlUnit: "TWD",
    trades: 3,
    highlight: "汎銓(6830)在底部145元買入，翻倍後298元出場，金字塔式分批了結獲利103%",
    symbol: "汎銓 6830",
    style: "波段持股"
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ trades: 0, students: 0 });
  const [direction, setDirection] = useState<WeeklyDir | null>(null);
  const [featuredIdx, setFeaturedIdx] = useState(0);

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

    // Auto-rotate featured student
    const timer = setInterval(() => {
      setFeaturedIdx(i => (i + 1) % FEATURED_STUDENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const featured = FEATURED_STUDENTS[featuredIdx];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="inline-block bg-red-600/20 text-red-400 px-4 py-1 rounded-full text-sm mb-6 border border-red-600/30">
          JG 交易教練平台
        </div>
        <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4 text-center">
          JG實驗室
        </h1>
        <p className="text-[var(--text-secondary)] text-lg md:text-xl mb-8 text-center max-w-md">
          方向指引 · AI覆盤 · 成長追蹤
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--blue)]">{stats.students || 20}</div>
            <div className="text-sm text-[var(--text-secondary)]">位學員</div>
          </div>
          <div className="w-px bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">3+</div>
            <div className="text-sm text-[var(--text-secondary)]">個月實戰記錄</div>
          </div>
          <div className="w-px bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--amber)]">20</div>
            <div className="text-sm text-[var(--text-secondary)]">份操作拆解</div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4 mb-12">
          <Link
            href="/auth"
            className="px-8 py-3 rounded-2xl bg-[var(--blue)] text-white font-semibold text-lg hover:bg-[var(--blue-light)] transition-colors"
          >
            學員登入
          </Link>
          <Link
            href="/showcase"
            className="px-8 py-3 rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] font-semibold text-lg hover:border-red-500 hover:text-red-400 transition-colors"
          >
            查看學員分析 →
          </Link>
        </div>
      </section>

      {/* Featured Student Spotlight */}
      <section className="px-6 pb-10 max-w-4xl mx-auto w-full">
        <div className="text-center mb-4">
          <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">戰友實戰成果</span>
        </div>

        {/* Rotating Card */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden border border-[#333] hover:border-[#444] transition-colors">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-white">{featured.name}</span>
                <span className={`text-sm font-bold ${featured.gradeColor} bg-[#1a1a1a] px-2 py-0.5 rounded-lg border border-[#333]`}>
                  {featured.grade}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]">
                  {featured.market}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]">
                  {featured.style}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${featured.pnl.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                {featured.pnl}
              </div>
              <div className="text-xs text-gray-500">{featured.pnlUnit} 淨損益</div>
            </div>
          </div>

          <div className="flex items-start gap-2 mb-4">
            <span className="text-yellow-400 mt-0.5 flex-shrink-0">✦</span>
            <p className="text-sm text-gray-300 leading-relaxed">{featured.highlight}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#1a1a1a] text-gray-400 px-2 py-1 rounded border border-[#2a2a2a]">
                代表標的：{featured.symbol}
              </span>
              {featured.trades && (
                <span className="text-xs text-gray-600">
                  {featured.trades} 筆交易
                </span>
              )}
            </div>

            {/* Dots */}
            <div className="flex gap-1.5">
              {FEATURED_STUDENTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === featuredIdx ? 'bg-red-500' : 'bg-[#333]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* View all link */}
        <div className="text-center mt-4">
          <Link href="/showcase" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            查看全部 20 位學員的操作分析 →
          </Link>
        </div>
      </section>

      {/* Value Props */}
      <section className="px-6 pb-12 max-w-4xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <CompassIcon className="w-8 h-8 text-[var(--blue)]" />, title: '方向指引', desc: '每週市場方向分析，讓你不再迷茫' },
            { icon: <SparklesIcon className="w-8 h-8 text-[var(--amber)]" />, title: 'AI 覆盤', desc: '截圖上傳，AI 自動辨識交易紀錄' },
            { icon: <TrendUpIcon className="w-8 h-8 text-[var(--green)]" />, title: '操作拆解', desc: 'JG 親自分析每位學員的交易邏輯' },
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
