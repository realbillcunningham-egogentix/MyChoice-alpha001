# MyChoice Product Roadmap

This roadmap tracks product direction beyond the current sprint — plans for future feature additions. Items here are commitments to *think*, not commitments to *build* — each item graduates through: `Future Research` → `Active Research` → `Planned` → `Scheduled` → `In Development`.

---

## Planned

### Participant Self-Serve Upload

| | |
|---|---|
| **Status** | Planned (not scheduled) |
| **Priority** | High — required for a usable alpha beyond hand-delivered files |
| **Origin** | Sprint 003 local upload portal (`ingestion/pipeline/portal.py`, June 2026) |

Let alpha test users upload their own export ZIPs from their own homes, producing/refreshing their personal Digital Landscape. The local portal proved the flow (upload → privacy-enforced ingest → auto-file → landscape); this item is the productization of that flow.

**Hard gates before this ships — these move together, not separately:**

1. **Consent doc revision** — current language promises "processed locally or in a controlled development environment"; remote upload requires new security language and re-consent from existing participants.
2. **Real security posture** — hosting, authentication, transport + at-rest encryption, per-participant isolation; the alpha's "no production-grade security" honesty stops being acceptable the moment data crosses the network.
3. **Q-001 resolution** — decide research-harness (Python) vs production stack (TS/Supabase) before building; this feature is the natural forcing function.
4. **Q-003 resolution** — AI-processing policy for non-founder data, since self-serve upload removes the human triage step.
5. **RISK-002 parity** — the same field-level privacy enforcement and regression tests, in whatever stack ships.

---

## Future Research

### Digital Ecosystem Registry

| | |
|---|---|
| **Status** | Future Research |
| **Priority** | Strategic |
| **Scheduled** | Not scheduled |
| **Origin** | R-006 Platform Data Inventory / R-007 ingestion POC (June 2026) |

A living, versioned registry of the digital platforms in a family's ecosystem and what each one makes knowable: export mechanisms and schemas, API/portability access paths, signal feasibility, durability ratings, retention windows, parser status, and legal/minor-consent constraints — maintained as a product asset rather than a one-time research report.

**Why strategic:** R-006 demonstrated that platform data access is heterogeneous, schema-unstable, and changes under regulatory pressure. Every MyChoice capability (ingestion, signals, family features) depends on knowing the current state of each platform's data surface. A registry turns that knowledge from tribal research docs into queryable infrastructure — the same registry could eventually drive the ingestion pipeline's parser routing, the user-facing "what can MyChoice see?" transparency screens, and expansion prioritization.

**Open questions for the research phase:** registry schema (platforms × access paths × signals × durability); how registry updates are validated (fresh-export regression testing, per R-006 finding F10 that third-party schema docs go stale); whether the registry itself becomes a public/community artifact; relationship to the parser backlog and fixture library.

---

*Add new items under the appropriate status heading. Keep entries short — link to research docs for depth.*
