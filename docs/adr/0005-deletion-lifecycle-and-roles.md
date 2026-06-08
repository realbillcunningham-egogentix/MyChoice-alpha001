# ADR 0005 — Deletion lifecycle and the narrowed pilot_operator role

- **Status:** Accepted
- **Date:** 2026-06-08
- **Context:** Two pre-Sprint-001 requirements: (a) the privileged role must not imply product "god-mode" authority; (b) the system must have explicit, auditable deletion flows for family exit and a child reaching majority — both COPPA/GDPR-relevant and previously underspecified.

## Decision A — `system_admin` → `pilot_operator` (narrowed)

The role is renamed and scoped to operations only.

**pilot_operator MAY:** manage pilot setup; support account recovery; inspect audit **metadata**; trigger the deletion workflow.

**pilot_operator MAY NOT:** view raw export content; view family signal/agreement content; impersonate family members.

Mechanically: `pilot_operator` appears in **no content row** of the visibility matrix; RLS grants it only `audit_events` (metadata) and `deletion_receipts`. The `users.is_pilot_operator` flag replaces `is_platform_admin`.

## Decision B — Explicit deletion lifecycle

**`family_exit_requested`:** freeze ingestion (`families.status: active → exit_requested → frozen`) → export derived data if requested → delete raw processing artifacts (confirm `ingest_runs.raw_destroyed_at`) → delete signals/agreements/recommendations (cascade from `families`) → write a **minimal, content-free `deletion_receipts` row** (counts + scope only).

**`child_reaches_majority`:** suspend guardian default visibility (`relationship_edges.valid_to = now()` on `guardian_of` edges) → request adult re-consent → offer export / delete / continue as an independent self-owned account. Guardian access does not silently resume.

## Consequences

- New: `family_status` enum, `families.status`, `deletion_receipts` table, `users.is_pilot_operator` (migration `0003_lifecycle.sql`).
- Deletion is implemented and tested in Sprint 000 (a test family can be fully exited leaving only a content-free receipt).
- A receipt deliberately survives deletion to evidence that deletion occurred — it contains no personal content.

## Alternatives considered

- **Hard-delete with no receipt** — rejected; we need auditable proof of deletion without retaining content.
- **Keep a broad admin role** — rejected; conflicts with the mentorship-not-surveillance posture and widens insider risk.
