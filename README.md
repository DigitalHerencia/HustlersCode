# HustlersCode

Production-grade Next.js 14 application for street-business analytics (inventory, customers, transactions, and profitability) with PostgreSQL-backed data workflows.

## Architecture

- **Presentation**: Next.js App Router pages and UI components in `app/` + `components/`.
- **Application layer**: Orchestration logic and helper hooks in `hooks/`.
- **Domain + infrastructure**: Shared business utilities and data adapters in `lib/` and `db/`.
- **Styling/UI system**: Tailwind CSS with shadcn/ui primitives.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- ESLint + Prettier + Husky + lint-staged
- GitHub Actions (CI + deployment)

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL connection string

### Setup

```bash
npm ci
cp .env.example .env.local
```

Configure `.env.local` with required values such as `DATABASE_URL`.

### Commands

```bash
npm run dev           # local server
npm run lint          # eslint checks
npm run lint:fix      # eslint autofix
npm run typecheck     # tsc --noEmit
npm run test          # node test runner
npm run build         # production build
npm run format        # prettier write
npm run format:check  # prettier check
```

## CI / Branch Standards

GitHub Actions workflows:

- `CI`: runs lint, typecheck, tests, and build on pull requests and pushes to `main`.
- `Branch Protection Checks`: enforces PR title format and blocks draft PRs from passing checks.
- `Vercel Deploy`: deploys preview builds for PRs and production builds for `main`.

Recommended branch protection for `main`:

- Require PR before merge
- Require status checks: `Lint, Typecheck, Test, Build` and `PR guardrails`
- Require up-to-date branches before merge

## Deployment

Vercel deployment details and required secrets are documented in [`docs/deployment-vercel.md`](docs/deployment-vercel.md).

## Governance

- Ownership: [`.github/CODEOWNERS`](.github/CODEOWNERS)
- Security reporting: [`SECURITY.md`](SECURITY.md)
- Contributor support: [`SUPPORT.md`](SUPPORT.md)
- License: [`LICENSE`](LICENSE)
