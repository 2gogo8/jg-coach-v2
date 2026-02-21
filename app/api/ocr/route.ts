import { NextResponse } from 'next/server';
import { parseOcrText } from '@/lib/ocr-parser';

export const maxDuration = 30;

// This endpoint accepts raw OCR text (from client-side Tesseract.js) and parses it
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, imageBase64 } = body;

    // If Google Vision key exists, use it for better accuracy
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (apiKey && imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const visionRes = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: base64Data },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
            }],
          }),
          signal: AbortSignal.timeout(15000),
        }
      );
      if (visionRes.ok) {
        const visionData = await visionRes.json();
        const text = visionData.responses?.[0]?.fullTextAnnotation?.text || '';
        if (text) return NextResponse.json(parseOcrText(text));
      }
    }

    // Fallback: parse client-side OCR text
    if (!rawText) {
      return NextResponse.json({ trades: [], rawText: '', error: '未偵測到文字' });
    }

    return NextResponse.json(parseOcrText(rawText));
  } catch (err) {
    console.error('OCR route error:', err);
    return NextResponse.json({ error: 'OCR 處理失敗' }, { status: 500 });
  }
}
