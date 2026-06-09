# Sprint 001 Plan

**Sprint:** 001 · **Depends on:** Sprint 000 foundation (validated on Rocky)
**Scope status:** Reduced after Sprint 001 review with Product Owner + Scrum Master — from a four-signal implementation to a **single-signal walking skeleton**.

## Why the reduction

We are still validating architecture. The goal is to prove the **complete end-to-end MyChoice pipeline with the smallest possible surface area** — not to maximize signal coverage. One signal, every stage, fully explainable.

## Sprint Goal

Take a real Instagram export fixture and successfully process it through the full pipeline using **exactly one signal — `late-night-activity`**:

```
Instagram Export
  → Normalize
  → Signal
  → Persist
  → Status
  → Agreement Evaluation
  → compileContext
  → Parent View
  → Child View
```

## Scope

**Signal in scope (1):** `late-night-activity` only.

The purpose is **proving the architecture**, not signal coverage. `late-night-activity` is chosen because it is already half-built (Issue #1), exercises the riskiest correctness path (local-time `%` computation + status banding + agreement evaluation), and has a seeded agreement rule to evaluate against.

## Explicitly Out Of Scope

- All other signals (`content-volume`, `feed-diversity`, `algorithmic-amplification`, and the rest of the catalog).
- Dashboard / visual polish.
- AI coaching UX.
- Additional social platforms (TikTok, YouTube, Facebook).
- EgoGentix infrastructure (kernel, keys, enclaves, DIDs, overlay lattice).
- New signal categories or definitions.

## Canonical trackers

- **Issue #1 — Parser Accuracy** remains the single source of truth for `content-volume` + `late-night-activity` metric computation. It is **not** expanded by this sprint. Sprint 001 consumes the `late-night-activity` portion of Issue #1.
- Future signals are tracked separately (see **Recommended Future Issues** below). They are **not** started in Sprint 001.

## Prerequisites

These must be resolved (or explicitly stubbed) before the corresponding pipeline stage can be trusted.

1. **Timezone handling.** `late-night-activity` is defined on a **local** 21:00–06:00 window (catalog: "21:30–07:00 local"), but Instagram export timestamps are UTC. The sprint must document and apply how local time is determined.
   - *Open dependency:* the data model has **no timezone source** today (`users` has no `timezone` column). For the skeleton, define the timezone from a single explicit source — recommended order: (a) an explicit fixture/family timezone value supplied with the export, falling back to (b) a configured pilot default (e.g. `America/New_York`). Document the chosen source; do **not** infer silently from UTC. A persistent `timezone` field is a likely near-future schema addition (out of scope for this doc-only task).
2. **Real Instagram export fixture.** The sprint requires **one sanitized, real-world Instagram export fixture** (not the synthetic session-event fixture from Sprint 000). Its actual structure must be confirmed against the catalog's assumed `posts_viewed` / `videos_watched` (creator + timestamp + type) — this is risk R3 (export-format drift).
3. **Auth / session.** Role-scoped views require an authenticated identity resolved to a role + family context (`current_app_user_id`, `is_guardian_of`). Sprint 000 left auth + role-aware routing PARTIAL (the `session.ts` `me`/membership resolution is a TODO); it must be functional for the view stages.
4. **Live RLS verification.** Against a live database, prove:
   - a **guardian cannot access raw content** (only derived-safe signals for their child); and
   - a **`pilot_operator` cannot access family content** (audit metadata only — expected to pass by construction given current RLS, but must be asserted).

## Deliverables (pipeline)

1. **Instagram Export → Normalize** — ingest the real Instagram export fixture; normalize to the internal structures `late-night-activity` needs (`contentTimeline` with timestamps → `hourlyDistribution`). Confirm per-item timestamps are present.
2. **Normalize → Signal** — compute `late-night-activity` as a **local-time `%`** per its Catalog v0.3 definition (bands 15 / 30), applying the timezone from Prerequisite 1. *(The metric-accuracy implementation — minutes→`%` fix + fixture tests — is delivered under **Issue #1**; not re-tracked here.)*
3. **Signal → Persist** — persist the `Signal` (via the `ingest-export` Edge Function / service role), destroy the raw payload, and set `ingest_runs.raw_destroyed_at`.
4. **Persist → Status** — assign `status` from the SignalDefinition bands via `computeSignalStatus` (normal signal; `aligned` ≤15, `attention` 15–30, `crossed` >30).
5. **Status → Agreement Evaluation** — run `evaluateAgreement` over the persisted signal against the seeded family `late-night-activity` rule; produce the per-rule result (with `AgreementRule` override of the default band where present).
6. **Agreement Evaluation → compileContext** — see **compileContext Requirement** below.
7. **compileContext → Parent View** — guardian-facing output: derived-safe signal + status + agreement context (conversation-starter framing). Never raw content.
8. **compileContext → Child View** — child-facing output: the child's own signal + status + self-directed framing.
9. **Signal Audit Trail** — see **Auditability Requirement** below.

## compileContext Requirement

Parent and Child views **must** retrieve information through **`compileContext`**. **No direct view-specific database queries.** The `compileContext` seam is required by the architecture (ADR-0004) and by the future EgoGentix compatibility strategy: today it returns a role-scoped projection over RLS-filtered signals; later it becomes the Context Compiler emitting Compiled Context Objects. Building the views as ad-hoc queries would bypass the one chokepoint the whole design depends on.

## Auditability Requirement — Signal Audit Trail

The system must be able to explain a result both **forward and backward**:

```
Observed Signal → Status → Agreement Evaluation → Contextual View
        ↑ traceable back to ↓
Source Fixture → Normalized Events → Transform Version → Thresholds Applied
```

### Design note: `SignalDerivationRecord` (design only — no implementation required unless it naturally fits Sprint 001)

A structured, **content-free** record linking a produced signal to its derivation. It must honor ADR-0002: store references, hashes, and derived counts — **never** raw content.

```
SignalDerivationRecord {
  id
  signal_id                 // the produced Signal
  family_id, subject_user_id
  ingest_run_id             // source ingestion event
  source_fixture_ref        // identifier of the export fixture (not its contents)
  normalized_events_summary // counts / window only (e.g. total items, night-window items) — no content
  timezone_applied          // the local TZ used (Prerequisite 1)
  transform_id, transform_version
  thresholds_applied        // snapshot { green_cut, yellow_cut, inverted } at compute time
  computed_value, unit       // e.g. 22, "%"
  computed_status           // aligned | attention | crossed
  agreement_version_id, rule_id
  agreement_result          // aligned | breached | ...
  compiled_context_audit_ref // link to the compileContext disclosure / audit_events row
  created_at
}
```

For the skeleton this may be emitted as structured `audit_events.metadata` (counts + refs only) so **no schema change is required** in Sprint 001. A dedicated table is a candidate for a later sprint. The deliverable for Sprint 001 is this **design note plus, at minimum, the audit-event emission** that captures the trace; full persistence/UI is deferred.

## Recommended Future Issues (do not start)

Per the review, Issue #1 is **not** expanded. The two parser signals dropped from this sprint should be tracked separately when scheduled. **These GitHub issues are recommended but not yet created** (to avoid prematurely consuming issue numbers) — open on request:

- **Issue #2 — Feed Diversity (`feed-diversity`).** New transform: single-most-viewed-creator share of total views (`contentConsumed.byOwner`); `%`, bands 40 / 60; normal. Out of scope for Sprint 001.
- **Issue #3 — Algorithmic Amplification (`algorithmic-amplification`).** New transform: share of viewed content from accounts **not** in `following` (`byOwner` vs `following.accounts`); `%`, bands 30 / 50; normal. Out of scope for Sprint 001.

Neither signal is implemented or begun in Sprint 001.

## Sprint Success Criteria

The sprint succeeds when, from real export fixtures:

- **Fixture A** → `late-night-activity` resolves to **Aligned** (value ≤ 15% local-time night usage).
- **Fixture B** → `late-night-activity` resolves to **At Risk** (value in the 15–30% band).
- The system can **fully explain why** for both — tracing Observed Signal → Status → Agreement Evaluation → Contextual View back to Source Fixture → Normalized Events → Transform Version → Thresholds Applied (the Signal Audit Trail).
- Both Parent and Child views are served **through `compileContext`** and contain **no raw content**; live-RLS checks (Prerequisite 4) pass.

**Not required:** dashboard, AI coaching, additional platforms, any other signal.

> **Terminology note (must be reconciled in Sprint 001):** "At Risk" is the Product-Owner-facing label for the middle state. In code, the middle **signal status** band is `attention` (`SignalStatus`), while the engine's `AgreementAlignment` enum has a separate `at_risk` value that `evaluateAgreement` does not currently emit. For this skeleton the user-facing state is derived from the **SignalDefinition bands** via `computeSignalStatus`, mapping `attention → "At Risk"`. Sprint 001 should formally reconcile these two vocabularies (see Concerns).
