import type { SignalTransform } from "@mychoice/domain";

export const lateNightUsageTransform: SignalTransform = {
  id: "late_night_usage.v1",
  version: "1.0.0",
  input_source: "instagram_export",
  output_type: "late_night_usage",
  feature_window: "21:30-07:00 local",
  threshold: null,
  min_events: 1,
  signal_expiration: null,
};

export interface SessionEvent { start: string; end: string }

function isNight(d: Date): boolean {
  const h = d.getUTCHours() + d.getUTCMinutes() / 60;
  return h >= 21.5 || h < 7;
}

/** Minutes of usage whose session begins inside the night window. */
export function lateNightUsageMinutes(sessions: SessionEvent[]): number {
  let mins = 0;
  for (const s of sessions) {
    const start = new Date(s.start);
    const end = new Date(s.end);
    if (isNight(start)) mins += (end.getTime() - start.getTime()) / 60000;
  }
  return Math.round(mins);
}
