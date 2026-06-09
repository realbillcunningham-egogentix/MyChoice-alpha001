# Instagram GDPR Export — Field Map & Reality Check (Sprint 001, Story 001A)

**Status:** Analysis / mapping only — no parser, schema, or migration changes.
**Source inspected:** `/Users/rocky/Documents/MyChoice/GDPR Data Files` (7 archives).
**Privacy:** every sample below is **sanitized** — real handles, URLs, ids, and timestamps are redacted. No personal content was copied into the repo.

---

## 0. What the archives actually are

The uploads are **not** standalone Instagram exports. They are two kinds of Meta "Download Your Information" archives:

| Archive | Contains Instagram activity? | Notes |
|---|---|---|
| `meta-2026-Mar-14-…zip` | **Yes** — 3 nested Instagram sub-exports (`2026-03-14-1JyHbXP3`, two `2026-03-15-…`) | Richest. Has `posts_viewed`, `videos_watched`, `following`, `profile_searches`. |
| `meta-2026-Apr-16-…zip` | Partial — 1 Instagram sub-export | **No `posts_viewed.json`**; has `videos_watched`, `following`, `stories_viewed`. |
| `meta-2026-Mar-30-…zip` | **No** — Facebook-only nested exports | No `instagram-*` folder. |
| `meta-2026-May-12-…zip` | **No** — Facebook-only nested exports | No `instagram-*` folder. |
| `facebook-…-2026-05-31 / -06-01 / -06-02 .zip` | **No** — Facebook account exports | Out of scope for Instagram signals. |

**Instagram data lives inside the `meta-*` combined archives**, at:
`<archive>/instagram-<account>-<YYYY-MM-DD>-<id>/…`

---

## 1. Relevant export files

### 1.1 `ads_information/ads_and_topics/posts_viewed.json`

- **Purpose:** record of posts surfaced/viewed in the user's Instagram experience.
- **Relevant MyChoice signals:** `content-volume`, `late-night-activity`. *(Not usable for `feed-diversity` / `algorithmic-amplification` — see §3.)*
- **Important field paths:** top-level **array** (no wrapper key). Per element: `timestamp` (top-level), `media` (array, empty in all samples), `label_values[]` (`{label, value}`), `fbid` (opaque string).
- **Timestamp format:** integer **Unix epoch seconds** (UTC), at the element top level.
- **Timezone handling:** epoch is UTC; `late-night-activity` requires conversion to **`America/New_York`** (Alpha decision) before bucketing into the night window.
- **Data quality observations:** `label_values` labels are consistently `["Ad library public URL", "URL", null]` — i.e., the only populated value is an **"Ad library public URL"-style link**. There is **no `Author` / creator field**. Record counts are very low (3–13 per export). `media` is always empty.
- **Known limitations:** no creator identity; `fbid` is a 66-char opaque token (not a handle, not joinable to `following`); the "Ad library" labeling suggests these records skew toward **advertising** impressions rather than organic-feed authorship.
- **Sample record (sanitized):**
  ```json
  [
    {
      "timestamp": 1710000000,
      "media": [],
      "label_values": [
        { "label": "Ad library public URL", "value": null },
        { "label": "URL", "value": "https://www.instagram.com/<redacted>" },
        { "label": null, "value": null }
      ],
      "fbid": "<opaque-66-char-token-redacted>"
    }
  ]
  ```

### 1.2 `ads_information/ads_and_topics/videos_watched.json`

- **Purpose:** record of videos/reels surfaced/watched.
- **Relevant MyChoice signals:** `content-volume`, `late-night-activity` (and `video-ratio`, not in Sprint-001 scope).
- **Important field paths:** identical shape to `posts_viewed.json` (top-level array; `timestamp`, `media:[]`, `label_values`, `fbid`).
- **Timestamp format:** integer Unix epoch seconds (UTC).
- **Timezone handling:** same as above (→ `America/New_York`).
- **Data quality observations:** same `["Ad library public URL","URL",null]` label set; counts 5–14; **no author**.
- **Known limitations:** same as `posts_viewed.json` — no creator identity.
- **Sample record (sanitized):** identical structure to §1.1.

### 1.3 `connections/followers_and_following/following.json`

- **Purpose:** accounts the user follows.
- **Relevant MyChoice signals:** future `algorithmic-amplification`, `follow-feed-alignment`, `new-contacts` (the **following side** only).
- **Important field paths:** `relationships_following[]` → `{ title, string_list_data[] }`; `string_list_data[]` → `{ href, timestamp }`.
- **Timestamp format:** integer Unix epoch seconds (UTC) = followed-at time.
- **Timezone handling:** only relevant for `new-contacts` (recency windows); convert as needed.
- **Data quality observations:** ~111–113 entries. The followed **handle is recoverable** from `title` (short string) and/or the `href` path (`https://www.instagram.com/<handle>`). Note: the usual `string_list_data[].value` field is **absent** in these exports.
- **Known limitations:** handle must be parsed from `title`/`href` rather than read from `value`. Useful only for the *following* side — the *viewed* side has no author to join against.
- **Sample record (sanitized):**
  ```json
  {
    "relationships_following": [
      {
        "title": "<handle-redacted>",
        "string_list_data": [
          { "href": "https://www.instagram.com/<handle-redacted>", "timestamp": 1700000000 }
        ]
      }
    ]
  }
  ```

### 1.4 `logged_information/recent_searches/profile_searches.json`

- **Purpose:** recent profile searches.
- **Relevant MyChoice signals:** future `search-behavior` (not in Sprint-001 scope).
- **Important field paths:** `searches_user[]` → `{ title, string_list_data[]: { href, timestamp } }`.
- **Timestamp format:** Unix epoch seconds (UTC).
- **Data quality observations:** very sparse (1 entry in sample). Query text would be PII — counts only per catalog.
- **Known limitations:** tiny volume; not needed for Sprint 001.

> Also present but **out of Sprint-001 scope:** `your_instagram_activity/story_interactions/stories_viewed.json`, `connections/followers_and_following/followers_1.json`, `logged_information/past_instagram_insights/*`. Catalogued for future signals only.

---

## 2. Signal Coverage Matrix (against the **real** export structure)

| Signal | Coverage | Basis |
|---|---|---|
| `content-volume` | **Supported** | Count of `posts_viewed[]` + `videos_watched[]` records. *(Semantic caveat: records appear ad-skewed; "total content viewed" may not equal organic-feed volume.)* |
| `late-night-activity` | **Supported** | Per-record top-level `timestamp` (epoch UTC) → `America/New_York` → night-window %. Strongest match. |
| `feed-diversity` | **Unsupported** | Requires per-viewed-item **creator/author** (`contentConsumed.byOwner`). Absent — viewed records carry only `timestamp`, opaque `fbid`, and an ad URL. |
| `algorithmic-amplification` | **Unsupported** | Requires viewed-item **author** to cross-reference against `following`. The following list is available, but the **viewed side has no author**, so the join is impossible. |

---

## 3. Catalog Assumptions vs Reality (discrepancies only — catalog **not** modified)

| Signal Catalog v0.3 assumption | Reality in available exports |
|---|---|
| Viewed content exposes creator via `contentConsumed.byOwner` | **No author/creator field** on `posts_viewed` / `videos_watched`. Labels are consistently `["Ad library public URL","URL",null]`; only an opaque `fbid` + URL. |
| `contentConsumed.total` (single source) | Total = **two files** (`posts_viewed` + `videos_watched`) summed; no single total field. |
| `contentConsumed.videoCount` | Approximated by `videos_watched[]` length (separate file). |
| `hourlyDistribution` provided | **Derived**, not provided — must be computed from per-item `timestamp`. |
| `following.accounts[].followedAt` with handle in `value` | `relationships_following[].string_list_data[]` has `{href, timestamp}` but **no `value`**; handle is in `title`/`href`. |
| Classic schema `impressions_history_posts_seen` + `string_map_data.Author` | **Not present.** Real schema is a **flat top-level array** with `label_values`; no `Author` key in any sample. |
| Viewed records represent organic feed | At least partly **ad-associated** ("Ad library public URL"), per the only populated label. |

---

## 4. Data Source Location & Handling (canonical)

- **Raw real exports stay OUTSIDE the repo, only here:** `/Users/rocky/Documents/MyChoice/GDPR Data Files`. This is the canonical landing zone for personal GDPR extracts (now, and the collection point for real-user data later).
- **Real exports must never be committed to git** (ADR-0002 spirit). The repository contains only **sanitized fixtures**.
- **Recommended layout** inside the GDPR folder as volume grows: `<platform>/<account>/<export-date>/` (e.g. `instagram/williamjames/2026-03-14/`), keeping the original `meta-*`/`instagram-*` zip names.
- **Recommended repo guard (not applied in this analysis task):** a `.gitignore` rule blocking `*.zip` and any `gdpr-raw/` path, so a real export can never be committed by accident.

---

## 5. Recommendations

1. **Files to use for Sprint 001:** `posts_viewed.json` + `videos_watched.json` (their top-level `timestamp`s) drive **`late-night-activity`** and **`content-volume`**. `following.json` and `profile_searches.json` are catalogued for future signals only.
2. **Canonical Instagram fixture:** the Instagram sub-export **`instagram-<account>-2026-03-14-1JyHbXP3`** inside **`meta-2026-Mar-14-05-52-06-…zip`** — it is the only available export containing **all four** signal files. Action: derive a **sanitized** fixture from it (redact handles/urls/fbids; shift or bucket timestamps to preserve night/day distribution without exposing exact activity times) and commit that under `packages/parser/fixtures/instagram/`. Do **not** commit the raw export.
3. **Parser changes required before implementation (future work — not done here):**
   - Parse the **flat top-level array** shape (no `impressions_history_*` wrapper).
   - Read the **top-level `timestamp`** (epoch seconds, UTC) and convert to `America/New_York`.
   - `content-volume` = `len(posts_viewed) + len(videos_watched)`.
   - Do **not** attempt `byOwner` — the field does not exist.
   - For `following`, parse the handle from `title`/`href` (not `value`).
   - Handle **missing files gracefully** (e.g., `posts_viewed.json` absent in the Apr-16 export).
4. **Risks discovered (export-format drift):**
   - **Schema drift:** real schema diverges sharply from the catalog's assumed shape (no `Author`, no `string_map_data`, flat array). High R3 risk.
   - **Inter-export variability:** `posts_viewed.json` is present in Mar-14 but **absent** in Apr-16; some `meta-*` archives contain **no Instagram data** at all.
   - **Ad-skew:** the only populated label is an ad-library URL — viewed-content semantics may be advertising-weighted, affecting `content-volume` interpretation.
   - **Low volume:** sample exports have single-digit/low-double-digit viewed records — thin for stable percentages.
   - **Nesting:** Instagram data is buried inside Meta combined archives; ingestion must locate the `instagram-*` subtree.

---

## 6. Success-criteria answers (Story 001A)

- **Which files drive `late-night-activity`:** `posts_viewed.json` + `videos_watched.json` (top-level `timestamp`).
- **Which files drive `content-volume`:** `posts_viewed.json` + `videos_watched.json` (record counts).
- **Which files drive `feed-diversity`:** **none available** — required author field absent.
- **Which files drive `algorithmic-amplification`:** **none available** — viewed-item author absent (cannot join to `following`).
- **Does the Signal Catalog accurately reflect the real export?** **Partially.** Timestamp-based signals (late-night, content-volume) map well; the catalog's creator-based assumptions (`byOwner`) and classic field paths do **not** match reality.

---

## 7. Blockers before parser implementation

1. **feed-diversity & algorithmic-amplification are blocked on data availability.** The current Instagram export exposes **no per-viewed-item author/creator**, so neither signal can be computed as the catalog defines it. Recommended future **Issue #2 (feed-diversity)** and **Issue #3 (algorithmic-amplification)** should be marked **blocked / needs-data** pending either a data source that exposes viewed-content authorship or a catalog/scope revision. *(Do not start them.)*
2. **A sanitized canonical fixture must be produced** from the Mar-14 sub-export before parser work begins (raw PII cannot enter the repo).
3. **`content-volume` semantics need a product decision** given the ad-skew (count all viewed records, or only organic?). Non-blocking for `late-night-activity`.

**Net:** Sprint 001's reduction to a single `late-night-activity` walking skeleton is **validated by the data** — it is the one in-scope signal fully supported by the real exports.
