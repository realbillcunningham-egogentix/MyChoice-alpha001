import { describe, it, expect } from "vitest";
import { finalizeSignal } from "./finalize";
import type { Signal } from "@mychoice/domain";

const sig = (value: number, total: number, night: number): Signal => ({
  id: "00000000-0000-0000-0000-0000000000aa",
  family_id: "fa000000-0000-0000-0000-000000000001",
  subject_user_id: "22222222-2222-2222-2222-222222222222",
  category: "attention_engagement", type: "late-night-activity",
  value, value_type: "scalar", unit: "%",
  window_start: "2026-01-06T19:00:00.000Z", window_end: "2026-01-07T04:30:00.000Z",
  confidence: 0.9, source_type: "instagram_export", ingest_run_id: null,
  transform_id: "late-night-activity.v1", transform_version: "1.0.0",
  privacy_class: "derived_safe", domain: "wellness", raw_excluded: true, raw_exclusion_note: null,
  composite_of: null, created_at: "2026-06-09T00:00:00.000Z", expires_at: null,
  metadata: { timezone: "America/New_York", total_items: total, night_items: night, transform_id: "late-night-activity.v1", transform_version: "1.0.0" },
});

describe("finalizeSignal assigns layer-1 status", () => {
  it("0% -> aligned", () => { expect(finalizeSignal(sig(0, 8, 0)).signal.status).toBe("aligned"); });
  it("25% -> attention", () => { expect(finalizeSignal(sig(25, 4, 1)).signal.status).toBe("attention"); });
  it("60% -> crossed", () => { expect(finalizeSignal(sig(60, 10, 6)).signal.status).toBe("crossed"); });
  it("derivation status matches finalized signal status", () => {
    const f = finalizeSignal(sig(25, 4, 1));
    expect(f.derivation.status).toBe("attention");
    expect(f.signal.status).toBe(f.derivation.status);
  });
});

describe("derivation payload: audit-ready, content-free", () => {
  const f = finalizeSignal(sig(60, 10, 6), { provenance_label: "instagram:mar-14-fixture" });
  const d = f.derivation;
  it("carries the required audit fields", () => {
    expect(d.signal_type).toBe("late-night-activity");
    expect(d.observed_value).toBe(60);
    expect(d.unit).toBe("%");
    expect(d.transform_id).toBe("late-night-activity.v1");
    expect(d.transform_version).toBe("1.0.0");
    expect(d.total_items).toBe(10);
    expect(d.night_items).toBe(6);
    expect(d.thresholds_applied).toEqual({ green_cut: 15, yellow_cut: 30, inverted: false });
    expect(d.provenance_label).toBe("instagram:mar-14-fixture");
    expect(d.raw_excluded).toBe(true);
    expect(d.raw_retained).toBe(false);
  });
  it("has exactly the allowed keys (no subject/family ids, no extras)", () => {
    expect(Object.keys(d).sort()).toEqual([
      "night_items","observed_value","provenance_label","raw_excluded","raw_retained",
      "signal_id","signal_type","status","thresholds_applied","total_items","transform_id","transform_version","unit","window_end","window_start",
    ]);
  });
  it("contains no raw content, URLs, handles, or source IDs in any string value", () => {
    const strings = Object.values(d).filter((v): v is string => typeof v === "string");
    for (const s of strings) {
      expect(s).not.toMatch(/https?:\/\//);
      expect(s).not.toMatch(/instagram\.com/);
      expect(s).not.toMatch(/@/);
    }
    expect(d.window_start).toBeDefined();
    expect(d.window_end).toBeDefined();
  });
});
