import { describe, it, expect } from "vitest";
import { composeLateNightStory } from "./compose";
import type { AgreementRule } from "@mychoice/domain";
import type { TimelineItem } from "@mychoice/parser";

// Representative sanitized epochs (seconds): NIGHT = 23:00 ET, DAY = 14:00 ET (matches the committed
// instagram fixtures; fixture->value lineage is proven in the packages/parser fixtures/parse tests).
const NIGHT = 1767760200;
const DAY = 1767726000;
const items = (nNight: number, nDay: number): TimelineItem[] =>
  [...Array(nNight)].map((_, i) => ({ timestamp: NIGHT + i })).concat([...Array(nDay)].map((_, i) => ({ timestamp: DAY + i })));

const ctx = { family_id: "fa000000-0000-0000-0000-000000000001", subject_user_id: "22222222-2222-2222-2222-222222222222" };
const rule: AgreementRule = { id: "0c000000-0000-0000-0000-000000000002", subject_signal_type: "late-night-activity", subject_category: null, bands: { green_cut: 15, yellow_cut: 30, inverted: false }, window: null, weight: 1, on_breach_intervention_level: 3, visibility_action: "prompt_discussion" };
const story = (its: TimelineItem[]) => composeLateNightStory(its, ctx, { rule, provenance_label: "instagram:mar-14-fixture" })!;

describe("composeLateNightStory full story", () => {
  it("Fixture A / canonical-equivalent -> 0% aligned/aligned + audit", () => {
    const s = story(items(0, 8));
    expect(s.observation.value).toBe(0);
    expect(s.signal_status).toBe("aligned");
    expect(s.agreement_interpretation).toBe("aligned");
    expect(s.audit.signal_type).toBe("late-night-activity");
    expect(s.audit.status).toBe("aligned");
  });
  it("Fixture B / at-risk -> 25% attention/at_risk + audit", () => {
    const s = story(items(1, 3));
    expect(s.observation.value).toBe(25);
    expect(s.signal_status).toBe("attention");
    expect(s.agreement_interpretation).toBe("at_risk");
    expect(s.audit.thresholds_applied).toEqual({ green_cut: 15, yellow_cut: 30, inverted: false });
  });
  it("crossed -> 60% crossed/breached", () => {
    const s = story(items(6, 4));
    expect(s.observation.value).toBe(60);
    expect(s.signal_status).toBe("crossed");
    expect(s.agreement_interpretation).toBe("breached");
  });
  it("aligned scenario -> 10% aligned/aligned", () => {
    const s = story(items(1, 9));
    expect(s.observation.value).toBe(10);
    expect(s.signal_status).toBe("aligned");
    expect(s.agreement_interpretation).toBe("aligned");
  });

  it("explanation has distinct parent and child variants with value + label", () => {
    const s = story(items(1, 3));
    expect(s.explanation.parent).not.toBe(s.explanation.child);
    for (const t of [s.explanation.parent, s.explanation.child]) {
      expect(t).toContain("25%");
      expect(t).toContain("At Risk");
    }
    expect(story(items(1, 3)).explanation.parent).toBe(s.explanation.parent); // deterministic
  });

  it("no raw content enters the output", () => {
    const blob = JSON.stringify(story(items(6, 4)));
    expect(blob).not.toMatch(/https?:\/\//);
    expect(blob).not.toMatch(/instagram\.com/);
    expect(blob).not.toMatch(/@/);
    expect(blob).not.toMatch(/fbid/);
  });
  it("observation exposes only the allowed fields", () => {
    expect(Object.keys(story(items(0, 8)).observation).sort()).toEqual([
      "night_items", "provenance_label", "signal_type", "timezone", "total_items", "unit", "value", "window_end", "window_start",
    ]);
  });

  it("empty input -> null (insufficient data)", () => {
    expect(composeLateNightStory([], ctx, { rule })).toBeNull();
  });
  it("no rule -> agreement_interpretation null, status still present", () => {
    const s = composeLateNightStory(items(0, 8), ctx)!;
    expect(s.agreement_interpretation).toBeNull();
    expect(s.signal_status).toBe("aligned");
  });
});
