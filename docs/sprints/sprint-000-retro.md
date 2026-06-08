# Sprint 000 Retro

**Sprint:** 000 (Foundation) · **Date:** 2026-06-08 · **Status:** validated on Rocky

## What Worked

- **Domain-first paid off immediately.** Defining `Signal` / `Agreement` / identity once in `packages/domain` kept the engine, parser, and DB aligned and made the SignalDefinition registry a clean additive change.
- **Pure governance engine.** Keeping evaluation, visibility, and status logic as pure functions made them exhaustively unit-testable (20/20) without any infrastructure.
- **ADR discipline.** Every consequential decision has a written rationale, which made later amendments fast and unambiguous.
- **Catalog as a source document.** Treating Signal Catalog v0.3 as authoritative — and refusing to invent definitions — produced a registry that exactly mirrors R&D intent.
- **Verification before claims.** Running tests/typecheck and parsing the SQL surfaced two bugs (migration `0004`, seed UUIDs) before they reached a clean-run claim; the full local validation on Rocky then confirmed the foundation end-to-end.

## What Did Not Work (and how it was closed)

- **Tooling friction in the sandbox.** corepack could not symlink pnpm; lockfile work needed `npx pnpm@9`. On a real machine `pnpm install` is clean.
- **Lockfile hand-off.** The 374 KB `pnpm-lock.yaml` could not be committed through the inline GitHub API; once a local working tree existed it was generated, aligned, and committed (`e42b325`). **Closed.**
- **Expo dependency pinning.** Hand-written RN-ecosystem versions produced a peer mismatch; fixed by pinning `react-native-screens` via `expo install` (`48c0860`) and aligning deps (`e42b325`). Metro boot verified. **Closed.**
- **Migration authored without execution.** `0004` shipped with a column/value mismatch because no Postgres was available at authoring time; caught by SQL review and fixed (`8616d31`), then confirmed by `supabase db reset`. **Closed.**

## Surprises

- The Signal Catalog was a *definition* catalog (bands, inverted, platforms), not just a list — revealing the schema was missing an entire definition layer.
- The uploaded "signal reference" file was first an Excel lock file (`~$…`, 165 bytes) containing only the owner name — no data — requiring a re-upload.
- Three seed placeholder UUIDs were silently invalid hex and only failed at `db reset` time.

## Technical Debt Introduced

- **Parser metric accuracy.** `late-night-activity` still emits a placeholder (minutes) vs its `%` definition; `content-volume` uses a session-count proxy. **Tracked canonically in Issue #1** (the single source of truth for this work).
- **Lint not wired.** CI references `eslint` but no config/rules are committed yet.
- **Deletion lifecycle is documented, not implemented.**
- **Live RLS not yet tested.** Visibility is enforced in policy + mirrored in `canView`, but no test runs against a live database.

## Technical Debt Removed

- **Slug drift** eliminated (`late_night_usage`/`content_volume` → catalog ids) across parser, seed, and agreement rule.
- **Catalog/schema gap** closed via the SignalDefinition registry + computed status.
- **Migration `0004`** column/value mismatch fixed and verified by `db reset`.
- **Seed UUID + seed-path** errors fixed and committed (`e869c93`).
- **Expo peer mismatch** fixed and committed (`48c0860` / `e42b325`); Metro boot verified.
- **Uncommitted lockfile** resolved — committed (`e42b325`).
- **Role over-reach** removed: `system_admin` narrowed to `pilot_operator` (no content access).

## Architecture Drift Observed

- None material. The build stayed on the charter's architecture (domain-first, RLS-as-enforcement, single `compileContext` seam). The one correction was additive: introducing the definition layer the catalog implied. EgoGentix infrastructure remained un-built by design.

## Product Drift Observed

- None. Scope held to foundation + docs. The mentorship-not-surveillance posture was reinforced (raw content never persisted for browsing; `pilot_operator` sees no content; child raw access limited to the processing window).

## Process Improvements

- **Clear lane ownership:**
  - **Rocky** executes environment tasks (clone, Docker/Supabase, pnpm install, Expo, running migrations/tests locally, pushing heavy commits).
  - **Claude** owns implementation (schemas, engine, parser, migrations, docs) and verification.
  - **ChatGPT** owns Scrum / backlog (sprint shaping, ceremonies, ticket grooming).
  - **GitHub is the source of truth** — all artifacts land in the repo; local working-tree edits are explicitly flagged until committed.
- **Run before claiming.** Generate lockfiles, run tests, and parse/execute SQL before reporting status — validated by the full local run on Rocky.
- **Use `expo install`** for any RN-ecosystem dependency, never hand-pinned versions.
- **Author migrations against a real Postgres** (or at least a parser) before merge.
- **One tracker per work item.** Parser accuracy lives in Issue #1; sprint plans reference it rather than duplicating the backlog.

## Action Items For Sprint 001

1. Flip CI to `--frozen-lockfile` (lockfile now committed) and wire ESLint; confirm the Actions run is green.
2. Add a live-database RLS/visibility test (guardian cannot read raw; `pilot_operator` sees metadata only).
3. Deliver **Issue #1** (parser metric accuracy) — then wire `computeSignalStatus` into ingestion.
4. Execute the Sprint 001 plan (Instagram export → agreement evaluation → role views).
5. (Backlog) Implement the deletion lifecycle per ADR-0005 when scheduled.
