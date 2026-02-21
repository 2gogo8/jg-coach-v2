'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, logout } from '@/lib/auth';
import {
  CameraIcon, ChatIcon, SearchIcon, ChartIcon,
  HomeIcon, PencilIcon, UserIcon, FireIcon,
  ChevronDownIcon, ChevronUpIcon, XIcon, UploadIcon, MicIcon,
} from '@/lib/icons';
import { BadgeIcon, CrownIcon } from '@/lib/badge-icons';
import type { BadgeId } from '@/lib/store';
import { BADGE_DEFS, LEVEL_TABLE } from '@/lib/store';

interface Student { id: string; name: string; xp: number; level: number; badges: BadgeId[]; streak: number; lastActiveDate: string; }
interface Trade { id: string; symbol: string; market: string; action: string; price: number; shares: number; date: string; note?: string; createdAt: string; }
interface Question { id: string; content: string; category: string; answer?: string; answeredBy?: string; createdAt: string; }
interface WeeklyDir { content: string; weekStart: string; }
interface XpResult { xpGained: number; leveledUp: boolean; oldLevel: number; newLevel: number; newBadges: BadgeId[]; }
interface Mission { id: string; label: string; done: boolean; }
interface LeaderEntry { rank: number; name: string; xp: number; level: number; title: string; streak: number; isTopWeekly: boolean; }

type BottomTab = 'home' | 'record' | 'ask' | 'me';

// ─── XP Float Animation Component ───
function XpFloat({ amount, x, y }: { amount: number; x: number; y: number }) {
  return <div className="xp-float" style={{ left: x, top: y }}>+{amount} XP</div>;
}

// ─── Level Up Overlay ───
function LevelUpOverlay({ level, title, onDone }: { level: number; title: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    color: ['#3B82F6', '#F59E0B', '#22C55E', '#A855F7', '#EF4444'][i % 5],
    px: `${(Math.random() - 0.5) * 200}px`,
    py: `${(Math.random() - 0.5) * 200}px`,
    delay: `${Math.random() * 0.3}s`,
  }));
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overlay-bg">
      <div className="level-up-overlay text-center relative">
        {particles.map((p, i) => (
          <div key={i} className="particle" style={{ background: p.color, '--px': p.px, '--py': p.py, animationDelay: p.delay, left: '50%', top: '50%' } as React.CSSProperties} />
        ))}
        <div className="text-6xl font-black gradient-text mb-2">LEVEL UP!</div>
        <div className="text-3xl font-bold text-[var(--text-primary)]">Lv.{level}</div>
        <div className="text-lg text-[var(--amber)] mt-1">{title}</div>
      </div>
    </div>
  );
}

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [direction, setDirection] = useState<WeeklyDir | null>(null);
  const [dirExpanded, setDirExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<BottomTab>('home');
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [allMissionsDone, setAllMissionsDone] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  // Animations
  const [xpFloats, setXpFloats] = useState<{ id: number; amount: number; x: number; y: number }[]>([]);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: string } | null>(null);
  const floatCounter = useRef(0);

  function showXpGain(amount: number) {
    const id = ++floatCounter.current;
    const x = 100 + Math.random() * 100;
    setXpFloats(prev => [...prev, { id, amount, x, y: 80 }]);
    setTimeout(() => setXpFloats(prev => prev.filter(f => f.id !== id)), 1600);
  }

  function handleXpResult(xpResult?: XpResult) {
    if (!xpResult) return;
    showXpGain(xpResult.xpGained);
    if (xpResult.leveledUp) {
      const entry = LEVEL_TABLE.find(l => l.level === xpResult.newLevel);
      setLevelUpInfo({ level: xpResult.newLevel, title: entry?.title || '' });
    }
  }

  const loadData = useCallback(async () => {
    try {
      const [sRes, tRes, qRes, dRes, mRes, lRes] = await Promise.all([
        fetch(`/api/students/${id}`),
        fetch(`/api/trades?studentId=${id}`),
        fetch(`/api/questions?studentId=${id}`),
        fetch('/api/weekly-direction'),
        fetch(`/api/missions?studentId=${id}`),
        fetch('/api/leaderboard'),
      ]);
      if (sRes.ok) setStudent(await sRes.json());
      if (tRes.ok) setTrades(await tRes.json());
      if (qRes.ok) setQuestions(await qRes.json());
      if (dRes.ok) { const d = await dRes.json(); if (d) setDirection(d); }
      if (mRes.ok) { const m = await mRes.json(); setMissions(m.missions); setAllMissionsDone(m.allDone); }
      if (lRes.ok) setLeaderboard(await lRes.json());
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth.role) { router.replace('/auth'); return; }
    loadData();
  }, [router, loadData]);

  // Level info
  const levelInfo = (() => {
    if (!student) return { level: 1, title: '新手', currentXp: 0, nextLevelXp: 50, progress: 0 };
    let current = LEVEL_TABLE[0];
    let next = LEVEL_TABLE[1];
    for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
      if (student.xp >= LEVEL_TABLE[i].xpRequired) {
        current = LEVEL_TABLE[i];
        next = LEVEL_TABLE[i + 1] || { ...current, xpRequired: current.xpRequired + 5000, level: current.level + 1, title: current.title };
        break;
      }
    }
    const range = next.xpRequired - current.xpRequired;
    const progress = range > 0 ? ((student.xp - current.xpRequired) / range) * 100 : 100;
    return { level: current.level, title: current.title, currentXp: student.xp, nextLevelXp: next.xpRequired, progress: Math.min(progress, 100) };
  })();

  // Stats
  const weekTrades = trades.filter(t => {
    const d = new Date(t.createdAt); const now = new Date(); const weekAgo = new Date(now.getTime() - 7 * 86400000);
    return d >= weekAgo;
  });
  const sells = weekTrades.filter(t => t.action === 'sell');
  const winTrades = sells.filter(t => t.note?.includes('+'));
  const winRate = sells.length > 0 ? Math.round((winTrades.length / sells.length) * 100) : 0;
  const symbolCounts = weekTrades.reduce((acc, t) => { acc[t.symbol] = (acc[t.symbol] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const dirTag = direction?.content.includes('看多') ? 'bullish' : direction?.content.includes('看空') ? 'bearish' : 'neutral';

  const activities = [
    ...trades.map(t => ({ type: 'trade' as const, data: t, time: t.createdAt })),
    ...questions.map(q => ({ type: 'question' as const, data: q, time: q.createdAt })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  const allBadges: BadgeId[] = ['first-trade', 'streak-7', 'streak-30', 'scholar', 'jg-certified', 'veteran'];

  if (loading) {
    return <div className="min-h-screen p-4 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}</div>;
  }

  return (
    <div className="min-h-screen pb-20 relative">
      {/* XP Float animations */}
      {xpFloats.map(f => <XpFloat key={f.id} amount={f.amount} x={f.x} y={f.y} />)}
      {/* Level Up overlay */}
      {levelUpInfo && <LevelUpOverlay level={levelUpInfo.level} title={levelUpInfo.title} onDone={() => setLevelUpInfo(null)} />}

      {/* Top Bar with XP */}
      <div className="sticky top-0 z-30 glass px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{student?.name || '學員'}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                Lv.{levelInfo.level} {levelInfo.title}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`flex items-center gap-1 text-sm ${(student?.streak || 0) >= 7 ? '' : 'text-[var(--amber)]'}`}>
                <FireIcon className="w-4 h-4" />
                <span className={(student?.streak || 0) >= 7 ? 'fire-streak' : ''}>{student?.streak || 0} 天連續</span>
              </div>
            </div>
          </div>
          <button onClick={logout} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">登出</button>
        </div>
        {/* XP Bar */}
        <div className="relative">
          <div className="h-2.5 rounded-full bg-[var(--navy-lighter)] overflow-hidden">
            <div className="xp-bar-fill h-full rounded-full" style={{ width: `${levelInfo.progress}%` }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-[var(--text-secondary)]">{levelInfo.currentXp} XP</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{levelInfo.nextLevelXp} XP</span>
          </div>
        </div>
      </div>

      {activeTab === 'home' && (
        <div className="p-4 space-y-4 animate-fade-in">
          {/* Daily Missions */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <SwordsIconInline /> 每日任務
              </h3>
              {allMissionsDone && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">全部完成 +30 XP</span>}
            </div>
            <div className="space-y-2">
              {missions.map(m => (
                <div key={m.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${m.done ? 'bg-green-500/10' : 'bg-[var(--navy-lighter)]'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${m.done ? 'bg-green-500' : 'border-2 border-[var(--border)]'}`}>
                    {m.done && <svg className="w-4 h-4 text-white check-pop" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                  </div>
                  <span className={`text-sm relative ${m.done ? 'text-[var(--text-secondary)]' : ''}`}>
                    {m.label}
                  </span>
                  {m.done && <span className="text-xs text-green-400 ml-auto">+XP</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Direction */}
          {direction && (
            <div className="glass rounded-2xl p-4">
              <button onClick={() => setDirExpanded(!dirExpanded)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">本週方向</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    dirTag === 'bullish' ? 'bg-green-500/20 text-green-400' :
                    dirTag === 'bearish' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{dirTag === 'bullish' ? '看多' : dirTag === 'bearish' ? '看空' : '觀望'}</span>
                </div>
                {dirExpanded ? <ChevronUpIcon className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDownIcon className="w-4 h-4 text-[var(--text-secondary)]" />}
              </button>
              {dirExpanded && <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{direction.content}</p>}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <CameraIcon className="w-6 h-6" />, label: '記錄交易', color: 'text-[var(--blue)]', sub: '+10 XP', onClick: () => setShowTradeModal(true) },
              { icon: <ChatIcon className="w-6 h-6" />, label: '提問', color: 'text-[var(--green)]', sub: '+5 XP', onClick: () => setShowQuestionModal(true) },
              { icon: <SearchIcon className="w-6 h-6" />, label: '查股票', color: 'text-[var(--amber)]', sub: '任務', onClick: () => {} },
              { icon: <ChartIcon className="w-6 h-6" />, label: '排行榜', color: 'text-purple-400', sub: '挑戰', onClick: () => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map((a, i) => (
              <button key={i} onClick={a.onClick} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-[var(--blue)] transition-colors group">
                <span className={`${a.color} group-hover:scale-110 transition-transform`}>{a.icon}</span>
                <span className="text-xs text-[var(--text-secondary)]">{a.label}</span>
                <span className="text-[10px] text-[var(--amber)] opacity-70">{a.sub}</span>
              </button>
            ))}
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">任務日誌</h2>
            <div className="space-y-3">
              {activities.slice(0, 20).map((a, i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  {a.type === 'trade' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(a.data as Trade).action === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {(a.data as Trade).action === 'buy' ? '買入' : '賣出'}
                          </span>
                          <span className="font-bold">{(a.data as Trade).symbol}</span>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">{(a.data as Trade).date}</span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">${(a.data as Trade).price} × {(a.data as Trade).shares} 股</div>
                      {(a.data as Trade).note && <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-70">{(a.data as Trade).note}</p>}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">提問</span>
                        <span className="text-xs text-[var(--text-secondary)]">{new Date((a.data as Question).createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm">{(a.data as Question).content}</p>
                      {(a.data as Question).answer && (
                        <div className="mt-2 p-2 rounded-xl bg-[var(--navy-lighter)] text-sm">
                          <span className="text-xs text-[var(--amber)]">JG 回覆：</span>
                          <p className="text-[var(--text-secondary)] mt-0.5">{(a.data as Question).answer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                  <p className="text-lg font-semibold mb-1">冒險尚未開始</p>
                  <p className="text-sm">記錄你的第一筆交易，獲得首個成就！</p>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div id="leaderboard">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
              <CrownIcon className="w-4 h-4 text-[var(--amber)]" /> 排行榜
            </h2>
            <div className="glass rounded-2xl overflow-hidden">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[var(--border)]' : ''} ${entry.name === student?.name ? 'bg-blue-500/10' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400 rank-1' :
                    i === 1 ? 'bg-gray-400/20 text-gray-300' :
                    i === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-[var(--navy-lighter)] text-[var(--text-secondary)]'
                  }`}>
                    {i === 0 ? <CrownIcon className="w-4 h-4 crown-bounce" /> : entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{entry.name}</span>
                      {entry.isTopWeekly && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">本週最勤奮</span>}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">Lv.{entry.level} {entry.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--blue)]">{entry.xp}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">本週數據</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[var(--blue)]">{weekTrades.length}</div>
                <div className="text-xs text-[var(--text-secondary)]">筆交易</div>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[var(--green)]">{winRate}%</div>
                <div className="text-xs text-[var(--text-secondary)]">勝率</div>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[var(--amber)]">{topSymbol}</div>
                <div className="text-xs text-[var(--text-secondary)]">最常交易</div>
              </div>
            </div>
            {/* Bar chart */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs text-[var(--text-secondary)] mb-3">近 7 天交易量</h3>
              <div className="flex items-end gap-1 h-24">
                {(() => {
                  const days: number[] = [];
                  for (let i = 6; i >= 0; i--) {
                    const d = new Date(); d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    days.push(trades.filter(t => t.date === dateStr).length);
                  }
                  const max = Math.max(...days, 1);
                  return days.map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-md bg-[var(--blue)] transition-all" style={{ height: `${(count / max) * 80}px`, minHeight: count > 0 ? '4px' : '0' }} />
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {['日','一','二','三','四','五','六'][new Date(Date.now() - (6-i)*86400000).getDay()]}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'record' && (
        <div className="p-4 animate-fade-in">
          <h2 className="text-lg font-bold mb-4">交易紀錄</h2>
          <div className="space-y-3">
            {trades.map((t, i) => (
              <div key={t.id} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.action === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {t.action === 'buy' ? '買入' : '賣出'}
                    </span>
                    <span className="font-bold">{t.symbol}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{t.market}</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">{t.date}</span>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">${t.price} × {t.shares} 股</div>
                {t.note && <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-70">{t.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ask' && (
        <div className="p-4 animate-fade-in">
          <h2 className="text-lg font-bold mb-4">我的提問</h2>
          <button onClick={() => setShowQuestionModal(true)} className="w-full py-3 mb-4 rounded-2xl border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--blue)] transition-colors">
            + 新提問（+5 XP）
          </button>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <p className="text-sm mb-2">{q.content}</p>
                {q.answer ? (
                  <div className="p-3 rounded-xl bg-[var(--navy-lighter)]">
                    <span className="text-xs text-[var(--amber)]">JG 回覆：</span>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{q.answer}</p>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--text-secondary)]">等待回覆中...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'me' && (
        <div className="p-4 animate-fade-in space-y-4">
          {/* Profile Card */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden profile-card-shine">
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl ${
                levelInfo.level >= 20 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                levelInfo.level >= 10 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                levelInfo.level >= 5 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                'bg-gradient-to-br from-gray-400 to-gray-600'
              } ${levelInfo.level >= 10 ? 'level-up-glow' : ''}`}>
                {student?.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{student?.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-semibold text-[var(--blue)]">Lv.{levelInfo.level}</span>
                  <span className="text-sm text-[var(--amber)]">{levelInfo.title}</span>
                </div>
                <div className={`flex items-center gap-1 mt-0.5 text-sm ${(student?.streak || 0) >= 7 ? '' : 'text-[var(--amber)]'}`}>
                  <FireIcon className="w-4 h-4" />
                  <span className={(student?.streak || 0) >= 7 ? 'fire-streak' : ''}>{student?.streak || 0} 天連續</span>
                </div>
              </div>
            </div>
            {/* XP Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                <span>Lv.{levelInfo.level} → Lv.{levelInfo.level + 1}</span>
                <span>{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--navy-lighter)] overflow-hidden">
                <div className="xp-bar-fill h-full rounded-full" style={{ width: `${levelInfo.progress}%` }} />
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold">{trades.length}</div>
                <div className="text-xs text-[var(--text-secondary)]">總交易</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{questions.length}</div>
                <div className="text-xs text-[var(--text-secondary)]">提問數</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--green)]">{winRate}%</div>
                <div className="text-xs text-[var(--text-secondary)]">勝率</div>
              </div>
            </div>
          </div>

          {/* Badge Collection */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-3">成就徽章</h3>
            <div className="grid grid-cols-3 gap-4">
              {allBadges.map(badge => {
                const earned = student?.badges.includes(badge);
                const def = BADGE_DEFS[badge];
                return (
                  <div key={badge} className={`flex flex-col items-center gap-1.5 ${earned ? 'badge-flip' : ''}`}>
                    <BadgeIcon badge={badge} size={48} locked={!earned} />
                    <span className={`text-xs font-medium text-center ${earned ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-40'}`}>
                      {def.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] text-center opacity-60">{def.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={logout} className="w-full py-3 rounded-2xl border border-[var(--border)] text-[var(--red)] hover:bg-red-500/10 transition-colors">
            登出
          </button>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal studentId={id} onClose={(xpResult) => { setShowTradeModal(false); if (xpResult) handleXpResult(xpResult); loadData(); }} />
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <QuestionModal studentId={id} studentName={student?.name || ''} onClose={(xpResult) => { setShowQuestionModal(false); if (xpResult) handleXpResult(xpResult); loadData(); }} />
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass z-40">
        <div className="flex max-w-lg mx-auto">
          {([
            { tab: 'home' as const, icon: <HomeIcon className="w-6 h-6" />, label: '首頁' },
            { tab: 'record' as const, icon: <PencilIcon className="w-6 h-6" />, label: '紀錄' },
            { tab: 'ask' as const, icon: <ChatIcon className="w-6 h-6" />, label: '提問' },
            { tab: 'me' as const, icon: <UserIcon className="w-6 h-6" />, label: '我的' },
          ]).map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${activeTab === item.tab ? 'text-[var(--blue)]' : 'text-[var(--text-secondary)]'}`}>
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline helper icon
function SwordsIconInline() {
  return (
    <svg className="w-4 h-4 text-[var(--amber)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

// ─── Trade Modal ───
function TradeModal({ studentId, onClose }: { studentId: string; onClose: (xpResult?: XpResult) => void }) {
  const [tab, setTab] = useState<'screenshot' | 'manual'>('screenshot');
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{ symbol: string; action: string; price: string; shares: string; date: string; market: string } | null>(null);
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [shares, setShares] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [market, setMarket] = useState<'US' | 'TW'>('US');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  async function handleFile(file: File) {
    setOcrProcessing(true); setOcrProgress(10);
    try {
      const Tesseract = await import('tesseract.js');
      setOcrProgress(30);
      const result = await Tesseract.recognize(file, 'chi_tra+eng', {
        logger: (m: { progress?: number }) => { if (m.progress) setOcrProgress(30 + m.progress * 50); },
      });
      setOcrProgress(85); setOcrText(result.data.text);
      const res = await fetch('/api/ocr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rawText: result.data.text }) });
      const data = await res.json();
      if (data.trades?.[0]) {
        const t = data.trades[0]; setParsedResult(t);
        setSymbol(t.symbol); if (t.action) setAction(t.action); if (t.price) setPrice(t.price); if (t.shares) setShares(t.shares);
        if (t.date) setDate(t.date.replace(/\//g, '-')); if (t.market) setMarket(t.market);
      }
      setOcrProgress(100);
    } catch (err) { console.error('OCR error:', err); setOcrText('OCR 辨識失敗，請手動輸入'); }
    finally { setOcrProcessing(false); }
  }

  async function handleSave() {
    if (!symbol || !price || !shares || !date) return;
    setSaving(true);
    try {
      const res = await fetch('/api/trades', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, symbol: symbol.toUpperCase(), market, action, price: Number(price), shares: Number(shares), date, note }),
      });
      const data = await res.json();
      setSuccess(true);
      setEarnedXp(data.xpResult?.xpGained || 0);
      setTimeout(() => onClose(data.xpResult), 1500);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 overlay-bg flex items-end md:items-center justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--navy-light)] rounded-t-3xl md:rounded-3xl animate-slide-up">
        {success ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">
              <svg className="w-16 h-16 mx-auto text-green-400 check-pop" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-1">任務完成！</h3>
            {earnedXp > 0 && <p className="text-lg font-bold text-[var(--amber)] xp-float" style={{ position: 'relative' }}>+{earnedXp} XP</p>}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold">記錄交易 <span className="text-sm text-[var(--amber)] font-normal">+10 XP</span></h2>
              <button onClick={() => onClose()}><XIcon className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>
            <div className="flex p-4 gap-2">
              {(['screenshot', 'manual'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-[var(--blue)] text-white' : 'bg-[var(--navy-lighter)] text-[var(--text-secondary)]'}`}>
                  {t === 'screenshot' ? '截圖上傳' : '手動輸入'}
                </button>
              ))}
            </div>
            <div className="px-4 pb-6">
              {tab === 'screenshot' && !parsedResult && (
                <label className="block border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--blue)] transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {ocrProcessing ? (
                    <div>
                      <div className="w-full bg-[var(--navy-lighter)] rounded-full h-2 mb-3">
                        <div className="bg-[var(--blue)] h-2 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">辨識中... {Math.round(ocrProgress)}%</p>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="w-10 h-10 mx-auto mb-3 text-[var(--text-secondary)]" />
                      <p className="text-sm text-[var(--text-secondary)]">點擊或拖曳上傳交易截圖</p>
                    </>
                  )}
                </label>
              )}
              {(tab === 'manual' || parsedResult) && (
                <div className="space-y-3">
                  {parsedResult && ocrText && (
                    <div className="p-3 rounded-xl bg-[var(--navy-lighter)] text-xs text-[var(--text-secondary)] mb-3">
                      <p className="font-medium text-[var(--blue)] mb-1">OCR 辨識結果（可編輯）</p>
                      <p className="line-clamp-3">{ocrText}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="代號" value={symbol} onChange={e => setSymbol(e.target.value)} className="px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none" />
                    <select value={market} onChange={e => setMarket(e.target.value as 'US' | 'TW')} className="px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--blue)] focus:outline-none">
                      <option value="US">美股</option>
                      <option value="TW">台股</option>
                    </select>
                  </div>
                  <div className="flex rounded-xl bg-[var(--navy-lighter)] p-1">
                    <button onClick={() => setAction('buy')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${action === 'buy' ? 'bg-green-500 text-white' : 'text-[var(--text-secondary)]'}`}>買入</button>
                    <button onClick={() => setAction('sell')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${action === 'sell' ? 'bg-red-500 text-white' : 'text-[var(--text-secondary)]'}`}>賣出</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="價格" value={price} onChange={e => setPrice(e.target.value)} className="px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none" />
                    <input type="number" placeholder="股數" value={shares} onChange={e => setShares(e.target.value)} className="px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none" />
                  </div>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--blue)] focus:outline-none" />
                  <input placeholder="備註（選填）" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none" />
                  <button onClick={handleSave} disabled={saving || !symbol || !price || !shares} className="w-full py-3.5 rounded-2xl bg-[var(--blue)] text-white font-semibold hover:bg-[var(--blue-light)] transition-colors disabled:opacity-50">
                    {saving ? '儲存中...' : '確認（+10 XP）'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Question Modal ───
function QuestionModal({ studentId, studentName, onClose }: { studentId: string; studentName: string; onClose: (xpResult?: XpResult) => void }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('other');
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      setContent((prev: string) => prev + e.results[0][0].transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, studentName, content, category }),
      });
      const data = await res.json();
      onClose(data.xpResult);
    } finally { setSaving(false); }
  }

  const categories = [
    { value: 'strategy', label: '策略' },
    { value: 'analysis', label: '分析' },
    { value: 'mindset', label: '心態' },
    { value: 'technical', label: '技術' },
    { value: 'other', label: '其他' },
  ];

  return (
    <div className="fixed inset-0 z-50 overlay-bg flex items-end md:items-center justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[var(--navy-light)] rounded-t-3xl md:rounded-3xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold">提問 <span className="text-sm text-[var(--amber)] font-normal">+5 XP</span></h2>
          <button onClick={() => onClose()}><XIcon className="w-5 h-5 text-[var(--text-secondary)]" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <textarea placeholder="你的問題是..." value={content} onChange={e => setContent(e.target.value)} rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none resize-none" />
            <button onClick={startVoice} className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${listening ? 'bg-red-500 text-white' : 'bg-[var(--navy-lighter)] text-[var(--text-secondary)] hover:text-[var(--blue)]'}`}>
              <MicIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${category === c.value ? 'bg-[var(--blue)] text-white' : 'bg-[var(--navy-lighter)] text-[var(--text-secondary)]'}`}>
                {c.label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving || !content.trim()} className="w-full py-3.5 rounded-2xl bg-[var(--blue)] text-white font-semibold hover:bg-[var(--blue-light)] transition-colors disabled:opacity-50">
            {saving ? '送出中...' : '送出提問（+5 XP）'}
          </button>
        </div>
      </div>
    </div>
  );
}
