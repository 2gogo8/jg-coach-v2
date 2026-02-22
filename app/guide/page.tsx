'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CameraIcon,
  ChatIcon,
  CompassIcon,
  SparklesIcon,
  TrendUpIcon,
  FireIcon,
  ChartIcon,
  XIcon,
} from '@/lib/icons';

export default function GuidePage() {
  const router = useRouter();

  const sections = [
    {
      icon: <CameraIcon className="w-8 h-8 text-[var(--blue)]" />,
      title: '記錄交易',
      desc: '養成紀律的第一步。拍照上傳交易截圖，AI 自動辨識；或手動輸入，快速記錄每筆操作。',
      tips: '💡 常用股票快選功能，讓你秒速記錄',
    },
    {
      icon: <ChatIcon className="w-8 h-8 text-[var(--green)]" />,
      title: '提問',
      desc: '遇到困惑？隨時問 JG。在提問頁面或首頁快捷按鈕都能提問，還支援語音輸入和快速模板。',
      tips: '💡 每次交易後都可以問「這樣做對嗎？」',
    },
    {
      icon: <CompassIcon className="w-8 h-8 text-[var(--amber)]" />,
      title: 'JG 每週方向',
      desc: '首頁會顯示 JG 本週對市場的看法，給你交易的大方向參考，讓你不再迷茫。',
      tips: '💡 看多/看空/觀望，跟著大方向走',
    },
    {
      icon: <SparklesIcon className="w-8 h-8 text-blue-400]" />,
      title: 'AI 分析',
      desc: '記錄交易後，AI 會立即給你建議和提醒。幫你發現盲點、優化策略。',
      tips: '💡 AI 24/7 在線，隨時給你第二個意見',
    },
    {
      icon: <FireIcon className="w-8 h-8 text-orange-400" />,
      title: '成長系統',
      desc: '每筆交易賺取 XP，升級解鎖徽章。連續登入累積 Streak，見證自己的堅持。',
      tips: '💡 持續記錄就是最大的成長',
    },
    {
      icon: <TrendUpIcon className="w-8 h-8 text-purple-400" />,
      title: '社群互動',
      desc: '看看其他同學都在問什麼、交易什麼。從社群問答中學習，在排行榜上激勵自己。',
      tips: '💡 一起進步，比一個人走得更遠',
    },
    {
      icon: <ChartIcon className="w-8 h-8 text-cyan-400" />,
      title: '市場資訊',
      desc: '首頁即時顯示 S&P 500、Nasdaq、道瓊指數走勢，掌握大盤脈動。',
      tips: '💡 盤前看一眼，心裡有個底',
    },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-5 py-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">如何使用 JG 實驗室</h1>
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-[var(--navy-lighter)] rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
          </button>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          你的專屬交易成長空間 — 從記錄到提問，從分析到進步
        </p>
      </div>

      {/* Welcome Message */}
      <div className="px-5 mb-8">
        <div className="glass rounded-2xl p-6 bg-gradient-to-br from-[var(--blue-soft)] to-[var(--navy-lighter)] border border-[var(--blue)]/20">
          <div className="flex items-start gap-3">
            <span className="text-3xl">👋</span>
            <div>
              <h2 className="text-lg font-bold mb-2 text-[var(--blue-light)]">歡迎！</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                JG 實驗室不只是交易記錄工具，更是你的成長夥伴。
                我們相信，持續記錄、勇於提問、保持反思，就能在交易路上走得更穩。
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                下面是平台的主要功能，花 2 分鐘了解一下，馬上就能開始使用！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-5 space-y-4">
        {sections.map((section, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5 animate-fade-in hover:bg-[var(--navy-lighter)] transition-all"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--navy-lighter)] to-[var(--navy-light)] flex items-center justify-center border border-[var(--border)]">
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{section.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                  {section.desc}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] bg-[var(--navy-lighter)] rounded-lg px-3 py-2 inline-block">
                  {section.tips}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="px-5 mt-8">
        <div className="glass rounded-2xl p-5 border border-[var(--amber)]/20 bg-[var(--amber-soft)]">
          <h3 className="text-sm font-bold text-[var(--amber)] mb-3">🎯 新手小提醒</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--amber)] flex-shrink-0">•</span>
              <span>建議每次交易後立即記錄，趁記憶最新鮮</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--amber)] flex-shrink-0">•</span>
              <span>遇到困惑就問，不要累積問題</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--amber)] flex-shrink-0">•</span>
              <span>每週看一次「我的」頁面，追蹤自己的成長軌跡</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--amber)] flex-shrink-0">•</span>
              <span>社群問答是寶藏，別人的問題可能也是你的問題</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-5 mt-8">
        <Link
          href="/"
          className="block w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--blue)] to-blue-600 text-white text-center font-bold text-lg hover:from-[var(--blue-light)] hover:to-blue-500 transition-all active:scale-[0.98] shadow-lg shadow-[var(--blue)]/20"
        >
          開始使用 →
        </Link>
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
          隨時可以回來查看這份導覽
        </p>
      </div>

      {/* Footer Spacing */}
      <div className="h-8" />
    </div>
  );
}
