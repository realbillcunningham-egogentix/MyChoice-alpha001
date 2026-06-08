# Definition of Done

A change is done when:

1. **CI is green** — typecheck, lint, and tests pass.
2. **Domain-first** — any new type is defined once in `@mychoice/domain`; no duplicate shapes.
3. **Boundary respected** — no raw content reaches a durable table or a parent-visible path; new disclosure paths go through `compileContext` (ADR-0004).
4. **RLS** — any new table has deny-by-default RLS + explicit policies; the visibility test still passes.
5. **Governance is structured** — no decision is driven by free text (ADR-0003).
6. **Docs** — user-facing or architectural changes update the relevant doc/ADR.
7. **Reviewed** — at least one reviewer; migrations/RLS need a second reviewer.
