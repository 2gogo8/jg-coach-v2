'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CompassIcon, SparklesIcon, TrendUpIcon } from '@/lib/icons';

// 全部 20 個學員資料（靜態，源自操作拆解文件）
const ALL_STUDENTS = [
  { name: "陳治豪", market: "台指期貨", grade: "B+", gradeColor: "text-blue-400", pnl: "+645,276 TWD", positive: true, trades: 106, win_rate: null, style: "微台指波段", highlight: "微台指67筆勝率70.1%，分批建倉+分批了結，1月13筆單月獲利30萬。平均賺16,265、平均賠6,210，風報比1:2.62。", symbols: ["微台期", "旺宏期"] },
  { name: "阿丁", market: "台股個股期貨", grade: "優", gradeColor: "text-green-400", pnl: "+254,218 TWD", positive: true, trades: 139, win_rate: "56%", style: "個股期貨短波段", highlight: "家登17筆100%全勝，大同5筆100%全勝。確定性高就加大口數（家登10口），不確定只做1口試水。賺賠比1.77:1，結構非常健康。", symbols: ["家登 3680", "大同 2371", "宏捷科 8086"] },
  { name: "Finn", market: "台股選擇權", grade: "B+", gradeColor: "text-blue-400", pnl: "+318,924 TWD", positive: true, trades: null, win_rate: "69.6%", style: "主題選股+選擇權", highlight: "PCB供應鏈三劍客（金像電+台燿+凡甲）合計獲利+283,445，佔總獲利89%。金像電668→826(+23.7%)、台燿419→545(+30.1%)，精準卡位AI伺服器超級循環。", symbols: ["金像電 2368", "台燿 6274", "凡甲 3526"] },
  { name: "Emma", market: "台股", grade: "B-", gradeColor: "text-yellow-400", pnl: "+241,813 TWD", positive: true, trades: 204, win_rate: null, style: "高頻零股+融資短打", highlight: "高力(8996)從500元庫存分批出貨至758元，獲利+156,555。力旺(3529)低檔建倉+104,232。兩檔庫存管理貢獻絕大部分獲利。", symbols: ["高力 8996", "力旺 3529", "旭隼 6409"] },
  { name: "張建凱", market: "美國期貨", grade: "中上", gradeColor: "text-blue-300", pnl: "+$16,377 USD", positive: true, trades: 42, win_rate: "83.3%", style: "分批建倉+趨勢持有", highlight: "黃金12口分批建倉(4,151→4,856)持有2個月，分批了結。83.3%高勝率，10/10大跌日分批往下建倉，當日發現不對立即停損，反應快。", symbols: ["微型S&P MES", "那斯達克 MNQ", "黃金 GC"] },
  { name: "JYL", market: "台股", grade: "優", gradeColor: "text-green-400", pnl: "+264,759 TWD", positive: true, trades: 3, win_rate: "100%", style: "波段持股+金字塔出場", highlight: "汎銓(6830)在底部145元買入，三次賣出從320→500→1,000股，金字塔式放大出場量。從$145漲到$298，報酬率+103%。", symbols: ["汎銓 6830"] },
  { name: "WOLF", market: "台股", grade: null, gradeColor: "text-gray-400", pnl: "+1,981,063 TWD", positive: true, trades: null, win_rate: null, style: "台股+選擇權抱單", highlight: "4筆大波段合計貢獻+1,981,063 TWD，佔總獲利63%。方向判斷正確時不急著獲利了結，讓利潤充分奔跑，是期貨交易中最稀缺的能力。", symbols: ["金寶 2312", "華泰 2329", "台股CALL"] },
  { name: "洪嘉駿", market: "台指期貨", grade: null, gradeColor: "text-gray-400", pnl: "+230,000 TWD（估）", positive: true, trades: null, win_rate: "31%", style: "低勝率趨勢跟隨", highlight: "31%勝率下仍能獲利+23萬，靠的是：虧損時砍得快（平均虧70點），獲利時抱得住（平均贏178點）。風報比健康，賺的比虧的多3倍。", symbols: ["台指期 TX"] },
  { name: "YC Chang", market: "美股/台股", grade: "B+", gradeColor: "text-blue-400", pnl: null, positive: true, trades: 41, win_rate: null, style: "主題選股+波段", highlight: "選股集中量子計算（IONQ）、核能（OKLO）、AI醫療（TEM）等前沿主題，方向判斷有前瞻性。賣出策略執行力強，能在相對高點分批了結。", symbols: ["IONQ", "OKLO", "TEM"] },
  { name: "林俊樺", market: "美股+選擇權", grade: null, gradeColor: "text-gray-400", pnl: null, positive: true, trades: 541, win_rate: "43%", style: "Covered Call策略", highlight: "善用Covered Call策略持續收取權利金降低持股成本，機構投資者常用策略，散戶中能熟練運用者非常少。以ONDS為例，持有現股同時賣出CALL每月收取權利金。", symbols: ["ONDS", "RKLB", "GRAB", "CRSP"] },
  { name: "張毅", market: "美股", grade: null, gradeColor: "text-gray-400", pnl: "+$748 USD", positive: true, trades: 63, win_rate: null, style: "主題佈局+分批建倉", highlight: "選股圍繞國防主題（AVAV無人機+RTX導彈+CACI IT），產業鏈研究清晰。AVAV分5批從$224到$258建倉，均價$242接近區間中位數。", symbols: ["AVAV", "PLTR", "RTX", "CCJ"] },
  { name: "智澤", market: "台股/期貨", grade: "C+", gradeColor: "text-orange-400", pnl: "+25,633 TWD", positive: true, trades: 118, win_rate: null, style: "趨勢追蹤+題材輪動", highlight: "能快速識別AI、PCB等當下熱門題材並跟上輪動節奏。部分順勢交易執行得不錯，方向感存在，需要加強風控紀律。", symbols: ["台股AI概念股", "PCB族群"] },
  { name: "莊佳縉", market: "美國期貨", grade: null, gradeColor: "text-gray-400", pnl: null, positive: true, trades: 300, win_rate: null, style: "高頻當沖", highlight: "操作以1口微型白銀為主，意識地控制單筆曝險。在順勢時段能抓到不錯利潤，特定時段的方向感存在。主要問題是手續費侵蝕獲利。", symbols: ["微型白銀 SIL", "微型黃金 MGC"] },
  { name: "張安泰", market: "台指期貨", grade: null, gradeColor: "text-gray-400", pnl: null, positive: true, trades: null, win_rate: null, style: "波段+分批建倉", highlight: "12/22在微台期28,324建倉，持有到1/6-1/7在30,339出場，賺取約2,000點大波段。先用小型ETF期貨練習再轉做微台期，循序漸進。", symbols: ["台指期 TX", "微台期 MXF"] },
  { name: "陳致維", market: "台股個股期貨", grade: "有天賦", gradeColor: "text-green-300", pnl: "+645,276 TWD", positive: true, trades: null, win_rate: "54.7%", style: "個股期貨趨勢交易", highlight: "風報比達1:2.62，即使勝率54.7%仍大幅獲利。67筆微台指勝率70.1%，分批建倉+分批了結紀律清晰。選股集中面板、半導體、電子零組件。", symbols: ["旺宏期 DIF", "康舒期 KFF"] },
  { name: "IVERSON", market: "美股", grade: null, gradeColor: "text-gray-400", pnl: null, positive: true, trades: null, win_rate: null, style: "小額分散布局", highlight: "每筆交易控制在$300-1,300 USD，不單筆重壓。即使判斷錯誤單筆虧損有限。分批建倉節奏有一定控制力，需要建立停損機制。", symbols: ["UUUU", "GRAB", "SMR"] },
  { name: "黃博裕", market: "美股", grade: null, gradeColor: "text-gray-400", pnl: null, positive: true, trades: null, win_rate: null, style: "美股波段", highlight: "TSLA和RKLB都有執行停損（-6.7%），停損紀律存在。CRSP從$46.41漲到$61(+30%)時有識別到獲利機會，選股嗅覺不差。", symbols: ["TSLA", "RKLB", "CRSP"] },
  { name: "黃蔚凱", market: "美股", grade: null, gradeColor: "text-gray-400", pnl: null, positive: true, trades: null, win_rate: null, style: "短線快進快出", highlight: "HOLO、CRSP、MP等短線操作，能在獲利10-20%時果斷出場，不貪心。EOSE停損雖然出場偏晚，但至少沒有繼續死抱。", symbols: ["HOLO", "HIMS", "CRWD", "PLTR"] },
  { name: "Paul", market: "台指期貨", grade: "C+", gradeColor: "text-orange-400", pnl: "-90,484 TWD", positive: false, trades: 103, win_rate: "33%", style: "偏空波段", highlight: "最好的波段單：9/26買入微台@25,600→11/10賣@27,323，持倉45天獲利+17,230。在正確方向上有耐心抱單的能力是存在的，問題在逆勢做空被軋時未及時停損。", symbols: ["微台期 MXF", "小台期 MTX"] },
  { name: "雷克斯", market: "台指期貨", grade: "C", gradeColor: "text-red-400", pnl: "-213,792 TWD", positive: false, trades: null, win_rate: null, style: "多空雙做", highlight: "台指從18,400漲到23,500的大多頭行情中，587口累積+801,694的獲利。4-6月244口+294,686，在趨勢初期就已正確建立多頭部位，方向判斷能力真實存在。", symbols: ["台指期 TX", "台指CALL", "台指PUT"] },
];

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

      {/* Full Student Showcase Section */}
      <section className="px-4 pb-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-red-600/20 text-red-400 px-4 py-1 rounded-full text-sm mb-3 border border-red-600/30">
            20位戰友 · 真實對帳單
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">操作拆解總覽</h2>
          <p className="text-gray-500 text-sm">JG 親自審閱每位學員的完整交易記錄 · 2025/12 - 2026/03</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ALL_STUDENTS.map((s) => (
            <div key={s.name} className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden hover:border-[#444] transition-colors">
              {/* Header */}
              <div className="p-4 border-b border-[#222]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{s.name}</span>
                      {s.grade && (
                        <span className={`text-xs font-bold ${s.gradeColor} bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333]`}>
                          {s.grade}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]">{s.market}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]">{s.style}</span>
                    </div>
                  </div>
                  {s.pnl && (
                    <div className="text-right ml-2">
                      <div className={`text-base font-bold ${s.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {s.pnl}
                      </div>
                      <div className="text-xs text-gray-600">淨損益</div>
                    </div>
                  )}
                </div>
              </div>
              {/* Stats */}
              <div className="flex divide-x divide-[#222] border-b border-[#222] bg-[#0d0d0d]">
                <div className="flex-1 p-2.5 text-center">
                  <div className="text-sm font-bold text-white">{s.trades ?? '—'}</div>
                  <div className="text-xs text-gray-600">筆數</div>
                </div>
                <div className="flex-1 p-2.5 text-center">
                  <div className={`text-sm font-bold ${s.win_rate ? 'text-blue-400' : 'text-gray-600'}`}>{s.win_rate ?? '—'}</div>
                  <div className="text-xs text-gray-600">勝率</div>
                </div>
                <div className="flex-1 p-2.5 text-center">
                  {s.symbols.slice(0, 1).map(sym => (
                    <div key={sym} className="text-xs text-gray-400 truncate">{sym}</div>
                  ))}
                  <div className="text-xs text-gray-600">代表標的</div>
                </div>
              </div>
              {/* Highlight */}
              <div className="p-4">
                <div className="flex gap-1.5">
                  <span className="text-yellow-400 text-xs mt-0.5 flex-shrink-0">✦</span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {s.highlight.length > 120 ? s.highlight.slice(0, 120) + '…' : s.highlight}
                  </p>
                </div>
              </div>
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
