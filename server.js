const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT) || 3001;

// Validation for port
if (port === 3000) {
  console.warn(`⚠️  WARNING: Server is running on port 3000!`);
  console.warn(`⚠️  This might conflict with other applications.`);
  console.warn(`⚠️  Expected port: 3001`);
  console.warn(`⚠️  Check your environment variables in Liara!`);
}

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log(`🚀 Starting server on port ${port} (${process.env.PORT || 'default'})`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 All environment variables:`);
  console.log(`   - PORT: "${process.env.PORT}"`);
  console.log(`   - NODE_ENV: "${process.env.NODE_ENV}"`);
  console.log(`   - HOST: "${process.env.HOST}"`);
  
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`✅ Server ready on http://${hostname}:${port}`);
      console.log(`📊 Process ID: ${process.pid}`);
    });
});
