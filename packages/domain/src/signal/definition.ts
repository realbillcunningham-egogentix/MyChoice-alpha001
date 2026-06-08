import { z } from "zod";
import { Domain } from "../common";
import { SignalCategory } from "./signal";

export const Platform = z.enum(["instagram", "tiktok", "youtube", "facebook"]);
export type Platform = z.infer<typeof Platform>;

export const SignalLifecycle = z.enum(["live", "planned", "future", "merged", "backburner"]);
export type SignalLifecycle = z.infer<typeof SignalLifecycle>;

/**
 * In-code embodiment of Signal Catalog v0.3 (see docs/reference/signal-catalog-v0.3.md).
 * Default status bands live here; an AgreementRule may override per family (ADR-0003).
 *
 * Threshold semantics:
 *   NORMAL  (inverted=false, higher=worse): aligned v<=green_cut; attention green_cut<v<=yellow_cut; crossed v>yellow_cut.
 *   INVERTED (inverted=true,  lower=worse):  aligned v>=green_cut; attention yellow_cut<=v<green_cut; crossed v<yellow_cut.
 */
export const SignalDefinition = z.object({
  id: z.string(),                       // = catalog Signal ID, e.g. "feed-diversity"
  display_name: z.string(),
  catalog_category: z.string(),         // catalog's taxonomy, e.g. "Feed & Algorithm"
  governance_category: SignalCategory,  // mapped to spec §16 taxonomy
  domain: Domain,
  supported_platforms: z.array(Platform).nonempty(),
  value_type: z.enum(["scalar", "score", "boolean", "categorical"]),
  unit: z.string().nullable(),
  inverted: z.boolean(),
  green_cut: z.number(),
  yellow_cut: z.number(),
  band_labels: z.object({ aligned: z.string(), attention: z.string(), crossed: z.string() }),
  data_source_path: z.string(),         // catalog "Data Source in Export"
  min_data: z.record(z.number()).default({}),
  tier: z.string().nullable(),
  lifecycle: SignalLifecycle,
});
export type SignalDefinition = z.infer<typeof SignalDefinition>;
