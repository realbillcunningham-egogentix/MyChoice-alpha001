# Digital Landscape — Alpha Experience Concepts

**Story 003-001** · Sprint 003 · Owner: UX Lead (Gemini + Claude + human design input)
**Status:** Concept exploration for team decision — NOT final UI, NOT production
**Author of this draft:** Claude (Chief Engineer / Research Lead, contributing product thinking; Gemini + human design to challenge and extend)

---

## Grounding: what we may design with (and nothing else)

Every insight shown below is computable **today** from the alpha event store (~11,700 real events, participant p001):

| Signal | Source | Status |
|---|---|---|
| Content volume (items viewed per day/platform) | Meta views, YouTube watch history | OBSERVED |
| Late-night activity (timestamped events) | All platforms (TikTok timezone pending R-008) | OBSERVED |
| Feed diversity / creator concentration | Meta (Owner attribution), YouTube (channel attribution) | OBSERVED |
| Viewed-vs-followed gap (amplification proxy) | Meta posts_viewed × following; YouTube watched × subscriptions | OBSERVED |
| "What the algorithm thinks of you" | Meta `interest_categories` (literal exported sentences), TikTok ad interests | OBSERVED |
| Search themes | Meta + YouTube search history | OBSERVED |
| Session rhythm (time-of-day curves, daily activity) | Meta session logs, event density | OBSERVED |

**Explicitly NOT used in any concept** (we do not possess it): TikTok creator attribution, message content analysis, sentiment, wellbeing scores, content classification, screen-time minutes from iOS/Android, anything predictive, anything from platforms not yet ingested. If a sketch implies it, that's a bug — flag it.

Sample copy below uses real p001-derived examples (founder consent). Family mockups would render each person's own data.

---

# Concept A — "Visibility"

**Focus:** Helping parents understand what is happening. **Primary emotion: Relief.**
**Tagline:** *"Finally see the water your kids swim in."*

### A1. Landing page sketch

```
┌────────────────────────────────────────────┐
│  MyChoice                                    │
│                                              │
│  Your family's digital landscape,            │
│  finally visible.                            │
│                                              │
│  ┌────────────────────────────────┐  │
│  │ This week, your family viewed        │  │
│  │ 1,240 pieces of content              │  │
│  │ from 214 different creators.         │  │
│  │                                      │  │
│  │ [ See the landscape → ]              │  │
│  └────────────────────────────────┘  │
│                                              │
│  Everything here is visible to every         │
│  family member. No secret views.             │
└────────────────────────────────────────────┘
```

The anti-spyware promise is on the landing page itself — *"No secret views"* — because Concept A is the concept most at risk of reading as surveillance.

### A2. Digital Landscape sketch — major sections

```
┌─ THE WEEK AT A GLANCE ─────────────────────┐
│ content volume by day × platform (bar river) │
├─ NIGHT & DAY ───────────────────────────┤
│ 24h clock face; activity glow by hour        │
├─ WHO SHAPES THE FEED ─────────────────────┤
│ top creators by share of viewed content      │
├─ WHAT THE ALGORITHM THINKS ────────────────┤
│ the platforms' own exported interest         │
│ sentences, verbatim, per person              │
└──────────────────────────────────────────┘
```

### A3–A5. Benefits

- **Parent Benefit:** Replaces imagination with observation. The scary unknown ("what are they actually seeing?") becomes a bounded, factual picture. Relief, not control.
- **Child Benefit:** Symmetry — the child sees the parent's landscape too. Honest answer to "why are YOU on your phone at 1am?" Visibility runs both directions or it doesn't run.
- **Family Benefit:** A shared factual baseline. Arguments shift from "you're always on that thing" (contested) to "Tuesday was 340 items" (fact, discussable).

### A6. First "holy shit" moment

**"What the Algorithm Thinks" rendered verbatim.** Meta literally exports sentences:

> *"The user might be interested in grateful dead and deadhead culture"*
> *"The user might be interested in music therapy and wellness"*

Seeing a billion-dollar company's actual model of you — in its own words, slightly wrong, slightly creepy — stops every adult we've shown it to. Zero inference required by us; we just display their file.

### A7. First conversation starter

Sample copy, shown after the interest list: *"Instagram wrote 5 sentences about Dad. It wrote 11 about Maya. Compare notes — what did they get wrong about each of you?"* — "what did they get WRONG" is deliberately chosen: it puts the family and the platform on opposite teams, not parent vs. child.

**Emotional risk to manage:** Relief can curdle into monitoring. Mitigations: bidirectional visibility, no alerts, no thresholds, no red colors, weekly cadence not real-time.

---

# Concept B — "Own Your Vibe" (Take Back Control)

**Focus:** Helping children understand and influence their feeds. **Primary emotion: Agency.**
**Tagline:** *"Your feed. Your data. See what they see."*

### B1. Landing page sketch — addressed to the TEEN, not the parent

```
┌──────────────────────────────────────────┐
│  own your vibe                             │
│                                            │
│  Instagram has a file about you.           │
│  So does YouTube. So does TikTok.          │
│                                            │
│  You're allowed to read it.                │
│                                            │
│  [ Show me my file → ]                     │
│                                            │
│  your data · your eyes first · you choose  │
│  what to share with your family            │
└──────────────────────────────────────────┘
```

Key structural choice: **the teen sees their landscape first and chooses what to surface to the family.** Agency is the architecture, not just the copy.

### B2. Digital Landscape sketch

```
┌─ YOUR VIBE MAP ──────────────────────────┐
│ interest categories + top creators as a    │
│ visual identity card ("this is who the     │
│ algorithm thinks you are")                 │
├─ WHO'S PROGRAMMING YOU? ──────────────────┤
│ viewed-vs-followed split bar:              │
│ ████████████ you chose (followed)         │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ the algorithm chose    │
├─ YOUR 2AM SELF ──────────────────────────┤
│ late-night pattern, self-aware framing —   │
│ "what does 2am-you watch that 2pm-you      │
│ doesn't?" (creator mix by hour)            │
├─ THE CONCENTRATION GAME ───────────────────┤
│ "7 accounts = half of everything you saw"  │
├─ SHARE CARD BUILDER ──────────────────────┤
│ teen picks ONE insight to show the family  │
└──────────────────────────────────────────┘
```

### B3–B5. Benefits

- **Parent Benefit:** Indirect but real — a teen who understands feed mechanics is safer than a monitored one. Parent gets whatever the teen shares, which (per the share-card mechanic) is usually the most interesting thing.
- **Child Benefit:** Direct, designed-for-me value: literacy about their own algorithmic environment, plus the social currency of surprising self-knowledge. The product's only alpha cohort feature where the child is the customer.
- **Family Benefit:** Reverses the information flow — the teen *brings* insights to the family instead of having insights extracted from them. Trust is built by the direction of motion.

### B6. First "holy shit" moment

**The viewed-vs-followed split.** Real p001 YouTube data: of 1,709 videos watched in a year, a large share came from channels never subscribed to. Rendered as: *"61% of what you watched this year, you never chose to follow. Someone else picked it."* (Exact % computed per person at render time — the number shown must be theirs, never an average.) For teens this lands as a challenge — *who's actually driving?* — which is precisely the agency emotion.

### B7. First conversation starter

The Share Card: *"My 2am self watches completely different stuff than my 2pm self. Look."* — teen-initiated, voluntary, and inherently funny rather than incriminating. Sample share-card copy: **"My algorithm thinks I'm 3 different people."**

**Emotional risk to manage:** "Own your vibe" copy aging badly with actual teens — needs testing with the Middle School Advocate before any family sees it; adults writing teen voice is the most common way to lose teens.

---

# Concept C — "Family Alignment"

**Focus:** Shared understanding and family agreements. **Primary emotion: Trust.**
**Tagline:** *"This helps us talk about things that matter."*

### C1. Landing page sketch — addressed to the FAMILY as a unit

```
┌───────────────────────────────────────────┐
│  The Cunningham Digital Landscape           │
│                                             │
│  ┌── Dad ──┐ ┌── Maya ─┐ ┌── Sam ──┐        │
│  │ ◉ ◉ ◉  │ │ ◉ ◉ ◉  │ │ ◉ ◉ ◉   │        │
│  └────────┘ └────────┘ └────────┘        │
│   everyone's landscape, side by side        │
│   each person controls their own card       │
│                                             │
│  This week's family question:               │
│  "Who has the most surprising               │
│   algorithm file? Vote after dinner."       │
└───────────────────────────────────────────┘
```

### C2. Digital Landscape sketch

```
┌─ FAMILY RHYTHM ──────────────────────────┐
│ everyone's time-of-day curves overlaid —   │
│ when is this household online?             │
├─ COMMON GROUND ──────────────────────────┤
│ overlapping interest categories & shared   │
│ creators across family members             │
├─ THE WEEKLY SURPRISE ─────────────────────┤
│ each member's chosen share-card (from B's  │
│ mechanic) displayed together               │
├─ AGREEMENTS ─────────────────────────────┤
│ family-authored, signal-linked, mutual:    │
│ "Nobody's feed after midnight on school    │
│  nights — including Dad. Streak: 9 days"   │
└──────────────────────────────────────────┘
```

### C3–C5. Benefits

- **Parent Benefit:** Agreements with observable, mutual accountability — the streak applies to Dad's 1am scrolling too. Parents get the durable thing they actually want: not data, but a working family practice.
- **Child Benefit:** Fairness made structural. The child is a party to agreements, not their subject. Mutual streaks mean a parent breaking the agreement is equally visible — teens consistently identify this as the difference between "family rule" and "rule for me."
- **Family Benefit:** The product's north star verbatim — a recurring, low-stakes ritual (weekly surprise, family question) that makes digital life a normal dinner topic instead of a confrontation topic.

### C6. First "holy shit" moment

**Family Rhythm overlay.** Three time-of-day curves on one clock face, and the discovery that *multiple* family members glow at 1am — the "late-night problem" is a household pattern, not a kid problem. (p001 data alone shows 122 late-night YouTube views and 1am Facebook sessions — the founder family will demo this honestly.)

### C7. First conversation starter

Built into the product as the weekly family question. Launch question: *"Everyone guess: whose feed is the most concentrated — most of it from the fewest creators? Loser makes dessert."* Then reveal the real numbers. Game first, meaning second — by design.

**Emotional risk to manage:** Requires 2+ family members' data ingested before it works at all — highest onboarding cost of the three; a family that stalls at one export sees an empty room.

---

# Comparison & Recommendation

| | A — Visibility | B — Own Your Vibe | C — Family Alignment |
|---|---|---|---|
| Primary customer | Parent | Child | Family unit |
| Emotion | Relief | Agency | Trust |
| North-star fit | Parent statement | Child statement | Family statement |
| Surveillance risk | **Highest** (mitigated) | Lowest | Low |
| Data needed to wow | 1 person's exports | 1 teen's exports | **2+ members' exports** |
| Build cost (alpha) | Lowest | Medium | Highest |
| Holy-shit moment | Algorithm's file on you | "61% you never chose" | Family rhythm overlay |
| Differentiation vs screen-time apps | Medium | **High** | **High** |

**Recommendation (for team challenge, not decree):** Build **C's frame with B's centerpiece**. The alpha experience opens as the family landscape (C), but the first onboarded member — likely the teen — gets the full "Own Your Vibe" personal view immediately (B), so the product is valuable from the first export, before the family room fills. Concept A is the fallback if build time collapses: it's one person's data and four sections. The "What the Algorithm Thinks" moment appears in all three concepts because it is our cheapest, strongest, most honest wow — we display the platform's own file, invent nothing, and every audience we've described it to reacts.

**What Sprint 003's field test should measure against these concepts (→ R-010):** which holy-shit moment families retell unprompted; whether teens use the share-card voluntarily; whether any family writes an agreement without being asked.

*Constraint compliance: every number above is computable from the current event store; the only signal with a pending caveat is TikTok late-night (R-008 timezone). No future AI capability, no content analysis, no sentiment, no scores.*
