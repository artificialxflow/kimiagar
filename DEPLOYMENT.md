# راهنمای Deploy در Liara

## پیش‌نیازها

1. **Liara CLI نصب شده باشد**
2. **حساب Liara فعال باشد**
3. **دیتابیس PostgreSQL آماده باشد**

## مراحل Deploy

### 1. تنظیم Environment Variables در Liara

پس از deploy اولیه، باید متغیرهای محیطی زیر را در Liara تنظیم کنید:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# SMS Service Configuration
SMS_API_KEY="your-sms-api-key"
SMS_API_SECRET="your-sms-api-secret"
SMS_FROM_NUMBER="your-sms-from-number"

# Email Service Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"

# Payment Gateway Configuration
PAYMENT_API_KEY="your-payment-api-key"
PAYMENT_SECRET_KEY="your-payment-secret-key"

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://kimiagargold.liara.run"
NEXT_PUBLIC_API_URL="https://kimiagargold.liara.run/api"

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret-key"
```

### 2. تنظیم Environment Variables در Liara Dashboard

1. به [Liara Dashboard](https://console.liara.ir) بروید
2. روی اپلیکیشن `kimiagargold` کلیک کنید
3. به بخش **Environment Variables** بروید
4. متغیرهای بالا را اضافه کنید

### 3. Deploy کردن

```bash
# Deploy اولیه
liara deploy

# در صورت نیاز به rebuild
liara deploy --rebuild
```

### 4. بررسی Logs

```bash
# مشاهده logs
liara logs

# مشاهده logs با tail
liara logs --tail
```

## مشکلات رایج

### خطای 500 در API ها
- **علت**: متغیرهای محیطی تنظیم نشده‌اند
- **راه حل**: Environment Variables را در Liara تنظیم کنید

### خطای اتصال به دیتابیس
- **علت**: DATABASE_URL اشتباه است
- **راه حل**: اتصال دیتابیس را بررسی کنید

### خطای JWT
- **علت**: JWT_SECRET تنظیم نشده
- **راه حل**: JWT_SECRET را تنظیم کنید

## تست کردن

پس از deploy، این endpoint ها را تست کنید:

- `GET /api/health` - بررسی سلامت سرور
- `POST /api/auth/register` - تست ثبت‌نام
- `POST /api/auth/login` - تست ورود

## نکات مهم

1. **DATABASE_URL**: باید از یک دیتابیس PostgreSQL استفاده کنید
2. **JWT_SECRET**: باید حداقل 32 کاراکتر باشد
3. **NODE_ENV**: در production باید "production" باشد
4. **HTTPS**: در production همه درخواست‌ها باید HTTPS باشند
