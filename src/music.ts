// Note names, keys and scales. Pitches are MIDI note numbers (C4 = 60).

const LETTERS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
} as const;

export type Key = { root: number; scale: keyof typeof SCALES; flats: boolean };

/** Parse a note such as "C4", "F#3", "Bb4" or "E#4" into a MIDI pitch. */
export function parseNote(text: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(text);
  if (!m) throw new Error(`Bad note "${text}"`);
  const accidental = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return (Number(m[3]) + 1) * 12 + LETTERS[m[1]] + accidental;
}

/** Parse a key such as "A minor" or "Bb major". */
export function parseKey(text: string): Key {
  const m = /^([A-G](?:#|b)?) (major|minor)$/.exec(text);
  if (!m) throw new Error(`Bad key "${text}"`);
  const root = (parseNote(`${m[1]}4`) % 12 + 12) % 12;
  const scale = m[2] as Key['scale'];
  const flatRoots = scale === 'major' ? [5, 10, 3, 8, 1, 6] : [2, 7, 0, 5, 10, 3];
  return { root, scale, flats: m[1].endsWith('b') || flatRoots.includes(root) };
}

/** Note name without octave, spelled with flats or sharps to suit the key. */
export function noteName(pitch: number, key?: Key): string {
  return (key?.flats ? FLAT_NAMES : SHARP_NAMES)[((pitch % 12) + 12) % 12];
}

/** Semitones above the key's root, 0–11. */
export function degree(key: Key, pitch: number): number {
  return (((pitch - key.root) % 12) + 12) % 12;
}

export function inKey(key: Key, pitch: number): boolean {
  return (SCALES[key.scale] as readonly number[]).includes(degree(key, pitch));
}
