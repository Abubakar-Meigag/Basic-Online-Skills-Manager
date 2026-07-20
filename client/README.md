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
- nvm

## Getting started

```bash
cd client
nvm use
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
