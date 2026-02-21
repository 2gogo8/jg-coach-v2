import { NextResponse } from 'next/server';
import { getAllQuestions } from '@/lib/store';

export const maxDuration = 30;

interface QuestionGroup {
  category: string;
  label: string;
  count: number;
  questions: Array<{
    id: string;
    studentName: string;
    content: string;
    answer?: string;
    answeredBy?: string;
    createdAt: string;
  }>;
  suggestedSolution?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  strategy: '策略規劃',
  analysis: '技術分析',
  mindset: '心態紀律',
  technical: '操作技巧',
  other: '其他',
};

const CATEGORY_SOLUTIONS: Record<string, string> = {
  strategy: '建立完整的交易計畫：進場條件、停損停利、倉位管理。避免衝動交易與攤平虧損部位。',
  analysis: '學會使用技術指標（SMA、RSI）判斷支撐壓力，結合量價關係確認訊號，不要只看單一指標。',
  mindset: '接受虧損是交易的一部分，專注執行紀律而非預測市場。記錄每筆交易的情緒狀態，建立心理韌性。',
  technical: '熟悉券商操作介面，善用停損單與限價單。盤前練習下單流程，避免盤中手忙腳亂。',
  other: '持續學習與記錄，定期覆盤，從錯誤中成長。',
};

export async function GET() {
  try {
    const allQuestions = getAllQuestions();
    
    // Get questions from this week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekQuestions = allQuestions.filter(q => {
      const qDate = new Date(q.createdAt);
      return qDate >= weekStart;
    });

    // Group by category
    const groups: Record<string, QuestionGroup> = {};
    
    weekQuestions.forEach(q => {
      const cat = q.category || 'other';
      if (!groups[cat]) {
        groups[cat] = {
          category: cat,
          label: CATEGORY_LABELS[cat] || cat,
          count: 0,
          questions: [],
          suggestedSolution: CATEGORY_SOLUTIONS[cat],
        };
      }
      groups[cat].count++;
      groups[cat].questions.push({
        id: q.id,
        studentName: q.studentName,
        content: q.content,
        answer: q.answer,
        answeredBy: q.answeredBy,
        createdAt: q.createdAt,
      });
    });

    // Sort groups by count (descending)
    const sortedGroups = Object.values(groups).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      totalQuestions: weekQuestions.length,
      groups: sortedGroups,
    });
  } catch (error) {
    console.error('Questions public API error:', error);
    return NextResponse.json({ error: '無法載入問題' }, { status: 500 });
  }
}
