import { describe, it, expect } from "vitest";
import { interpretSignal } from "./interpret";
import { LIVE_SIGNAL_DEFINITION_BY_ID } from "@mychoice/domain";
import type { AgreementRule } from "@mychoice/domain";

const def = LIVE_SIGNAL_DEFINITION_BY_ID["late-night-activity"]; // bands 15/30, normal
const rule: AgreementRule = { id: "0c000000-0000-0000-0000-000000000002", subject_signal_type: "late-night-activity", subject_category: null,
  bands: { green_cut: 15, yellow_cut: 30, inverted: false }, window: null, weight: 1, on_breach_intervention_level: 3, visibility_action: "prompt_discussion" };

describe("interpretSignal keeps the three layers separate", () => {
  it("22% -> layer1 attention, layer2 at_risk, layer3 null (distinct vocabularies)", () => {
    const r = interpretSignal(def, 22, rule);
    expect(r.signal_status).toBe("attention");
    expect(r.agreement_interpretation).toBe("at_risk");
    expect(r.explanation).toBeNull();
    expect(r.signal_status as string).not.toBe(r.agreement_interpretation as string);
  });
  it("10% -> aligned / aligned", () => { const r = interpretSignal(def, 10, rule); expect(r.signal_status).toBe("aligned"); expect(r.agreement_interpretation).toBe("aligned"); });
  it("45% -> crossed / breached", () => { const r = interpretSignal(def, 45, rule); expect(r.signal_status).toBe("crossed"); expect(r.agreement_interpretation).toBe("breached"); });
  it("null -> insufficient_data on both layers", () => { const r = interpretSignal(def, null, rule); expect(r.signal_status).toBe("insufficient_data"); expect(r.agreement_interpretation).toBe("insufficient_data"); });
  it("no rule -> agreement_interpretation null, signal_status still computed", () => { const r = interpretSignal(def, 22); expect(r.agreement_interpretation).toBeNull(); expect(r.signal_status).toBe("attention"); });
});
