import { describe, it, expect } from "vitest";
import { evaluateAgreement } from "./evaluate";
import type { Signal, Agreement, AgreementVersion } from "@mychoice/domain";

const sig = (over: Partial<Signal>): Signal => ({
  id: "00000000-0000-0000-0000-000000000001",
  family_id: "fa000000-0000-0000-0000-000000000001",
  subject_user_id: "ch000000-0000-0000-0000-000000000001",
  category: "attention_engagement",
  type: "late_night_usage",
  value: 45,
  value_type: "scalar",
  unit: "minutes",
  window_start: "2026-06-01T00:00:00.000Z",
  window_end: "2026-06-07T00:00:00.000Z",
  confidence: 0.9,
  source_type: "instagram_export",
  ingest_run_id: null,
  transform_id: "late_night_usage.v1",
  transform_version: "1.0.0",
  privacy_class: "derived_safe",
  domain: "wellness",
  raw_excluded: true,
  raw_exclusion_note: null,
  composite_of: null,
  created_at: "2026-06-08T00:00:00.000Z",
  expires_at: null,
  metadata: {},
  ...over,
});

const agreement: Agreement = {
  id: "ag000000-0000-0000-0000-000000000001",
  family_id: "fa000000-0000-0000-0000-000000000001",
  title: "Weekday sleep",
  description: null,
  category: "wellbeing",
  status: "active",
  current_version_id: "av000000-0000-0000-0000-000000000001",
  participants: [],
  created_by: "pa000000-0000-0000-0000-000000000001",
  created_at: "2026-06-01T00:00:00.000Z",
  effective_at: "2026-06-01T00:00:00.000Z",
  review_at: null,
  expires_at: null,
};

const version: AgreementVersion = {
  id: "av000000-0000-0000-0000-000000000001",
  agreement_id: agreement.id,
  version_no: 1,
  human_text: "No more than 30 minutes of late-night usage on weeknights",
  rules: [
    {
      id: "ru000000-0000-0000-0000-000000000001",
      subject_signal_type: "late_night_usage",
      subject_category: null,
      operator: "lte",
      params: { threshold: 30 },
      window: "weekday 21:30-07:00 local",
      weight: 1,
      on_breach_intervention_level: 3,
      visibility_action: "prompt_discussion",
    },
  ],
  success_criteria: [],
  autonomy_criteria: [],
  escalation_rules: [],
  created_by: agreement.created_by,
  created_at: "2026-06-01T00:00:00.000Z",
  supersedes_version_id: null,
};

describe("evaluateAgreement", () => {
  it("flags a breach when observed exceeds the threshold", () => {
    const res = evaluateAgreement([sig({ value: 45 })], agreement, version);
    expect(res.state).toBe("breached");
    expect(res.per_rule[0].recommended_intervention_level).toBe(3);
    expect(res.alignment_score).toBe(0);
  });

  it("is aligned when observed is within the threshold", () => {
    const res = evaluateAgreement([sig({ value: 20 })], agreement, version);
    expect(res.state).toBe("aligned");
    expect(res.alignment_score).toBe(100);
  });

  it("reports insufficient_data when no matching signal exists", () => {
    const res = evaluateAgreement([sig({ type: "content_volume" })], agreement, version);
    expect(res.state).toBe("insufficient_data");
  });
});
