// Piano sound (Salamander Grand Piano samples, CC-BY 3.0), phrase playback and metronome.

import * as Tone from 'tone';
import type { Step } from './song';

let sampler: Tone.Sampler | undefined;
let click: Tone.Synth | undefined;

/** Must run from a click: browsers only start audio after a user gesture. */
export async function startAudio(): Promise<void> {
  await Tone.start();
  const urls: Record<string, string> = { A1: 'A1.mp3', C8: 'C8.mp3' };
  for (let octave = 2; octave <= 7; octave++) {
    for (const [note, file] of [['C', 'C'], ['D#', 'Ds'], ['F#', 'Fs'], ['A', 'A']]) urls[`${note}${octave}`] = `${file}${octave}.mp3`;
  }
  sampler = new Tone.Sampler({ urls, baseUrl: `${import.meta.env.BASE_URL}samples/`, release: 0.8 }).toDestination();
  click = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
    volume: -4,
  }).toDestination();
  await Tone.loaded();
}

const noteOf = (pitch: number) => Tone.Frequency(pitch, 'midi').toNote();

export function noteOn(pitch: number, velocity: number): void {
  sampler?.triggerAttack(noteOf(pitch), Tone.now(), Math.max(0.25, velocity / 127));
}

export function noteOff(pitch: number): void {
  sampler?.triggerRelease(noteOf(pitch), Tone.now() + 0.05);
}

/** Current audio-clock time in seconds. */
export function audioNow(): number {
  return Tone.immediate();
}

/**
 * Audio time at which a sound that happened at `perfMs` (performance.now
 * clock, as MIDI and pointer events are stamped) was heard in sync with the
 * speakers: output latency is subtracted, since players time their notes to what they hear.
 */
export function heardTime(perfMs: number): number {
  const ctx = Tone.getContext().rawContext as AudioContext;
  const latency = (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
  return Tone.immediate() - (performance.now() - perfMs) / 1000 - latency;
}

type Timers = Set<ReturnType<typeof setTimeout>>;

/**
 * Run `fn` when the audio clock reaches `time`. Timers keep running in hidden
 * windows; Tone's Draw uses animation frames and drops late callbacks.
 */
function at(timers: Timers, time: number, fn: () => void): void {
  const t = setTimeout(() => {
    timers.delete(t);
    fn();
  }, Math.max(0, (time - Tone.immediate()) * 1000));
  timers.add(t);
}

/**
 * Play steps at `bpm` after `leadIn` beats, at `volume` (0 = silent, for timing only).
 * `onStep(i, true)` fires as step i starts and `onStep(i, false)` just before it
 * ends; `onEnd` after the last beat. Returns a stop function and the audio time
 * of the lead-in's first beat.
 */
export function playSteps(
  steps: Step[],
  beats: number,
  bpm: number,
  onStep: (i: number, on: boolean) => void,
  onEnd: () => void,
  leadIn = 0,
  volume = 1,
): { stop: () => void; start: number } {
  const transport = Tone.getTransport();
  const timers: Timers = new Set();
  transport.stop();
  transport.cancel();
  const spb = 60 / bpm;
  steps.forEach((s, i) => {
    transport.schedule((time) => {
      if (volume > 0) sampler?.triggerAttackRelease(s.pitches.map(noteOf), s.dur * spb * 0.9, time, volume);
      at(timers, time, () => onStep(i, true));
    }, (leadIn + s.start) * spb);
    transport.schedule((time) => at(timers, time, () => onStep(i, false)), (leadIn + s.start + s.dur * 0.85) * spb);
  });
  transport.schedule((time) => at(timers, time, onEnd), (leadIn + beats) * spb);
  const start = Tone.now() + 0.1;
  transport.start(start);
  return {
    start,
    stop: () => {
      transport.stop();
      transport.cancel();
      timers.forEach(clearTimeout);
      sampler?.releaseAll();
    },
  };
}

/** Click on every beat, accenting beat 1 of each bar. */
class Metronome {
  /** Beat index as each click sounds (0 = bar start); -1 when stopped. */
  onBeat: (beat: number) => void = () => {};
  private clock: Tone.Clock | null = null;
  private readonly timers: Timers = new Set();

  /** Start at `bpm`; `startAt` (audio time) lines the clicks up with playback. */
  start(bpm: number, beatsPerBar: number, startAt = Tone.now() + 0.05): void {
    this.stop();
    this.clock = new Tone.Clock((time, ticks = 0) => {
      const beat = ticks % beatsPerBar;
      click?.triggerAttackRelease(beat === 0 ? 'E6' : 'A5', 0.03, time, beat === 0 ? 1 : 0.55);
      at(this.timers, time, () => this.onBeat(beat));
    }, bpm / 60);
    this.clock.start(startAt);
  }

  stop(): void {
    this.clock?.stop();
    this.clock?.dispose();
    this.clock = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.onBeat(-1);
  }
}

export const metronome = new Metronome();
