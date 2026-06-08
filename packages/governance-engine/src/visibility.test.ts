import { describe, it, expect } from "vitest";
import { canView } from "./visibility";

describe("canView (alpha visibility policy)", () => {
  const guardian = { role: "guardian" as const, user_id: "p1", guardian_of: ["c1"] };

  it("guardian CANNOT view raw content of their child", () => {
    expect(canView(guardian, { kind: "raw_content", subject_user_id: "c1", processing_window_active: true })).toBe(false);
  });

  it("child can view own raw content ONLY during the processing window", () => {
    const child = { role: "child" as const, user_id: "c1", guardian_of: [] };
    expect(canView(child, { kind: "raw_content", subject_user_id: "c1", processing_window_active: true })).toBe(true);
    expect(canView(child, { kind: "raw_content", subject_user_id: "c1", processing_window_active: false })).toBe(false);
  });

  it("guardian sees derived_safe but not sensitive signals", () => {
    expect(canView(guardian, { kind: "signal", privacy_class: "derived_safe", subject_user_id: "c1" })).toBe(true);
    expect(canView(guardian, { kind: "signal", privacy_class: "sensitive", subject_user_id: "c1" })).toBe(false);
  });

  it("pilot_operator sees audit metadata but not signals or agreements", () => {
    const op = { role: "pilot_operator" as const, user_id: "o1", guardian_of: [] };
    expect(canView(op, { kind: "audit" })).toBe(true);
    expect(canView(op, { kind: "agreement" })).toBe(false);
    expect(canView(op, { kind: "signal", privacy_class: "derived_safe", subject_user_id: "c1" })).toBe(false);
  });
});
