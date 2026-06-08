import type { Role } from "@mychoice/domain";

export type ViewableObject =
  | { kind: "raw_content"; subject_user_id: string; processing_window_active: boolean }
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
      // Alpha does NOT persist raw social content after parsing. The only raw access is the child
      // viewing THEIR OWN uploaded source files during the active processing window (ADR-0002 v1.1).
      return obj.subject_user_id === viewer.user_id && obj.processing_window_active;
    case "signal":
      if (obj.subject_user_id === viewer.user_id) return true;
      if (viewer.role === "guardian" && viewer.guardian_of.includes(obj.subject_user_id))
        return obj.privacy_class === "derived_safe"; // sensitive requires escalation
      return false;
    case "agreement":
      return viewer.role === "guardian" || viewer.role === "child";
    case "recommendation":
      if (obj.audience === "parent") return viewer.role === "guardian";
      if (obj.audience === "child") return viewer.role === "child";
      return true;
    case "flag":
      return obj.subject_user_id === viewer.user_id; // guardian path = crisis protocol
    case "audit":
      return viewer.role === "pilot_operator"; // audit METADATA only; no content access
    default:
      return false;
  }
}
