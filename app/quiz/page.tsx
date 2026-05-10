'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ─── 類型定義 ────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  section: string;
  text: string;
  options: { label: string; text: string; scores: Partial<Record<Trait, number>> }[];
}

type Trait = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7';

interface TraderType {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  formula: (t: Record<Trait, number>) => number;
  decode: string;
  quote: string;
  warning: string;
}

interface Weakness {
  id: string;
  name: string;
  trigger: (answers: Record<number, string>) => boolean;
  warning: string;
}

// ─── 7 個特質說明 ─────────────────────────────────────────────────────────────
const TRAIT_LABELS: Record<Trait, { name: string; high: string; low: string }> = {
  T1: { name: '耐受孤獨', high: '不需外部認同，能獨自等待', low: '需要即時反饋，不耐孤獨' },
  T2: { name: '紀律一致性', high: '規則優先，不允許例外', low: '靈活彈性，隨情況調整' },
  T3: { name: '衝動感知', high: '靠直覺快速決斷', low: '靠邏輯系統性分析' },
  T4: { name: '風險承受度', high: '能接受大起大落', low: '偏好穩定可預期' },
  T5: { name: '系統信仰', high: '相信規則長期有效', low: '相信感覺和直覺' },
  T6: { name: '研究深度', high: '深入研究後才行動', low: '快速行動，邊做邊學' },
  T7: { name: '危險指數', high: '好賭、自我欺騙、混亂跳躍', low: '穩定、誠實、一致' },
};

// ─── 8 種交易者類型 ────────────────────────────────────────────────────────────
const TRADER_TYPES: TraderType[] = [
  {
    id: 'ambush', name: '伏擊者', emoji: '🐆',
    tagline: '等待就是武器，爆發才是目的',
    formula: t => t.T1*3 + t.T4*3 + t.T2*2 + t.T5*2,
    decode: '你有極強的耐受孤獨能力，能在沒有任何反饋的情況下等待很長時間。你不需要每天都有動作，你的能量在等待中積累，在爆發時釋放。你對風險的承受度高，能接受大起大落，進出有明確的邏輯，不是衝動。',
    quote: '大多數人輸在等不了，不是輸在看不懂。',
    warning: '高檔震盪是你最大的敵人。你擅長趨勢行情，但震盪市場會讓你的等待策略頻繁觸發假訊號。高點以上請嚴格縮小部位，只在最確定的機會出手，不要因為「感覺快要爆發了」而提前進場。'
  },
  {
    id: 'discipline', name: '紀律者', emoji: '⚙️',
    tagline: '不求每筆都賺，只求每筆都對',
    formula: t => t.T2*3 + t.T5*3 + t.T1*2 + t.T4*(-1),
    decode: '你是天生的規則執行者。你的完美主義不是追求完美的結果，而是追求完美的執行。你相信只要每一筆都按規則來，長期下來複利效果會讓你遠超大多數人。你不需要大賺，你需要的是不犯錯。',
    quote: '我不追求每筆都賺，我只追求每筆都對。',
    warning: '你最大的風險是「這次例外」。高點的市場充滿誘惑，每一天都有看起來很好的機會，但你的系統告訴你不要動。記住：你的系統是在你冷靜的時候設計的，不是在市場最熱的時候設計的。'
  },
  {
    id: 'striker', name: '閃擊者', emoji: '⚡',
    tagline: '感覺到了就要動，猶豫的人永遠在追',
    formula: t => t.T3*3 + t.T4*2 + t.T1*(-1),
    decode: '你靠的是對節奏的感知，而不是對邏輯的計算。你能在別人還沒反應的時候感覺到市場的轉折，然後快速出手。你的優勢在速度，你的弱點也在速度——太快有時候是太早。',
    quote: '感覺到了就要動，猶豫的人永遠在追。',
    warning: '你的感知能力在特定的標的和週期上是有效的，但在其他地方可能只是幻覺。請嚴格限制自己只在你最熟悉的那個戰場作戰，不要因為「感覺到了」就跨出你的舒適圈。'
  },
  {
    id: 'system', name: '系統者', emoji: '🔩',
    tagline: '系統的價值，在你最不想執行它的時候才體現',
    formula: t => t.T5*3 + t.T2*3 + t.T1*2 + t.T4*2,
    decode: '你是最難被市場打倒的那種人。你的系統不是最賺錢的，但是最耐磨的。你能在連輸五局之後繼續執行，因為你相信長期的樣本才是真相，短期的結果只是雜訊。',
    quote: '系統的價值，在你最不想執行它的時候才能體現。',
    warning: '你的風險是過度相信系統而忽略市場結構的根本改變。歷史高點是一個特殊的位置，市場的特性可能已經改變。請定期回測你的系統，確認它在當前的市場環境下還有效。'
  },
  {
    id: 'macro', name: '佈局者', emoji: '🗺️',
    tagline: '大多數人看價格，我看方向',
    formula: t => t.T6*3 + t.T1*2 + t.T4*2 + t.T5*2,
    decode: '你看的不是今天，你看的是三個月後、六個月後。你能把宏觀的經濟趨勢、產業輪動、政策方向整合成一個清晰的佈局，然後耐心等待市場走到你預期的位置。',
    quote: '大多數人看的是價格，我看的是方向。',
    warning: '宏觀佈局在趨勢市場中威力巨大，但在高檔震盪中容易讓你持有太久。請為你的每一個佈局設定明確的「失效條件」——如果這個條件觸發，不管你的宏觀判斷多有信心，都要先出場。'
  },
  {
    id: 'focus', name: '聚焦者', emoji: '🎯',
    tagline: '我只做我最懂的那一個，其他的我不碰',
    formula: t => t.T6*3 + t.T4*3 + t.T1*2 + t.T5*2,
    decode: '你把所有的資源和注意力集中在一個你深度研究過的領域，然後在這個領域做到極致。你不分散，你不跨界，你的護城河就是你比任何人都更了解你的戰場。',
    quote: '我只做我最懂的那一個，其他的我不碰。',
    warning: '你的風險是你的戰場可能因為市場結構改變而失效。你熟悉的那個標的或板塊可能不再是市場的主角。請保持對你戰場的持續研究，而不是依賴過去的經驗。'
  },
  {
    id: 'hunter', name: '主題獵人', emoji: '🎣',
    tagline: '主題的錢最好賺，但只有最早發現的人才能賺到',
    formula: t => t.T6*3 + t.T5*2 + t.T4*2 + t.T1*2,
    decode: '你有敏銳的嗅覺，能在主題還沒被市場廣泛認知之前就發現它，然後在主題爆發的時候站在最前面。你的優勢是早，你的風險也是早——太早進場有時候就是進場在沒人關注的地方等很久。',
    quote: '主題的錢最好賺，但只有最早發現的人才能賺到。',
    warning: '高點之後，每一個主題都會有大量的跟風者，主題的生命週期會越來越短。你需要更快地判斷「這個主題是真的還是假的」，並且更快地在主題退潮之前出場。'
  },
  {
    id: 'guardian', name: '守法者', emoji: '🏛️',
    tagline: '規則不是束縛，規則是保護',
    formula: t => t.T2*3 + t.T5*3 + t.T4*(-1) + t.T3*(-1),
    decode: '你是最嚴格的規則遵守者。你的系統不只是一套方法，它是你的信仰。你相信只要嚴格遵守規則，長期下來一定會有正期望值。你最大的優勢是你永遠不會因為情緒而破壞自己的系統。',
    quote: '規則不是束縛，規則是保護。',
    warning: '你的系統可能是在特定的市場環境下設計的。歷史高點是一個新的挑戰，市場的波動率和流動性可能都發生了變化。請確認你的系統參數在當前環境下仍然有效，必要時做適當的調整。'
  },
];

// ─── 致命弱點 ─────────────────────────────────────────────────────────────────
const WEAKNESSES: Weakness[] = [
  {
    id: 'gambler', name: '好賭心態',
    trigger: a => [a[4]==='A', a[19]==='A', a[20]==='A', a[21]==='D'].filter(Boolean).length >= 3,
    warning: '你有強烈的好賭傾向——在連勝後想加碼、在輸了後想立刻報復。這在高檔震盪的市場中是最危險的特質。市場不再是單邊上漲，你的這個特質會被放大懲罰。'
  },
  {
    id: 'delusion', name: '自我欺騙',
    trigger: a => [a[2]==='A', a[25]==='D', a[5]==='D'].filter(Boolean).length >= 2,
    warning: '你容易把運氣當成實力，在失敗時找理由，在成功時過度自信。最危險的不是虧損，而是你不知道自己為什麼賺錢。請誠實面對你的交易紀錄。'
  },
  {
    id: 'chaos', name: '混亂跳躍',
    trigger: a => [a[5]==='A', a[21]==='A', a[8]==='A'].filter(Boolean).length >= 2,
    warning: '你容易在方法不奏效時立刻換策略，在別人都在做的事情上跟風。頻繁換方法的人，永遠不知道自己的方法是否真的有效。'
  },
  {
    id: 'lossAversion', name: '損失厭惡過強',
    trigger: a => [a[2]==='A', a[9]==='A', a[7]==='D'].filter(Boolean).length >= 2,
    warning: '你對損失的恐懼遠大於對獲利的渴望。這讓你在該停損的時候繼續撐著，在該加碼的時候縮手。這個特質可能讓你在高點繼續持有，卻在低點恐慌賣出。'
  },
];

// ─── 25 題題目 ─────────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  // 消費決策篇
  {
    id: 1, section: '消費決策篇',
    text: '你走進一家從沒去過的球鞋店，只是「隨便逛逛」。結果你看到一雙你沒有計劃買、但「感覺超對」的鞋，限量款，只剩最後一雙，剛好是你的尺碼，價格是你月薪的10%。店員說：「今天不買，明天就沒了。」你的第一反應是？',
    options: [
      { label: 'A', text: '直接刷卡。感覺對就是對，人生苦短，猶豫的人永遠買不到好東西。', scores: { T3: 2, T7: 1 } },
      { label: 'B', text: '拍照存起來，走出店門，回家想三天。如果三天後還在想，再回來買。', scores: { T3: -1, T2: 1 } },
      { label: 'C', text: '問自己：「我真的需要這雙鞋嗎？它解決了我什麼問題？」想不出答案就不買。', scores: { T5: 2, T6: 1 } },
      { label: 'D', text: '不買。沒有計劃的消費就是失控的開始，再好看也不行。', scores: { T2: 2, T1: 1 } },
    ]
  },
  {
    id: 2, section: '消費決策篇',
    text: '你花了1,800元買了一張演唱會門票，但當天你根本不想去——門票不能退，不能轉讓，就是一張廢紙。你會怎麼做？',
    options: [
      { label: 'A', text: '還是去。已經花了1,800，不去太浪費，就算去了站在那裡發呆也要去。', scores: { T7: 1 } },
      { label: 'B', text: '不去。去了也沒心情，浪費時間比浪費錢更不值得，這1,800就當買個教訓。', scores: { T4: 2, T2: 1 } },
      { label: 'C', text: '試著在網路上賣掉，能回收多少算多少，哪怕只賣500也比0好。', scores: { T5: 1 } },
      { label: 'D', text: '去，但整場演唱會都在心裡計算「我這1,800元值不值得」，完全沒有享受到。', scores: { T7: 1 } },
    ]
  },
  {
    id: 3, section: '消費決策篇',
    text: '你在網路上看到一雙鞋，原價12,000，現在特價5,800。頁面上用紅色大字寫著：「限時優惠！省下6,200元！」你的朋友說：「這個超划算，我已經買了！」你的第一個念頭是？',
    options: [
      { label: 'A', text: '哇，省了一半多，這個不買太可惜了，趕快下單！', scores: { T7: 1 } },
      { label: 'B', text: '我只看這雙鞋值不值5,800，跟原價12,000完全沒有關係。', scores: { T5: 2 } },
      { label: 'C', text: '先去查一下這品牌的歷史售價、評測、其他平台的比價，確認這個價格是否真的划算。', scores: { T6: 2, T5: 1 } },
      { label: 'D', text: '我不需要這雙鞋。不管多便宜，不需要的東西就是浪費，不買。', scores: { T2: 2 } },
    ]
  },
  {
    id: 4, section: '消費決策篇',
    text: '朋友邀你玩一個遊戲：丟一枚硬幣。正面你贏3,000元，反面你輸1,000元。從數學上來說期望值是正的，但你要先掏出1,000元放在桌上。你會玩嗎？',
    options: [
      { label: 'A', text: '當然玩！期望值是正的，不玩才是傻瓜，這種機會要把握。', scores: { T4: 2, T3: 1 } },
      { label: 'B', text: '玩，但我要先確認這枚硬幣是公平的，確認規則沒有陷阱。', scores: { T5: 2, T6: 1 } },
      { label: 'C', text: '不玩。我不喜歡把錢的去留交給運氣，就算期望值是正的也不行。', scores: { T2: 1, T4: -1 } },
      { label: 'D', text: '看今天心情。狀態好就玩，狀態不好就算了。', scores: { T7: 1 } },
    ]
  },
  {
    id: 5, section: '消費決策篇',
    text: '你給自己定了一個規定：每個月只能吃一次高級餐廳。這個月你已經吃了一次。但這週五，你最好的朋友說：「我訂到了那家超難訂的餐廳，就缺你一個，你來嗎？」那家餐廳你等了快一年。你會怎麼做？',
    options: [
      { label: 'A', text: '去！規定是自己定的，自己當然可以改。人生不能太死板。', scores: { T3: 1, T2: -1 } },
      { label: 'B', text: '不去。規定就是規定，就算是夢寐以求的餐廳也不行，下個月再約。', scores: { T2: 2 } },
      { label: 'C', text: '去，但下個月扣回來——這個月算「借用」，下個月就不能去了。', scores: { T5: 1 } },
      { label: 'D', text: '去，然後告訴自己「這次是特殊情況，例外一次沒關係」，但心裡隱隱不安。', scores: { T7: 1 } },
    ]
  },
  {
    id: 6, section: '消費決策篇',
    text: '你的舊電腦終於壞了，預算是50,000元。你有三個選擇，你的決策方式是？',
    options: [
      { label: 'A', text: '直接看最近哪個YouTuber推薦什麼，他說好就買，省時間。', scores: { T7: 1 } },
      { label: 'B', text: '自己花一週研究規格、評測、使用者心得、比價，確定最適合自己的再買。', scores: { T6: 2, T5: 1 } },
      { label: 'C', text: '先決定「我的預算是50,000，不超支」，在這個範圍內找最好的，超過預算直接排除。', scores: { T2: 2, T5: 1 } },
      { label: 'D', text: '直接去門市，讓店員介紹，感覺對了就買，反正電腦都差不多。', scores: { T3: 1 } },
    ]
  },
  {
    id: 7, section: '消費決策篇',
    text: '你做了一個決定——結果不如預期，你損失了一些時間或金錢。你最常有的內心獨白是哪一種？',
    options: [
      { label: 'A', text: '「我早就知道這樣，我為什麼要做這個決定？我真的很蠢。」（反覆自責）', scores: { T7: 1 } },
      { label: 'B', text: '「好，損失就損失了。現在的問題是：接下來怎麼辦？」（快速切換）', scores: { T4: 2, T1: 1 } },
      { label: 'C', text: '「沒關係，這只是暫時的，它一定會回來的，我繼續等。」（堅持等待）', scores: { T1: 1, T5: 1 } },
      { label: 'D', text: '「我要趕快把這個損失補回來，我不能就這樣算了。」（急著彌補）', scores: { T7: 2 } },
    ]
  },
  {
    id: 8, section: '消費決策篇',
    text: '你的朋友圈最近有一個新話題席捲所有人——每個人都在討論，每個人都說「你一定要試試看」，你的IG限動全是這個。但你沒有參與。你的感受是？',
    options: [
      { label: 'A', text: '有點焦慮。感覺自己落後了，大家都在討論我卻什麼都不知道，我應該趕快加入。', scores: { T7: 1, T1: -1 } },
      { label: 'B', text: '沒什麼感覺。我有自己的節奏，不需要跟著大家走。', scores: { T1: 2 } },
      { label: 'C', text: '先觀察。如果一個月後大家還在討論，那可能真的有價值，再說。', scores: { T6: 1, T5: 1 } },
      { label: 'D', text: '反而更謹慎。大家都在做的事，通常是最後才知道的人在做，我要小心。', scores: { T1: 1, T5: 1 } },
    ]
  },
  {
    id: 9, section: '消費決策篇',
    text: '你在一家評價不錯的餐廳，點了一道你很期待的菜，吃了幾口，發現根本不好吃，這道菜要350元，你已經吃了三分之一。你會怎麼做？',
    options: [
      { label: 'A', text: '繼續吃完。已經花了350，不吃完更浪費，就算難吃也要吃完。', scores: { T7: 1 } },
      { label: 'B', text: '直接不吃了，叫服務生過來，告訴他這道菜不符合預期，看能不能換一道。', scores: { T4: 1, T2: 1 } },
      { label: 'C', text: '繼續吃，但一邊吃一邊在心裡罵，然後回去給一星評價。', scores: { T7: 1 } },
      { label: 'D', text: '不吃了，但不跟服務生說，默默把盤子推到旁邊，繼續點其他的。', scores: { T4: 1, T1: 1 } },
    ]
  },
  // 原生家庭篇
  {
    id: 10, section: '原生家庭篇',
    text: '回想你小時候的家庭財務狀況（國小、國中時期），你對家裡「有沒有錢」的感受。',
    options: [
      { label: 'A', text: '起伏很大。有時候家裡很寬裕，有時候很緊，我從小就習慣了這種不確定感。', scores: { T4: 1, T1: 1 } },
      { label: 'B', text: '非常穩定。父母很保守，從不冒險，存錢第一，安全感是家裡最重要的東西。', scores: { T2: 1, T4: -1 } },
      { label: 'C', text: '普通，不好不壞。按部就班，沒有大起大落，日子就這樣過。', scores: { T2: 1 } },
      { label: 'D', text: '父母是做生意的。我看著他們有時候大賺、有時候大虧，從小就覺得這很正常。', scores: { T4: 2, T3: 1 } },
    ]
  },
  {
    id: 11, section: '原生家庭篇',
    text: '你的家人在做重大決定的時候（買房、換工作、做一筆大的投資），他們的方式是什麼？',
    options: [
      { label: 'A', text: '討論很久，列清單，比較優缺點，查很多資料，確認每個細節都想清楚了才行動。', scores: { T5: 2, T6: 1 } },
      { label: 'B', text: '靠感覺。感覺對了就做，不需要太多分析，想太多反而會錯過機會。', scores: { T3: 2 } },
      { label: 'C', text: '通常是一個人說了算，另一個人跟著走，不太有討論的空間。', scores: { T1: 1 } },
      { label: 'D', text: '盡量維持現狀。能不做決定就不做，改變讓家裡的人感到不安。', scores: { T2: 1, T4: -1 } },
    ]
  },
  {
    id: 12, section: '原生家庭篇',
    text: '你小時候做錯事或失敗了——考試考差了、比賽輸了、把東西弄壞了——家裡的反應通常是什麼？',
    options: [
      { label: 'A', text: '嚴厲批評。「你怎麼這麼不小心」「你怎麼這麼笨」，失敗是很丟臉的事，不能被接受。', scores: { T7: 1, T4: -1 } },
      { label: 'B', text: '一起分析原因。「這次哪裡出了問題？下次可以怎麼做？」失敗是學習的機會。', scores: { T5: 1, T6: 1 } },
      { label: 'C', text: '沒什麼反應。失敗就失敗，沒什麼大不了，站起來繼續走就對了。', scores: { T4: 2, T1: 1 } },
      { label: 'D', text: '過度保護。想辦法讓我不要面對失敗，或者幫我把問題解決掉，讓我不用承擔後果。', scores: { T4: -1, T7: 1 } },
    ]
  },
  {
    id: 13, section: '原生家庭篇',
    text: '想像一個場景：你一個人在家，沒有手機、沒有網路、沒有任何計劃，一整個下午什麼都不做。沒有人找你，沒有通知，什麼都沒有。只有你和安靜。你的感受是？',
    options: [
      { label: 'A', text: '很舒服。這是我最需要的狀態，安靜讓我充電，我可以這樣待一整天。', scores: { T1: 2 } },
      { label: 'B', text: '一開始還好，但大概兩個小時後開始坐立不安，腦袋一直想要找事情做。', scores: { T1: 1 } },
      { label: 'C', text: '很不舒服。我需要有事情做，或者有人陪，完全的空白讓我焦慮。', scores: { T1: -1, T7: 1 } },
      { label: 'D', text: '我會主動創造事情做——整理房間、規劃下週、看書——我沒辦法真的「什麼都不做」。', scores: { T3: 1 } },
    ]
  },
  {
    id: 14, section: '原生家庭篇',
    text: '你的家人對「錢」這件事，最核心的信念是什麼？（選一個最符合你從小聽到大的那句話）',
    options: [
      { label: 'A', text: '「錢是要存起來的。花錢是不安全的，手上有錢才有安全感。」', scores: { T4: -1, T2: 1 } },
      { label: 'B', text: '「錢是工具。讓它流動，讓它工作，才能創造更多。」', scores: { T4: 1, T5: 1 } },
      { label: 'C', text: '「錢要靠努力賺。沒有捷徑，踏實工作才是正道。」', scores: { T2: 1, T6: 1 } },
      { label: 'D', text: '「有機會就要抓。不冒險的錢永遠不會增加，機會來了就要敢下。」', scores: { T4: 2, T3: 1 } },
    ]
  },
  {
    id: 15, section: '原生家庭篇',
    text: '你的同學、朋友、同事，有人比你更早買房、更早升職、更早賺到你想要的東西。你在IG上看到他們曬出新車、新房、新生活。你的內心獨白是？',
    options: [
      { label: 'A', text: '「好羨慕，但這讓我更有動力，我也要加油。」（激勵型）', scores: { T4: 1 } },
      { label: 'B', text: '「跟我有什麼關係？我走我自己的路，我的時間表是我自己的。」（獨立型）', scores: { T1: 2 } },
      { label: 'C', text: '「我是不是落後了？我是不是哪裡做錯了？我需要趕快追上。」（焦慮型）', scores: { T7: 1, T1: -1 } },
      { label: 'D', text: '「他們是怎麼做到的？有沒有什麼值得我學習的方法？」（學習型）', scores: { T6: 2 } },
    ]
  },
  {
    id: 16, section: '原生家庭篇',
    text: '你從小到大對「規則」的態度是？',
    options: [
      { label: 'A', text: '規則就是規則。不管合不合理，先遵守再說。打破規則的代價太高，不值得。', scores: { T2: 2, T5: 1 } },
      { label: 'B', text: '有道理的規則我遵守，沒道理的我會質疑，甚至想辦法改變它。', scores: { T5: 1, T6: 1 } },
      { label: 'C', text: '規則是用來打破的。我喜歡找規則的邊界，看看哪裡有空間可以操作。', scores: { T3: 1, T7: 1 } },
      { label: 'D', text: '規則給我安全感。知道邊界在哪裡，我才知道自己在哪裡，才能放心行動。', scores: { T2: 1, T4: -1 } },
    ]
  },
  {
    id: 17, section: '原生家庭篇',
    text: '做人生中重要的決定時——換工作、搬家、結束一段關係——你的模式是？',
    options: [
      { label: 'A', text: '自己想清楚就好，不太需要別人的意見。我知道自己要什麼。', scores: { T1: 2, T5: 1 } },
      { label: 'B', text: '廣泛詢問各方意見，問完之後綜合所有資訊再做決定。', scores: { T6: 1 } },
      { label: 'C', text: '找一個最信任的人問，聽他的，因為我信任他的判斷超過我自己的。', scores: { T1: -1 } },
      { label: 'D', text: '先自己深入研究，想清楚之後再找少數幾個人確認，主要是驗證自己的想法。', scores: { T6: 2, T1: 1 } },
    ]
  },
  // 競爭心態篇
  {
    id: 18, section: '競爭心態篇',
    text: '你在玩一個競爭遊戲（棋盤遊戲、電玩、麻將、撲克牌都行）。你的策略風格是？',
    options: [
      { label: 'A', text: '先花時間觀察對手的習慣和模式，找出規律，然後針對他的弱點制定策略。', scores: { T6: 2, T5: 1 } },
      { label: 'B', text: '靠直覺和反應。感覺到機會就出手，不需要想太多，想太多反而會慢。', scores: { T3: 2 } },
      { label: 'C', text: '我有一套固定的打法，不管對手是誰、怎麼變，我就執行我的策略，不被對手牽著走。', scores: { T2: 2, T5: 2 } },
      { label: 'D', text: '完全根據對手的行動即時調整，沒有固定打法，對手怎麼出我就怎麼應。', scores: { T3: 1, T6: 1 } },
    ]
  },
  {
    id: 19, section: '競爭心態篇',
    text: '你在競爭中輸了——遊戲輸了、比賽輸了、談判輸了、被人搶先了。你的第一反應是什麼？',
    options: [
      { label: 'A', text: '「再來一局！我要把輸的贏回來，現在就要再來。」（立刻報復）', scores: { T7: 2 } },
      { label: 'B', text: '先冷靜下來，分析為什麼輸——是策略問題？執行問題？還是對手太強？然後下次改進。', scores: { T5: 1, T6: 1 } },
      { label: 'C', text: '「輸了就輸了，下一場。」沒有太多情緒，繼續前進。', scores: { T4: 2, T1: 1 } },
      { label: 'D', text: '很難受，需要一段時間消化，可能會悶悶不樂幾個小時甚至幾天。', scores: { T4: -1 } },
    ]
  },
  {
    id: 20, section: '競爭心態篇',
    text: '你連贏了五局。不管是什麼遊戲，你就是連贏了五次。你的內心狀態是？',
    options: [
      { label: 'A', text: '「我今天手感超好！繼續加碼，趁現在！」', scores: { T7: 2 } },
      { label: 'B', text: '「這只是機率，連贏五局不代表第六局也會贏，每一局都是獨立的。」', scores: { T5: 2 } },
      { label: 'C', text: '「我的策略有效，繼續執行，不要因為連贏就改變任何東西。」', scores: { T2: 1, T5: 1 } },
      { label: 'D', text: '「連贏之後反而要更謹慎，驕傲是輸的開始，我要保持清醒。」', scores: { T2: 1, T1: 1 } },
    ]
  },
  {
    id: 21, section: '競爭心態篇',
    text: '你連輸了五局。五連敗。你的反應是？',
    options: [
      { label: 'A', text: '「這個方法不行了，我要換一個策略，繼續用這個只會繼續輸。」', scores: { T7: 1 } },
      { label: 'B', text: '「五局太少，樣本不夠，繼續執行，不要因為短期結果改變長期策略。」', scores: { T2: 1, T5: 1 } },
      { label: 'C', text: '先暫停，認真分析：「是我的策略本身有問題，還是我的執行出了問題？」找到答案再繼續。', scores: { T5: 2, T6: 1 } },
      { label: 'D', text: '「我要加大賭注，一次把輸的全部贏回來。」', scores: { T7: 2 } },
    ]
  },
  {
    id: 22, section: '競爭心態篇',
    text: '在競爭中，你最大的優勢是什麼？（選一個最真實描述你的選項）',
    options: [
      { label: 'A', text: '「我反應快。別人還在想的時候，我已經出手了。速度就是我的武器。」', scores: { T3: 2 } },
      { label: 'B', text: '「我研究得比別人深。我花時間去了解別人懶得了解的細節，這是我的護城河。」', scores: { T6: 2, T5: 1 } },
      { label: 'C', text: '「我的系統很穩定。我能長期執行同一套方法而不崩潰，這比任何技術都重要。」', scores: { T2: 2, T1: 1 } },
      { label: 'D', text: '「我能看到大方向。別人在看細節的時候，我在看全局，這讓我比別人早一步。」', scores: { T6: 1, T5: 1 } },
    ]
  },
  {
    id: 23, section: '競爭心態篇',
    text: '你在某個領域有一個你非常確定的判斷。但是，你周圍所有的人——你的朋友、你的同事、你信任的人——都說你錯了。所有人都說你錯了，只有你自己覺得你是對的。你會怎麼做？',
    options: [
      { label: 'A', text: '重新思考。這麼多人都說我錯，也許他們是對的，我應該調整我的判斷。', scores: { T1: -1, T7: 1 } },
      { label: 'B', text: '繼續按照我的判斷行動。除非有新的、具體的證據說服我，否則我不改變。', scores: { T1: 2, T5: 1 } },
      { label: 'C', text: '先暫停，去收集更多資訊，確認到底是我錯了還是大家都錯了，再做決定。', scores: { T6: 2 } },
      { label: 'D', text: '表面上跟著大家走，但心裡還是按照自己的判斷行動，兩邊都留退路。', scores: { T1: 1 } },
    ]
  },
  {
    id: 24, section: '競爭心態篇',
    text: '你參加了一個為期三個月的長期競賽——前兩個月你的成績很差，排名墊底，但你相信第三個月會爆發。周圍的人開始懷疑你，甚至有人建議你換策略。你會怎麼做？',
    options: [
      { label: 'A', text: '繼續執行原來的計劃。我相信長期結果，短期的雜音不影響我。', scores: { T1: 2, T2: 1 } },
      { label: 'B', text: '調整策略。兩個月的數據已經夠了，如果方向不對，繼續執行只是浪費時間。', scores: { T3: 1, T5: 1 } },
      { label: 'C', text: '撐下去，但開始懷疑自己。一邊執行一邊在心裡問：「我是不是真的錯了？」', scores: { T1: 1 } },
      { label: 'D', text: '退出，找一個能更快看到成果的目標。等三個月太久了，我需要更即時的反饋。', scores: { T3: 1, T1: -1 } },
    ]
  },
  {
    id: 25, section: '競爭心態篇',
    text: '你在某個領域連續成功了幾次——可能是連續幾次猜對了趨勢、連續幾次談判成功、連續幾次做對了決定。你對自己的評估是？',
    options: [
      { label: 'A', text: '「我在這個領域有天賦，我就是比別人更有感覺，這不是運氣。」', scores: { T7: 1 } },
      { label: 'B', text: '「我在這個特定情境下表現不錯，但我不確定這能不能持續，我需要更多數據。」', scores: { T5: 1, T6: 1 } },
      { label: 'C', text: '「我的方法有效，但幾次成功太少，我需要更大的樣本才能確認這是真的有效。」', scores: { T5: 2, T6: 1 } },
      { label: 'D', text: '「我對這個領域的理解，已經超過大多數人了。我看到了別人看不到的東西。」', scores: { T7: 2 } },
    ]
  },
];

// ─── 計算函數 ─────────────────────────────────────────────────────────────────
function calcTraits(answers: Record<number, string>): Record<Trait, number> {
  const t: Record<Trait, number> = { T1:0, T2:0, T3:0, T4:0, T5:0, T6:0, T7:0 };
  QUESTIONS.forEach(q => {
    const chosen = answers[q.id];
    if (!chosen) return;
    const opt = q.options.find(o => o.label === chosen);
    if (!opt) return;
    Object.entries(opt.scores).forEach(([k, v]) => { t[k as Trait] += v; });
  });
  return t;
}

function calcType(t: Record<Trait, number>): TraderType {
  let best = TRADER_TYPES[0]; let bestScore = -Infinity;
  TRADER_TYPES.forEach(type => {
    const score = type.formula(t);
    if (score > bestScore) { bestScore = score; best = type; }
  });
  return best;
}

function t7Level(score: number) {
  if (score <= 2) return { level: '純實力派', color: '#30D158', desc: '高度穩定，沒有明顯危險訊號，你的成果來自真實的能力積累。' };
  if (score <= 5) return { level: '實力為主', color: '#FFD60A', desc: '偶爾有情緒化傾向，但整體穩健，需要注意特定情境下的衝動。' };
  if (score <= 9) return { level: '混合型', color: '#FF9F0A', desc: '有明顯的危險訊號，你的成果中有相當比例是市場給的，需要高度警覺。' };
  return { level: '運氣為主', color: '#FF453A', desc: '充滿好賭心態與自我欺騙，市場漲勢掩蓋了你的問題，市場一旦轉向，風險極高。' };
}

// ─── PDF 生成（列印方式，支援中文）───────────────────────────────────────────
function generatePDF(_name: string, _type: TraderType, _traits: Record<Trait, number>, _weaknesses: Weakness[], _answers: Record<number, string>) {
  // 注入列印樣式，降低關烦元素
  const style = document.createElement('style');
  style.id = 'print-style';
  style.textContent = `
    @media print {
      body > *:not(#print-wrapper) { display: none !important; }
      #print-wrapper { display: block !important; }
      nav, header, footer { display: none !important; }
      a[href]:not(.print-keep) { color: inherit !important; }
      button { display: none !important; }
      @page { margin: 10mm; }
    }
  `;
  document.head.appendChild(style);

  // 建立列印專用容器
  const wrapper = document.createElement('div');
  wrapper.id = 'print-wrapper';
  wrapper.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; background:#000; color:#fff; padding:20px; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,sans-serif;';

  // 複製結果內容
  const resultEl = document.getElementById('result-content');
  if (resultEl) {
    wrapper.innerHTML = resultEl.innerHTML;
  }
  document.body.appendChild(wrapper);

  // 列印
  setTimeout(() => {
    window.print();
    // 列印後清除
    setTimeout(() => {
      document.head.removeChild(style);
      document.body.removeChild(wrapper);
    }, 1000);
  }, 100);
}

// ─── 主頁面 ───────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [name, setName] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [traits, setTraits] = useState<Record<Trait, number>>({ T1:0,T2:0,T3:0,T4:0,T5:0,T6:0,T7:0 });
  const [resultType, setResultType] = useState<TraderType | null>(null);
  const [triggeredWeaknesses, setTriggeredWeaknesses] = useState<Weakness[]>([]);

  const S = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' };

  const handleAnswer = useCallback((label: string) => {
    const qId = QUESTIONS[currentQ].id;
    const newAnswers = { ...answers, [qId]: label };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      // 計算結果
      const t = calcTraits(newAnswers);
      const type = calcType(t);
      const weak = WEAKNESSES.filter(w => w.trigger(newAnswers));
      setTraits(t);
      setResultType(type);
      setTriggeredWeaknesses(weak);
      setPhase('result');
    }
  }, [answers, currentQ]);

  const progress = Math.round((currentQ / QUESTIONS.length) * 100);
  const section = QUESTIONS[currentQ]?.section;

  // ── Intro ──
  if (phase === 'intro') return (
    <div style={{ ...S, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100vh' }}>
      <Link href="/" style={{ position: 'absolute', top: 20, left: 20, fontSize: 13, color: '#636366', textDecoration: 'none' }}>← 返回</Link>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔮</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,0,26,0.12)', border: '1px solid rgba(232,0,26,0.25)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
          <span style={{ fontSize: 11, color: '#E8001A', fontWeight: 500 }}>交易者心理測驗 v3.0 · JGClaw</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>你在行情中賺到的，<br />是實力還是運氣？</h1>
        <p style={{ fontSize: 15, color: '#8A8A8E', lineHeight: 1.7, marginBottom: 32 }}>
          25 個日常情境題，找出你骨子裡的交易基因。<br />
          測驗完成後，獲得你專屬的個性化分析報告。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 32 }}>
          {['25 題情境測驗', '8 種交易風格', '個性化報告'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 8px', fontSize: 12, color: '#8A8A8E', textAlign: 'center' }}>{t}</div>
          ))}
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="請輸入你的名字"
          maxLength={20}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 18px', fontSize: 16, color: '#fff', outline: 'none', marginBottom: 14, boxSizing: 'border-box' }}
          onKeyDown={e => e.key === 'Enter' && name.trim() && setPhase('quiz')}
        />
        <button
          onClick={() => name.trim() && setPhase('quiz')}
          disabled={!name.trim()}
          style={{ width: '100%', background: name.trim() ? '#E8001A' : '#333', color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 17, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
        >
          開始測驗 →
        </button>
      </div>
    </div>
  );

  // ── Quiz ──
  if (phase === 'quiz') {
    const q = QUESTIONS[currentQ];
    return (
      <div style={{ ...S, padding: '0 0 40px' }}>
        {/* Progress */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#E8001A', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 24px 0' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 12, color: '#636366' }}>{section}</span>
            <span style={{ fontSize: 12, color: '#636366' }}>{currentQ + 1} / {QUESTIONS.length}</span>
          </div>
          {/* Question */}
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px', lineHeight: 1.6, marginBottom: 28, color: '#fff' }}>
            Q{q.id}. {q.text}
          </div>
          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleAnswer(opt.label)}
                style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px', textAlign: 'left', cursor: 'pointer', color: '#fff', fontSize: 14, lineHeight: 1.6, transition: 'all 0.15s ease', display: 'flex', gap: 14, alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8001A'; e.currentTarget.style.background = 'rgba(232,0,26,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(28,28,30,0.8)'; }}
              >
                <span style={{ background: 'rgba(232,0,26,0.15)', color: '#E8001A', border: '1px solid rgba(232,0,26,0.3)', borderRadius: 8, padding: '2px 9px', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{opt.label}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
          {/* Back */}
          {currentQ > 0 && (
            <button onClick={() => setCurrentQ(c => c - 1)} style={{ marginTop: 20, background: 'none', border: 'none', color: '#636366', fontSize: 13, cursor: 'pointer', padding: 0 }}>
              ← 上一題
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Result ──
  if (phase === 'result' && resultType) {
    const t7 = t7Level(traits.T7);
    return (
      <div style={{ ...S, padding: '40px 24px 80px' }}>
        <div id="result-content" style={{ maxWidth: 580, margin: '0 auto', padding: '0 0 20px' }}>
          <Link href="/" style={{ fontSize: 13, color: '#636366', textDecoration: 'none' }}>← 返回首頁</Link>

          {/* Type Header */}
          <div style={{ textAlign: 'center', margin: '32px 0 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>{resultType.emoji}</div>
            <div style={{ fontSize: 12, color: '#E8001A', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>{name} 的交易者類型</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', margin: '0 0 8px' }}>{resultType.name}</h2>
            <p style={{ fontSize: 15, color: '#8A8A8E', fontStyle: 'italic' }}>「{resultType.tagline}」</p>
          </div>

          {/* Decode */}
          <div style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#E8001A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>個性解碼</div>
            <p style={{ fontSize: 14, color: '#EBEBF5CC', lineHeight: 1.75, margin: 0 }}>{resultType.decode}</p>
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(232,0,26,0.08)', border: '1px solid rgba(232,0,26,0.2)', borderRadius: 12 }}>
              <span style={{ fontSize: 14, color: '#E8001A', fontWeight: 600 }}>「{resultType.quote}」</span>
            </div>
          </div>

          {/* Warning */}
          <div style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.2)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#FF9F0A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>⚠️  操作注意事項</div>
            <p style={{ fontSize: 14, color: '#EBEBF5CC', lineHeight: 1.75, margin: 0 }}>{resultType.warning}</p>
          </div>

          {/* T7 */}
          <div style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#8A8A8E', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>危險指數</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: t7.color }}>{traits.T7}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t7.color }}>{t7.level}</div>
                <div style={{ fontSize: 11, color: '#636366' }}>T7 危險指數</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#8A8A8E', lineHeight: 1.6, margin: 0 }}>{t7.desc}</p>
          </div>

          {/* Trait bars */}
          <div style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#8A8A8E', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>七大特質分析</div>
            {(['T1','T2','T3','T4','T5','T6','T7'] as Trait[]).map(k => {
              const score = traits[k]; const info = TRAIT_LABELS[k]; const maxS = 12;
              const pct = Math.max(0, Math.min(100, score / maxS * 100));
              return (
                <div key={k} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: '#EBEBF5CC' }}>{info.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: k === 'T7' ? '#FF453A' : '#fff' }}>{score}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: k === 'T7' ? '#FF453A' : '#30D158', borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weaknesses */}
          {triggeredWeaknesses.length > 0 ? (
            <div style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#FF453A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 14 }}>⚠️  偵測到的致命弱點</div>
              {triggeredWeaknesses.map(w => (
                <div key={w.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FF453A', marginBottom: 6 }}>▶ {w.name}</div>
                  <p style={{ fontSize: 13, color: '#EBEBF5CC', lineHeight: 1.65, margin: 0 }}>{w.warning}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 20, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#30D158' }}>未偵測到致命弱點</div>
              <div style={{ fontSize: 12, color: '#636366', marginTop: 4 }}>你的心理結構相對穩定，但請持續保持自我覺察。</div>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <button
              onClick={() => generatePDF(name, resultType!, traits, triggeredWeaknesses, answers)}
              style={{ background: '#E8001A', color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >
              📄 下載我的個性化報告 PDF
            </button>
            <button
              onClick={() => { setPhase('intro'); setCurrentQ(0); setAnswers({}); setName(''); }}
              style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px', fontSize: 14, cursor: 'pointer' }}
            >
              重新測驗
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
