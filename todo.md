# پروژه کیمیاگر - لیست کارها

## 🎯 مشخصات پروژه
- **نام:** کیمیاگر (Kimiagar)
- **نوع:** پلتفرم مدیریت طلا و کیف پول دیجیتال
- **زبان:** فارسی (RTL)
- **فریم‌ورک:** Next.js 13+ با App Router
- **دیتابیس:** PostgreSQL (Remote Server)
- **ORM:** Prisma
- **استایل:** Tailwind CSS + Vazirmatn Font

## 🎨 رنگ‌بندی و تم
- **رنگ اصلی:** طلایی (#D4AF37)
- **رنگ ثانویه:** خاکستری تیره (#1e293b)
- **رنگ پس‌زمینه:** سفید (#ffffff)
- **رنگ متن:** خاکستری تیره (#334155)
- **فونت:** Vazirmatn (فونت فارسی)

## ✅ کارهای انجام شده

### Frontend
- [x] تمیز کردن پروژه Next.js
- [x] نصب و تنظیم Tailwind CSS
- [x] راست‌چین کردن پروژه (RTL)
- [x] نصب فونت Vazirmatn
- [x] کپی کردن کامپوننت‌ها از React به Next.js
- [x] تبدیل React Router به Next.js App Router
- [x] اضافه کردن "use client" به کامپوننت‌های کلاینت
- [x] ایجاد صفحات اصلی (dashboard, wallet, trading, login)
- [x] طراحی و جایگذاری favicon سفارشی
- [x] بهبود فرم ورود با 5 مرحله (شماره موبایل، OTP، کد ملی، شماره شبا، کد پستی)
- [x] ریدایرکت از صفحه اصلی به صفحه ورود
- [x] اتصال کامپوننت‌های Frontend به API Routes
- [x] مدیریت state و loading در کامپوننت‌ها
- [x] نمایش اطلاعات واقعی در داشبورد
- [x] اتصال فرم‌های خرید و فروش به API
- [x] اتصال فرم‌های واریز و برداشت به API
- [x] بهبود UX و UI کامپوننت‌ها

### Backend
- [x] تصمیم‌گیری برای استفاده از PostgreSQL
- [x] نصب Prisma ORM
- [x] طراحی مدل‌های دیتابیس (User, Wallet, Transaction, Order, Price, Commission, SystemSetting)
- [x] اجرای migration و ایجاد جداول
- [x] ایجاد API Routes:
  - [x] `/api/auth/register` - ثبت‌نام کاربران
  - [x] `/api/wallet/balance` - دریافت موجودی کیف پول
  - [x] `/api/prices` - مدیریت قیمت‌های لحظه‌ای
  - [x] `/api/wallet/deposit` - واریز به کیف پول
  - [x] `/api/wallet/withdraw` - برداشت از کیف پول
  - [x] `/api/trading/buy` - ثبت سفارش خرید
  - [x] `/api/trading/sell` - ثبت سفارش فروش
  - [x] `/api/transactions` - تاریخچه تراکنش‌ها
  - [x] `/api/debug/users` - نمایش کاربران (برای debug)

### Database
- [x] اتصال به PostgreSQL سرور راه دور
- [x] ایجاد جداول اصلی
- [x] تنظیم روابط بین جداول
- [x] تعریف Enum ها برای انواع مختلف
- [x] تست اتصال و ذخیره‌سازی داده‌ها

## 🔄 کارهای در حال انجام
- [x] اعتبارسنجی فرم‌ها (Validation)
- [x] بهبود فرم ثبت‌نام (نام و نام خانوادگی)
- [x] اضافه کردن منوی ناوبری
- [x] ایجاد صفحه پروفایل
- [x] Dockerize کردن پروژه
- [ ] بهبود UX و UI

## 📋 کارهای باقی‌مانده

### Validation & UX Improvements
- [x] اعتبارسنجی شماره موبایل (11 رقم)
- [x] اعتبارسنجی کد ملی (10 رقم)
- [x] اعتبارسنجی شماره شبا (24 کاراکتر)
- [x] اعتبارسنجی کد پستی (10 رقم)
- [x] اضافه کردن فیلدهای نام و نام خانوادگی به فرم ثبت‌نام
- [x] نمایش نام کاربر در داشبورد
- [x] اضافه کردن منوی ناوبری (Navigation Menu)
- [x] بهبود پیام‌های خطا و موفقیت

### API Routes
- [x] `/api/profile/update` - به‌روزرسانی پروفایل
- [x] `/api/health` - Health Check برای Docker
- [ ] `/api/auth/login` - ورود کاربران
- [ ] `/api/orders` - مدیریت سفارش‌ها
- [ ] `/api/commissions` - مدیریت کمیسیون‌ها

### Frontend Integration
- [ ] اتصال کامپوننت‌های باقی‌مانده
- [ ] بهبود UX و UI
- [ ] اضافه کردن loading states
- [ ] مدیریت خطاها

### Security & Validation
- [ ] اعتبارسنجی ورودی‌ها
- [ ] مدیریت خطاها
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] JWT authentication

### Features
- [ ] سیستم اعلان‌ها
- [ ] نمودار قیمت‌ها (بهبود)
- [ ] گزارش‌گیری
- [ ] پنل ادمین
- [ ] API برای دریافت قیمت‌های خارجی

### Deployment
- [x] Dockerfile آماده
- [x] docker-compose.yml آماده
- [x] Health Check API
- [x] Environment Variables
- [x] Production Build Configuration
- [ ] Database backup
- [ ] Monitoring

## 🗄️ مشخصات دیتابیس

### تصمیم نهایی: PostgreSQL
**دلیل انتخاب:**
- ACID compliance برای تراکنش‌های مالی
- پشتیبانی از JSON برای داده‌های پیچیده
- Performance بالا برای خواندن/نوشتن
- امنیت بالا
- پشتیبانی از Foreign Keys و Constraints

### اتصال به دیتابیس راه دور
```env
DATABASE_URL="postgresql://root:ANG5guAtXXLBvOLKJ7vqnAk2@tirich-mir.liara.cloud:32252/postgres"
```

### جداول ایجاد شده:
1. **users** - اطلاعات کاربران ✅
2. **wallets** - کیف پول‌های ریالی و طلایی ✅
3. **transactions** - تراکنش‌های مالی ✅
4. **orders** - سفارش‌های خرید و فروش ✅
5. **prices** - قیمت‌های لحظه‌ای ✅
6. **commissions** - تنظیمات کمیسیون
7. **system_settings** - تنظیمات سیستم

## 🚀 مراحل بعدی
1. **اعتبارسنجی و UX** - بهبود فرم‌ها و validation
2. **منوی ناوبری** - اضافه کردن navigation
3. **بهینه‌سازی** - Performance و UX
4. **امنیت** - JWT و validation
5. **Deployment** - راه‌اندازی در production

## 🧪 تست‌های انجام شده
- [x] ثبت‌نام کاربر ✅
- [x] ذخیره در دیتابیس ✅
- [x] نمایش در داشبورد ✅
- [x] دریافت قیمت‌ها ✅
- [x] واریز به کیف پول ✅
- [x] خرید طلا ✅
- [x] فروش طلا ✅
- [x] برداشت از کیف پول ✅
- [x] تاریخچه تراکنش‌ها ✅

## 🎯 قابلیت‌های تکمیل شده
- ✅ **سیستم ثبت‌نام و ورود**
- ✅ **مدیریت کیف پول (واریز/برداشت)**
- ✅ **خرید و فروش طلا/سکه**
- ✅ **نمایش موجودی و تراکنش‌ها**
- ✅ **قیمت‌های لحظه‌ای**
- ✅ **تاریخچه کامل تراکنش‌ها**

---
**آخرین به‌روزرسانی:** 22 تیر 1403
**وضعیت:** سیستم کامل کار می‌کند، در حال بهبود UX و Validation 