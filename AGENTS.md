# Repository Agent Guide

## Purpose

HustlersCode is a production-oriented Next.js platform for business operations analytics. Changes must prioritize security, correctness, and low operational risk.

## Architecture Boundaries

- `app/`: route handlers and presentation composition.
- `components/`: reusable UI building blocks.
- `hooks/`: client-side orchestration helpers.
- `lib/`: shared domain utilities and infrastructure adapters.
- `db/`: persistence-specific logic and database support.

Favor small, composable updates and avoid cross-layer coupling.

## Engineering Standards

- Keep secrets out of source control.
- Validate all external inputs server-side.
- Avoid logging tokens or sensitive personal data.
- Do not refactor unrelated code in task-focused changes.

## Developer Commands

```bash
npm run dev
npm run lint
npm run lint:fix
npm run typecheck
npm run test
npm run build
npm run format
npm run format:check
```

## CI/CD Expectations

- CI workflow must stay green: lint, typecheck, test, build.
- Protected branch checks enforce PR title and non-draft status.
- Vercel preview deployments run on pull requests.
- Production deploys run on push to `main`.

## Pull Request Standards

- Use conventional-commit style PR titles:
  - `feat: ...`, `fix: ...`, `docs: ...`, `ci: ...`, etc.
- Include risk notes and rollout/rollback details for operational changes.
