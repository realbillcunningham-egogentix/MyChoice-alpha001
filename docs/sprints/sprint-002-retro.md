# Sprint 002 Retrospective

**Platform Inventory → Data Ingestion Control Center → Alpha Readiness**

| | |
|---|---|
| Sprint | Sprint 002 |
| Period | June 2026 |
| Status | **Closed** (team-reviewed; post-retro challenges incorporated) |
| Prepared by | Scrum Master |
| Amendments | Chief Engineer (§CE), accepted by Scrum Master follow-up 2026-06-12 |
| Participants | Product Owner, Chief Engineer, Research Lead, Architecture, QA, Data Science, UX, Marketing, Parent Advocate, Teacher Advocate, Middle School Advocate |

---

## Executive Summary

Sprint 002 marked a transition from engineering validation toward product discovery.

The team moved beyond proving individual signals and began validating the practical realities of platform data acquisition, export ingestion, participant onboarding, and alpha readiness.

The most important outcome of the sprint was not a new feature. It was establishing a repeatable process for converting assumptions into evidence and evidence into roadmap decisions.

The sprint also demonstrated that research is no longer a supporting function. Research findings directly altered engineering priorities, product expectations, and future roadmap planning.

## Sprint Goal

**Original goal:**

- Validate what data users can actually obtain from major platforms.
- Build a repeatable ingestion and inventory process.
- Prepare the foundation for real-family alpha testing.

**Result: Achieved.**

## Major Deliverables

### Research

- Platform Data Inventory (R-006)
- Instagram export analysis
- Facebook export analysis
- Initial TikTok export analysis completed using a sparse account export. Most sections were empty markers. Additional mature-account exports remain required before platform-wide conclusions can be made. **Confidence Level: Low.** §CE
- Google Takeout acquisition and initial validation
- Data-source availability mapping

### Engineering

- Data Source Control Center
- Export ingestion pipeline
- Event normalization framework
- Deduplication strategy
- Freshness dashboard
- Weekly ingestion workflow
- Participant-facing export repository structure

### Product

- Parent Download Guide
- Alpha Consent & Confidentiality Draft
- Alpha Participation Framework
- Initial Pilot Family Preparation

## What Went Well

### Evidence Replaced Assumptions

The strongest pattern throughout the sprint was that direct observation repeatedly challenged existing assumptions.

**Instagram** — Assumption: creator attribution unavailable. Reality: observed creator attribution paths existed in exports previously believed not to contain them.

**TikTok** — Assumption: creator identity recoverable from exported URLs. Reality: not observed in the tested export format. (Confidence Level: Low — single sparse export.)

**Google** — Assumption: unknown. Reality: large amounts of potentially valuable data available for future analysis.

The team's evidence-labeling discipline prevented these discoveries from becoming roadmap mistakes.

### Research Became Productive

Research stopped acting as support for engineering and started driving engineering decisions. Several roadmap items changed direction because of research findings. This validates Research Lead as a permanent Scrum role.

### Data Flywheel Established

A repeatable process now exists:

User Requests Export → Export Arrives → Ingestion → Normalization → Inventory → Analysis

This becomes the first version of a sustainable data-acquisition process.

### Architecture Held

The existing separation remained intact: Signal → Status → Agreement Interpretation → Explanation. No significant architectural rework was required despite new platform discoveries.

## What Did Not Go Well

### Raw Data Mutation Risk — RISK-001

A variable-shadowing bug caused movement of data files. No data was lost. However: **any process touching raw participant exports must be treated as high risk.**

**Action (RISK-001):** Introduce dry-run mode and test coverage before any future archive mutation.

### Field-Level Privacy Enforcement — RISK-002 §CE

Privacy requirements exist primarily as documentation and process. Required future state: parser allowlists and automated privacy regression tests enforce birthDate exclusion, PII exclusion, and restricted-field exclusion.

**Action (RISK-002):** Parser allowlists and privacy regression tests required before participant #2 enters the system.

### Research and Product Divergence

Several discussions moved toward influence scoring, creator scoring, ecosystem ranking, and advanced intelligence layers before data availability had been validated. Research repeatedly prevented premature implementation.

**Action:** Continue separating **Observed Fact** from **Product Vision**.

### UX Entered Too Late

The team spent substantial effort discussing signals before discussing understanding. Several iterations were technically correct but not obviously useful to parents, children, or families.

**Action:** Require UX participation earlier in sprint planning.

## Persona Review

**Product Owner** — Excited by: real families becoming available; data acquisition succeeding; evidence replacing assumptions. Concerned about: building plumbing without demonstrating value; losing sight of emotional resonance. Wants research to answer: What creates "wow"? What makes families return?

**Chief Engineer** — Excited by: repeatable ingestion; working infrastructure; successful normalization. Concerned about: maintaining separate research and production worlds; technical debt accumulation. Wants research to answer: Which data paths are durable? Which exports change frequently?

**Research Lead** — Excited by: assumptions being challenged; platform differences emerging. Concerned about: over-generalization from limited exports. Wants research to answer: What data can users legally obtain? What differs between light-use and heavy-use accounts?

**Architecture** — Excited by: stable schema; separation of concerns; CompileContext remaining viable *(Architecture's opinion — not Sprint 002 evidence; nothing in this sprint exercised CompileContext)* §CE. Concerned about: premature migration of research code into production. Wants research to answer: What belongs in the permanent architecture?

**QA** — Excited by: evidence labels; unknown-data tracking. Concerned about: raw-data mutation; silent parser failures. Wants research to answer: How often do exports change? Which assumptions remain untested?

**Data Science** — Excited by: emerging cross-platform inventory; new signal opportunities. Concerned about: measuring usefulness versus measurability. Wants research to answer: Which signals correlate with meaningful outcomes?

**UX** — Excited by: Digital Landscape concept. Concerned about: users seeing signals rather than meaning. Wants research to answer: What do parents understand? What do children understand?

**Marketing** — Excited by: market timing; Digital Landscape narrative. Concerned about: lack of compelling first insight. Wants research to answer: What surprises users? What creates immediate value?

**Parent Advocate** — Excited by: honest communication; family agreement model. Concerned about: trust; data handling. Wants research to answer: What would make parents return?

**Teacher Advocate** — Excited by: educational applications. Concerned about: oversimplified "screen time bad" narratives. Wants research to answer: How are schools approaching AI and digital literacy?

**Middle School Advocate** — Excited by: non-punitive approach. Concerned about: feeling monitored rather than helped. Wants research to answer: What value does the child receive?

## Reality Review

### Assumptions Challenged

| Assumption | Result |
|---|---|
| Instagram exports lack creator attribution | Not universally true |
| TikTok URLs reveal creator identity | Not observed (Confidence: Low — single sparse export) |
| Platform exports are broadly similar | False |
| Signals alone create value | Unproven |

### Assumptions That Survived

| Assumption | Result |
|---|---|
| Late-night activity is measurable | Supported |
| Recurring export ingestion is feasible | Supported |

### Assumptions Not Yet Tested §CE

| Assumption | Status |
|---|---|
| Family agreements remain differentiating | The agreement *mechanism* exists; parent engagement, child engagement, family usefulness, and behavioral impact are all unvalidated |
| TikTok export timestamps are UTC | Untested — gates Late-Night Activity on TikTok → tracked as **R-008** (Open, High) |

## Decisions Made

**D-001** — Research becomes a permanent Scrum function. *Reason: research findings directly changed roadmap decisions.*

**D-002** — Platform Data Inventory becomes a living artifact. *Reason: data availability remains uncertain and evolving.*

**D-003** — Digital Ecosystem Registry added to roadmap. Status: Future Research, not scheduled. *Reason: potential long-term strategic asset.*

**D-004 (Planning Rule, effective Sprint 003)** — Every user-facing story must explicitly document **Parent Benefit, Child Benefit, and Family Benefit** before entering implementation. *Reason: technical correctness alone is insufficient. This was a major lesson of Sprint 002.*

**D-005** — Alpha readiness takes precedence over additional plumbing. *Reason: the next major risk is user value rather than engineering capability.*

## Open Questions

**Q-001** — Should the Python ingestion harness remain a research lab or migrate into production infrastructure?

**Q-002** — Who owns participant deletion operations?

**Q-003** — What policy governs AI access to non-founder participant exports?

**Q-004** — What is the minimum insight that creates perceived value for families? (→ tracked as R-010)

## Sprint Assessment

| Area | Grade |
|---|---|
| Engineering | A- |
| Architecture | A |
| Research | A |
| Product | B+ |
| UX | B |
| Marketing Readiness | C+ |
| Alpha Readiness | B+ |

## Post-Retro Challenges

*New standing section per the AI/Human Scrum operating model: captures how the team's understanding evolved after initial retrospective publication.*

| Challenge | Raised By | Accepted? | Action |
|---|---|---|---|
| TikTok findings overstated | Chief Engineer / Research Lead | Yes | Confidence Level: Low applied; wording revised; mature-account export required |
| Family agreements miscategorized as validated | Chief Engineer / Research Lead | Yes | Moved to "Assumptions Not Yet Tested"; mechanism-vs-impact distinction documented |
| Privacy enforcement is convention, not code | Chief Engineer / Research Lead | Yes | RISK-002 created; allowlists + privacy regression tests gate participant #2 |
| CompileContext claim not sprint evidence | Chief Engineer / Research Lead | Yes | Re-attributed as Architecture opinion |
| TikTok timezone semantics unknown | Chief Engineer / Research Lead | Yes | R-008 created (Open, High) |

## Most Important Lesson

The fastest way to improve MyChoice is not writing more code. It is exposing assumptions to reality.

Every meaningful roadmap change during this sprint came from evidence gathered from real exports rather than internal debate. That pattern should continue.

## Recommendation For Sprint 003

**Theme:** Alpha Field Test Readiness

**Goal:** Place meaningful output in front of 3–5 friendly families and learn from their reactions.

**Success will be measured by:**

- What surprised them
- What confused them
- What they expected
- What they wished they knew
- Whether they would use it again

The next stage of MyChoice should be driven by real human reactions rather than additional assumptions.
