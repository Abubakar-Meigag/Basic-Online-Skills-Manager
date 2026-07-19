# Contributing

## Branching

- **Never commit directly to `main`.** It's protected.
- Create a branch from `main` for every change:
```bash
  git checkout main
  git pull
  git checkout -b <feature/short-description>
```
- Prefix your branch: `feature/`, `fix/`, `chore/`, or `docs/`.

## Pull requests

Every PR must include:

1. **A clear description** of what changed and why.
2. **How to test it** — list any extra steps the reviewer needs to run
   (e.g. new env vars, database migrations, install commands).
3. **At least one approval** before merging.

Do not merge your own PR.

## After your PR is merged — deploying

Merging to `main` does **not** automatically redeploy. To see your change live:

1. Go to CYF Coolify: https://app.coolify.io/
2. Search for **"Basic Online Skills Manager"**
3. You'll see two services:
   - **Frontend** (client)
   - **Backend** (server)
4. Click **Redeploy** on the service(s) affected by your change.
   - Frontend-only change → redeploy Frontend
   - Backend-only change → redeploy Backend
   - Both → redeploy both

## Commit messages

Keep them clear and descriptive. Suggested format:

```
feat: add course request form
fix: correct CORS origin for production
docs: update client README with test instructions
chore: bump dependencies
```