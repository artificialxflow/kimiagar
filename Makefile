# Makefile for Kimiagar Project

.PHONY: help build up down restart logs clean dev prod test db-migrate db-reset

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build Docker images"
	@echo "  up        - Start production services"
	@echo "  down      - Stop all services"
	@echo "  restart   - Restart all services"
	@echo "  logs      - Show logs for all services"
	@echo "  clean     - Remove all containers and volumes"
	@echo "  dev       - Start development environment"
	@echo "  dev-down  - Stop development environment"
	@echo "  prod      - Start production environment"
	@echo "  test      - Run tests"
	@echo "  db-migrate- Run database migrations"
	@echo "  db-reset  - Reset database (WARNING: destroys all data)"

# Build Docker images
build:
	docker-compose build

# Start production services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# Show logs for all services
logs:
	docker-compose logs -f

# Remove all containers and volumes
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Start development environment
dev:
	docker-compose -f docker-compose.dev.yml up -d

# Stop development environment
dev-down:
	docker-compose -f docker-compose.dev.yml down

# Start production environment
prod:
	docker-compose -f docker-compose.yml up -d

# Run tests
test:
	docker-compose exec app npm test

# Run database migrations
db-migrate:
	docker-compose exec app npx prisma migrate deploy

# Reset database (WARNING: destroys all data)
db-reset:
	docker-compose exec app npx prisma migrate reset --force

# Generate Prisma client
prisma-generate:
	docker-compose exec app npx prisma generate

# Open database shell
db-shell:
	docker-compose exec postgres psql -U kimiagar_user -d kimiagar

# Backup database
db-backup:
	docker-compose exec postgres pg_dump -U kimiagar_user kimiagar > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Show service status
status:
	docker-compose ps

# Show resource usage
stats:
	docker stats
