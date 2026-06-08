import { z } from "zod";
import { Uuid, Iso, Domain } from "../common";

/** Roles (Wiser RBAC, extended toward spec governance participants). `professional` is modeled but disabled in Alpha. */
export const Role = z.enum(["system_admin", "guardian", "child", "professional"]);
export type Role = z.infer<typeof Role>;

export const User = z.object({
  id: Uuid,
  auth_id: z.string(),
  display_name: z.string(),
  date_of_birth: z.string().nullable(),
  created_at: Iso,
});
export type User = z.infer<typeof User>;

export const Family = z.object({
  id: Uuid,
  name: z.string(),
  created_by: Uuid,
  created_at: Iso,
});
export type Family = z.infer<typeof Family>;

export const MembershipStatus = z.enum(["invited", "active", "suspended", "removed"]);

/** Authority lives on the membership edge, not on the user. */
export const Membership = z.object({
  id: Uuid,
  family_id: Uuid,
  user_id: Uuid,
  role: Role,
  status: MembershipStatus,
  created_at: Iso,
});
export type Membership = z.infer<typeof Membership>;

export const RelationshipEdge = z.object({
  id: Uuid,
  family_id: Uuid,
  from_user_id: Uuid,
  to_user_id: Uuid,
  kind: z.enum(["guardian_of", "professional_of"]),
  domain: Domain.nullable(),
  authority_rank: z.number().int().default(0),
  valid_from: Iso,
  valid_to: Iso.nullable(),
});
export type RelationshipEdge = z.infer<typeof RelationshipEdge>;
