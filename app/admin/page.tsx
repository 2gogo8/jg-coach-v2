'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, logout } from '@/lib/auth';

interface StudentWithAnalytics {
  id: string; name: string; joinDate: string; experience: string; style: string; goal: string; tags: string[];
  analytics: { totalTrades: number; buys: number; sells: number; symbols: string[]; questionCount: number; needsHelp: string[] };
}
interface Question { id: string; studentId: string; studentName: string; content: string; category: string; answer?: string; createdAt: string; }
interface Insight { id: string; content: string; tickers: string[]; category?: string; createdAt: string; }
interface StockStat { symbol: string; count: number; lastQueried: string; }

type Tab = 'publish' | 'students' | 'questions' | 'stats';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('publish');
  const [students, setStudents] = useState<StudentWithAnalytics[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stockStats, setStockStats] = useState<StockStat[]>([]);
  const [trades, setTrades] = useState<{ id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Publish form
  const [dirContent, setDirContent] = useState('');
  const [insightContent, setInsightContent] = useState('');

  // Question reply
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Student expand
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const auth = getAuth();
    if (auth.role !== 'admin') { router.replace('/auth'); return; }
    loadAll();
  }, [router]);

  async function loadAll() {
    setLoading(true);
    try {
      const [sRes, qRes, iRes, ssRes, tRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/questions?unanswered=1'),
        fetch('/api/insights'),
        fetch('/api/admin/stock-stats'),
        fetch('/api/trades'),
      ]);
      if (sRes.ok) setStudents(await sRes.json());
      if (qRes.ok) setQuestions(await qRes.json());
      if (iRes.ok) setInsights(await iRes.json());
      if (ssRes.ok) { const d = await ssRes.json(); setStockStats(d.topStocks || []); }
      if (tRes.ok) setTrades(await tRes.json());
    } finally { setLoading(false); }
  }

  async function publishDirection() {
    if (!dirContent.trim()) return;
    await fetch('/api/weekly-direction', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: dirContent }),
    });
    setDirContent('');
    alert('已發佈！');
  }

  async function publishInsight() {
    if (!insightContent.trim()) return;
    await fetch('/api/insights', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: insightContent }),
    });
    setInsightContent('');
    loadAll();
  }

  async function answerQuestion(qId: string) {
    if (!replyText.trim()) return;
    await fetch(`/api/questions/${qId}/answer`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: replyText, by: 'jg' }),
    });
    setReplyingId(null);
    setReplyText('');
    loadAll();
  }

  const activeToday = new Set(trades.filter(t => {
    const d = new Date((t as unknown as { createdAt: string }).createdAt);
    return d.toDateString() === new Date().toDateString();
  }).map(t => (t as unknown as { studentId: string }).studentId)).size;

  const filteredStudents = students.filter(s =>
    s.name.includes(searchQuery) || s.tags.some(t => t.includes(searchQuery)) || s.style.includes(searchQuery)
  );

  if (loading) {
    return <div className="min-h-screen p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">JG 教練後台</h1>
        <button onClick={logout} className="text-sm text-[var(--text-secondary)]">登出</button>
      </div>

      {/* Overview Cards */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="text-2xl font-bold text-[var(--blue)]">{students.length}</div>
          <div className="text-xs text-[var(--text-secondary)]">總學員</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-2xl font-bold text-[var(--green)]">{activeToday}</div>
          <div className="text-xs text-[var(--text-secondary)]">今日活躍</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-2xl font-bold text-[var(--amber)]">{questions.length}</div>
          <div className="text-xs text-[var(--text-secondary)]">待回覆</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-2xl font-bold text-purple-400">{trades.length}</div>
          <div className="text-xs text-[var(--text-secondary)]">總交易</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-1 overflow-x-auto">
        {([
          { key: 'publish' as const, label: '發佈' },
          { key: 'students' as const, label: '學生' },
          { key: 'questions' as const, label: '問題' },
          { key: 'stats' as const, label: '統計' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-[var(--blue)] text-white' : 'bg-[var(--navy-lighter)] text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Publish Tab */}
        {tab === 'publish' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold mb-3">每週方向</h3>
              <textarea
                placeholder="本週看多/看空/觀望..."
                value={dirContent}
                onChange={e => setDirContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none resize-none"
              />
              <button onClick={publishDirection} className="mt-3 px-6 py-2.5 rounded-xl bg-[var(--blue)] text-white font-medium hover:bg-[var(--blue-light)] transition-colors">
                發佈方向
              </button>
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold mb-3">快速洞察</h3>
              <textarea
                placeholder="盤前/盤中/收盤/教學筆記..."
                value={insightContent}
                onChange={e => setInsightContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none resize-none"
              />
              <button onClick={publishInsight} className="mt-3 px-6 py-2.5 rounded-xl bg-[var(--amber)] text-[var(--navy)] font-medium hover:bg-[var(--amber-light)] transition-colors">
                發佈洞察
              </button>
            </div>
            {/* Recent insights */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-[var(--text-secondary)]">最近洞察</h3>
              <div className="space-y-2">
                {insights.slice(0, 5).map(ins => (
                  <div key={ins.id} className="glass rounded-xl p-3">
                    <p className="text-sm">{ins.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {ins.tickers.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{t}</span>
                      ))}
                      <span className="text-xs text-[var(--text-secondary)] ml-auto">{new Date(ins.createdAt).toLocaleString('zh-TW')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {tab === 'students' && (
          <div className="space-y-3 animate-fade-in">
            <input
              placeholder="搜尋學生..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none"
            />
            {filteredStudents.map(s => (
              <div key={s.id} className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedStudent(expandedStudent === s.id ? null : s.id)} className="w-full p-4 text-left flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{s.style} · {s.experience} · {s.analytics.totalTrades} 筆交易</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.analytics.needsHelp.length > 0 && <span className="w-2 h-2 rounded-full bg-[var(--amber)]" />}
                    <span className="text-xs text-[var(--text-secondary)]">{s.analytics.totalTrades}</span>
                  </div>
                </button>
                {expandedStudent === s.id && (
                  <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-2">
                    <div className="text-sm"><span className="text-[var(--text-secondary)]">目標：</span>{s.goal || '-'}</div>
                    <div className="text-sm"><span className="text-[var(--text-secondary)]">標籤：</span>{s.tags.join(', ') || '-'}</div>
                    <div className="text-sm"><span className="text-[var(--text-secondary)]">交易：</span>{s.analytics.buys} 買 / {s.analytics.sells} 賣</div>
                    <div className="text-sm"><span className="text-[var(--text-secondary)]">股票：</span>{s.analytics.symbols.join(', ')}</div>
                    <div className="text-sm"><span className="text-[var(--text-secondary)]">提問：</span>{s.analytics.questionCount} 題</div>
                    {s.analytics.needsHelp.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.analytics.needsHelp.map((h, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Questions Tab */}
        {tab === 'questions' && (
          <div className="space-y-3 animate-fade-in">
            {questions.length === 0 && <p className="text-center text-[var(--text-secondary)] py-8">沒有待回覆的問題</p>}
            {questions.map(q => (
              <div key={q.id} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">{q.studentName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{q.category}</span>
                  <span className="text-xs text-[var(--text-secondary)] ml-auto">{new Date(q.createdAt).toLocaleString('zh-TW')}</span>
                </div>
                <p className="text-sm mb-3">{q.content}</p>
                {replyingId === q.id ? (
                  <div className="space-y-2">
                    <textarea
                      placeholder="輸入回覆..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--navy-lighter)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => answerQuestion(q.id)} className="px-4 py-2 rounded-xl bg-[var(--blue)] text-white text-sm font-medium">送出</button>
                      <button onClick={() => { setReplyingId(null); setReplyText(''); }} className="px-4 py-2 rounded-xl bg-[var(--navy-lighter)] text-[var(--text-secondary)] text-sm">取消</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplyingId(q.id)} className="text-sm text-[var(--blue)] hover:underline">回覆</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold mb-3">熱門查詢股票</h3>
              <div className="space-y-2">
                {stockStats.slice(0, 10).map((s, i) => (
                  <div key={s.symbol} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--text-secondary)] w-4">{i + 1}</span>
                    <span className="font-medium flex-1">{s.symbol}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-[var(--navy-lighter)]">
                        <div className="h-2 rounded-full bg-[var(--blue)]" style={{ width: `${(s.count / (stockStats[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] w-8 text-right">{s.count}</span>
                  </div>
                ))}
                {stockStats.length === 0 && <p className="text-sm text-[var(--text-secondary)]">尚無查詢紀錄</p>}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold mb-3">學員交易統計</h3>
              <div className="space-y-2">
                {students.sort((a, b) => b.analytics.totalTrades - a.analytics.totalTrades).slice(0, 10).map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-sm flex-1">{s.name}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-[var(--navy-lighter)]">
                        <div className="h-2 rounded-full bg-[var(--amber)]" style={{ width: `${(s.analytics.totalTrades / (students[0]?.analytics.totalTrades || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] w-8 text-right">{s.analytics.totalTrades}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
