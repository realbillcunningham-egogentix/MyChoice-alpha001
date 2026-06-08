# Sprint 000 Review

**Sprint:** 000 (Foundation) · **Date closed:** 2026-06-08 · **Status:** VALIDATED · **Repo:** realbillcunningham-egogentix/MyChoice-alpha001

> **Update (post-validation):** Sprint 000 has been fully validated locally on Rocky. Items previously recorded conservatively (lockfile, Supabase reset, Expo boot, seed fixes) are now confirmed PASS. See **Local Validation (Rocky)** below.

## Sprint Goal

Stand up a clean, documented, domain-first foundation for the MyChoice Alpha (8–12 pilot families) on Expo / React Native / TypeScript / Supabase — with the canonical schemas, governance engine, parser foundation, ADR framework, and privacy/safety documentation in place, and design-for (not build) EgoGentix compatibility. No product features.

## Local Validation (Rocky) — all PASS

| Check | Result |
|---|---|
| `pnpm install` | PASS |
| `pnpm test` | PASS (20/20) |
| `pnpm typecheck` | PASS |
| Docker | PASS (daemon running) |
| Supabase CLI | PASS |
| `supabase start` | PASS |
| `supabase db reset` (migrations 0001–0004 + seed) | PASS |
| Expo Metro boot | PASS |

## Completed Deliverables

- **Repo structure** — pnpm-workspace monorepo: `apps/mobile` (Expo shell), `packages/domain` (source of truth), `packages/governance-engine`, `packages/parser`, `supabase/`, `docs/`.
- **ADR framework** — six ADRs merged: 0001 stack, 0002 privacy boundary, 0003 governance-as-domain, 0004 EgoGentix seam, 0005 deletion lifecycle + `pilot_operator` narrowing, 0006 alpha pilot ops & consent.
- **SignalDefinition registry** — 13 live signal definitions transcribed verbatim from Signal Catalog v0.3 (TS `packages/domain/src/signal/catalog.ts` + DB `0004_signal_definitions.sql`), with units, `inverted` flags, and green/yellow status bands.
- **Agreement model** — Family Agreement Objects as agreement → version → typed `AgreementRule` → participants/consent; machine-evaluatable, versioned, human-in-the-loop.
- **Governance engine** — pure functions: `evaluateAgreement`, `canView` (RLS mirror), `compileContext` (EgoGentix seam stub), `computeSignalStatus` / `resolveSignalStatus` (normal + inverted bands; AgreementRule override).
- **Parser foundation** — deterministic Instagram-export → `Signal[]` for `late-night-activity` + `content-volume`, with a raw-exclusion manifest and a parse-and-destroy contract (no raw content in output).
- **Tests** — 20/20 passing across engine + parser; **verified on Rocky** via `pnpm test`.
- **Typecheck** — `tsc --noEmit` clean for the pure packages; **verified on Rocky** via `pnpm typecheck`.
- **Lockfile** — `pnpm-lock.yaml` generated (pnpm 9), validated frozen-consistent, and **committed** (`e42b325`).
- **Docker validation** — **PASS**: Docker running on Rocky; the Supabase local stack boots under it.
- **Supabase validation** — **PASS**: `supabase start` + `supabase db reset` apply migrations `0001–0004` and the seed cleanly on Rocky.
- **Expo validation** — **PASS**: Expo Metro boots on Rocky after pinning `react-native-screens` (`48c0860`) and aligning Expo deps (`e42b325`).

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
| `a710010` | Sprint 000 documentation (review, retro, plan, decisions, principles, BOOTSTRAP) |
| `e42b325` | Align Expo deps + add committed `pnpm-lock.yaml` |
| `48c0860` | Pin Expo-compatible `react-native-screens` |
| `e869c93` | Configure seed path + repair seed data (valid UUIDs) |
| `3a2384a` | Add Expo-generated `.gitignore` |

## Defects Found

1. **Missing pnpm** — the sandbox could not enable corepack (`EACCES` on the `/usr/bin/pnpm` symlink).
2. **Expo dependency mismatch** — `react-native-screens` resolved to a version requiring React Native ≥ 0.82, while the app pins RN 0.74.5 (Expo SDK 51).
3. **Invalid UUIDs in seed data** — placeholder ids `ag000000…`, `av000000…`, `ru000000…` contained non-hex characters; Postgres rejected them (`invalid input syntax for type uuid`).
4. **Missing seed path configuration** — `supabase db reset` could not locate the seed (it lives at `supabase/seed/seed.sql`, not the default path).
5. **Signal catalog / schema alignment gaps** — the schema had a `Signal` *instance* type but no *definition* layer; status bands, `inverted`, supported-platforms, and two catalog categories had no schema home; plus slug drift.
6. **Migration insert mismatch** — `0004` listed 18 columns but supplied 17 values per row (missing `tier`).

## Defects Resolved

1. **Missing pnpm** — used `npx pnpm@9` for lockfile work; on Rocky, `pnpm install` runs cleanly. **Resolved.**
2. **Expo dependency mismatch** — pinned `react-native-screens` to an Expo-51-compatible version (`48c0860`) and aligned Expo deps + committed lockfile (`e42b325`). Expo Metro boot verified on Rocky. **Resolved.**
3. **Invalid UUIDs** — replaced with valid deterministic hex UUIDs (`0a…`/`0b…`/`0c…`); committed (`e869c93`); `db reset` succeeds. **Resolved.**
4. **Missing seed path** — added `[db.seed] sql_paths = ["./seed/seed.sql"]` to `supabase/config.toml`; committed (`e869c93`). **Resolved.**
5. **Catalog / schema gaps** — added the `SignalDefinition` registry (catalog-verbatim), computed `status`, first-class `inverted`, and reconciled slugs across parser, seed, and the seeded `AgreementRule` (`0228495`). **Resolved** (remaining mapping nuances in `docs/SIGNAL_CATALOG_ALIGNMENT.md`).
6. **Migration insert mismatch** — added explicit `null` for `tier` in all 13 rows (`8616d31`); `db reset` applies `0004` cleanly. **Resolved.**

## Acceptance Criteria Status

| # | Criterion (from charter §7) | Status |
|---|---|---|
| 1 | pnpm workspace bootstrapped + `pnpm install` | PASS (verified on Rocky) |
| 2 | Expo app boots (Metro) | PASS (Metro boot verified on Rocky; per-simulator run is a Sprint-001 nicety) |
| 3 | CI configured (typecheck/lint/test) | PARTIAL (lockfile committed `e42b325`; local install/test/typecheck PASS; flip CI to `--frozen-lockfile` + wire ESLint + confirm Actions run remain) |
| 4 | CONTRIBUTING / Definition of Done | PASS |
| 5 | `packages/domain` Zod schemas (incl. SignalDefinition, Consent, Flag, FamilyStatus, DeletionReceipt) | PASS |
| 6 | Migrations create tables/enums consistent with domain | PASS (`supabase db reset` verified on Rocky) |
| 7 | Deny-by-default RLS baseline + first policies | PARTIAL (policies apply cleanly via `db reset`; live-RLS visibility test still pending — Sprint 001) |
| 8 | governance-engine: evaluate / canView / compileContext / status | PASS (20/20 tests) |
| 9 | Edge Function stubs (ingest / ai / compile) | PASS (typed stubs) |
| 10 | Parser fixture → Signal[] + raw-exclusion + parse-and-destroy | PASS |
| 11 | Privacy + threat-model + crisis + deletion docs | PASS |
| 12 | ADRs merged | PASS (0001–0006) |
| 13 | Auth skeleton + role-aware routing | PARTIAL (app boots; role-aware routing not yet exercised with real auth — Sprint 001) |
| 14 | Visibility test harness (guardian cannot read raw) | PARTIAL (pure-function `canView` test exists; live-RLS test pending) |
| 15 | Deletion lifecycle implemented + tested | FAIL (documented in ADR-0005 + runbook; code not built — intentionally deferred) |
| 16 | Seed synthetic family | PASS (verified via `db reset`) |

## Sprint 000 Final Status

| Area | Status | Notes |
|---|---|---|
| **Architecture** | PASS | Domain-first monorepo; RLS-as-enforcement; single `compileContext` seam; EgoGentix infra un-built by design. No drift. |
| **Environment** | PASS | Node 20, `pnpm install`, Docker, Supabase CLI, `supabase start`, Expo Metro all verified on Rocky; lockfile committed. |
| **Database** | PASS | `supabase db reset` applies migrations 0001–0004 + seed cleanly; deny-by-default RLS applied. (Live-RLS test → Sprint 001.) |
| **Testing** | PASS | 20/20 unit tests + clean typecheck, verified on Rocky. (Live-DB integration tests → Sprint 001.) |
| **Documentation** | PASS | Charter, 6 ADRs, privacy/threat/crisis/deletion docs, signal catalog + alignment, sprint review/retro/plan, decisions register, product principles, BOOTSTRAP. |
| **Process** | PASS | Lane ownership defined (Rocky=env, Claude=impl, ChatGPT=scrum, GitHub=source of truth); run-before-claim adopted. |
| **Product Alignment** | PASS | Mentorship-not-surveillance posture intact; product principles documented; no product drift. |

## Sprint Outcome

Sprint 000 is **complete and validated**. A clean, domain-first foundation exists, is internally consistent, and now runs end-to-end on a real developer machine: `pnpm install`, `pnpm test` (20/20), `pnpm typecheck`, Docker, `supabase start`, `supabase db reset`, and Expo Metro boot all PASS on Rocky. The six defects found during the sprint are resolved and committed.

Three items remain open and are honest carry-overs into Sprint 001 (not failures of intent): the **deletion-lifecycle implementation** (documented in ADR-0005, not yet built), a **live-database RLS/visibility test**, and **CI finalization** (flip to `--frozen-lockfile`, wire ESLint, confirm the Actions run). Parser metric accuracy is tracked canonically in **Issue #1** and is the first work item of Sprint 001.
