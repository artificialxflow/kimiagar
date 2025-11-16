const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Force production mode - NO development features
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT) || 3001;

console.log(`🚀 Starting server...`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🔧 Port: ${port}`);
console.log(`🔧 Hostname: ${hostname}`);

// Create Next.js app in PRODUCTION mode only
const app = next({ 
  dev: false, // NEVER true in production
  hostname, 
  port,
  dir: process.cwd(),
  conf: {
    distDir: '.next',
    generateEtags: false,
    poweredByHeader: false,
  }
});

const handle = app.getRequestHandler();

app.prepare().then(async () => {
  console.log('✅ Next.js app prepared successfully in PRODUCTION mode');
  
  // بررسی اتصال به دیتابیس (به صورت non-blocking)
  // Prisma خودش در app/lib/prisma.ts connect می‌کند، پس فقط اطلاعات را نمایش می‌دهیم
  (async () => {
    console.log('🔍 بررسی اتصال به دیتابیس...');
    
    // چک کردن DATABASE_URL
    if (process.env.DATABASE_URL) {
      const dbUrl = process.env.DATABASE_URL;
      // فقط نمایش host و database name (نه password)
      const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (urlMatch) {
        console.log(`🔗 دیتابیس: ${urlMatch[5]}@${urlMatch[3]}:${urlMatch[4]}`);
      } else {
        console.log('🔗 DATABASE_URL تعریف شده است');
      }
    } else {
      console.error('❌ DATABASE_URL تعریف نشده است!');
    }
    
    // Prisma خودش در app/lib/prisma.ts connect می‌کند
    // لاگ‌های اتصال از آنجا نمایش داده می‌شوند
    console.log('💡 Prisma Client به صورت خودکار به دیتابیس متصل می‌شود');
    console.log('💡 برای بررسی دقیق وضعیت از /api/health استفاده کنید');
  })(); // اجرای async بدون await - non-blocking
  
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Health check endpoint - redirect to Next.js API route for detailed checks
      // The /api/health route has full database and migration checks
      if (pathname === '/health') {
        // Let Next.js handle it through /api/health for detailed checks
        const healthUrl = parse('/api/health', true);
        await handle(req, res, healthUrl);
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ [Server] Error handling request:', err);
      console.error('❌ [Server] Request path:', parsedUrl.pathname);
      console.error('❌ [Server] Error message:', err?.message);
      console.error('❌ [Server] Error stack:', err?.stack);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal server error');
      }
    }
  });

  server.listen(port, hostname, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`🔗 Health check: http://${hostname}:${port}/health`);
    console.log(`📊 Process ID: ${process.pid}`);
  });
}).catch((err) => {
  console.error('Failed to prepare Next.js app:', err);
  console.error('Error details:', err.message);
  process.exit(1);
});

// Handle errors gracefully
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('📋 Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received - shutting down gracefully...');
  console.log('📊 Process ID:', process.pid);
  console.log('⏰ Time:', new Date().toISOString());
  // Give time for logs to flush
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received - shutting down gracefully...');
  process.exit(0);
});
