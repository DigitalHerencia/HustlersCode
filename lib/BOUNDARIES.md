# Server Data Access Boundaries

## Directional dependency rules

- UI layer (`app/*`, `components/*`) may import server-side data APIs only from `@/lib/facade/server`.
- Query-only operations live in `lib/read/*`.
- Mutation operations live in `lib/actions/*` and must validate auth + tenant + RBAC context.
- Server-only modules must include `import "server-only"` at the top of the file.

## Conventions

- `lib/read/*` is reserved for `SELECT`-style reads and must not include state mutation SQL.
- `lib/actions/*` is reserved for data mutations and must call `assertMutationContext` before executing any mutation.
