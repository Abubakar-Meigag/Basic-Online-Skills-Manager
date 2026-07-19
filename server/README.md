# Server

Node + Express + TypeScript backend for the Basic Online Skills Manager.

## What's inside

- **Express** — web framework
- **TypeScript** — type-safe JavaScript
- **PostgreSQL** (via `pg`) — database
- **Zod** — request validation
- **bcrypt + jsonwebtoken** — auth
- **Vitest + Supertest** — testing
- **ESLint + Prettier** — linting and formatting

## Prerequisites

- Node.js 20+
- npm
<!-- - PostgreSQL not yet implemented --> 

## Getting started

```bash
cd server
npm install
npm run dev
```

Server runs on http://localhost:3000

Check it's alive: http://localhost:3000/health

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `PORT` — port to run on (default 3000)
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — secret for signing tokens

## Running tests

Watch mode (while coding):
```bash
npm run test
```

Single run (CI-style):
```bash
npm run test:run
```

## Building for production

```bash
npm run build
```

Output compiled JavaScript goes to `dist/`.

## Available endpoints (so far)

- `GET /` — welcome message
- `GET /health` — health check
- `GET /test` — sample endpoint returning test data