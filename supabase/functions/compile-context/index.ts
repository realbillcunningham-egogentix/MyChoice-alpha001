// Supabase Edge Function (Deno) — the EgoGentix seam (ADR-0004). Returns a CompiledProjection shape.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  // TODO(sprint-001): back this with packages/governance-engine compileContext over RLS-filtered signals.
  return Response.json({
    authorized_fields: ["category", "type", "value", "window_start", "window_end", "confidence"],
    denied_fields: ["raw_content"],
    derived_signals: [],
    obligations: ["no_diagnosis"],
    audit_ref: crypto.randomUUID(),
  });
});
