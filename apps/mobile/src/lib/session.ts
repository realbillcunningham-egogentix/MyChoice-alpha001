import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Role } from "@mychoice/domain";

export interface SessionState {
  loading: boolean;
  userId: string | null;
  role: Role | null;
}

/**
 * Resolves the signed-in user's app id + role. Role drives which shell (parent/child)
 * the router shows. TODO(sprint-001): replace the membership query with a `me` RPC/view.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, userId: null, role: null });
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const authId = data.session?.user.id ?? null;
      if (!authId) {
        if (active) setState({ loading: false, userId: null, role: null });
        return;
      }
      const { data: rows } = await supabase.from("memberships").select("user_id, role").limit(1);
      const row = rows?.[0] as { user_id: string; role: Role } | undefined;
      if (active) setState({ loading: false, userId: row?.user_id ?? null, role: row?.role ?? null });
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}
