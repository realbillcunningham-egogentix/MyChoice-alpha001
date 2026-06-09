# Instagram fixtures — `late-night-activity` (sanitized)

## Source lineage

Derived from the Instagram sub-export **`instagram-<account>-2026-03-14-1JyHbXP3`** inside
`meta-2026-Mar-14-05-52-06-…zip`. The raw archive is kept **outside the repo** in the canonical
GDPR landing zone: `/Users/rocky/Documents/MyChoice/GDPR Data Files`.

Files used to build this fixture:
- `ads_information/ads_and_topics/posts_viewed.json`
- `ads_information/ads_and_topics/videos_watched.json`

## What's here

| File | Origin | Records | % night | Band |
|---|---|---|---|---|
| `late-night-activity.fixture.json` | **real-derived** (Mar-14 sub-export) | 8 (3 posts + 5 videos) | 0% | aligned |
| `scenarios/aligned.json` | synthetic | 10 (1 night / 9 day) | 10% | aligned |
| `scenarios/at-risk.json` | synthetic | 4 (1 night / 3 day) | 25% | at_risk |
| `scenarios/crossed.json` | synthetic | 10 (6 night / 4 day) | 60% | crossed |

The **real** export covers only the `aligned` band (the account had no night-window views among 8
records). The synthetic scenarios provide `aligned` / `at_risk` / `crossed` coverage for tests.

## Sanitization method

`late-night-activity` only needs **when** content was viewed. For each real viewed record we:

1. computed its **America/New_York** local hour,
2. classified it **night** (21:00–06:00) vs **day**,
3. emitted a NEW record carrying **only** a synthetic `timestamp` (Unix epoch **seconds**) at a fixed
   representative night (23:30 ET) or day (14:00 ET) time on a synthetic January-2026 date.

Everything else — handles, URLs, `fbid`s, names, ids, media, content, and the **real dates/times** —
is discarded. Every record is exactly `{ "timestamp": <epoch seconds> }`.

Net effect: the real night/day distribution (and therefore the computed late-night %) is preserved,
while **no real activity time, identity, or content remains**.

## Privacy

- **No raw user data is committed.** Raw exports live only in the external GDPR landing zone.
- `packages/parser/src/fixtures.test.ts` enforces a **privacy guard**: every record must be
  timestamp-only (fails CI if any other field is ever introduced).
- Timestamps are **synthetic** and encode night/day membership only, not real times.

## Regeneration

Re-derive from a fresh export using the same method (classify real local hour → emit a synthetic
night/day timestamp). Never copy raw fields into the repo.
