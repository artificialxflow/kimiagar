# پروژه کیمیاگر - چک‌لیست به‌روزرسانی و ویژگی‌های جدید

## 🎯 خلاصه پروژه
- **نام:** کیمیاگر (Kimiagar)
- **نوع:** پلتفرم مدیریت طلا و کیف پول دیجیتال
- **وضعیت فعلی:** سیستم پایه کار می‌کند، نیاز به بهبودهای اساسی دارد
- **هدف:** تبدیل به پلتفرم کامل و حرفه‌ای خرید و فروش طلا

---

## 🔐 سیستم احراز هویت پیشرفته

### اولویت: **بالا** - امنیت و تجربه کاربری بهتر

#### لاگین با SMS (OTP)
- [ ] **ارسال کد OTP:** ارسال کد 6 رقمی به شماره موبایل کاربر
- [ ] **تایید کد:** بررسی صحت کد وارد شده
- [ ] **مدت اعتبار:** کد OTP معتبر برای 5 دقیقه
- [ ] **محدودیت ارسال:** حداکثر 3 بار در ساعت
- [ ] **امنیت:** استفاده از rate limiting برای جلوگیری از spam

#### ثبت‌نام با ایمیل + تایید کد
- [ ] **فیلدهای جدید:** نام، نام خانوادگی، شماره موبایل، کد ملی، ایمیل
- [ ] **ارسال کد تایید:** ارسال کد 6 رقمی به ایمیل کاربر
- [ ] **تایید ایمیل:** کاربر باید کد را وارد کند تا حساب فعال شود
- [ ] **مدت اعتبار:** کد تایید معتبر برای 15 دقیقه
- [ ] **محدودیت ارسال:** حداکثر 5 بار در روز

#### فیلدهای جدید ثبت‌نام
- [ ] **نام:** حداقل 2، حداکثر 30 کاراکتر
- [ ] **نام خانوادگی:** حداقل 2، حداکثر 30 کاراکتر
- [ ] **شماره موبایل:** فرمت 11 رقمی ایران (09xxxxxxxxx)
- [ ] **کد ملی:** 10 رقمی، بررسی صحت
- [ ] **ایمیل:** فرمت معتبر، منحصر به فرد
- [ ] **رمز عبور:** حداقل 8 کاراکتر، شامل حروف و اعداد
- [ ] **تایید رمز عبور:** تطبیق با رمز عبور اصلی

#### به‌روزرسانی دیتابیس
- [ ] **فیلد email:** اضافه کردن به مدل User
- [ ] **فیلد isEmailVerified:** وضعیت تایید ایمیل
- [ ] **فیلد emailVerificationCode:** کد تایید ایمیل
- [ ] **فیلد emailVerificationExpires:** تاریخ انقضای کد
- [ ] **فیلد phoneVerificationCode:** کد تایید موبایل
- [ ] **فیلد phoneVerificationExpires:** تاریخ انقضای کد

#### API Routes جدید
- [ ] **POST /api/auth/send-otp:** ارسال کد OTP برای لاگین
- [ ] **POST /api/auth/verify-otp:** تایید کد OTP
- [ ] **POST /api/auth/send-email-verification:** ارسال کد تایید ایمیل
- [ ] **POST /api/auth/verify-email:** تایید کد ایمیل
- [ ] **POST /api/auth/resend-verification:** ارسال مجدد کد تایید

#### سرویس‌های خارجی
- [ ] **سرویس SMS:** اتصال به سرویس ارسال SMS (کاوه‌پیام، ملی‌پیام)
- [ ] **سرویس ایمیل:** اتصال به سرویس ارسال ایمیل (SendGrid، Mailgun)
- [ ] **تنظیمات محیطی:** API keys و تنظیمات سرویس‌ها

---

## 🗄️ بازطراحی ساختار دیتابیس

### اولویت: **بالا** - پایه و اساس تمام ویژگی‌های جدید

#### 📋 **Migration جدید: 20250731000000_enhance_database_structure**

##### **1. بهبود جدول users**
- [ ] **فیلدهای امنیتی جدید:**
  - `lastLoginAt`: زمان آخرین ورود موفق
  - `loginAttempts`: تعداد تلاش‌های ورود ناموفق
  - `isBlocked`: وضعیت مسدودیت حساب
  - `blockedUntil`: زمان پایان مسدودیت
  - `failedLoginAttempts`: تعداد تلاش‌های ناموفق متوالی
  - `lastFailedLoginAt`: زمان آخرین تلاش ناموفق

##### **2. بهبود جدول wallets**
- [ ] **فیلدهای مدیریتی جدید:**
  - `isActive`: وضعیت فعال بودن کیف پول
  - `currency`: نوع ارز (پیش‌فرض: IRR)
  - `walletAddress`: کد 16 رقمی منحصر به فرد کیف پول
  - `dailyTransferLimit`: محدودیت انتقال روزانه
  - `monthlyTransferLimit`: محدودیت انتقال ماهانه
  - `isVerified`: وضعیت تایید کیف پول

##### **3. بهبود جدول transactions**
- [ ] **فیلدهای ردیابی جدید:**
  - `referenceId`: شماره مرجع تراکنش (16 رقمی)
  - `metadata`: اطلاعات اضافی (JSON)
  - `ipAddress`: آدرس IP کاربر
  - `userAgent`: مرورگر و سیستم عامل کاربر
  - `location`: موقعیت جغرافیایی (اختیاری)
  - `riskScore`: امتیاز ریسک تراکنش

##### **4. بهبود جدول orders**
- [ ] **فیلدهای مدیریتی جدید:**
  - `commissionRate`: نرخ کارمزد اعمال شده
  - `isAutomatic`: نوع معامله (خودکار/دستی)
  - `notes`: یادداشت‌های کاربر
  - `adminNotes`: یادداشت‌های ادمین
  - `processingTime`: زمان پردازش سفارش
  - `statusHistory`: تاریخچه تغییرات وضعیت (JSON)

##### **5. بهبود جدول prices**
- [ ] **فیلدهای قیمت‌گذاری جدید:**
  - `source`: منبع قیمت (API، دستی، محاسباتی)
  - `lastUpdatedBy`: آخرین کاربر به‌روزرسانی کننده
  - `priceChange`: تغییر قیمت نسبت به روز قبل
  - `priceChangePercentage`: درصد تغییر قیمت
  - `isActive`: وضعیت فعال بودن قیمت
  - `validFrom`: تاریخ شروع اعتبار
  - `validTo`: تاریخ پایان اعتبار

##### **6. بهبود جدول commissions**
- [ ] **فیلدهای مدیریتی جدید:**
  - `isActive`: وضعیت فعال بودن نرخ
  - `validFrom`: تاریخ شروع اعتبار
  - `validTo`: تاریخ پایان اعتبار
  - `changedBy`: کاربر تغییر دهنده
  - `changeReason`: دلیل تغییر نرخ
  - `previousRate`: نرخ قبلی
  - `changePercentage`: درصد تغییر

##### **7. بهبود جدول transfers**
- [ ] **فیلدهای امنیتی جدید:**
  - `referenceId`: شماره مرجع انتقال
  - `statusHistory`: تاریخچه تغییرات وضعیت
  - `adminNotes`: یادداشت‌های ادمین
  - `riskScore`: امتیاز ریسک انتقال
  - `isVerified`: وضعیت تایید انتقال
  - `verificationMethod`: روش تایید (SMS، ایمیل، دستی)

##### **8. بهبود جدول deliveryRequests**
- [ ] **فیلدهای مدیریتی جدید:**
  - `referenceId`: شماره مرجع درخواست
  - `deliveryAddress`: آدرس تحویل
  - `contactPerson`: شخص تماس گیرنده
  - `contactPhone`: شماره تماس تحویل
  - `preferredDeliveryDate`: تاریخ ترجیحی تحویل
  - `deliveryNotes`: یادداشت‌های تحویل
  - `statusHistory`: تاریخچه تغییرات وضعیت
  - `adminNotes`: یادداشت‌های ادمین

##### **9. بهبود جدول notifications**
- [ ] **فیلدهای ارسال جدید:**
  - `deliveryStatus`: وضعیت ارسال (pending، sent، failed)
  - `deliveryAttempts`: تعداد تلاش‌های ارسال
  - `lastDeliveryAttempt`: آخرین تلاش ارسال
  - `deliveryMethod`: روش ارسال (SMS، ایمیل، push)
  - `templateId`: شناسه قالب پیام
  - `metadata`: اطلاعات اضافی (JSON)
  - `isRead`: وضعیت خوانده شدن

##### **10. بهبود جدول adminUsers**
- [ ] **فیلدهای امنیتی جدید:**
  - `lastLoginAt`: زمان آخرین ورود
  - `loginAttempts`: تعداد تلاش‌های ورود
  - `isActive`: وضعیت فعال بودن
  - `permissions`: مجوزهای دسترسی (JSON)
  - `role`: نقش کاربر (super_admin، admin، moderator)
  - `department`: بخش کاری
  - `phoneNumber`: شماره تماس

##### **11. بهبود جدول auditLogs**
- [ ] **فیلدهای ردیابی جدید:**
  - `ipAddress`: آدرس IP کاربر
  - `userAgent`: مرورگر و سیستم عامل
  - `location`: موقعیت جغرافیایی
  - `sessionId`: شناسه نشست
  - `requestId`: شناسه درخواست
  - `responseTime`: زمان پاسخ‌دهی
  - `statusCode`: کد وضعیت HTTP
  - `errorMessage`: پیام خطا (در صورت وجود)

#### 🔧 **تغییرات Prisma Schema**

##### **1. Enum های جدید**
```prisma
enum UserStatus {
  ACTIVE
  INACTIVE
  BLOCKED
  PENDING_VERIFICATION
}

enum WalletStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_VERIFICATION
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
  FAILED
}

enum TransferStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  REVERSED
}

enum DeliveryStatus {
  REQUESTED
  APPROVED
  PROCESSING
  READY
  DELIVERED
  CANCELLED
}

enum NotificationType {
  SMS
  EMAIL
  PUSH
  IN_APP
}

enum CommissionType {
  BUY
  SELL
  TRANSFER
  DELIVERY
}
```

##### **2. فیلدهای جدید در مدل‌ها**
```prisma
model User {
  // فیلدهای موجود...
  
  // فیلدهای جدید
  lastLoginAt        DateTime?
  loginAttempts      Int       @default(0)
  isBlocked          Boolean   @default(false)
  blockedUntil       DateTime?
  failedLoginAttempts Int      @default(0)
  lastFailedLoginAt  DateTime?
  status             UserStatus @default(ACTIVE)
  
  // روابط جدید
  wallets            Wallet[]
  transactions       Transaction[]
  orders             Order[]
  transfers          Transfer[]
  deliveryRequests   DeliveryRequest[]
  notifications      Notification[]
  auditLogs          AuditLog[]
}

model Wallet {
  // فیلدهای موجود...
  
  // فیلدهای جدید
  isActive           Boolean   @default(true)
  currency           String    @default("IRR")
  walletAddress      String    @unique @default(cuid())
  dailyTransferLimit Decimal   @default(10000000) // 10 میلیون تومان
  monthlyTransferLimit Decimal @default(100000000) // 100 میلیون تومان
  isVerified         Boolean   @default(false)
  status             WalletStatus @default(ACTIVE)
  
  // روابط جدید
  user               User      @relation(fields: [userId], references: [id])
  transactions       Transaction[]
  transfers          Transfer[]
}
```

#### 📊 **Migration SQL کامل**

##### **1. ایجاد جداول جدید**
```sql
-- جدول جدید برای تاریخچه تغییرات
CREATE TABLE "status_history" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "oldStatus" TEXT,
  "newStatus" TEXT NOT NULL,
  "changedBy" TEXT NOT NULL,
  "changeReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- جدول جدید برای قالب‌های پیام
CREATE TABLE "message_templates" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "variables" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- جدول جدید برای تنظیمات سیستم
CREATE TABLE "system_settings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
```

##### **2. اضافه کردن فیلدهای جدید**
```sql
-- بهبود جدول users
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "loginAttempts" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "isBlocked" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN "blockedUntil" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "failedLoginAttempts" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "lastFailedLoginAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "status" TEXT DEFAULT 'ACTIVE';

-- بهبود جدول wallets
ALTER TABLE "wallets" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "wallets" ADD COLUMN "currency" TEXT DEFAULT 'IRR';
ALTER TABLE "wallets" ADD COLUMN "walletAddress" TEXT UNIQUE DEFAULT gen_random_uuid()::text;
ALTER TABLE "wallets" ADD COLUMN "dailyTransferLimit" DECIMAL(20,2) DEFAULT 10000000;
ALTER TABLE "wallets" ADD COLUMN "monthlyTransferLimit" DECIMAL(20,2) DEFAULT 100000000;
ALTER TABLE "wallets" ADD COLUMN "isVerified" BOOLEAN DEFAULT false;
ALTER TABLE "wallets" ADD COLUMN "status" TEXT DEFAULT 'ACTIVE';

-- بهبود جدول transactions
ALTER TABLE "transactions" ADD COLUMN "referenceId" TEXT UNIQUE DEFAULT gen_random_uuid()::text;
ALTER TABLE "transactions" ADD COLUMN "metadata" JSONB;
ALTER TABLE "transactions" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "transactions" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "transactions" ADD COLUMN "location" TEXT;
ALTER TABLE "transactions" ADD COLUMN "riskScore" INTEGER DEFAULT 0;

-- بهبود جدول orders
ALTER TABLE "orders" ADD COLUMN "commissionRate" DECIMAL(5,4);
ALTER TABLE "orders" ADD COLUMN "isAutomatic" BOOLEAN DEFAULT true;
ALTER TABLE "orders" ADD COLUMN "notes" TEXT;
ALTER TABLE "orders" ADD COLUMN "adminNotes" TEXT;
ALTER TABLE "orders" ADD COLUMN "processingTime" INTEGER; -- به ثانیه
ALTER TABLE "orders" ADD COLUMN "statusHistory" JSONB;

-- بهبود جدول prices
ALTER TABLE "prices" ADD COLUMN "source" TEXT DEFAULT 'MANUAL';
ALTER TABLE "prices" ADD COLUMN "lastUpdatedBy" TEXT;
ALTER TABLE "prices" ADD COLUMN "priceChange" DECIMAL(20,2);
ALTER TABLE "prices" ADD COLUMN "priceChangePercentage" DECIMAL(5,2);
ALTER TABLE "prices" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "prices" ADD COLUMN "validFrom" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "prices" ADD COLUMN "validTo" TIMESTAMP(3);

-- بهبود جدول commissions
ALTER TABLE "commissions" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "commissions" ADD COLUMN "validFrom" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "commissions" ADD COLUMN "validTo" TIMESTAMP(3);
ALTER TABLE "commissions" ADD COLUMN "changedBy" TEXT;
ALTER TABLE "commissions" ADD COLUMN "changeReason" TEXT;
ALTER TABLE "commissions" ADD COLUMN "previousRate" DECIMAL(5,4);
ALTER TABLE "commissions" ADD COLUMN "changePercentage" DECIMAL(5,2);

-- بهبود جدول transfers
ALTER TABLE "transfers" ADD COLUMN "referenceId" TEXT UNIQUE DEFAULT gen_random_uuid()::text;
ALTER TABLE "transfers" ADD COLUMN "statusHistory" JSONB;
ALTER TABLE "transfers" ADD COLUMN "adminNotes" TEXT;
ALTER TABLE "transfers" ADD COLUMN "riskScore" INTEGER DEFAULT 0;
ALTER TABLE "transfers" ADD COLUMN "isVerified" BOOLEAN DEFAULT false;
ALTER TABLE "transfers" ADD COLUMN "verificationMethod" TEXT;

-- بهبود جدول deliveryRequests
ALTER TABLE "deliveryRequests" ADD COLUMN "referenceId" TEXT UNIQUE DEFAULT gen_random_uuid()::text;
ALTER TABLE "deliveryRequests" ADD COLUMN "deliveryAddress" TEXT;
ALTER TABLE "deliveryRequests" ADD COLUMN "contactPerson" TEXT;
ALTER TABLE "deliveryRequests" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "deliveryRequests" ADD COLUMN "preferredDeliveryDate" DATE;
ALTER TABLE "deliveryRequests" ADD COLUMN "deliveryNotes" TEXT;
ALTER TABLE "deliveryRequests" ADD COLUMN "statusHistory" JSONB;
ALTER TABLE "deliveryRequests" ADD COLUMN "adminNotes" TEXT;

-- بهبود جدول notifications
ALTER TABLE "notifications" ADD COLUMN "deliveryStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "notifications" ADD COLUMN "deliveryAttempts" INTEGER DEFAULT 0;
ALTER TABLE "notifications" ADD COLUMN "lastDeliveryAttempt" TIMESTAMP(3);
ALTER TABLE "notifications" ADD COLUMN "deliveryMethod" TEXT DEFAULT 'SMS';
ALTER TABLE "notifications" ADD COLUMN "templateId" TEXT;
ALTER TABLE "notifications" ADD COLUMN "metadata" JSONB;
ALTER TABLE "notifications" ADD COLUMN "isRead" BOOLEAN DEFAULT false;

-- بهبود جدول adminUsers
ALTER TABLE "adminUsers" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "adminUsers" ADD COLUMN "loginAttempts" INTEGER DEFAULT 0;
ALTER TABLE "adminUsers" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "adminUsers" ADD COLUMN "permissions" JSONB;
ALTER TABLE "adminUsers" ADD COLUMN "role" TEXT DEFAULT 'ADMIN';
ALTER TABLE "adminUsers" ADD COLUMN "department" TEXT;
ALTER TABLE "adminUsers" ADD COLUMN "phoneNumber" TEXT;

-- بهبود جدول auditLogs
ALTER TABLE "auditLogs" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "auditLogs" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "auditLogs" ADD COLUMN "location" TEXT;
ALTER TABLE "auditLogs" ADD COLUMN "sessionId" TEXT;
ALTER TABLE "auditLogs" ADD COLUMN "requestId" TEXT;
ALTER TABLE "auditLogs" ADD COLUMN "responseTime" INTEGER; -- به میلی‌ثانیه
ALTER TABLE "auditLogs" ADD COLUMN "statusCode" INTEGER;
ALTER TABLE "auditLogs" ADD COLUMN "errorMessage" TEXT;
```

#### 🔍 **Index های جدید برای عملکرد بهتر**
```sql
-- Index برای جستجوی سریع
CREATE INDEX "idx_users_status" ON "users"("status");
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_phone" ON "users"("phone");

CREATE INDEX "idx_wallets_address" ON "wallets"("walletAddress");
CREATE INDEX "idx_wallets_status" ON "wallets"("status");

CREATE INDEX "idx_transactions_reference" ON "transactions"("referenceId");
CREATE INDEX "idx_transactions_user_date" ON "transactions"("userId", "createdAt");

CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_orders_user_date" ON "orders"("userId", "createdAt");

CREATE INDEX "idx_transfers_reference" ON "transfers"("referenceId");
CREATE INDEX "idx_transfers_status" ON "transfers"("status");

CREATE INDEX "idx_delivery_requests_reference" ON "deliveryRequests"("referenceId");
CREATE INDEX "idx_delivery_requests_status" ON "deliveryRequests"("status");

CREATE INDEX "idx_notifications_user_status" ON "notifications"("userId", "deliveryStatus");
CREATE INDEX "idx_notifications_created_at" ON "notifications"("createdAt");

CREATE INDEX "idx_audit_logs_user_date" ON "auditLogs"("userId", "createdAt");
CREATE INDEX "idx_audit_logs_action" ON "auditLogs"("action");
```

#### 📝 **دستورات اجرای Migration**

##### **1. ایجاد Migration**
```bash
# در پوشه پروژه
npx prisma migrate dev --name enhance_database_structure
```

##### **2. بررسی Migration**
```bash
# بررسی وضعیت migrations
npx prisma migrate status

# مشاهده migration های موجود
npx prisma migrate list
```

##### **3. اجرای Migration**
```bash
# اجرای migration در محیط production
npx prisma migrate deploy

# یا در محیط development
npx prisma migrate dev
```

##### **4. به‌روزرسانی Prisma Client**
```bash
# تولید Prisma Client جدید
npx prisma generate
```

#### ⚠️ **نکات مهم Migration**

##### **1. Backup دیتابیس**
- [ ] **قبل از Migration:** ایجاد backup کامل از دیتابیس
- [ ] **تست Migration:** اجرای Migration در محیط test
- [ ] **Rollback Plan:** برنامه بازگشت در صورت مشکل

##### **2. Downtime**
- [ ] **زمان Migration:** برنامه‌ریزی برای کمترین downtime
- [ ] **اعلان کاربران:** اطلاع‌رسانی از زمان تعمیر و نگهداری
- [ ] **Maintenance Mode:** فعال‌سازی حالت تعمیر

##### **3. Data Migration**
- [ ] **فیلدهای موجود:** حفظ داده‌های موجود
- [ ] **مقادیر پیش‌فرض:** تنظیم مقادیر مناسب برای فیلدهای جدید
- [ ] **اعتبارسنجی:** بررسی صحت داده‌ها پس از Migration

#### 🎯 **نتیجه Migration**

پس از اجرای موفق Migration جدید:

- **ساختار دیتابیس بهبود یافته** و آماده برای ویژگی‌های جدید
- **امنیت سیستم افزایش یافته** با فیلدهای امنیتی جدید
- **عملکرد بهتر** با Index های بهینه
- **قابلیت ردیابی کامل** تمام عملیات سیستم
- **انعطاف‌پذیری بیشتر** برای توسعه‌های آینده

---

## 📱 سیستم اعلان‌های SMS

### اولویت: **بالا** - برای جلوگیری از دبه و تضمین شفافیت معاملات

#### اعلان‌های معاملات خرید و فروش
- [ ] **خرید طلا:** "معامله خرید انجام شد - میزان: X گرم، قیمت هر گرم: X تومان، مبلغ کل: X تومان، تاریخ: X"
- [ ] **فروش طلا:** "معامله فروش انجام شد - میزان: X گرم، قیمت هر گرم: X تومان، مبلغ کل: X تومان، تاریخ: X"
- [ ] **جزئیات کامل:** شامل نوع محصول (18K، سکه بهار، نیم سکه، ربع سکه)

#### اعلان‌های مالی
- [ ] **واریز پول:** "مبلغ X تومان به حساب شما واریز شد، موجودی جدید: X تومان"
- [ ] **برداشت پول:** "مبلغ X تومان از حساب شما برداشت شد، موجودی جدید: X تومان"
- [ ] **خرید طلا:** "X گرم طلا به کیف پول طلای شما اضافه شد، موجودی طلا: X گرم"
- [ ] **فروش طلا:** "X گرم طلا از کیف پول طلای شما کم شد، موجودی طلا: X گرم"

#### اعلان‌های تحویل طلای فیزیکی
- [ ] **درخواست تحویل:** "درخواست تحویل X گرم طلای فیزیکی ثبت شد، کارمزد: X تومان"
- [ ] **تایید تحویل:** "درخواست تحویل شما تایید شد، ظرف 10 روز آماده تحویل خواهد بود"
- [ ] **آماده تحویل:** "طلای فیزیکی شما آماده تحویل است، لطفاً به فروشگاه مراجعه کنید"

---

## 🏠 صفحه اصلی (Landing Page)

### اولویت: **بالا** - برای معرفی و اعتمادسازی

#### محتوای اصلی
- [ ] **معرفی شرکت:** توضیحات کامل درباره کیمیاگر
- [ ] **خدمات اصلی:** خرید و فروش طلای آب شده، نگهداری در خزانه امن
- [ ] **مزایا:** امنیت، شفافیت، قیمت‌های منصفانه
- [ ] **دسترسی‌ها:** دکمه‌های "ورود به حساب" و "ثبت‌نام"

#### طراحی و UX
- [ ] **طراحی حرفه‌ای:** مشابه دیجی‌گلد و سایر پلتفرم‌های معتبر
- [ ] **راست‌چین:** مناسب زبان فارسی
- [ ] **واکنش‌گرا:** سازگار با موبایل و دسکتاپ
- [ ] **اعتمادسازی:** گواهینامه‌ها، نظرات مشتریان، آمار

---

## 📱 بهینه‌سازی داشبورد موبایل

### اولویت: **متوسط** - بهبود تجربه کاربری

#### تغییرات چیدمان
- [ ] **موبایل:** نمودار زیر خلاصه کیف پول، دسترسی‌های سریع بالاتر
- [ ] **دسکتاپ:** خلاصه کیف پول سمت راست، دسترسی‌ها گوشه
- [ ] **سازگاری:** تشخیص خودکار نوع دستگاه و تغییر چیدمان

---

## 🛒 صفحات جداگانه خرید و فروش

### اولویت: **بالا** - جداسازی کامل فرآیندها

#### صفحه خرید (Buy Page)
- [ ] **فقط قیمت‌های خرید:** نمایش قیمت خرید برای تمام محصولات
- [ ] **محصولات:** طلای 18K، سکه بهار آزادی، نیم سکه، ربع سکه
- [ ] **حذف عناصر:** نوع معامله دستی، تاییدیه اپراتور
- [ ] **ورودی‌های دوگانه:** وزن (گرم) + معادل ریالی
- [ ] **نمایش موجودی:** موجودی ریالی کیف پول کاربر

#### صفحه فروش (Sell Page)
- [ ] **فقط قیمت‌های فروش:** نمایش قیمت فروش برای تمام محصولات
- [ ] **محصولات:** طلای 18K، سکه بهار آزادی، نیم سکه، ربع سکه
- [ ] **حذف عناصر:** نوع معامله دستی، تاییدیه اپراتور
- [ ] **ورودی‌های دوگانه:** وزن (گرم) + معادل ریالی
- [ ] **نمایش موجودی:** موجودی طلای کیف پول کاربر

---

## 💰 ورودی‌های انعطاف‌پذیر معاملات

### اولویت: **بالا** - انعطاف‌پذیری کاربر

#### ورودی دوگانه
- [ ] **وزن (گرم):** کاربر می‌تواند مستقیماً وزن طلا را وارد کند
- [ ] **معادل ریالی:** کاربر می‌تواند مبلغ ریالی را وارد کند
- [ ] **تبدیل خودکار:** محاسبه خودکار معادل وزن/ریال
- [ ] **اعتبارسنجی:** بررسی موجودی کافی

#### اعتبارسنجی سکه‌ها
- [ ] **تعداد کامل:** سکه‌ها فقط به صورت عدد کامل قابل ورود
- [ ] **پیام خطا:** "سکه باید به صورت تعداد کامل وارد شود"
- [ ] **محاسبه دقیق:** تبدیل وزن به تعداد سکه

---

## 🎨 بهبود رنگ‌بندی و طراحی

### اولویت: **متوسط** - ظاهر حرفه‌ای‌تر

#### تغییرات رنگ
- [ ] **رنگ‌های جدید:** خروج از حالت خامی، رنگ‌های پخته و جذاب
- [ ] **تم طلایی:** حفظ هویت طلایی اما بهبود شده
- [ ] **کنتراست:** بهبود خوانایی و زیبایی
- [ ] **سازگاری:** رنگ‌های مناسب برای تمام المنت‌ها

---

## 🔄 انتقال بین کاربران

### اولویت: **متوسط** - قابلیت جدید

#### آدرس کیف پول
- [ ] **کد 16 رقمی:** هر کاربر یک کد منحصر به فرد دریافت می‌کند
- [ ] **شبیه شماره کارت:** فرمت آسان برای به خاطر سپردن
- [ ] **تولید خودکار:** در زمان ثبت‌نام

#### فرآیند انتقال
- [ ] **انتخاب مبدا:** کیف پول کاربر فرستنده
- [ ] **انتخاب مقصد:** وارد کردن کد 16 رقمی کاربر گیرنده
- [ ] **انتخاب نوع:** انتقال پول یا طلا
- [ ] **مبلغ/وزن:** تعیین مقدار انتقال
- [ ] **کمک‌مزد:** کسر کارمزد از انتقال

---

## 📦 تحویل طلای فیزیکی

### اولویت: **متوسط** - قابلیت جدید

#### قوانین تحویل
- [ ] **مبنای 5 گرم:** تحویل فقط به صورت مضرب 5 گرم
- [ ] **مثال:** 48 گرم موجودی = امکان تحویل 45 گرم
- [ ] **کارمزد:** کسر کارمزد از درخواست

#### فرآیند تحویل
- [ ] **درخواست:** کاربر درخواست تحویل می‌دهد
- [ ] **تایید پشتیبانی:** بررسی توسط تیم پشتیبانی
- [ ] **زمان تحویل:** حداکثر 10 روز کاری
- [ ] **محل تحویل:** فروشگاه‌های مشخص شده

---

## 🆘 پشتیبانی و اطلاعات

### اولویت: **پایین** - تکمیل اطلاعات

#### بخش پشتیبانی
- [ ] **سوالات متداول:** پاسخ به سوالات رایج
- [ ] **تماس با پشتیبانی:** اطلاعات تماس
- [ ] **راهنمای استفاده:** آموزش استفاده از پلتفرم

#### درباره ما
- [ ] **تاریخچه شرکت:** معرفی کامل
- [ ] **ماموریت و چشم‌انداز:** اهداف شرکت
- [ ] **تیم:** معرفی اعضای کلیدی
- [ ] **مدارک و مجوزها:** گواهینامه‌های رسمی

---

## 🪙 گسترش انواع سکه

### اولویت: **متوسط** - تکمیل محصولات

#### سکه‌های جدید
- [ ] **تمام سکه 86:** اضافه کردن به ProductType
- [ ] **نیم سکه 86:** اضافه کردن به ProductType
- [ ] **ربع سکه 86:** اضافه کردن به ProductType
- [ ] **قیمت‌گذاری:** تعیین قیمت خرید و فروش

#### به‌روزرسانی دیتابیس
- [ ] **Prisma Schema:** اضافه کردن enum های جدید
- [ ] **Migration:** اجرای migration برای جداول
- [ ] **API Routes:** به‌روزرسانی API های قیمت

---

## 💱 منبع قیمت طلا

### اولویت: **متوسط** - قیمت‌گذاری دقیق

#### قیمت نقد خرد
- [ ] **تایید منبع:** استفاده از قیمت نقد خرد برای طلای 18K
- [ ] **به‌روزرسانی:** اتصال به API قیمت‌های لحظه‌ای
- [ ] **اعتبارسنجی:** بررسی صحت قیمت‌ها

---

## 🔄 تغییرات اصطلاحات

### اولویت: **پایین** - یکسان‌سازی زبان

#### تغییرات UI
- [ ] **کمیسیون → کارمزد:** در تمام بخش‌های رابط کاربری
- [ ] **یوزرنیم → نام کاربری:** در فرم‌های ورود و ثبت‌نام
- [ ] **پسورد → رمز عبور:** در تمام بخش‌ها
- [ ] **فایل‌های ترجمه:** ایجاد فایل‌های زبان فارسی

---

## ⚙️ کارمزد قابل تنظیم

### اولویت: **بالا** - کنترل مدیریتی

#### پنل مدیریت
- [ ] **تنظیم کارمزد:** امکان تغییر سریع نرخ‌های کارمزد
- [ ] **انعطاف‌پذیری:** تغییر از 0.5% تا 1% بر اساس شرایط بازار
- [ ] **نمایش کاربر:** نمایش کارمزد فعلی به کاربران
- [ ] **تاریخچه:** ثبت تغییرات کارمزد

#### API مدیریت
- [ ] **PUT /api/admin/commission:** تغییر نرخ کارمزد
- [ ] **GET /api/admin/commission:** دریافت نرخ‌های فعلی
- [ ] **POST /api/admin/commission/history:** تاریخچه تغییرات

---

## 🚨 مدیریت موجودی ناکافی

### اولویت: **بالا** - تجربه کاربری بهتر

#### پیام‌های خطا
- [ ] **موجودی کم:** "موجودی کیف پول ناکافی است"
- [ ] **مبلغ مورد نیاز:** "نیاز به X تومان بیشتر"
- [ ] **اتصال درگاه:** "برای تکمیل خرید، به درگاه پرداخت متصل شوید"

#### فرآیند پرداخت
- [ ] **محاسبه کسری:** محاسبه مبلغ مورد نیاز
- [ ] **درگاه پرداخت:** اتصال به درگاه برای پرداخت کسری
- [ ] **تکمیل معامله:** تکمیل معامله پس از پرداخت

---

## 🔧 مشکلات فنی موجود

### اولویت: **متوسط** - رفع مشکلات

#### فایل‌های TypeScript
- [ ] **تایید .tsx:** تایید اینکه .tsx قابل قبول است
- [ ] **یکسان‌سازی:** استفاده از TypeScript در تمام فایل‌ها

#### فونت‌ها
- [ ] **یکسان‌سازی:** استفاده از Vazirmatn در تمام فایل‌ها
- [ ] **حذف Tahoma:** از app/layout.tsx

#### متغیرهای محیطی
- [ ] **ایجاد .env.example:** فایل نمونه برای تنظیمات
- [ ] **مستندسازی:** توضیح کامل متغیرها

---

## 📊 اولویت‌بندی اجرا

### فاز 1 (اولویت بالا - هفته 1-2)
1. سیستم احراز هویت پیشرفته (SMS + ایمیل)
2. سیستم اعلان‌های SMS
3. صفحات جداگانه خرید و فروش
4. ورودی‌های انعطاف‌پذیر معاملات
5. کارمزد قابل تنظیم
6. مدیریت موجودی ناکافی

### فاز 2 (اولویت متوسط - هفته 3-4)
1. صفحه اصلی (Landing Page)
2. بهینه‌سازی داشبورد موبایل
3. انتقال بین کاربران
4. تحویل طلای فیزیکی
5. گسترش انواع سکه

### فاز 3 (اولویت پایین - هفته 5-6)
1. بهبود رنگ‌بندی و طراحی
2. بخش پشتیبانی و اطلاعات
3. تغییرات اصطلاحات
4. رفع مشکلات فنی

---

## 🎯 نتیجه نهایی مورد انتظار

پس از تکمیل تمام این ویژگی‌ها، پلتفرم کیمیاگر تبدیل خواهد شد به:

- **پلتفرم کامل و حرفه‌ای** خرید و فروش طلا
- **سیستم احراز هویت امن** با لاگین SMS و ثبت‌نام ایمیل
- **سیستم شفاف** با اعلان‌های SMS برای جلوگیری از دبه
- **رابط کاربری بهینه** برای موبایل و دسکتاپ
- **قابلیت‌های پیشرفته** مانند انتقال بین کاربران و تحویل فیزیکی
- **مدیریت انعطاف‌پذیر** کارمزدها بر اساس شرایط بازار
- **تجربه کاربری برتر** با طراحی زیبا و کاربردی

---

**تاریخ ایجاد:** 22 تیر 1403  
**آخرین به‌روزرسانی:** 30 تیر 1403  
**وضعیت:** چک‌لیست به‌روزرسانی شده، منتظر شروع اجرا  
**نکته مهم:** این فایل فقط چک‌لیست است و هیچ تغییری در کد ایجاد نمی‌کند
