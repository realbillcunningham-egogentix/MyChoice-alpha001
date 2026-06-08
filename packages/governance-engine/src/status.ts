import type { SignalDefinition, SignalStatus } from "@mychoice/domain";

/** Default status from the SignalDefinition bands (Catalog v0.3). Handles normal + inverted. */
export function computeSignalStatus(def: SignalDefinition, value: number | null): SignalStatus {
  return classify(value, def.green_cut, def.yellow_cut, def.inverted);
}

export interface BandOverride {
  green_cut: number;
  yellow_cut: number;
  inverted?: boolean;
}

/**
 * Status with an optional AgreementRule override (ADR-0003). Default bands come from the
 * SignalDefinition; a family AgreementRule may override via params { green_cut, yellow_cut, inverted? }.
 */
export function resolveSignalStatus(
  def: SignalDefinition,
  value: number | null,
  override?: BandOverride,
): SignalStatus {
  if (override) return classify(value, override.green_cut, override.yellow_cut, override.inverted ?? def.inverted);
  return computeSignalStatus(def, value);
}

function classify(value: number | null, green: number, yellow: number, inverted: boolean): SignalStatus {
  if (value === null || Number.isNaN(value)) return "insufficient_data";
  if (!inverted) {
    if (value <= green) return "aligned";
    if (value <= yellow) return "attention";
    return "crossed";
  }
  if (value >= green) return "aligned";
  if (value >= yellow) return "attention";
  return "crossed";
}
