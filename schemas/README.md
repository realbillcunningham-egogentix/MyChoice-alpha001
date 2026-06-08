# Canonical schemas

The **source of truth** for all domain types is the TypeScript + Zod definitions in
[`packages/domain`](../packages/domain). The Postgres schema in
[`supabase/migrations`](../supabase/migrations) is kept consistent with it.

Do not define a Signal, Agreement, or identity type anywhere else. Import from
`@mychoice/domain` and validate at every boundary with the exported Zod schemas.
