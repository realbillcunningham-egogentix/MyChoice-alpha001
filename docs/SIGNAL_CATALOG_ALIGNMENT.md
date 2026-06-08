# Signal Catalog v0.3 — Alignment with the MyChoice Alpha domain schema

**Status:** Analysis for Sprint 001 planning
**Date:** 2026-06-08
**Source documents:** Signal Catalog v0.3 (`docs/reference/signal-catalog-v0.3.md`), `@mychoice/domain` Signal schema (`packages/domain/src/signal/`), spec §16.

> Signal definitions come **only** from Catalog v0.3. Nothing here invents a signal. Where the schema can't represent a catalog attribute, that is recorded as a gap (§3), not patched over.

## 0. Headline finding

The catalog is a **signal-definition catalog** (display name, category, supported platforms, three-band thresholds, inverted flag, input path, min-data rules). Our `@mychoice/domain` `Signal` is a **signal-instance** record (one measured value with provenance). The two are complementary but the schema is currently **missing the definition layer**. The single most consequential gap: the catalog's green/yellow/red **status banding** and the **inverted** flag have no home in the current schema. Recommendation §3 introduces an additive `SignalDefinition` registry; no breaking change to `Signal`.

A second, smaller finding: **slug drift**. The Sprint-000 parser/seed emitted `late_night_usage` and `content_volume`; the catalog IDs are `late-night-activity` and `content-volume`. Reconcile to the catalog IDs (§3.3).

## 1. Mapping table — Catalog (Live 13) → domain schema

`category` = our governance `SignalCategory` (spec §16). `domain` = our visibility-scoping `Domain`. Verdict: **Exact** (representable today), **Partial** (representable but a catalog attribute is lost), **Gap** (needs a new field, see §3).

| Catalog ID | → `type` (proposed) | Catalog Category | → `category` | `value_type` | `unit` | `domain` | `privacy_class` | Inverted | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| feed-diversity | `feed-diversity` | Feed & Algorithm | content_exposure | scalar | % | social | derived_safe | No | Partial |
| algorithmic-amplification | `algorithmic-amplification` | Feed & Algorithm | content_exposure | scalar | % | social | derived_safe | No | Partial |
| follow-feed-alignment | `follow-feed-alignment` | Feed & Algorithm | social_interaction | scalar | % | social | derived_safe | **Yes** | Gap (inverted) |
| content-volume | `content-volume` | Activity & Time | attention_engagement | scalar | count (items) | wellness | derived_safe | No | Exact |
| video-ratio | `video-ratio` | Content & Creation | content_exposure | scalar | % | social | derived_safe | No | Partial |
| late-night-activity | `late-night-activity` | Activity & Time | attention_engagement | scalar | % | wellness | derived_safe | No | Exact |
| screen-time-distribution | `screen-time-distribution` | Activity & Time | attention_engagement | scalar | % | wellness | derived_safe | No | Partial |
| new-contacts | `new-contacts` | Social & Connections | social_interaction | scalar | count (30d) | social | derived_safe | No | Exact |
| search-behavior | `search-behavior` | Discovery & Interests | content_exposure | scalar | count | social | derived_safe | No | Partial |
| binge-sessions | `binge-sessions` | Activity & Time | attention_engagement | scalar | count (items) | wellness | derived_safe | No | Partial |
| pause-ratio | `pause-ratio` | Activity & Time | wellness | scalar | % (sessions) | wellness | derived_safe | **Yes** | Gap (inverted) |
| rabbit-hole-depth | `rabbit-hole-depth` | Feed & Algorithm | content_exposure | scalar | count (run) | social | derived_safe | No | Partial |
| interest-diversity | `interest-diversity` | Discovery & Interests | content_exposure | scalar | ratio (0-1) | social | derived_safe | **Yes** | Gap (inverted) |

Notes on the mapping:
- **Exact (3):** content-volume, late-night-activity, new-contacts — plain counts/percentages with a category in our enum and no inverted/threshold metadata lost.
- **Partial (7):** representable as a `Signal` value today, but the catalog's three-band thresholds and (for several) the catalog category have no schema home — they currently live only in the catalog/governance layer.
- **Gap — inverted (3):** follow-feed-alignment, pause-ratio, interest-diversity carry “lower = worse” semantics the schema cannot express at all.
- `value` is normalized per the catalog's own unit (percent, count, or ratio); `metadata` can carry the raw numerator/denominator if useful, but never raw content.

### Catalog-category → governance-category coverage

| Catalog Category | Maps cleanly to `SignalCategory`? |
|---|---|
| Activity & Time | Yes → `attention_engagement` (spec §16 lists late-night, compulsive, escalating consumption) |
| Social & Connections | Yes → `social_interaction` |
| Content & Creation | Yes → `content_exposure` |
| Safety | Yes → `safety` |
| **Feed & Algorithm** | **No** — no enum value; mapped to `content_exposure` as best-fit |
| **Discovery & Interests** | **No** — no enum value; mapped to `content_exposure` as best-fit |
| **Engagement** (planned) | Partial → `attention_engagement` |

## 2. (folded into §1) — the mapping table above is deliverable #2.

## 3. Missing schema fields

Catalog attributes with **no representation** in the current `Signal` / `SignalTransform` schema:

| Catalog attribute | In schema today? | Gap |
|---|---|---|
| Display Name | No | Needed for UI; belongs on a definition, not each instance |
| Three-band thresholds (aligned/attention/crossed) | No (only single `threshold` on `SignalTransform`) | **Core gap** — the catalog's status banding can't be stored |
| Inverted flag (lower = worse) | No | **Core gap** — 3 live signals are inverted |
| Catalog Category (Feed & Algorithm, Discovery & Interests, Engagement) | No (enum lacks them) | Either extend enum or keep a separate `catalog_category` |
| Supported platforms (multi: IG/TikTok/YT/FB) | No (instance has single `source_type`) | Needed to know where a signal is valid |
| Data Source in Export (e.g., `contentConsumed.byOwner`) | Partial (`SignalTransform.input_source` is platform-coarse) | Needs the input field path |
| Min-data rules (e.g., ≥5 items + ≥1 byOwner; ≥2 timeline) | Partial (`min_events` only) | Needs richer minimums |
| Tier (1B/2/3) + lifecycle status (Live/Planned/Future/Merged) | No | Registry metadata for roadmap |
| Computed **status** on an instance (aligned/attention/crossed) | No | The catalog's primary output has no field |

**Recommendation (additive, non-breaking):** introduce a `SignalDefinition` registry as the in-code embodiment of the catalog, and add an optional computed `status` to `Signal`.

```ts
// packages/domain/src/signal/definition.ts  (proposed)
export const SignalStatus = z.enum(["aligned", "attention", "crossed", "insufficient_data"]);

export const ThresholdBand = z.object({
  // direction is implied by `inverted`; values are catalog-verbatim
  aligned: z.string(),    // e.g. "<=40" (% ) — keep human-readable + machine params below
  attention: z.string(),  // e.g. "40-60"
  crossed: z.string(),    // e.g. ">60"
});

export const SignalDefinition = z.object({
  id: z.string(),                       // = catalog Signal ID, e.g. "feed-diversity"
  display_name: z.string(),             // "Feed Concentration"
  catalog_category: z.string(),         // "Feed & Algorithm"
  governance_category: SignalCategory,  // mapped (this doc, §1)
  domain: Domain,
  supported_platforms: z.array(z.enum(["instagram","tiktok","youtube","facebook"])),
  value_type: z.enum(["scalar","score","boolean","categorical"]),
  unit: z.string().nullable(),          // "%", "count", "ratio"
  inverted: z.boolean(),                // lower = worse
  thresholds: ThresholdBand,            // catalog-verbatim bands
  data_source_path: z.string(),         // "contentConsumed.byOwner"
  min_data: z.record(z.unknown()),      // { items: 5, byOwner: 1 }
  tier: z.string().nullable(),          // "1B" / "2" / "3" (planned)
  status: z.enum(["live","planned","future","merged","backburner"]),
});

// add to Signal (optional, computed by the engine from the definition):
//   status: SignalStatus.optional()
```

The 13 live definitions would be seeded **verbatim** from Catalog v0.3 (no invention). `Signal.type` then references `SignalDefinition.id`. The governance engine computes `Signal.status` from the definition's bands + `inverted`. This also lets the **catalog bands serve as the default** status, with `AgreementRule` (already in the schema) overriding per family — exactly the spec's agreement-relative interpretation.

### 3.3 Slug reconciliation (action)
Rename the Sprint-000 placeholders to catalog IDs so nothing drifts from the source:
- `late_night_usage` → `late-night-activity`
- `content_volume` → `content-volume`
This touches `packages/parser`, `supabase/seed/seed.sql`, and the seeded `AgreementRule.subject_signal_type`. Small, coordinated; recommend doing it as the first Sprint-001 commit.

## 4. Recommended Alpha signal subset

All 13 live signals are Instagram-feasible (§6). For a focused Sprint-001 that proves the full pipeline (parser → definition-driven status → agreement evaluation → role-scoped views) without over-building, ship these **8**, chosen to (a) span every live category, (b) include all three inverted signals (to exercise inverted logic once), and (c) map directly onto existing simulation recipes for QA.

| Priority | Signal | Why | Data complexity | Recipe coverage |
|---|---|---|---|---|
| 1 | content-volume | Simplest count; baseline | Low (`contentConsumed.total`) | Doomscroller, Algorithm Trap |
| 2 | late-night-activity | Core wellbeing story; spec-aligned | Low (`hourlyDistribution`) | Doomscroller, Night Owl Trend |
| 3 | binge-sessions | Flagship “compulsive” signal | Med (session detection) | Doomscroller, Gradual Binge |
| 4 | pause-ratio (inverted) | Recovery framing; tests inverted logic | Med (session gaps) | Doomscroller, Gradual Binge |
| 5 | feed-diversity | Algorithm story, single-creator share | Med (`byOwner`) | Rabbit Holer, Algorithm Trap |
| 6 | algorithmic-amplification | “Who is choosing your feed?” | Med (byOwner vs following) | Algorithm Trap |
| 7 | interest-diversity (inverted) | Bubble breadth; tests inverted logic | Med (unique/total) | Rabbit Holer |
| 8 | new-contacts | Social signal; simple count | Low (`followedAt` 30d) | (social coverage) |

Deferred from Alpha (still IG-feasible, add if time permits): `screen-time-distribution`, `rabbit-hole-depth`, `video-ratio`, `follow-feed-alignment`, `search-behavior`. Rationale: they add value but each duplicates a category already covered by the 8, and several (video-ratio, follow-feed) carry extra parser/edge-case cost (content-type tagging; ≥5-following minimum).

This subset directly powers four of the catalog's simulation recipes (Doomscroller, Healthy Browser as the all-aligned control, Rabbit Holer, Algorithm Trap) — giving Sprint-001 ready-made QA fixtures.

## 5. This document

Deliverable #5 is this file (`docs/SIGNAL_CATALOG_ALIGNMENT.md`), with Catalog v0.3 recorded as a source document (`docs/reference/signal-catalog-v0.3.md`).

## 6. Signals producible from an Instagram export **alone**

Every one of the 13 live signals lists **IG** among its platforms, and each derives from data an Instagram GDPR export can provide — viewed content with creator + timestamp + type, the following list with `followedAt`, and search counts. So **all 13 live signals are candidate Instagram-only signals.**

| Required export structure (catalog “Data Source”) | Live signals depending on it | In an Instagram export? |
|---|---|---|
| `contentConsumed.total` / `.byOwner` / `.videoCount` + per-item timestamp (→ `contentTimeline`, `hourlyDistribution`) | content-volume, feed-diversity, algorithmic-amplification, video-ratio, late-night, screen-time, binge, pause-ratio, rabbit-hole, interest-diversity | Yes — `posts_viewed` / `videos_watched` (author, timestamp, type) |
| `following.accounts[].followedAt` | new-contacts, algorithmic-amplification, follow-feed-alignment | Yes — `following.json` (timestamped) |
| `searches.total` | search-behavior | Yes — search activity (count; query text discarded per catalog) |

**Feasibility caveat (ties to risk R3):** “IG-feasible” assumes the live Instagram export still exposes per-item creator + timestamp + content-type. This must be confirmed against a **real** Instagram export during Sprint-001 parser work; the parser fixture set should be built from an actual export, not assumed structure.

## 7. Signals that **require** TikTok or YouTube

**None of the 13 live signals require TikTok or YouTube** — the catalog is Instagram-first; other platforms only *broaden* coverage of the same signals. Two separate things genuinely need non-IG ingestion:

1. **Cross-platform consolidation / divergence** — the “moderate on Instagram but high on TikTok” story (catalog recipe *The Cross-Platform Picture*, `ConsolidatedReport`). This is a **reporting feature**, not a per-signal requirement, and is out of scope for the Instagram-first Alpha.
2. **Platform-specific data not in an IG export** — among the *planned* signals, several depend on data an Instagram export may not contain regardless of platform breadth: `engagement-concentration` / `exposure-to-action` (likes/comments), `creator-vs-consumer` / `posting-frequency` (user's own posts), `ad-saturation` (ad impressions), `messaging-intensity` (DM metadata), `comment-sentiment` (comments + NLP). These are deferred for parser/NLP reasons, not because they are TikTok/YouTube-only.

**Bottom line for Alpha:** Instagram export alone is sufficient for the recommended 8-signal subset and, in fact, for all 13 live signals. TikTok/YouTube are a post-Alpha expansion that unlocks the consolidated cross-platform report, not new core signals.
