import { useCallback, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(freq: number, duration: number, volume: number, type: OscillatorType = "sine") {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Pre-generated noise buffer — created once, reused for all whoosh sounds
let cachedNoiseBuffer: AudioBuffer | null = null;
const NOISE_DURATION = 0.25;

function getNoiseBuffer(): AudioBuffer {
  if (cachedNoiseBuffer) return cachedNoiseBuffer;
  const ctx = getCtx();
  const bufferSize = Math.ceil(ctx.sampleRate * NOISE_DURATION);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

function playNoise(volume: number) {
  const ctx = getCtx();
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

export function useSounds() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const vibrationEnabled = useGameStore((s) => s.vibrationEnabled);
  const tickRef = useRef<number | null>(null);

  const vol = soundVolume / 100;

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (vibrationEnabled && navigator.vibrate) navigator.vibrate(pattern);
    },
    [vibrationEnabled]
  );

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    playTone(800, 0.08, vol, "sine");
    playTone(1200, 0.05, vol * 0.5, "sine");
  }, [soundEnabled, vol]);

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    playTone(1000, 0.04, vol * 0.6, "sine");
  }, [soundEnabled, vol]);

  const playBuzzer = useCallback(() => {
    if (!soundEnabled) return;
    playTone(220, 0.4, vol, "sawtooth");
    playTone(180, 0.5, vol * 0.7, "square");
    vibrate([100, 50, 100, 50, 200]);
  }, [soundEnabled, vol, vibrate]);

  const playWhoosh = useCallback(() => {
    if (!soundEnabled) return;
    playNoise(vol);
  }, [soundEnabled, vol]);

  const playConfirm = useCallback(() => {
    if (!soundEnabled) return;
    playTone(523, 0.1, vol, "sine");
    setTimeout(() => playTone(659, 0.1, vol, "sine"), 80);
    setTimeout(() => playTone(784, 0.15, vol, "sine"), 160);
    vibrate(50);
  }, [soundEnabled, vol, vibrate]);

  const startTickLoop = useCallback(
    (intervalMs = 1000) => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = window.setInterval(() => {
        playTick();
      }, intervalMs);
    },
    [playTick]
  );

  const stopTickLoop = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  return { playClick, playTick, playBuzzer, playWhoosh, playConfirm, startTickLoop, stopTickLoop, vibrate };
}
