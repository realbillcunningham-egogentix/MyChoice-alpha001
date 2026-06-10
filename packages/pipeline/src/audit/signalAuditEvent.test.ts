import { describe, it, expect } from "vitest";
import { buildSignalAuditEvent, toAuditEventRow, SIGNAL_AUDIT_EVENT_SCHEMA_VERSION } from "./signalAuditEvent";
import { InMemorySignalAuditEventStore } from "./store";
import { finalizeSignal } from "@mychoice/governance-engine";
import type { Signal } from "@mychoice/domain";

const baseSignal = (value: number, total: number, night: number): Signal => ({
  id: "5160a000-0000-0000-0000-0000000000aa",
  family_id: "fa000000-0000-0000-0000-000000000001",
  subject_user_id: "22222222-2222-2222-2222-222222222222",
  category: "attention_engagement", type: "late-night-activity",
  value, value_type: "scalar", unit: "%",
  window_start: "2026-01-06T19:00:00.000Z", window_end: "2026-01-07T04:30:00.000Z",
  confidence: 0.9, source_type: "instagram_export", ingest_run_id: null,
  transform_id: "late-night-activity.v1", transform_version: "1.0.0",
  privacy_class: "derived_safe", domain: "wellness", raw_excluded: true, raw_exclusion_note: null,
  composite_of: null, created_at: "2026-06-09T00:00:00.000Z", expires_at: null,
  metadata: { timezone: "America/New_York", total_items: total, night_items: night },
});

const build = (value: number, total: number, night: number, eid: string) => {
  const { signal, derivation } = finalizeSignal(baseSignal(value, total, night), { provenance_label: "instagram:mar-14-fixture" });
  return buildSignalAuditEvent(signal, derivation, { event_id: eid, occurred_at: "2026-06-09T12:00:00.000Z" });
};

describe("buildSignalAuditEvent (pure)", () => {
  it("is deterministic and carries required fields", () => {
    const e = build(25, 4, 1, "ev000000-0000-0000-0000-000000000001");
    expect(e).toEqual(build(25, 4, 1, "ev000000-0000-0000-0000-000000000001"));
    expect(e.schema_version).toBe(SIGNAL_AUDIT_EVENT_SCHEMA_VERSION);
    expect(e.kind).toBe("signal.derived");
    expect(e.signal_type).toBe("late-night-activity");
    expect(e.derivation.status).toBe("attention");
    expect(e.derivation.observed_value).toBe(25);
  });
  it("contains no raw content", () => {
    const blob = JSON.stringify(build(60, 10, 6, "ev000000-0000-0000-0000-000000000002"));
    for (const re of [/https?:\/\//, /instagram\.com/, /@/, /fbid/]) expect(blob).not.toMatch(re);
  });
});

describe("toAuditEventRow maps onto the existing audit_events shape (no migration)", () => {
  it("maps action/object/decision/metadata", () => {
    const row = toAuditEventRow(build(60, 10, 6, "ev000000-0000-0000-0000-000000000003"));
    expect(row.action).toBe("signal.derived");
    expect(row.object_type).toBe("signal");
    expect(row.object_id).toBe("5160a000-0000-0000-0000-0000000000aa");
    expect(row.decision).toBe("crossed");
    expect(row.actor_user_id).toBeNull();
    expect((row.metadata as Record<string, unknown>).schema_version).toBe(1);
  });
});

describe("InMemorySignalAuditEventStore (append-only, idempotent)", () => {
  it("append + getById roundtrip", () => {
    const s = new InMemorySignalAuditEventStore();
    const e = build(0, 8, 0, "ev000000-0000-0000-0000-0000000000a1");
    s.append(e);
    expect(s.getById(e.id)).toEqual(e);
    expect(s.size()).toBe(1);
  });
  it("duplicate id is idempotent (no overwrite, no growth)", () => {
    const s = new InMemorySignalAuditEventStore();
    s.append(build(0, 8, 0, "dup00000-0000-0000-0000-0000000000a1"));
    s.append(build(60, 10, 6, "dup00000-0000-0000-0000-0000000000a1"));
    expect(s.size()).toBe(1);
    expect(s.getById("dup00000-0000-0000-0000-0000000000a1")!.derivation.status).toBe("aligned");
  });
  it("listBySubject filters by subject", () => {
    const s = new InMemorySignalAuditEventStore();
    s.append(build(25, 4, 1, "ev000000-0000-0000-0000-0000000000b1"));
    expect(s.listBySubject("22222222-2222-2222-2222-222222222222")).toHaveLength(1);
    expect(s.listBySubject("00000000-0000-0000-0000-000000000000")).toHaveLength(0);
  });
  it("stored events are frozen (immutable)", () => {
    const s = new InMemorySignalAuditEventStore();
    const e = build(25, 4, 1, "ev000000-0000-0000-0000-0000000000c1");
    s.append(e);
    expect(Object.isFrozen(s.getById(e.id))).toBe(true);
  });
});
