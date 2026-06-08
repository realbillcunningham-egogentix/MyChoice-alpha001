# The "zero-knowledge" boundary — what it does and does not mean in Alpha

> Plain-language companion to ADR-0002 (amended v1.1). Read this before making any privacy claim externally.

## What we promise (and enforce)

- **Parents see patterns, not content.** No raw message/content body is stored in a durable table or exposed on any parent-visible path. The `signals` table has no content column by design.
- **Parse-and-destroy.** Uploaded GDPR/Instagram exports live briefly in a short-retention bucket, are parsed in-memory inside `ingest-export`, and the raw payload is deleted immediately after parsing (`ingest_runs.raw_destroyed_at`).
- **No raw browsing after parse.** Alpha does **not** persist raw social content for later viewing. A child may access **their own uploaded source files during the active processing window only**; after parsing, the raw payload is gone.
- **Derived-only persistence.** Only derived `signals` and governance objects persist.
- **Visibility ≠ collection.** Deny-by-default RLS decides who sees what. `pilot_operator` sees audit metadata only.

## What it does NOT mean (honest caveats)

- It is **not cryptographic zero-knowledge.** During parsing, plaintext is processed server-side inside a Supabase Edge Function. A sufficiently privileged operator or a compromised function could, in principle, observe data in flight.
- True ZK / data-never-leaves-device requires **on-device parsing** or confidential computing — both deferred past Alpha.

## Data inventory & classification

| Data | Class | Where it lives | Visible to |
|---|---|---|---|
| Raw uploaded source files | Raw / sensitive | Ephemeral storage, destroyed post-parse | Child only, processing window only |
| Derived signals (derived_safe) | Derived | `signals` | Child (own) + guardian |
| Derived signals (sensitive) | Derived-sensitive | `signals` | Child (own); guardian via escalation |
| Agreements & versions | Governance | `agreements*` | Family members |
| Recommendations | AI output (from signals only) | `recommendations` | Role-scoped |
| Flags ("Feels Weird") | Safety | `flags` | Child + crisis protocol |
| Deletion receipts | Metadata (counts only) | `deletion_receipts` | pilot_operator |
| Audit events | Metadata (no content) | `audit_events` | pilot_operator |

## Retention & deletion

- Raw exports: destroyed immediately after parse (target: minutes).
- Derived data: retained for the pilot; purged on **family exit** or **child majority** — see `docs/runbooks/deletion-lifecycle.md`.
- Deletion cascades from `families` / `users`; a content-free `deletion_receipts` row is preserved as proof.
