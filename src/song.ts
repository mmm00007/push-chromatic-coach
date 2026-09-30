// Songs and basic lessons: bundled definitions use a compact note text, e.g.
// "E4 1, D4 .5, C4+E4+G4 2 [I], r 1": a note or chord (joined by "+"), its length in
// beats, and an optional [label] shown while playing it; "r" is a rest.

import { fitBase } from './grid';
import { parseKey, parseNote, type Key } from './music';

export type Step = { pitches: number[]; start: number; dur: number; label?: string };
export type Section = { name: string; steps: Step[]; beats: number };
export type Concept = { title: string; text: string };

export type SongDef = {
  id: string;
  title: string;
  subtitle: string;
  /** Songs are grouped by level; basic lessons by category instead. */
  level: number;
  category?: string;
  key: string;
  bpm: number;
  beatsPerBar: number;
  /** Beats before the first bar line (an upbeat), so the metronome's accent lands on bar 1. */
  pickup?: number;
  sections: { name: string; notes: string }[];
  /** Section order for the "Whole song" run; defaults to every section once; [] for none. */
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
    const m = /^(\S+)\s+(\S+)(?:\s+\[([^\]]+)\])?$/.exec(token);
    const dur = Number(m?.[2]);
    if (!m || !(dur > 0)) throw new Error(`Bad step "${token}"`);
    if (m[1] !== 'r') steps.push({ pitches: m[1].split('+').map(parseNote), start: t, dur, ...(m[3] ? { label: m[3] } : {}) });
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
