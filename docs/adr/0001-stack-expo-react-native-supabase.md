# ADR 0001 — Stack: Expo / React Native / TypeScript / Supabase

- **Status:** Accepted
- **Date:** 2026-06-08
- **Context:** Alpha for 8–12 families needs iOS + Android (Wiser cross-platform NFR), a parent and a child dashboard, an agreement engine, AI recommendations, and GDPR export ingestion. Constraints: minimize technical debt, avoid premature optimization, do not port the v0.2 Next.js demo architecture.

## Decision

- **Client:** Expo (managed) + React Native + TypeScript, `expo-router` with role-aware route groups `(parent)` / `(child)` / `(shared)`. One app, two Contextualized Views. EAS Build for pilot distribution (TestFlight / internal Android); no GA release.
- **Backend:** Supabase — Postgres + Row-Level Security (governance enforcement), Supabase Auth (email OTP + parental-consent gating), Storage (short-retention export bucket), Edge Functions (Deno/TS) as the Policy Broker boundary.
- **Monorepo:** pnpm workspaces. No Turborepo/Nx yet.

## Rationale

One codebase serves both mobile targets and reuses pure `packages/domain` logic in both the app and Edge Functions. Supabase gives us auth, Postgres, RLS, storage, and serverless functions without standing up bespoke infra — appropriate for a time-boxed alpha. RLS lets us make visibility a database-enforced invariant rather than application convention.

## Consequences

- RLS becomes a first-class, reviewed artifact (see ADR-0002).
- Server-side plaintext processing during parse is a known privacy limitation (see ADR-0002).
- Heavier infrastructure (dedicated VPC, enclaves, on-device inference) is deferred; the Edge Function seam keeps that door open (ADR-0004).

## Alternatives considered

- **Evolve the Next.js 14 demo** — rejected; web-first, not the cross-platform mobile target, and direction is reference-only.
- **Bare React Native (no Expo)** — more native control, slower to alpha; not justified at this scale.
- **Firebase** — weaker relational modeling and row-level policy story for our governance/visibility needs.
