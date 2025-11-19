# TinyLink
TinyLink — simple URL shortener built with Next.js + Postgres.

## Run locally

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `NEXT_PUBLIC_BASE_URL`.
2. Create DB and run migrations.sql to create table `links`.
3. npm install
4. npm run dev
5. Open http://localhost:3000

## Endpoints (required by autograder)
- GET / -> Dashboard
- GET /code/:code -> Stats page
- GET /:code -> Redirect (HTTP 302) (or 404 if not found)
- GET /healthz -> returns 200 JSON { ok: true, version: "1.0" }
- POST /api/links -> create link (409 if exists)
- GET /api/links -> list links
- GET /api/links/:code -> get single link
- DELETE /api/links/:code -> delete link
