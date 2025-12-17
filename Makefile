.PHONY: dev build start test lint format clean deploy

dev:
	npm run dev

build:
	npm run build

start:
	npm start

test:
	npm run test

test:watch:
	npm run test:watch

lint:
	npm run lint

format:
	npm run format

clean:
	npm run clean

install:
	npm ci

fresh:
	npm run fresh

deploy: build test
	vercel --prod

# Docker
docker-build:
	docker build -t rental-app .

docker-run:
	docker run -p 3000:3000 rental-app

# Supabase
supabase-start:
	npx supabase start

supabase-stop:
	npx supabase stop

supabase-push:
	npx supabase db push