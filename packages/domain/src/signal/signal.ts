import { z } from "zod";
import { Uuid, Iso, Domain, PrivacyClass } from "../common";

export const SignalCategory = z.enum([
  "attention_engagement",
  "social_interaction",
  "content_exposure",
  "emotional_behavioral",
  "wellness",
  "safety",
  "growth_development",
  "composite",
]);
export type SignalCategory = z.infer<typeof SignalCategory>;

/**
 * A derived, privacy-safe indicator. Raw content is NEVER a Signal and never
 * sits next to one. `raw_excluded` is a hard invariant (ADR-0002).
 */
export const Signal = z.object({
  id: Uuid,
  family_id: Uuid,
  subject_user_id: Uuid,
  category: SignalCategory,
  type: z.string(),
  value: z.number(),
  value_type: z.enum(["scalar", "score", "boolean", "categorical"]),
  unit: z.string().nullable(),
  window_start: Iso,
  window_end: Iso,
  confidence: z.number().min(0).max(1),
  source_type: z.enum(["gdpr_export", "instagram_export", "device", "questionnaire", "derived"]),
  ingest_run_id: Uuid.nullable(),
  transform_id: z.string().nullable(),
  transform_version: z.string().nullable(),
  privacy_class: PrivacyClass,
  domain: Domain,
  raw_excluded: z.literal(true),
  raw_exclusion_note: z.string().nullable(),
  composite_of: z.array(Uuid).nullable(),
  created_at: Iso,
  expires_at: Iso.nullable(),
  metadata: z.record(z.unknown()).default({}),
});
export type Signal = z.infer<typeof Signal>;
