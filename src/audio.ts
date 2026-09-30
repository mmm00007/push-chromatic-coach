// Piano sound (Salamander Grand Piano samples, CC-BY 3.0) and phrase playback.

import * as Tone from 'tone';
import type { Step } from './song';

let sampler: Tone.Sampler | undefined;

/** Must run from a click: browsers only start audio after a user gesture. */
export async function startAudio(): Promise<void> {
  await Tone.start();
  const urls: Record<string, string> = { A1: 'A1.mp3', C8: 'C8.mp3' };
  for (let octave = 2; octave <= 7; octave++) {
    for (const [note, file] of [['C', 'C'], ['D#', 'Ds'], ['F#', 'Fs'], ['A', 'A']]) urls[`${note}${octave}`] = `${file}${octave}.mp3`;
  }
  sampler = new Tone.Sampler({ urls, baseUrl: `${import.meta.env.BASE_URL}samples/`, release: 0.8 }).toDestination();
  await Tone.loaded();
}

const noteOf = (pitch: number) => Tone.Frequency(pitch, 'midi').toNote();

export function noteOn(pitch: number, velocity: number): void {
  sampler?.triggerAttack(noteOf(pitch), Tone.now(), Math.max(0.25, velocity / 127));
}

export function noteOff(pitch: number): void {
  sampler?.triggerRelease(noteOf(pitch), Tone.now() + 0.05);
}

/**
 * Play steps at `bpm`. `onStep(i, true)` fires as step i starts and
 * `onStep(i, false)` just before it ends; `onEnd` after the last beat.
 * Returns a function that stops playback.
 */
export function playSteps(
  steps: Step[],
  beats: number,
  bpm: number,
  onStep: (i: number, on: boolean) => void,
  onEnd: () => void,
): () => void {
  const transport = Tone.getTransport();
  // Visual callbacks run on timers aligned to the audio clock. Tone's Draw uses
  // requestAnimationFrame and drops late callbacks, which stalls hidden windows.
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const at = (time: number, fn: () => void) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, Math.max(0, (time - Tone.immediate()) * 1000));
    timers.add(t);
  };
  transport.stop();
  transport.cancel();
  const spb = 60 / bpm;
  steps.forEach((s, i) => {
    transport.schedule((time) => {
      sampler?.triggerAttackRelease(s.pitches.map(noteOf), s.dur * spb * 0.9, time);
      at(time, () => onStep(i, true));
    }, s.start * spb);
    transport.schedule((time) => at(time, () => onStep(i, false)), (s.start + s.dur * 0.85) * spb);
  });
  transport.schedule((time) => at(time, onEnd), beats * spb);
  transport.start('+0.1');
  return () => {
    transport.stop();
    transport.cancel();
    timers.forEach(clearTimeout);
    sampler?.releaseAll();
  };
}
