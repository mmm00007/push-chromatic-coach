// Lesson engine: key lighting like Push chromatic mode, plus Follow (wait) mode.

import { choosePads, padAt, padIndex, padPitch, SIZE, type Pad } from './grid';
import { degree, inKey, type Key } from './music';
import type { Section, Song } from './song';

/** Push chromatic mode lighting: root in colour, key notes white, other notes unlit. */
export type Base = 'off' | 'inKey' | 'root';
/** Lesson highlights drawn on top of the key lighting. */
export type Mark = 'target' | 'next' | 'pressed' | 'wrong';
export type Cell = { pitch: number; base: Base; mark?: Mark };

export function keyLighting(base: number, key: Key): Cell[] {
  return Array.from({ length: SIZE * SIZE }, (_, i) => {
    const pitch = padPitch(base, padAt(i));
    return { pitch, base: degree(key, pitch) === 0 ? 'root' : inKey(key, pitch) ? 'inKey' : 'off' };
  });
}

export function markPads(cells: Cell[], pads: Pad[] | undefined, mark: Mark): void {
  for (const p of pads ?? []) cells[padIndex(p)].mark = mark;
}

/** Follow mode: the next note stays lit until you play it; any pad with the right pitch counts. */
export class Follow {
  readonly pads: Pad[][];
  index = 0;
  mistakes = 0;
  /** Held pads (pad index → pitch). */
  readonly held = new Map<number, number>();
  private readonly wrong = new Set<number>();

  constructor(readonly song: Song, readonly section: Section) {
    this.pads = choosePads(song.base, section.steps.map((s) => s.pitches));
  }

  /** Pitches currently held down. */
  get heldPitches(): number[] {
    return [...this.held.values()];
  }

  get done(): boolean {
    return this.index >= this.section.steps.length;
  }

  /** Register a pad press; returns false for a wrong note. */
  press(pad: Pad): boolean {
    const i = padIndex(pad);
    const pitch = padPitch(this.song.base, pad);
    this.held.set(i, pitch);
    if (this.done) return true;
    const expected = this.section.steps[this.index].pitches;
    if (!expected.includes(pitch)) {
      this.wrong.add(i);
      this.mistakes++;
      return false;
    }
    const held = new Set(this.held.values());
    if (expected.every((p) => held.has(p))) this.index++;
    return true;
  }

  release(pad: Pad): void {
    const i = padIndex(pad);
    this.held.delete(i);
    this.wrong.delete(i);
  }

  restart(): void {
    this.index = 0;
    this.mistakes = 0;
    this.wrong.clear();
  }

  cells(): Cell[] {
    const cells = keyLighting(this.song.base, this.song.key);
    markPads(cells, this.pads[this.index + 1], 'next');
    markPads(cells, this.pads[this.index], 'target');
    for (const i of this.held.keys()) cells[i].mark = this.wrong.has(i) ? 'wrong' : 'pressed';
    return cells;
  }
}
