import { describe, it, expect } from "vitest";
import { evaluateAgreement } from "./evaluate";
import type { Signal, Agreement, AgreementVersion } from "@mychoice/domain";

const sig = (value: number): Signal => ({
  id: "00000000-0000-0000-0000-000000000010", family_id: "fa000000-0000-0000-0000-000000000001",
  subject_user_id: "22222222-2222-2222-2222-222222222222", category: "attention_engagement", type: "late-night-activity",
  value, value_type: "scalar", unit: "%", window_start: "2026-06-01T00:00:00.000Z", window_end: "2026-06-07T00:00:00.000Z",
  confidence: 0.9, source_type: "instagram_export", ingest_run_id: null, transform_id: "late-night-activity.v1", transform_version: "1.0.0",
  privacy_class: "derived_safe", domain: "wellness", raw_excluded: true, raw_exclusion_note: null, composite_of: null,
  created_at: "2026-06-08T00:00:00.000Z", expires_at: null, metadata: {},
});
const agreement: Agreement = { id: "0a000000-0000-0000-0000-000000000001", family_id: "fa000000-0000-0000-0000-000000000001", title: "Weekday sleep", description: null, category: "wellbeing", status: "active", current_version_id: "0b000000-0000-0000-0000-000000000001", participants: [], created_by: "11111111-1111-1111-1111-111111111111", created_at: "2026-06-01T00:00:00.000Z", effective_at: "2026-06-01T00:00:00.000Z", review_at: null, expires_at: null };
const bandedVersion: AgreementVersion = {
  id: "0b000000-0000-0000-0000-000000000001", agreement_id: agreement.id, version_no: 2, human_text: "late-night-activity banded",
  rules: [{ id: "0c000000-0000-0000-0000-000000000002", subject_signal_type: "late-night-activity", subject_category: null,
    bands: { green_cut: 15, yellow_cut: 30, inverted: false }, window: null, weight: 1, on_breach_intervention_level: 3, visibility_action: "prompt_discussion" }],
  success_criteria: [], autonomy_criteria: [], escalation_rules: [], created_by: agreement.created_by, created_at: "2026-06-01T00:00:00.000Z", supersedes_version_id: null,
};

describe("banded AgreementRule -> three interpretation bands", () => {
  it("10% -> aligned", () => { const r = evaluateAgreement([sig(10)], agreement, bandedVersion); expect(r.state).toBe("aligned"); expect(r.per_rule[0].state).toBe("aligned"); });
  it("22% -> at_risk", () => { const r = evaluateAgreement([sig(22)], agreement, bandedVersion); expect(r.state).toBe("at_risk"); expect(r.per_rule[0].state).toBe("at_risk"); expect(r.per_rule[0].recommended_intervention_level).toBeNull(); });
  it("45% -> breached", () => { const r = evaluateAgreement([sig(45)], agreement, bandedVersion); expect(r.state).toBe("breached"); expect(r.per_rule[0].recommended_intervention_level).toBe(3); });
  it("no matching signal -> insufficient_data", () => { const r = evaluateAgreement([], agreement, bandedVersion); expect(r.state).toBe("insufficient_data"); });
  it("boundary: 15% aligned, 30% at_risk", () => {
    expect(evaluateAgreement([sig(15)], agreement, bandedVersion).state).toBe("aligned");
    expect(evaluateAgreement([sig(30)], agreement, bandedVersion).state).toBe("at_risk");
  });
});
