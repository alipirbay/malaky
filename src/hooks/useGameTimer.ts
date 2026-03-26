import { useState, useRef, useCallback, useEffect } from "react";

interface UseGameTimerOptions {
  totalDuration: number;
  isAutoTimer: boolean;
  currentCardIndex: number;
  onTimerDone: () => void;
}

export function useGameTimer({
  totalDuration,
  isAutoTimer,
  currentCardIndex,
  onTimerDone,
}: UseGameTimerOptions) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset on card change
  useEffect(() => {
    setTimerRunning(false);
    setTimerDone(false);
    setTimeLeft(totalDuration);
    clearTimer();
    if (isAutoTimer) setTimerRunning(true);
  }, [currentCardIndex, totalDuration, isAutoTimer, clearTimer]);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setTimerDone(true);
          clearTimer();
          onTimerDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimer();
  }, [timerRunning, clearTimer, onTimerDone]);

  const startTimer = useCallback(() => {
    setTimeLeft(totalDuration);
    setTimerDone(false);
    setTimerRunning(true);
  }, [totalDuration]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerDone(false);
    setTimeLeft(totalDuration);
    clearTimer();
  }, [totalDuration, clearTimer]);

  return { timeLeft, timerRunning, timerDone, startTimer, resetTimer, clearTimer };
}
