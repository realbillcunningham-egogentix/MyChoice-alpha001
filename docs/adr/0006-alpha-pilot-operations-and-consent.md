# ADR 0006 — Alpha pilot operations & consent decisions

- **Status:** Accepted
- **Date:** 2026-06-08
- **Context:** Four open questions from the Sprint 000 baseline review needed answers before Sprint 001. These are pilot-scoped operational decisions; they intentionally favor simplicity appropriate to 8–12 families.

## Decisions

### 1. Majority threshold = 18
`child_reaches_majority` (ADR-0005, §4.5) triggers at **age 18**. (Note: 18 is the adulthood/transition threshold; it is distinct from the COPPA-13 line that governs whether verifiable parental consent is required at onboarding — both apply at different points in the lifecycle.)

### 2. `pilot_operator` accounts — exactly two, named, MFA, no sharing
- Two separate `pilot_operator` accounts only: **Bill Cunningham** and **John Eagleson**.
- **MFA required** on both.
- **No shared credentials.** Each operator authenticates as themselves; operator actions are individually attributable in `audit_events`.
- Operators retain the ADR-0005 scope only (setup, recovery, audit metadata, deletion) — never content, never impersonation.

### 3. Deletion/export produces both machine and human formats
On a requested export (family exit or majority), the system produces:
- **Machine-readable:** `signals.json`, `agreements.json` (the derived data; never raw content).
- **Human-readable:** `Family_Report.pdf` (a plain-language summary for non-technical families).

### 4. Majority re-consent — in-app confirmation, no identity verification
At majority, adult re-consent is captured by **in-app confirmation only**. **No identity-verification** step in Alpha — pilot scale does not justify the complexity. (Revisit for MVP if the pilot surfaces a need.)

## Consequences

- ADR-0005's "majority threshold … jurisdiction-dependent" is now fixed at 18 for Alpha.
- The deletion runbook's export step names the three artifacts above.
- Auth must support MFA for operator accounts; operator provisioning is a Sprint 000/001 setup task (out of the seed; see `seed.sql` note).
- A `Family_Report.pdf` generator is a Sprint 001 deliverable (depends on the export bundle).

## Alternatives considered

- **Single shared operator account** — rejected; breaks individual attribution and weakens the audit trail.
- **Identity-verified re-consent at majority** — deferred; disproportionate for 8–12 families.
- **Machine-only or human-only export** — rejected; families and engineers have different needs, and both are cheap to produce from derived data.
