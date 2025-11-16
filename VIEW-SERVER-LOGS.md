# راهنمای مشاهده لاگ‌های سرور

## 🔍 مشکل اصلی

از لاگ‌های Kubernetes مشخص است که:
```
Startup probe failed: dial tcp 10.244.122.36:3000: connect: connection refused
```

**مشکل:** Startup probe روی پورت **3000** چک می‌کند اما سرور روی پورت **3001** اجرا می‌شود.

---

## ✅ راه‌حل فوری

### 1. تنظیم PORT در Environment Variables

در پنل Runflare، Environment Variables را تنظیم کن:

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
```

**مهم:** حتماً `PORT=3001` را تنظیم کن!

### 2. تغییر Startup Probe (اگر دسترسی داری)

اگر دسترسی به تنظیمات Kubernetes داری، startup probe را تغییر بده:

```yaml
startupProbe:
  httpGet:
    path: /health
    port: 3001  # تغییر از 3000 به 3001
  initialDelaySeconds: 30  # افزایش delay برای startup
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 5  # افزایش تعداد تلاش‌ها
```

---

## 📋 نحوه مشاهده لاگ‌های واقعی سرور

### روش 1: از پنل Runflare

1. به پنل Runflare برو
2. به بخش **Logs** یا **Console** برو
3. لاگ‌های container را ببین

### روش 2: از kubectl (اگر دسترسی داری)

```bash
# دیدن لاگ‌های pod فعلی
kubectl logs -f radizgold-nfh-deploy-6cd68c687c-jf5kt -n radizgold

# یا دیدن لاگ‌های آخرین pod
kubectl logs -f deployment/radizgold-nfh-deploy -n radizgold

# دیدن لاگ‌های pod قبلی (اگر restart شده)
kubectl logs radizgold-nfh-deploy-6cd68c687c-jf5kt -n radizgold --previous
```

### روش 3: از Dashboard Kubernetes

اگر Kubernetes Dashboard داری:
1. به Dashboard برو
2. Namespace `radizgold` را انتخاب کن
3. Pod `radizgold-nfh-deploy-*` را پیدا کن
4. روی **Logs** کلیک کن

---

## 🔍 چک کردن لاگ‌های Startup

بعد از تنظیم `PORT=3001` و restart، باید این لاگ‌ها را ببینی:

```
🚀 Starting server...
🌐 Environment: production
🔧 Port: 3001
🔧 Hostname: 0.0.0.0
✅ Next.js app prepared successfully in PRODUCTION mode
🔍 بررسی اتصال به دیتابیس...
✅ اتصال به دیتابیس موفق بود
✅ Server ready on http://0.0.0.0:3001
🔗 Health check: http://0.0.0.0:3001/health
📊 Process ID: 12345
```

---

## 🚨 مشکلات دیگر در لاگ‌ها

### 1. Certificate Expired

```
x509: certificate has expired or is not yet valid
```

این مشکل از سمت زیرساخت Kubernetes است. باید با پشتیبانی Runflare تماس بگیری.

### 2. Back-off Restarting

این به خاطر startup probe failure است. بعد از تنظیم `PORT=3001` باید حل شود.

---

## 📝 چک‌لیست عیب‌یابی

- [ ] `PORT=3001` در Environment Variables تنظیم شده
- [ ] `HOST=0.0.0.0` تنظیم شده
- [ ] `NODE_ENV=production` تنظیم شده
- [ ] لاگ‌های startup را بررسی کردی
- [ ] Health check endpoint کار می‌کند (`/health`)

---

## 🔧 دستورات مفید برای Debug

```bash
# دیدن وضعیت pod
kubectl describe pod radizgold-nfh-deploy-6cd68c687c-jf5kt -n radizgold

# دیدن events
kubectl get events -n radizgold --sort-by='.lastTimestamp'

# دیدن environment variables pod
kubectl exec radizgold-nfh-deploy-6cd68c687c-jf5kt -n radizgold -- env | grep PORT

# تست health check از داخل pod
kubectl exec radizgold-nfh-deploy-6cd68c687c-jf5kt -n radizgold -- curl http://localhost:3001/health
```

---

## 📞 اگر مشکل ادامه داشت

1. لاگ‌های کامل startup را از پنل Runflare بگیر
2. خروجی `kubectl describe pod` را ببین
3. مطمئن شو که `PORT=3001` درست تنظیم شده
4. با پشتیبانی Runflare تماس بگیر

