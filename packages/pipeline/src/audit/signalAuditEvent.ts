import type { Signal, AuditEvent } from "@mychoice/domain";
import type { SignalDerivationRecordPayload } from "@mychoice/governance-engine";

export const SIGNAL_AUDIT_EVENT_SCHEMA_VERSION = 1;

/** What the audit event records. Extensible (e.g. future "signal.disclosed"). */
export type SignalAuditEventKind = "signal.derived";

/**
 * A durable, content-free audit record for a derived signal. Carries operational scoping ids
 * (family/subject) + the content-free derivation payload. Append-only; immutable once written.
 */
export interface SignalAuditEvent {
  id: string;                 // event id (caller-supplied; append-only key)
  schema_version: number;
  kind: SignalAuditEventKind;
  occurred_at: string;        // ISO 8601 (caller-supplied clock)
  family_id: string;          // scoping id (not content)
  subject_user_id: string;    // scoping id (not content)
  signal_id: string;
  signal_type: string;
  derivation: SignalDerivationRecordPayload;
}

export interface SignalAuditEventInit {
  event_id: string;
  occurred_at: string;
  kind?: SignalAuditEventKind;
}

/** PURE. Deterministic given init. No clock/uuid side effects (the caller supplies them at the boundary). */
export function buildSignalAuditEvent(
  signal: Signal,
  derivation: SignalDerivationRecordPayload,
  init: SignalAuditEventInit,
): SignalAuditEvent {
  return {
    id: init.event_id,
    schema_version: SIGNAL_AUDIT_EVENT_SCHEMA_VERSION,
    kind: init.kind ?? "signal.derived",
    occurred_at: init.occurred_at,
    family_id: signal.family_id,
    subject_user_id: signal.subject_user_id,
    signal_id: signal.id,
    signal_type: signal.type,
    derivation,
  };
}

/**
 * PURE. Maps a SignalAuditEvent onto the existing domain `AuditEvent` shape so it persists into the
 * `audit_events` table (metadata jsonb) with NO new migration. Decisions/metadata only, never content.
 */
export function toAuditEventRow(e: SignalAuditEvent): AuditEvent {
  return {
    id: e.id,
    family_id: e.family_id,
    actor_user_id: null, // system-generated
    action: e.kind,
    object_type: "signal",
    object_id: e.signal_id,
    decision: e.derivation.status,
    created_at: e.occurred_at,
    metadata: {
      schema_version: e.schema_version,
      signal_type: e.signal_type,
      subject_user_id: e.subject_user_id,
      derivation: e.derivation,
    },
  };
}
