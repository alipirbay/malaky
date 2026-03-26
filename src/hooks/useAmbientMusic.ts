import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import type { Vibe } from "@/data/types";

/**
 * Procedural ambient music engine — Web Audio API
 * Each vibe has a unique mood. "mada" vibe includes a salegy-inspired
 * rhythmic easter egg 🇲🇬
 */

// ── Musical scales (MIDI note numbers → frequencies) ──

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 784.0, A5: 880.0,
  "Eb3": 155.56, "Bb3": 233.08, "Eb4": 311.13, "Bb4": 466.16,
  "Ab3": 207.65, "Ab4": 415.30, "Db4": 277.18, "Gb4": 369.99,
  "F#3": 185.0, "F#4": 369.99,
};

// ── Vibe mood configurations ──

interface VibeMood {
  scale: number[];       // frequencies
  tempo: number;         // BPM
  bassFreq: number;
  padType: OscillatorType;
  padDetune: number;     // cents
  filterFreq: number;
  filterQ: number;
  padVolume: number;
  bassVolume: number;
  melodyVolume: number;
  swing: number;         // 0–0.3
  hasDrums: boolean;
  drumPattern?: number[];
  reverb: number;        // 0–1 dry/wet
  label: string;
}

const VIBE_MOODS: Record<string, VibeMood> = {
  // ── Chill / Lofi ──
  soft: {
    scale: [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.E5],
    tempo: 70,
    bassFreq: NOTE_FREQ.C3,
    padType: "sine",
    padDetune: 8,
    filterFreq: 800,
    filterQ: 1,
    padVolume: 0.12,
    bassVolume: 0.08,
    melodyVolume: 0.06,
    swing: 0.1,
    hasDrums: false,
    reverb: 0.6,
    label: "Chill Lofi",
  },
  // ── Fun / Playful ──
  fun: {
    scale: [NOTE_FREQ.C4, NOTE_FREQ.D4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.D5],
    tempo: 110,
    bassFreq: NOTE_FREQ.C3,
    padType: "triangle",
    padDetune: 5,
    filterFreq: 2000,
    filterQ: 0.5,
    padVolume: 0.08,
    bassVolume: 0.07,
    melodyVolume: 0.09,
    swing: 0.05,
    hasDrums: true,
    drumPattern: [1, 0, 0, 1, 0, 0, 1, 0],
    reverb: 0.3,
    label: "Playful",
  },
  // ── Hot / Sensual ──
  hot: {
    scale: [NOTE_FREQ.D4, NOTE_FREQ.F4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.D5, NOTE_FREQ.F5],
    tempo: 85,
    bassFreq: NOTE_FREQ.D3,
    padType: "sine",
    padDetune: 12,
    filterFreq: 600,
    filterQ: 2,
    padVolume: 0.14,
    bassVolume: 0.1,
    melodyVolume: 0.05,
    swing: 0.15,
    hasDrums: true,
    drumPattern: [1, 0, 1, 0, 0, 1, 0, 0],
    reverb: 0.5,
    label: "Sensual R&B",
  },
  // ── Chaos / Intense ──
  chaos: {
    scale: [NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4, NOTE_FREQ.B4, NOTE_FREQ.D5, NOTE_FREQ.E5],
    tempo: 130,
    bassFreq: NOTE_FREQ.E3,
    padType: "sawtooth",
    padDetune: 15,
    filterFreq: 3000,
    filterQ: 1.5,
    padVolume: 0.06,
    bassVolume: 0.09,
    melodyVolume: 0.07,
    swing: 0,
    hasDrums: true,
    drumPattern: [1, 0, 1, 1, 0, 1, 1, 0],
    reverb: 0.2,
    label: "Intense",
  },
  // ── Couple / Romantic ──
  couple: {
    scale: [NOTE_FREQ.G4, NOTE_FREQ.B4, NOTE_FREQ.D5, NOTE_FREQ.E5, NOTE_FREQ.G5],
    tempo: 65,
    bassFreq: NOTE_FREQ.G3,
    padType: "sine",
    padDetune: 6,
    filterFreq: 700,
    filterQ: 1.5,
    padVolume: 0.15,
    bassVolume: 0.06,
    melodyVolume: 0.05,
    swing: 0.2,
    hasDrums: false,
    reverb: 0.7,
    label: "Romantic",
  },
  // ── Apéro / Jazzy ──
  apero: {
    scale: [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.Bb4, NOTE_FREQ.D5],
    tempo: 95,
    bassFreq: NOTE_FREQ.C3,
    padType: "triangle",
    padDetune: 10,
    filterFreq: 1200,
    filterQ: 0.8,
    padVolume: 0.1,
    bassVolume: 0.08,
    melodyVolume: 0.08,
    swing: 0.2,
    hasDrums: true,
    drumPattern: [1, 0, 0, 1, 0, 1, 0, 0],
    reverb: 0.4,
    label: "Jazz Lounge",
  },
  // ── 🇲🇬 Mada / Salegy-inspired Easter Egg ──
  mada: {
    scale: [NOTE_FREQ.G3, NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.D4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.A4],
    tempo: 125,
    bassFreq: NOTE_FREQ.G3,
    padType: "triangle",
    padDetune: 4,
    filterFreq: 2500,
    filterQ: 0.6,
    padVolume: 0.07,
    bassVolume: 0.1,
    melodyVolume: 0.1,
    swing: 0.08,
    hasDrums: true,
    drumPattern: [1, 0, 1, 0, 1, 1, 0, 1], // Salegy-like syncopation
    reverb: 0.25,
    label: "Salegy Vibes 🇲🇬",
  },
  // ── Confessions / Dark ambient ──
  confessions: {
    scale: [NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.D4, NOTE_FREQ.E4, NOTE_FREQ.G4],
    tempo: 60,
    bassFreq: NOTE_FREQ.A3,
    padType: "sine",
    padDetune: 18,
    filterFreq: 500,
    filterQ: 3,
    padVolume: 0.16,
    bassVolume: 0.05,
    melodyVolume: 0.04,
    swing: 0.25,
    hasDrums: false,
    reverb: 0.8,
    label: "Dark Ambient",
  },
  // ── VIP / Luxury ──
  vip: {
    scale: [NOTE_FREQ.D4, NOTE_FREQ.F4, NOTE_FREQ.A4, NOTE_FREQ.C5, NOTE_FREQ.E5],
    tempo: 100,
    bassFreq: NOTE_FREQ.D3,
    padType: "triangle",
    padDetune: 7,
    filterFreq: 1500,
    filterQ: 1,
    padVolume: 0.1,
    bassVolume: 0.08,
    melodyVolume: 0.07,
    swing: 0.12,
    hasDrums: true,
    drumPattern: [1, 0, 0, 0, 1, 0, 0, 1],
    reverb: 0.45,
    label: "Luxury Beats",
  },
  // ── After Dark / Deep ──
  afterdark: {
    scale: [NOTE_FREQ.Eb3, NOTE_FREQ.Bb3, NOTE_FREQ.Eb4, NOTE_FREQ.Ab4, NOTE_FREQ.Bb4],
    tempo: 75,
    bassFreq: NOTE_FREQ.Eb3,
    padType: "sawtooth",
    padDetune: 20,
    filterFreq: 400,
    filterQ: 4,
    padVolume: 0.12,
    bassVolume: 0.1,
    melodyVolume: 0.04,
    swing: 0.18,
    hasDrums: true,
    drumPattern: [1, 0, 0, 0, 0, 1, 0, 0],
    reverb: 0.7,
    label: "Deep Dark",
  },
};

// Culture Générale difficulties → use soft-like moods
const DIFFICULTY_MOOD_MAP: Record<string, string> = {
  facile: "soft",
  intermediaire: "fun",
  difficile: "chaos",
  expert: "afterdark",
};

// ── Audio engine ──

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private schedulerTimer: number | null = null;
  private currentBeat = 0;
  private mood: VibeMood | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  start(vibe: string, volume: number) {
    if (this.isPlaying) this.stop();
    
    const moodKey = DIFFICULTY_MOOD_MAP[vibe] ?? vibe;
    this.mood = VIBE_MOODS[moodKey] ?? VIBE_MOODS.soft;
    
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);

    // Simple reverb via convolver
    this.dryGain = this.ctx.createGain();
    this.reverbGain = this.ctx.createGain();
    this.convolver = this.ctx.createConvolver();

    const reverbAmount = this.mood.reverb;
    this.dryGain.gain.setValueAtTime(1 - reverbAmount * 0.5, this.ctx.currentTime);
    this.reverbGain.gain.setValueAtTime(reverbAmount * 0.6, this.ctx.currentTime);

    // Generate impulse response
    this.convolver.buffer = this.createReverbImpulse(2, 2);

    this.dryGain.connect(this.masterGain);
    this.convolver.connect(this.reverbGain).connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Create noise buffer for drums
    this.noiseBuffer = this.createNoiseBuffer();

    // Start scheduling loop
    this.isPlaying = true;
    this.currentBeat = 0;
    this.startPad();
    this.scheduleBeat();
  }

  stop() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.masterGain && this.ctx) {
      // Fade out
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
      const ctx = this.ctx;
      setTimeout(() => {
        try { ctx.close(); } catch { /* ignore */ }
      }, 600);
    }
    this.ctx = null;
    this.masterGain = null;
    this.convolver = null;
    this.mood = null;
  }

  setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol * 0.5, this.ctx.currentTime + 0.1);
    }
  }

  get playing() { return this.isPlaying; }

  // ── Pad (sustained chord) ──
  private startPad() {
    if (!this.ctx || !this.mood || !this.dryGain) return;

    const m = this.mood;
    // Play 2-3 notes as a pad chord
    const padNotes = m.scale.slice(0, 3);
    
    padNotes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = m.padType;
      osc.frequency.setValueAtTime(freq * 0.5, this.ctx!.currentTime); // One octave lower
      osc.detune.setValueAtTime(m.padDetune * (i - 1), this.ctx!.currentTime);
      gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      gain.gain.linearRampToValueAtTime(m.padVolume, this.ctx!.currentTime + 2);

      // Filter for warmth
      const filter = this.ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(m.filterFreq, this.ctx!.currentTime);
      filter.Q.setValueAtTime(m.filterQ, this.ctx!.currentTime);

      osc.connect(filter).connect(gain);
      gain.connect(this.dryGain!);
      gain.connect(this.convolver!);
      osc.start();

      // LFO for subtle movement
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(0.3 + i * 0.1, this.ctx!.currentTime);
      lfoGain.gain.setValueAtTime(m.padDetune * 2, this.ctx!.currentTime);
      lfo.connect(lfoGain).connect(osc.detune);
      lfo.start();
    });
  }

  // ── Beat scheduler ──
  private scheduleBeat() {
    if (!this.isPlaying || !this.ctx || !this.mood) return;

    const m = this.mood;
    const beatDuration = 60 / m.tempo;
    const swing = this.currentBeat % 2 === 1 ? m.swing * beatDuration : 0;

    // Melody — play a note every 2-4 beats
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
      // Hi-hat on off-beats
      if (this.currentBeat % 2 === 1) {
        this.playHiHat(swing);
      }
    }

    this.currentBeat++;

    // Schedule next beat
    this.schedulerTimer = window.setTimeout(() => {
      this.scheduleBeat();
    }, beatDuration * 1000);
  }

  private playMelodyNote(delay: number) {
    if (!this.ctx || !this.mood || !this.dryGain) return;
    const m = this.mood;
    const freq = m.scale[Math.floor(Math.random() * m.scale.length)];
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(m.filterFreq * 1.5, t);

    const duration = 0.3 + Math.random() * 0.5;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(m.melodyVolume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter).connect(gain);
    gain.connect(this.dryGain);
    gain.connect(this.convolver!);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  private playBass(delay: number) {
    if (!this.ctx || !this.mood || !this.dryGain) return;
    const m = this.mood;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Alternate bass notes slightly
    const bassVariation = Math.random() < 0.3 ? m.bassFreq * 1.5 : m.bassFreq;
    osc.frequency.setValueAtTime(bassVariation, t);

    const duration = 60 / m.tempo * 2;
    gain.gain.setValueAtTime(m.bassVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain).connect(this.dryGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  private playDrum(delay: number) {
    if (!this.ctx || !this.mood || !this.dryGain) return;
    const t = this.ctx.currentTime + delay;

    // Kick-like sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(this.dryGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private playHiHat(delay: number) {
    if (!this.ctx || !this.mood || !this.dryGain || !this.noiseBuffer) return;
    const t = this.ctx.currentTime + delay;

    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = "highpass";
    filter.frequency.setValueAtTime(8000, t);
    gain.gain.setValueAtTime(0.03, t);
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

// Singleton engine
const engine = new AmbientMusicEngine();

/**
 * Hook to manage ambient music during gameplay.
 * Starts when `active` is true, stops on unmount or when deactivated.
 */
export function useAmbientMusic(active: boolean, vibe: Vibe | null) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const musicActiveRef = useRef(false);

  const vol = soundVolume / 100;

  // Start/stop based on active + soundEnabled
  useEffect(() => {
    if (active && soundEnabled && vibe) {
      engine.start(vibe, vol);
      musicActiveRef.current = true;
    } else if (musicActiveRef.current) {
      engine.stop();
      musicActiveRef.current = false;
    }

    return () => {
      if (musicActiveRef.current) {
        engine.stop();
        musicActiveRef.current = false;
      }
    };
  }, [active, soundEnabled, vibe]); // eslint-disable-line react-hooks/exhaustive-deps

  // Volume changes
  useEffect(() => {
    if (musicActiveRef.current) {
      engine.setVolume(vol);
    }
  }, [vol]);

  const toggleMusic = useCallback(() => {
    if (engine.playing) {
      engine.stop();
      musicActiveRef.current = false;
    } else if (vibe && soundEnabled) {
      engine.start(vibe, vol);
      musicActiveRef.current = true;
    }
  }, [vibe, soundEnabled, vol]);

  return { isPlaying: engine.playing, toggleMusic };
}
