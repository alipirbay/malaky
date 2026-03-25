import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "malaky-session-id";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useActiveUsers() {
  const [count, setCount] = useState<number>(0);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    const heartbeat = async () => {
      await supabase.from("active_sessions").upsert(
        { session_id: sessionId.current, last_seen: new Date().toISOString() },
        { onConflict: "session_id" }
      );
      const { data } = await supabase.rpc("get_active_users_count");
      if (typeof data === "number") setCount(data);

      // Probabilistic cleanup of old sessions (~1% chance per heartbeat)
      if (Math.random() < 0.01) {
        supabase.rpc("cleanup_old_sessions");
      }
    };

    heartbeat();
    const interval = setInterval(heartbeat, 30_000);

    return () => clearInterval(interval);
  }, []);

  return count;
}
