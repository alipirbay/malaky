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
    let interval: ReturnType<typeof setInterval>;

    const heartbeat = async () => {
      try {
        await supabase.from("active_sessions").upsert(
          { session_id: sessionId.current, last_seen: new Date().toISOString() },
          { onConflict: "session_id" }
        );
        const { data } = await supabase.rpc("get_active_users_count");
        if (typeof data === "number") setCount(data);

        // Probabilistic cleanup (~1% chance)
        if (Math.random() < 0.01) {
          void supabase.rpc("cleanup_old_sessions");
        }
      } catch (e) {
        console.warn("Heartbeat failed:", e);
      }
    };

    const start = () => {
      heartbeat();
      interval = setInterval(heartbeat, 60_000); // 60s instead of 30s
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return count;
}
