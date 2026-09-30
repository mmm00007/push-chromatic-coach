// Play-along scoring, rhythm-game style: timing judgments, combo and multiplier,
// a rock meter, and stars from accuracy. Times are audio-clock seconds.

import type { Section } from './song';

export type Judgment = 'perfect' | 'great' | 'good' | 'miss';

/** Seconds either side of the beat. A little wider than Guitar Hero's, for pads and learners. */
export const WINDOWS = { perfect: 0.06, great: 0.12, good: 0.2 };
const POINTS: Record<Judgment, number> = { perfect: 100, great: 70, good: 40, miss: 0 };
const METER_GAIN: Record<Judgment, number> = { perfect: 0.03, great: 0.02, good: 0.01, miss: -0.08 };
const WRONG_NOTE_PENALTY = 0.04;
/** Accuracy needed for 1 to 5 stars. */
const STARS = [0.2, 0.4, 0.6, 0.8, 0.95];

export type StepResult = { judgment: Judgment; /** Mean timing error in seconds (+ = late), if anything was hit. */ offset: number | null };

export type Summary = {
  score: number;
  stars: number;
  accuracy: number;
  maxCombo: number;
  counts: Record<Judgment, number>;
  wrong: number;
  /** Mean timing error of hit notes in milliseconds (+ = late). */
  meanOffsetMs: number;
  fullCombo: boolean;
};

export class PlayAlong {
  readonly results: (StepResult | undefined)[];
  score = 0;
  combo = 0;
  maxCombo = 0;
  wrong = 0;
  /** Rock meter, 0 (failing) to 1. */
  meter = 0.5;
  /** Per step: pitch → timing error of the hit. */
  private readonly hits: Map<number, number>[];
  private readonly offsets: number[] = [];

  /**
   * @param start audio time of the section's beat 0
   * @param tempoFactor played tempo / song tempo; scales points, so faster runs score more
   */
  constructor(
    readonly section: Section,
    readonly secondsPerBeat: number,
    readonly start: number,
    readonly tempoFactor = 1,
  ) {
    this.results = section.steps.map(() => undefined);
    this.hits = section.steps.map(() => new Map());
  }

  get multiplier(): number {
    return Math.min(4, 1 + Math.floor(this.combo / 10));
  }

  get failed(): boolean {
    return this.meter <= 0;
  }

  get finished(): boolean {
    return this.results.every(Boolean);
  }

  timeOf(step: number): number {
    return this.start + this.section.steps[step].start * this.secondsPerBeat;
  }

  /**
   * A pad was played. It counts for the nearest open step within the Good window
   * that contains this pitch; otherwise it is a wrong note (combo lost).
   * Returns the step hit and, once all its notes are in, its judgment.
   */
  press(pitch: number, time: number): { step: number; judgment?: Judgment } | null {
    let step = -1;
    let nearest = Infinity;
    this.section.steps.forEach((s, i) => {
      if (this.results[i] || !s.pitches.includes(pitch) || this.hits[i].has(pitch)) return;
      const d = Math.abs(time - this.timeOf(i));
      if (d <= WINDOWS.good && d < nearest) [step, nearest] = [i, d];
    });
    if (step < 0) {
      this.wrong++;
      this.combo = 0;
      this.meter = Math.max(0, this.meter - WRONG_NOTE_PENALTY);
      return null;
    }
    this.hits[step].set(pitch, time - this.timeOf(step));
    if (this.hits[step].size < this.section.steps[step].pitches.length) return { step };
    return { step, judgment: this.judge(step) };
  }

  /** Close every step whose window has passed; returns the steps judged now (misses or partial chords). */
  update(time: number): number[] {
    const closed: number[] = [];
    this.results.forEach((r, i) => {
      if (!r && time > this.timeOf(i) + WINDOWS.good) {
        this.judge(i);
        closed.push(i);
      }
    });
    return closed;
  }

  summary(): Summary {
    const counts: Record<Judgment, number> = { perfect: 0, great: 0, good: 0, miss: 0 };
    for (const r of this.results) if (r) counts[r.judgment]++;
    const total = this.section.steps.length;
    const accuracy = total ? (Object.keys(counts) as Judgment[]).reduce((t, j) => t + counts[j] * POINTS[j], 0) / (100 * total) : 0;
    const mean = this.offsets.length ? this.offsets.reduce((a, b) => a + b, 0) / this.offsets.length : 0;
    return {
      score: this.score,
      stars: STARS.filter((t) => accuracy >= t).length,
      accuracy,
      maxCombo: this.maxCombo,
      counts,
      wrong: this.wrong,
      meanOffsetMs: Math.round(mean * 1000),
      fullCombo: counts.miss === 0 && this.wrong === 0 && this.finished,
    };
  }

  /** Chords count as one note: all notes in → timed by the worst one; at least half → Good; less → Miss. */
  private judge(step: number): Judgment {
    const offsets = [...this.hits[step].values()];
    const needed = this.section.steps[step].pitches.length;
    let judgment: Judgment;
    if (offsets.length === 0 || offsets.length * 2 < needed) judgment = 'miss';
    else if (offsets.length < needed) judgment = 'good';
    else {
      const error = Math.max(...offsets.map(Math.abs));
      judgment = error <= WINDOWS.perfect ? 'perfect' : error <= WINDOWS.great ? 'great' : 'good';
    }
    this.results[step] = { judgment, offset: offsets.length ? offsets.reduce((a, b) => a + b, 0) / offsets.length : null };
    if (judgment === 'miss') {
      this.combo = 0;
    } else {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.score += Math.round(POINTS[judgment] * this.multiplier * this.tempoFactor);
      this.offsets.push(...offsets);
    }
    this.meter = Math.min(1, Math.max(0, this.meter + METER_GAIN[judgment]));
    return judgment;
  }
}
