# Open Decisions Register (living)

Tracks decisions that are deferred or still open. Closed decisions become ADRs. Update `Status` and `Target Sprint` as items move.

**Status legend:** Open · Researching · Decided (→ ADR) · Deferred

| ID | Decision | Status | Owner | Target Sprint |
|---|---|---|---|---|
| OD-001 | **Future raw-content access model** — whether/when raw social content is ever persisted for child browsing (Alpha: never persisted after parse, ADR-0002). | Open | Bill | Post-Alpha |
| OD-002 | **Sharing-level roadmap** — the catalog references creator anonymization at "sharing level 0" / "level 2"; define the sharing-level model and how it gates signal visibility. | Open | Bill | Sprint 002+ |
| OD-003 | **Professional role roadmap** — `professional` (educator/counselor/clinician) is modeled but disabled; define consent-gated, domain-scoped activation. | Deferred | Bill | Post-Alpha |
| OD-004 | **Multi-platform ingestion roadmap** — TikTok / YouTube / Facebook export ingestion + the cross-platform consolidated/divergence report. | Deferred | Rocky / Bill | Post-Alpha |
| OD-005 | **Child-to-adult transition workflow refinements** — majority=18 + in-app re-consent decided (ADR-0006); refine edge cases (mid-pilot majority, export packaging, edge-validity timing). | Open | Bill | Sprint 002+ |
| OD-006 | **Future EgoGentix integration boundary** — the exact point at which `compileContext` becomes the Context Compiler emitting Compiled Context Objects, and what kernel infrastructure is required. | Open | Bill | Post-Alpha |

## Notes

- Items here are intentionally **not** implemented in Alpha; they are recorded so the gaps stay visible (a Sprint-000 principle).
- When an item is decided, add an ADR under `docs/adr/` and link it from this row, then set Status = Decided.
