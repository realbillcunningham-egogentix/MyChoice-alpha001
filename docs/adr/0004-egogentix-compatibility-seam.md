# ADR 0004 — EgoGentix compatibility seam (design-for, don't-build)

- **Status:** Accepted
- **Date:** 2026-06-08
- **Context:** MyChoice is one embodiment of the broader EgoGentix Context Kernel (spec §6, §9). The constraint is explicit: **design for future EgoGentix compatibility but do not implement EgoGentix infrastructure during Alpha.** We need a way to stay forward-compatible without building cryptographic kernel machinery for 8–12 families.

## Decision

- **One chokepoint.** Every cross-boundary disclosure (parent views, AI inputs, any future external consumer) routes through a single module — `governance-engine/compileContext.ts`, fronted by the `compile-context` Edge Function.
- **Forward-compatible shape, thin implementation.** Today `compileContext` returns a role-scoped projection (`authorized_fields`, `denied_fields`, `derived_signals`, `obligations`, `audit_ref`) backed by RLS. The field names deliberately anticipate the spec's **Compiled Context Object** (§9) so the later swap is internal.
- **Provenance everywhere.** Every Signal/Agreement/edge carries provenance, `domain`, and `privacy_class`, so a future Context Kernel can ingest Alpha data unchanged.

## Explicitly NOT built in Alpha

Cryptographic kernel & key hierarchies; multi-signature / delegated keys; TEE / enclaves; decentralized identifiers (DIDs); the full overlay precedence lattice; revocation registry with grant-key rotation; on-device kernel; post-compilation non-disclosure verifier as a crypto artifact.

## Consequences

- When EgoGentix infrastructure is built, the migration is "replace the contents of one module + add kernel storage," not a rewrite.
- We accept that Alpha's "compiled context" is a logical projection, not a signed, audience-bound cryptographic object.

## Alternatives considered

- **Build a minimal kernel now** — rejected; premature optimization, burns alpha runway (Risk R7).
- **Ignore compatibility, refactor later** — rejected; guarantees a costly rewrite and schema churn (Risk R8).
