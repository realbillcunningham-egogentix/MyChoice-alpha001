# MyChoice Product Roadmap

This roadmap tracks product direction beyond the current sprint. Items here are commitments to *think*, not commitments to *build* — each item graduates through: `Future Research` → `Active Research` → `Planned` → `Scheduled` → `In Development`.

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
