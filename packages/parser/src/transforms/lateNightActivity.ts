// late-night-activity (Catalog v0.3): % of viewed content items whose LOCAL-time hour is in the
// night window. Bands: aligned <=15, attention 15-30, crossed >30. Data source: hourlyDistribution
// hours (21-23, 0-5) = 21:00-06:00 local. Alpha timezone = America/New_York (see sprint-001 plan).
export const ALPHA_TIMEZONE = "America/New_York";

// Catalog "(21-23, 0-5)" => 9pm through 5:59am local.
const NIGHT_HOURS = new Set([21, 22, 23, 0, 1, 2, 3, 4, 5]);

// Instagram exports use integer Unix epoch SECONDS; Sprint-000 synthetic fixtures used ISO strings.
// Accept both so the transform reads the real export shape directly (Story 001A field map).
export interface TimelineItem {
  timestamp: number | string;
}

/** Local hour (0-23) of a timestamp in the given IANA timezone (DST-aware via Intl).
 *  A number is interpreted as Unix epoch SECONDS (Instagram convention); a string as ISO 8601. */
export function localHour(ts: number | string, timeZone: string = ALPHA_TIMEZONE): number {
  const date = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return parseInt(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hour12: false }).format(date), 10) % 24;
}

export interface LateNightBreakdown {
  total: number;
  night: number;
  percent: number | null;
}

/** Exact night/total breakdown + percent (null when no items). Single source of truth for the
 *  signal value and the audit counts. */
export function lateNightActivityBreakdown(items: TimelineItem[], timeZone: string = ALPHA_TIMEZONE): LateNightBreakdown {
  const total = items.length;
  if (total === 0) return { total: 0, night: 0, percent: null };
  const night = items.filter((i) => NIGHT_HOURS.has(localHour(i.timestamp, timeZone))).length;
  return { total, night, percent: Math.round((night / total) * 100) };
}

/**
 * late-night-activity value as a whole-number percent, or null when there are no items
 * (-> insufficient_data upstream). Pure; no I/O; no raw content retained.
 */
export function lateNightActivityPercent(items: TimelineItem[], timeZone: string = ALPHA_TIMEZONE): number | null {
  return lateNightActivityBreakdown(items, timeZone).percent;
}
