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

app.prepare().then(() => {
  console.log('✅ Next.js app prepared successfully in PRODUCTION mode');
  
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Health check endpoint
      if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          port: port,
          environment: process.env.NODE_ENV,
          mode: 'production'
        }));
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
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
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
