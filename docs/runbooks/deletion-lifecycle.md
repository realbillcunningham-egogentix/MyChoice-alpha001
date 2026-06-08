# Runbook — Deletion & account lifecycle

Implements ADR-0005. Two flows. Both are auditable and leave only content-free receipts.

## A. Family exit — `family_exit_requested`

Trigger: a guardian requests exit, or a `pilot_operator` triggers it on a family's behalf (e.g., pilot ends).

1. **Freeze ingestion.** Set `families.status = 'exit_requested'`, then `'frozen'`. No new exports are accepted or parsed while frozen.
2. **Export derived data (if requested).** Produce a portable bundle of `signals`, `agreements` (+versions), and `recommendations`. **Never** includes raw content (none is persisted anyway).
3. **Delete raw processing artifacts.** Delete any in-flight export objects from the short-retention bucket; verify every related `ingest_runs.raw_destroyed_at` is set.
4. **Delete derived records.** Delete `signals`, `agreements`, `recommendations`, `flags`, `consents` — cascade from `families`.
5. **Write the receipt.** Insert a `deletion_receipts` row: `scope='family_exit'`, `requested_by`, `derived_export_provided`, `raw_artifacts_deleted=true`, and `records_deleted` (counts only). Set `families.status='deleted'`.
6. **Audit.** One `audit_events` row per step (decision + counts, no content).

**Acceptance (Sprint 000):** a seeded test family can be run end-to-end, after which only a content-free `deletion_receipts` row remains.

## B. Child reaches majority — `child_reaches_majority`

Trigger: a child's `date_of_birth` indicates adulthood (jurisdiction-dependent; confirm threshold during compliance review).

1. **Suspend guardian default visibility.** Set `valid_to = now()` on the `guardian_of` `relationship_edges` for that subject. Guardian access stops; it does **not** silently resume.
2. **Request adult re-consent.** Prompt the now-adult user to establish their own lawful basis / consent.
3. **Offer a choice.**
   - **Export** their derived data.
   - **Delete** (runs flow A scoped to that individual).
   - **Continue as an independent account** — a new self-owned membership; any future guardian-style visibility requires fresh, explicit grants.
4. **Audit.** Record the transition and the user's choice (no content).

## Hard rules

- Deletion never leaves residual personal content; receipts carry counts and scope only.
- Majority transition never preserves guardian visibility by default.
- `pilot_operator` may trigger these flows but never reads the content being deleted.
