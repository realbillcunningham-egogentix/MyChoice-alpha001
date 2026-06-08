// Supabase Edge Function (Deno) — Policy Broker boundary.
// The ONLY place raw export bytes exist. Contract: parse -> emit signals -> DESTROY raw (ADR-0002).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  // TODO(sprint-001):
  // 1. Download the uploaded export from the short-retention storage bucket.
  // 2. Parse in-memory with @mychoice/parser -> { signals, manifest }.
  // 3. Insert signals (service role) + write audit_event(action='ingest').
  // 4. DELETE the raw object from storage; set ingest_runs.raw_destroyed_at.
  return Response.json({ ok: true, signals_written: 0, raw_retained: false });
});
