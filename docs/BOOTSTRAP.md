# BOOTSTRAP — local development setup

Everything learned getting MyChoice Alpha running during Sprint 000. Captures the actual environment, the failures we hit, and the exact commands that worked.

**Local working directory:** `/Users/rocky/Documents/code/MyChoice-alpha001`

## Prerequisites

| Tool | Version used | Notes |
|---|---|---|
| Node | 20 LTS (sandbox ran 22; CI uses 20) | `engines.node >= 20` |
| pnpm | 9.x | Package manager for the workspace |
| Docker | required | Supabase local stack runs in Docker containers |
| Supabase CLI | recent (≥ ~v1.167 for `[db.seed]`) | Local Postgres + Auth + Storage |
| Expo / EAS | SDK 51 | Mobile app (`apps/mobile`) |

## Node setup

Use Node 20 LTS (the repo pins `engines.node >= 20`; `.nvmrc` = 20).

```bash
nvm install 20 && nvm use 20
node -v   # v20.x
```

## pnpm installation

This is the workspace package manager.

```bash
# Preferred
corepack enable && corepack prepare pnpm@9 --activate
pnpm -v
```

**Failure encountered (Sprint 000):** in a restricted sandbox, `corepack enable` failed with `EACCES: permission denied, symlink …/usr/bin/pnpm`. Workaround that worked without a global install:

```bash
npx --yes pnpm@9 <command>   # e.g. npx pnpm@9 install
```

On a normal dev machine, `corepack` (or `npm i -g pnpm`) is fine.

## Install dependencies

```bash
cd /Users/rocky/Documents/code/MyChoice-alpha001
pnpm install
```

**Lockfile note:** the lockfile (`pnpm-lock.yaml`) was generated with pnpm 9 (`pnpm install --lockfile-only`) and validated frozen-consistent. Once committed, switch CI from `--no-frozen-lockfile` back to `--frozen-lockfile`.

## Docker requirements

The Supabase local stack needs Docker running before any `supabase` command:

```bash
docker info    # must succeed (daemon running)
```

No Docker = `supabase start` / `supabase db reset` will fail.

## Supabase installation & local run

```bash
# install CLI (macOS)
brew install supabase/tap/supabase

supabase start          # boots Postgres + Auth + Storage (Docker)
supabase db reset        # applies migrations 0001..0004 then the seed
```

**Failures encountered & fixes (Sprint 000):**

- **Seed not found** — the seed lives at `supabase/seed/seed.sql`, not the default `supabase/seed.sql`. Fix: add to `supabase/config.toml`:
  ```toml
  [db.seed]
  enabled = true
  sql_paths = ["./seed/seed.sql"]
  ```
  (Older CLI fallback: `cp supabase/seed/seed.sql supabase/seed.sql`.)
- **`invalid input syntax for type uuid`** — seed placeholder ids contained non-hex characters (`ag…`, `av…`, `ru…`). Fix: use valid hex UUIDs (`0a…`, `0b…`, `0c…`).
- **Migration `0004` rejected** — `INSERT` had 18 columns but 17 values (missing `tier`). Fix: explicit `null` for `tier` in every row (committed `8616d31`).

## Expo dependency alignment

Do **not** hand-pin React Native ecosystem versions — let Expo resolve them.

```bash
cd apps/mobile
npx expo install --fix     # pins RN-ecosystem deps to the SDK (fixes peer mismatches)
pnpm --filter mobile start # Metro; then i (iOS) / a (Android)
```

**Failure encountered (Sprint 000):** `react-native-screens` resolved to a version requiring RN ≥ 0.82 while the app pins RN 0.74.5 (Expo 51). `expo install --fix` is the remediation. App boot was **not yet verified** in Sprint 000.

## Common failures encountered (quick index)

| Symptom | Cause | Fix |
|---|---|---|
| `EACCES symlink …/usr/bin/pnpm` | corepack can't symlink in sandbox | use `npx pnpm@9` |
| `seed not found` on `db reset` | seed at non-default path | `[db.seed] sql_paths` in config.toml |
| `invalid input syntax for type uuid` | non-hex placeholder UUIDs | valid hex UUIDs |
| `0004` insert error | column/value count mismatch | add `null` for `tier` |
| Expo peer warning / boot issues | hand-pinned RN deps | `npx expo install --fix` |

## Verify the build

```bash
pnpm test          # vitest — 20 tests across engine + parser
pnpm typecheck     # tsc --noEmit (pure packages)
git status         # confirm a clean / expected working tree
```

## Source of truth

GitHub (`realbillcunningham-egogentix/MyChoice-alpha001`) is authoritative. Local working-tree edits are not real until committed and pushed.
