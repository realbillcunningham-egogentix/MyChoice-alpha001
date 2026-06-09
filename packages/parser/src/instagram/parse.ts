import type { Signal } from "@mychoice/domain";
import { randomUUID } from "node:crypto";
import { ALPHA_TIMEZONE, lateNightActivityBreakdown, type TimelineItem } from "../transforms/lateNightActivity";

export const LATE_NIGHT_TRANSFORM_ID = "late-night-activity.v1";
export const LATE_NIGHT_TRANSFORM_VERSION = "1.0.0";

export interface IngestContext {
  family_id: string;
  subject_user_id: string;
  ingest_run_id?: string | null;
  timezone?: string;
  now?: Date;
}

export interface RawExclusionManifest { transform_ids: string[]; raw_event_count: number; raw_retained: false; note: string }
export interface ParseResult { signals: Signal[]; manifest: RawExclusionManifest }

const toMs = (t: number | string) => (typeof t === "number" ? t * 1000 : Date.parse(t));

/**
 * Build the late-night-activity signal from sanitized Instagram viewed-content items
 * (posts_viewed + videos_watched), each carrying only a timestamp (epoch seconds, UTC).
 * Raw items are read in-memory; only the derived signal is returned (ADR-0002).
 *
 * `status` is intentionally LEFT UNSET here: layer-1 status computation belongs to the
 * engine/persist stage (next increment), per the three-layer separation.
 */
export function parseInstagramLateNight(items: TimelineItem[], ctx: IngestContext): ParseResult {
  const tz = ctx.timezone ?? ALPHA_TIMEZONE;
  const now = ctx.now ?? new Date();
  const { total, night, percent } = lateNightActivityBreakdown(items, tz);

  const signals: Signal[] = [];
  if (percent !== null) {
    const ms = items.map((i) => toMs(i.timestamp)).sort((a, b) => a - b);
    signals.push({
      id: randomUUID(),
      family_id: ctx.family_id,
      subject_user_id: ctx.subject_user_id,
      category: "attention_engagement",
      type: "late-night-activity",
      value: percent,
      value_type: "scalar",
      unit: "%",
      window_start: new Date(ms[0]).toISOString(),
      window_end: new Date(ms[ms.length - 1]).toISOString(),
      confidence: 0.9,
      source_type: "instagram_export",
      ingest_run_id: ctx.ingest_run_id ?? null,
      transform_id: LATE_NIGHT_TRANSFORM_ID,
      transform_version: LATE_NIGHT_TRANSFORM_VERSION,
      privacy_class: "derived_safe",
      domain: "wellness",
      raw_excluded: true,
      raw_exclusion_note: "derived from viewed-item timestamps; raw items not persisted",
      composite_of: null,
      created_at: now.toISOString(),
      expires_at: null,
      // auditability: counts + provenance only, never content (SignalDerivationRecord precursor)
      metadata: { timezone: tz, total_items: total, night_items: night, transform_id: LATE_NIGHT_TRANSFORM_ID, transform_version: LATE_NIGHT_TRANSFORM_VERSION },
    });
  }
  return {
    signals,
    manifest: {
      transform_ids: [LATE_NIGHT_TRANSFORM_ID],
      raw_event_count: total,
      raw_retained: false,
      note: "Sanitized viewed-item timestamps parsed in-memory; only the derived signal is returned.",
    },
  };
}
