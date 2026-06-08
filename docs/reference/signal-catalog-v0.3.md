# Signal Catalog v0.3 (source document)

> Captured verbatim from `MyChoice-Signal-Reference-RnD.xlsx` (provided 2026-06-08). This is a **source document** — signal definitions are authoritative and must not be invented or altered here. Engineering aligns to this; see `docs/SIGNAL_CATALOG_ALIGNMENT.md`.

## Live Signals (13)

| # | Signal ID | Display Name | Category | Platforms | Aligned (green) | Attention (yellow) | Crossed (red) | Inverted? | Data Source in Export |
|---|---|---|---|---|---|---|---|---|---|
| 1 | feed-diversity | Feed Concentration | Feed & Algorithm | IG, TikTok, YT | Top creator ≤40% of views | 40-60% | >60% | No | contentConsumed.byOwner (sorted by count) |
| 2 | algorithmic-amplification | Algorithm Influence | Feed & Algorithm | IG, TikTok, YT | ≤30% from unfollowed | 30-50% | >50% | No | contentConsumed.byOwner vs following.accounts |
| 3 | follow-feed-alignment | Follow-to-Feed Gap | Feed & Algorithm | IG, TikTok | ≥50% of followed appear | 25-50% | <25% | YES (lower = worse) | following.accounts vs contentConsumed.byOwner |
| 4 | content-volume | Content Volume | Activity & Time | IG, TikTok, YT, FB | ≤50 items | 50-100 items | >100 items | No | contentConsumed.total |
| 5 | video-ratio | Short-Form Video | Content & Creation | IG, TikTok, YT, FB | ≤70% video | 70-90% | >90% | No | contentConsumed.videoCount / total |
| 6 | late-night-activity | Late-Night Activity | Activity & Time | IG, TikTok, YT | ≤15% after 9pm | 15-30% | >30% | No | hourlyDistribution (21-23, 0-5) |
| 7 | screen-time-distribution | Screen-Time Distribution | Activity & Time | IG, TikTok, YT | <60% in one period | 60-80% | >80% | No | hourlyDistribution → periodDistribution |
| 8 | new-contacts | New Contacts | Social & Connections | IG, TikTok | ≤5 new in 30 days | 5-15 new | >15 new | No | following.accounts[].followedAt (recent 30 days) |
| 9 | search-behavior | Search Activity | Discovery & Interests | IG, TikTok, YT, FB | ≤5 searches | 5-20 searches | >20 searches | No | searches.total (query text discarded) |
| 10 | binge-sessions | Compulsive Consumption | Activity & Time | IG, TikTok, YT | Longest session ≤30 items | 30-50 items | >50 items | No | contentTimeline[] (ordered timestamps) |
| 11 | pause-ratio | Recovery Gaps | Activity & Time | IG, TikTok, YT | ≥40% sessions have breaks | 20-40% | <20% | YES (lower = worse) | contentTimeline[] (gaps within sessions) |
| 12 | rabbit-hole-depth | Rabbit-Hole Depth | Feed & Algorithm | IG, TikTok, YT | Max run ≤5 same-creator | 5-10 consecutive | >10 consecutive | No | contentTimeline[].owner (consecutive runs) |
| 13 | interest-diversity | Interest Diversity | Discovery & Interests | IG, TikTok, YT, FB | Ratio ≥0.30 | 0.15-0.30 | <0.15 | YES (lower = worse) | contentTimeline unique owners / total items |

## Planned & Future (17)

| # | Signal ID | Display Name | Category | Tier | Platforms | Status | Dependencies |
|---|---|---|---|---|---|---|---|
| 14 | search-vs-served | Search vs Served | Discovery | 1B | IG, TT, YT | Planned | Needs query-text retention (currently discarded) |
| 15 | creator-vs-consumer | Creator vs Consumer | Content | 1B | IG, TT | Planned | Needs parser extension to extract user posts |
| 16 | engagement-concentration | Engagement Concentration | Engagement | 1B | IG, TT, YT | Planned | Needs likes/comments data |
| 17 | follower-ratio | Follower Ratio | Social | 3 | IG, TT | Backburner | Low signal value alone |
| 18 | weak-tie-contact | Weak-Tie Contact | Social | 2 | IG, FB | Planned | Needs followedAt dates |
| 19 | posting-frequency | Posting Frequency | Content | 2 | IG, TT | Planned | Needs user post data |
| 20 | overnight-carryover | Overnight Carryover | Time | 2 | IG, TT, YT | Planned | Extends late-night-activity |
| 21 | exposure-to-action | Exposure-to-Action | Engagement | 2 | IG, TT, YT | Planned | Needs interaction data |
| 22 | content-category-mix | Content Category Mix | Discovery | 3 | All | Future | Needs NLP classification |
| 23 | sensitivity-exposure | Sensitivity Exposure | Safety | 3 | All | Future | Needs NLP + legal/product review |
| 24 | comment-sentiment | Comment Sentiment | Safety | 3 | IG, TT, YT | Future | Needs NLP sentiment + sharing level 2 |
| 25 | ad-saturation | Ad Saturation | Feed | 3 | IG, TT, FB | Future | Needs ad data parsing |
| 26 | deletion-patterns | Deletion Patterns | Safety | 3 | IG, TT | Future | Needs account-activity history |
| 27 | blocks-boundaries | Blocks & Boundaries | Safety | 3 | IG, TT | Future | Needs block/mute data |
| 28 | messaging-intensity | Messaging Volume | Social | 3 | IG, FB | Future | Needs message metadata |
| 29 | stranger-contact | Stranger Contact | Safety | — | — | Merged | Merged into weak-tie-contact (#18) |
| 30 | overnight-sessions | Overnight Sessions | Time | 3 | IG, TT, YT | Future | Part of overnight-carryover |

## Session Detection Rules

| Parameter | Value | Explanation |
|---|---|---|
| Session boundary gap | 30 minutes | Gap ≥ 30 min → different sessions |
| Natural break threshold | 5 minutes | Gap ≥ 5 min within a session = a "pause" (recovery gap) |
| Minimum items for binge/pause | 2 in contentTimeline | Needs ≥2 timestamped items |
| Minimum items for interest-diversity | 5 items + ≥1 byOwner entry | Won't fire on tiny exports |
| Inverted signal logic | Lower value = worse | pause-ratio, follow-feed-alignment, interest-diversity |
| contentTimeline format | Array of {timestamp: ISO 8601, owner: lowercase username} | Sorted chronologically |
| Platform detection | Auto from ZIP structure | System inspects ZIP paths |
| Export date | Earliest content timestamp | Used for time-series ordering |

## Simulation Recipes (for QA fixtures)

| Recipe | Platform | Triggers |
|---|---|---|
| The Doomscroller | TikTok | binge (crossed), pause-ratio (crossed), late-night (crossed), content-volume (crossed), rabbit-hole (att/crossed) |
| The Healthy Browser | Instagram | All aligned (control case) |
| The Rabbit Holer | YouTube | rabbit-hole (crossed), interest-diversity (crossed), feed-diversity (att/crossed) |
| The Night Owl Trend | TikTok | late-night worsening trend (3 weekly exports) |
| The Improving Teen | Instagram | week-over-week improvement (binge, diversity, volume, pause-ratio) |
| The Cross-Platform Picture | IG + TikTok | divergence detection (ConsolidatedReport) |
| The Algorithm Trap | Instagram | algorithmic-amplification (crossed), follow-feed-alignment (crossed), content-volume (crossed) |
| The Gradual Binge | YouTube | binge (att), pause-ratio (att), late-night (att) |
