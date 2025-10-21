.PHONY: help install lint typecheck test dev build clean prisma-generate prisma-migrate prisma-seed

default: help

help:
	@echo "Available targets:"
	@echo "  make setup          Setup the project"
	@echo "  make install        Install Node.js dependencies"
	@echo "  make lint           Run ESLint"
	@echo "  make typecheck      Run TypeScript compiler"
	@echo "  make check          Run lint, typecheck, and tests"
	@echo "  make test           Run tests"
	@echo "  make dev            Run the development server (port 3000)"
	@echo "  make build          Build application services"
	@echo "  make clean          Remove dependency and build artifacts"
	@echo "  make prisma-generate Generate Prisma client"
	@echo "  make prisma-migrate  Run Prisma migrations"
	@echo "  make prisma-seed     Seed database"

install:
	docker compose run api npm install

lint:
	docker compose run api npm run lint

typecheck:
	docker compose run api npm run typecheck

check: lint typecheck test

test:
	docker compose run api npm run test

dev:
	docker compose up

build:
	docker compose build

clean:
	rm -rf node_modules dist

prisma-generate:
	docker compose run api npx prisma generate

prisma-migrate:
	docker compose run api npx prisma migrate dev

prisma-seed:
	docker compose run api npx prisma db seed

setup: install prisma-generate prisma-migrate prisma-seed
