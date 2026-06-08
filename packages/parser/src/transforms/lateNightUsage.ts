import type { SignalTransform } from "@mychoice/domain";

// Slug reconciled to Catalog v0.3 id "late-night-activity" (was "late_night_usage").
// NOTE: the value computation here (minutes) remains the Sprint-000 placeholder. Aligning it to the
// catalog's "% of activity after 9pm" definition is Sprint-001 parser work (out of this hardening scope).
export const lateNightUsageTransform: SignalTransform = {
  id: "late-night-activity.v1",
  version: "1.0.0",
  input_source: "instagram_export",
  output_type: "late-night-activity",
  feature_window: "21:30-07:00 local",
  threshold: null,
  min_events: 1,
  signal_expiration: null,
};

export interface SessionEvent { start: string; end: string }

function isNight(d: Date): boolean { const h = d.getUTCHours() + d.getUTCMinutes() / 60; return h >= 21.5 || h < 7; }

export function lateNightUsageMinutes(sessions: SessionEvent[]): number {
  let mins = 0;
  for (const s of sessions) { const start = new Date(s.start); const end = new Date(s.end); if (isNight(start)) mins += (end.getTime() - start.getTime()) / 60000; }
  return Math.round(mins);
}
