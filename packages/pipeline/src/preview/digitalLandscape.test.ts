import { describe, it, expect } from "vitest";
import { buildDigitalLandscapePreview, renderDigitalLandscapePreviewHtml } from "./digitalLandscape";
import { composeLateNightStory } from "../compose";
import type { AgreementRule } from "@mychoice/domain";
import type { TimelineItem } from "@mychoice/parser";

const NIGHT = 1767760200, DAY = 1767726000;
const items = (n: number, d: number): TimelineItem[] =>
  [...Array(n)].map((_, i) => ({ timestamp: NIGHT + i })).concat([...Array(d)].map((_, i) => ({ timestamp: DAY + i })));
const ctx = { family_id: "fa000000-0000-0000-0000-000000000001", subject_user_id: "22222222-2222-2222-2222-222222222222" };
const rule: AgreementRule = { id: "0c000000-0000-0000-0000-000000000002", subject_signal_type: "late-night-activity", subject_category: null, bands: { green_cut: 15, yellow_cut: 30, inverted: false }, window: null, weight: 1, on_breach_intervention_level: 3, visibility_action: "prompt_discussion" };
const storyOf = (n: number, d: number) => composeLateNightStory(items(n, d), ctx, { rule, provenance_label: "instagram:mar-14-fixture" })!;

describe("buildDigitalLandscapePreview", () => {
  it("primary is real; signal_status and agreement are separate", () => {
    const m = buildDigitalLandscapePreview(storyOf(1, 3)); // 25%
    expect(m.available).toBe(true);
    expect(m.primary.value).toBe(25);
    expect(m.signal_status!.label).toBe("Worth a look");
    expect(m.agreement!.label).toBe("Drifting from your agreement");
    expect(m.audit!.timezone).toBe("America/New_York");
  });
  it("others carry no value/status", () => {
    const m = buildDigitalLandscapePreview(storyOf(0, 8));
    expect(m.others.every((o) => o.value === undefined && o.availability !== "available")).toBe(true);
    expect(m.others.find((o) => o.id === "feed-diversity")!.availability).toBe("blocked");
  });
  it("null story -> no-data model", () => {
    const m = buildDigitalLandscapePreview(null);
    expect(m.available).toBe(false);
    expect(m.primary.value).toBeUndefined();
    expect(m.signal_status).toBeNull();
    expect(m.agreement).toBeNull();
    expect(m.audit).toBeNull();
  });
});

describe("renderDigitalLandscapePreviewHtml (with data)", () => {
  const html = renderDigitalLandscapePreviewHtml(buildDigitalLandscapePreview(storyOf(1, 3)));
  it("shows BOTH the reading and the agreement separately", () => {
    expect(html).toContain("Reading");
    expect(html).toContain("Worth a look");
    expect(html).toContain("Your agreement");
    expect(html).toContain("Drifting from your agreement");
  });
  it("surfaces the timezone", () => { expect(html).toContain("America/New_York"); });
  it("uses softened wording (no 'Blocked' label)", () => {
    expect(html).not.toContain("Blocked");
    expect(html).toContain("Not in your export");
  });
  it("includes parent/child copy + how-we-got-this; no raw content; no script", () => {
    expect(html).toContain("For you");
    expect(html).toContain("For your child");
    expect(html).toContain("How we got this");
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/instagram\.com/);
    expect(html).not.toMatch(/fbid/);
    expect(html).not.toContain("<script");
  });
});

describe("renderDigitalLandscapePreviewHtml (no data)", () => {
  const html = renderDigitalLandscapePreviewHtml(buildDigitalLandscapePreview(null));
  it("renders an empty state without fabricated results", () => {
    expect(html).toContain("Not enough data yet");
    expect(html).not.toContain("How we got this");
    expect(html).toContain("Coming next");
  });
});
