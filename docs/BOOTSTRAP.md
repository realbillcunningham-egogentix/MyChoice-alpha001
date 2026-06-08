# BOOTSTRAP — local development setup

Everything learned getting MyChoice Alpha running during Sprint 000. Captures the actual environment, the failures we hit, and the exact commands that worked. **All steps below are verified on Rocky.**

**Local working directory:** `/Users/rocky/Documents/code/MyChoice-alpha001`

## Prerequisites

| Tool | Version used | Notes |
|---|---|---|
| Node | 20 LTS | `engines.node >= 20` |
| pnpm | 9.x | Package manager for the workspace |
| Docker | required | Supabase local stack runs in Docker containers |
| Supabase CLI | ≥ ~v1.167 (for `[db.seed]`) | Local Postgres + Auth + Storage |
| Expo / EAS | SDK 51 | Mobile app (`apps/mobile`) |

## Node setup

```bash
nvm install 20 && nvm use 20
node -v   # v20.x
```

## pnpm installation

```bash
corepack enable && corepack prepare pnpm@9 --activate
pnpm -v
```

**Failure encountered (Sprint 000):** in a restricted sandbox, `corepack enable` failed with `EACCES: permission denied, symlink …/usr/bin/pnpm`. Workaround without a global install: `npx --yes pnpm@9 <command>`. On Rocky (a normal dev machine) `corepack` works and `pnpm install` runs cleanly. **Verified.**

## Install dependencies

```bash
cd /Users/rocky/Documents/code/MyChoice-alpha001
pnpm install   # PASS on Rocky
```

**Lockfile:** `pnpm-lock.yaml` is **committed** (`e42b325`) and frozen-consistent. CI should use `--frozen-lockfile` (flip pending).

## Docker requirements

```bash
docker info    # must succeed (daemon running) — PASS on Rocky
```

## Supabase installation & local run

```bash
brew install supabase/tap/supabase     # macOS
supabase start                          # boots Postgres + Auth + Storage (Docker) — PASS
supabase db reset                       # applies migrations 0001..0004 then the seed — PASS
```

**Failures encountered & fixes (Sprint 000, all resolved):**

- **Seed not found** — the seed lives at `supabase/seed/seed.sql`, not the default `supabase/seed.sql`. Fix (committed `e869c93`) in `supabase/config.toml`:
  ```toml
  [db.seed]
  enabled = true
  sql_paths = ["./seed/seed.sql"]
  ```
  (Older CLI fallback: `cp supabase/seed/seed.sql supabase/seed.sql`.)
- **`invalid input syntax for type uuid`** — seed placeholder ids had non-hex characters (`ag…`, `av…`, `ru…`). Fix (committed `e869c93`): valid hex UUIDs (`0a…`, `0b…`, `0c…`).
- **Migration `0004` rejected** — `INSERT` had 18 columns but 17 values (missing `tier`). Fix (committed `8616d31`): explicit `null` for `tier` in every row.

`supabase db reset` now completes cleanly on Rocky.

## Expo dependency alignment

Do **not** hand-pin React Native ecosystem versions — let Expo resolve them.

```bash
cd apps/mobile
npx expo install --fix     # pins RN-ecosystem deps to the SDK
pnpm --filter mobile start # Metro — PASS on Rocky; then i (iOS) / a (Android)
```

**Failure encountered (Sprint 000, resolved):** `react-native-screens` resolved to a version requiring RN ≥ 0.82 while the app pins RN 0.74.5 (Expo 51). Fixed by pinning an Expo-51-compatible `react-native-screens` (committed `48c0860`) and aligning Expo deps (`e42b325`). **Expo Metro boot verified on Rocky.**

## Common failures encountered (quick index)

| Symptom | Cause | Fix | Status |
|---|---|---|---|
| `EACCES symlink …/usr/bin/pnpm` | corepack can't symlink in sandbox | use `npx pnpm@9` (sandbox); corepack on real machine | resolved |
| `seed not found` on `db reset` | seed at non-default path | `[db.seed] sql_paths` in config.toml (`e869c93`) | resolved |
| `invalid input syntax for type uuid` | non-hex placeholder UUIDs | valid hex UUIDs (`e869c93`) | resolved |
| `0004` insert error | column/value count mismatch | add `null` for `tier` (`8616d31`) | resolved |
| Expo peer warning / boot issues | hand-pinned RN deps | `expo install --fix`; pin `react-native-screens` (`48c0860`/`e42b325`) | resolved |

## Verify the build

```bash
pnpm test          # vitest — 20/20 (PASS on Rocky)
pnpm typecheck     # tsc --noEmit (PASS on Rocky)
git status         # confirm a clean / expected working tree
```

## Source of truth

GitHub (`realbillcunningham-egogentix/MyChoice-alpha001`) is authoritative. Local working-tree edits are not real until committed and pushed.
