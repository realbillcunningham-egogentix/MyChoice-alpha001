import type { Signal } from "@mychoice/domain";
import { randomUUID } from "node:crypto";
import { lateNightUsageMinutes, lateNightUsageTransform, type SessionEvent } from "../transforms/lateNightUsage";

export interface InstagramExport { account: string; subject_user_id: string; family_id: string; events: { type: string; start: string; end: string }[]; }
export interface RawExclusionManifest { transform_ids: string[]; raw_event_count: number; raw_retained: false; note: string; }
export interface ParseResult { signals: Signal[]; manifest: RawExclusionManifest; }

/**
 * Deterministic parse: Instagram export -> derived Signal[]. Raw events are read in memory and never
 * returned or persisted (ADR-0002). Signal `type` uses Catalog v0.3 ids.
 */
export function parseInstagramExport(exp: InstagramExport, now: Date = new Date()): ParseResult {
  const sessions: SessionEvent[] = exp.events.filter((e) => e.type === "session").map((e) => ({ start: e.start, end: e.end }));
  const window_start = sessions.length ? sessions[0].start : now.toISOString();
  const window_end = sessions.length ? sessions[sessions.length - 1].end : now.toISOString();
  const signals: Signal[] = [];
  if (sessions.length >= (lateNightUsageTransform.min_events ?? 0)) {
    signals.push({ id: randomUUID(), family_id: exp.family_id, subject_user_id: exp.subject_user_id, category: "attention_engagement", type: "late-night-activity", value: lateNightUsageMinutes(sessions), value_type: "scalar", unit: "minutes", window_start, window_end, confidence: 0.9, source_type: "instagram_export", ingest_run_id: null, transform_id: lateNightUsageTransform.id, transform_version: lateNightUsageTransform.version, privacy_class: "derived_safe", domain: "wellness", raw_excluded: true, raw_exclusion_note: "derived from session intervals; raw events not persisted", composite_of: null, created_at: now.toISOString(), expires_at: null, metadata: {} });
    signals.push({ id: randomUUID(), family_id: exp.family_id, subject_user_id: exp.subject_user_id, category: "content_exposure", type: "content-volume", value: sessions.length, value_type: "scalar", unit: "count", window_start, window_end, confidence: 0.8, source_type: "instagram_export", ingest_run_id: null, transform_id: "content-volume.v1", transform_version: "1.0.0", privacy_class: "derived_safe", domain: "wellness", raw_excluded: true, raw_exclusion_note: "count only; no content retained", composite_of: null, created_at: now.toISOString(), expires_at: null, metadata: {} });
  }
  return { signals, manifest: { transform_ids: [lateNightUsageTransform.id, "content-volume.v1"], raw_event_count: exp.events.length, raw_retained: false, note: "Raw export parsed in-memory; only derived signals returned." } };
}
