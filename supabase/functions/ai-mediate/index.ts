// Supabase Edge Function (Deno) — role-scoped AI over DERIVED SIGNALS ONLY (never raw content).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const { audience = "shared" } = await req.json().catch(() => ({ audience: "shared" }));
  // TODO(sprint-001):
  // 1. compileContext({ consumer: 'ai_mediate', ... }) -> derived signals + obligations.
  // 2. Call the LLM with a role-scoped prompt + agreement-aware guardrails.
  // 3. Enforce obligations (no diagnosis; human review for governance changes).
  // 4. Persist a recommendation row; write audit_event.
  const suggestion =
    audience === "parent"
      ? "Conversation starter: ask about evening routines this week."
      : "Something to think about: your late nights crept up — want a wind-down reminder?";
  return Response.json({ audience, suggestion, obligations: ["no_diagnosis"] });
});
