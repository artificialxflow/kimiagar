# کیمیاگر - سیستم مدیریت طلا و کیف پول دیجیتال

پروژه کیمیاگر یک پلتفرم کامل برای خرید و فروش طلا و سکه با قابلیت مدیریت کیف پول دیجیتال است.

## ✨ ویژگی‌ها

- 🏆 **خرید و فروش طلا**: معاملات طلای 18 عیار با بهترین قیمت‌ها
- 🪙 **معاملات سکه**: خرید و فروش سکه بهار آزادی، نیم سکه و ربع سکه
- 💰 **کیف پول دیجیتال**: مدیریت موجودی ریالی و طلایی
- 🔄 **انتقال بین کاربران**: انتقال آسان طلا و پول
- 📊 **داشبورد پیشرفته**: نمایش قیمت‌های لحظه‌ای و نمودارها
- 🔐 **امنیت بالا**: احراز هویت چندمرحله‌ای و رمزنگاری

## 🛠 تکنولوژی‌ها

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Bootstrap 5
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** JWT, bcryptjs
- **UI Components:** Lucide React
- **Charts:** Recharts
- **Deployment:** Liara (Node.js)

## 🚀 Node.js Deployment

### اجرای محلی

```bash
# نصب dependencies
npm install

# ساخت پروژه
npm run build

# اجرای پروژه
npm start
```

### استقرار در لیارا

1. **ساخت پروژه:**
```bash
npm run build
```

2. **Deploy:**
```bash
liara deploy
```

## 📁 ساختار پروژه

```
kimiagar/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── components/        # React Components
│   ├── lib/              # Utility Functions
│   └── ...
├── prisma/               # Database Schema & Migrations
├── public/               # Static Files
├── server.js             # Custom Server
├── next.config.ts        # Next.js Config
├── tailwind.config.js    # Tailwind Config
└── package.json          # Dependencies
```

## 🗄 دیتابیس

### Prisma Schema
- **Users**: مدیریت کاربران و احراز هویت
- **Wallets**: کیف پول‌های ریالی و طلایی
- **Transactions**: تراکنش‌های مالی
- **Orders**: سفارش‌های خرید و فروش
- **Prices**: قیمت‌های لحظه‌ای
- **Transfers**: انتقالات بین کاربران

### دستورات دیتابیس

```bash
# تولید Prisma Client
npm run prisma:generate

# اجرای migrations
npm run db:migrate

# Seed دیتابیس
npm run db:seed

# باز کردن Prisma Studio
npm run db:studio
```

## 🔧 تنظیمات

### متغیرهای محیطی

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
EXTERNAL_PRICE_API_URL=https://...
```

### Health Check

```bash
curl http://localhost:3001/health
```

## 📱 صفحات اصلی

- **صفحه اصلی**: معرفی خدمات
- **ورود/ثبت‌نام**: احراز هویت کاربران
- **داشبورد**: نمایش قیمت‌ها و موجودی
- **خرید/فروش**: معاملات طلا و سکه
- **کیف پول**: مدیریت موجودی
- **انتقال**: انتقال بین کاربران
- **پروفایل**: تنظیمات کاربری

## 🚀 Deployment Checklist

- [x] Node.js Server آماده
- [x] Health Check API
- [x] Environment Variables
- [x] Database Connection
- [x] Authentication System
- [x] API Routes
- [x] Frontend Components

## 📞 پشتیبانی

برای پشتیبانی و راهنمایی با تیم توسعه تماس بگیرید.

---

**کیمیاگر** - مدیریت طلا و کیف پول دیجیتال