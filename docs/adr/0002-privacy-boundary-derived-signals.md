# ADR 0002 — Privacy boundary: derived signals, parse-and-destroy, honest ZK

- **Status:** Accepted (amended v1.1)
- **Date:** 2026-06-08
- **Context:** The product promise (spec + Wiser) is that parents see **patterns, not content**, and that raw activity stays on the principal's side of a "zero-knowledge boundary." For Alpha on Supabase, raw export bytes are processed server-side during parsing, so *cryptographic* zero-knowledge is not achievable. We implement the strongest honest approximation and document it plainly.

## Decision

1. **Derived-only persistence.** Only `signals` (derived, privacy-classified) and governance objects are stored durably. There is **no raw-content column** anywhere a parent can reach.
2. **Parse-and-destroy.** Raw GDPR/Instagram exports land in a short-retention bucket, are parsed inside the `ingest-export` Edge Function, produce `Signal[]` + a raw-exclusion manifest, and the raw payload is destroyed before the function returns (`ingest_runs.raw_destroyed_at`).
3. **No raw browsing after parse (v1.1).** Alpha does **not** persist raw social content for later viewing. The only raw access is the **child viewing their own uploaded source files during the active processing window**; once parsing completes, the raw payload is gone. Persisting raw content for browsing is an explicit future decision, not a default.
4. **Single boundary surface.** Raw bytes and the LLM are touched **only** inside Edge Functions.
5. **Visibility independent of collection.** Deny-by-default Postgres RLS decides who sees what; `pilot_operator` sees audit metadata only, never content.
6. **Honest documentation.** `docs/privacy/zk-boundary.md` states what "zero-knowledge" does and does not mean in Alpha, and names on-device parsing as the post-alpha path.

## Consequences

- An automated **visibility test** (guardian cannot read raw rows; child raw access only inside the processing window) is a required CI gate; any RLS change is review-gated.
- AI quality is bounded by what derived signals carry — accepted trade-off.
- Deletion of raw artifacts is part of the lifecycle in ADR-0005.

## Alternatives considered

- **On-device parsing (raw never leaves device)** — closest to the spec ideal; deferred.
- **Confidential computing / enclaves** — premature for 8–12 families.
- **Persisting raw content for child browsing** — rejected for Alpha; would expand the breach surface with no pilot need.
