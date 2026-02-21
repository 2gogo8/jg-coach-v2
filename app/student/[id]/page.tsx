'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, logout } from '@/lib/auth';
import {
  CameraIcon, ChatIcon, SearchIcon, ChartIcon,
  HomeIcon, PencilIcon, UserIcon, FireIcon,
  ChevronDownIcon, ChevronUpIcon, XIcon, UploadIcon, MicIcon,
} from '@/lib/icons';

interface Student { id: string; name: string; }
interface Trade { id: string; symbol: string; market: string; action: string; price: number; shares: number; date: string; note?: string; createdAt: string; }
interface Question { id: string; content: string; category: string; answer?: string; answeredBy?: string; createdAt: string; }
interface WeeklyDir { content: string; weekStart: string; }

type BottomTab = 'home' | 'record' | 'ask' | 'me';

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

  const loadData = useCallback(async () => {
    try {
      const [sRes, tRes, qRes, dRes] = await Promise.all([
        fetch(`/api/students/${id}`),
        fetch(`/api/trades?studentId=${id}`),
        fetch(`/api/questions?studentId=${id}`),
        fetch('/api/weekly-direction'),
      ]);
      if (sRes.ok) setStudent(await sRes.json());
      if (tRes.ok) setTrades(await tRes.json());
      if (qRes.ok) setQuestions(await qRes.json());
      if (dRes.ok) { const d = await dRes.json(); if (d) setDirection(d); }
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth.role) { router.replace('/auth'); return; }
    loadData();
  }, [router, loadData]);

  // Streak calculation
  const streak = (() => {
    if (trades.length === 0) return 0;
    const dates = [...new Set(trades.map(t => t.date))].sort().reverse();
    let count = 1;
    for (let i = 1; i < dates.length; i++) {
      const d1 = new Date(dates[i - 1]);
      const d2 = new Date(dates[i]);
      const diff = (d1.getTime() - d2.getTime()) / 86400000;
      if (diff <= 1) count++; else break;
    }
    return count;
  })();

  // Weekly stats
  const weekTrades = trades.filter(t => {
    const d = new Date(t.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    return d >= weekAgo;
  });
  const sells = weekTrades.filter(t => t.action === 'sell');
  const winTrades = sells.filter(t => t.note?.includes('+'));
  const winRate = sells.length > 0 ? Math.round((winTrades.length / sells.length) * 100) : 0;
  const symbolCounts = weekTrades.reduce((acc, t) => { acc[t.symbol] = (acc[t.symbol] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Direction tag
  const dirTag = direction?.content.includes('看多') ? 'bullish' : direction?.content.includes('看空') ? 'bearish' : 'neutral';

  // Activity feed (trades + questions merged)
  const activities = [
    ...trades.map(t => ({ type: 'trade' as const, data: t, time: t.createdAt })),
    ...questions.map(q => ({ type: 'question' as const, data: q, time: q.createdAt })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  if (loading) {
    return (
      <div className="min-h-screen p-4 space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{student?.name || '學員'}</h1>
          <div className="flex items-center gap-1 text-sm text-[var(--amber)]">
            <FireIcon className="w-4 h-4" />
            <span>連續記錄 {streak} 天</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          登出
        </button>
      </div>

      {activeTab === 'home' && (
        <div className="p-4 space-y-4 animate-fade-in">
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
                  }`}>
                    {dirTag === 'bullish' ? '看多' : dirTag === 'bearish' ? '看空' : '觀望'}
                  </span>
                </div>
                {dirExpanded ? <ChevronUpIcon className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDownIcon className="w-4 h-4 text-[var(--text-secondary)]" />}
              </button>
              {dirExpanded && (
                <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{direction.content}</p>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <CameraIcon className="w-6 h-6" />, label: '記錄交易', color: 'text-[var(--blue)]', onClick: () => setShowTradeModal(true) },
              { icon: <ChatIcon className="w-6 h-6" />, label: '提問', color: 'text-[var(--green)]', onClick: () => setShowQuestionModal(true) },
              { icon: <SearchIcon className="w-6 h-6" />, label: '查股票', color: 'text-[var(--amber)]', onClick: () => {} },
              { icon: <ChartIcon className="w-6 h-6" />, label: '我的數據', color: 'text-purple-400', onClick: () => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map((a, i) => (
              <button key={i} onClick={a.onClick} className="glass rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-[var(--blue)] transition-colors">
                <span className={a.color}>{a.icon}</span>
                <span className="text-xs text-[var(--text-secondary)]">{a.label}</span>
              </button>
            ))}
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">活動紀錄</h2>
            <div className="space-y-3">
              {activities.slice(0, 20).map((a, i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  {a.type === 'trade' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            (a.data as Trade).action === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {(a.data as Trade).action === 'buy' ? '買入' : '賣出'}
                          </span>
                          <span className="font-bold">{(a.data as Trade).symbol}</span>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">{(a.data as Trade).date}</span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        ${(a.data as Trade).price} × {(a.data as Trade).shares} 股
                      </div>
                      {(a.data as Trade).note && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-70">{(a.data as Trade).note}</p>
                      )}
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
                  <p>還沒有活動紀錄</p>
                  <p className="text-sm mt-1">開始記錄你的第一筆交易吧！</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div id="stats" className="space-y-3">
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

            {/* Simple bar chart */}
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
                      <div
                        className="w-full rounded-t-md bg-[var(--blue)] transition-all"
                        style={{ height: `${(count / max) * 80}px`, minHeight: count > 0 ? '4px' : '0' }}
                      />
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
            + 新提問
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
        <div className="p-4 animate-fade-in">
          <div className="glass rounded-2xl p-6 text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--blue)] mx-auto mb-3 flex items-center justify-center">
              <UserIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">{student?.name}</h2>
            <div className="flex items-center justify-center gap-1 mt-1 text-sm text-[var(--amber)]">
              <FireIcon className="w-4 h-4" /> 連續記錄 {streak} 天
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold">{trades.length}</div>
              <div className="text-xs text-[var(--text-secondary)]">總交易數</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-xs text-[var(--text-secondary)]">提問數</div>
            </div>
          </div>
          <button onClick={logout} className="w-full py-3 rounded-2xl border border-[var(--border)] text-[var(--red)] hover:bg-red-500/10 transition-colors">
            登出
          </button>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal studentId={id} onClose={() => { setShowTradeModal(false); loadData(); }} />
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
            { tab: 'ask' as const, icon: <ChatIcon className="w-6 h-6" />, label: '提問' },
            { tab: 'me' as const, icon: <UserIcon className="w-6 h-6" />, label: '我的' },
          ]).map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === item.tab ? 'text-[var(--blue)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Trade Modal ───
function TradeModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'screenshot' | 'manual'>('screenshot');
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{ symbol: string; action: string; price: string; shares: string; date: string; market: string } | null>(null);

  // Manual form
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [shares, setShares] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [market, setMarket] = useState<'US' | 'TW'>('US');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleFile(file: File) {
    setOcrProcessing(true);
    setOcrProgress(10);
    try {
      // Dynamic import Tesseract
      const Tesseract = await import('tesseract.js');
      setOcrProgress(30);
      const result = await Tesseract.recognize(file, 'chi_tra+eng', {
        logger: (m: { progress?: number }) => {
          if (m.progress) setOcrProgress(30 + m.progress * 50);
        },
      });
      setOcrProgress(85);
      setOcrText(result.data.text);

      // Parse via API
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: result.data.text }),
      });
      const data = await res.json();
      if (data.trades?.[0]) {
        const t = data.trades[0];
        setParsedResult(t);
        setSymbol(t.symbol);
        if (t.action) setAction(t.action);
        if (t.price) setPrice(t.price);
        if (t.shares) setShares(t.shares);
        if (t.date) setDate(t.date.replace(/\//g, '-'));
        if (t.market) setMarket(t.market);
      }
      setOcrProgress(100);
    } catch (err) {
      console.error('OCR error:', err);
      setOcrText('OCR 辨識失敗，請手動輸入');
    } finally {
      setOcrProcessing(false);
    }
  }

  async function handleSave() {
    if (!symbol || !price || !shares || !date) return;
    setSaving(true);
    try {
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, symbol: symbol.toUpperCase(), market, action, price: Number(price), shares: Number(shares), date, note }),
      });
      setSuccess(true);
      setTimeout(onClose, 1200);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 overlay-bg flex items-end md:items-center justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--navy-light)] rounded-t-3xl md:rounded-3xl animate-slide-up">
        {success ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold">交易已記錄！</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold">記錄交易</h2>
              <button onClick={onClose}><XIcon className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>

            {/* Tabs */}
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
                    {saving ? '儲存中...' : '確認'}
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
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold">提問</h2>
          <button onClick={onClose}><XIcon className="w-5 h-5 text-[var(--text-secondary)]" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <textarea
              placeholder="你的問題是..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--navy-lighter)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--blue)] focus:outline-none resize-none"
            />
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
            {saving ? '送出中...' : '送出提問'}
          </button>
        </div>
      </div>
    </div>
  );
}
