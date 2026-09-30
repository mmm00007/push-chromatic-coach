import { describe, expect, it } from 'vitest';
import { PlayAlong } from '../src/scoring';
import { parseNotes } from '../src/song';

// 40 quarter notes on C4 at 60 BPM (1 s per beat), starting at t = 10 s.
const section = { name: 's', ...parseNotes(Array.from({ length: 40 }, () => 'C4 1').join(', ')) };
const start = 10;

describe('play-along scoring', () => {
  it('rewards a perfect run with 5 stars, a full combo and a 4x multiplier', () => {
    const run = new PlayAlong(section, 1, start);
    for (let i = 0; i < 40; i++) expect(run.press(60, start + i + 0.01)!.judgment).toBe('perfect');
    const s = run.summary();
    expect(s).toMatchObject({ stars: 5, accuracy: 1, maxCombo: 40, fullCombo: true, meanOffsetMs: 10 });
    expect(run.multiplier).toBe(4);
    // 9 notes at 1x, 10 at 2x, 10 at 3x, 11 at 4x.
    expect(s.score).toBe(100 * (9 + 20 + 30 + 44));
  });

  it('grades timing and reports early or late playing', () => {
    const run = new PlayAlong(section, 1, start);
    expect(run.press(60, start + 0.1)!.judgment).toBe('great');
    expect(run.press(60, start + 1 - 0.18)!.judgment).toBe('good');
    expect(run.press(60, start + 2 + 0.3)).toBeNull(); // outside every window: a wrong note
    expect(run.wrong).toBe(1);
    expect(run.combo).toBe(0);
    expect(run.summary().meanOffsetMs).toBe(-40);
  });

  it('marks unplayed notes as misses once their window passes', () => {
    const run = new PlayAlong(section, 1, start);
    expect(run.update(start + 0.1)).toEqual([]);
    expect(run.update(start + 1.5)).toEqual([0, 1]);
    expect(run.results[0]!.judgment).toBe('miss');
    run.update(Infinity);
    expect(run.finished).toBe(true);
    expect(run.summary()).toMatchObject({ stars: 0, fullCombo: false });
  });

  it('judges a chord once all its notes are in, and a half chord as Good', () => {
    const chords = { name: 'c', ...parseNotes('C4+E4+G4 1, C4+E4+G4 1, C4+E4+G4 1') };
    const run = new PlayAlong(chords, 1, 0);
    expect(run.press(60, 0.01)!.judgment).toBeUndefined();
    run.press(64, 0.02);
    expect(run.press(67, 0.05)!.judgment).toBe('perfect');
    run.press(60, 1);
    run.press(64, 1);
    run.update(1.5);
    expect(run.results[1]!.judgment).toBe('good');
    run.press(60, 2);
    run.update(2.5);
    expect(run.results[2]!.judgment).toBe('miss');
  });

  it('drains the rock meter on misses until the run fails', () => {
    const run = new PlayAlong(section, 1, start);
    run.update(start + 7);
    expect(run.failed).toBe(true);
  });
});
