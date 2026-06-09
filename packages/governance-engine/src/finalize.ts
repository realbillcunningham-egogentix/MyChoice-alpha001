import type { Signal, SignalStatus } from "@mychoice/domain";
import { LIVE_SIGNAL_DEFINITION_BY_ID } from "@mychoice/domain";
import { computeSignalStatus } from "./status";

/** Audit-ready, content-free derivation record payload (precursor to a stored SignalDerivationRecord).
 *  Contains aggregates + provenance only: no raw content, URLs, handles, source IDs, or per-event times. */
export interface SignalDerivationRecordPayload {
  signal_id: string;
  signal_type: string;
  observed_value: number;
  unit: string | null;
  status: SignalStatus;
  provenance_label: string;
  transform_id: string | null;
  transform_version: string | null;
  total_items: number | null;
  night_items: number | null;
  thresholds_applied: { green_cut: number; yellow_cut: number; inverted: boolean } | null;
  window_start: string; // aggregate window (provenance), not a per-event time
  window_end: string;
  raw_excluded: true;
  raw_retained: false;
}

export interface FinalizedSignal {
  signal: Signal; // with layer-1 status assigned
  derivation: SignalDerivationRecordPayload;
}

const num = (v: unknown): number | null => (typeof v === "number" ? v : null);

/**
 * Pure. Takes a parser-emitted Signal, assigns layer-1 `status` from its SignalDefinition,
 * and returns the finalized Signal + an audit-ready derivation payload. No I/O, no persistence.
 * Layer-2 agreement interpretation stays separate (see interpretSignal). If the signal's type has
 * no registered definition, status falls back to `insufficient_data` and thresholds are null.
 */
export function finalizeSignal(signal: Signal, opts?: { provenance_label?: string }): FinalizedSignal {
  const def = LIVE_SIGNAL_DEFINITION_BY_ID[signal.type];
  const status: SignalStatus = def ? computeSignalStatus(def, signal.value) : "insufficient_data";
  const md = (signal.metadata ?? {}) as Record<string, unknown>;
  const derivation: SignalDerivationRecordPayload = {
    signal_id: signal.id,
    signal_type: signal.type,
    observed_value: signal.value,
    unit: signal.unit,
    status,
    provenance_label: opts?.provenance_label ?? signal.source_type,
    transform_id: signal.transform_id,
    transform_version: signal.transform_version,
    total_items: num(md.total_items),
    night_items: num(md.night_items),
    thresholds_applied: def ? { green_cut: def.green_cut, yellow_cut: def.yellow_cut, inverted: def.inverted } : null,
    window_start: signal.window_start,
    window_end: signal.window_end,
    raw_excluded: true,
    raw_retained: false,
  };
  return { signal: { ...signal, status }, derivation };
}
