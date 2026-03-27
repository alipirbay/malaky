import { useEffect, useRef, useState, useCallback } from "react";

type TiltAction = "found" | "pass" | null;

interface UseDeviceTiltOptions {
  enabled: boolean;
  onFound: () => void;
  onPass: () => void;
  cooldownMs?: number;
  foundThreshold?: number;  // Beta degrees for tilt forward (found)
  passThreshold?: number;   // Beta degrees for tilt backward (pass)
}

interface UseDeviceTiltReturn {
  tiltSupported: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useDeviceTilt({
  enabled,
  onFound,
  onPass,
  cooldownMs = 1200,
  foundThreshold = 50,
  passThreshold = -30,
}: UseDeviceTiltOptions): UseDeviceTiltReturn {
  const [tiltSupported, setTiltSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const lastActionRef = useRef<number>(0);
  const lastActionTypeRef = useRef<TiltAction>(null);
  const baselineBetaRef = useRef<number | null>(null);
  const calibrationCountRef = useRef(0);

  // Check support
  useEffect(() => {
    const supported = "DeviceOrientationEvent" in window;
    setTiltSupported(supported);

    // On Android, permission is auto-granted
    if (supported && typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission !== "function") {
      setPermissionGranted(true);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        const granted = result === "granted";
        setPermissionGranted(granted);
        return granted;
      } catch {
        setPermissionGranted(false);
        return false;
      }
    }
    setPermissionGranted(true);
    return true;
  }, []);

  useEffect(() => {
    if (!enabled || !permissionGranted || !tiltSupported) return;

    // Reset baseline on enable
    baselineBetaRef.current = null;
    calibrationCountRef.current = 0;

    const handler = (event: DeviceOrientationEvent) => {
      const beta = event.beta; // Front-back tilt (-180 to 180)
      if (beta === null) return;

      // Calibrate baseline from first 5 readings (phone held upright ~80-90°)
      if (calibrationCountRef.current < 5) {
        calibrationCountRef.current++;
        if (baselineBetaRef.current === null) {
          baselineBetaRef.current = beta;
        } else {
          baselineBetaRef.current = baselineBetaRef.current * 0.7 + beta * 0.3;
        }
        return;
      }

      const baseline = baselineBetaRef.current ?? 80;
      const relativeBeta = beta - baseline;
      const now = Date.now();

      if (now - lastActionRef.current < cooldownMs) return;

      // Tilt forward (face down) → found
      if (relativeBeta > foundThreshold && lastActionTypeRef.current !== "found") {
        lastActionRef.current = now;
        lastActionTypeRef.current = "found";
        onFound();
        // Reset after cooldown
        setTimeout(() => { lastActionTypeRef.current = null; }, cooldownMs);
      }
      // Tilt backward → pass
      else if (relativeBeta < passThreshold && lastActionTypeRef.current !== "pass") {
        lastActionRef.current = now;
        lastActionTypeRef.current = "pass";
        onPass();
        setTimeout(() => { lastActionTypeRef.current = null; }, cooldownMs);
      }
    };

    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [enabled, permissionGranted, tiltSupported, onFound, onPass, cooldownMs, foundThreshold, passThreshold]);

  return { tiltSupported, permissionGranted, requestPermission };
}
