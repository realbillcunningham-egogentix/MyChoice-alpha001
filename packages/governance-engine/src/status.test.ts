import { describe, it, expect } from "vitest";
import { computeSignalStatus, resolveSignalStatus } from "./status";
import { LIVE_SIGNAL_DEFINITION_BY_ID } from "@mychoice/domain";

const def = (id: string) => LIVE_SIGNAL_DEFINITION_BY_ID[id];

describe("computeSignalStatus - NORMAL (higher = worse)", () => {
  const d = def("content-volume"); // green_cut 50, yellow_cut 100
  it("aligned at/below green cut (boundary inclusive)", () => {
    expect(computeSignalStatus(d, 30)).toBe("aligned");
    expect(computeSignalStatus(d, 50)).toBe("aligned");
  });
  it("attention between cuts (boundary inclusive)", () => {
    expect(computeSignalStatus(d, 75)).toBe("attention");
    expect(computeSignalStatus(d, 100)).toBe("attention");
  });
  it("crossed above yellow cut", () => {
    expect(computeSignalStatus(d, 150)).toBe("crossed");
  });
});

describe("computeSignalStatus - INVERTED (lower = worse)", () => {
  const p = def("pause-ratio"); // inverted, green_cut 40, yellow_cut 20
  it("aligned at/above green cut", () => {
    expect(computeSignalStatus(p, 60)).toBe("aligned");
    expect(computeSignalStatus(p, 40)).toBe("aligned");
  });
  it("attention between cuts", () => {
    expect(computeSignalStatus(p, 30)).toBe("attention");
    expect(computeSignalStatus(p, 20)).toBe("attention");
  });
  it("crossed below yellow cut", () => {
    expect(computeSignalStatus(p, 10)).toBe("crossed");
  });

  const div = def("interest-diversity"); // inverted, green 0.30, yellow 0.15
  it("ratio-based inverted signal", () => {
    expect(computeSignalStatus(div, 0.35)).toBe("aligned");
    expect(computeSignalStatus(div, 0.20)).toBe("attention");
    expect(computeSignalStatus(div, 0.10)).toBe("crossed");
  });
});

describe("insufficient_data + agreement override", () => {
  it("null value -> insufficient_data", () => {
    expect(computeSignalStatus(def("content-volume"), null)).toBe("insufficient_data");
  });
  it("AgreementRule override replaces default bands; default unchanged", () => {
    const d = def("content-volume"); // default green 50
    expect(resolveSignalStatus(d, 30, { green_cut: 20, yellow_cut: 40 })).toBe("attention");
    expect(resolveSignalStatus(d, 30)).toBe("aligned");
  });
});

describe("all 13 live definitions classify without throwing", () => {
  it("smoke", () => {
    for (const id of Object.keys(LIVE_SIGNAL_DEFINITION_BY_ID)) {
      const s = computeSignalStatus(def(id), 1);
      expect(["aligned", "attention", "crossed", "insufficient_data"]).toContain(s);
    }
  });
});
