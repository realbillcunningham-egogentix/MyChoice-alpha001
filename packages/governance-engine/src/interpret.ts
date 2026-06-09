import type { SignalDefinition, AgreementRule, SignalStatus, AlignmentState } from "@mychoice/domain";
import { computeSignalStatus } from "./status";
import { classifyAgreementRule } from "./evaluate";

/**
 * Keeps the three layers explicitly separate (sprint-001 planning patch):
 *   layer 1  signal_status            - objective band from the SignalDefinition
 *   layer 2  agreement_interpretation - family rule judgment (null when no rule applies)
 *   layer 3  explanation              - user-facing narrative (FUTURE; not implemented)
 *
 * It composes, but never collapses, the layers: each retains its own vocabulary
 * (layer 1 uses `attention`; layer 2 uses `at_risk`).
 */
export interface LayeredInterpretation {
  signal_status: SignalStatus;
  agreement_interpretation: AlignmentState | null;
  explanation: null;
}

export function interpretSignal(def: SignalDefinition, value: number | null, rule?: AgreementRule): LayeredInterpretation {
  const signal_status = computeSignalStatus(def, value);
  let agreement_interpretation: AlignmentState | null = null;
  if (rule) agreement_interpretation = value === null ? "insufficient_data" : classifyAgreementRule(value, rule);
  return { signal_status, agreement_interpretation, explanation: null };
}
