# راهنمای نصب و راه‌اندازی کیمیاگر

این راهنما شما را در نصب و راه‌اندازی پروژه کیمیاگر راهنمایی می‌کند.

## 📋 پیش‌نیازها

- **Node.js**: نسخه 18 یا بالاتر
- **npm**: نسخه 8 یا بالاتر
- **PostgreSQL**: نسخه 13 یا بالاتر
- **Git**: برای clone کردن پروژه

### بررسی نسخه‌ها

```bash
node --version     # باید 18+ باشد
npm --version      # باید 8+ باشد
psql --version     # باید 13+ باشد
```

## 🚀 نصب پروژه

### 1. Clone کردن پروژه

```bash
git clone <repository-url>
cd kimiagar
```

### 2. نصب Dependencies

```bash
npm install
```

### 3. تنظیم متغیرهای محیطی

فایل `.env.local` ایجاد کنید:

```env
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/kimiagar"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
EXTERNAL_PRICE_API_URL="https://yazdan-price.liara.run"
```

## 🗄 راه‌اندازی دیتابیس

### روش A: PostgreSQL محلی

```bash
# ایجاد دیتابیس
createdb kimiagar

# یا با psql
psql -U postgres
CREATE DATABASE kimiagar;
\q
```

### روش B: PostgreSQL در Docker (اختیاری)

```bash
# اجرای PostgreSQL در Docker
docker run --name kimiagar-postgres \
  -e POSTGRES_DB=kimiagar \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13
```

## 🔧 راه‌اندازی پروژه

### 1. تولید Prisma Client

```bash
npm run prisma:generate
```

### 2. اجرای Migrations

```bash
npm run db:migrate
```

### 3. Seed کردن دیتابیس

```bash
npm run db:seed
```

### 4. اجرای پروژه

```bash
# حالت development
npm run dev

# یا حالت production
npm run build
npm start
```

## 🛠 دستورات مفید

### Prisma Commands

```bash
# تولید Prisma Client
npm run prisma:generate

# اجرای migrations
npm run db:migrate

# Reset دیتابیس
npm run db:reset

# باز کردن Prisma Studio
npm run db:studio
```

### Build Commands

```bash
# ساخت پروژه
npm run build

# اجرای پروژه
npm start

# اجرای development
npm run dev
```

### PM2 Commands (Production)

```bash
# اجرا با PM2
npm run nodejs-pm2

# توقف PM2
npm run nodejs-stop

# راه‌اندازی مجدد
npm run nodejs-restart

# نمایش لاگ‌ها
npm run nodejs-logs
```

## 🔍 عیب‌یابی

### مشکلات رایج

1. **خطای Prisma Client**
   ```bash
   npm run prisma:generate
   ```

2. **خطای دیتابیس**
   - اتصال دیتابیس را بررسی کنید
   - DATABASE_URL را چک کنید

3. **خطای Build**
   ```bash
   rm -rf .next
   npm run build
   ```

4. **خطای Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### بررسی وضعیت

```bash
# Health Check
curl http://localhost:3001/health

# بررسی دیتابیس
npm run db:studio
```

## 📁 ساختار پروژه

```
kimiagar/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── components/        # React Components
│   ├── lib/              # Utility Functions
│   └── ...
├── prisma/               # Database Schema
├── public/               # Static Files
├── server.js             # Custom Server
└── package.json          # Dependencies
```

## 🚀 Deploy در Liara

### 1. آماده‌سازی

```bash
# Build پروژه
npm run build

# تست محلی
npm start
```

### 2. Deploy

```bash
# Deploy به Liara
liara deploy

# با debug
liara deploy --debug
```

### 3. بررسی

```bash
# بررسی لاگ‌ها
liara logs

# بررسی وضعیت
liara status
```

## 📞 پشتیبانی

برای مشکلات و سوالات:

1. **مستندات**: `README.md`
2. **عیب‌یابی**: `README-Troubleshooting.md`
3. **تیم توسعه**: تماس مستقیم

---

**نکات مهم:**
1. **همیشه Prisma Client را بعد از تغییرات schema تولید کنید**
2. **از لاگ‌ها برای عیب‌یابی استفاده کنید**
3. **دیتابیس را قبل از شروع پروژه راه‌اندازی کنید**
4. **متغیرهای محیطی را درست تنظیم کنید**