# V2 實驗室 — 進化日誌

## 目標
每小時模擬學生使用、反思體驗、自動改善、測試部署。
執行至 2026/02/22 11:00 Taipei time。

## V2 現狀 (2026/02/22 01:30)
- **Pages**: Homepage (public feed), Auth, Admin, Student/[id]
- **APIs**: auth, register, insights, weekly-direction, trades, trades/upload, questions, questions/answer, questions/public, students/[id], admin/students, admin/stock-stats, stock-queries, leaderboard, missions, ocr
- **Features**: Gamification (XP, levels, badges, streaks, leaderboard, missions), OCR trade upload (Tesseract.js), question system, weekly direction, stock queries, bottom tab nav
- **Theme**: Dark navy + blue + amber, glass morphism
- **Stack**: Next.js 16.1.6 (Turbopack), Tailwind CSS
- **No FMP integration yet** — needs .env.local with API key
- **In-memory store** — data resets on cold start

## Evolution Rounds

### Round 1 (2026/02/22 01:30 → 03:00 Taipei)

**Student Flow Simulation:**
- ✅ Homepage → Auth → Student Dashboard
- ✅ Tested trade creation flow
- ✅ Tested FMP stock validation (AAPL, Apple Inc.)
- ✅ Verified toast notifications
- ✅ Confirmed improved empty states

**Critical UX Issues Identified & Fixed:**

1. **❌ No Stock Price Validation → ✅ FMP Integration**
   - Created `lib/fmp.ts` with FMP API client using `/stable/` endpoints
   - Added `/api/stock-price` endpoint for real-time quote lookup
   - Auto-fill current price when valid symbol entered
   - Real-time validation feedback: "✓ Apple Inc." (green) or "找不到此股票代號" (red)
   - **Impact:** Students get instant validation, reducing errors and building confidence

2. **❌ No Feedback After Trade Submission → ✅ Toast Notification System**
   - Created `lib/toast.tsx` component with auto-dismiss (3s)
   - Success/error variants with icons
   - **Impact:** Clear confirmation that action succeeded, better UX flow

3. **❌ Weak Empty States → ✅ Actionable CTAs**
   - Changed "還沒有紀錄" → "開始你的交易日記，追蹤每一次成長"
   - Added direct "記錄第一筆交易" button in empty state
   - **Impact:** More encouraging, reduces friction for first-time users

**Technical Details:**
- FMP API Key configured in Vercel environment: `FMP_API_KEY`
- Using `/stable/quote?symbol=X` endpoint (new stable API)
- Price auto-fill only when field is empty (preserves manual edits)
- Symbol validation triggers on `onBlur` event
- Toast auto-dismiss after 3000ms
- All TypeScript types verified (`npx tsc --noEmit`)

**Deployment:**
- Commit: `7dec3cd` (feat(evolution-1): FMP integration + toast notifications + improved UX)
- Production: `https://jg-coach-v2.vercel.app`
- Build: ✅ Successful
- Verification: ✅ All features tested in production

**Metrics:**
- Files changed: 6 (+4 new)
- Lines added: ~236
- Build time: ~15s
- New API endpoint: 1 (`/api/stock-price`)

**What's Next (Round 2 ideas):**
- Add recent price change indicator (%, arrow up/down)
- Pre-populate common symbols as suggestions
- Add batch import from broker screenshot
- Improve leaderboard engagement
- Add weekly performance summary charts
