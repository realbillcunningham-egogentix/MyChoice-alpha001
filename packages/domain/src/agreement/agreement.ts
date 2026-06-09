import { z } from "zod";
import { Uuid, Iso } from "../common";
import { SignalCategory } from "../signal/signal";

export const AgreementCategory = z.enum(["technology_usage","educational","wellbeing","communication","safety","autonomy"]);
export const AgreementStatus = z.enum(["draft","proposed","active","suspended","archived","superseded"]);
export const RuleOperator = z.enum(["lt","lte","gt","gte","between","eq","trend_increase","trend_decrease","within_window"]);

// Three-band interpretation thresholds (mirror the SignalDefinition band shape).
// NORMAL  (inverted=false): aligned v<=green_cut; at_risk green_cut<v<=yellow_cut; breached v>yellow_cut.
// INVERTED (inverted=true):  aligned v>=green_cut; at_risk yellow_cut<=v<green_cut; breached v<yellow_cut.
export const RuleBands = z.object({
  green_cut: z.number(),
  yellow_cut: z.number(),
  inverted: z.boolean().default(false),
});
export type RuleBands = z.infer<typeof RuleBands>;

// A rule expresses EITHER legacy binary criteria (operator+params -> aligned|breached)
// OR three-band thresholds (bands -> aligned|at_risk|breached). `bands` takes precedence.
// Backward compatible: existing rules carry operator+params and are unaffected.
export const AgreementRule = z.object({
  id: Uuid,
  subject_signal_type: z.string().nullable(),
  subject_category: SignalCategory.nullable(),
  operator: RuleOperator.optional(),
  params: z.record(z.unknown()).optional(),
  bands: RuleBands.optional(),
  window: z.string().nullable(),
  weight: z.number().default(1),
  on_breach_intervention_level: z.number().int().min(1).max(6),
  visibility_action: z.enum(["none","notify_subject","prompt_discussion","notify_guardian"]),
}).refine((r) => !!r.bands || (!!r.operator && !!r.params), {
  message: "AgreementRule requires either `bands` or `operator`+`params`",
});
export type AgreementRule = z.infer<typeof AgreementRule>;

export const AgreementParticipant = z.object({
  user_id: Uuid,
  role_in_agreement: z.enum(["proposer","signer","observer"]),
  consent_state: z.enum(["pending","accepted","declined","withdrawn"]),
  signed_at: Iso.nullable(),
});
export type AgreementParticipant = z.infer<typeof AgreementParticipant>;

export const AgreementVersion = z.object({
  id: Uuid, agreement_id: Uuid, version_no: z.number().int(), human_text: z.string(),
  rules: z.array(AgreementRule),
  success_criteria: z.array(z.record(z.unknown())).default([]),
  autonomy_criteria: z.array(z.record(z.unknown())).default([]),
  escalation_rules: z.array(z.record(z.unknown())).default([]),
  created_by: Uuid, created_at: Iso, supersedes_version_id: Uuid.nullable(),
});
export type AgreementVersion = z.infer<typeof AgreementVersion>;

export const Agreement = z.object({
  id: Uuid, family_id: Uuid, title: z.string(), description: z.string().nullable(), category: AgreementCategory,
  status: AgreementStatus, current_version_id: Uuid.nullable(), participants: z.array(AgreementParticipant),
  created_by: Uuid, created_at: Iso, effective_at: Iso.nullable(), review_at: Iso.nullable(), expires_at: Iso.nullable(),
});
export type Agreement = z.infer<typeof Agreement>;

export const AlignmentState = z.enum(["aligned","at_risk","breached","insufficient_data"]);
export type AlignmentState = z.infer<typeof AlignmentState>;
