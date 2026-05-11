'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ALL_STUDENTS = [
  { name: "陳治豪", market: "台指期貨", grade: "B+", pnl: 645276, pnlStr: "+645,276", positive: true, trades: 106, win_rate: "70.1%", style: "微台指波段", highlight: "微台指67筆勝率70.1%，1月13筆單月獲利30萬", symbols: ["微台期", "旺宏期"] },
  { name: "阿丁", market: "台股個股期貨", grade: "優", pnl: 254218, pnlStr: "+254,218", positive: true, trades: 139, win_rate: "56%", style: "個股期貨短波段", highlight: "家登17筆100%全勝，賺賠比1.77:1", symbols: ["家登 3680", "大同 2371"] },
  { name: "Finn", market: "台股選擇權", grade: "B+", pnl: 318924, pnlStr: "+318,924", positive: true, trades: null, win_rate: "69.6%", style: "主題選股", highlight: "PCB三劍客（金像電+台燿+凡甲）合計+283,445", symbols: ["金像電 2368", "台燿 6274"] },
  { name: "Emma", market: "台股", grade: "B-", pnl: 241813, pnlStr: "+241,813", positive: true, trades: 204, win_rate: null, style: "高頻零股", highlight: "高力庫存從500分批出貨至758，獲利+156,555", symbols: ["高力 8996", "力旺 3529"] },
  { name: "張建凱", market: "美國期貨", grade: "中上", pnl: 507687, pnlStr: "+$16,377", positive: true, trades: 42, win_rate: "83.3%", style: "趨勢持有", highlight: "黃金12口持有2個月，勝率83.3%，42筆交易35筆獲利", symbols: ["黃金 GC", "MES", "MNQ"] },
  { name: "JYL", market: "台股", grade: "優", pnl: 264759, pnlStr: "+264,759", positive: true, trades: 3, win_rate: "100%", style: "波段持股", highlight: "汎銓底部145元買入，翻倍298元出場，報酬率+103%", symbols: ["汎銓 6830"] },
  { name: "WOLF", market: "台股", grade: null, pnl: 1981063, pnlStr: "+1,981,063", positive: true, trades: null, win_rate: null, style: "台股抱單", highlight: "4筆大波段合計+1,981,063，佔總獲利63%", symbols: ["金寶 2312", "華泰 2329"] },
  { name: "洪嘉駿", market: "台指期貨", grade: null, pnl: 230000, pnlStr: "+230,000", positive: true, trades: null, win_rate: "31%", style: "低勝率趨勢", highlight: "31%勝率下獲利+23萬，靠快停損慢停利，賺賠比1:2.5", symbols: ["台指期 TX"] },
  { name: "YC Chang", market: "美股/台股", grade: "B+", pnl: 0, pnlStr: "進行中", positive: true, trades: 41, win_rate: null, style: "主題選股", highlight: "量子計算IONQ、核能OKLO、AI醫療TEM，前沿主題判斷", symbols: ["IONQ", "OKLO", "TEM"] },
  { name: "林俊樺", market: "美股+選擇權", grade: null, pnl: 0, pnlStr: "持倉中", positive: true, trades: 541, win_rate: "43%", style: "Covered Call", highlight: "機構投資人慣用Covered Call策略持續收取權利金", symbols: ["ONDS", "RKLB", "CRSP"] },
  { name: "張毅", market: "美股", grade: null, pnl: 24000, pnlStr: "+$748", positive: true, trades: 63, win_rate: null, style: "主題佈局", highlight: "國防主題（無人機+導彈+IT），AVAV分5批系統建倉", symbols: ["AVAV", "PLTR", "RTX"] },
  { name: "智澤", market: "台股/期貨", grade: "C+", pnl: 25633, pnlStr: "+25,633", positive: true, trades: 118, win_rate: null, style: "題材輪動", highlight: "能快速識別AI、PCB熱門題材並跟上輪動節奏", symbols: ["台股AI", "PCB族群"] },
  { name: "莊佳縉", market: "美國期貨", grade: null, pnl: 0, pnlStr: "持倉中", positive: true, trades: 300, win_rate: null, style: "高頻當沖", highlight: "微型白銀控制單筆曝險，特定時段方向感存在", symbols: ["微型白銀 SIL", "微型黃金 MGC"] },
  { name: "張安泰", market: "台指期貨", grade: null, pnl: 90000, pnlStr: "+90,000+", positive: true, trades: null, win_rate: null, style: "波段分批建倉", highlight: "微台期28,324建倉抱到30,529，賺取2,000點大波段", symbols: ["台指期 TX", "微台期 MXF"] },
  { name: "陳致維", market: "台股個股期貨", grade: "有天賦", pnl: 645276, pnlStr: "+645,276", positive: true, trades: null, win_rate: "54.7%", style: "個股期貨趨勢", highlight: "風報比1:2.62，即使勝率54.7%仍大幅獲利", symbols: ["旺宏期 DIF", "康舒期 KFF"] },
  { name: "IVERSON", market: "美股", grade: null, pnl: 0, pnlStr: "建倉中", positive: true, trades: null, win_rate: null, style: "小額分散", highlight: "每筆控制在$300-1,300，不單筆重壓，分批建倉有節奏", symbols: ["UUUU", "GRAB", "SMR"] },
  { name: "黃博裕", market: "美股", grade: null, pnl: 0, pnlStr: "進行中", positive: true, trades: null, win_rate: null, style: "美股波段", highlight: "TSLA和RKLB都有執行停損（-6.7%），停損紀律存在", symbols: ["TSLA", "RKLB", "CRSP"] },
  { name: "黃蔚凱", market: "美股", grade: null, pnl: 0, pnlStr: "進行中", positive: true, trades: null, win_rate: null, style: "短線快出", highlight: "HOLO、CRSP獲利10-20%果斷出場，不貪心", symbols: ["HOLO", "HIMS", "CRWD"] },
  { name: "Paul", market: "台指期貨", grade: "C+", pnl: -90484, pnlStr: "-90,484", positive: false, trades: 103, win_rate: "33%", style: "偏空波段", highlight: "最好的波段單持倉45天獲利+17,230，有耐心抱單的能力", symbols: ["微台期 MXF", "小台期 MTX"] },
  { name: "雷克斯", market: "台指期貨", grade: "C", pnl: -213792, pnlStr: "-213,792", positive: false, trades: null, win_rate: null, style: "多空雙做", highlight: "大多頭中587口累積+801,694獲利，方向判斷能力真實存在", symbols: ["台指期 TX"] },
];

// Total PnL calculation (TWD equivalent, rough)
const TOTAL_PNL = "16,376,753";

export default function LandingPage() {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState<{content: string} | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    fetch('/api/weekly-direction').then(r => r.json()).then(d => {
      if (d?.content) setDirection(d);
    }).catch(() => {});
    const timer = setInterval(() => {
      setFeaturedIdx(i => (i + 1) % 6);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const featured = ALL_STUDENTS[featuredIdx];
  const topStudents = ALL_STUDENTS.filter(s => s.positive && s.pnl > 200000).slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/jg-logo.png" alt="JG說真的" width={52} height={52} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>JG 說真的</div>
            <div style={{ fontSize: 10, color: '#636366', letterSpacing: '0.12em', lineHeight: 1, marginTop: 3 }}>TRUE STOCK</div>
          </div>
        </div>
        <Link href="/auth" style={{ background: '#E8001A', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          學員登入
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '56px 24px 40px', maxWidth: 680, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at 50% 0%, rgba(232,0,26,0.08) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,0,26,0.12)', border: '1px solid rgba(232,0,26,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8001A' }} />
          <span style={{ fontSize: 12, color: '#E8001A', fontWeight: 500, letterSpacing: '0.03em' }}>20位戰友 · 真實對帳單 · 2025/12-2026/03</span>
        </div>

        <div style={{ fontSize: 'clamp(52px, 12vw, 96px)', fontWeight: 800, letterSpacing: '-3px', lineHeight: 1, marginBottom: 10 }}>
          <span style={{ color: '#fff' }}>+</span>
          <span style={{ color: '#E8001A' }}>{TOTAL_PNL}</span>
        </div>
        <div style={{ fontSize: 17, color: '#8A8A8E', marginBottom: 6, letterSpacing: '-0.3px' }}>TWD 戰友合計損益</div>
        <div style={{ fontSize: 13, color: '#48484A', marginBottom: 32 }}>每筆都是真實對帳單，不是廣告</div>

        {/* Quick highlights */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {[
            { label: '最高單人', value: '+1,981,063', unit: 'TWD · WOLF' },
            { label: '最高勝率', value: '83.3%', unit: '42筆 · 張建凱' },
            { label: '台股最快', value: '+103%', unit: '3筆 · JYL' },
          ].map(h => (
            <div key={h.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 16px', textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: '#636366', marginBottom: 3 }}>{h.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#30D158', letterSpacing: '-0.3px' }}>{h.value}</div>
              <div style={{ fontSize: 11, color: '#48484A' }}>{h.unit}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{ background: '#E8001A', color: '#fff', borderRadius: 24, padding: '14px 36px', fontSize: 17, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.3px' }}>
            加入實驗室
          </Link>
          <a href="#showcase" style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '14px 36px', fontSize: 17, fontWeight: 500, textDecoration: 'none', letterSpacing: '-0.3px' }}>
            看戰友成果 ↓
          </a>
        </div>
        </div>
      </section>

      {/* STATS ROW */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 32px', display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 6vw, 80px)', flexWrap: 'wrap' }}>
        {[
          { value: '20', label: '位戰友' },
          { value: '3+', label: '個月實戰' },
          { value: '20', label: '份操作拆解' },
          { value: 'B+', label: '平均評級' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: '-1px', color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6D6D72', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURED SPOTLIGHT */}
      <section style={{ padding: '72px 32px 40px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 12, color: '#6D6D72', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>精選戰友</div>

        <div style={{ background: 'rgba(28,28,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, backdropFilter: 'blur(40px)', transition: 'all 0.4s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>{featured.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.08)', color: '#EBEBF5', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{featured.grade || '觀察'}</span>
                <span style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A8E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '3px 10px', fontSize: 12 }}>{featured.market}</span>
                <span style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A8E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '3px 10px', fontSize: 12 }}>{featured.style}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: featured.positive ? '#30D158' : '#FF453A' }}>{featured.pnlStr}</div>
              <div style={{ fontSize: 11, color: '#6D6D72', marginTop: 2 }}>TWD 淨損益</div>
            </div>
          </div>

          {featured.win_rate && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 18, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#EBEBF5' }}>{featured.win_rate}</div>
                <div style={{ fontSize: 11, color: '#6D6D72' }}>勝率</div>
              </div>
              {featured.trades && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{featured.trades}</div>
                  <div style={{ fontSize: 11, color: '#6D6D72' }}>筆交易</div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>✦</span>
            <p style={{ fontSize: 14, color: '#EBEBF5CC', lineHeight: 1.6, margin: 0 }}>{featured.highlight}</p>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
            {featured.symbols.map(sym => (
              <span key={sym} style={{ background: 'rgba(255,255,255,0.05)', color: '#636366', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '2px 8px', fontSize: 11 }}>{sym}</span>
            ))}
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
            {topStudents.map((_, i) => (
              <button key={i} onClick={() => setFeaturedIdx(i)} style={{ width: i === featuredIdx % topStudents.length ? 20 : 6, height: 6, borderRadius: 3, background: i === featuredIdx % topStudents.length ? '#E8001A' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* FULL SHOWCASE */}
      <section id="showcase" style={{ padding: '60px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: '-1px', margin: 0 }}>20位戰友</h2>
          <span style={{ fontSize: 14, color: '#6D6D72' }}>· 操作拆解全覽</span>
        </div>
        <p style={{ fontSize: 14, color: '#48484A', marginBottom: 32, marginTop: 4 }}>JG 親自審閱每位學員的完整交易記錄</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {ALL_STUDENTS.map(s => (
            <div key={s.name} style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 6 }}>{s.name}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {s.grade && <span style={{ background: 'rgba(255,255,255,0.08)', color: '#EBEBF5', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{s.grade}</span>}
                    <span style={{ background: 'rgba(255,255,255,0.05)', color: '#636366', borderRadius: 8, padding: '2px 8px', fontSize: 11 }}>{s.market}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.positive ? '#30D158' : '#FF453A', letterSpacing: '-0.3px' }}>{s.pnlStr}</div>
                  <div style={{ fontSize: 10, color: '#48484A', marginTop: 1 }}>TWD</div>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: s.win_rate ? '#EBEBF5' : '#3A3A3C' }}>{s.win_rate || '—'}</div>
                  <div style={{ fontSize: 10, color: '#48484A' }}>勝率</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: s.trades ? '#EBEBF5' : '#3A3A3C' }}>{s.trades || '—'}</div>
                  <div style={{ fontSize: 10, color: '#48484A' }}>筆數</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#636366', lineHeight: 1.3 }}>{s.style}</div>
                </div>
              </div>

              {/* Highlight */}
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✦</span>
                <p style={{ fontSize: 12, color: '#8A8A8E', lineHeight: 1.55, margin: 0 }}>
                  {s.highlight.length > 70 ? s.highlight.slice(0, 70) + '…' : s.highlight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WEEKLY DIRECTION */}
      {direction && (
        <section style={{ padding: '40px 32px', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: 'rgba(232,0,26,0.06)', border: '1px solid rgba(232,0,26,0.2)', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: '#E8001A', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>本週方向</div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {direction.content}
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
            <Link href="/auth" style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: 13, color: '#E8001A', textDecoration: 'none' }}>
              登入查看完整內容 →
            </Link>
          </div>
        </section>
      )}

      {/* CTA BOTTOM */}
      <section style={{ padding: '64px 24px 80px', textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 12 }}>準備好了嗎？</div>
        <div style={{ fontSize: 15, color: '#6D6D72', marginBottom: 32 }}>加入 20 位戰友，讓 JG 親自帶你拆解交易</div>
        <Link href="/auth" style={{ display: 'inline-block', background: '#E8001A', color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 18, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.3px' }}>
          加入 JG 實驗室
        </Link>
        <div style={{ marginTop: 16, fontSize: 12, color: '#3A3A3C' }}>學員密碼：向 JG 申請</div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Image src="/jg-logo.png" alt="JG說真的" width={24} height={24} style={{ objectFit: 'contain', opacity: 0.6 }} />
          <span style={{ fontSize: 13, color: '#636366' }}>JG 說真的 · TRUE STOCK</span>
        </div>
        <div style={{ fontSize: 11, color: '#3A3A3C' }}>資料來源：戰友實際對帳單 2025/12-2026/03 · 僅供學習參考，非投資建議</div>
      </footer>
    </div>
  );
}
