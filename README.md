# Basic Online Skills Manager

A portal for CodeYourFuture to coordinate Basic Online Skills courses between
commercial partners, outreach partners, and CYF staff.

**Live:** https://bosm.trainees.hosting.cyf.academy

## Design & Prototypes

We used Figma to define our user journeys and dashboard designs for all three roles (Commercial Partner, Outreach Partner, and CYF Staff). 

- [View Commercial Partner Figma Prototype](https://www.figma.com/make/du3He66GOp6V2KLF6NAtUQ/Commercial-Partner-User-Journey?t=jp4eBfJFVN9VCzVd-1)
- [View Outreach Partner Figma Prototype](https://www.figma.com/make/sJdd1T9QqUjHXSs4NWwQjS/Outreach-Partner-User-Journey?t=xcCGIw2Y7PiqTumD-1)
- [View CYF Staff Figma Prototype](https://www.figma.com/make/1L5UjJkAyFvi52ZRiHj7qX/CYF-Staff-User-Journey?t=pdmH94EVYDZk5W7N-1)

## Project structure

- [`client/`](./client/README.md) — React + TypeScript + Vite frontend
- [`server/`](./server/README.md) — Node + Express + TypeScript backend
- [Project structure guide](./STRUCTURE.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch, PR, and deployment rules.

## Tech stack

- **Client:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- **Server:** Node, Express, TypeScript, PostgreSQL
- **Testing:** Vitest (both sides), Supertest (server), Testing Library (client)
- **Deployment:** CYF Coolify — Docker-based
