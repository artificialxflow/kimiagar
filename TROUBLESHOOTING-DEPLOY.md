# راهنمای عیب‌یابی استقرار (Deployment Troubleshooting)

## 🔴 مشکل 1: خطای اتصال دیتابیس در لوکال

### علت
`DATABASE_URL` در فایل `.env` یا `.env.local` به hostname داخلی Kubernetes (`dbradizgold-iyc-service`) اشاره می‌کند که در لوکال قابل دسترسی نیست.

### راه‌حل

1. **ایجاد فایل `.env.local`** (این فایل در git ignore است):
```bash
cp .env.local.example .env.local
```

2. **تنظیم DATABASE_URL لوکال**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kimiagar"
```

3. **راه‌اندازی PostgreSQL لوکال**:
```bash
# با Docker
docker run --name kimiagar-postgres \
  -e POSTGRES_DB=kimiagar \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13

# یا با PostgreSQL نصب شده
createdb kimiagar
```

4. **اجرای مایگریشن‌ها**:
```bash
npm run db:migrate
```

---

## 🔴 مشکل 2: Startup Probe Failed در سرور

### علت
Startup probe روی پورت **3000** چک می‌کند اما سرور روی پورت **3001** اجرا می‌شود.

### راه‌حل

#### گزینه 1: تنظیم PORT در Environment Variables (توصیه می‌شود)

در پنل Runflare/Liara، Environment Variables را تنظیم کن:

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
```

**مهم:** حتماً `PORT=3001` را تنظیم کن!

#### گزینه 2: تغییر Startup Probe در Kubernetes

اگر دسترسی به تنظیمات Kubernetes داری، startup probe را تغییر بده:

```yaml
startupProbe:
  httpGet:
    path: /health
    port: 3001  # تغییر از 3000 به 3001
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

#### گزینه 3: استفاده از متغیر محیطی PORT

اگر Runflare از متغیر محیطی `PORT` استفاده می‌کند، مطمئن شو که تنظیم شده است.

---

## 🔍 بررسی وضعیت

### 1. بررسی لاگ‌های Startup

بعد از deploy، لاگ‌های startup را بررسی کن:

```bash
# باید این خط را ببینی:
🚀 Starting server...
🔧 Port: 3001
✅ Server ready on http://0.0.0.0:3001
```

### 2. بررسی Health Check

```bash
# در لوکال
curl http://localhost:3001/api/health

# در سرور (بعد از deploy)
curl http://your-domain.com/api/health
```

### 3. بررسی اتصال دیتابیس

```bash
# در لوکال
curl http://localhost:3001/api/debug/migrations

# در سرور
curl http://your-domain.com/api/debug/migrations
```

---

## 📋 چک‌لیست قبل از Deploy

- [ ] `PORT=3001` در Environment Variables تنظیم شده
- [ ] `HOST=0.0.0.0` در Environment Variables تنظیم شده
- [ ] `NODE_ENV=production` تنظیم شده
- [ ] `DATABASE_URL` برای سرور صحیح است
- [ ] مایگریشن‌ها اجرا شده‌اند (`npm run db:migrate`)
- [ ] Build موفق بوده (`npm run build`)

---

## 🚨 مشکلات رایج دیگر

### مشکل: Certificate Expired در Kubernetes

این مشکل از سمت زیرساخت Kubernetes است و باید با پشتیبانی Runflare تماس بگیری.

### مشکل: Back-off Restarting Failed Container

این یعنی container نمی‌تواند راه‌اندازی شود. بررسی کن:
1. آیا PORT درست تنظیم شده؟
2. آیا health check endpoint کار می‌کند؟
3. آیا لاگ‌های خطا وجود دارد؟

---

## 📞 پشتیبانی

اگر مشکلات ادامه داشت:
1. لاگ‌های کامل startup را بررسی کن
2. خروجی `/api/health` را چک کن
3. خروجی `/api/debug/migrations` را چک کن
4. با پشتیبانی Runflare تماس بگیر

