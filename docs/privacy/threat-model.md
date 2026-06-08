# Threat model (starter) — LINDDUN + STRIDE

Full modeling is a Sprint-001 task (Wiser track 2.2). This is the starting register.

## LINDDUN (privacy)

| Threat | Where | Initial mitigation |
|---|---|---|
| **L**inking | Signals linked to identify a child across sources | Family-scoped IDs; minimal source metadata |
| **I**dentifying | Re-identification from derived signals | Derived-only; no content; aggregation where possible |
| **N**on-repudiation | — | Audit log records decisions, not content |
| **D**etecting | Inferring presence of sensitive data | `sensitive` privacy_class gated behind escalation |
| **D**ata disclosure | Content leaking to a parent | **Primary risk R1** — no content column; deny-by-default RLS; visibility test |
| **U**nawareness | Child unaware of what parent sees | Role-aware views; transparency by design |
| **N**on-compliance | COPPA/GDPR breach | Consent flow; retention/deletion; this doc set |

## STRIDE (security)

| Threat | Initial mitigation |
|---|---|
| **S**poofing | Supabase Auth; RLS keyed on `auth.uid()` |
| **T**ampering | DB constraints; service-role-only writes for signals |
| **R**epudiation | `audit_events` (tamper-evident logging is a later hardening) |
| **I**nformation disclosure | RLS, derived-only, parse-and-destroy |
| **D**enial of service | Rate limits on ingest/AI endpoints (Sprint-001) |
| **E**levation of privilege | No client write path to `signals`; admin flag narrowly scoped |
