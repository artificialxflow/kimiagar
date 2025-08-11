# Makefile for Kimiagar Project

.PHONY: help build run stop clean dev prod migrate seed

help: ## نمایش راهنما
	@echo "کیمیاگر - دستورات Docker"
	@echo "=========================="
	@echo ""
	@echo "دستورات موجود:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## ساخت image های Docker
	docker-compose build

run: ## اجرای پروژه در حالت production
	docker-compose up -d

stop: ## توقف پروژه
	docker-compose down

clean: ## پاک کردن کامل Docker
	docker-compose down -v --remove-orphans
	docker system prune -f

dev: ## اجرای پروژه در حالت development
	docker-compose -f docker-compose.dev.yml up -d

dev-stop: ## توقف پروژه development
	docker-compose -f docker-compose.dev.yml down

dev-clean: ## پاک کردن development
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans

logs: ## نمایش لاگ‌ها
	docker-compose logs -f app

dev-logs: ## نمایش لاگ‌های development
	docker-compose -f docker-compose.dev.yml logs -f app

migrate: ## اجرای migration های Prisma
	docker-compose exec app npx prisma migrate deploy

dev-migrate: ## اجرای migration های Prisma در development
	docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy

seed: ## اجرای seed دیتابیس
	docker-compose exec app npx prisma db seed

dev-seed: ## اجرای seed دیتابیس در development
	docker-compose -f docker-compose.dev.yml exec app npx prisma db seed

studio: ## باز کردن Prisma Studio
	docker-compose exec app npx prisma studio

dev-studio: ## باز کردن Prisma Studio در development
	docker-compose -f docker-compose.dev.yml exec app npx prisma studio

restart: ## راه‌اندازی مجدد پروژه
	docker-compose restart app

dev-restart: ## راه‌اندازی مجدد پروژه development
	docker-compose -f docker-compose.dev.yml restart app
