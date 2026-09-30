import { describe as group, expect, it } from 'vitest';
import { describe, noteName, parseKey, scaleNotes } from '../src/music';

const C = parseKey('C major');

group('naming what you play', () => {
  it('names single notes by their role in the key', () => {
    expect(describe([60], C)).toMatchObject({ name: 'C', detail: 'the root of C major' });
    expect(describe([64], C)!.detail).toBe('3rd note of C major');
    expect(describe([61], C)!.detail).toContain('outside C major');
    expect(describe([48, 60], C)!.name).toBe('C octaves');
  });

  it('names intervals and power chords', () => {
    expect(describe([60, 63], C)!.detail).toBe('minor 3rd');
    expect(describe([60, 64], C)!.detail).toBe('major 3rd');
    expect(describe([52, 59, 64], C)).toMatchObject({ symbol: 'E5', name: 'E power chord' });
  });

  it('names chords, inversions and their numerals', () => {
    expect(describe([60, 64, 67], C)).toMatchObject({ symbol: 'C', name: 'C major', detail: 'I chord in C major' });
    expect(describe([64, 67, 72], C)).toMatchObject({ symbol: 'C/E', name: 'C major (E in the bass)' });
    expect(describe([57, 60, 64], C)).toMatchObject({ symbol: 'Am', detail: 'vi chord in C major' });
    expect(describe([55, 59, 62, 65], C)).toMatchObject({ symbol: 'G7', detail: 'V7 chord in C major' });
    expect(describe([71, 74, 77], C)).toMatchObject({ symbol: 'Bdim', detail: 'vii° chord in C major' });
    expect(describe([56, 60, 63], C)).toMatchObject({ symbol: 'Ab', detail: '' });
    expect(describe([52, 56, 59], parseKey('A minor'))!.detail).toBe('V chord in A minor');
  });

  it('spells keys with the right accidentals', () => {
    expect(scaleNotes(parseKey('G major'))).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
    expect(scaleNotes(parseKey('F major'))).toContain('Bb');
    expect(scaleNotes(parseKey('A blues'))).toEqual(['A', 'C', 'D', 'Eb', 'E', 'G']);
    expect(noteName(70, parseKey('D minor'))).toBe('Bb');
    expect(noteName(63, C)).toBe('Eb');
    expect(noteName(68, parseKey('A minor'))).toBe('G#');
    expect(noteName(61, parseKey('D minor'))).toBe('C#');
  });
});
