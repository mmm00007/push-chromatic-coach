import { describe, expect, it } from 'vitest';
import { choosePads, padPitch } from '../src/grid';
import { parseNotes } from '../src/song';
import { SONGS } from '../src/songs';

describe('songs', () => {
  it('parses notes, chords and rests', () => {
    expect(parseNotes('C4 1, r .5, C4+E4+G4 2')).toEqual({
      steps: [
        { pitches: [60], start: 0, dur: 1 },
        { pitches: [60, 64, 67], start: 1.5, dur: 2 },
      ],
      beats: 3.5,
    });
    expect(() => parseNotes('H4 1')).toThrow();
    expect(() => parseNotes('C4')).toThrow();
  });

  it('every bundled song fits the grid with a pad for every note', () => {
    for (const song of SONGS) {
      expect(song.sections.length).toBeGreaterThan(0);
      for (const section of song.sections) {
        const pads = choosePads(song.base, section.steps.map((s) => s.pitches));
        pads.forEach((shape, i) => expect(shape.map((p) => padPitch(song.base, p))).toEqual(section.steps[i].pitches));
        // Sections are whole bars (a pickup is balanced by a short last bar): catches transcription slips.
        expect(section.beats % song.beatsPerBar, `${song.title} / ${section.name}: ${section.beats} beats`).toBe(0);
      }
    }
  });
});
