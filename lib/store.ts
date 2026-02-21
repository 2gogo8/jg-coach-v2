// In-memory store — MVP phase, will migrate to Supabase

export type BadgeId = 'first-trade' | 'streak-7' | 'streak-30' | 'scholar' | 'jg-certified' | 'veteran';

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  joinDate: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  style: string;
  goal: string;
  brokers: string[];
  note: string;
  tags: string[];
  // Gamification
  xp: number;
  level: number;
  badges: BadgeId[];
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface TradeEntry {
  id: string;
  studentId: string;
  symbol: string;
  market: 'US' | 'TW';
  action: 'buy' | 'sell';
  price: number;
  shares: number;
  date: string;
  note?: string;
  imageBase64?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  category: 'strategy' | 'analysis' | 'mindset' | 'technical' | 'other';
  answer?: string;
  answeredBy?: 'jg' | 'ai';
  answeredAt?: string;
  createdAt: string;
}

export interface WeeklyDirection {
  id: string;
  weekStart: string;
  content: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  content: string;
  category?: 'morning' | 'intra-day' | 'closing' | 'education' | 'general';
  tickers: string[];
  createdAt: string;
}

export interface StockQuery {
  id: string;
  studentId: string;
  studentName: string;
  symbol: string;
  createdAt: string;
}

// ─── Level / XP System ───
export const LEVEL_TABLE: { level: number; xpRequired: number; title: string }[] = [
  { level: 1, xpRequired: 0, title: '新手' },
  { level: 2, xpRequired: 50, title: '新手' },
  { level: 3, xpRequired: 120, title: '新手' },
  { level: 4, xpRequired: 200, title: '新手' },
  { level: 5, xpRequired: 300, title: '見習生' },
  { level: 6, xpRequired: 420, title: '見習生' },
  { level: 7, xpRequired: 560, title: '見習生' },
  { level: 8, xpRequired: 720, title: '見習生' },
  { level: 9, xpRequired: 900, title: '見習生' },
  { level: 10, xpRequired: 1100, title: '交易員' },
  { level: 11, xpRequired: 1320, title: '交易員' },
  { level: 12, xpRequired: 1560, title: '交易員' },
  { level: 13, xpRequired: 1820, title: '交易員' },
  { level: 14, xpRequired: 2100, title: '交易員' },
  { level: 15, xpRequired: 2400, title: '交易員' },
  { level: 16, xpRequired: 2720, title: '交易員' },
  { level: 17, xpRequired: 3060, title: '交易員' },
  { level: 18, xpRequired: 3420, title: '交易員' },
  { level: 19, xpRequired: 3800, title: '交易員' },
  { level: 20, xpRequired: 4200, title: '操盤手' },
  { level: 25, xpRequired: 6000, title: '操盤手' },
  { level: 30, xpRequired: 8500, title: '操盤手' },
  { level: 35, xpRequired: 11500, title: '操盤手' },
  { level: 40, xpRequired: 15000, title: '操盤手' },
  { level: 45, xpRequired: 19000, title: '操盤手' },
  { level: 50, xpRequired: 25000, title: '大師' },
];

export function getLevelInfo(xp: number): { level: number; title: string; currentXp: number; nextLevelXp: number; progress: number } {
  let current = LEVEL_TABLE[0];
  let next = LEVEL_TABLE[1];
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TABLE[i].xpRequired) {
      current = LEVEL_TABLE[i];
      next = LEVEL_TABLE[i + 1] || { ...current, xpRequired: current.xpRequired + 5000 };
      break;
    }
  }
  const range = next.xpRequired - current.xpRequired;
  const progress = range > 0 ? ((xp - current.xpRequired) / range) * 100 : 100;
  return { level: current.level, title: current.title, currentXp: xp, nextLevelXp: next.xpRequired, progress: Math.min(progress, 100) };
}

export const BADGE_DEFS: Record<BadgeId, { name: string; desc: string }> = {
  'first-trade': { name: '首筆交易', desc: '記錄你的第一筆交易' },
  'streak-7': { name: '連續 7 天', desc: '連續記錄交易 7 天' },
  'streak-30': { name: '連續 30 天', desc: '連續記錄交易 30 天' },
  'scholar': { name: '好學者', desc: '累計提問 10 次' },
  'jg-certified': { name: 'JG 認證', desc: '獲得 JG 回覆 5 次' },
  'veteran': { name: '百戰老將', desc: '累計記錄 100 筆交易' },
};

function calcStreak(studentId: string): number {
  const studentTrades = trades.filter(t => t.studentId === studentId);
  if (studentTrades.length === 0) return 0;
  const dates = [...new Set(studentTrades.map(t => t.date))].sort().reverse();
  let count = 1;
  for (let i = 1; i < dates.length; i++) {
    const d1 = new Date(dates[i - 1]);
    const d2 = new Date(dates[i]);
    const diff = (d1.getTime() - d2.getTime()) / 86400000;
    if (diff <= 1) count++; else break;
  }
  return count;
}

function checkAndAwardBadges(student: Student): BadgeId[] {
  const newBadges: BadgeId[] = [];
  const studentTrades = trades.filter(t => t.studentId === student.id);
  const studentQs = questions.filter(q => q.studentId === student.id);
  const jgReplies = studentQs.filter(q => q.answeredBy === 'jg').length;

  if (studentTrades.length >= 1 && !student.badges.includes('first-trade')) {
    student.badges.push('first-trade');
    newBadges.push('first-trade');
  }
  if (student.streak >= 7 && !student.badges.includes('streak-7')) {
    student.badges.push('streak-7');
    newBadges.push('streak-7');
  }
  if (student.streak >= 30 && !student.badges.includes('streak-30')) {
    student.badges.push('streak-30');
    newBadges.push('streak-30');
  }
  if (studentQs.length >= 10 && !student.badges.includes('scholar')) {
    student.badges.push('scholar');
    newBadges.push('scholar');
  }
  if (jgReplies >= 5 && !student.badges.includes('jg-certified')) {
    student.badges.push('jg-certified');
    newBadges.push('jg-certified');
  }
  if (studentTrades.length >= 100 && !student.badges.includes('veteran')) {
    student.badges.push('veteran');
    newBadges.push('veteran');
  }
  return newBadges;
}

function awardXp(student: Student, amount: number): { xpGained: number; leveledUp: boolean; oldLevel: number; newLevel: number; newBadges: BadgeId[] } {
  const oldLevel = getLevelInfo(student.xp).level;
  student.xp += amount;
  const newInfo = getLevelInfo(student.xp);
  const newBadges = checkAndAwardBadges(student);
  student.level = newInfo.level;
  return { xpGained: amount, leveledUp: newInfo.level > oldLevel, oldLevel, newLevel: newInfo.level, newBadges };
}

function updateStreak(student: Student): boolean {
  const today = new Date().toISOString().split('T')[0];
  if (student.lastActiveDate === today) return false; // already active today
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (student.lastActiveDate === yesterday) {
    student.streak += 1;
  } else {
    student.streak = 1;
  }
  student.lastActiveDate = today;
  return student.streak > 1; // true if streak continues
}

// ─── Storage ───
const stockQueries: StockQuery[] = [];
const students = new Map<string, Student>([
  ['s1', { id: 's1', name: '王小明', joinDate: '2026-02-10', experience: 'intermediate', style: '短線', goal: '學習停損紀律', brokers: ['富邦'], note: '科技股為主，停損執行力待加強', tags: ['停損差', '科技股'], xp: 190, level: 4, badges: ['first-trade'], streak: 9, lastActiveDate: '2026-02-20', createdAt: '2026-02-10T00:00:00Z' }],
  ['s2', { id: 's2', name: '李雅婷', joinDate: '2026-02-10', experience: 'intermediate', style: '波段', goal: '建立穩定獲利系統', brokers: ['永豐'], note: '跟隨JG方向操作，紀律不錯', tags: ['能源', '國防'], xp: 230, level: 4, badges: ['first-trade', 'streak-7'], streak: 9, lastActiveDate: '2026-02-20', createdAt: '2026-02-10T00:00:00Z' }],
  ['s3', { id: 's3', name: '陳志偉', joinDate: '2026-02-11', experience: 'beginner', style: '短線', goal: '不要再追高殺低', brokers: ['群益'], note: '典型追高殺低，需要心態輔導', tags: ['追高', '情緒化', '需關注'], xp: 155, level: 3, badges: ['first-trade'], streak: 9, lastActiveDate: '2026-02-20', createdAt: '2026-02-11T00:00:00Z' }],
  ['s4', { id: 's4', name: '林佩君', joinDate: '2026-02-12', experience: 'beginner', style: '長線', goal: '學習美股投資', brokers: ['富邦'], note: '台股轉美股，基本面導向', tags: ['台股', '穩健'], xp: 175, level: 3, badges: ['first-trade', 'streak-7'], streak: 9, lastActiveDate: '2026-02-20', createdAt: '2026-02-12T00:00:00Z' }],
  ['s5', { id: 's5', name: '張家豪', joinDate: '2026-02-12', experience: 'advanced', style: '短線', goal: '提高勝率', brokers: ['永豐', '群益'], note: '交易頻率高，需控制手癢', tags: ['高頻', '積極型'], xp: 280, level: 5, badges: ['first-trade', 'streak-7'], streak: 9, lastActiveDate: '2026-02-20', createdAt: '2026-02-12T00:00:00Z' }],
]);
const trades: TradeEntry[] = [
  { id: 't01', studentId: 's1', symbol: 'NVDA', market: 'US', action: 'buy', price: 187.50, shares: 10, date: '2026-02-12', note: '突破前高買入', createdAt: '2026-02-12T14:30:00Z' },
  { id: 't02', studentId: 's1', symbol: 'PLTR', market: 'US', action: 'buy', price: 98.20, shares: 20, date: '2026-02-13', note: '回測支撐', createdAt: '2026-02-13T14:30:00Z' },
  { id: 't03', studentId: 's1', symbol: 'NVDA', market: 'US', action: 'sell', price: 192.30, shares: 10, date: '2026-02-14', note: '獲利了結 +$48', createdAt: '2026-02-14T14:30:00Z' },
  { id: 't04', studentId: 's1', symbol: 'TSLA', market: 'US', action: 'buy', price: 342.00, shares: 5, date: '2026-02-17', note: '看多電動車', createdAt: '2026-02-17T14:30:00Z' },
  { id: 't05', studentId: 's1', symbol: 'PLTR', market: 'US', action: 'sell', price: 95.10, shares: 20, date: '2026-02-18', note: '停損出場 -$62', createdAt: '2026-02-18T14:30:00Z' },
  { id: 't06', studentId: 's1', symbol: 'AMD', market: 'US', action: 'buy', price: 118.50, shares: 15, date: '2026-02-19', note: '低接', createdAt: '2026-02-19T14:30:00Z' },
  { id: 't07', studentId: 's1', symbol: 'TSLA', market: 'US', action: 'sell', price: 335.00, shares: 5, date: '2026-02-20', note: '停損 -$35', createdAt: '2026-02-20T14:30:00Z' },
  { id: 't08', studentId: 's2', symbol: 'XOM', market: 'US', action: 'buy', price: 108.30, shares: 20, date: '2026-02-12', note: 'JG看多能源', createdAt: '2026-02-12T14:35:00Z' },
  { id: 't09', studentId: 's2', symbol: 'LMT', market: 'US', action: 'buy', price: 465.00, shares: 3, date: '2026-02-13', note: '國防預算利多', createdAt: '2026-02-13T14:35:00Z' },
  { id: 't10', studentId: 's2', symbol: 'CVX', market: 'US', action: 'buy', price: 155.20, shares: 10, date: '2026-02-14', note: '油價上漲', createdAt: '2026-02-14T14:35:00Z' },
  { id: 't11', studentId: 's2', symbol: '2330.TW', market: 'TW', action: 'buy', price: 920, shares: 2, date: '2026-02-17', note: '台積電回檔買', createdAt: '2026-02-17T14:35:00Z' },
  { id: 't12', studentId: 's2', symbol: 'XOM', market: 'US', action: 'sell', price: 112.50, shares: 20, date: '2026-02-18', note: '波段獲利 +$84', createdAt: '2026-02-18T14:35:00Z' },
  { id: 't13', studentId: 's2', symbol: 'NOC', market: 'US', action: 'buy', price: 512.00, shares: 2, date: '2026-02-19', note: '加碼國防', createdAt: '2026-02-19T14:35:00Z' },
  { id: 't14', studentId: 's2', symbol: 'LMT', market: 'US', action: 'sell', price: 478.00, shares: 3, date: '2026-02-20', note: '到目標價 +$39', createdAt: '2026-02-20T14:35:00Z' },
  { id: 't15', studentId: 's3', symbol: 'NVDA', market: 'US', action: 'buy', price: 195.00, shares: 5, date: '2026-02-12', note: '看到漲就買', createdAt: '2026-02-12T15:00:00Z' },
  { id: 't16', studentId: 's3', symbol: 'NVDA', market: 'US', action: 'sell', price: 188.00, shares: 5, date: '2026-02-13', note: '怕了先跑 -$35', createdAt: '2026-02-13T15:00:00Z' },
  { id: 't17', studentId: 's3', symbol: 'TSLA', market: 'US', action: 'buy', price: 348.00, shares: 3, date: '2026-02-14', note: '馬斯克利多', createdAt: '2026-02-14T15:00:00Z' },
  { id: 't18', studentId: 's3', symbol: 'TSLA', market: 'US', action: 'sell', price: 338.00, shares: 3, date: '2026-02-17', note: '受不了割肉 -$30', createdAt: '2026-02-17T15:00:00Z' },
  { id: 't19', studentId: 's3', symbol: 'PLTR', market: 'US', action: 'buy', price: 101.00, shares: 10, date: '2026-02-18', note: '別人說會漲', createdAt: '2026-02-18T15:00:00Z' },
  { id: 't20', studentId: 's3', symbol: 'MSTR', market: 'US', action: 'buy', price: 310.00, shares: 2, date: '2026-02-19', note: '比特幣概念', createdAt: '2026-02-19T15:00:00Z' },
  { id: 't21', studentId: 's3', symbol: 'PLTR', market: 'US', action: 'sell', price: 96.50, shares: 10, date: '2026-02-20', note: '又停損了 -$45', createdAt: '2026-02-20T15:00:00Z' },
  { id: 't22', studentId: 's4', symbol: '2330.TW', market: 'TW', action: 'buy', price: 915, shares: 3, date: '2026-02-12', note: '定期定額', createdAt: '2026-02-12T09:00:00Z' },
  { id: 't23', studentId: 's4', symbol: '2454.TW', market: 'TW', action: 'buy', price: 1250, shares: 1, date: '2026-02-13', note: '聯發科回檔', createdAt: '2026-02-13T09:00:00Z' },
  { id: 't24', studentId: 's4', symbol: 'AAPL', market: 'US', action: 'buy', price: 232.00, shares: 5, date: '2026-02-14', note: '第一次買美股', createdAt: '2026-02-14T14:30:00Z' },
  { id: 't25', studentId: 's4', symbol: '2330.TW', market: 'TW', action: 'buy', price: 908, shares: 2, date: '2026-02-17', note: '加碼台積', createdAt: '2026-02-17T09:00:00Z' },
  { id: 't26', studentId: 's4', symbol: 'GOOGL', market: 'US', action: 'buy', price: 185.00, shares: 5, date: '2026-02-18', note: 'AI題材', createdAt: '2026-02-18T14:30:00Z' },
  { id: 't27', studentId: 's4', symbol: '2454.TW', market: 'TW', action: 'sell', price: 1280, shares: 1, date: '2026-02-19', note: '小賺出場 +$30', createdAt: '2026-02-19T09:00:00Z' },
  { id: 't28', studentId: 's4', symbol: 'MSFT', market: 'US', action: 'buy', price: 410.00, shares: 3, date: '2026-02-20', note: '長期持有', createdAt: '2026-02-20T14:30:00Z' },
  { id: 't29', studentId: 's5', symbol: 'PLTR', market: 'US', action: 'buy', price: 97.00, shares: 50, date: '2026-02-12', note: '大量低接', createdAt: '2026-02-12T14:30:00Z' },
  { id: 't30', studentId: 's5', symbol: 'PLTR', market: 'US', action: 'sell', price: 100.50, shares: 50, date: '2026-02-13', note: '隔日沖 +$175', createdAt: '2026-02-13T14:30:00Z' },
  { id: 't31', studentId: 's5', symbol: 'NVDA', market: 'US', action: 'buy', price: 189.00, shares: 20, date: '2026-02-14', note: '財報前佈局', createdAt: '2026-02-14T14:30:00Z' },
  { id: 't32', studentId: 's5', symbol: 'NVDA', market: 'US', action: 'sell', price: 193.00, shares: 20, date: '2026-02-17', note: '快進快出 +$80', createdAt: '2026-02-17T14:30:00Z' },
  { id: 't33', studentId: 's5', symbol: 'AMD', market: 'US', action: 'buy', price: 120.00, shares: 30, date: '2026-02-18', note: '跟NVDA連動', createdAt: '2026-02-18T14:30:00Z' },
  { id: 't34', studentId: 's5', symbol: 'TSLA', market: 'US', action: 'buy', price: 340.00, shares: 10, date: '2026-02-19', note: '突破訊號', createdAt: '2026-02-19T14:30:00Z' },
  { id: 't35', studentId: 's5', symbol: 'AMD', market: 'US', action: 'sell', price: 117.50, shares: 30, date: '2026-02-19', note: '止損 -$75', createdAt: '2026-02-19T20:00:00Z' },
  { id: 't36', studentId: 's5', symbol: 'TSLA', market: 'US', action: 'sell', price: 345.00, shares: 10, date: '2026-02-20', note: '短線獲利 +$50', createdAt: '2026-02-20T14:30:00Z' },
  { id: 't37', studentId: 's5', symbol: 'META', market: 'US', action: 'buy', price: 585.00, shares: 5, date: '2026-02-20', note: '技術面看多', createdAt: '2026-02-20T15:00:00Z' },
];
const questions: Question[] = [
  { id: 'q1', studentId: 's3', studentName: '陳志偉', content: '老師，我每次買了就跌，賣了就漲，是不是我的方法有問題？', category: 'mindset', createdAt: '2026-02-18T12:00:00Z' },
  { id: 'q2', studentId: 's3', studentName: '陳志偉', content: 'PLTR 跌到 96 了，要不要加碼攤平？', category: 'strategy', createdAt: '2026-02-20T15:00:00Z' },
  { id: 'q3', studentId: 's4', studentName: '林佩君', content: '請問美股的停損單要怎麼設？我用富邦的', category: 'technical', createdAt: '2026-02-19T08:00:00Z' },
  { id: 'q4', studentId: 's1', studentName: '王小明', content: 'AMD 跌到 118 了，這邊是支撐嗎？可以加碼嗎？', category: 'analysis', answer: '看 SMA20 在哪裡，如果 118 附近有支撐且量縮，可以小量試單。但記得設停損在 115 以下。', answeredBy: 'jg', answeredAt: '2026-02-19T16:00:00Z', createdAt: '2026-02-19T15:30:00Z' },
  { id: 'q5', studentId: 's2', studentName: '李雅婷', content: '老師說看多能源，請問 XOM 和 CVX 哪個比較好？', category: 'analysis', answer: 'XOM 規模大、股息穩定；CVX 彈性高。兩個都可以，如果只選一個我選 XOM。', answeredBy: 'jg', answeredAt: '2026-02-20T10:00:00Z', createdAt: '2026-02-20T09:30:00Z' },
  { id: 'q6', studentId: 's5', studentName: '張家豪', content: '為什麼我總是賺小賠大？明明勝率有 6 成', category: 'strategy', createdAt: '2026-02-17T14:00:00Z' },
  { id: 'q7', studentId: 's4', studentName: '林佩君', content: 'AAPL 財報前要出場嗎？還是可以繼續抱？', category: 'strategy', createdAt: '2026-02-18T16:00:00Z' },
  { id: 'q8', studentId: 's1', studentName: '王小明', content: '請問 RSI 超賣就可以買嗎？還是要等其他訊號？', category: 'technical', createdAt: '2026-02-17T11:00:00Z' },
  { id: 'q9', studentId: 's3', studentName: '陳志偉', content: '我看到新聞說某股票要漲，可以追嗎？', category: 'mindset', createdAt: '2026-02-19T13:00:00Z' },
  { id: 'q10', studentId: 's2', studentName: '李雅婷', content: '波段操作一般會抱多久？怎麼知道該出場？', category: 'strategy', createdAt: '2026-02-16T10:00:00Z' },
];
const insights: Insight[] = [
  { id: 'i1', content: 'PLTR 昨日回測支撐位成功，今日觀察能否突破前高。LMT 受國防預算利多持續走強。', tickers: ['PLTR', 'LMT'], createdAt: '2026-02-20T13:00:00Z' },
  { id: 'i2', content: 'CPI 數據今晚公布，市場觀望氣氛濃。建議今天減少操作，等數據出來再決定方向。手上有獲利的可以先鎖定一部分。', tickers: [], createdAt: '2026-02-19T13:00:00Z' },
  { id: 'i3', content: '美國國防預算案今天表決，LMT/NOC/RTX 都有機會。油價突破 82 美元，能源股開盤可能跳空。科技股期貨持平。', tickers: ['LMT', 'NOC', 'RTX'], createdAt: '2026-02-18T13:00:00Z' },
  { id: 'i4', content: 'PLTR 跌破 97 支撐，短線不宜追多。LMT 突破 475 前高，可以關注回測買點。NVDA 量縮整理中，等方向。', tickers: ['PLTR', 'LMT', 'NVDA'], createdAt: '2026-02-19T18:00:00Z' },
  { id: 'i5', content: '今天能源股全面走強，XOM +2.1%, CVX +1.8%。國防股也不錯，LMT +1.5%。科技股震盪，NVDA 收平。整體方向符合預期，繼續看多能源/國防。', tickers: ['XOM', 'CVX', 'LMT', 'NVDA'], createdAt: '2026-02-18T22:00:00Z' },
  { id: 'i6', content: '國防預算通過，LMT +2.8% 創新高。但科技股賣壓明顯，NVDA -1.2%, AMD -2.0%。建議學生們注意：不要逆勢做多科技股，等明確止跌訊號。', tickers: ['LMT', 'NVDA', 'AMD'], createdAt: '2026-02-19T22:00:00Z' },
  { id: 'i7', content: '連續下跌策略：當一檔股票從高點連續回落 15-25%，且 SMA130 仍向上，就是我們要關注的買點。重點是要有耐心等回檔結束的訊號，不要接飛刀。\n\n三個確認訊號：\n1. 日K收紅且量增\n2. 站回5日線\n3. RSI從超賣區回升', tickers: [], createdAt: '2026-02-17T10:00:00Z' },
];
let weeklyDirection: WeeklyDirection | null = {
  id: 'demo-dir-1',
  weekStart: '2026-02-16',
  content: '本週看多能源/國防（XOM, CVX, LMT, NOC），觀望科技股，看空消費類。\n重點關注油價走勢與地緣政治。國防預算案本週表決，利多國防股。\n\n操作建議：能源股逢回買進，科技股等止跌訊號再進場。',
  createdAt: '2026-02-17T01:00:00.000Z',
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Students ───
export function addStudent(data: Omit<Student, 'id' | 'createdAt' | 'xp' | 'level' | 'badges' | 'streak' | 'lastActiveDate'>): Student {
  const student: Student = { ...data, id: genId(), xp: 0, level: 1, badges: [], streak: 0, lastActiveDate: '', createdAt: new Date().toISOString() };
  students.set(student.id, student);
  return student;
}

export function getStudent(id: string): Student | undefined {
  return students.get(id);
}

export function updateStudent(id: string, patch: Partial<Student>): Student | null {
  const s = students.get(id);
  if (!s) return null;
  const updated = { ...s, ...patch, id: s.id, createdAt: s.createdAt };
  students.set(id, updated);
  return updated;
}

export function getAllStudents(): Student[] {
  return [...students.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function searchStudents(query: string): Student[] {
  const q = query.toLowerCase();
  return getAllStudents().filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.tags.some(t => t.includes(q)) ||
    s.style.includes(q)
  );
}

// ─── Trades (with XP) ───
export function addTrade(data: Omit<TradeEntry, 'id' | 'createdAt'>): { trade: TradeEntry; xpResult?: ReturnType<typeof awardXp> } {
  const trade: TradeEntry = { ...data, id: genId(), createdAt: new Date().toISOString() };
  trades.unshift(trade);
  const student = students.get(data.studentId);
  let xpResult: ReturnType<typeof awardXp> | undefined;
  if (student) {
    let xpAmount = 10; // base trade XP
    const streakContinued = updateStreak(student);
    student.streak = calcStreak(student.id);
    if (streakContinued && student.streak > 1) xpAmount += 20; // streak bonus
    xpResult = awardXp(student, xpAmount);
  }
  return { trade, xpResult };
}

// Backward compat: some API routes expect just TradeEntry
export function addTradeCompat(data: Omit<TradeEntry, 'id' | 'createdAt'>): TradeEntry {
  return addTrade(data).trade;
}

export function getTradesByStudent(studentId: string): TradeEntry[] {
  return trades.filter(t => t.studentId === studentId);
}

export function getAllTrades(): TradeEntry[] {
  return trades;
}

// ─── Questions (with XP) ───
export function addQuestion(data: Omit<Question, 'id' | 'createdAt'>): { question: Question; xpResult?: ReturnType<typeof awardXp> } {
  const q: Question = { ...data, id: genId(), createdAt: new Date().toISOString() };
  questions.unshift(q);
  const student = students.get(data.studentId);
  let xpResult: ReturnType<typeof awardXp> | undefined;
  if (student) {
    xpResult = awardXp(student, 5);
  }
  return { question: q, xpResult };
}

export function answerQuestion(id: string, answer: string, by: 'jg' | 'ai'): { question: Question | null; xpResult?: ReturnType<typeof awardXp> } {
  const q = questions.find(q => q.id === id);
  if (!q) return { question: null };
  q.answer = answer;
  q.answeredBy = by;
  q.answeredAt = new Date().toISOString();
  // Award XP to student for getting a JG reply
  let xpResult: ReturnType<typeof awardXp> | undefined;
  if (by === 'jg') {
    const student = students.get(q.studentId);
    if (student) {
      xpResult = awardXp(student, 15);
    }
  }
  return { question: q, xpResult };
}

export function getQuestionsByStudent(studentId: string): Question[] {
  return questions.filter(q => q.studentId === studentId);
}

export function getAllQuestions(): Question[] {
  return questions;
}

export function getUnansweredQuestions(): Question[] {
  return questions.filter(q => !q.answer);
}

// ─── Weekly Direction ───
export function setWeeklyDirection(content: string): WeeklyDirection {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  weeklyDirection = {
    id: genId(),
    weekStart: monday.toISOString().split('T')[0],
    content,
    createdAt: new Date().toISOString(),
  };
  return weeklyDirection;
}

export function getWeeklyDirection(): WeeklyDirection | null {
  return weeklyDirection;
}

// ─── Insights ───
export function addInsight(data: { content: string; tickers?: string[]; category?: Insight['category'] }): Insight {
  const tickers = data.tickers && data.tickers.length > 0
    ? data.tickers
    : extractTickers(data.content);
  const insight: Insight = {
    id: genId(),
    content: data.content,
    category: data.category || 'general',
    tickers,
    createdAt: new Date().toISOString(),
  };
  insights.unshift(insight);
  return insight;
}

export function getInsights(limit = 50): Insight[] {
  return insights.slice(0, limit);
}

export function deleteInsight(id: string): boolean {
  const idx = insights.findIndex(i => i.id === id);
  if (idx === -1) return false;
  insights.splice(idx, 1);
  return true;
}

function extractTickers(text: string): string[] {
  const matches = text.match(/\b[A-Z]{1,5}\b/g) || [];
  const common = new Set(['I', 'A', 'THE', 'AND', 'OR', 'IF', 'AT', 'IN', 'ON', 'TO', 'IT', 'IS', 'BE', 'AS', 'DO', 'AI', 'US', 'AM', 'PM', 'VS', 'ETF', 'GDP', 'CPI', 'IPO', 'CEO', 'CFO', 'EPS', 'PE', 'PB', 'ROE', 'ROA', 'SMA', 'ATR', 'RSI', 'MACD']);
  return [...new Set(matches.filter(m => m.length >= 2 && !common.has(m)))];
}

// ─── Stock Queries (with XP) ───
stockQueries.push(
  { id: 'sq1', studentId: 's1', studentName: '王小明', symbol: 'NVDA', createdAt: '2026-02-18T10:00:00Z' },
  { id: 'sq2', studentId: 's1', studentName: '王小明', symbol: 'AMD', createdAt: '2026-02-19T09:00:00Z' },
  { id: 'sq3', studentId: 's2', studentName: '李雅婷', symbol: 'XOM', createdAt: '2026-02-18T11:00:00Z' },
  { id: 'sq4', studentId: 's2', studentName: '李雅婷', symbol: 'LMT', createdAt: '2026-02-19T08:00:00Z' },
  { id: 'sq5', studentId: 's3', studentName: '陳志偉', symbol: 'NVDA', createdAt: '2026-02-19T14:00:00Z' },
  { id: 'sq6', studentId: 's3', studentName: '陳志偉', symbol: 'PLTR', createdAt: '2026-02-20T10:00:00Z' },
  { id: 'sq7', studentId: 's5', studentName: '張家豪', symbol: 'PLTR', createdAt: '2026-02-18T15:00:00Z' },
  { id: 'sq8', studentId: 's5', studentName: '張家豪', symbol: 'NVDA', createdAt: '2026-02-19T16:00:00Z' },
  { id: 'sq9', studentId: 's4', studentName: '林佩君', symbol: 'AAPL', createdAt: '2026-02-20T09:00:00Z' },
  { id: 'sq10', studentId: 's5', studentName: '張家豪', symbol: 'META', createdAt: '2026-02-20T14:00:00Z' },
);

export function addStockQuery(data: { studentId: string; studentName: string; symbol: string }): StockQuery {
  const q: StockQuery = { ...data, id: genId(), symbol: data.symbol.toUpperCase(), createdAt: new Date().toISOString() };
  stockQueries.unshift(q);
  return q;
}

export function getStockQueries(studentId?: string): StockQuery[] {
  if (studentId) return stockQueries.filter(q => q.studentId === studentId);
  return stockQueries;
}

export function getStockQueryStats(): { symbol: string; count: number; lastQueried: string }[] {
  const map = new Map<string, { count: number; lastQueried: string }>();
  for (const q of stockQueries) {
    const existing = map.get(q.symbol);
    if (!existing) {
      map.set(q.symbol, { count: 1, lastQueried: q.createdAt });
    } else {
      existing.count++;
      if (q.createdAt > existing.lastQueried) existing.lastQueried = q.createdAt;
    }
  }
  return [...map.entries()]
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => b.count - a.count);
}

// ─── Daily Missions ───
export function getDailyMissions(studentId: string): { id: string; label: string; done: boolean }[] {
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(t => t.studentId === studentId && t.date === today);
  const todayQs = questions.filter(q => q.studentId === studentId && q.createdAt.startsWith(today));
  const todayQueries = stockQueries.filter(q => q.studentId === studentId && q.createdAt.startsWith(today));
  return [
    { id: 'trade', label: '記錄今日交易', done: todayTrades.length > 0 },
    { id: 'question', label: '提出一個問題', done: todayQs.length > 0 },
    { id: 'query', label: '查詢一檔股票', done: todayQueries.length > 0 },
  ];
}

// ─── Leaderboard ───
export function getLeaderboard(): { rank: number; name: string; xp: number; level: number; title: string; streak: number; isTopWeekly: boolean }[] {
  const all = getAllStudents();
  const sorted = all.sort((a, b) => b.xp - a.xp);
  return sorted.map((s, i) => {
    const info = getLevelInfo(s.xp);
    return {
      rank: i + 1,
      name: s.name,
      xp: s.xp,
      level: info.level,
      title: info.title,
      streak: s.streak,
      isTopWeekly: i === 0,
    };
  });
}

// ─── Analytics ───
export function getStudentAnalytics(studentId: string) {
  const studentTrades = getTradesByStudent(studentId);
  const studentQuestions = getQuestionsByStudent(studentId);

  if (studentTrades.length === 0) {
    return { totalTrades: 0, buys: 0, sells: 0, symbols: [], questionCount: studentQuestions.length, needsHelp: [] };
  }

  const buys = studentTrades.filter(t => t.action === 'buy');
  const sells = studentTrades.filter(t => t.action === 'sell');
  const symbols = [...new Set(studentTrades.map(t => t.symbol))];

  const needsHelp: string[] = [];
  if (symbols.length <= 2 && studentTrades.length >= 5) needsHelp.push('持倉過度集中');
  if (buys.length > 5 && sells.length === 0) needsHelp.push('只買不賣，缺乏停利/停損紀律');
  const mindsetQs = studentQuestions.filter(q => q.category === 'mindset');
  if (mindsetQs.length >= 3) needsHelp.push('心態問題頻繁，需要情緒管理指導');

  return { totalTrades: studentTrades.length, buys: buys.length, sells: sells.length, symbols, questionCount: studentQuestions.length, needsHelp };
}
