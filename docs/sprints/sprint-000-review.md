# Sprint 000 Review

**Sprint:** 000 (Foundation) · **Date closed:** 2026-06-08 · **Repo:** realbillcunningham-egogentix/MyChoice-alpha001

## Sprint Goal

Stand up a clean, documented, domain-first foundation for the MyChoice Alpha (8–12 pilot families) on Expo / React Native / TypeScript / Supabase — with the canonical schemas, governance engine, parser foundation, ADR framework, and privacy/safety documentation in place, and design-for (not build) EgoGentix compatibility. No product features.

## Completed Deliverables

- **Repo structure** — pnpm-workspace monorepo: `apps/mobile` (Expo shell), `packages/domain` (source of truth), `packages/governance-engine`, `packages/parser`, `supabase/`, `docs/`.
- **ADR framework** — six ADRs merged: 0001 stack, 0002 privacy boundary, 0003 governance-as-domain, 0004 EgoGentix seam, 0005 deletion lifecycle + `pilot_operator` narrowing, 0006 alpha pilot ops & consent.
- **SignalDefinition registry** — 13 live signal definitions transcribed verbatim from Signal Catalog v0.3 (TS `packages/domain/src/signal/catalog.ts` + DB `0004_signal_definitions.sql`), with units, `inverted` flags, and green/yellow status bands.
- **Agreement model** — Family Agreement Objects as agreement → version → typed `AgreementRule` → participants/consent; machine-evaluatable, versioned, human-in-the-loop.
- **Governance engine** — pure functions: `evaluateAgreement`, `canView` (RLS mirror), `compileContext` (EgoGentix seam stub), `computeSignalStatus` / `resolveSignalStatus` (normal + inverted bands; AgreementRule override).
- **Parser foundation** — deterministic Instagram-export → `Signal[]` for `late-night-activity` + `content-volume`, with a raw-exclusion manifest and a parse-and-destroy contract (no raw content in output).
- **Tests** — 20/20 passing across engine + parser (evaluate logic, visibility incl. `pilot_operator` and raw-content processing-window, normal & inverted status thresholds with boundary cases, parser raw-exclusion).
- **Typecheck** — `tsc --noEmit` clean for the pure packages (domain/engine/parser); `@types/node` added to the parser to resolve `node:crypto`.
- **Lockfile** — `pnpm-lock.yaml` generated (pnpm 9, 1,153 deps) and validated frozen-consistent (`pnpm install --lockfile-only --frozen-lockfile` → exit 0). **Not yet committed** (see Defects / open items).
- **Docker validation** — confirmed as an environment requirement: the Supabase local stack (`supabase start` / `db reset`) requires Docker; available on the local machine (Rocky).
- **Supabase validation** — migrations `0001–0004` + seed exercised via `supabase db reset`. Surfaced three defects (seed path, invalid UUIDs, `0004` column/value mismatch), all fixed. A final clean reset is pending re-run after the local seed/config fixes are committed.
- **Expo validation** — dependency resolution surfaced a `react-native-screens` ↔ RN 0.74 peer mismatch; remediation (`npx expo install --fix`) identified. App boot **not yet verified**.

## Commits (key)

| SHA | Purpose |
|---|---|
| `a44e3d0` | Engineering charter (7-part design doc) |
| `fa9ccb0` / `5161de7` / `6c4e3e5` / `757440e` | ADRs 0001–0004 |
| `cd98b09` | Workspace scaffold: domain / governance-engine / parser + tests |
| `1b3e3df` | Supabase schema + deny-by-default RLS + seed + Edge Function stubs + Expo shell + privacy/runbook docs + CI |
| `0cf933d` | Amendment: `pilot_operator` narrowing, deletion lifecycle (ADR-0005), child raw-content tightening |
| `99d3218` | ADR-0006 (majority=18, two MFA operator accounts, export formats, in-app re-consent) |
| `5779a70` | Signal Catalog v0.3 captured + alignment analysis |
| `0228495` | SignalDefinition registry + computed status + slug reconciliation |
| `8616d31` | Fix: migration `0004` insert column/value mismatch |

## Defects Found

1. **Missing pnpm** — the sandbox could not enable corepack (`EACCES` on the `/usr/bin/pnpm` symlink).
2. **Expo dependency mismatch** — `react-native-screens` resolved to a version requiring React Native ≥ 0.82, while the app pins RN 0.74.5 (Expo SDK 51).
3. **Invalid UUIDs in seed data** — placeholder ids `ag000000…`, `av000000…`, `ru000000…` contained non-hex characters (`g`, `v`, `r`, `u`); Postgres rejected them (`invalid input syntax for type uuid`).
4. **Missing seed path configuration** — `supabase db reset` could not locate the seed because it lives at `supabase/seed/seed.sql`, not the default `supabase/seed.sql`.
5. **Signal catalog / schema alignment gaps** — the schema had a `Signal` *instance* type but no *definition* layer; the catalog's status bands, `inverted` flag, supported-platforms, and two catalog categories ("Feed & Algorithm", "Discovery & Interests") had no schema home. Slug drift also existed (`late_night_usage` vs catalog `late-night-activity`).
6. **Migration insert mismatch** — `0004_signal_definitions.sql` listed 18 columns but supplied 17 values per row (missing `tier`).

## Defects Resolved

1. **Missing pnpm** — used `npx pnpm@9` for lockfile generation/validation; CI uses `pnpm/action-setup`. No global install required.
2. **Expo dependency mismatch** — remediation prescribed: run `npx expo install --fix` in `apps/mobile` to pin RN-ecosystem deps to Expo-51-compatible versions before boot. (Applied: pending on local machine.)
3. **Invalid UUIDs** — replaced with valid deterministic hex UUIDs (`0a000000…` agreement, `0b000000…` version, `0c000000…` rule). Verified no non-hex UUID literals remain. (Local working-tree edit; pending commit by Rocky.)
4. **Missing seed path** — added `[db.seed]` with `sql_paths = ["./seed/seed.sql"]` to `supabase/config.toml`. (Local working-tree edit; pending commit by Rocky.)
5. **Catalog / schema gaps** — added a `SignalDefinition` registry (catalog-verbatim), optional computed `status` on `Signal`, first-class `inverted` support, and reconciled slugs to catalog ids across parser, seed, and the seeded `AgreementRule` (`0228495`). Remaining mapping nuances captured in `docs/SIGNAL_CATALOG_ALIGNMENT.md`.
6. **Migration insert mismatch** — added explicit `null` for `tier` in all 13 rows (`8616d31`); confirmed 18 columns = 18 values.

## Acceptance Criteria Status

| # | Criterion (from charter §7) | Status |
|---|---|---|
| 1 | pnpm workspace bootstrapped | PASS |
| 2 | Expo app boots on iOS + Android | FAIL (not booted; dep mismatch fix pending) |
| 3 | CI configured (typecheck/lint/test) | PARTIAL (workflow present; lint not wired; lockfile not committed; Actions run unobserved) |
| 4 | CONTRIBUTING / Definition of Done | PASS |
| 5 | `packages/domain` Zod schemas (incl. SignalDefinition, Consent, Flag, FamilyStatus, DeletionReceipt) | PASS |
| 6 | Migrations create tables/enums consistent with domain | PASS (authored + `0004` fixed; clean `db reset` pending re-run) |
| 7 | Deny-by-default RLS baseline + first policies | PARTIAL (authored; not yet runtime-verified against live DB) |
| 8 | governance-engine: evaluate / canView / compileContext / status | PASS (20/20 tests) |
| 9 | Edge Function stubs (ingest / ai / compile) | PASS (typed stubs) |
| 10 | Parser fixture → Signal[] + raw-exclusion + parse-and-destroy | PASS |
| 11 | Privacy + threat-model + crisis + deletion docs | PASS |
| 12 | ADRs merged | PASS (0001–0006) |
| 13 | Auth skeleton + role-aware routing | PARTIAL (shell + session stub authored; not run) |
| 14 | Visibility test harness (guardian cannot read raw) | PARTIAL (pure-function `canView` test exists; live-RLS test pending) |
| 15 | Deletion lifecycle implemented + tested | FAIL (documented in ADR-0005 + runbook; code not built — intentionally deferred) |
| 16 | Seed synthetic family | PASS (after UUID fix) |

## Sprint Outcome

Sprint 000 achieved its core intent: a clean, domain-first foundation now exists and is internally consistent. The canonical schemas, the SignalDefinition registry (catalog-accurate), the pure governance engine (with verified normal/inverted status logic), the parser foundation (with an enforced raw-exclusion boundary), and a full ADR + privacy/safety documentation set are all in place. Twenty unit tests pass and the pure packages typecheck cleanly.

The foundation also proved itself by surfacing six real defects — a missing-tier migration bug, invalid seed UUIDs, a seed-path gap, an Expo peer mismatch, the catalog/schema definition gap, and the pnpm tooling friction — five of which are resolved and two (seed + config fixes) are staged in the working tree pending commit. Three items remain explicitly incomplete and are honest carry-overs rather than claimed wins: a verified Expo boot, a clean end-to-end `supabase db reset`, and the deletion-lifecycle implementation (documented, not built). These, plus the known parser unit mismatch (late-night value still a placeholder; tracked in issue #1), define the starting line for Sprint 001.
