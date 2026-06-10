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
  it("primary card is the real late-night-activity signal", () => {
    const m = buildDigitalLandscapePreview(storyOf(1, 3)); // 25%
    expect(m.primary.availability).toBe("available");
    expect(m.primary.value).toBe(25);
    expect(m.headline.tone).toBe("watch");
  });
  it("other signals carry NO value/status (not analyzed)", () => {
    const m = buildDigitalLandscapePreview(storyOf(0, 8));
    expect(m.others.length).toBeGreaterThan(0);
    expect(m.others.every((o) => o.value === undefined && o.availability !== "available")).toBe(true);
    expect(m.others.find((o) => o.id === "feed-diversity")!.availability).toBe("blocked");
    expect(m.others.find((o) => o.id === "algorithmic-amplification")!.availability).toBe("blocked");
    expect(m.others.find((o) => o.id === "content-volume")!.availability).toBe("coming_soon");
  });
});

describe("renderDigitalLandscapePreviewHtml", () => {
  const html = renderDigitalLandscapePreviewHtml(buildDigitalLandscapePreview(storyOf(1, 3)));
  it("is a static HTML document with the real value + headline", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("Late-night activity");
    expect(html).toContain("25%");
    expect(html).toContain("Worth a look");
  });
  it("includes parent and child copy and a How we got this section", () => {
    expect(html).toContain("For you");
    expect(html).toContain("For your child");
    expect(html).toContain("How we got this");
  });
  it("marks unavailable signals clearly and does not imply analysis", () => {
    expect(html).toContain("Coming soon");
    expect(html).toContain("Blocked");
    expect(html).toContain("Not yet available");
    expect(html).toContain("not analyzed yet");
    expect(html).toContain("Not analyzed yet");
  });
  it("contains no raw content (urls/handles/source ids)", () => {
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/instagram\.com/);
    expect(html).not.toMatch(/fbid/);
  });
  it("has no <script> (static, no framework)", () => {
    expect(html).not.toContain("<script");
  });
});
