// Songs: bundled definitions use a compact note text, e.g. "E4 1, D4 .5, C4+E4+G4 2, r 1"
// (note or chord joined by "+", then its length in beats; "r" is a rest).

import { fitBase } from './grid';
import { parseKey, parseNote, type Key } from './music';

export type Step = { pitches: number[]; start: number; dur: number };
export type Section = { name: string; steps: Step[]; beats: number };
export type Concept = { title: string; text: string };

export type SongDef = {
  id: string;
  title: string;
  subtitle: string;
  level: number;
  key: string;
  bpm: number;
  beatsPerBar: number;
  sections: { name: string; notes: string }[];
  /** Section order for the "Whole song" run; defaults to every section once. */
  form?: number[];
  concept?: Concept;
};

export type Song = Omit<SongDef, 'key' | 'sections' | 'form'> & {
  key: Key;
  sections: Section[];
  /** Pitch of the bottom-left pad. */
  base: number;
};

export function parseNotes(text: string): { steps: Step[]; beats: number } {
  const steps: Step[] = [];
  let t = 0;
  for (const token of text.split(',').map((s) => s.trim()).filter(Boolean)) {
    const [notes, length, extra] = token.split(/\s+/);
    const dur = Number(length);
    if (extra !== undefined || !(dur > 0)) throw new Error(`Bad step "${token}"`);
    if (notes !== 'r') steps.push({ pitches: notes.split('+').map(parseNote), start: t, dur });
    t += dur;
  }
  return { steps, beats: t };
}

export function buildSong(def: SongDef): Song {
  const parts: Section[] = def.sections.map((s) => ({ name: s.name, ...parseNotes(s.notes) }));
  const sections = [...parts];
  const form = def.form ?? parts.map((_, i) => i);
  if (form.length > 1) sections.push(concat('Whole song', form.map((i) => parts[i])));
  const pitches = parts.flatMap((s) => s.steps.flatMap((st) => st.pitches));
  const key = parseKey(def.key);
  const base = fitBase(key.root, Math.min(...pitches), Math.max(...pitches));
  if (base === null) throw new Error(`${def.title}: range is too wide for the grid`);
  return { ...def, key, sections, base };
}

function concat(name: string, parts: Section[]): Section {
  const steps: Step[] = [];
  let t = 0;
  for (const part of parts) {
    for (const s of part.steps) steps.push({ ...s, start: s.start + t });
    t += part.beats;
  }
  return { name, steps, beats: t };
}
