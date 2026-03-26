import { useEffect, useRef, useCallback, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { ambientEngine } from "@/lib/ambientEngine";
import type { Vibe } from "@/data/types";

/**
 * React hook for ambient music — thin wrapper around AmbientMusicEngine.
 */
export function useAmbientMusic(active: boolean, vibe: Vibe | null) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeRef = useRef(false);
  const vol = soundVolume / 100;

  // Sync engine state → React state
  useEffect(() => {
    ambientEngine.setOnChange(setIsPlaying);
    return () => { ambientEngine.setOnChange(null); };
  }, []);

  // Start/stop based on active + soundEnabled
  useEffect(() => {
    if (active && soundEnabled && vibe) {
      ambientEngine.start(vibe, vol);
      activeRef.current = true;
    } else if (activeRef.current) {
      ambientEngine.stop();
      activeRef.current = false;
    }
    return () => {
      if (activeRef.current) {
        ambientEngine.stop();
        activeRef.current = false;
      }
    };
    // vol intentionally excluded — handled by separate effect
  }, [active, soundEnabled, vibe]); // eslint-disable-line react-hooks/exhaustive-deps

  // Volume sync
  useEffect(() => {
    if (activeRef.current) ambientEngine.setVolume(vol);
  }, [vol]);

  const toggleMusic = useCallback(() => {
    if (ambientEngine.playing) {
      ambientEngine.stop();
      activeRef.current = false;
    } else if (vibe && soundEnabled) {
      ambientEngine.start(vibe, vol);
      activeRef.current = true;
    }
  }, [vibe, soundEnabled, vol]);

  return { isPlaying, toggleMusic };
}
