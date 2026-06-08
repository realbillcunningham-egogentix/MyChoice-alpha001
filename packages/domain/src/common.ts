import { z } from "zod";

export const Uuid = z.string().uuid();
export const Iso = z.string().datetime();

/** Visibility scoping domains (spec §7 relationship-graph domains). */
export const Domain = z.enum(["wellness", "social", "educational", "safety", "personal"]);
export type Domain = z.infer<typeof Domain>;

export const PrivacyClass = z.enum(["derived_safe", "sensitive"]);
export type PrivacyClass = z.infer<typeof PrivacyClass>;
