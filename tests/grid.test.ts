import { describe, expect, it } from 'vitest';
import { choosePads, fitBase, padPitch, padsForPitch, SPAN } from '../src/grid';

describe('grid', () => {
  it('maps pads to pitches in the chromatic 4ths layout', () => {
    expect(padPitch(48, { row: 0, col: 0 })).toBe(48);
    expect(padPitch(48, { row: 1, col: 0 })).toBe(53);
    expect(padPitch(48, { row: 7, col: 7 })).toBe(48 + SPAN);
  });

  it('finds every pad for a pitch and none outside the grid', () => {
    expect(padsForPitch(48, 60)).toEqual([{ row: 1, col: 7 }, { row: 2, col: 2 }]);
    expect(padsForPitch(48, 47)).toEqual([]);
    for (let p = 48; p <= 48 + SPAN; p++) expect(padsForPitch(48, p).length).toBeGreaterThan(0);
  });

  it('puts the root at the bottom-left below the lowest note', () => {
    expect(fitBase(0, 55, 67)).toBe(48); // C root, G3..G4
    expect(fitBase(9, 69, 81)).toBe(69); // A root starting on A4
    expect(fitBase(0, 60, 60 + SPAN + 1)).toBeNull();
  });

  it('keeps a melody on one row instead of jumping between duplicate pads', () => {
    // C D E F G from base C: all fit on row 0; G also sits on row 1.
    const pads = choosePads(60, [[60], [62], [64], [65], [67], [65], [64]]);
    expect(pads.every((shape) => shape[0].row === 0)).toBe(true);
  });

  it('keeps chord shapes compact', () => {
    // C major triad from base C3: C4 E4 G4
    const [shape] = choosePads(48, [[60, 64, 67]]);
    const rows = shape.map((p) => p.row);
    const cols = shape.map((p) => p.col);
    expect(Math.max(...rows) - Math.min(...rows) + Math.max(...cols) - Math.min(...cols)).toBeLessThanOrEqual(4);
  });
});
