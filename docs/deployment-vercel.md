# Vercel Deployment Runbook

This repository deploys through GitHub Actions using `vercel-deploy.yml`.

## Deployment Modes

- **Preview**: Runs for every pull request and posts a preview URL as a PR comment.
- **Production**: Runs automatically on pushes to `main`.

## Required Repository Secrets

Set the following GitHub repository secrets:

- `VERCEL_TOKEN`: Vercel access token with deploy permission.
- `VERCEL_ORG_ID`: Vercel organization/team identifier.
- `VERCEL_PROJECT_ID`: Vercel project identifier.

## Required Vercel Project Environment Variables

Define runtime values in Vercel (not GitHub) for each environment:

- `DATABASE_URL`
- `NEXT_PUBLIC_*` values used by the application
- Any API credentials required by server actions

## Validation Checklist

1. Open a pull request and verify `Vercel Preview` passes.
2. Confirm preview URL comment appears on the PR.
3. Merge to `main` and verify `Vercel Production` job succeeds.
4. Validate health checks on production endpoint.

## Rollback

- Redeploy a previously known-good commit from Vercel dashboard, or
- Revert the problematic merge commit and push to `main`.
