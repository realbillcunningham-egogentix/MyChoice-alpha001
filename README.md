# MyChoice-alpha001

Family digital-wellbeing platform — **Alpha** (8–12 pilot families).
Mentorship-via-transparency, not surveillance: parents see **patterns, not content**.

> **Confidential.** This repository implements an embodiment of the EgoGentix Context Kernel and references a patent draft. Do not distribute.

## Stack

Expo · React Native · TypeScript · Supabase (Postgres + RLS + Auth + Storage + Edge Functions). Domain-first; governance is a first-class, machine-evaluatable domain.

## Start here

- **[docs/ENGINEERING_CHARTER.md](docs/ENGINEERING_CHARTER.md)** — the Sprint 000 charter: repository structure, canonical Signal schema, canonical Agreement schema, User/Family domain model, recommended stack, architecture risks, and the Sprint 000 backlog.

## Architecture Decision Records

- [ADR 0001 — Stack: Expo / React Native / TypeScript / Supabase](docs/adr/0001-stack-expo-react-native-supabase.md)
- [ADR 0002 — Privacy boundary: derived signals, parse-and-destroy, honest ZK](docs/adr/0002-privacy-boundary-derived-signals.md)
- [ADR 0003 — Governance as a first-class, machine-evaluatable domain](docs/adr/0003-governance-as-first-class-domain.md)
- [ADR 0004 — EgoGentix compatibility seam (design-for, don't-build)](docs/adr/0004-egogentix-compatibility-seam.md)

## Source documents (reference)

- MyChoice / EgoGentix Master Specification (patent draft) — conceptual & legal frame.
- Wiser Discovery Proposal (Y26) — alpha scope, requirements, risks.
- Existing MyChoice v0.2 demo (Next.js 14) — **reference only**; architecture is not carried over.

## Principles

1. Raw content never crosses the boundary to a parent; only derived signals do.
2. Governance rules are structured objects, never free text.
3. Build the compatibility *seam* for EgoGentix — not the infrastructure.
4. Minimize technical debt; avoid premature optimization.
