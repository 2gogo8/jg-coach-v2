# ✅ 部署檢查清單

## 已完成 ✓

- [x] 安裝 `@upstash/redis` 依賴
- [x] 將 `lib/store.ts` 遷移到 Upstash Redis
- [x] 修改所有 API 路由使用 async/await
- [x] TypeScript 編譯通過 (`npx tsc --noEmit`)
- [x] Git commit: `feat(persistence): migrate store to Upstash Redis`
- [x] Push 到 GitHub
- [x] 創建設定文件 (SETUP_UPSTASH.md, QUICK_SETUP.md)

## 等待完成 ⏳

### [ ] 1. 設定 Upstash Redis 環境變數

**請按照 `QUICK_SETUP.md` 的步驟操作**，大約 5 分鐘：

1. 在 Upstash 建立 Redis 資料庫
2. 在 Vercel 設定兩個環境變數：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**快速連結**：
- Upstash: https://console.upstash.com/login
- Vercel Env: https://vercel.com/jgss-projects-fe7f44f1/jg-coach-v2/settings/environment-variables

### [ ] 2. 部署到 Production

環境變數設定完成後，執行：

```bash
cd /Users/jgtruestock/.openclaw/workspace/projects/jg-coach-v2
npx vercel deploy --prod --yes
```

### [ ] 3. 驗證持久化

部署完成後，測試：

1. 前往 https://jg-coach-v2.vercel.app
2. 註冊學生 → 記錄交易
3. **重新整理頁面** → 資料還在 ✓

## 🎯 成功標準

- 資料在頁面刷新後依然存在
- 即使 Vercel 重部署也不會丟失資料
- Upstash Console 可以看到 `jg-coach-store-v2` key

## 📝 Notes

- 如果沒設定環境變數就部署，代碼會使用預設資料（fallback），但不會持久化
- 免費額度：10k commands/day，對於實驗室使用絕對足夠
- 資料格式：JSON 存儲，包含 students, trades, questions, insights 等

---

**需要協助？** 查看 `QUICK_SETUP.md` 有詳細步驟截圖說明。
