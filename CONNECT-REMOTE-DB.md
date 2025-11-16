# راهنمای اتصال از لوکال به دیتابیس سرور

## 🔍 بررسی وضعیت فعلی

در فایل `.env.local` شما، `DATABASE_URL` به این hostname اشاره می‌کند:
```
dbradizgold-iyc-service:5432
```

این یک **hostname داخلی Kubernetes** است و از خارج (لوکال) قابل دسترسی نیست.

---

## ✅ راه‌حل‌ها

### روش 1: استفاده از Public IP یا Hostname (اگر در دسترس است)

اگر دیتابیس شما یک public IP یا hostname دارد:

1. **در `.env.local`، `DATABASE_URL` را تغییر بده:**

```env
# به جای hostname داخلی، از public IP یا hostname استفاده کن
DATABASE_URL="postgresql://postgres:tgumdr9gHXw4NEY6SnHf@PUBLIC_IP_OR_HOSTNAME:5432/dbradizgvla_db"
```

**مثال:**
```env
DATABASE_URL="postgresql://postgres:tgumdr9gHXw4NEY6SnHf@db.example.com:5432/dbradizgvla_db"
```

2. **مطمئن شو که:**
   - دیتابیس از خارج قابل دسترسی است
   - Firewall پورت 5432 را باز کرده است
   - Security Groups درست تنظیم شده‌اند

---

### روش 2: استفاده از SSH Tunnel (توصیه می‌شود - امن‌تر)

اگر دیتابیس فقط از داخل شبکه قابل دسترسی است، از SSH Tunnel استفاده کن:

#### مرحله 1: ایجاد SSH Tunnel

```bash
# ساخت SSH tunnel
ssh -L 5433:dbradizgold-iyc-service:5432 user@your-server-ip

# یا اگر از Runflare استفاده می‌کنی:
ssh -L 5433:dbradizgold-iyc-service:5432 root@your-runflare-server
```

**توضیح:**
- `5433`: پورت لوکال که tunnel روی آن می‌چرخد
- `dbradizgold-iyc-service:5432`: دیتابیس روی سرور
- `user@your-server-ip`: اطلاعات SSH سرور

#### مرحله 2: تنظیم `.env.local`

```env
# حالا از localhost استفاده می‌کنی که از طریق tunnel به سرور متصل می‌شود
DATABASE_URL="postgresql://postgres:tgumdr9gHXw4NEY6SnHf@localhost:5433/dbradizgvla_db"
```

**نکته:** پورت `5433` را استفاده کردیم (نه 5432) چون tunnel روی این پورت است.

#### مرحله 3: نگه داشتن SSH Tunnel

SSH Tunnel باید همیشه باز بماند. می‌توانی از `screen` یا `tmux` استفاده کنی:

```bash
# با screen
screen -S db-tunnel
ssh -L 5433:dbradizgold-iyc-service:5432 user@your-server-ip
# Ctrl+A سپس D برای detach

# برای reconnect
screen -r db-tunnel
```

---

### روش 3: استفاده از Port Forwarding در Kubernetes (اگر دسترسی داری)

اگر دسترسی به `kubectl` داری:

```bash
# Port forwarding
kubectl port-forward service/dbradizgold-iyc-service 5433:5432 -n radizgold

# سپس در .env.local:
DATABASE_URL="postgresql://postgres:tgumdr9gHXw4NEY6SnHf@localhost:5433/dbradizgvla_db"
```

---

## 🔧 تنظیمات `.env.local` برای اتصال به سرور

بعد از انتخاب یکی از روش‌های بالا، `.env.local` را اینطور تنظیم کن:

```env
# دیتابیس سرور (با یکی از روش‌های بالا)
DATABASE_URL="postgresql://postgres:tgumdr9gHXw4NEY6SnHf@HOST:PORT/dbradizgvla_db"

# Secrets (می‌توانی همان production را استفاده کنی)
JWT_SECRET="kimiagar-jwt-secret-2024-production-key"
JWT_REFRESH_SECRET="kimiagar-refresh-secret-2024-production-key"

# Environment (development برای لوکال)
NODE_ENV="development"

# Port
PORT=3001
HOST="0.0.0.0"

# External API
EXTERNAL_PRICE_API_URL="https://yazdan-price.liara.run"
```

---

## ✅ تست اتصال

بعد از تنظیمات، اتصال را تست کن:

```bash
# تست با Prisma
npx prisma db pull

# یا تست مستقیم با psql
psql "postgresql://postgres:tgumdr9gHXw4NEY6SnHf@HOST:PORT/dbradizgvla_db"

# یا اجرای سرور و چک کردن لاگ‌ها
npm run dev
```

---

## ⚠️ نکات امنیتی

1. **هرگز `.env.local` را commit نکن** (در `.gitignore` است)
2. **از SSH Tunnel استفاده کن** برای اتصال امن‌تر
3. **رمز عبور را محافظت کن** - هرگز در کد یا لاگ‌ها نمایش نده
4. **فقط از IP های مجاز استفاده کن** اگر public access داری

---

## 🚨 مشکلات رایج

### مشکل: "Can't reach database server"

**راه‌حل:**
- مطمئن شو که hostname/IP درست است
- مطمئن شو که پورت درست است
- اگر از SSH Tunnel استفاده می‌کنی، مطمئن شو که tunnel فعال است
- Firewall را چک کن

### مشکل: "Connection timeout"

**راه‌حل:**
- Firewall پورت 5432 را باز کن
- Security Groups را بررسی کن
- از SSH Tunnel استفاده کن

### مشکل: "Authentication failed"

**راه‌حل:**
- Username و Password را دوباره چک کن
- مطمئن شو که user از IP شما دسترسی دارد

---

## 📞 کمک بیشتر

اگر هنوز مشکل داری:
1. لاگ‌های دقیق خطا را بررسی کن
2. مطمئن شو که دیتابیس روی سرور در حال اجرا است
3. Network connectivity را تست کن

