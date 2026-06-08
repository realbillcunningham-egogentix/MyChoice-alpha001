import type { Role } from "@mychoice/domain";

export type ViewableObject =
  | { kind: "raw_content"; subject_user_id: string }
  | { kind: "signal"; privacy_class: "derived_safe" | "sensitive"; subject_user_id: string }
  | { kind: "agreement" }
  | { kind: "recommendation"; audience: "parent" | "child" | "shared" }
  | { kind: "flag"; subject_user_id: string }
  | { kind: "audit" };

export interface Viewer {
  role: Role;
  user_id: string;
  guardian_of: string[];
}

/**
 * Alpha visibility policy. Defense-in-depth MIRROR of the Postgres RLS policies —
 * RLS is the enforcement of record (ADR-0002). Keep the two in lockstep.
 */
export function canView(viewer: Viewer, obj: ViewableObject): boolean {
  switch (obj.kind) {
    case "raw_content":
      return obj.subject_user_id === viewer.user_id; // guardians NEVER see raw content
    case "signal":
      if (obj.subject_user_id === viewer.user_id) return true;
      if (viewer.role === "guardian" && viewer.guardian_of.includes(obj.subject_user_id))
        return obj.privacy_class === "derived_safe"; // sensitive requires escalation
      return false;
    case "agreement":
      return viewer.role !== "professional";
    case "recommendation":
      if (obj.audience === "parent") return viewer.role === "guardian";
      if (obj.audience === "child") return viewer.role === "child";
      return true;
    case "flag":
      return obj.subject_user_id === viewer.user_id; // guardian path = crisis protocol
    case "audit":
      return viewer.role === "system_admin";
    default:
      return false;
  }
}
