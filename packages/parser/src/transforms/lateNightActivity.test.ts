import { describe, it, expect } from "vitest";
import { lateNightActivityPercent, localHour, ALPHA_TIMEZONE, type TimelineItem } from "./lateNightActivity";
import { LIVE_SIGNAL_DEFINITION_BY_ID } from "@mychoice/domain";

// Catalog thresholds for the signal under test (no engine import; banding logic is tested in the engine).
const def = LIVE_SIGNAL_DEFINITION_BY_ID["late-night-activity"]; // green_cut 15, yellow_cut 30, normal
const NIGHT = "2026-01-15T03:00:00.000Z"; // EST: 22:00 NY (night)
const DAY = "2026-01-15T18:00:00.000Z";   // EST: 13:00 NY (day)
const items = (nNight: number, nDay: number): TimelineItem[] => [
  ...Array(nNight).fill({ timestamp: NIGHT }),
  ...Array(nDay).fill({ timestamp: DAY }),
];

describe("localHour (America/New_York, DST-aware)", () => {
  it("winter EST (UTC-5)", () => { expect(localHour(NIGHT)).toBe(22); expect(localHour(DAY)).toBe(13); });
  it("summer EDT (UTC-4)", () => {
    expect(localHour("2026-07-15T01:00:00.000Z")).toBe(21);
    expect(localHour("2026-07-15T17:00:00.000Z")).toBe(13);
  });
});

describe("lateNightActivityPercent (value matches Catalog v0.3 bands)", () => {
  it("Fixture A -> 10% -> below green_cut (Aligned)", () => {
    const pct = lateNightActivityPercent(items(1, 9))!;
    expect(pct).toBe(10);
    expect(pct).toBeLessThanOrEqual(def.green_cut);
  });
  it("Fixture B -> 25% -> between cuts (At Risk / attention)", () => {
    const pct = lateNightActivityPercent(items(1, 3))!;
    expect(pct).toBe(25);
    expect(pct).toBeGreaterThan(def.green_cut);
    expect(pct).toBeLessThanOrEqual(def.yellow_cut);
  });
  it("60% -> above yellow_cut (Crossed)", () => {
    const pct = lateNightActivityPercent(items(6, 4))!;
    expect(pct).toBe(60);
    expect(pct).toBeGreaterThan(def.yellow_cut);
  });
  it("no items -> null (insufficient_data upstream)", () => {
    expect(lateNightActivityPercent([])).toBeNull();
  });
  it("uses the Alpha timezone constant", () => { expect(ALPHA_TIMEZONE).toBe("America/New_York"); });
});
