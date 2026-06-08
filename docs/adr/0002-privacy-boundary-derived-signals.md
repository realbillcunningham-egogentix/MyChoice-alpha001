# ADR 0002 — Privacy boundary: derived signals, parse-and-destroy, honest ZK

- **Status:** Accepted
- **Date:** 2026-06-08
- **Context:** The product promise (spec + Wiser) is that parents see **patterns, not content**, and that raw activity stays on the principal's side of a "zero-knowledge boundary." For Alpha on Supabase, raw export bytes are processed server-side during parsing, so *cryptographic* zero-knowledge is not achievable. We must implement the strongest honest approximation and document it plainly.

## Decision

1. **Derived-only persistence.** Only `signals` (derived, privacy-classified) and governance objects are stored durably. There is **no raw-content column** anywhere a parent can reach.
2. **Parse-and-destroy.** Raw GDPR/Instagram exports land in a short-retention Storage bucket, are parsed inside the `ingest-export` Edge Function, produce `Signal[]` + a raw-exclusion manifest, and the raw payload is destroyed before the function returns.
3. **Single boundary surface.** Raw bytes and the LLM are touched **only** inside Edge Functions. Nothing else in the system sees raw content.
4. **Visibility independent of collection.** Deny-by-default Postgres RLS decides who sees what; a child sees own raw + patterns, a guardian sees derived-safe signals only.
5. **Honest documentation.** `docs/privacy/zk-boundary.md` states exactly what "zero-knowledge" does and does not mean in Alpha, and names on-device parsing as the post-alpha path toward the spec's principal-controlled boundary.

## Consequences

- An automated **visibility test** (guardian cannot read raw rows) is a required CI gate; any RLS change is review-gated.
- AI quality is bounded by what derived signals carry, not raw content — accepted trade-off.
- Marketing/stakeholder language must not overclaim ZK; this ADR is the reference.

## Alternatives considered

- **On-device parsing (raw never leaves device).** Closest to the spec ideal; deferred — too much for alpha timeline, revisit post-alpha.
- **Confidential computing / enclaves (Nitro, SGX).** Strong but heavy operationally; premature for 8–12 families.
- **Client-side encryption with server-blind processing.** Defeats server-side parse + AI; deferred to the future Context Kernel.
