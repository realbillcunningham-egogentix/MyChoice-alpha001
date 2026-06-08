# Sprint 001 Plan

**Sprint:** 001 · **Depends on:** Sprint 000 foundation (validated on Rocky)

## Canonical trackers

- **Parser metric accuracy is tracked in [Issue #1](https://github.com/realbillcunningham-egogentix/MyChoice-alpha001/issues/1)** — the single source of truth for that implementation. This plan **references** Issue #1 and does **not** duplicate its checklist. Where a deliverable below depends on parser accuracy, it points to Issue #1.

## Goal

Take a **real Instagram export fixture** all the way from ingestion through agreement evaluation, and expose the results through role-scoped read APIs — proving the end-to-end pipeline on accurate, catalog-consistent signals.

## Objective

Deliver Issue #1 (catalog-accurate metric computation for the in-scope signals), persist the derived signals with computed status, evaluate them against a family agreement, and serve parent and child views from the same governed foundation. This is the first vertical slice of real product value.

## Scope

**Signals in scope (4):**

- `content-volume`
- `late-night-activity`
- `feed-diversity`
- `algorithmic-amplification`

Each must be computed per its Catalog v0.3 definition (correct unit + bands), persisted, and assigned a `status` via `computeSignalStatus` (with `AgreementRule` override where a family agreement applies). **Implementation of catalog-accurate computation is owned by Issue #1.**

## Explicitly Out Of Scope

- Dashboard polish / visual design.
- Additional social platforms (TikTok, YouTube, Facebook).
- AI coaching UX.
- EgoGentix infrastructure (kernel, keys, enclaves, DIDs, overlay lattice).
- New signal categories or definitions beyond the 4 in scope.

## Deliverables (pipeline)

1. **Instagram Export → Normalized Events** — ingest a real Instagram GDPR export fixture; normalize to internal `contentTimeline` / `hourlyDistribution` / `following` / `searches` structures; confirm per-item creator + timestamp + type are available (validates the Sprint-000 feasibility caveat).
2. **Normalized Events → Signal Generation** — produce the 4 in-scope signals with catalog-correct units and bands. *(Parser-accuracy implementation — fixing `late-night-activity` to `%`, verifying `content-volume`, and adding fixture tests — is delivered under **Issue #1**; not re-tracked here.)*
3. **Signal Generation → Signal Persistence** — persist `Signal` rows (via the `ingest-export` Edge Function / service role); assign `status` from the SignalDefinition bands; destroy the raw payload; record `ingest_runs.raw_destroyed_at`.
4. **Signal Persistence → Agreement Evaluation** — run `evaluateAgreement` over the persisted signals against a seeded family agreement; produce per-rule alignment + a family alignment score.
5. **Agreement Evaluation → Parent View API** — a read endpoint returning derived-safe signals + agreement alignment + conversation-starter context for a guardian (no raw content).
6. **Agreement Evaluation → Child View API** — a read endpoint returning the child's own signals, status, and self-directed framing.

## Acceptance Criteria (measurable)

- A real Instagram export fixture ingests with **zero raw content persisted** (assert no raw fields in DB; `raw_destroyed_at` set); a test proves it.
- For each of the 4 signals, parser output **unit and value match the Catalog v0.3 definition** and the fixture lands the expected band (verification gate for Issue #1).
- Persisted signals carry a non-null `status` consistent with `computeSignalStatus(def, value)`.
- `evaluateAgreement` returns the correct per-rule state and an alignment score for a breaching and a non-breaching fixture.
- Parent View API returns derived-safe signals + alignment and **never** raw content; an automated test asserts a guardian cannot retrieve raw rows.
- Child View API returns the child's own signals + status.
- All new logic is covered by fixture-based tests built from catalog simulation recipes (e.g. "The Doomscroller", "The Healthy Browser", "The Algorithm Trap"); CI green.
