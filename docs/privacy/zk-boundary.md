# The "zero-knowledge" boundary — what it does and does not mean in Alpha

> Plain-language companion to ADR-0002. Read this before making any privacy claim externally.

## What we promise (and enforce)

- **Parents see patterns, not content.** No raw message/content body is ever stored in a durable table or exposed on any parent-visible path. The `signals` table has no content column by design.
- **Parse-and-destroy.** Uploaded GDPR/Instagram exports live briefly in a short-retention bucket, are parsed in-memory inside the `ingest-export` Edge Function, and the raw payload is deleted immediately after parsing (`ingest_runs.raw_destroyed_at` records it).
- **Derived-only persistence.** Only derived `signals` and governance objects persist.
- **Visibility ≠ collection.** Deny-by-default Postgres RLS decides who sees what, independently of what was collected.

## What it does NOT mean (honest caveats)

- It is **not cryptographic zero-knowledge.** During parsing, plaintext is processed server-side inside a Supabase Edge Function. A sufficiently privileged operator or a compromised function could, in principle, observe data in flight.
- True ZK / data-never-leaves-device requires **on-device parsing** (the spec's principal-controlled boundary) or confidential computing — both deferred past Alpha.

## Data inventory & classification

| Data | Class | Where it lives | Parent-visible? |
|---|---|---|---|
| Raw export payload | Raw / sensitive | Ephemeral storage, destroyed post-parse | Never |
| Derived signals (derived_safe) | Derived | `signals` | Yes |
| Derived signals (sensitive) | Derived-sensitive | `signals` | Escalation only |
| Agreements & versions | Governance | `agreements*` | Family members |
| Recommendations | AI output (from signals only) | `recommendations` | Role-scoped |
| Flags ("Feels Weird") | Safety | `flags` | Crisis protocol |
| Audit events | Metadata (no content) | `audit_events` | Admin |

## Retention & deletion

- Raw exports: destroyed immediately after parse (target: minutes, not hours).
- Derived data: retained for the pilot; purged on family exit or when a child reaches majority.
- Deletion is a cascade from `families` / `users`; a per-family purge job is a Sprint-001 deliverable.
