import { describe, it, expect } from "vitest";
import { parseInstagramLateNight, LATE_NIGHT_TRANSFORM_ID } from "./instagram/parse";
import type { TimelineItem } from "./transforms/lateNightActivity";
import { LIVE_SIGNAL_DEFINITION_BY_ID } from "@mychoice/domain";
import canonical from "../fixtures/instagram/late-night-activity.fixture.json";
import aligned from "../fixtures/instagram/scenarios/aligned.json";
import atRisk from "../fixtures/instagram/scenarios/at-risk.json";
import crossed from "../fixtures/instagram/scenarios/crossed.json";

const def = LIVE_SIGNAL_DEFINITION_BY_ID["late-night-activity"];
const ctx = { family_id: "fa000000-0000-0000-0000-000000000001", subject_user_id: "22222222-2222-2222-2222-222222222222" };
const run = (items: unknown) => parseInstagramLateNight(items as TimelineItem[], ctx);

describe("parseInstagramLateNight -> catalog-accurate late-night-activity signal", () => {
  it("emits a single signal with correct catalog metadata", () => {
    const s = run(canonical).signals[0];
    expect(s.type).toBe("late-night-activity");
    expect(s.unit).toBe("%");
    expect(s.value_type).toBe("scalar");
    expect(s.category).toBe("attention_engagement");
    expect(s.domain).toBe("wellness");
    expect(s.transform_id).toBe(LATE_NIGHT_TRANSFORM_ID);
    expect(s.transform_version).toBe("1.0.0");
    expect(s.source_type).toBe("instagram_export");
    expect(s.raw_excluded).toBe(true);
    expect(s.status).toBeUndefined(); // status left for the next increment
  });

  it("canonical (real-derived) -> 0% (aligned band)", () => {
    const s = run(canonical).signals[0];
    expect(s.value).toBe(0);
    expect(s.value).toBeLessThanOrEqual(def.green_cut);
    expect(s.metadata).toMatchObject({ total_items: 8, night_items: 0, timezone: "America/New_York" });
  });
  it("aligned scenario -> 10%", () => { expect(run(aligned).signals[0].value).toBe(10); });
  it("at_risk scenario -> 25% (between cuts)", () => {
    const v = run(atRisk).signals[0].value;
    expect(v).toBe(25);
    expect(v).toBeGreaterThan(def.green_cut);
    expect(v).toBeLessThanOrEqual(def.yellow_cut);
  });
  it("crossed scenario -> 60% (> yellow_cut)", () => {
    const v = run(crossed).signals[0].value;
    expect(v).toBe(60);
    expect(v).toBeGreaterThan(def.yellow_cut);
  });

  it("empty input -> no signal, raw not retained", () => {
    const r = run([]);
    expect(r.signals).toHaveLength(0);
    expect(r.manifest.raw_retained).toBe(false);
  });
  it("never carries content: metadata has only counts/provenance", () => {
    const s = run(crossed).signals[0];
    expect(Object.keys(s.metadata).sort()).toEqual(["night_items", "timezone", "total_items", "transform_id", "transform_version"]);
  });
});
