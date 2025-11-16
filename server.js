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
    let parsedUrl = null;
    const startTime = Date.now();
    
    try {
      // Log incoming request for debugging
      console.log(`📥 [Server] ${req.method} ${req.url || '(no url)'} - ${req.headers['user-agent'] || 'unknown'}`);
      
      // Validate req.url before parsing
      if (!req.url) {
        console.error('❌ [Server] Request URL is missing');
        if (!res.headersSent) {
          res.statusCode = 400;
          res.end('Bad Request: Missing URL');
        }
        return;
      }

      parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Health check endpoint - redirect to Next.js API route for detailed checks
      // The /api/health route has full database and migration checks
      if (pathname === '/health') {
        console.log('🔍 [Server] Health check requested, redirecting to /api/health');
        // Let Next.js handle it through /api/health for detailed checks
        const healthUrl = parse('/api/health', true);
        await handle(req, res, healthUrl);
        const duration = Date.now() - startTime;
        console.log(`✅ [Server] Health check completed in ${duration}ms`);
        return;
      }

      // Handle all other requests through Next.js
      await handle(req, res, parsedUrl);
      const duration = Date.now() - startTime;
      console.log(`✅ [Server] ${req.method} ${pathname} completed in ${duration}ms`);
      
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('❌ [Server] ========== Error handling request ==========');
      console.error('❌ [Server] Request method:', req.method);
      console.error('❌ [Server] Request URL:', req.url);
      console.error('❌ [Server] Request path:', parsedUrl?.pathname || 'N/A');
      console.error('❌ [Server] Error type:', err?.constructor?.name || 'Unknown');
      console.error('❌ [Server] Error message:', err?.message || 'No message');
      console.error('❌ [Server] Error code:', err?.code || 'No code');
      console.error('❌ [Server] Error stack:', err?.stack || 'No stack');
      console.error('❌ [Server] Duration before error:', `${duration}ms`);
      console.error('❌ [Server] Headers sent:', res.headersSent);
      console.error('❌ [Server] ===========================================');
      
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Internal server error');
      }
    }
  });

  server.listen(port, hostname, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`🔗 Health check: http://${hostname}:${port}/health`);
    console.log(`📊 Process ID: ${process.pid}`);
    console.log(`⏰ Server started at: ${new Date().toISOString()}`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('❌ [Server] Server error:', err);
    console.error('❌ [Server] Error code:', err.code);
    console.error('❌ [Server] Error message:', err.message);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ [Server] Port ${port} is already in use!`);
      console.error('❌ [Server] Please check if another process is using this port');
    } else if (err.code === 'EACCES') {
      console.error(`❌ [Server] Permission denied to bind to port ${port}`);
      console.error('❌ [Server] Try using a port above 1024 or run with sudo');
    }
    
    process.exit(1);
  });

  // Handle client connection errors
  server.on('clientError', (err, socket) => {
    console.error('❌ [Server] Client error:', err.message);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
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
