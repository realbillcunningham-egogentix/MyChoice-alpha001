# Runbook — "Something Feels Weird?" (child flag)

When a child raises a flag, the system prioritizes the child's safety and agency over reporting.

## What happens (Alpha)

1. **Capture.** The child taps the button; a `flags` row is created (`status='open'`). The child may add an optional note. The flag never exposes raw content to anyone automatically.
2. **Acknowledge to the child.** The app immediately shows a calm, age-appropriate acknowledgement and supportive options — not an alarm.
3. **Triage (server-side).** A service-role process classifies severity from structured fields only (reason, related safety signals). No content is auto-disclosed.
4. **Escalation by policy, not by default.** Escalation to a guardian or a designated support contact follows the family's agreed escalation rules and graduated-intervention level (spec §15, levels 1–6). Higher levels may notify a guardian; the child is told what will be shared before it is.
5. **AI guardrails.** The AI layer must not diagnose, must not minimize, and must surface help resources. Crisis-indicating input bypasses normal recommendation flow and routes here.
6. **Audit.** Every step writes an `audit_events` row (decision + level), never content.

## Hard rules

- A flag never silently forwards a child's message content to a parent.
- Crisis resources are always offered; the child is never left at a dead end.
- Severity assessment uses structured signals, not surveillance of content.

## Sprint-001 to define

- The specific escalation matrix per intervention level.
- The designated-support-contact mechanism.
- Jurisdiction-aware resource lists.
