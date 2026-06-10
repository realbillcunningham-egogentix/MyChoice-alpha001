import type { SignalAuditEvent } from "./signalAuditEvent";

/**
 * Persistence PORT for Signal Audit Events. Append-only and idempotent by `id`.
 * The real (async) Supabase adapter will implement the same logical contract; this package
 * ships only the pure in-memory reference implementation (no Edge/DB).
 */
export interface SignalAuditEventStore {
  append(event: SignalAuditEvent): void; // idempotent by id; never overwrites
  getById(id: string): SignalAuditEvent | undefined;
  listBySubject(subjectUserId: string): SignalAuditEvent[];
  size(): number;
}

/** Pure in-memory reference adapter. */
export class InMemorySignalAuditEventStore implements SignalAuditEventStore {
  private readonly events = new Map<string, SignalAuditEvent>();

  append(event: SignalAuditEvent): void {
    if (this.events.has(event.id)) return; // append-only: ignore duplicate id (idempotent)
    this.events.set(event.id, Object.freeze({ ...event }));
  }
  getById(id: string): SignalAuditEvent | undefined {
    return this.events.get(id);
  }
  listBySubject(subjectUserId: string): SignalAuditEvent[] {
    return [...this.events.values()].filter((e) => e.subject_user_id === subjectUserId);
  }
  size(): number {
    return this.events.size;
  }
}
