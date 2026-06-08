import { z } from "zod";

/** Registered derived-signal transform metadata (spec §16). The only sanctioned raw -> signal path. */
export const SignalTransform = z.object({
  id: z.string(),
  version: z.string(),
  input_source: z.enum(["instagram_export", "gdpr_export", "device", "signal"]),
  output_type: z.string(),
  feature_window: z.string(),
  threshold: z.number().nullable(),
  min_events: z.number().int().default(0),
  signal_expiration: z.string().nullable(),
});
export type SignalTransform = z.infer<typeof SignalTransform>;
