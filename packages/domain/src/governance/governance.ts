import { z } from "zod";
import { Uuid, Iso } from "../common";

/** Verifiable parental consent + grant records (COPPA/GDPR). */
export const Consent = z.object({
  id: Uuid,
  family_id: Uuid,
  subject_user_id: Uuid,
  granted_by_user_id: Uuid,
  kind: z.enum(["parental_consent", "data_processing", "professional_access"]),
  state: z.enum(["pending", "granted", "revoked"]),
  granted_at: Iso.nullable(),
  revoked_at: Iso.nullable(),
  expires_at: Iso.nullable(),
});
export type Consent = z.infer<typeof Consent>;

/** Child-raised \"Something Feels Weird?\" flag. Routes to the crisis protocol. */
export const Flag = z.object({
  id: Uuid,
  family_id: Uuid,
  subject_user_id: Uuid,
  reason: z.enum(["uncomfortable", "contact", "content", "other"]).default("other"),
  note: z.string().nullable(),
  status: z.enum(["open", "acknowledged", "escalated", "resolved"]).default("open"),
  created_at: Iso,
});
export type Flag = z.infer<typeof Flag>;

/** Family lifecycle status (ADR-0005). */
export const FamilyStatus = z.enum(["active", "exit_requested", "frozen", "deleted"]);
export type FamilyStatus = z.infer<typeof FamilyStatus>;

/** Content-free receipt retained after deletion (ADR-0005). Counts only, never content. */
export const DeletionReceipt = z.object({
  id: Uuid,
  family_id: Uuid,
  requested_by: Uuid.nullable(),
  scope: z.enum(["family_exit", "child_majority"]),
  derived_export_provided: z.boolean(),
  raw_artifacts_deleted: z.boolean(),
  records_deleted: z.record(z.number()),
  created_at: Iso,
});
export type DeletionReceipt = z.infer<typeof DeletionReceipt>;

/** Decisions and disclosures — NEVER content. */
export const AuditEvent = z.object({
  id: Uuid,
  family_id: Uuid.nullable(),
  actor_user_id: Uuid.nullable(),
  action: z.string(),
  object_type: z.string(),
  object_id: z.string().nullable(),
  decision: z.string().nullable(),
  created_at: Iso,
  metadata: z.record(z.unknown()).default({}),
});
export type AuditEvent = z.infer<typeof AuditEvent>;
