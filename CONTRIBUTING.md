# Contributing

## Workflow
- Branch off `main`; open a PR. CI (typecheck + lint + test) must be green.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`...).
- Any change under `supabase/migrations/**` (especially RLS) requires a second reviewer — see ADR-0002.
- A PR is done only when it meets the [Definition of Done](docs/DEFINITION_OF_DONE.md).

## Local setup
```bash
pnpm install
pnpm test            # runs vitest across packages
pnpm typecheck
supabase start       # local Postgres + Auth + Storage
supabase db reset    # applies migrations + seed
pnpm --filter mobile start
```

## Golden rules
1. Raw content never enters a durable table or any parent-visible path (ADR-0002).
2. Governance rules are structured objects, never free text (ADR-0003).
3. Cross-boundary disclosure goes through `compileContext` only (ADR-0004).
