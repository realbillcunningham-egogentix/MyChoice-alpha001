import { describe, it, expect } from "vitest";
import { lateNightActivityPercent, type TimelineItem } from "./transforms/lateNightActivity";
import { LIVE_SIGNAL_DEFINITION_BY_ID } from "@mychoice/domain";
import canonical from "../fixtures/instagram/late-night-activity.fixture.json";
import aligned from "../fixtures/instagram/scenarios/aligned.json";
import atRisk from "../fixtures/instagram/scenarios/at-risk.json";
import crossed from "../fixtures/instagram/scenarios/crossed.json";

const def = LIVE_SIGNAL_DEFINITION_BY_ID["late-night-activity"]; // green_cut 15, yellow_cut 30
const all: Record<string, Array<Record<string, unknown>>> = { canonical, aligned, atRisk, crossed };

describe("fixture privacy guard: timestamp-only, no PII", () => {
  it("every record across every fixture is exactly { timestamp: number }", () => {
    for (const [name, arr] of Object.entries(all)) {
      for (const rec of arr) {
        expect(Object.keys(rec), name).toEqual(["timestamp"]);
        expect(typeof rec.timestamp, name).toBe("number");
      }
    }
  });
});

describe("late-night-activity band coverage (value vs Catalog v0.3 bands)", () => {
  it("canonical (real-derived) -> 0% -> aligned", () => {
    const p = lateNightActivityPercent(canonical as TimelineItem[])!;
    expect(p).toBe(0);
    expect(p).toBeLessThanOrEqual(def.green_cut);
  });
  it("scenario aligned -> 10% (<= green_cut)", () => {
    const p = lateNightActivityPercent(aligned as TimelineItem[])!;
    expect(p).toBe(10);
    expect(p).toBeLessThanOrEqual(def.green_cut);
  });
  it("scenario at_risk -> 25% (between cuts)", () => {
    const p = lateNightActivityPercent(atRisk as TimelineItem[])!;
    expect(p).toBe(25);
    expect(p).toBeGreaterThan(def.green_cut);
    expect(p).toBeLessThanOrEqual(def.yellow_cut);
  });
  it("scenario crossed -> 60% (> yellow_cut)", () => {
    const p = lateNightActivityPercent(crossed as TimelineItem[])!;
    expect(p).toBe(60);
    expect(p).toBeGreaterThan(def.yellow_cut);
  });
});
