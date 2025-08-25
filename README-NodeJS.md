# 🚀 Kimiagar - Node.js Deployment Guide

## 📋 Overview
This guide explains how to deploy Kimiagar as a standalone Node.js application instead of using Next.js built-in server.

## 🏗️ Architecture
- **Next.js 15.4.2** with `output: 'standalone'`
- **Custom Node.js server** (`server.js`)
- **PM2** for process management
- **PostgreSQL** database with Prisma ORM

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Build the Application
```bash
npm run build
```

### 3. Start the Application
```bash
# Using Node.js directly
npm start

# Using PM2
pm2 start ecosystem.config.js
```

## 📊 PM2 Management

### Start with PM2
```bash
pm2 start ecosystem.config.js
```

### PM2 Commands
```bash
# View processes
pm2 list

# View logs
pm2 logs kimiagar

# Restart
pm2 restart kimiagar

# Stop
pm2 stop kimiagar

# Delete
pm2 delete kimiagar
```

### PM2 Dashboard
Access the PM2 dashboard at: `http://localhost:9615`

## 🔧 Environment Variables

### Required Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Optional Variables
```env
EXTERNAL_PRICE_API_URL=https://yazdan-price.liara.run
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
```

### ⚠️ Critical Environment Variables for Liara
```env
# This MUST be set to 3001 to avoid port conflicts
PORT=3001

# This MUST be set to 0.0.0.0 for Liara deployment
HOST=0.0.0.0

# This should be production for deployment
NODE_ENV=production
```

## 📁 File Structure
```
kimiagar/
├── server.js                 # Custom Node.js server
├── ecosystem.config.js       # PM2 configuration
├── .next/standalone/         # Built application
└── prisma/                   # Database schema
```

## 🚀 Deployment Scripts

### Manual Deployment Steps
1. **Build**: `npm run build`
2. **Start**: `npm start` or `pm2 start ecosystem.config.js`
3. **Monitor**: Check logs and health endpoint

## 🔍 Health Check
The application includes a health check endpoint:
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**: `200 OK` if healthy

## 📝 Logs
Logs are stored in the `./logs/` directory:
- `err.log` - Error logs
- `out.log` - Output logs
- `combined.log` - Combined logs

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 1.1. Wrong Port Configuration (Most Common)
**Problem:** Server running on port 3000 instead of 3001

**Symptoms:**
- Server shows "Ready on http://0.0.0.0:3000"
- 502 Bad Gateway errors
- Port conflicts with other applications

**Solution:**
```bash
# In Liara dashboard, set these environment variables:
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# Or in your .env file:
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
```

**Important:** The PORT environment variable MUST be set to 3001 in Liara!

#### 2. Database Connection Issues
```bash
# Test database connection
npx prisma db push

# Check Prisma client
npx prisma generate
```

#### 3. Build Failures
```bash
# Clean build
rm -rf .next
npm run build
```

#### 4. PM2 Issues
```bash
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild and restart
npm run build
pm2 restart kimiagar
```

### Update Dependencies
```bash
# Update packages
npm update

# Rebuild and restart
npm run build
pm2 restart kimiagar
```

## 📊 Performance Monitoring

### PM2 Monitoring
```bash
# View real-time metrics
pm2 monit

# View detailed information
pm2 show kimiagar
```

## 🎯 Production Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **Logging**: Use structured logging for production
3. **Monitoring**: Set up alerts for critical errors
4. **Backup**: Regular database backups
5. **SSL**: Use HTTPS in production
6. **Rate Limiting**: Implement API rate limiting
7. **Security**: Regular security updates

## 📞 Support
For issues and questions:
1. Check the logs in `./logs/` directory
2. Review this documentation
3. Check the main project README
4. Open an issue in the project repository

---

**Happy Deploying! 🚀**
