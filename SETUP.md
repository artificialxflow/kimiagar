# راهنمای راه‌اندازی - Kimiagar Project

این راهنما مراحل کامل راه‌اندازی پروژه کیمی‌آگار را توضیح می‌دهد.

## پیش‌نیازها

### نرم‌افزارهای مورد نیاز
- **Node.js**: نسخه 18 یا بالاتر
- **npm**: نسخه 8 یا بالاتر
- **Docker**: نسخه 20 یا بالاتر
- **Docker Compose**: نسخه 2 یا بالاتر
- **Git**: برای clone کردن پروژه

### بررسی نسخه‌ها
```bash
node --version    # باید 18+ باشد
npm --version     # باید 8+ باشد
docker --version  # باید 20+ باشد
docker-compose --version  # باید 2+ باشد
```

## مرحله 1: Clone کردن پروژه

```bash
# Clone کردن پروژه
git clone <repository-url>
cd kimiagar

# یا اگر پروژه را دانلود کرده‌اید
cd kimiagar
```

## مرحله 2: نصب Dependencies

```bash
# نصب تمام dependencies
npm install

# یا با yarn
yarn install
```

## مرحله 3: تنظیم متغیرهای محیطی

### ایجاد فایل .env.local
```bash
# در ریشه پروژه فایل .env.local ایجاد کنید
touch .env.local
```

### محتوای فایل .env.local
```env
# Database Configuration
DATABASE_URL="postgresql://kimiagar_user:kimiagar_password@localhost:5432/kimiagar_dev"

# JWT Configuration
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# SMS Configuration (for development)
SMS_API_KEY="dev-key"
SMS_API_SECRET="dev-secret"
SMS_FROM_NUMBER="dev-number"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Environment
NODE_ENV="development"
```

## مرحله 4: راه‌اندازی دیتابیس

### روش A: استفاده از Docker (توصیه شده)

```bash
# شروع سرویس دیتابیس
docker-compose up postgres -d

# بررسی وضعیت
docker-compose ps postgres

# مشاهده لاگ‌ها
docker-compose logs postgres
```

### روش B: نصب دستی PostgreSQL

#### Windows
1. دانلود و نصب PostgreSQL از [postgresql.org](https://www.postgresql.org/download/windows/)
2. تنظیم رمز عبور برای کاربر postgres
3. ایجاد دیتابیس و کاربر

#### macOS
```bash
# با Homebrew
brew install postgresql
brew services start postgresql

# ایجاد دیتابیس
createdb kimiagar_dev
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# تغییر به کاربر postgres
sudo -u postgres psql

# ایجاد دیتابیس و کاربر
CREATE DATABASE kimiagar_dev;
CREATE USER kimiagar_user WITH PASSWORD 'kimiagar_password';
GRANT ALL PRIVILEGES ON DATABASE kimiagar_dev TO kimiagar_user;
\q
```

## مرحله 5: تولید Prisma Client

```bash
# تولید Prisma Client
npx prisma generate

# بررسی schema
npx prisma studio
```

## مرحله 6: اجرای Database Migrations

```bash
# اجرای migrations
npm run db:migrate

# یا دستی
npx prisma migrate deploy
```

## مرحله 7: Seeding دیتابیس

```bash
# seeding دیتابیس با داده‌های تست
npm run db:seed

# یا دستی
npx tsx prisma/seed.ts
```

## مرحله 8: راه‌اندازی Redis (اختیاری)

### با Docker
```bash
docker-compose up redis -d
```

### نصب دستی
```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt install redis-server
sudo systemctl start redis-server
```

## مرحله 9: تست اتصال دیتابیس

```bash
# بررسی health check
curl http://localhost:3000/api/health

# یا در مرورگر
http://localhost:3000/api/health
```

## مرحله 10: راه‌اندازی پروژه

### محیط توسعه
```bash
# شروع سرور توسعه
npm run dev

# یا با Docker
make dev
```

### محیط تولید
```bash
# ساخت پروژه
npm run build

# شروع سرور تولید
npm run start

# یا با Docker
make build
make prod
```

## مرحله 11: تست عملکرد

### 1. تست API endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "firstName": "کاربر",
    "lastName": "تست"
  }'
```

### 2. تست در مرورگر
- باز کردن `http://localhost:3000`
- تست فرم ثبت‌نام
- تست ورود کاربر

## مرحله 12: تنظیمات اضافی

### تنظیم CORS (در صورت نیاز)
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

### تنظیم SSL (برای production)
```bash
# ایجاد self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## دستورات مفید

### مدیریت دیتابیس
```bash
# باز کردن Prisma Studio
npm run db:studio

# بازنشانی دیتابیس
npm run db:reset

# اجرای migrations
npm run db:migrate

# seeding
npm run db:seed
```

### مدیریت Docker
```bash
# شروع سرویس‌ها
make up

# توقف سرویس‌ها
make down

# مشاهده لاگ‌ها
make logs

# بررسی وضعیت
make status
```

### مدیریت پروژه
```bash
# نصب dependencies
npm install

# build پروژه
npm run build

# linting
npm run lint

# تست
npm test
```

## عیب‌یابی

### مشکلات رایج
1. **خطای اتصال دیتابیس**: بررسی `DATABASE_URL` و وضعیت PostgreSQL
2. **خطای Prisma**: اجرای `npx prisma generate`
3. **خطای JWT**: بررسی متغیرهای `JWT_SECRET`
4. **خطای پورت**: بررسی پورت‌های استفاده شده

### راهنمای کامل عیب‌یابی
برای اطلاعات بیشتر به فایل `README-Troubleshooting.md` مراجعه کنید.

## نکات مهم

1. **همیشه ابتدا health check را بررسی کنید**
2. **متغیرهای محیطی را درست تنظیم کنید**
3. **Prisma Client را بعد از تغییرات schema تولید کنید**
4. **از Docker logs برای عیب‌یابی استفاده کنید**
5. **دیتابیس را قبل از شروع پروژه راه‌اندازی کنید**

## پشتیبانی

در صورت بروز مشکل:
1. فایل `README-Troubleshooting.md` را مطالعه کنید
2. لاگ‌های سرور و دیتابیس را بررسی کنید
3. از health check endpoint استفاده کنید
4. اطلاعات خطا را کامل ثبت کنید

## اطلاعات تماس

- **مستندات**: فایل‌های README موجود در پروژه
- **عیب‌یابی**: `README-Troubleshooting.md`
- **Docker**: `README-Docker.md`
