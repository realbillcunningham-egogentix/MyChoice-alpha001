import type { Signal, Agreement, AgreementVersion, AgreementRule, AlignmentState } from "@mychoice/domain";

export interface RuleResult {
  rule_id: string;
  state: AlignmentState;
  observed: number | null;
  recommended_intervention_level: number | null;
}

export interface AgreementAlignmentResult {
  agreement_id: string;
  state: AlignmentState;
  per_rule: RuleResult[];
  alignment_score: number | null;
}

function latestObserved(signals: Signal[], rule: AgreementRule): number | null {
  const matches = signals.filter(
    (s) =>
      (rule.subject_signal_type ? s.type === rule.subject_signal_type : true) &&
      (rule.subject_category ? s.category === rule.subject_category : true),
  );
  if (matches.length === 0) return null;
  const latest = [...matches].sort((a, b) => (a.window_end < b.window_end ? 1 : -1))[0];
  return latest.value;
}

function satisfies(observed: number, rule: AgreementRule): boolean {
  const p = rule.params as Record<string, number>;
  switch (rule.operator) {
    case "lt": return observed < p.threshold;
    case "lte": return observed <= p.threshold;
    case "gt": return observed > p.threshold;
    case "gte": return observed >= p.threshold;
    case "eq": return observed === p.threshold;
    case "between": return observed >= p.min && observed <= p.max;
    // trend_* / within_window need signal history; treated as aligned in the alpha stub.
    default: return true;
  }
}

/**
 * Pure, side-effect-free agreement evaluation (ADR-0003). Powers agreement-relative
 * interpretation: two families, same activity, different verdicts.
 */
export function evaluateAgreement(
  signals: Signal[],
  agreement: Agreement,
  version: AgreementVersion,
): AgreementAlignmentResult {
  const per_rule: RuleResult[] = version.rules.map((rule) => {
    const observed = latestObserved(signals, rule);
    if (observed === null) {
      return { rule_id: rule.id, state: "insufficient_data", observed: null, recommended_intervention_level: null };
    }
    const ok = satisfies(observed, rule);
    return {
      rule_id: rule.id,
      state: ok ? "aligned" : "breached",
      observed,
      recommended_intervention_level: ok ? null : rule.on_breach_intervention_level,
    };
  });

  const evaluated = per_rule.filter((r) => r.state !== "insufficient_data");
  const state: AlignmentState =
    evaluated.length === 0
      ? "insufficient_data"
      : evaluated.some((r) => r.state === "breached")
        ? "breached"
        : "aligned";

  const alignment_score =
    evaluated.length === 0
      ? null
      : Math.round((evaluated.filter((r) => r.state === "aligned").length / evaluated.length) * 100);

  return { agreement_id: agreement.id, state, per_rule, alignment_score };
}
