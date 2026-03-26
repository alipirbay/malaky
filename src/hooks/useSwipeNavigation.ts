import { useState, useCallback } from "react";
import { GAME_LIMITS } from "@/data/constants";

interface UseSwipeNavigationOptions {
  canNavigate: boolean;
  onSwipeLeft: () => void;
}

export function useSwipeNavigation({
  canNavigate,
  onSwipeLeft,
}: UseSwipeNavigationOptions) {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const diff = touchStart - e.changedTouches[0].clientX;
      if (
        Math.abs(diff) > GAME_LIMITS.SWIPE_THRESHOLD_PX &&
        diff > 0 &&
        canNavigate
      ) {
        onSwipeLeft();
      }
      setTouchStart(null);
    },
    [touchStart, canNavigate, onSwipeLeft]
  );

  return { handleTouchStart, handleTouchEnd };
}
