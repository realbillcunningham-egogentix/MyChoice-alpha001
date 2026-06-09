// late-night-activity (Catalog v0.3): % of viewed content items whose LOCAL-time hour is in the
// night window. Bands: aligned <=15, attention 15-30, crossed >30. Data source: hourlyDistribution
// hours (21-23, 0-5) = 21:00-06:00 local. Alpha timezone = America/New_York (see sprint-001 plan).
//
// This replaces the Sprint-000 placeholder (minutes) for late-night accuracy (Issue #1). parse.ts is
// rewired to emit this in a later Sprint-001 increment, once the normalized-item shape is fixed against
// the real Instagram export fixture.
export const ALPHA_TIMEZONE = "America/New_York";

// Catalog "(21-23, 0-5)" => 9pm through 5:59am local.
const NIGHT_HOURS = new Set([21, 22, 23, 0, 1, 2, 3, 4, 5]);

export interface TimelineItem {
  timestamp: string; // ISO 8601, UTC
}

/** Local hour (0-23) of a UTC timestamp in the given IANA timezone (DST-aware via Intl). */
export function localHour(isoUtc: string, timeZone: string = ALPHA_TIMEZONE): number {
  const formatted = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hour12: false }).format(new Date(isoUtc));
  return parseInt(formatted, 10) % 24; // some engines render midnight as "24"
}

/**
 * late-night-activity value as a whole-number percent, or null when there are no items
 * (-> insufficient_data upstream). Pure; no I/O; no raw content retained.
 */
export function lateNightActivityPercent(items: TimelineItem[], timeZone: string = ALPHA_TIMEZONE): number | null {
  if (items.length === 0) return null;
  const night = items.filter((i) => NIGHT_HOURS.has(localHour(i.timestamp, timeZone))).length;
  return Math.round((night / items.length) * 100);
}
