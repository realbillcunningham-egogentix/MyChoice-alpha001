import { describe, it, expect } from "vitest";
import { parseInstagramExport, type InstagramExport } from "./instagram/parse";
import fixture from "../fixtures/instagram-sample.json";

describe("parseInstagramExport", () => {
  const result = parseInstagramExport(fixture as InstagramExport, new Date("2026-06-08T00:00:00.000Z"));

  it("emits late_night_usage and content_volume signals", () => {
    const types = result.signals.map((s) => s.type).sort();
    expect(types).toEqual(["content_volume", "late_night_usage"]);
  });

  it("marks every signal raw_excluded", () => {
    expect(result.signals.every((s) => s.raw_excluded === true)).toBe(true);
  });

  it("never leaks raw content: output has no account name or event bodies", () => {
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("child_demo");
    expect(serialized).not.toContain("\"events\"");
    expect(result.manifest.raw_retained).toBe(false);
  });
});
