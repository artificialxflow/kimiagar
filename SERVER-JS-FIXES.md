# رفع مشکلات server.js

## 🔍 مشکلات پیدا شده

### 1. **مشکل در Error Handling**
- در catch block، `parsedUrl` ممکن بود undefined باشد
- اگر `req.url` undefined بود، parse خطا می‌داد
- لاگ‌های کافی برای debug کردن 502 وجود نداشت

### 2. **مشکل در Server Error Handling**
- خطاهای server (مثل EADDRINUSE) handle نمی‌شدند
- خطاهای client connection handle نمی‌شدند

### 3. **کمبود Logging**
- برای debug کردن 502، نیاز به لاگ‌های بیشتر بود
- نمی‌توانستیم ببینیم که request‌ها به سرور می‌رسند یا نه

---

## ✅ تغییرات اعمال شده

### 1. **بهبود Error Handling**

```javascript
// قبل:
const parsedUrl = parse(req.url, true);
// اگر req.url undefined بود → crash

// بعد:
if (!req.url) {
  console.error('❌ [Server] Request URL is missing');
  res.statusCode = 400;
  res.end('Bad Request: Missing URL');
  return;
}
parsedUrl = parse(req.url, true);
```

### 2. **اضافه کردن Logging کامل**

```javascript
// Log هر request
console.log(`📥 [Server] ${req.method} ${req.url} - ${user-agent}`);

// Log موفقیت
console.log(`✅ [Server] ${req.method} ${pathname} completed in ${duration}ms`);

// Log خطا با جزئیات کامل
console.error('❌ [Server] ========== Error handling request ==========');
console.error('❌ [Server] Request method:', req.method);
console.error('❌ [Server] Request URL:', req.url);
console.error('❌ [Server] Error type:', err?.constructor?.name);
// ... و بیشتر
```

### 3. **اضافه کردن Server Error Handlers**

```javascript
// Handle server errors (EADDRINUSE, EACCES, etc.)
server.on('error', (err) => {
  console.error('❌ [Server] Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ [Server] Port ${port} is already in use!`);
  }
  process.exit(1);
});

// Handle client connection errors
server.on('clientError', (err, socket) => {
  console.error('❌ [Server] Client error:', err.message);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
```

### 4. **اضافه کردن Timing**

```javascript
const startTime = Date.now();
// ... handle request ...
const duration = Date.now() - startTime;
console.log(`✅ [Server] completed in ${duration}ms`);
```

---

## 🎯 مزایای این تغییرات

### 1. **Debug بهتر**
- حالا می‌توانیم ببینیم که request‌ها به سرور می‌رسند یا نه
- می‌توانیم ببینیم که کدام request باعث 502 می‌شود
- می‌توانیم timing هر request را ببینیم

### 2. **Error Handling بهتر**
- اگر `req.url` undefined باشد، crash نمی‌کند
- اگر port در حال استفاده باشد، پیام واضح می‌دهد
- اگر client error باشد، handle می‌شود

### 3. **لاگ‌های کامل‌تر**
- هر request لاگ می‌شود
- هر خطا با جزئیات کامل لاگ می‌شود
- می‌توانیم ببینیم که مشکل از کجاست

---

## 📋 کار بعدی

### 1. **Deploy کردن تغییرات**

```bash
# در Runflare، تغییرات را deploy کن
```

### 2. **بررسی لاگ‌ها**

بعد از deploy، از پنل Runflare → مشاهده لاگ:

- دنبال `📥 [Server]` بگرد → ببین request‌ها می‌رسند یا نه
- دنبال `❌ [Server]` بگرد → ببین چه خطایی رخ می‌دهد
- دنبال `✅ [Server]` بگرد → ببین request‌ها موفق می‌شوند یا نه

### 3. **تست از مرورگر**

1. به `radizgold.ir` برو
2. اگر هنوز 502 می‌بینی، لاگ‌ها را بررسی کن
3. ببین آیا request به سرور می‌رسد یا نه

---

## 🔍 مثال لاگ‌های جدید

### Request موفق:
```
📥 [Server] GET /api/health - Mozilla/5.0...
✅ [Server] GET /api/health completed in 45ms
```

### Request با خطا:
```
📥 [Server] GET /api/health - Mozilla/5.0...
❌ [Server] ========== Error handling request ==========
❌ [Server] Request method: GET
❌ [Server] Request URL: /api/health
❌ [Server] Error type: Error
❌ [Server] Error message: Connection timeout
❌ [Server] Duration before error: 5000ms
❌ [Server] ===========================================
```

### Server Error:
```
❌ [Server] Server error: Error: listen EADDRINUSE: address already in use :::3001
❌ [Server] Port 3001 is already in use!
```

---

## 💡 نکات مهم

1. **لاگ‌ها را بررسی کن**: بعد از deploy، حتماً لاگ‌ها را بررسی کن
2. **Probe‌ها را چک کن**: مطمئن شو که probe‌ها روی پورت 3001 هستند
3. **Environment Variables**: مطمئن شو که `PORT=3001` و `HOST=0.0.0.0` تنظیم شده‌اند

---

## 🚀 خلاصه

- ✅ Error handling بهتر شد
- ✅ Logging کامل‌تر شد
- ✅ Server error handlers اضافه شد
- ✅ Timing برای هر request اضافه شد

**حالا می‌توانیم دقیقاً ببینیم که مشکل از کجاست!**

