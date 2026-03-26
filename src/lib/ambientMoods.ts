/**
 * Ambient music mood definitions per vibe.
 * Pure data — no side effects.
 */

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 784.0, A5: 880.0,
  Eb3: 155.56, Bb3: 233.08, Eb4: 311.13, Bb4: 466.16,
  Ab3: 207.65, Ab4: 415.30,
};

export interface VibeMood {
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

export const VIBE_MOODS: Record<string, VibeMood> = {
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

export const DIFFICULTY_MOOD_MAP: Record<string, string> = {
  facile: "soft",
  intermediaire: "fun",
  difficile: "chaos",
  expert: "afterdark",
};

/** Resolve a vibe key to a VibeMood, with fallback. */
export function getMood(vibe: string): VibeMood {
  const key = DIFFICULTY_MOOD_MAP[vibe] ?? vibe;
  return VIBE_MOODS[key] ?? VIBE_MOODS.soft;
}
