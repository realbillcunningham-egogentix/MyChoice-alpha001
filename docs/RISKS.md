# Risk Register

| ID | Risk | Severity | Status | Mitigation / Gate |
|---|---|---|---|---|
| RISK-001 | Raw archive mutation — code that moves/renames raw participant export files can misplace irreplaceable data (variable-shadowing incident, Sprint 002; recovered, no loss) | High | **Partially mitigated** | Auto-filer now restricted to root/inbox paths only; OPEN: dry-run mode + test fixtures required before any new archive-mutating code ships |
| RISK-002 | Field-level privacy enforcement — privacy rules (birthDate exclusion, PII exclusion, restricted fields) exist as documentation, not enforced code; consent-doc promises currently rely on convention | High | **Open** | Parser allowlists + automated privacy regression tests (a test that fails if a forbidden field reaches the event store). **Hard gate: required before participant #2 enters the system** |
| RISK-003 | Consent documents not counsel-reviewed — alpha consent/confidentiality docs are drafts; minor-participant expansion or broader use without legal review creates exposure (COPPA amended rule, state teen-privacy laws) | Medium | Open | Counsel review before any non-founder minor participates; tracked in docs/alpha/README.md |
| RISK-004 | Export link expiry vs. family responsiveness — TikTok (4 days) and Meta (~4 days) download links expire quickly; real families may miss windows, breaking the data flywheel | Medium | Open | Download-promptly guidance in Parent Guide; R-009 will quantify real friction |
| RISK-005 | Single-maintainer research pipeline — ingestion harness has no tests and one effective maintainer; bus-factor and silent-regression risk grows with each platform parser | Medium | Open | Decision Q-001 (research lab vs production migration) scheduled for Sprint 003 planning |

*Severity reflects impact on alpha families' data and trust, not engineering effort.*
