# ⚡ 快速設定指南（5 分鐘完成）

## 🎯 目標
讓 V2 實驗室的資料在 Vercel 上持久化存儲，不會因為重部署而消失。

## 📋 步驟

### Step 1: 建立 Upstash Redis 資料庫

**快速連結**: https://console.upstash.com/login

1. 用 GitHub 登入（最快）
2. 點擊 **"Create Database"**
3. 填寫：
   - **Name**: `jg-coach-v2`
   - **Type**: Regional (免費)
   - **Region**: **Japan (ap-northeast-1)** ← 選這個！
4. 點 **"Create"**

建立完成後，畫面會顯示兩個重要資訊：
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**先不要關閉這個頁面！** 下一步會用到。

---

### Step 2: 設定 Vercel 環境變數

**快速連結**: https://vercel.com/jgss-projects-fe7f44f1/jg-coach-v2/settings/environment-variables

1. 點擊 **"Add New"**
2. 填入第一個變數：
   - **Name**: `UPSTASH_REDIS_REST_URL`
   - **Value**: （從 Upstash 複製 REST URL）
   - **Environments**: 全選 (Production, Preview, Development)
   - 點 **"Save"**

3. 再次點擊 **"Add New"**，填入第二個變數：
   - **Name**: `UPSTASH_REDIS_REST_TOKEN`  
   - **Value**: （從 Upstash 複製 REST TOKEN）
   - **Environments**: 全選
   - 點 **"Save"**

---

### Step 3: 重新部署

回到終端機，執行：

```bash
cd /Users/jgtruestock/.openclaw/workspace/projects/jg-coach-v2
npx vercel deploy --prod --yes
```

等待部署完成（約 1-2 分鐘）。

---

### Step 4: 驗證持久化

1. 前往 https://jg-coach-v2.vercel.app
2. 用學生代碼 `jg2026` 登入
3. 註冊一個測試學生（例如：測試王）
4. 記錄一筆交易（隨便填）
5. **關鍵測試**：按 `Cmd+R` 重新整理頁面 → 資料應該還在！

如果資料還在，恭喜！✅ 持久化成功！

---

## 🚨 如果出問題

**症狀：部署後還是丟失資料**

1. 檢查 Vercel 環境變數是否正確設定（名稱要完全一致，包含大小寫）
2. 確認 Upstash database 狀態是 "Active"（不是 Paused）
3. 查看 Vercel 部署日誌：https://vercel.com/jgss-projects-fe7f44f1/jg-coach-v2/deployments

**症狀：看到 "Redis not configured" 警告**

代碼會 fallback 到預設資料，但不會持久化。這通常是環境變數沒設好。

---

## 💡 為什麼選 Upstash？

- ✅ 免費額度充足（10k commands/day）
- ✅ REST API，適合 serverless
- ✅ Vercel 官方推薦
- ✅ 全自動管理，免維護

---

## 📊 查看資料

可以在 Upstash Console → Data Browser 查看存儲的資料：
https://console.upstash.com/redis/{your-database-id}

會看到一個 key: `jg-coach-store-v2`，裡面就是你的學生、交易、問題等所有資料。

---

**需要協助？** 查看詳細文件：`SETUP_UPSTASH.md`
