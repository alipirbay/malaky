import { useEffect, useRef, useCallback, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import type { Vibe } from "@/data/types";

/**
 * Procedural ambient music engine — Web Audio API
 * Each vibe has a unique mood. "mada" vibe includes a salegy-inspired
 * rhythmic easter egg 🇲🇬
 */

// ── Musical scales ──

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 784.0, A5: 880.0,
  Eb3: 155.56, Bb3: 233.08, Eb4: 311.13, Bb4: 466.16,
  Ab3: 207.65, Ab4: 415.30, Db4: 277.18, Gb4: 369.99,
};

// ── Vibe mood configurations ──

interface VibeMood {
  scale: number[];
  tempo: number;
  bassFreq: number;
  padType: OscillatorType;
  padDetune: number;
  filterFreq: number;
  filterQ: number;
  padVolume: number;
  bassVolume: number;
  melodyVolume: number;
  swing: number;
  hasDrums: boolean;
  drumPattern?: number[];
  reverb: number;
}

const VIBE_MOODS: Record<string, VibeMood> = {
  soft: {
    scale: [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.E5],
    tempo: 70, bassFreq: NOTE_FREQ.C3, padType: "sine", padDetune: 8,
    filterFreq: 800, filterQ: 1, padVolume: 0.12, bassVolume: 0.08,
    melodyVolume: 0.06, swing: 0.1, hasDrums: false, reverb: 0.6,
  },
  fun: {
    scale: [NOTE_FREQ.C4, NOTE_FREQ.D4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.D5],
    tempo: 110, bassFreq: NOTE_FREQ.C3, padType: "triangle", padDetune: 5,
    filterFreq: 2000, filterQ: 0.5, padVolume: 0.08, bassVolume: 0.07,
    melodyVolume: 0.09, swing: 0.05, hasDrums: true,
    drumPattern: [1, 0, 0, 1, 0, 0, 1, 0], reverb: 0.3,
  },
  hot: {
    scale: [NOTE_FREQ.D4, NOTE_FREQ.F4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.D5, NOTE_FREQ.F5],
    tempo: 85, bassFreq: NOTE_FREQ.D3, padType: "sine", padDetune: 12,
    filterFreq: 600, filterQ: 2, padVolume: 0.14, bassVolume: 0.1,
    melodyVolume: 0.05, swing: 0.15, hasDrums: true,
    drumPattern: [1, 0, 1, 0, 0, 1, 0, 0], reverb: 0.5,
  },
  chaos: {
    scale: [NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4, NOTE_FREQ.B4, NOTE_FREQ.D5, NOTE_FREQ.E5],
    tempo: 130, bassFreq: NOTE_FREQ.E3, padType: "sawtooth", padDetune: 15,
    filterFreq: 3000, filterQ: 1.5, padVolume: 0.06, bassVolume: 0.09,
    melodyVolume: 0.07, swing: 0, hasDrums: true,
    drumPattern: [1, 0, 1, 1, 0, 1, 1, 0], reverb: 0.2,
  },
  couple: {
    scale: [NOTE_FREQ.G4, NOTE_FREQ.B4, NOTE_FREQ.D5, NOTE_FREQ.E5, NOTE_FREQ.G5],
    tempo: 65, bassFreq: NOTE_FREQ.G3, padType: "sine", padDetune: 6,
    filterFreq: 700, filterQ: 1.5, padVolume: 0.15, bassVolume: 0.06,
    melodyVolume: 0.05, swing: 0.2, hasDrums: false, reverb: 0.7,
  },
  apero: {
    scale: [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.Bb4, NOTE_FREQ.D5],
    tempo: 95, bassFreq: NOTE_FREQ.C3, padType: "triangle", padDetune: 10,
    filterFreq: 1200, filterQ: 0.8, padVolume: 0.1, bassVolume: 0.08,
    melodyVolume: 0.08, swing: 0.2, hasDrums: true,
    drumPattern: [1, 0, 0, 1, 0, 1, 0, 0], reverb: 0.4,
  },
  mada: {
    scale: [NOTE_FREQ.G3, NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.D4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4],
    tempo: 125, bassFreq: NOTE_FREQ.G3, padType: "triangle", padDetune: 4,
    filterFreq: 2500, filterQ: 0.6, padVolume: 0.07, bassVolume: 0.1,
    melodyVolume: 0.1, swing: 0.08, hasDrums: true,
    drumPattern: [1, 0, 1, 0, 1, 1, 0, 1], reverb: 0.25,
  },
  confessions: {
    scale: [NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.D4, NOTE_FREQ.E4, NOTE_FREQ.G4],
    tempo: 60, bassFreq: NOTE_FREQ.A3, padType: "sine", padDetune: 18,
    filterFreq: 500, filterQ: 3, padVolume: 0.16, bassVolume: 0.05,
    melodyVolume: 0.04, swing: 0.25, hasDrums: false, reverb: 0.8,
  },
  vip: {
    scale: [NOTE_FREQ.D4, NOTE_FREQ.F4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.E5],
    tempo: 100, bassFreq: NOTE_FREQ.D3, padType: "triangle", padDetune: 7,
    filterFreq: 1500, filterQ: 1, padVolume: 0.1, bassVolume: 0.08,
    melodyVolume: 0.07, swing: 0.12, hasDrums: true,
    drumPattern: [1, 0, 0, 0, 1, 0, 0, 1], reverb: 0.45,
  },
  afterdark: {
    scale: [NOTE_FREQ.Eb3, NOTE_FREQ.Bb3, NOTE_FREQ.Eb4, NOTE_FREQ.Ab4, NOTE_FREQ.Bb4],
    tempo: 75, bassFreq: NOTE_FREQ.Eb3, padType: "sawtooth", padDetune: 20,
    filterFreq: 400, filterQ: 4, padVolume: 0.12, bassVolume: 0.1,
    melodyVolume: 0.04, swing: 0.18, hasDrums: true,
    drumPattern: [1, 0, 0, 0, 0, 1, 0, 0], reverb: 0.7,
  },
};

const DIFFICULTY_MOOD_MAP: Record<string, string> = {
  facile: "soft",
  intermediaire: "fun",
  difficile: "chaos",
  expert: "afterdark",
};

// ── Audio engine with proper lifecycle ──

type OnChangeCallback = (playing: boolean) => void;

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _isPlaying = false;
  private schedulerTimer: number | null = null;
  private currentBeat = 0;
  private mood: VibeMood | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private activeNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private onChange: OnChangeCallback | null = null;
  private stopInProgress = false;

  setOnChange(cb: OnChangeCallback | null) {
    this.onChange = cb;
  }

  private setPlaying(val: boolean) {
    this._isPlaying = val;
    this.onChange?.(val);
  }

  get playing() { return this._isPlaying; }

  async start(vibe: string, volume: number) {
    // Prevent race conditions
    if (this.stopInProgress) {
      await new Promise(r => setTimeout(r, 150));
    }
    if (this._isPlaying) {
      this.stopSync();
    }

    const moodKey = DIFFICULTY_MOOD_MAP[vibe] ?? vibe;
    this.mood = VIBE_MOODS[moodKey] ?? VIBE_MOODS.soft;

    try {
      this.ctx = new AudioContext();
      // Handle suspended state (browser autoplay policy)
      if (this.ctx.state === "suspended") {
        await this.ctx.resume().catch(() => {});
      }
      // If still not running after resume attempt, bail gracefully
      if (this.ctx.state !== "running") {
        try { this.ctx.close(); } catch { /* ignore */ }
        this.ctx = null;
        return;
      }
    } catch {
      this.ctx = null;
      return; // AudioContext not available
    }

    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      // Fade in over 1 second
      this.masterGain.gain.linearRampToValueAtTime(
        Math.min(volume * 0.4, 0.35),
        this.ctx.currentTime + 1
      );

      // Reverb chain
      this.dryGain = this.ctx.createGain();
      this.reverbGain = this.ctx.createGain();
      this.convolver = this.ctx.createConvolver();

      const reverbAmount = this.mood.reverb;
      this.dryGain.gain.setValueAtTime(1 - reverbAmount * 0.5, this.ctx.currentTime);
      this.reverbGain.gain.setValueAtTime(reverbAmount * 0.5, this.ctx.currentTime);

      this.convolver.buffer = this.createReverbImpulse(1.5, 2.5);

      this.dryGain.connect(this.masterGain);
      this.convolver.connect(this.reverbGain).connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.noiseBuffer = this.createNoiseBuffer();
      this.activeNodes = [];
      this.currentBeat = 0;
      this.setPlaying(true);
      this.startPad();
      this.scheduleBeat();
    } catch (e) {
      console.debug("[AmbientMusic] Start failed:", e);
      this.stopSync();
    }
  }

  private stopSync() {
    this.stopInProgress = true;
    this.setPlaying(false);

    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    // Stop all tracked nodes immediately
    for (const node of this.activeNodes) {
      try { node.stop(0); } catch { /* already stopped */ }
    }
    this.activeNodes = [];

    if (this.ctx) {
      try { this.ctx.close(); } catch { /* ignore */ }
    }

    this.ctx = null;
    this.masterGain = null;
    this.convolver = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.mood = null;
    this.noiseBuffer = null;
    this.stopInProgress = false;
  }

  stop() {
    if (!this._isPlaying && !this.ctx) return;

    // Graceful fade if possible
    if (this.masterGain && this.ctx && this.ctx.state !== "closed") {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      } catch { /* ignore */ }

      // Cleanup after fade
      setTimeout(() => this.stopSync(), 350);
      // Immediately mark as not playing for UI
      this.setPlaying(false);
      if (this.schedulerTimer) {
        clearTimeout(this.schedulerTimer);
        this.schedulerTimer = null;
      }
    } else {
      this.stopSync();
    }
  }

  setVolume(vol: number) {
    if (this.masterGain && this.ctx && this.ctx.state !== "closed") {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(
          Math.min(vol * 0.4, 0.35),
          this.ctx.currentTime + 0.1
        );
      } catch { /* ignore */ }
    }
  }

  // ── Pad ──
  private startPad() {
    if (!this.ctx || !this.mood || !this.dryGain || !this.convolver) return;
    const m = this.mood;
    const padNotes = m.scale.slice(0, 3);
    const t = this.ctx.currentTime;

    padNotes.forEach((freq, i) => {
      if (!this.ctx || !this.dryGain || !this.convolver) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = m.padType;
      osc.frequency.setValueAtTime(freq * 0.5, t);
      osc.detune.setValueAtTime(m.padDetune * (i - 1), t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(m.filterFreq, t);
      filter.Q.setValueAtTime(m.filterQ, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(m.padVolume, t + 2);

      osc.connect(filter).connect(gain);
      gain.connect(this.dryGain);
      gain.connect(this.convolver);
      osc.start(t);

      this.activeNodes.push(osc);

      // LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.3 + i * 0.1, t);
      lfoGain.gain.setValueAtTime(m.padDetune * 2, t);
      lfo.connect(lfoGain).connect(osc.detune);
      lfo.start(t);
      this.activeNodes.push(lfo);
    });
  }

  // ── Beat scheduler ──
  private scheduleBeat() {
    if (!this._isPlaying || !this.ctx || !this.mood) return;

    const m = this.mood;
    const beatDuration = 60 / m.tempo;
    const swing = this.currentBeat % 2 === 1 ? m.swing * beatDuration : 0;

    // Melody — every 2-4 beats
    if (this.currentBeat % (Math.random() < 0.4 ? 2 : 4) === 0) {
      this.playMelodyNote(swing);
    }

    // Bass — every 4 beats
    if (this.currentBeat % 4 === 0) {
      this.playBass(swing);
    }

    // Drums
    if (m.hasDrums && m.drumPattern) {
      const patIdx = this.currentBeat % m.drumPattern.length;
      if (m.drumPattern[patIdx]) {
        this.playDrum(swing);
      }
      if (this.currentBeat % 2 === 1) {
        this.playHiHat(swing);
      }
    }

    this.currentBeat++;

    this.schedulerTimer = window.setTimeout(() => {
      this.scheduleBeat();
    }, beatDuration * 1000);
  }

  private playMelodyNote(delay: number) {
    if (!this.ctx || !this.mood || !this.dryGain || !this.convolver) return;
    const m = this.mood;
    const freq = m.scale[Math.floor(Math.random() * m.scale.length)];
    const t = this.ctx.currentTime + delay;
    const duration = 0.3 + Math.random() * 0.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(m.filterFreq * 1.5, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(m.melodyVolume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter).connect(gain);
    gain.connect(this.dryGain);
    gain.connect(this.convolver);
    osc.start(t);
    osc.stop(t + duration + 0.05);
    // Short-lived nodes self-cleanup, no need to track
  }

  private playBass(delay: number) {
    if (!this.ctx || !this.mood || !this.dryGain) return;
    const m = this.mood;
    const t = this.ctx.currentTime + delay;
    const duration = 60 / m.tempo * 2;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const bassVariation = Math.random() < 0.3 ? m.bassFreq * 1.5 : m.bassFreq;
    osc.frequency.setValueAtTime(bassVariation, t);
    gain.gain.setValueAtTime(m.bassVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain).connect(this.dryGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  private playDrum(delay: number) {
    if (!this.ctx || !this.dryGain) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(this.dryGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private playHiHat(delay: number) {
    if (!this.ctx || !this.dryGain || !this.noiseBuffer) return;
    const t = this.ctx.currentTime + delay;

    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = "highpass";
    filter.frequency.setValueAtTime(8000, t);
    gain.gain.setValueAtTime(0.025, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    source.connect(filter).connect(gain).connect(this.dryGain);
    source.start(t);
    source.stop(t + 0.08);
  }

  // ── Utilities ──
  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    const length = this.ctx!.sampleRate * duration;
    const buffer = this.ctx!.createBuffer(2, length, this.ctx!.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  private createNoiseBuffer(): AudioBuffer {
    const length = this.ctx!.sampleRate * 0.1;
    const buffer = this.ctx!.createBuffer(1, length, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

// Singleton
const engine = new AmbientMusicEngine();

/**
 * Hook to manage ambient music during gameplay.
 */
export function useAmbientMusic(active: boolean, vibe: Vibe | null) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeRef = useRef(false);

  const vol = soundVolume / 100;

  // Sync engine state → React state
  useEffect(() => {
    engine.setOnChange(setIsPlaying);
    return () => { engine.setOnChange(null); };
  }, []);

  // Start/stop based on active + soundEnabled
  useEffect(() => {
    if (active && soundEnabled && vibe) {
      engine.start(vibe, vol);
      activeRef.current = true;
    } else if (activeRef.current) {
      engine.stop();
      activeRef.current = false;
    }

    return () => {
      if (activeRef.current) {
        engine.stop();
        activeRef.current = false;
      }
    };
  }, [active, soundEnabled, vibe]); // eslint-disable-line react-hooks/exhaustive-deps

  // Volume changes
  useEffect(() => {
    if (activeRef.current) {
      engine.setVolume(vol);
    }
  }, [vol]);

  const toggleMusic = useCallback(() => {
    if (engine.playing) {
      engine.stop();
      activeRef.current = false;
    } else if (vibe && soundEnabled) {
      engine.start(vibe, vol);
      activeRef.current = true;
    }
  }, [vibe, soundEnabled, vol]);

  return { isPlaying, toggleMusic };
}
