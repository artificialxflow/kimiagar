# Makefile for Kimiagar Project - Node.js Only

.PHONY: help build run stop clean dev prod migrate seed nodejs nodejs-build nodejs-run nodejs-stop nodejs-logs prisma-generate

help: ## نمایش راهنما
	@echo "کیمیاگر - دستورات Node.js"
	@echo "=========================="
	@echo ""
	@echo "دستورات موجود:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Node.js Commands
nodejs: ## ساخت و اجرای پروژه با Node.js
	@echo "🚀 Building and running with Node.js..."
	npm run build
	@echo "✅ Build completed!"
	@echo "🌐 Starting Node.js server on port 3001..."
	npm start

nodejs-build: ## ساخت پروژه برای Node.js
	@echo "📦 Building for Node.js..."
	@echo "🔧 Generating Prisma Client..."
	npx prisma generate
	@echo "📦 Building Next.js..."
	npm run build
	@echo "✅ Build completed!"

nodejs-build-no-prisma: ## ساخت پروژه بدون Prisma generate
	@echo "📦 Building for Node.js..."
	npm run build
	@echo "✅ Build completed!"

nodejs-run: ## اجرای پروژه Node.js
	@echo "🌐 Starting Node.js server on port 3001..."
	npm start

nodejs-pm2: ## اجرای پروژه با PM2
	@echo "📊 Starting with PM2..."
	pm2 start ecosystem.config.js
	@echo "✅ PM2 started!"

nodejs-stop: ## توقف PM2
	@echo "🛑 Stopping PM2..."
	pm2 stop kimiagar
	@echo "✅ PM2 stopped!"

nodejs-restart: ## راه‌اندازی مجدد PM2
	@echo "🔄 Restarting PM2..."
	pm2 restart kimiagar
	@echo "✅ PM2 restarted!"

nodejs-logs: ## نمایش لاگ‌های PM2
	pm2 logs kimiagar

nodejs-monitor: ## نمایش مانیتور PM2
	pm2 monit

# Database Commands
prisma-generate: ## تولید Prisma Client
	npx prisma generate

migrate: ## اجرای migration های Prisma
	npx prisma migrate deploy

seed: ## اجرای seed دیتابیس
	npx prisma db seed

studio: ## باز کردن Prisma Studio
	npx prisma studio

# Utility Commands
clean-all: ## پاک کردن کامل همه چیز
	@echo "🧹 Cleaning everything..."
	rm -rf .next
	rm -rf node_modules
	rm -rf logs
	@echo "✅ Cleanup completed!"
