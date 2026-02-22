# Upstash Redis 設定指南

## 為什麼需要這個？
V2 原本使用 file-based storage，在 Vercel 上無法持久化（冷啟動/重部署會丟失資料）。現在改用 Upstash Redis 來實現真正的持久化存儲。

## 設定步驟

### 1. 註冊 Upstash 並建立資料庫

1. 前往 [Upstash Console](https://console.upstash.com/)
2. 註冊/登入（可用 GitHub 快速登入）
3. 點擊 "Create Database"
4. 設定：
   - Name: `jg-coach-v2-store`
   - Type: Regional（免費版）
   - Region: 選擇 **ap-northeast-1** (Tokyo, 亞洲最近的區域)
5. 點擊 "Create"

### 2. 取得連接資訊

建立完成後，在 Database 頁面會看到：
- **UPSTASH_REDIS_REST_URL**: 類似 `https://xxx-xxx-12345.upstash.io`
- **UPSTASH_REDIS_REST_TOKEN**: 長字串 token

### 3. 設定 Vercel 環境變數

**方法 A: 使用 Vercel Dashboard（推薦）**

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案 `jg-coach-v2`
3. Settings → Environment Variables
4. 新增兩個變數：
   - Name: `UPSTASH_REDIS_REST_URL`, Value: 從 Upstash 複製
   - Name: `UPSTASH_REDIS_REST_TOKEN`, Value: 從 Upstash 複製
5. Environment: 選擇 **Production, Preview, and Development**
6. 點擊 "Save"

**方法 B: 使用 Vercel CLI**

```bash
cd /Users/jgtruestock/.openclaw/workspace/projects/jg-coach-v2
npx vercel env add UPSTASH_REDIS_REST_URL
# 貼上 URL 後按 Enter
npx vercel env add UPSTASH_REDIS_REST_TOKEN
# 貼上 Token 後按 Enter
```

### 4. 本地開發設定（可選）

如果要在本地測試，創建 `.env.local`：

```bash
echo "UPSTASH_REDIS_REST_URL=你的_URL" > .env.local
echo "UPSTASH_REDIS_REST_TOKEN=你的_TOKEN" >> .env.local
```

### 5. 重新部署

```bash
cd /Users/jgtruestock/.openclaw/workspace/projects/jg-coach-v2
npx vercel deploy --prod --yes
```

## 驗證

部署完成後：

1. 前往 `https://jg-coach-v2.vercel.app`
2. 註冊一個測試學生
3. 記錄一筆交易
4. **重新整理頁面** → 資料應該還在！
5. 前往 Upstash Console → 你的 Database → Data Browser，可以看到 `jg-coach-store-v2` 這個 key

## 免費額度

- 10,000 commands/day（絕對夠用）
- 256 MB storage
- 如果超過，Upstash 會通知，不會直接收費

## Troubleshooting

**問題：部署後出現 "Redis not configured" 警告**
- 檢查環境變數是否正確設定
- 確認變數名稱完全一致（大小寫敏感）

**問題：資料還是消失了**
- 確認 Upstash database 狀態是 Active
- 檢查 Vercel 部署日誌是否有錯誤

**問題：本地開發無法連接**
- 確認 `.env.local` 存在且正確
- 重啟 Next.js dev server: `npm run dev`
