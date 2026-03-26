/**
 * AmbientMusicEngine — procedural Web Audio synthesizer.
 * Separated from React hook for testability and maintainability.
 */
import { getAudioContext, closeAudioContext } from "./audioContext";
import { getMood, type VibeMood } from "./ambientMoods";

type OnChangeCallback = (playing: boolean) => void;

export class AmbientMusicEngine {
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
  private stopping = false;

  setOnChange(cb: OnChangeCallback | null) { this.onChange = cb; }
  private setPlaying(val: boolean) { this._isPlaying = val; this.onChange?.(val); }
  get playing() { return this._isPlaying; }

  async start(vibe: string, volume: number): Promise<void> {
    if (this.stopping) await new Promise(r => setTimeout(r, 200));
    if (this._isPlaying) this.cleanup();

    this.mood = getMood(vibe);

    const ctx = await getAudioContext();
    if (!ctx) return;
    this.ctx = ctx;

    try {
      this.setupAudioGraph(volume);
      this.noiseBuffer = this.createNoiseBuffer();
      this.activeNodes = [];
      this.currentBeat = 0;
      this.setPlaying(true);
      this.startPad();
      this.scheduleBeat();
    } catch (e) {
      console.debug("[AmbientMusic] Start failed:", e);
      this.cleanup();
    }
  }

  stop(): void {
    if (!this._isPlaying && !this.ctx) return;

    if (this.masterGain && this.ctx && this.ctx.state === "running") {
      try {
        const t = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(t);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
        this.masterGain.gain.linearRampToValueAtTime(0, t + 0.3);
      } catch { /* ignore */ }
      this.setPlaying(false);
      this.clearScheduler();
      setTimeout(() => this.cleanup(), 350);
    } else {
      this.cleanup();
    }
  }

  setVolume(vol: number): void {
    if (this.masterGain && this.ctx && this.ctx.state === "running") {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(
          Math.min(vol * 0.4, 0.35),
          this.ctx.currentTime + 0.1
        );
      } catch { /* ignore */ }
    }
  }

  // ── Internal ──

  private setupAudioGraph(volume: number): void {
    const ctx = this.ctx!;
    const m = this.mood!;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(
      Math.min(volume * 0.4, 0.35),
      ctx.currentTime + 1
    );

    this.dryGain = ctx.createGain();
    this.reverbGain = ctx.createGain();
    this.convolver = ctx.createConvolver();

    this.dryGain.gain.setValueAtTime(1 - m.reverb * 0.5, ctx.currentTime);
    this.reverbGain.gain.setValueAtTime(m.reverb * 0.5, ctx.currentTime);
    this.convolver.buffer = this.createReverbImpulse(1.5, 2.5);

    this.dryGain.connect(this.masterGain);
    this.convolver.connect(this.reverbGain).connect(this.masterGain);
    this.masterGain.connect(ctx.destination);
  }

  private cleanup(): void {
    this.stopping = true;
    this.setPlaying(false);
    this.clearScheduler();

    for (const node of this.activeNodes) {
      try { node.stop(0); } catch { /* already stopped */ }
    }
    this.activeNodes = [];
    closeAudioContext();
    this.ctx = null;
    this.masterGain = null;
    this.convolver = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.mood = null;
    this.noiseBuffer = null;
    this.stopping = false;
  }

  private clearScheduler(): void {
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  // ── Pad ──

  private startPad(): void {
    if (!this.ctx || !this.mood || !this.dryGain || !this.convolver) return;
    const m = this.mood;
    const t = this.ctx.currentTime;

    for (let i = 0; i < Math.min(m.scale.length, 3); i++) {
      if (!this.ctx || !this.dryGain || !this.convolver) return;
      const freq = m.scale[i];
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

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.3 + i * 0.1, t);
      lfoGain.gain.setValueAtTime(m.padDetune * 2, t);
      lfo.connect(lfoGain).connect(osc.detune);
      lfo.start(t);
      this.activeNodes.push(lfo);
    }
  }

  // ── Beat scheduler ──

  private scheduleBeat(): void {
    if (!this._isPlaying || !this.ctx || !this.mood || this.ctx.state !== "running") return;

    const m = this.mood;
    const beatDuration = 60 / m.tempo;
    const swing = this.currentBeat % 2 === 1 ? m.swing * beatDuration : 0;

    if (this.currentBeat % (Math.random() < 0.4 ? 2 : 4) === 0) this.playMelodyNote(swing);
    if (this.currentBeat % 4 === 0) this.playBass(swing);
    if (m.hasDrums && m.drumPattern) {
      const patIdx = this.currentBeat % m.drumPattern.length;
      if (m.drumPattern[patIdx]) this.playDrum(swing);
      if (this.currentBeat % 2 === 1) this.playHiHat(swing);
    }

    this.currentBeat++;
    this.schedulerTimer = window.setTimeout(() => this.scheduleBeat(), beatDuration * 1000);
  }

  private playMelodyNote(delay: number): void {
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
  }

  private playBass(delay: number): void {
    if (!this.ctx || !this.mood || !this.dryGain) return;
    const m = this.mood;
    const t = this.ctx.currentTime + delay;
    const duration = 60 / m.tempo * 2;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(Math.random() < 0.3 ? m.bassFreq * 1.5 : m.bassFreq, t);
    gain.gain.setValueAtTime(m.bassVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(this.dryGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  private playDrum(delay: number): void {
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

  private playHiHat(delay: number): void {
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
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }
}

/** Singleton engine instance — reused across component mounts */
export const ambientEngine = new AmbientMusicEngine();
