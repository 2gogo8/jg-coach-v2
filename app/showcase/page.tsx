'use client';

// Student showcase page - public, no login required
// Data sourced from JG's analysis of student trading records

interface StudentCard {
  name: string;
  period: string;
  total_trades: number | null;
  style: string | null;
  market: string;
  win_rate: string | null;
  avg_profit: string | null;
  avg_loss: string | null;
  net_pnl: string | null;
  grade: string | null;
  top_symbols: string[];
  highlight: string | null;
  weakness: string | null;
  jg_advice: string | null;
}

const STUDENTS: StudentCard[] = [
  {
    name: "Emma",
    period: "2025/12 - 2026/03",
    total_trades: 204,
    style: "高頻零股交易 + 融資短打",
    market: "台股",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+241,813 TWD",
    grade: "B-",
    top_symbols: ["力旺 (3529)", "高力 (8996)", "旭隼 (6409)", "系微 (6231)", "威強電 (3022)"],
    highlight: "高力是最大獲利來源（+156,555）。原有庫存從12月554元起分批出貨，一路賣到1月758元（+36%），每次只出10-40股讓利潤充分奔跑。力旺低檔建倉逐步出貨獲利+104,232。展現出色的庫存管理與趨勢跟隨能力。",
    weakness: "LINEPAY從581跌到323.5（-44.3%），仍在整個下跌過程中持續買入，追跌執念是核心問題。",
    jg_advice: "減少標的數量至5-8檔，集中做熟悉的強勢股。放棄低效率零股短線，把精力放在『高力模式』——找到看好的股票建倉，在上漲中逐步出貨。"
  },
  {
    name: "Finn",
    period: "2024/11 - 2026/02",
    total_trades: null,
    style: "選擇權 + 資產交換",
    market: "台股選擇權",
    win_rate: "69.6%",
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+318,924 TWD（+33.5%）",
    grade: "B+",
    top_symbols: ["金像電 (2368)", "台燿 (6274)", "凡甲 (3526)", "CBAS（資產交換選擇權）"],
    highlight: "PCB供應鏈三劍客（金像電+台燿+凡甲）合計獲利+283,445，佔總獲利89%。金像電668→826（+23.7%）、台燿419→545（+30.1%），精準卡位2025下半年AI伺服器帶動的PCB超級循環。CBAS（資產交換選擇權）最大虧損有限，上漲空間無限，風報比結構優異。",
    weakness: "汎德永業是唯一非電子股，也是最大虧損部位（-42,680），追高後被套。",
    jg_advice: "繼續深耕PCB/電子供應鏈選股優勢。CBAS策略保留，但需要更嚴格的選股標準。非本業領域（汎德等）建議降低部位或放棄。"
  },
  {
    name: "IVERSON",
    period: "2025年 - 2026/03",
    total_trades: null,
    style: "小額分散布局",
    market: "美股",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: null,
    grade: null,
    top_symbols: ["UUUU", "GRAB", "SMR", "ORCL", "RKLB"],
    highlight: "每筆交易控制在$300-1,300 USD，不單筆重壓。即使判斷錯誤，單筆虧損有限。UUUU加碼雖越跌越買，但每次間隔至少1天以上，分批建倉節奏有一定控制力。",
    weakness: "26筆交易中只有2筆賣出（7.7%），完全沒有停損機制。大量未實現虧損持倉，潛在風險高。",
    jg_advice: "建立明確停損規則：任何持倉虧損超過10%必須出場，不論理由。先建立『賣出紀律』才能談選股能力。"
  },
  {
    name: "JYL",
    period: "2025/11 - 2026/03",
    total_trades: 3,
    style: "波段持股 + 分批出場",
    market: "台股",
    win_rate: "100%（樣本數少）",
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+264,759 TWD（+103%）",
    grade: null,
    top_symbols: ["汎銓 (6830)"],
    highlight: "在汎銓從$170修正到$145底部區域買入，不是追高。三次賣出從320→500→1,000股，金字塔式加大出場量，先用小量試探確認獲利再逐步放大。汎銓從$145漲到$298，翻倍後獲利了結，執行力優秀。",
    weakness: "賣出後汎銓繼續漲到$450（+51%），如果保留20%尾倉還能多賺15萬。",
    jg_advice: "下次在強勢股翻倍後，考慮保留20%部位用移動停損跟隨，讓贏的部位多跑一段。樣本數需要累積更多才能評估穩定性。"
  },
  {
    name: "Paul",
    period: "2025/10 - 2026/03",
    total_trades: 103,
    style: "偏空波段，多空雙做",
    market: "台指期貨",
    win_rate: "33%",
    avg_profit: "+10,941",
    avg_loss: "-6,537",
    net_pnl: "-90,484 TWD",
    grade: "C+",
    top_symbols: ["微台期 (MXF)", "小台期 (MTX)"],
    highlight: "最好的幾筆都是持倉數天到數週的波段單：9/26買入微台@25,600→11/10賣出@27,323（+17,230，持倉45天）。在對的方向上有耐心抱單的能力存在，問題在於空單方向判斷失準。",
    weakness: "11月大盤從27,000漲到28,000+，逆勢做空被軋，被軋後慢慢平倉而非快速停損，是最嚴重的問題。",
    jg_advice: "先停止做空，專注多頭方向練習。在台指連續突破關鍵壓力時，不逆勢。建立做空的嚴格條件：至少跌破均線+成交量萎縮才考慮。"
  },
  {
    name: "WOLF",
    period: "2025年",
    total_trades: null,
    style: "台股現股 + 選擇權",
    market: "台股",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+1,981,063 TWD（前4筆貢獻63%）",
    grade: null,
    top_symbols: ["金寶 (2312)", "華泰 (2329)", "台股CALL", "台股PUT"],
    highlight: "WOLF最大的優勢是抱單能力。4筆大波段合計貢獻+1,981,063 TWD，佔總獲利63%。能在方向判斷正確時不急著獲利了結、讓利潤充分奔跑，是期貨交易中最稀缺的能力。",
    weakness: "兩次最大虧損都發生在非盤中時段。11/22凌晨1:00，7筆交易同時被迫平倉虧-368,043，夜盤/盤後持有大量部位遭遇跳空下殺。",
    jg_advice: "禁止在夜盤留大部位過夜，或設定嚴格的夜盤部位上限。日盤的抱單優勢繼續保持，這是最大的競爭力。"
  },
  {
    name: "YC Chang",
    period: "2026/01 - 2026/03",
    total_trades: 41,
    style: "主題選股 + 波段",
    market: "美股/台股混合",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: null,
    grade: "B+",
    top_symbols: ["IONQ", "OKLO", "TEM", "台股電子股"],
    highlight: "選股集中在量子計算（IONQ）、核能（OKLO）、AI醫療（TEM）等前沿主題，方向判斷有前瞻性。賣出策略執行力強，能在相對高點分批了結。",
    weakness: "買進風控需加強，部分標的在過熱時仍追入，增加套牢風險。",
    jg_advice: "買進前先確認：距離近期高點不超過15%。建立固定的分批建倉規則，不一次all-in。"
  },
  {
    name: "張安泰",
    period: "2025/11 - 2026/03",
    total_trades: null,
    style: "波段 + 分批建倉",
    market: "台指期貨",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: null,
    grade: null,
    top_symbols: ["台指期 (TX)", "微台期 (MXF)", "小型ETF期貨"],
    highlight: "12/22在微台期28,324建倉，持有到1/6-1/7在30,339-30,529出場，賺取約2,000點的大波段。先用小型ETF期貨練習，確認能獲利後才轉做微台期，循序漸進的風控意識值得肯定。",
    weakness: "第二階段用1-2口賺了9萬後，立刻升級到6口，風險增加6倍但策略未同步升級。1/30的-52,356就是直接後果。",
    jg_advice: "部位規模提升必須有清楚的條件：策略在至少20筆交易中穩定獲利才能加倍口數，而非因為最近賺錢就加碼。"
  },
  {
    name: "張建凱",
    period: "2025/10 - 2026/02",
    total_trades: 42,
    style: "分批建倉 + 趨勢持有",
    market: "美國期貨",
    win_rate: "83.3%",
    avg_profit: "+$499",
    avg_loss: "-$468",
    net_pnl: "+$16,377 USD",
    grade: "中上水準",
    top_symbols: ["微型S&P (MES)", "微型那斯達克 (MNQ)", "黃金期貨 (GC/MGC)"],
    highlight: "黃金12口分批建倉（4,151→4,856，+$705/口），從11月持有到1月才全部出完，展現耐心。83.3%高勝率，42筆交易中35筆獲利。10/10大跌日分批往下建倉降低成本，同日發現不對立即停損，停損執行力強。",
    weakness: "風報比接近1:1（平均獲利$499 vs 平均虧損$468），高度依賴高勝率，一旦市場環境改變勝率下滑，整體很快轉虧。",
    jg_advice: "嘗試在看對的交易上讓利潤多跑一段，用移動停利取代固定目標價。保留1/3尾倉跟隨趨勢，可顯著提升風報比。"
  },
  {
    name: "張毅",
    period: "2025/12 - 2026/03",
    total_trades: 63,
    style: "主題佈局 + 分批建倉",
    market: "美股",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+$748 USD",
    grade: null,
    top_symbols: ["AVAV（無人機）", "PLTR", "NBIS", "CCJ（核能）", "RTX（國防）"],
    highlight: "選股圍繞國防主題（AVAV+RTX+CACI三檔互補：無人機、導彈、IT），顯示對產業鏈有研究。AVAV分5批從$224到$258建倉，均價$242接近區間中位數，分批建倉紀律清晰。",
    weakness: "18檔股票總資金約$33,000，平均每檔不到$2,000，部位太分散。FSLR從$230買入跌到$191才全數賣出，中間還加碼，越攤越虧。",
    jg_advice: "縮減標的至5-7檔核心持股，每檔部位至少$5,000才有意義。設定嚴格停損：任何持倉跌超過8%立即出場，不加碼。"
  },
  {
    name: "智澤",
    period: "2025/12 - 2026/03",
    total_trades: 118,
    style: "趨勢追蹤 + 熱門題材輪動",
    market: "台股/期貨",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+25,633 TWD",
    grade: "C+",
    top_symbols: ["台股AI概念股", "PCB族群", "台指CALL/PUT"],
    highlight: "能快速識別當下熱門題材（AI、PCB），並跟上輪動節奏。部分順勢交易執行得不錯，方向感存在。",
    weakness: "風控嚴重不足，大波段機會時往往過早出場，但套牢時卻長抱不停損。整體獲利相對交易量太少。",
    jg_advice: "先建立停損紀律：每筆交易預設停損點，不達停損點不出場，達到就立刻出場。獲利部位設移動停利而非固定目標。"
  },
  {
    name: "林俊樺",
    period: "2025/10 - 2026/03",
    total_trades: 541,
    style: "股票 + Covered Call / 保護性賣權",
    market: "美股+選擇權",
    win_rate: "43%",
    avg_profit: null,
    avg_loss: null,
    net_pnl: null,
    grade: null,
    top_symbols: ["ONDS", "RKLB", "GRAB", "CRSP", "SMR（核能）"],
    highlight: "善用Covered Call策略持續收取權利金降低持股成本，機構投資者常用策略、散戶中能熟練運用的非常少。以ONDS為例，持有現股同時賣出CALL，每月收取權利金降低成本基礎。",
    weakness: "25檔核心股票+128個選擇權合約，管理複雜度極高，大量小額選擇權手續費佔比偏高。5檔核能股（SMR/OKLO/LEU/UUUU/CEG）相關性極高，實際分散效果有限。",
    jg_advice: "縮減個股至10檔以內，每檔選擇權部位意義才夠大。核能股只保留1-2檔最看好的，其餘賣出。"
  },
  {
    name: "洪嘉駿",
    period: "2025年",
    total_trades: null,
    style: "低勝率趨勢跟隨",
    market: "台指期貨",
    win_rate: "31%",
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+230,000 TWD（估）",
    grade: null,
    top_symbols: ["台指期 (TX)"],
    highlight: "31%勝率下仍能總體獲利+23萬，靠的是：虧損時砍得快（平均虧70點），獲利時抱得住（平均贏178點）。這是典型健康的趨勢跟隨者特徵——風報比優秀，賺的比虧的多3倍。",
    weakness: "最大連續虧損達20筆，雖然每筆不大，但連虧20筆的心理壓力巨大。31%勝率系統需要極強的心理素質才能持續執行。",
    jg_advice: "繼續保持『快停損、慢停利』的核心紀律。可以增加一個過濾條件：只在大趨勢方向上交易，逆勢不進場，有助於提升勝率至40-45%。"
  },
  {
    name: "莊佳縉",
    period: "2025/12 - 2026/03",
    total_trades: 300,
    style: "極高頻當沖",
    market: "美國期貨（白銀）",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: null,
    grade: null,
    top_symbols: ["微型白銀期貨 (SIL)", "微型黃金 (MGC)"],
    highlight: "操作以1口微型白銀（保證金$1,500-2,000）為主，意識地控制單筆曝險。在順勢時段能抓到不錯的利潤，特定時段的方向感存在。",
    weakness: "單日20-40筆交易，手續費每天$60-$240，一個月超過$600-$1,200。大量$0-$50小利潤根本無法覆蓋手續費，許多「平手」交易扣完手續費後都是淨虧損。",
    jg_advice: "大幅降低交易頻率至每天不超過5筆。專注只交易真正高確信度的機會，讓每筆獲利至少100點，才能在扣除手續費後仍有淨利。"
  },
  {
    name: "阿丁",
    period: "2025/12 - 2026/03",
    total_trades: 139,
    style: "個股期貨短波段",
    market: "台股個股期貨",
    win_rate: "56%",
    avg_profit: "+6,096",
    avg_loss: "-3,441",
    net_pnl: "+254,218 TWD",
    grade: null,
    top_symbols: ["家登 (3680)", "大同 (2371)", "宏捷科 (8086)", "同欣電 (6271)", "智原 (3035)"],
    highlight: "整體勝率56%，賺賠比約1.77:1，非常健康的結構。家登17筆全勝（100%）、大同5筆全勝（100%），在有把握的標的明顯加大口數（家登10口、大同5口），其他不確定的只做1口試水。『確定性高就加大、不確定就小做』的部位管理非常成熟。",
    weakness: "做空23筆合計虧損-4,678，勝率明顯低於做多。智原在高位追買被套。",
    jg_advice: "大幅減少做空或完全放棄，專注多頭方向。把家登/大同的操作模式（高確信度+大口數）複製到其他熟悉的標的上。"
  },
  {
    name: "陳治豪",
    period: "2025/12 - 2026/03",
    total_trades: 106,
    style: "微台指波段 + 個股期貨",
    market: "台指期貨",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: "+645,276 TWD",
    grade: "B+",
    top_symbols: ["微台期 (MXF)", "旺宏期 (DIF)", "康舒期 (KFF)"],
    highlight: "微台指67筆交易勝率70.1%，貢獻93.6%總利潤（604,001/645,276）。分批建倉+分批了結紀律清晰。平均賺16,265、平均賠6,210，風報比達1:2.62，即使勝率只有54.7%也能穩定獲利。1月13筆賺30萬，展現頂尖執行力。",
    weakness: "3月53筆只賺1.3萬，過度交易嚴重稀釋獲利。個股期貨尚未建立穩定獲利模式。",
    jg_advice: "聚焦微台指+旺宏，這兩個是已經驗證能賺錢的標的。設定每月最大交易筆數不超過20筆，控制交易頻率。"
  },
  {
    name: "陳致維",
    period: "2025/12 - 2026/03",
    total_trades: null,
    style: "個股期貨趨勢交易",
    market: "台股個股期貨",
    win_rate: "54.7%",
    avg_profit: "+16,265",
    avg_loss: "-6,210",
    net_pnl: "+645,276 TWD",
    grade: "有天賦的趨勢交易者",
    top_symbols: ["旺宏 (DIF)", "康舒 (KFF)", "小型群聯 (QNF)", "元晶 (RLF)"],
    highlight: "風報比達1:2.62，即使勝率只有54.7%仍能大幅獲利。67筆微台指交易勝率70.1%，分批建倉+分批了結紀律清晰。選股集中在面板、半導體、電子零組件，有明確的產業主線。",
    weakness: "個股期貨涵蓋13檔，略顯分散。部分時期過度交易（3月53筆獲利大幅下降）。",
    jg_advice: "聚焦微台指+旺宏，其他個股期貨在建立穩定獲利模式前暫停。設定每月最大交易筆數不超過20筆。"
  },
  {
    name: "雷克斯",
    period: "2025/04 - 2026/03",
    total_trades: null,
    style: "多空雙做，指數期貨",
    market: "台指期貨",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: "-213,792 TWD",
    grade: "C",
    top_symbols: ["台指期 (TX)", "台指CALL", "台指PUT"],
    highlight: "台指從18,400漲到23,500的大多頭行情中，587口累積+801,694的獲利，平均每口+1,366元。4-6月244口+294,686，顯示在趨勢初期就已正確建立多頭部位。",
    weakness: "130口空單虧損-1,034,159，單一期間虧損吞噬前4個月全部獲利還倒賠23萬。同時持有多頭和空頭部位、淨曝險不明確是核心問題。",
    jg_advice: "禁止在大多頭行情中做空。先選定方向再交易，不要同時持有多空部位，否則只是在付手續費。"
  },
  {
    name: "黃博裕",
    period: "2025/12 - 2026/03",
    total_trades: null,
    style: "美股波段",
    market: "美股",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: null,
    grade: null,
    top_symbols: ["精確 (3162)", "緯創 (3231)", "TSLA", "RKLB", "CRSP"],
    highlight: "TSLA虧-6.7%出場（30天），RKLB虧-6.7%隔天就砍（1天）。停損執行力存在，只是出場時機需要更早。CRSP從$46.41漲到$61（+30%）時有識別到獲利機會。",
    weakness: "TSLA持有30天才停損，應在-5%就出場。CRSP漲到+30%後沒有停利或移動停損，最後$51賣出利潤大幅回吐。RKLB在$71追高買入接近高點$72.7。",
    jg_advice: "建立明確的進出場規則：跌破買入價8%立即停損，不等待。上漲超過15%設移動停損（高點-5%出場），讓利潤多跑。禁止在股票距高點不到5%時買入。"
  },
  {
    name: "黃蔚凱",
    period: "2025/12 - 2026/03",
    total_trades: null,
    style: "短線快進快出",
    market: "美股",
    win_rate: null,
    avg_profit: null,
    avg_loss: null,
    net_pnl: null,
    grade: null,
    top_symbols: ["HOLO", "HIMS", "CRWD", "PLTR", "EOSE"],
    highlight: "HOLO、CRSP、MP（第一次）等短線操作，能在獲利10-20%時果斷出場，不貪心。EOSE從$14.5跌到$7.3仍願意全數停損出場，雖然出場太晚，但至少沒有繼續死抱。",
    weakness: "贏的部位砍太快（平均持有1-5天），輸的部位抱太久。HIMS從$28買入跌到$20（-29%）才出場，持有數週。",
    jg_advice: "反轉操作邏輯：獲利部位設移動停損讓它多跑，虧損部位設嚴格停損（-8%就出）。目前的模式剛好相反——贏的砍太快、輸的抱太久。"
  }
];

function gradeColor(grade: string | null) {
  if (!grade) return 'text-gray-400';
  if (grade.startsWith('A')) return 'text-green-400';
  if (grade.startsWith('B+')) return 'text-blue-400';
  if (grade.startsWith('B')) return 'text-blue-300';
  if (grade.startsWith('C+')) return 'text-yellow-400';
  return 'text-orange-400';
}

function marketBadge(market: string) {
  const colors: Record<string, string> = {
    '台股': 'bg-red-900/50 text-red-300',
    '美股': 'bg-blue-900/50 text-blue-300',
    '台指期貨': 'bg-purple-900/50 text-purple-300',
    '台股個股期貨': 'bg-purple-900/50 text-purple-300',
    '美國期貨': 'bg-indigo-900/50 text-indigo-300',
    '美股+選擇權': 'bg-blue-900/50 text-blue-300',
    '台股選擇權': 'bg-red-900/50 text-red-300',
    '混合': 'bg-gray-700/50 text-gray-300',
    '美股/台股混合': 'bg-gray-700/50 text-gray-300',
  };
  return colors[market] || 'bg-gray-700/50 text-gray-300';
}

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="inline-block bg-red-600/20 text-red-400 px-4 py-1 rounded-full text-sm mb-4 border border-red-600/30">
          JG 戰友交易分析
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          20位戰友操作拆解
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          2025/12 - 2026/03 實際交易記錄分析 · 由 JG 教練親自審閱
        </p>
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
          <div className="bg-[#1a1a1a] rounded-lg px-4 py-2 border border-[#333]">
            <span className="text-gray-400">總學員</span>
            <span className="ml-2 text-white font-bold">20位</span>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg px-4 py-2 border border-[#333]">
            <span className="text-gray-400">涵蓋市場</span>
            <span className="ml-2 text-white font-bold">台股・美股・期貨</span>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg px-4 py-2 border border-[#333]">
            <span className="text-gray-400">分析期間</span>
            <span className="ml-2 text-white font-bold">約3個月</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {STUDENTS.map((s) => (
          <div key={s.name} className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden hover:border-[#444] transition-colors">
            
            {/* Card Header */}
            <div className="p-5 border-b border-[#222]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-white">{s.name}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">{s.period}</p>
                </div>
                {s.grade && (
                  <span className={`text-sm font-bold ${gradeColor(s.grade)} bg-[#1a1a1a] px-2 py-1 rounded-lg border border-[#333] whitespace-nowrap ml-2`}>
                    {s.grade.split('（')[0]}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${marketBadge(s.market)}`}>
                  {s.market}
                </span>
                {s.style && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-400 border border-[#333]">
                    {s.style.length > 12 ? s.style.slice(0, 12) + '…' : s.style}
                  </span>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 divide-x divide-[#222] border-b border-[#222]">
              <div className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {s.total_trades != null ? s.total_trades : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">交易筆數</div>
              </div>
              <div className="p-3 text-center">
                <div className={`text-lg font-bold ${s.win_rate ? 'text-blue-400' : 'text-gray-500'}`}>
                  {s.win_rate || '—'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">勝率</div>
              </div>
              <div className="p-3 text-center">
                <div className={`text-sm font-bold ${s.net_pnl ? (s.net_pnl.startsWith('-') ? 'text-red-400' : 'text-green-400') : 'text-gray-500'}`}>
                  {s.net_pnl ? (s.net_pnl.length > 12 ? s.net_pnl.slice(0, 10) + '…' : s.net_pnl) : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">淨損益</div>
              </div>
            </div>

            {/* Avg profit/loss if available */}
            {(s.avg_profit || s.avg_loss) && (
              <div className="grid grid-cols-2 divide-x divide-[#222] border-b border-[#222] bg-[#0d0d0d]">
                <div className="p-2.5 text-center">
                  <div className="text-sm font-bold text-green-400">{s.avg_profit || '—'}</div>
                  <div className="text-xs text-gray-500">平均獲利</div>
                </div>
                <div className="p-2.5 text-center">
                  <div className="text-sm font-bold text-red-400">{s.avg_loss || '—'}</div>
                  <div className="text-xs text-gray-500">平均虧損</div>
                </div>
              </div>
            )}

            {/* Main symbols */}
            {s.top_symbols.length > 0 && (
              <div className="px-5 py-3 border-b border-[#222]">
                <div className="text-xs text-gray-500 mb-2">主要交易標的</div>
                <div className="flex flex-wrap gap-1.5">
                  {s.top_symbols.slice(0, 5).filter(sym => !sym.includes('損益') && !sym.includes('API') && !sym.includes('PDF') && sym.length > 1).map((sym, i) => (
                    <span key={i} className="text-xs bg-[#1a1a1a] text-gray-300 px-2 py-0.5 rounded border border-[#2a2a2a]">
                      {sym.length > 15 ? sym.slice(0, 14) + '…' : sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlight */}
            {s.highlight && (
              <div className="px-5 py-4 border-b border-[#222]">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-yellow-400 text-sm">✦</span>
                  <span className="text-xs font-semibold text-yellow-400">交易手法亮點</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {s.highlight.length > 200 ? s.highlight.slice(0, 200) + '…' : s.highlight}
                </p>
              </div>
            )}

            {/* JG Advice */}
            {s.jg_advice && (
              <div className="px-5 py-4 bg-[#0a0a0a]">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-red-400 text-sm">📍</span>
                  <span className="text-xs font-semibold text-red-400">JG建議</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {s.jg_advice.length > 150 ? s.jg_advice.slice(0, 150) + '…' : s.jg_advice}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-12 text-center">
        <p className="text-gray-600 text-sm">
          資料來源：戰友實際券商對帳單 2025/12 - 2026/03 · JG 團隊分析 · 僅供學習參考
        </p>
        <div className="mt-4">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← 返回首頁</a>
        </div>
      </div>
    </div>
  );
}
