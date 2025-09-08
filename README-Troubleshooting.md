# راهنمای عیب‌یابی کیمیاگر

این راهنما مشکلات رایج و راه‌حل‌های آن‌ها را ارائه می‌دهد.

## 🔍 مشکلات رایج

### 1. مشکل Prisma Client

**مشکل**: خطای "PrismaClient is not defined" یا "Cannot find module @prisma/client"

**راه‌حل**:
```bash
# تولید Prisma Client
npm run prisma:generate

# یا
npx prisma generate
```

### 2. مشکل دیتابیس

**مشکل**: خطای "Connection refused" یا "Database not found"

**راه‌حل**:

#### الف) بررسی اتصال دیتابیس
```bash
# تست اتصال
psql -h localhost -U postgres -d kimiagar

# یا با DATABASE_URL
psql "postgresql://username:password@localhost:5432/kimiagar"
```

#### ب) راه‌اندازی دیتابیس
```bash
# ایجاد دیتابیس
createdb kimiagar

# یا با psql
psql -U postgres
CREATE DATABASE kimiagar;
\q
```

### 3. مشکل Build

**مشکل**: خطای "Build failed" یا "Module not found"

**راه‌حل**:
```bash
# پاک کردن cache
rm -rf .next
rm -rf node_modules
rm package-lock.json

# نصب مجدد
npm install

# Build مجدد
npm run build
```

### 4. مشکل Dependencies

**مشکل**: خطای "Package not found" یا "Version conflict"

**راه‌حل**:
```bash
# پاک کردن کامل
rm -rf node_modules package-lock.json

# نصب مجدد
npm install

# بررسی conflicts
npm ls
```

### 5. مشکل Environment Variables

**مشکل**: خطای "Environment variable not found"

**راه‌حل**:
```bash
# بررسی متغیرهای محیطی
echo $DATABASE_URL
echo $JWT_SECRET

# ایجاد فایل .env.local
cp .env.example .env.local
# و تنظیم متغیرها
```

### 6. مشکل Port

**مشکل**: خطای "Port 3001 already in use"

**راه‌حل**:
```bash
# پیدا کردن process
lsof -i :3001

# توقف process
kill -9 <PID>

# یا تغییر port در .env.local
PORT=3002
```

### 7. مشکل Health Check

**مشکل**: خطای "Health check failed" در Liara

**راه‌حل**:
```bash
# تست محلی
curl http://localhost:3001/health

# بررسی logs
liara logs

# بررسی environment variables در Liara
```

## 🛠 دستورات عیب‌یابی

### بررسی وضعیت سیستم

```bash
# وضعیت Node.js
node --version
npm --version

# وضعیت دیتابیس
psql --version

# وضعیت پروژه
npm ls
```

### بررسی لاگ‌ها

```bash
# لاگ‌های development
npm run dev

# لاگ‌های production
npm start

# لاگ‌های PM2
pm2 logs kimiagar

# لاگ‌های Liara
liara logs
```

### بررسی دیتابیس

```bash
# اتصال به دیتابیس
psql "postgresql://username:password@localhost:5432/kimiagar"

# بررسی جداول
\dt

# بررسی schema
\d users

# خروج
\q
```

## 🔧 راه‌حل‌های پیشرفته

### Reset کامل پروژه

```bash
# پاک کردن همه چیز
rm -rf .next node_modules package-lock.json

# نصب مجدد
npm install

# تولید Prisma Client
npm run prisma:generate

# Reset دیتابیس
npm run db:reset

# Build و اجرا
npm run build
npm start
```

### بررسی Prisma

```bash
# بررسی schema
npx prisma validate

# بررسی migrations
npx prisma migrate status

# Reset migrations
npx prisma migrate reset

# Studio
npx prisma studio
```

### بررسی Next.js

```bash
# بررسی config
npx next info

# بررسی build
npx next build --debug

# بررسی start
npx next start --port 3001
```

## 📊 مانیتورینگ

### بررسی Performance

```bash
# Memory usage
node -e "console.log(process.memoryUsage())"

# CPU usage
top -p $(pgrep node)

# Disk usage
df -h
```

### بررسی Network

```bash
# Port listening
netstat -tulpn | grep :3001

# Network connections
ss -tulpn | grep :3001
```

## 🚨 مشکلات Liara

### Health Check Failed

1. **بررسی endpoint**:
   ```bash
   curl https://your-app.liara.run/health
   ```

2. **بررسی logs**:
   ```bash
   liara logs --follow
   ```

3. **بررسی environment variables**:
   ```bash
   liara env
   ```

### Build Failed

1. **بررسی build logs**:
   ```bash
   liara logs --build
   ```

2. **تست محلی**:
   ```bash
   npm run build
   ```

3. **بررسی dependencies**:
   ```bash
   npm ls
   ```

## 📞 درخواست پشتیبانی

### اطلاعات مورد نیاز

1. **خطای دقیق** (متن کامل)
2. **مراحل تکرار مشکل**
3. **محیط اجرا** (OS, Node.js version)
4. **لاگ‌های مربوطه**

### تماس

- **GitHub Issues**: برای گزارش باگ
- **تیم توسعه**: برای پشتیبانی فوری
- **مستندات**: `README.md` و `SETUP.md`

---

**نکات مهم:**
1. **همیشه لاگ‌ها را بررسی کنید**
2. **متغیرهای محیطی را درست تنظیم کنید**
3. **Prisma Client را بعد از تغییرات schema تولید کنید**
4. **دیتابیس را قبل از شروع پروژه راه‌اندازی کنید**
5. **از version control استفاده کنید**