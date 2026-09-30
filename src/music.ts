// Note names, keys, scales, and naming what is being played (notes, intervals, chords).
// Pitches are MIDI note numbers (C4 = 60).

const LETTERS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
/** Major keys written with flats. */
const FLAT_MAJORS = [5, 10, 3, 8, 1, 6];

/** Scales as on the Push Scale menu. `parent` is the offset of the related major key, for spelling. */
export const SCALES = {
  major: { name: 'major', push: 'Major', steps: [0, 2, 4, 5, 7, 9, 11], parent: 0 },
  minor: { name: 'minor', push: 'Minor', steps: [0, 2, 3, 5, 7, 8, 10], parent: 3 },
  harmonicMinor: { name: 'harmonic minor', push: 'Harmonic Minor', steps: [0, 2, 3, 5, 7, 8, 11], parent: 3 },
  dorian: { name: 'dorian', push: 'Dorian', steps: [0, 2, 3, 5, 7, 9, 10], parent: 10 },
  mixolydian: { name: 'mixolydian', push: 'Mixolydian', steps: [0, 2, 4, 5, 7, 9, 10], parent: 5 },
  majorPentatonic: { name: 'major pentatonic', push: 'Major Pentatonic', steps: [0, 2, 4, 7, 9], parent: 0 },
  minorPentatonic: { name: 'minor pentatonic', push: 'Minor Pentatonic', steps: [0, 3, 5, 7, 10], parent: 3 },
  blues: { name: 'blues', push: 'Minor Blues', steps: [0, 3, 5, 6, 7, 10], parent: 3 },
} as const;

export type ScaleId = keyof typeof SCALES;
export type Key = { root: number; scale: ScaleId; flats: boolean };

const mod12 = (n: number) => ((n % 12) + 12) % 12;

/** Parse a note such as "C4", "F#3", "Bb4" or "E#4" into a MIDI pitch. */
export function parseNote(text: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(text);
  if (!m) throw new Error(`Bad note "${text}"`);
  const accidental = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return (Number(m[3]) + 1) * 12 + LETTERS[m[1]] + accidental;
}

/** Build a key; blues keys use flats for the blue note, others follow their related major key. */
export function makeKey(root: number, scale: ScaleId, spelled?: string): Key {
  const flats =
    spelled?.endsWith('b') ||
    (!spelled?.endsWith('#') && (scale === 'blues' || FLAT_MAJORS.includes(mod12(root + SCALES[scale].parent))));
  return { root: mod12(root), scale, flats: Boolean(flats) };
}

/** Parse a key such as "A minor", "Bb major" or "E minor pentatonic". */
export function parseKey(text: string): Key {
  const m = /^([A-G](?:#|b)?) (.+)$/.exec(text);
  const scale = m && (Object.keys(SCALES) as ScaleId[]).find((id) => SCALES[id].name === m[2]);
  if (!m || !scale) throw new Error(`Bad key "${text}"`);
  return makeKey(parseNote(`${m[1]}4`), scale, m[1]);
}

/**
 * Note name without octave. Key notes follow the key's spelling; notes outside
 * it are spelled as usually written: lowered 2nd, 3rd, 6th and 7th as flats (Eb, Ab, Bb in C),
 * raised notes such as leading notes as sharps (G# in A minor).
 */
export function noteName(pitch: number, key?: Key): string {
  const pc = mod12(pitch);
  if (!key) return SHARP_NAMES[pc];
  if (inKey(key, pitch)) return (key.flats ? FLAT_NAMES : SHARP_NAMES)[pc];
  const d = degree(key, pitch);
  const flat = [1, 3, 8, 10].includes(d) || (d === 6 && key.flats);
  return (flat ? FLAT_NAMES : SHARP_NAMES)[pc];
}

export function keyName(key: Key): string {
  return `${noteName(key.root, key)} ${SCALES[key.scale].name}`;
}

/** The key's notes, root first. */
export function scaleNotes(key: Key): string[] {
  return SCALES[key.scale].steps.map((s) => noteName(key.root + s, key));
}

/** Semitones above the key's root, 0–11. */
export function degree(key: Key, pitch: number): number {
  return mod12(pitch - key.root);
}

export function inKey(key: Key, pitch: number): boolean {
  return (SCALES[key.scale].steps as readonly number[]).includes(degree(key, pitch));
}

const INTERVALS = ['unison', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'tritone', 'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th'];
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

type ChordType = { symbol: string; name: string; steps: number[]; minor?: boolean; numeral?: string };
const CHORDS: ChordType[] = [
  { symbol: '', name: 'major', steps: [0, 4, 7] },
  { symbol: 'm', name: 'minor', steps: [0, 3, 7], minor: true },
  { symbol: 'dim', name: 'diminished', steps: [0, 3, 6], minor: true, numeral: '°' },
  { symbol: 'aug', name: 'augmented', steps: [0, 4, 8], numeral: '+' },
  { symbol: 'sus2', name: 'sus2', steps: [0, 2, 7], numeral: 'sus2' },
  { symbol: 'sus4', name: 'sus4', steps: [0, 5, 7], numeral: 'sus4' },
  { symbol: '7', name: 'dominant 7th', steps: [0, 4, 7, 10], numeral: '7' },
  { symbol: 'maj7', name: 'major 7th', steps: [0, 4, 7, 11], numeral: 'maj7' },
  { symbol: 'm7', name: 'minor 7th', steps: [0, 3, 7, 10], minor: true, numeral: '7' },
  { symbol: 'm7b5', name: 'half-diminished 7th', steps: [0, 3, 6, 10], minor: true, numeral: 'ø7' },
  { symbol: 'dim7', name: 'diminished 7th', steps: [0, 3, 6, 9], minor: true, numeral: '°7' },
  { symbol: '6', name: 'major 6th', steps: [0, 4, 7, 9], numeral: '6' },
  { symbol: 'm6', name: 'minor 6th', steps: [0, 3, 7, 9], minor: true, numeral: '6' },
  { symbol: 'add9', name: 'add 9', steps: [0, 2, 4, 7], numeral: 'add9' },
];

export type Described = {
  /** Plain name, e.g. "A minor", "C + E", "E". */
  name: string;
  /** Chord symbol, e.g. "Am", "C/E", "E5"; empty when there is none. */
  symbol: string;
  /** Distinct note names, lowest first. */
  notes: string[];
  /** Role in the key or the interval, e.g. "vi chord in C major", "major 3rd". */
  detail: string;
};

/** Name what a set of pitches is: a note, an interval, or a chord (with its role in `key`). */
export function describe(pitches: number[], key: Key): Described | null {
  if (pitches.length === 0) return null;
  const sorted = [...new Set(pitches)].sort((a, b) => a - b);
  const pcs = [...new Set(sorted.map(mod12))];
  const notes = pcs.map((pc) => noteName(pc, key));
  const bass = pcs[0];
  const kn = keyName(key);

  if (pcs.length === 1) {
    const d = SCALES[key.scale].steps.indexOf(degree(key, bass) as never);
    const role = d === 0 ? `the root of ${kn}` : d > 0 ? `${ORDINALS[d]} note of ${kn}` : `outside ${kn} (an unlit pad)`;
    return { name: sorted.length > 1 ? `${notes[0]} octaves` : notes[0], symbol: notes[0], notes, detail: role };
  }

  if (pcs.length === 2) {
    const iv = mod12(pcs[1] - bass);
    if (iv === 7) return { name: `${notes[0]} power chord`, symbol: `${notes[0]}5`, notes, detail: 'perfect 5th: root + fifth' };
    return { name: notes.join(' + '), symbol: '', notes, detail: INTERVALS[iv] };
  }

  for (const root of pcs) {
    const steps = pcs.map((pc) => mod12(pc - root)).sort((a, b) => a - b);
    const type = CHORDS.find((c) => c.steps.length === steps.length && c.steps.every((s, i) => s === steps[i]));
    if (!type) continue;
    const rootName = noteName(root, key);
    const slash = root === bass ? '' : `/${noteName(bass, key)}`;
    return {
      name: `${rootName} ${type.name}${slash ? ` (${noteName(bass, key)} in the bass)` : ''}`,
      symbol: `${rootName}${type.symbol}${slash}`,
      notes,
      detail: numeral(key, root, type),
    };
  }
  return { name: notes.join(' '), symbol: '', notes, detail: 'no common chord name' };
}

/** Roman numeral of a chord in a 7-note key, e.g. "vi chord in C major"; empty if the root is outside the key. */
function numeral(key: Key, root: number, type: ChordType): string {
  const steps = SCALES[key.scale].steps as readonly number[];
  const d = steps.indexOf(degree(key, root));
  if (steps.length !== 7 || d < 0) return '';
  const base = type.minor ? ROMAN[d].toLowerCase() : ROMAN[d];
  return `${base}${type.numeral ?? ''} chord in ${keyName(key)}`;
}
