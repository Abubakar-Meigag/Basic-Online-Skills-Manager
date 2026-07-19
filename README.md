# Basic Online Skills Manager

A portal for CodeYourFuture to coordinate Basic Online Skills courses between
commercial partners, outreach partners, and CYF staff.

**Live:** https://bosm.trainees.hosting.cyf.academy

## Project structure

- [`client/`](./client/README.md) — React + TypeScript + Vite frontend
- [`server/`](./server/README.md) — Node + Express + TypeScript backend

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch, PR, and deployment rules.

## Tech stack

- **Client:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- **Server:** Node, Express, TypeScript, PostgreSQL
- **Testing:** Vitest (both sides), Supertest (server), Testing Library (client)
- **Deployment:** CYF Coolify — Docker-based

# Client

React + TypeScript + Vite frontend for the Basic Online Skills Manager.

## What's inside

- **React** — UI framework
- **TypeScript** — type-safe JavaScript
- **Vite** — build tool + dev server
- **Tailwind CSS** — styling
- **React Router** — client-side routing
- **Axios** — HTTP client
- **Vitest** — testing
- **ESLint + Prettier** — linting and formatting

## Prerequisites

- Node.js 20+
- npm

## Getting started

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

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

Output goes to `dist/`.
