# Docker Guide for Kimiagar Project

این راهنما نحوه استفاده از Docker برای پروژه کیمی‌آگار را توضیح می‌دهد.

## پیش‌نیازها

- Docker Desktop (Windows/Mac) یا Docker Engine (Linux)
- Docker Compose
- حداقل 4GB RAM
- حداقل 10GB فضای آزاد

## ساختار فایل‌های Docker

```
kimiagar/
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── docker-compose.override.yml # Local overrides
├── .dockerignore           # Files to exclude from build
└── Makefile                # Common Docker commands
```

## شروع سریع

### 1. محیط توسعه

```bash
# شروع محیط توسعه
make dev

# یا به صورت دستی
docker-compose -f docker-compose.dev.yml up -d
```

### 2. محیط تولید

```bash
# ساخت و شروع محیط تولید
make build
make prod

# یا به صورت دستی
docker-compose build
docker-compose up -d
```

## دستورات مفید

### مدیریت سرویس‌ها

```bash
# نمایش وضعیت سرویس‌ها
make status

# نمایش لاگ‌ها
make logs

# توقف سرویس‌ها
make down

# راه‌اندازی مجدد
make restart
```

### مدیریت دیتابیس

```bash
# اجرای migration ها
make db-migrate

# بازنشانی دیتابیس (احتیاط!)
make db-reset

# دسترسی به shell دیتابیس
make db-shell

# پشتیبان‌گیری
make db-backup
```

### پاک‌سازی

```bash
# پاک‌سازی کامل
make clean
```

## سرویس‌ها

### 1. اپلیکیشن اصلی (app)
- **Port**: 3000
- **Environment**: production/development
- **Features**: Next.js app with hot reload (dev)

### 2. دیتابیس PostgreSQL (postgres)
- **Port**: 5432
- **Database**: kimiagar / kimiagar_dev
- **User**: kimiagar_user
- **Password**: kimiagar_password

### 3. Redis (redis)
- **Port**: 6379
- **Purpose**: Caching, sessions, queues

## متغیرهای محیطی

### Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://kimiagar_user:kimiagar_password@postgres:5432/kimiagar
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### Development
```bash
NODE_ENV=development
DATABASE_URL=postgresql://kimiagar_user:kimiagar_password@postgres:5432/kimiagar_dev
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key
```

## عیب‌یابی

### مشکلات رایج

#### 1. پورت در حال استفاده
```bash
# بررسی پورت‌های استفاده شده
netstat -tulpn | grep :3000

# توقف سرویس‌ها
make down
```

#### 2. مشکل دیتابیس
```bash
# بررسی وضعیت PostgreSQL
docker-compose exec postgres pg_isready -U kimiagar_user

# اجرای migration ها
make db-migrate
```

#### 3. مشکل Redis
```bash
# بررسی وضعیت Redis
docker-compose exec redis redis-cli ping

# پاک‌سازی Redis
docker-compose exec redis redis-cli flushall
```

### لاگ‌ها

```bash
# لاگ اپلیکیشن
docker-compose logs -f app

# لاگ دیتابیس
docker-compose logs -f postgres

# لاگ Redis
docker-compose logs -f redis
```

## بهینه‌سازی

### 1. کاهش حجم Image
- استفاده از multi-stage builds
- حذف فایل‌های غیرضروری
- استفاده از `.dockerignore`

### 2. بهبود Performance
- استفاده از volume mounts برای node_modules
- تنظیم WATCHPACK_POLLING برای hot reload
- استفاده از health checks

### 3. امنیت
- استفاده از non-root user
- محدود کردن دسترسی‌ها
- به‌روزرسانی منظم base images

## Deployment

### 1. Production
```bash
# ساخت image
docker-compose build

# شروع سرویس‌ها
docker-compose up -d

# بررسی وضعیت
docker-compose ps
```

### 2. Staging
```bash
# کپی فایل‌ها
cp docker-compose.yml docker-compose.staging.yml

# تنظیم متغیرهای محیطی
export NODE_ENV=staging

# شروع
docker-compose -f docker-compose.staging.yml up -d
```

## Monitoring

### 1. Resource Usage
```bash
# نمایش آمار منابع
make stats

# نمایش وضعیت سرویس‌ها
make status
```

### 2. Health Checks
- اپلیکیشن: `/api/health`
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`

## نکات مهم

1. **Backup**: همیشه از دیتابیس پشتیبان‌گیری کنید
2. **Updates**: به‌روزرسانی منظم Docker images
3. **Security**: تغییر رمزهای پیش‌فرض در production
4. **Logs**: نگهداری و بررسی منظم لاگ‌ها
5. **Resources**: تنظیم محدودیت منابع برای production

## پشتیبانی

در صورت بروز مشکل:
1. بررسی لاگ‌ها: `make logs`
2. بررسی وضعیت: `make status`
3. پاک‌سازی و راه‌اندازی مجدد: `make clean && make up`
4. بررسی مستندات Docker و Next.js
