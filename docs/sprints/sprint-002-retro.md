# Sprint 002 Retrospective

**Platform Inventory → Data Ingestion Control Center → Alpha Readiness**

| | |
|---|---|
| Sprint | Sprint 002 |
| Period | June 2026 |
| Status | Final (team-reviewed) |
| Prepared by | Scrum Master |
| Amendments | Chief Engineer (4 amendments, accepted by Product Owner — marked §CE) |
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
- TikTok export analysis *(initial — single sparse account; most sections were empty and remain schema-unknown; mature-account export outstanding)* §CE
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

**TikTok** — Assumption: creator identity recoverable from exported URLs. Reality: not observed in the tested export format.

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

### Raw Data Mutation Risk

A variable-shadowing bug caused movement of data files. No data was lost. However: **any process touching raw participant exports must be treated as high risk.**

**Action:** Introduce dry-run mode and test coverage before any future archive mutation.

**Action §CE:** Privacy enforcement becomes code, not convention — parser allowlists enforce field-level drop rules (e.g., TikTok exports a full `birthDate`, which the consent doc promises we do not retain), with a test that fails if a forbidden field ever reaches the event store. Required before the first non-founder participant's data arrives.

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

**Architecture** — Excited by: stable schema; separation of concerns; CompileContext remaining viable *(Architecture's attestation — not validated by this sprint's work)* §CE. Concerned about: premature migration of research code into production. Wants research to answer: What belongs in the permanent architecture?

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
| TikTok URLs reveal creator identity | Not observed |
| Platform exports are broadly similar | False |
| Signals alone create value | Unproven |

### Assumptions That Survived

| Assumption | Result |
|---|---|
| Late-night activity is measurable | Supported |
| Recurring export ingestion is feasible | Supported |

### Unchallenged (not tested this sprint) §CE

| Assumption | Status |
|---|---|
| Family agreements remain differentiating | Product Vision — no family saw any output this sprint; untested |
| TikTok export timestamps are UTC | Untested — directly gates Late-Night Activity on TikTok; ~10-minute experiment (watch one video at a known local time, re-export, compare) |

## Decisions Made

**D-001** — Research becomes a permanent Scrum function. *Reason: research findings directly changed roadmap decisions.*

**D-002** — Platform Data Inventory becomes a living artifact. *Reason: data availability remains uncertain and evolving.*

**D-003** — Digital Ecosystem Registry added to roadmap. Status: Future Research, not scheduled. *Reason: potential long-term strategic asset.*

**D-004** — Parent Benefit, Child Benefit, and Family Benefit become required fields for future user-facing stories. *Reason: technical correctness alone is insufficient.*

**D-005** — Alpha readiness takes precedence over additional plumbing. *Reason: the next major risk is user value rather than engineering capability.*

## Open Questions

**Q-001** — Should the Python ingestion harness remain a research lab or migrate into production infrastructure?

**Q-002** — Who owns participant deletion operations?

**Q-003** — What policy governs AI access to non-founder participant exports?

**Q-004** — What is the minimum insight that creates perceived value for families?

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
