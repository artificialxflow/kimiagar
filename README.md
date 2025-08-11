# کیمیاگر - پلتفرم مدیریت طلا و کیف پول دیجیتال

## 🚀 قابلیت‌ها

- ✅ **سیستم ثبت‌نام و ورود** - فرم 6 مرحله‌ای با اعتبارسنجی کامل
- ✅ **مدیریت کیف پول** - واریز، برداشت، موجودی ریالی و طلایی
- ✅ **خرید و فروش طلا/سکه** - با قیمت‌های لحظه‌ای
- ✅ **تاریخچه تراکنش‌ها** - با pagination
- ✅ **پروفایل کاربری** - ویرایش اطلاعات شخصی
- ✅ **منوی ناوبری** - رابط کاربری کامل
- ✅ **API کامل** - 9 API Route
- ✅ **دیتابیس PostgreSQL** - با Prisma ORM

## 🛠️ تکنولوژی‌ها

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Vazirmatn Font
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Icons:** Lucide React
- **Charts:** Recharts
- **Deployment:** Docker, Liara

## 🐳 Docker Deployment

### ساخت و اجرای محلی

```bash
# ساخت image
docker build -t kimiagar .

# اجرا با docker run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://root:ANG5guAtXXLBvOLKJ7vqnAk2@tirich-mir.liara.cloud:32252/postgres" \
  kimiagar

# یا با docker-compose
docker-compose up -d
```

### Deploy در Liara

1. **ساخت image:**
```bash
docker build -t kimiagar .
```

2. **Push به Liara:**
```bash
# Login به Liara
liara login

# Deploy
liara deploy --image kimiagar --port 3000
```

3. **تنظیم Environment Variables در Liara:**
```env
DATABASE_URL=postgresql://root:ANG5guAtXXLBvOLKJ7vqnAk2@tirich-mir.liara.cloud:32252/postgres
NODE_ENV=production
```

## 🚀 اجرای محلی

### پیش‌نیازها
- Node.js 18+
- PostgreSQL
- npm یا yarn

### نصب و اجرا

```bash
# Clone پروژه
git clone <repository-url>
cd kimiagar

# نصب dependencies
npm install

# تنظیم environment variables
cp .env.example .env
# ویرایش .env و قرار دادن DATABASE_URL

# اجرای migration
npx prisma migrate deploy

# اجرای development server
npm run dev
```

## 📁 ساختار پروژه

```
kimiagar/
├── app/
│   ├── api/                 # API Routes
│   ├── components/          # React Components
│   ├── dashboard/          # Dashboard Page
│   ├── login/              # Login Page
│   ├── profile/            # Profile Page
│   ├── trading/            # Trading Page
│   ├── wallet/             # Wallet Page
│   ├── globals.css         # Global Styles
│   ├── layout.tsx          # Root Layout
│   └── page.tsx            # Home Page
├── prisma/
│   └── schema.prisma       # Database Schema
├── public/                 # Static Files
├── Dockerfile              # Docker Configuration
├── docker-compose.yml      # Docker Compose
├── next.config.ts          # Next.js Config
├── tailwind.config.js      # Tailwind Config
└── package.json            # Dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - ثبت‌نام کاربر

### Profile
- `PUT /api/profile/update` - به‌روزرسانی پروفایل

### Wallet
- `GET /api/wallet/balance` - دریافت موجودی
- `POST /api/wallet/deposit` - واریز
- `POST /api/wallet/withdraw` - برداشت

### Trading
- `POST /api/trading/buy` - خرید
- `POST /api/trading/sell` - فروش

### Data
- `GET /api/prices` - قیمت‌های لحظه‌ای
- `GET /api/transactions` - تاریخچه تراکنش‌ها
- `GET /api/health` - Health Check

## 🎨 UI/UX Features

- **RTL Support** - پشتیبانی کامل از راست‌چین
- **Persian Font** - فونت Vazirmatn
- **Responsive Design** - سازگار با تمام دستگاه‌ها
- **Modern UI** - طراحی مدرن و زیبا
- **Loading States** - نمایش وضعیت بارگذاری
- **Error Handling** - مدیریت خطاها
- **Form Validation** - اعتبارسنجی فرم‌ها

## 🔒 Security

- **Input Validation** - اعتبارسنجی ورودی‌ها
- **Database Constraints** - محدودیت‌های دیتابیس
- **Error Handling** - مدیریت خطاها
- **Environment Variables** - متغیرهای محیطی

## 📊 Database Schema

### Tables
- **users** - اطلاعات کاربران
- **wallets** - کیف پول‌های ریالی و طلایی
- **transactions** - تراکنش‌های مالی
- **orders** - سفارش‌های خرید و فروش
- **prices** - قیمت‌های لحظه‌ای
- **commissions** - تنظیمات کارمزد
- **system_settings** - تنظیمات سیستم

## 🚀 Deployment Checklist

- [x] Dockerfile آماده
- [x] docker-compose.yml آماده
- [x] Health Check API
- [x] Environment Variables
- [x] Database Migration
- [x] Production Build
- [x] Security Headers
- [x] Error Handling

## 📝 License

MIT License

---

**توسعه‌دهنده:** تیم کیمیاگر  
**آخرین به‌روزرسانی:** 22 تیر 1403
