# ADR 0003 — Governance as a first-class, machine-evaluatable domain

- **Status:** Accepted
- **Date:** 2026-06-08
- **Context:** The Family Agreement is the heart of MyChoice (spec §17). Wiser calls for the "agreement primitive as a permission layer / first-class domain object" with "rules as structured, machine-evaluatable objects (not free text)." If agreements were stored as prose, signal interpretation and AI recommendations would be ad hoc and untestable.

## Decision

- Agreements are modeled as **Agreement → AgreementVersion → AgreementRule (typed) + Participants/consent** (see Charter §3).
- `AgreementRule` is structured: `subject_signal_type`, `operator`, `params`, `window`, `weight`, `on_breach_intervention_level` (1–6, spec graduated intervention), `visibility_action`.
- A **pure** `governance-engine.evaluateAgreement(signals, agreement)` returns a typed `AgreementAlignment` (`aligned | at_risk | breached | insufficient_data`) per rule — no side effects, fully unit-testable.
- Edits create a new superseding version; active versions are immutable; history is retained for audit. Changes to active agreements are **human-in-the-loop** (AI suggests, a participant approves).

## Consequences

- Signal interpretation is agreement-relative (two families, same activity, different verdicts) — the product's differentiator.
- The engine is portable into the future Context Kernel runtime unchanged.
- Slightly more upfront modeling than free text; this is the debt we are deliberately avoiding later.

## Alternatives considered

- **Free-text agreements + LLM interpretation at read time** — rejected; non-deterministic, untestable, unauditable.
- **Hard-coded thresholds in app code** — rejected; not per-family, not governable, high debt.
