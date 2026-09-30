// The Push 3 pad grid in Chromatic mode with the 4ths layout and Fixed off:
// the bottom-left pad is the key's root, each pad to the right is one semitone
// higher and each row up is a fourth (5 semitones) higher.

export const SIZE = 8;
export const ROW_STEP = 5;
/** Semitones from the bottom-left pad to the top-right pad. */
export const SPAN = ROW_STEP * (SIZE - 1) + SIZE - 1;

export type Pad = { row: number; col: number };

export function padPitch(base: number, pad: Pad): number {
  return base + ROW_STEP * pad.row + pad.col;
}

export function padIndex(pad: Pad): number {
  return pad.row * SIZE + pad.col;
}

export function padAt(index: number): Pad {
  return { row: Math.floor(index / SIZE), col: index % SIZE };
}

/** Every pad that plays `pitch`, bottom row first. */
export function padsForPitch(base: number, pitch: number): Pad[] {
  const pads: Pad[] = [];
  for (let row = 0; row < SIZE; row++) {
    const col = pitch - base - ROW_STEP * row;
    if (col >= 0 && col < SIZE) pads.push({ row, col });
  }
  return pads;
}

/** Bottom-left pitch: the highest root at or below the lowest note, or null if the range doesn't fit the grid. */
export function fitBase(rootPc: number, lowest: number, highest: number): number | null {
  const base = lowest - ((((lowest - rootPc) % 12) + 12) % 12);
  return highest - base <= SPAN ? base : null;
}

/**
 * Most pitches sit on two or three pads. For each step (one note or a chord)
 * pick one pad per pitch so that shapes stay compact and the hand moves as
 * little as possible (Viterbi over the candidate shapes).
 */
export function choosePads(base: number, steps: number[][]): Pad[][] {
  if (steps.length === 0) return [];
  const options = steps.map((pitches) => shapes(pitches.map((p) => padsForPitch(base, p))));
  let cost = options[0].map(spread);
  const back: number[][] = [];
  for (let i = 1; i < options.length; i++) {
    const prev = options[i - 1];
    const links = options[i].map((shape) => {
      let best = Infinity;
      let from = 0;
      prev.forEach((p, j) => {
        const c = cost[j] + distance(p, shape);
        if (c < best) [best, from] = [c, j];
      });
      return { cost: best + spread(shape), from };
    });
    cost = links.map((l) => l.cost);
    back.push(links.map((l) => l.from));
  }
  let at = cost.indexOf(Math.min(...cost));
  const chosen: Pad[][] = [options[options.length - 1][at]];
  for (let i = back.length - 1; i >= 0; i--) {
    at = back[i][at];
    chosen.unshift(options[i][at]);
  }
  return chosen;
}

function shapes(candidates: Pad[][]): Pad[][] {
  return candidates.reduce<Pad[][]>((acc, pads) => acc.flatMap((shape) => pads.map((pad) => [...shape, pad])), [[]]);
}

function spread(shape: Pad[]): number {
  const rows = shape.map((p) => p.row);
  const cols = shape.map((p) => p.col);
  return Math.max(...rows) - Math.min(...rows) + Math.max(...cols) - Math.min(...cols);
}

function distance(a: Pad[], b: Pad[]): number {
  const centre = (s: Pad[]) => [s.reduce((t, p) => t + p.row, 0) / s.length, s.reduce((t, p) => t + p.col, 0) / s.length];
  const [ar, ac] = centre(a);
  const [br, bc] = centre(b);
  return Math.abs(ar - br) + Math.abs(ac - bc);
}
