# تحلیل لاگ‌های سرور

## ✅ چیزهایی که درست کار می‌کنند

از لاگ‌ها مشخص است:
- ✅ سرور روی پورت 3001 راه‌اندازی شده
- ✅ Prisma به دیتابیس متصل شده
- ✅ دیتابیس: `dbradizgvla_db@dbradizgold-iyc-service:5432`

## ⚠️ مشکلات شناسایی شده

### 1. SIGTERM و Restart

```
npm error signal SIGTERM
```

**علت:** Kubernetes health check یا startup probe ممکن است fail شود و container را kill کند.

**راه‌حل:**
- مطمئن شو که `/health` یا `/api/health` درست کار می‌کند
- Startup probe را بررسی کن (باید روی پورت 3001 باشد)

### 2. Health Endpoint Response ساده

از تصویر مشخص است که `/api/health` فقط این را برمی‌گرداند:
```json
{"status":"ok", "timestamp":"...", "environment":"production"}
```

اما باید این را برگرداند:
```json
{
  "status": "ok",
  "checks": {
    "database": "connected",
    "migrations": "ok",
    "tables": "ok"
  },
  "database": {
    "connected": true
  },
  "migrations": {
    "count": 4,
    "lastMigration": "..."
  }
}
```

**علت:** احتمالاً build قدیمی است یا health endpoint در `server.js` استفاده می‌شود.

**راه‌حل:** 
- دوباره build کن: `npm run build`
- مطمئن شو که `/api/health` از `app/api/health/route.ts` استفاده می‌کند

### 3. Register/Login با خطای 500

از console مشخص است:
```
POST /api/auth/register 500 (Internal Server Error)
POST /api/auth/login 500 (Internal Server Error)
```

**علت:** باید لاگ‌های دقیق‌تر ببینیم.

**راه‌حل:**
- لاگ‌های کامل register/login را از سرور بگیر
- بررسی کن که آیا خطا از دیتابیس است یا validation

---

## 🔍 بررسی دقیق‌تر

### 1. چک کردن Health Endpoint

```bash
# باید response کامل با checks برگرداند
curl https://radizgold.ir/api/health
```

### 2. چک کردن Register Endpoint

لاگ‌های register باید این را نشان دهند:
```
❌ خطا در ثبت‌نام: ...
📋 نوع خطا: ...
📋 پیام خطا: ...
📋 کد خطا: ...
```

### 3. چک کردن مایگریشن‌ها

```bash
curl https://radizgold.ir/api/debug/migrations
```

---

## 📋 اقدامات لازم

1. **دوباره Build و Deploy:**
   ```bash
   npm run build
   # سپس deploy کن
   ```

2. **بررسی Health Endpoint:**
   - بعد از deploy، `/api/health` را چک کن
   - باید response کامل با checks برگرداند

3. **بررسی Register/Login:**
   - لاگ‌های کامل را از سرور بگیر
   - ببین دقیقاً چه خطایی می‌دهد

4. **بررسی Startup Probe:**
   - مطمئن شو که روی پورت 3001 است
   - مطمئن شو که `/health` یا `/api/health` کار می‌کند

---

## 🚨 اگر مشکل ادامه داشت

1. لاگ‌های کامل startup را بگیر
2. لاگ‌های register/login را بگیر
3. Response `/api/health` را چک کن
4. Response `/api/debug/migrations` را چک کن

