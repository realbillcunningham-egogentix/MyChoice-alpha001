import type { AgreementRule, AlignmentState, SignalStatus } from "@mychoice/domain";
import { LIVE_SIGNAL_DEFINITION_BY_ID } from "@mychoice/domain";
import { parseInstagramLateNight, type IngestContext } from "@mychoice/parser";
import type { TimelineItem } from "@mychoice/parser";
import { finalizeSignal, interpretSignal, type SignalDerivationRecordPayload } from "@mychoice/governance-engine";

/** 1. Signal observation (raw-free). */
export interface LateNightObservation {
  signal_type: string;
  value: number;
  unit: string | null;
  window_start: string;
  window_end: string;
  total_items: number | null;
  night_items: number | null;
  provenance_label: string;
}
/** 5. User-facing explanation placeholder (deterministic copy; not AI). */
export interface UserFacingExplanation { parent: string; child: string }

/** The complete late-night-activity story, with each layer kept explicitly separate. */
export interface LateNightStory {
  observation: LateNightObservation;               // 1
  signal_status: SignalStatus;                     // 2 (layer 1)
  agreement_interpretation: AlignmentState | null; // 3 (layer 2)
  audit: SignalDerivationRecordPayload;            // 4
  explanation: UserFacingExplanation;              // 5 (layer 3 placeholder)
}

export interface ComposeOptions { rule?: AgreementRule; provenance_label?: string }

function userLabel(state: SignalStatus | AlignmentState): string {
  switch (state) {
    case "aligned": return "Aligned";
    case "attention": case "at_risk": return "At Risk";
    case "crossed": case "breached": return "Crossed";
    default: return "Not enough data";
  }
}

/**
 * Pure walking-skeleton composer: parseInstagramLateNight -> finalizeSignal -> interpretSignal.
 * Returns the full late-night-activity story, or null when there are no items (insufficient data).
 * No I/O, no persistence, late-night-activity only. Lives above parser + engine so both stay clean.
 */
export function composeLateNightStory(items: TimelineItem[], ctx: IngestContext, opts: ComposeOptions = {}): LateNightStory | null {
  const { signals } = parseInstagramLateNight(items, ctx);
  if (signals.length === 0) return null;

  const { signal, derivation } = finalizeSignal(signals[0], { provenance_label: opts.provenance_label });
  const def = LIVE_SIGNAL_DEFINITION_BY_ID[signal.type];
  const layered = interpretSignal(def, signal.value, opts.rule);
  const md = (signal.metadata ?? {}) as Record<string, unknown>;
  const stateForCopy = layered.agreement_interpretation ?? layered.signal_status;
  const label = userLabel(stateForCopy);

  return {
    observation: {
      signal_type: signal.type,
      value: signal.value,
      unit: signal.unit,
      window_start: signal.window_start,
      window_end: signal.window_end,
      total_items: typeof md.total_items === "number" ? md.total_items : null,
      night_items: typeof md.night_items === "number" ? md.night_items : null,
      provenance_label: derivation.provenance_label,
    },
    signal_status: layered.signal_status,
    agreement_interpretation: layered.agreement_interpretation,
    audit: derivation,
    explanation: {
      parent: `Late-night activity is ${signal.value}% this period — ${label}. A check-in about evening wind-down may help.`,
      child: `Your late-night activity is ${signal.value}% this period — ${label}. A wind-down routine could help your morning goals.`,
    },
  };
}
