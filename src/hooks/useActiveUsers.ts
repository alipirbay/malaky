import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "malaky-session-id";
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
  const cleanedUp = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const heartbeat = async () => {
      if (cancelled || document.hidden) return;
      try {
        await supabase.from("active_sessions").upsert(
          { session_id: sessionId.current, last_seen: new Date().toISOString() },
          { onConflict: "session_id" }
        );
        if (cancelled) return;
        const { data } = await supabase.rpc("get_active_users_count");
        if (!cancelled && typeof data === "number") setCount(data);

        // Cleanup once per session
        if (!cleanedUp.current) {
          cleanedUp.current = true;
          void supabase.rpc("cleanup_old_sessions");
        }
      } catch (e) {
        console.warn("Heartbeat failed:", e);
      }
    };

    const start = () => {
      heartbeat();
      interval = setInterval(heartbeat, HEARTBEAT_INTERVAL);
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
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return count;
}
