'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, logout } from '@/lib/auth';
import { Toast } from '@/lib/toast';
import {
  CameraIcon, ChatIcon, SearchIcon, ChartIcon,
  HomeIcon, PencilIcon, UserIcon, FireIcon,
  ChevronDownIcon, ChevronUpIcon, XIcon, UploadIcon, MicIcon,
} from '@/lib/icons';

interface Student { id: string; name: string; xp: number; level: number; badges: string[]; streak: number; lastActiveDate: string; joinDate: string; }
interface Trade { id: string; symbol: string; market: string; action: string; price: number; shares: number; date: string; note?: string; createdAt: string; studentId: string; }
interface Question { id: string; content: string; category: string; answer?: string; answeredBy?: string; createdAt: string; studentName?: string; }
interface QuestionGroup { category: string; label: string; count: number; questions: Question[]; suggestedSolution?: string; }
interface PublicQuestionsData { weekStart: string; totalQuestions: number; groups: QuestionGroup[]; }
interface WeeklyDir { content: string; weekStart: string; }

type BottomTab = 'home' | 'record' | 'ask' | 'me';
type AskTab = 'mine' | 'public';

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
  const [socialProof, setSocialProof] = useState({ todayActive: 0, hotStock: '' });
  const [justSaved, setJustSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [marketIndices, setMarketIndices] = useState<Array<{ name: string; symbol: string; price: number; change: number; changesPercentage: number | null }>>([]);
  const [askTab, setAskTab] = useState<AskTab>('mine');
  const [publicQuestions, setPublicQuestions] = useState<PublicQuestionsData | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [sRes, tRes, qRes, dRes, allTRes, allQRes, mktRes, pubQRes] = await Promise.all([
        fetch(`/api/students/${id}`),
        fetch(`/api/trades?studentId=${id}`),
        fetch(`/api/questions?studentId=${id}`),
        fetch('/api/weekly-direction'),
        fetch('/api/trades'),
        fetch('/api/admin/stock-stats'),
        fetch('/api/market-overview'),
        fetch('/api/questions/public'),
      ]);
      if (sRes.ok) setStudent(await sRes.json());
      if (tRes.ok) setTrades(await tRes.json());
      if (qRes.ok) setQuestions(await qRes.json());
      if (pubQRes.ok) setPublicQuestions(await pubQRes.json());
      if (dRes.ok) { const d = await dRes.json(); if (d) setDirection(d); }
      if (allTRes.ok) {
        const allTrades = await allTRes.json() as Trade[];
        const today = new Date().toISOString().split('T')[0];
        const todayStudents = new Set(allTrades.filter((t: Trade) => t.date === today).map((t: Trade) => t.studentId));
        setSocialProof(prev => ({ ...prev, todayActive: todayStudents.size }));
      }
      if (allQRes.ok) {
        const stats = await allQRes.json();
        if (stats.topStocks?.[0]) setSocialProof(prev => ({ ...prev, hotStock: stats.topStocks[0].symbol }));
      }
      if (mktRes.ok) {
        const mktData = await mktRes.json();
        if (mktData.indices) setMarketIndices(mktData.indices);
      }
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth.role) { router.replace('/auth'); return; }
    loadData();
  }, [router, loadData]);

  // Streak message
  const streakMsg = (() => {
    const s = student?.streak || 0;
    if (s === 0) return null;
    if (s === 1) return '第 1 天，好的開始！';
    if (s < 7) return `第 ${s} 天了，繼續保持`;
    if (s < 30) return `第 ${s} 天，很棒的節奏`;
    return `第 ${s} 天，令人敬佩的堅持`;
  })();

  // Milestones (growth trajectory)
  const milestones = (() => {
    const ms: { label: string; date: string; done: boolean }[] = [];
    if (trades.length >= 1) {
      const first = [...trades].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
      ms.push({ label: '第一筆交易', date: first.date, done: true });
    } else {
      ms.push({ label: '第一筆交易', date: '', done: false });
    }
    ms.push({ label: '累計 10 筆交易', date: trades.length >= 10 ? '' : '', done: trades.length >= 10 });
    const jgReplies = questions.filter(q => q.answeredBy === 'jg');
    ms.push({ label: '首次被 JG 回覆', date: jgReplies[0] ? new Date(jgReplies[0].createdAt).toLocaleDateString('zh-TW') : '', done: jgReplies.length > 0 });
    ms.push({ label: '累計 50 筆交易', date: '', done: trades.length >= 50 });
    ms.push({ label: '連續記錄 30 天', date: '', done: (student?.streak || 0) >= 30 });
    return ms;
  })();

  // Monthly comparison
  const monthlyCompare = (() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthTrades = trades.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthTrades = trades.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    }).length;
    const diff = thisMonthTrades - lastMonthTrades;
    return { thisMonth: thisMonthTrades, diff };
  })();

  // Stats
  const weekTrades = trades.filter(t => {
    const d = new Date(t.createdAt); const weekAgo = new Date(Date.now() - 7 * 86400000);
    return d >= weekAgo;
  });
  const sells = weekTrades.filter(t => t.action === 'sell');
  const winTrades = sells.filter(t => t.note?.includes('+'));
  const winRate = sells.length > 0 ? Math.round((winTrades.length / sells.length) * 100) : 0;
  const symbolCounts = weekTrades.reduce((acc, t) => { acc[t.symbol] = (acc[t.symbol] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const dirTag = direction?.content.includes('看多') ? 'bullish' : direction?.content.includes('看空') ? 'bearish' : 'neutral';

  // Activity feed
  const activities = [
    ...trades.map(t => ({ type: 'trade' as const, data: t, time: t.createdAt })),
    ...questions.map(q => ({ type: 'question' as const, data: q, time: q.createdAt })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  // Smart defaults for trade modal
  const lastSymbol = trades[0]?.symbol || '';
  const lastMarket = (trades[0]?.market || 'US') as 'US' | 'TW';

  if (loading) {
    return (
      <div className="min-h-screen p-4 space-y-4">
        <div className="skeleton h-12 w-48" />
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-20 w-full" />
        <p className="text-sm text-[var(--text-tertiary)] text-center mt-4">正在整理你的紀錄...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar — clean, warm */}
      <div className="sticky top-0 z-30 glass px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{student?.name || '學員'}</h1>
            {streakMsg && (
              <p className="text-sm streak-warm mt-0.5">{streakMsg}</p>
            )}
          </div>
          <button onClick={logout} className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">登出</button>
        </div>
      </div>

      {activeTab === 'home' && (
        <div className="px-5 py-4 space-y-5 animate-fade-in">
          {/* Greeting + social proof */}
          <div>
            {socialProof.todayActive > 0 && (
              <p className="text-sm text-[var(--text-tertiary)] mb-1">
                今天有 {socialProof.todayActive} 位同學記錄了交易
              </p>
            )}
            {socialProof.hotStock && (
              <p className="text-sm text-[var(--text-tertiary)]">
                本週最多人關注的股票：<span className="text-[var(--text-secondary)] font-medium">{socialProof.hotStock}</span>
              </p>
            )}
          </div>

          {/* Quick action — one tap to record */}
          <button
            onClick={() => setShowTradeModal(true)}
            className="w-full py-4 rounded-2xl bg-[var(--blue-soft)] border border-[var(--blue)]/20 text-[var(--blue-light)] text-base font-medium hover:bg-[var(--blue)]/20 transition-all active:scale-[0.98]"
          >
            今天交易了什麼？
          </button>

          {/* Market Overview */}
          {marketIndices.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-3">市場走勢</h3>
              <div className="grid grid-cols-3 gap-3">
                {marketIndices.map(idx => (
                  <div key={idx.symbol} className="text-center">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">{idx.name}</div>
                    <div className={`text-sm font-semibold ${
                      (idx.changesPercentage || idx.change) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {idx.changesPercentage !== null && idx.changesPercentage !== undefined 
                        ? `${idx.changesPercentage >= 0 ? '+' : ''}${idx.changesPercentage.toFixed(2)}%`
                        : `${idx.change >= 0 ? '+' : ''}$${Math.abs(idx.change).toFixed(2)}`
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Direction */}
          {direction && (
            <div className="glass rounded-2xl p-5">
              <button onClick={() => setDirExpanded(!dirExpanded)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">本週方向</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    dirTag === 'bullish' ? 'bg-[var(--green-soft)] text-green-400' :
                    dirTag === 'bearish' ? 'bg-[var(--red-soft)] text-red-400' :
                    'bg-[var(--amber-soft)] text-amber-400'
                  }`}>{dirTag === 'bullish' ? '看多' : dirTag === 'bearish' ? '看空' : '觀望'}</span>
                </div>
                {dirExpanded ? <ChevronUpIcon className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDownIcon className="w-4 h-4 text-[var(--text-tertiary)]" />}
              </button>
              {dirExpanded && <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{direction.content}</p>}
            </div>
          )}

          {/* Activity timeline */}
          <div>
            <h2 className="text-sm font-medium text-[var(--text-tertiary)] mb-3">最近紀錄</h2>
            <div className="space-y-3">
              {activities.slice(0, 15).map((a, i) => (
                <div
                  key={i}
                  className={`glass rounded-2xl p-4 animate-fade-in ${justSaved && i === 0 ? 'success-flash' : ''} ${
                    a.type === 'question' && (a.data as Question).answeredBy === 'jg' && !(a.data as Question).answer ? '' : ''
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {a.type === 'trade' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(a.data as Trade).action === 'buy' ? 'bg-[var(--green-soft)] text-green-400' : 'bg-[var(--red-soft)] text-red-400'}`}>
                            {(a.data as Trade).action === 'buy' ? '買入' : '賣出'}
                          </span>
                          <span className="font-semibold">{(a.data as Trade).symbol}</span>
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)]">{(a.data as Trade).date}</span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">${(a.data as Trade).price} × {(a.data as Trade).shares} 股</div>
                      {(a.data as Trade).note && <p className="text-xs text-[var(--text-tertiary)] mt-1.5">{(a.data as Trade).note}</p>}
                    </div>
                  ) : (
                    <div className={(a.data as Question).answeredBy === 'jg' ? 'warm-glow' : ''}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--blue-soft)] text-blue-400 font-medium">提問</span>
                        <span className="text-xs text-[var(--text-tertiary)]">{new Date((a.data as Question).createdAt).toLocaleDateString('zh-TW')}</span>
                      </div>
                      <p className="text-sm">{(a.data as Question).content}</p>
                      {(a.data as Question).answer && (
                        <div className={`mt-2.5 p-3 rounded-xl text-sm ${(a.data as Question).answeredBy === 'jg' ? 'bg-[var(--amber-soft)] border border-[var(--amber)]/10' : 'bg-[var(--navy-lighter)]'}`}>
                          <span className={`text-xs font-medium ${(a.data as Question).answeredBy === 'jg' ? 'text-[var(--amber)]' : 'text-[var(--text-secondary)]'}`}>
                            {(a.data as Question).answeredBy === 'jg' ? 'JG 回覆' : 'AI 回覆'}
                          </span>
                          <p className="text-[var(--text-secondary)] mt-1">{(a.data as Question).answer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-16 text-[var(--text-tertiary)]">
                  <p className="text-base mb-2">還沒有紀錄</p>
                  <p className="text-sm mb-4">開始你的交易日記，追蹤每一次成長</p>
                  <button
                    onClick={() => setShowTradeModal(true)}
                    className="px-5 py-2 rounded-xl bg-[var(--blue-soft)] text-[var(--blue)] text-sm font-medium hover:bg-[var(--blue)]/20 transition-all"
                  >
                    記錄第一筆交易
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Weekly stats — subtle */}
          {weekTrades.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-3">本週回顧</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-[var(--text-primary)]">{weekTrades.length}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">筆交易</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[var(--text-primary)]">{winRate}%</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">勝率</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[var(--text-primary)]">{topSymbol}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">最常交易</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'record' && (
        <div className="px-5 py-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">交易紀錄</h2>
            <button onClick={() => setShowTradeModal(true)} className="text-sm text-[var(--blue)] font-medium">+ 新紀錄</button>
          </div>
          <div className="space-y-3">
            {trades.map((t, i) => (
              <div key={t.id} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.action === 'buy' ? 'bg-[var(--green-soft)] text-green-400' : 'bg-[var(--red-soft)] text-red-400'}`}>
                      {t.action === 'buy' ? '買入' : '賣出'}
                    </span>
                    <span className="font-semibold">{t.symbol}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{t.market}</span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">{t.date}</span>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">${t.price} × {t.shares} 股</div>
                {t.note && <p className="text-xs text-[var(--text-tertiary)] mt-1.5">{t.note}</p>}
              </div>
            ))}
            {trades.length === 0 && <p className="text-center py-12 text-[var(--text-tertiary)]">還沒有交易紀錄</p>}
          </div>
        </div>
      )}

      {activeTab === 'ask' && (
        <div className="px-5 py-4 animate-fade-in">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setAskTab('mine')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                askTab === 'mine'
                  ? 'bg-[var(--blue)] text-white'
                  : 'bg-[var(--navy-lighter)] text-[var(--text-tertiary)]'
              }`}
            >
              我的提問 {questions.length > 0 && `(${questions.length})`}
            </button>
            <button
              onClick={() => setAskTab('public')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                askTab === 'public'
                  ? 'bg-[var(--blue)] text-white'
                  : 'bg-[var(--navy-lighter)] text-[var(--text-tertiary)]'
              }`}
            >
              社群問答 {publicQuestions && `(${publicQuestions.totalQuestions})`}
            </button>
          </div>

          {askTab === 'mine' && (
            <>
              <button onClick={() => setShowQuestionModal(true)} className="w-full py-4 mb-4 rounded-2xl bg-[var(--green-soft)] border border-[var(--green)]/20 text-green-400 text-base font-medium hover:bg-[var(--green)]/20 transition-all active:scale-[0.98]">
                有什麼想法？
              </button>
              
              {questions.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-[var(--text-tertiary)] mb-3">還沒有提問</p>
                  <p className="text-sm text-[var(--text-secondary)]">遇到交易難題？隨時問 JG 和社群</p>
                </div>
              )}
              
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className={`glass rounded-2xl p-4 animate-fade-in ${q.answeredBy === 'jg' ? 'warm-glow' : ''}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <p className="text-sm mb-2">{q.content}</p>
                    {q.answer ? (
                      <div className={`p-3 rounded-xl text-sm ${q.answeredBy === 'jg' ? 'bg-[var(--amber-soft)] border border-[var(--amber)]/10' : 'bg-[var(--navy-lighter)]'}`}>
                        <span className={`text-xs font-medium ${q.answeredBy === 'jg' ? 'text-[var(--amber)]' : 'text-[var(--text-secondary)]'}`}>
                          {q.answeredBy === 'jg' ? 'JG 回覆' : 'AI 回覆'}
                        </span>
                        <p className="text-[var(--text-secondary)] mt-1">{q.answer}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-tertiary)]">等待回覆中...</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {askTab === 'public' && (
            <div className="space-y-4">
              {publicQuestions?.totalQuestions === 0 && (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-[var(--text-tertiary)]">本週還沒有人提問</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">成為第一個開口的人吧！</p>
                </div>
              )}
              
              {publicQuestions?.groups.map((group, gIdx) => (
                <div key={group.category} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${gIdx * 60}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[var(--blue)]">{group.label}</h3>
                    <span className="text-xs text-[var(--text-tertiary)]">{group.count} 個問題</span>
                  </div>
                  <div className="space-y-3">
                    {group.questions.slice(0, 3).map((q, qIdx) => (
                      <div key={q.id} className="border-t border-[var(--border)] pt-3 first:border-0 first:pt-0">
                        <div className="flex items-start gap-2 mb-1.5">
                          <span className="text-xs text-[var(--text-tertiary)]">{q.studentName || '匿名'}</span>
                          {q.answeredBy === 'jg' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--amber-soft)] text-[var(--amber)]">JG已回</span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">{q.content}</p>
                        {q.answer && (
                          <div className="bg-[var(--navy-lighter)] rounded-lg p-2.5 text-xs text-[var(--text-tertiary)]">
                            {q.answer.length > 80 ? q.answer.substring(0, 80) + '...' : q.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {group.suggestedSolution && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--text-tertiary)]">💡 {group.suggestedSolution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'me' && (
        <div className="px-5 py-4 animate-fade-in space-y-5">
          {/* Profile */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--blue)] to-blue-700 flex items-center justify-center font-bold text-xl text-white">
                {student?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{student?.name}</h2>
                {streakMsg && <p className="text-sm streak-warm mt-0.5">{streakMsg}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold">{trades.length}</div>
                <div className="text-xs text-[var(--text-tertiary)]">總交易</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{questions.length}</div>
                <div className="text-xs text-[var(--text-tertiary)]">提問數</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{winRate}%</div>
                <div className="text-xs text-[var(--text-tertiary)]">勝率</div>
              </div>
            </div>
          </div>

          {/* Monthly growth */}
          {monthlyCompare.thisMonth > 0 && (
            <div className="glass rounded-2xl p-5 animate-gentle">
              <p className="text-sm text-[var(--text-secondary)]">
                這個月你記錄了 <span className="font-semibold text-[var(--text-primary)]">{monthlyCompare.thisMonth} 筆</span>交易
                {monthlyCompare.diff > 0 && <span className="text-green-400">，比上月多 {monthlyCompare.diff} 筆</span>}
                {monthlyCompare.diff < 0 && <span className="text-[var(--text-tertiary)]">，比上月少 {Math.abs(monthlyCompare.diff)} 筆</span>}
                {monthlyCompare.diff === 0 && <span className="text-[var(--text-tertiary)]">，跟上月一樣</span>}
              </p>
            </div>
          )}

          {/* Growth Trajectory — milestones */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-4">成長軌跡</h3>
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3 relative pb-5 last:pb-0">
                  {/* Connector line */}
                  {i < milestones.length - 1 && (
                    <div className="absolute left-[11px] top-[22px] bottom-0 w-[2px]" style={{ background: m.done ? 'var(--blue)' : 'var(--border)' }} />
                  )}
                  {/* Dot */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    m.done ? 'bg-[var(--blue)]' : 'bg-[var(--navy-lighter)] border-2 border-[var(--border)]'
                  } ${m.done && i === milestones.filter(x => x.done).length - 1 ? 'milestone-dot-active' : ''}`}>
                    {m.done && (
                      <svg className="w-3.5 h-3.5 text-white check-appear" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm ${m.done ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)]'}`}>{m.label}</p>
                    {m.done && m.date && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{m.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-3">近 7 天</h3>
            <div className="flex items-end gap-1.5 h-20">
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
                    <div
                      className="w-full rounded-md transition-all"
                      style={{
                        height: `${(count / max) * 64}px`,
                        minHeight: count > 0 ? '4px' : '2px',
                        background: count > 0 ? 'var(--blue)' : 'var(--navy-lighter)',
                        opacity: count > 0 ? 0.7 : 0.3,
                      }}
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {['日','一','二','三','四','五','六'][new Date(Date.now() - (6-i)*86400000).getDay()]}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <button onClick={logout} className="w-full py-3 rounded-2xl border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--red)] hover:border-[var(--red)]/30 transition-colors">
            登出
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal
          studentId={id}
          defaultSymbol={lastSymbol}
          defaultMarket={lastMarket}
          onClose={(saved) => {
            setShowTradeModal(false);
            if (saved) { 
              setJustSaved(true); 
              setToast({ message: '交易已記錄！', type: 'success' });
              setTimeout(() => setJustSaved(false), 1200); 
            }
            loadData();
          }}
        />
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <QuestionModal studentId={id} studentName={student?.name || ''} onClose={() => { setShowQuestionModal(false); loadData(); }} />
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass z-40">
        <div className="flex max-w-lg mx-auto">
          {([
            { tab: 'home' as const, icon: <HomeIcon className="w-6 h-6" />, label: '首頁' },
            { tab: 'record' as const, icon: <PencilIcon className="w-6 h-6" />, label: '紀錄' },
            { tab: 'ask' as const, icon: <ChatIcon className="w-6 h-6" />, label: '想法' },
            { tab: 'me' as const, icon: <UserIcon className="w-6 h-6" />, label: '我的' },
          ]).map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${activeTab === item.tab ? 'text-[var(--blue)]' : 'text-[var(--text-tertiary)]'}`}>
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Trade Modal — low friction, smart defaults ───
function TradeModal({ studentId, defaultSymbol, defaultMarket, onClose }: {
  studentId: string; defaultSymbol: string; defaultMarket: 'US' | 'TW';
  onClose: (saved?: boolean) => void;
}) {
  const [tab, setTab] = useState<'screenshot' | 'manual'>('manual');
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{ symbol: string; action: string; price: string; shares: string; date: string; market: string } | null>(null);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [shares, setShares] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [market, setMarket] = useState<'US' | 'TW'>(defaultMarket);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [symbolValid, setSymbolValid] = useState<boolean | null>(null);
  const [stockName, setStockName] = useState('');
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null);

  async function fetchStockPrice(symbolOverride?: string) {
    const targetSymbol = symbolOverride || symbol;
    if (!targetSymbol || targetSymbol.length < 1) return;
    setPriceLoading(true);
    setSymbolValid(null); // Reset validation state
    try {
      const res = await fetch(`/api/stock-price?symbol=${targetSymbol.toUpperCase()}`);
      const data = await res.json();
      if (data.valid) {
        setSymbolValid(true);
        setStockName(data.name || '');
        setPriceChange(data.change || null);
        setPriceChangePercent(data.changesPercentage || null);
        // Auto-fill price when we get valid data
        // (Always fill when quick button clicked, or when input field is empty)
        if (data.price && (symbolOverride || !price)) {
          setPrice(data.price.toFixed(2));
        }
      } else {
        setSymbolValid(false);
        setStockName('');
        setPriceChange(null);
        setPriceChangePercent(null);
      }
    } catch {
      setSymbolValid(null);
      setStockName('');
    } finally {
      setPriceLoading(false);
    }
  }

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
        if (t.symbol) setSymbol(t.symbol); if (t.action) setAction(t.action); if (t.price) setPrice(t.price);
        if (t.shares) setShares(t.shares); if (t.date) setDate(t.date.replace(/\//g, '-')); if (t.market) setMarket(t.market);
      }
      setOcrProgress(100);
    } catch { setOcrText('辨識失敗，請手動輸入'); }
    finally { setOcrProcessing(false); }
  }

  async function handleSave() {
    if (!symbol || !price || !shares || !date) return;
    setSaving(true);
    try {
      const response = await fetch('/api/trades', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, symbol: symbol.toUpperCase(), market, action, price: Number(price), shares: Number(shares), date, note }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: '儲存失敗' }));
        alert(error.error || '儲存失敗，請重試');
        return;
      }
      setSuccess(true);
      setTimeout(() => onClose(true), 800);
    } catch (err) {
      console.error('Save trade error:', err);
      alert('網路錯誤，請檢查連線後重試');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 overlay-bg flex items-end md:items-center justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--navy-light)] rounded-t-3xl md:rounded-3xl animate-slide-up">
        {success ? (
          <div className="p-10 text-center">
            <svg className="w-12 h-12 mx-auto text-green-400 check-appear mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base text-[var(--text-secondary)]">已記錄</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold">今天交易了什麼？</h2>
              <button onClick={() => onClose()}><XIcon className="w-5 h-5 text-[var(--text-tertiary)]" /></button>
            </div>
            <div className="flex px-5 pt-4 gap-2">
              {(['manual', 'screenshot'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-[var(--blue-soft)] text-[var(--blue)]' : 'text-[var(--text-tertiary)]'}`}>
                  {t === 'manual' ? '手動輸入' : '截圖上傳'}
                </button>
              ))}
            </div>
            <div className="px-5 pb-6 pt-3">
              {tab === 'screenshot' && !parsedResult && (
                <label className="block border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--blue)]/50 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {ocrProcessing ? (
                    <div>
                      <div className="w-full bg-[var(--navy-lighter)] rounded-full h-1.5 mb-3">
                        <div className="bg-[var(--blue)] h-1.5 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
                      </div>
                      <p className="text-sm text-[var(--text-tertiary)]">正在辨識... {Math.round(ocrProgress)}%</p>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
                      <p className="text-sm text-[var(--text-tertiary)]">上傳交易截圖</p>
                    </>
                  )}
                </label>
              )}
              {(tab === 'manual' || parsedResult) && (
                <div className="space-y-3">
                  {parsedResult && ocrText && (
                    <div className="p-3 rounded-xl bg-[var(--navy-lighter)] text-xs text-[var(--text-tertiary)] mb-2">
                      <p className="line-clamp-2">{ocrText}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input 
                          placeholder="代號 (如 AAPL)" 
                          value={symbol} 
                          onChange={e => {
                            setSymbol(e.target.value.toUpperCase());
                            setSymbolValid(null);
                            setStockName('');
                          }}
                          onBlur={() => symbol && fetchStockPrice()}
                          className={`w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--blue)]/50 focus:outline-none transition-colors ${
                            symbolValid === true ? 'border-green-500/50' : symbolValid === false ? 'border-red-500/50' : 'border-[var(--border)]'
                          }`}
                        />
                        {priceLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <select value={market} onChange={e => setMarket(e.target.value as 'US' | 'TW')}
                        className="px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--blue)]/50 focus:outline-none transition-colors">
                        <option value="US">美股</option>
                        <option value="TW">台股</option>
                      </select>
                    </div>
                    {stockName && (
                      <div className="flex items-center gap-2 px-1">
                        <p className="text-xs text-green-400">✓ {stockName}</p>
                        {priceChange !== null && priceChangePercent !== null && (
                          <span className={`text-xs font-medium flex items-center gap-0.5 ${
                            priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {priceChangePercent >= 0 ? '▲' : '▼'} {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                          </span>
                        )}
                        {priceChange !== null && priceChangePercent === null && (
                          <span className={`text-xs font-medium flex items-center gap-0.5 ${
                            priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {priceChange >= 0 ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                    {symbolValid === false && (
                      <p className="text-xs text-red-400 px-1">找不到此股票代號</p>
                    )}
                    {/* Quick symbol suggestions */}
                    {!symbol && (
                      <div className="space-y-2">
                        <p className="text-xs text-[var(--text-tertiary)] px-1">常用股票：</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(market === 'US' 
                            ? ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN']
                            : ['2330', '2454', '2317', '2412', '2303', '2308']
                          ).map(sym => (
                            <button
                              key={sym}
                              onClick={() => {
                                setSymbol(sym);
                                fetchStockPrice(sym); // ✅ Pass symbol directly to avoid state timing issue
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--navy-lighter)] text-[var(--text-secondary)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-all"
                            >
                              {sym}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex rounded-xl bg-[var(--navy-lighter)] p-1">
                    <button onClick={() => setAction('buy')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${action === 'buy' ? 'bg-green-500/80 text-white' : 'text-[var(--text-tertiary)]'}`}>買入</button>
                    <button onClick={() => setAction('sell')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${action === 'sell' ? 'bg-red-500/80 text-white' : 'text-[var(--text-tertiary)]'}`}>賣出</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="價格" value={price} onChange={e => setPrice(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--blue)]/50 focus:outline-none transition-colors" />
                    <input type="number" placeholder="股數" value={shares} onChange={e => setShares(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--blue)]/50 focus:outline-none transition-colors" />
                  </div>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--blue)]/50 focus:outline-none transition-colors" />
                  <input placeholder="備註（選填）" value={note} onChange={e => setNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--blue)]/50 focus:outline-none transition-colors" />
                  <button onClick={handleSave} disabled={saving || !symbol || !price || !shares}
                    className="w-full py-3.5 rounded-2xl bg-[var(--blue)] text-white font-semibold hover:bg-[var(--blue-light)] transition-all active:scale-[0.98] disabled:opacity-40">
                    {saving ? '記錄中...' : '記錄'}
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

// ─── Question Modal — warm, encouraging ───
function QuestionModal({ studentId, studentName, onClose }: { studentId: string; studentName: string; onClose: () => void }) {
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
    recognition.onresult = (e: any) => { setContent((prev: string) => prev + e.results[0][0].transcript); };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, studentName, content, category }),
      });
      onClose();
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
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold">有什麼想法？</h2>
          <button onClick={onClose}><XIcon className="w-5 h-5 text-[var(--text-tertiary)]" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Quick question templates */}
          {!content && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-tertiary)] px-1">或者選一個快速開始：</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '這支股票現在適合買嗎？',
                  '我該停損嗎？',
                  '如何判斷進場時機？',
                  '這個技術型態是什麼意思？',
                ].map(template => (
                  <button
                    key={template}
                    onClick={() => setContent(template)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-[var(--navy-lighter)] text-[var(--text-secondary)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-all"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="relative">
            <textarea placeholder="寫下你的問題或想法..." value={content} onChange={e => setContent(e.target.value)} rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--blue)]/50 focus:outline-none resize-none transition-colors" />
            <button onClick={startVoice} className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${listening ? 'bg-red-500/80 text-white' : 'text-[var(--text-tertiary)] hover:text-[var(--blue)]'}`}>
              <MicIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${category === c.value ? 'bg-[var(--blue-soft)] text-[var(--blue)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}>
                {c.label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving || !content.trim()}
            className="w-full py-3.5 rounded-2xl bg-[var(--blue)] text-white font-semibold hover:bg-[var(--blue-light)] transition-all active:scale-[0.98] disabled:opacity-40">
            {saving ? '送出中...' : '送出'}
          </button>
        </div>
      </div>
    </div>
  );
}
