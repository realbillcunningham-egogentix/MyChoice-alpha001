import type { Signal, Domain } from "@mychoice/domain";

export interface ContextRequest {
  consumer: string; // "parent_dashboard" | "ai_mediate" | future external consumer
  purpose: string;  // "parent_weekly_check_in" | "healthcare_consultation" ...
  domain: Domain;
  subject_user_id: string;
}

export interface CompiledProjection {
  authorized_fields: string[];
  denied_fields: string[];
  derived_signals: Signal[];
  obligations: string[];
  audit_ref: string;
}

/**
 * EGOGENTIX SEAM (ADR-0004). Alpha implementation = a thin, role-scoped projection over
 * already-RLS-filtered signals. Field names intentionally anticipate the spec's Compiled
 * Context Object (§9) so the future Context Compiler is an internal swap, not a rewrite.
 *
 * INVARIANT: only derived_safe, raw-excluded signals leave this function.
 */
export function compileContext(
  req: ContextRequest,
  candidateSignals: Signal[],
  auditRef: string,
): CompiledProjection {
  const derived_signals = candidateSignals.filter(
    (s) =>
      s.subject_user_id === req.subject_user_id &&
      s.domain === req.domain &&
      s.privacy_class === "derived_safe" &&
      s.raw_excluded === true,
  );
  const obligations = ["no_diagnosis"];
  if (req.consumer === "ai_mediate") obligations.push("human_review_required_for_governance_changes");
  return {
    authorized_fields: ["category", "type", "value", "window_start", "window_end", "confidence"],
    denied_fields: ["raw_content"],
    derived_signals,
    obligations,
    audit_ref: auditRef,
  };
}
