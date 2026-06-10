# Persistence Contract — Signal Audit Event (Story 002-001)

**Status:** Implemented as a **pure contract** (types + builder + store port + in-memory adapter). No Edge upload, no DB I/O, no auth, no migration.

## Purpose

Give every derived signal a durable, **content-free** audit record so the system can later explain
“why did we say this?” — tracing a status/interpretation back to its transform, thresholds, and counted
totals. This is the persistence-ready form of the `SignalDerivationRecordPayload` produced by
`finalizeSignal` (Sprint 001).

## The record (`SignalAuditEvent`)

| Field | Meaning |
|---|---|
| `id` | Append-only event key (caller-supplied). |
| `schema_version` | Contract version (currently `1`). |
| `kind` | `"signal.derived"` (extensible, e.g. future `"signal.disclosed"`). |
| `occurred_at` | ISO 8601, caller-supplied clock. |
| `family_id`, `subject_user_id` | Operational **scoping** ids (not content). |
| `signal_id`, `signal_type` | Which signal. |
| `derivation` | The content-free `SignalDerivationRecordPayload` (value, unit, status, transform id/version, total/night counts, thresholds applied, aggregate window, `raw_excluded`/`raw_retained`). |

## Invariants

1. **Content-free.** No raw content, URLs, handles, source ids, or per-event timestamps — only aggregates, decisions, and provenance. (Tested: the serialized event matches none of `http`, `instagram.com`, `@`, `fbid`.)
2. **Append-only + idempotent by `id`.** Re-appending the same id is a no-op; the first write wins. Audit history is never mutated or overwritten.
3. **Immutable once written.** The in-memory adapter freezes stored events.
4. **Pure builder.** `buildSignalAuditEvent` is deterministic given `{ event_id, occurred_at }` — no hidden clock/uuid. The impure boundary (future Edge/persist) supplies id + time.

## The port (`SignalAuditEventStore`)

```ts
interface SignalAuditEventStore {
  append(event: SignalAuditEvent): void; // idempotent by id
  getById(id: string): SignalAuditEvent | undefined;
  listBySubject(subjectUserId: string): SignalAuditEvent[];
  size(): number;
}
```

Shipped implementation: **`InMemorySignalAuditEventStore`** (pure reference). The real Supabase adapter
will implement the same logical contract (async) in a later story — not in this one.

## Storage mapping — **no migration**

`toAuditEventRow(event)` maps a `SignalAuditEvent` onto the existing domain `AuditEvent` shape so it
persists into the current **`audit_events`** table:

| audit_events column | from |
|---|---|
| `action` | `kind` (`signal.derived`) |
| `object_type` | `"signal"` |
| `object_id` | `signal_id` |
| `decision` | `derivation.status` |
| `actor_user_id` | `null` (system) |
| `created_at` | `occurred_at` |
| `metadata` (jsonb) | `{ schema_version, signal_type, subject_user_id, derivation }` |

Because the payload rides in `metadata jsonb`, **no schema change or migration is required** for Story
002-001. A dedicated `signal_derivation_records` table remains an optional future optimization (if/when
query patterns need it) — explicitly deferred.

## Versioning / evolution

`schema_version` travels with every event. When the derivation shape changes, bump the version and keep
readers backward-compatible. Append-only history means old events stay valid at their original version.

## Out of scope (deferred to later Sprint-002 stories)

- The async Supabase store adapter + actual `audit_events` writes (Edge/DB).
- Wiring `buildSignalAuditEvent` into the ingest path.
- Any new table/migration.
