# راهنمای عیب‌یابی - Kimiagar Project

این راهنما مشکلات رایج پروژه و نحوه حل آن‌ها را توضیح می‌دهد.

## مشکلات رایج

### 1. خطای 500 در API ثبت‌نام

**مشکل**: خطای Internal Server Error در `/api/auth/register`

**علل احتمالی**:
- عدم اتصال به دیتابیس
- مشکل در Prisma Client
- خطا در validation داده‌ها
- مشکل در JWT generation

**راه‌حل**:

#### الف) بررسی اتصال دیتابیس
```bash
# بررسی وضعیت دیتابیس
curl http://localhost:3000/api/health

# یا در مرورگر
http://localhost:3000/api/health
```

#### ب) راه‌اندازی دیتابیس
```bash
# نصب dependencies
npm install

# تولید Prisma Client
npx prisma generate

# اجرای migrations
npm run db:migrate

# seeding دیتابیس
npm run db:seed
```

#### ج) بررسی متغیرهای محیطی
```bash
# ایجاد فایل .env.local
DATABASE_URL="postgresql://kimiagar_user:kimiagar_password@localhost:5432/kimiagar_dev"
JWT_SECRET="dev-secret-key"
JWT_REFRESH_SECRET="dev-refresh-secret-key"
NODE_ENV="development"
```

### 2. مشکل اتصال به PostgreSQL

**مشکل**: خطای "Connection refused" یا "Authentication failed"

**راه‌حل**:

#### الف) راه‌اندازی PostgreSQL با Docker
```bash
# شروع سرویس دیتابیس
docker-compose up postgres -d

# بررسی وضعیت
docker-compose ps postgres

# مشاهده لاگ‌ها
docker-compose logs postgres
```

#### ب) تنظیمات دستی PostgreSQL
```sql
-- اتصال به PostgreSQL
psql -U postgres

-- ایجاد دیتابیس
CREATE DATABASE kimiagar_dev;

-- ایجاد کاربر
CREATE USER kimiagar_user WITH PASSWORD 'kimiagar_password';

-- اعطای دسترسی
GRANT ALL PRIVILEGES ON DATABASE kimiagar_dev TO kimiagar_user;

-- خروج
\q
```

### 3. مشکل Prisma Client

**مشکل**: خطای "PrismaClient is not defined" یا "Cannot find module"

**راه‌حل**:

#### الف) تولید مجدد Prisma Client
```bash
# پاک کردن node_modules
rm -rf node_modules
rm -rf .next

# نصب مجدد dependencies
npm install

# تولید Prisma Client
npx prisma generate
```

#### ب) بررسی schema.prisma
```prisma
// اطمینان از صحت schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. مشکل JWT

**مشکل**: خطای "JWT_SECRET is not defined" یا "Invalid token"

**راه‌حل**:

#### الف) تنظیم متغیرهای JWT
```bash
# در فایل .env.local
JWT_SECRET="your-super-secret-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
```

#### ب) بررسی JWT functions
```typescript
// اطمینان از import صحیح
import { generateTokens, verifyAccessToken } from '@/app/lib/jwt';

// بررسی payload structure
const payload = {
  userId: user.id,
  username: user.username,
  isAdmin: user.isAdmin
};
```

### 5. مشکل CORS

**مشکل**: خطای "CORS policy" در مرورگر

**راه‌حل**:

#### الف) تنظیم Next.js config
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 6. مشکل TypeScript

**مشکل**: خطای "Cannot find name" یا "Type error"

**راه‌حل**:

#### الف) بررسی imports
```typescript
// اطمینان از import صحیح
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
```

#### ب) بررسی type definitions
```typescript
// تعریف interface برای props
interface ComponentProps {
  setActiveTab: (tab: string) => void;
}
```

### 7. مشکل Docker

**مشکل**: خطای "Port already in use" یا "Container failed to start"

**راه‌حل**:

#### الف) بررسی پورت‌های استفاده شده
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# توقف سرویس‌ها
docker-compose down
```

#### ب) پاک‌سازی Docker
```bash
# پاک‌سازی کامل
make clean

# یا دستی
docker-compose down -v --remove-orphans
docker system prune -f
```

### 8. مشکل Build

**مشکل**: خطای "Build failed" یا "Compilation error"

**راه‌حل**:

#### الف) پاک‌سازی cache
```bash
# پاک کردن Next.js cache
rm -rf .next
rm -rf node_modules/.cache

# نصب مجدد dependencies
npm install

# build مجدد
npm run build
```

#### ب) بررسی TypeScript errors
```bash
# بررسی type errors
npx tsc --noEmit

# linting
npm run lint
```

## دستورات مفید برای عیب‌یابی

### بررسی وضعیت سرویس‌ها
```bash
# وضعیت Docker containers
docker-compose ps

# لاگ‌های سرویس‌ها
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# استفاده از Makefile
make status
make logs
```

### بررسی دیتابیس
```bash
# اتصال به دیتابیس
make db-shell

# اجرای migrations
make db-migrate

# seeding دیتابیس
make db-seed

# بازنشانی دیتابیس
make db-reset
```

### بررسی API endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","firstName":"Test","lastName":"User"}'
```

## لاگ‌ها و Debugging

### 1. فعال‌سازی Debug Logs
```bash
# تنظیم متغیر محیطی
export DEBUG=prisma:*

# یا در .env.local
DEBUG=prisma:*
```

### 2. بررسی Console Logs
```typescript
// اضافه کردن console.log برای debugging
console.log('User data:', userData);
console.log('Database connection:', dbStatus);
console.log('JWT payload:', payload);
```

### 3. استفاده از Browser DevTools
- Network tab برای بررسی API calls
- Console tab برای JavaScript errors
- Application tab برای بررسی cookies و storage

## نکات مهم

1. **همیشه ابتدا health check را بررسی کنید**
2. **لاگ‌ها را با دقت مطالعه کنید**
3. **متغیرهای محیطی را بررسی کنید**
4. **از Docker logs استفاده کنید**
5. **Prisma Client را بعد از تغییرات schema تولید کنید**

## درخواست پشتیبانی

اگر مشکل حل نشد:
1. لاگ‌های کامل را کپی کنید
2. تصویر خطا را ضبط کنید
3. مراحل تکرار مشکل را بنویسید
4. اطلاعات محیط (OS, Node.js version, Docker version) را ارائه دهید
