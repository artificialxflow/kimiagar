# 🚀 راهنمای تنظیمات کیمیاگر

## 📋 پیش‌نیازها

- Node.js 18+ 
- PostgreSQL 14+
- Redis (اختیاری)
- npm یا yarn

## 🔧 نصب و راه‌اندازی

### 1. نصب وابستگی‌ها
```bash
npm install
```

### 2. تنظیم متغیرهای محیطی
فایل `.env.local` را در ریشه پروژه ایجاد کنید:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/kimiagar"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-in-production"

# SMS Service Configuration
KAVENEGAR_API_KEY="your-kavenegar-api-key"
KAVENEGAR_TEMPLATE_ID="your-kavenegar-template-id"

# Email Service Configuration
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@kimiagar.com"

# Payment Gateway Configuration
ZARINPAL_MERCHANT_ID="your-zarinpal-merchant-id"
ZARINPAL_SANDBOX=true

# Application Configuration
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

### 3. راه‌اندازی دیتابیس
```bash
# ایجاد جداول
npx prisma db push

# یا استفاده از migrations
npx prisma migrate dev
```

### 4. اجرای پروژه
```bash
npm run dev
```

## 📱 تنظیم سرویس SMS

### کاوه‌نگار (پیشنهادی)
1. در [کاوه‌نگار](https://kavenegar.com) ثبت‌نام کنید
2. API Key دریافت کنید
3. قالب SMS ایجاد کنید
4. متغیرهای زیر را تنظیم کنید:
```env
KAVENEGAR_API_KEY="your-api-key"
KAVENEGAR_TEMPLATE_ID="your-template-id"
```

### ملی پیامک
1. در [ملی پیامک](https://melipayamak.com) ثبت‌نام کنید
2. نام کاربری و رمز عبور دریافت کنید
3. متغیرهای زیر را تنظیم کنید:
```env
MELIPAYAMAK_USERNAME="your-username"
MELIPAYAMAK_PASSWORD="your-password"
MELIPAYAMAK_FROM="5000xxx"
```

### قاصدک
1. در [قاصدک](https://ghasedak.me) ثبت‌نام کنید
2. API Key دریافت کنید
3. متغیرهای زیر را تنظیم کنید:
```env
GHASEDAK_API_KEY="your-api-key"
GHASEDAK_LINE_NUMBER="10008566"
```

## 📧 تنظیم سرویس ایمیل

### SendGrid (پیشنهادی)
1. در [SendGrid](https://sendgrid.com) ثبت‌نام کنید
2. API Key ایجاد کنید
3. دامنه خود را تایید کنید
4. متغیرهای زیر را تنظیم کنید:
```env
SENDGRID_API_KEY="your-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

### Mailgun
1. در [Mailgun](https://mailgun.com) ثبت‌نام کنید
2. دامنه خود را اضافه کنید
3. API Key دریافت کنید
4. متغیرهای زیر را تنظیم کنید:
```env
MAILGUN_API_KEY="your-api-key"
MAILGUN_DOMAIN="mg.yourdomain.com"
```

### SMTP
برای استفاده از SMTP، متغیرهای زیر را تنظیم کنید:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## 💳 تنظیم درگاه پرداخت

### زرپال
1. در [زرپال](https://zarinpal.com) ثبت‌نام کنید
2. Merchant ID دریافت کنید
3. متغیرهای زیر را تنظیم کنید:
```env
ZARINPAL_MERCHANT_ID="your-merchant-id"
ZARINPAL_SANDBOX=true  # برای تست
```

## 🔒 تنظیمات امنیتی

### JWT
```env
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-in-production"
```

### رمزنگاری
```env
BCRYPT_ROUNDS=12
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 دقیقه
RATE_LIMIT_MAX_REQUESTS=100  # حداکثر 100 درخواست
```

## 📊 مانیتورینگ و لاگ

### Sentry
```env
SENTRY_DSN="your-sentry-dsn"
```

### New Relic
```env
NEW_RELIC_LICENSE_KEY="your-new-relic-license-key"
```

### لاگ
```env
LOG_LEVEL="info"
LOG_FILE="logs/app.log"
```

## 🧪 تست

### تست SMS
```bash
# تست ارسال SMS
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "09123456789", "message": "تست SMS"}'
```

### تست ایمیل
```bash
# تست ارسال ایمیل
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "تست", "content": "محتوی تست"}'
```

## 🚨 مشکلات رایج

### خطای اتصال به دیتابیس
- بررسی صحت DATABASE_URL
- اطمینان از اجرای PostgreSQL
- بررسی دسترسی‌های کاربر دیتابیس

### خطای ارسال SMS
- بررسی صحت API Key
- بررسی موجودی اعتبار
- بررسی تنظیمات قالب (برای کاوه‌نگار)

### خطای ارسال ایمیل
- بررسی صحت API Key
- بررسی تایید دامنه
- بررسی تنظیمات SPF و DKIM

## 📞 پشتیبانی

برای دریافت کمک:
- **ایمیل:** support@kimiagar.com
- **مستندات:** [docs.kimiagar.com](https://docs.kimiagar.com)
- **GitHub Issues:** [github.com/kimiagar/issues](https://github.com/kimiagar/issues)

---

*آخرین به‌روزرسانی: 31 تیر 1403*
