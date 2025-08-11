# 🚀 پرامپت جامع برای پروژه‌های مشابه

## 📋 خلاصه پروژه
ایجاد یک وب‌اپلیکیشن کامل با استفاده از تکنولوژی‌های مدرن و بهترین practices برای مدیریت کاربران، احراز هویت، و عملیات تجاری.

## 🛠️ تکنولوژی‌های مورد استفاده

### **Frontend**
- **Next.js 15+** - React framework با App Router
- **TypeScript** - Type safety و توسعه بهتر
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - مدیریت فرم‌ها
- **Zod** - Schema validation
- **React Query/TanStack Query** - State management و caching

### **Backend & Database**
- **Prisma ORM** - Database toolkit و migrations
- **PostgreSQL** - Database اصلی
- **Redis** - Caching و session management
- **Next.js API Routes** - Backend API endpoints

### **Authentication & Security**
- **JWT (JSON Web Tokens)** - Authentication
- **bcryptjs** - Password hashing
- **NextAuth.js** - Authentication framework (اختیاری)
- **Middleware** - Route protection

### **Deployment & Infrastructure**
- **Docker** - Multi-stage containerization
- **Docker Compose** - Multi-container orchestration
- **Docker Compose Dev** - Development environment
- **Environment Variables** - Configuration management
- **Health Checks** - Service monitoring
- **Volume Management** - Data persistence
- **Network Isolation** - Container networking

## 🏗️ معماری سیستم

### **لایه‌های اصلی**
1. **Presentation Layer** - UI Components
2. **Business Logic Layer** - API Routes
3. **Data Access Layer** - Prisma Client
4. **Infrastructure Layer** - Database, Redis, Docker

### **ساختار فایل‌ها**
```
app/
├── components/          # React Components
│   ├── Auth/           # Authentication components
│   ├── UI/             # Reusable UI components
│   └── Layout/         # Layout components
├── api/                # API endpoints
│   ├── auth/           # Authentication APIs
│   ├── users/          # User management APIs
│   └── [domain]/       # Domain-specific APIs
├── lib/                # Utility functions
├── types/              # TypeScript types
└── styles/             # Global styles
```

## 🔐 سیستم احراز هویت

### **ویژگی‌های اصلی**
- **Registration** - ثبت‌نام کاربران
- **Login/Logout** - ورود و خروج
- **Password Reset** - بازیابی رمز عبور
- **Email Verification** - تایید ایمیل
- **Phone Verification** - تایید شماره تلفن
- **OTP System** - کد تایید یکبار مصرف
- **JWT Refresh** - تمدید توکن‌ها

### **Security Features**
- Password hashing با bcryptjs
- Rate limiting برای API endpoints
- Input validation و sanitization
- CORS configuration
- Secure HTTP headers

## 📊 مدل‌های داده

### **User Model (پایه)**
```typescript
model User {
  id          String   @id @default(cuid())
  username    String   @unique
  email       String?  @unique
  phoneNumber String   @unique
  nationalId  String   @unique
  firstName   String
  lastName    String
  password    String
  isActive    Boolean  @default(true)
  isVerified  Boolean  @default(false)
  role        UserRole @default(USER)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  profile     Profile?
  sessions    Session[]
  transactions Transaction[]
}
```

### **Profile Model**
```typescript
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  avatar      String?
  bio         String?
  address     String?
  city        String?
  country     String?
  postalCode  String?
  dateOfBirth DateTime?
  gender      Gender?
  preferences Json?
  
  user        User     @relation(fields: [userId], references: [id])
}
```

## 🚀 API Endpoints

### **Authentication APIs**
```
POST   /api/auth/register     # ثبت‌نام
POST   /api/auth/login        # ورود
POST   /api/auth/logout       # خروج
POST   /api/auth/refresh      # تمدید توکن
POST   /api/auth/send-otp     # ارسال کد تایید
POST   /api/auth/verify-otp   # تایید کد
POST   /api/auth/verify-email # تایید ایمیل
POST   /api/auth/verify-phone # تایید شماره تلفن
```

### **User Management APIs**
```
GET    /api/users/profile     # دریافت پروفایل
PUT    /api/users/profile     # بروزرسانی پروفایل
GET    /api/users/settings    # تنظیمات کاربر
PUT    /api/users/settings    # بروزرسانی تنظیمات
DELETE /api/users/account     # حذف حساب کاربری
```

### **Admin APIs (اختیاری)**
```
GET    /api/admin/users       # مدیریت کاربران
GET    /api/admin/stats       # آمار سیستم
GET    /api/admin/audit-logs  # لاگ‌های سیستم
```

## 🎨 UI/UX Components

### **Component Library**
- **Button** - دکمه‌های مختلف با variants
- **Input** - فیلدهای ورودی با validation
- **Modal** - پنجره‌های popup
- **Table** - جداول داده
- **Card** - کارت‌های اطلاعات
- **Form** - فرم‌های کامل
- **Alert** - پیام‌های هشدار
- **Loading** - نشانگرهای بارگذاری

### **Layout Components**
- **Header** - هدر سایت
- **Sidebar** - منوی کناری
- **Footer** - فوتر سایت
- **Navigation** - منوی اصلی
- **Breadcrumb** - مسیر صفحه

## 🔧 Configuration & Environment

### **Environment Variables**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# External Services
SMS_API_KEY="your-sms-api-key"
SMS_API_SECRET="your-sms-api-secret"
SMS_FROM_NUMBER="your-sms-from-number"

# App Configuration
NODE_ENV="production"
PORT=3000
HOST="0.0.0.0"
HOSTNAME="0.0.0.0"
NEXT_TELEMETRY_DISABLED=1
```

### **Docker Environment Files**
- **docker-compose.yml** - Production environment
- **docker-compose.dev.yml** - Development environment
- **Dockerfile** - Production multi-stage build
- **Dockerfile.dev** - Development build

### **Docker Configuration**
- **Multi-stage builds** برای بهینه‌سازی image size
- **Production & Development** environments جداگانه
- **Health checks** برای همه سرویس‌ها
- **Volume mapping** برای data persistence
- **Environment variables** مدیریت شده
- **Port mapping** قابل تنظیم (8000:3000 production, 3000:3000 dev)
- **Network isolation** برای امنیت
- **Prisma migrations** خودکار در startup
- **Makefile** برای دستورات ساده Docker

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Mobile-First Approach**
- Touch-friendly interfaces
- Optimized for small screens
- Progressive enhancement

## 🧪 Testing Strategy

### **Testing Levels**
- **Unit Tests** - Jest + React Testing Library
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Playwright یا Cypress
- **Performance Tests** - Lighthouse CI

### **Test Coverage**
- Minimum 80% code coverage
- Critical paths 100% coverage
- User authentication flows
- API endpoints validation

## 🚀 Deployment & CI/CD

### **Build Process**
1. **Code Quality Checks** - ESLint, Prettier
2. **Type Checking** - TypeScript compilation
3. **Testing** - Unit و integration tests
4. **Building** - Next.js production build
5. **Docker Image** - Multi-stage build
6. **Deployment** - Docker Compose یا Kubernetes

### **Docker Commands (Makefile)**
```bash
# Production
make build          # ساخت images
make run            # اجرای production
make stop           # توقف سرویس‌ها
make clean          # پاک کردن کامل
make logs           # نمایش لاگ‌ها
make migrate        # اجرای migrations
make seed           # اجرای seed data

# Development
make dev            # اجرای development
make dev-stop       # توقف development
make dev-logs       # لاگ‌های development
make dev-migrate    # migrations در development
```

### **Monitoring & Logging**
- **Application Logs** - Winston یا Pino
- **Error Tracking** - Sentry
- **Performance Monitoring** - Vercel Analytics
- **Health Checks** - Docker health checks

## 📚 Best Practices

### **Code Quality**
- **ESLint** + **Prettier** برای code formatting
- **Husky** + **lint-staged** برای pre-commit hooks
- **Conventional Commits** برای commit messages
- **Semantic Versioning** برای releases

### **Security**
- **Input Validation** با Zod
- **SQL Injection Prevention** با Prisma
- **XSS Protection** با Content Security Policy
- **CSRF Protection** با CSRF tokens
- **Rate Limiting** برای API endpoints

### **Performance**
- **Code Splitting** با Next.js
- **Image Optimization** با Next.js Image
- **Caching Strategy** با Redis
- **Database Indexing** برای queries
- **Lazy Loading** برای components

## 🎯 Customization Points

### **Domain-Specific Features**
- **Business Logic** - قابل تغییر بر اساس نیاز
- **Data Models** - قابل گسترش
- **API Endpoints** - قابل اضافه کردن
- **UI Components** - قابل سفارشی‌سازی
- **Validation Rules** - قابل تنظیم

### **Integration Points**
- **Payment Gateways** - درگاه‌های پرداخت
- **SMS Services** - سرویس‌های پیامک
- **Email Services** - سرویس‌های ایمیل
- **File Storage** - ذخیره‌سازی فایل
- **Third-party APIs** - API های خارجی

## 📖 Documentation

### **Required Documentation**
- **API Documentation** - OpenAPI/Swagger
- **Component Documentation** - Storybook
- **Setup Guide** - راهنمای نصب
- **Deployment Guide** - راهنمای deployment
- **User Manual** - راهنمای کاربری

## 🔄 Development Workflow

### **Git Workflow**
1. **Feature Branch** - ایجاد branch جدید
2. **Development** - توسعه feature
3. **Testing** - تست کردن
4. **Code Review** - بررسی کد
5. **Merge** - ادغام با main branch
6. **Deploy** - deployment

### **Release Process**
1. **Version Bump** - افزایش version
2. **Changelog** - ثبت تغییرات
3. **Tagging** - ایجاد git tag
4. **Deployment** - deployment به production
5. **Monitoring** - نظارت بر عملکرد

## 💡 Tips & Recommendations

### **Development Tips**
- از **TypeScript strict mode** استفاده کنید
- **Error boundaries** برای React components
- **Loading states** برای همه async operations
- **Proper error handling** در همه API endpoints
- **Accessibility** را فراموش نکنید

### **Performance Tips**
- از **React.memo** برای expensive components
- **useMemo** و **useCallback** برای optimization
- **Virtual scrolling** برای لیست‌های بزرگ
- **Image optimization** با Next.js
- **Bundle analysis** برای شناسایی bottlenecks

---

## 🎯 نتیجه‌گیری

این پرامپت یک پایه جامع برای ایجاد پروژه‌های مشابه فراهم می‌کند که شامل:

✅ **تکنولوژی‌های مدرن** و به‌روز  
✅ **معماری مقیاس‌پذیر** و قابل نگهداری  
✅ **سیستم امنیتی قوی** برای احراز هویت  
✅ **UI/UX components** قابل استفاده مجدد  
✅ **Dockerization کامل** برای deployment  
✅ **Best practices** برای توسعه و deployment  

## 🐳 وضعیت Dockerization

### **✅ فایل‌های Docker موجود:**
- **Dockerfile** - Production multi-stage build
- **Dockerfile.dev** - Development environment
- **docker-compose.yml** - Production services
- **docker-compose.dev.yml** - Development services
- **Makefile** - Docker commands
- **.dockerignore** - Build optimization

### **✅ سرویس‌های Docker:**
- **PostgreSQL** - Database با health checks
- **Redis** - Caching و sessions
- **App** - Next.js application
- **Networks** - Container isolation
- **Volumes** - Data persistence

### **✅ ویژگی‌های پیشرفته:**
- **Multi-stage builds** برای بهینه‌سازی
- **Health checks** برای همه سرویس‌ها
- **Automatic migrations** در startup
- **Environment separation** (prod/dev)
- **Port mapping** قابل تنظیم
- **Volume management** برای data

با پیروی از این پرامپت، می‌توانید پروژه‌های مشابه با کیفیت بالا و قابلیت‌های کامل ایجاد کنید. 🚀
