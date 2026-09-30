import { describe, expect, it } from 'vitest';
import { padIndex, padsForPitch } from '../src/grid';
import { Follow } from '../src/lesson';
import { DEFAULT_PALETTE, FIRST_PAD_NOTE, Push } from '../src/push';
import { buildSong } from '../src/song';
import { SONGS } from '../src/songs';

// A fake Web MIDI access with one Push input and output, as Chrome exposes them.
function fakePush() {
  const sent: number[][] = [];
  const input = { name: 'Ableton Push 3 User Port', onmidimessage: null as null | ((e: { data: Uint8Array }) => void) };
  const output = { name: 'Ableton Push 3 User Port', send: (d: number[]) => sent.push(d) };
  const access = { inputs: new Map([['in', input]]), outputs: new Map([['out', output]]), onstatechange: null };
  const push = new Push(access as unknown as MIDIAccess, { ...DEFAULT_PALETTE });
  const hit = (note: number, velocity = 100, channel = 0) => input.onmidimessage!({ data: Uint8Array.from([0x90 | channel, note, velocity]) });
  return { push, sent, hit };
}

describe('lesson through the Push', () => {
  it('plays a whole section in Follow mode with LED feedback', () => {
    const song = SONGS.find((s) => s.id === 'carol-of-the-bells')!;
    const follow = new Follow(song, song.sections[0]);
    const { push, sent, hit } = fakePush();
    push.onPad = (e) => {
      if (e.velocity > 0) follow.press(e.pad);
      else follow.release(e.pad);
      push.show(follow.cells());
    };
    push.show(follow.cells());

    // The first target pad is lit green.
    const first = FIRST_PAD_NOTE + padIndex(follow.pads[0][0]);
    expect(sent).toContainEqual([0x90, first, DEFAULT_PALETTE.target]);

    // A wrong pad flashes red and does not advance.
    const wrongNote = FIRST_PAD_NOTE + padIndex(padsForPitch(song.base, song.base + 1)[0]);
    hit(wrongNote);
    expect(follow.index).toBe(0);
    expect(follow.mistakes).toBe(1);
    expect(sent.at(-1)).toEqual([0x90, wrongNote, DEFAULT_PALETTE.wrong]);
    hit(wrongNote, 0);

    // Every target in turn, on MPE channel 2 like Push 3 sends by default.
    for (const shape of follow.pads) {
      const note = FIRST_PAD_NOTE + padIndex(shape[0]);
      hit(note, 90, 1);
      hit(note, 0, 1);
    }
    expect(follow.done).toBe(true);
    expect(follow.mistakes).toBe(1);
  });

  it('accepts any pad with the right pitch and needs every chord note held', () => {
    const song = buildSong({ id: 't', title: 't', subtitle: '', level: 1, key: 'C major', bpm: 60, beatsPerBar: 4, sections: [{ name: 'c', notes: 'C4+E4+G4 4' }] });
    const follow = new Follow(song, song.sections[0]);
    const [c, e, g] = [60, 64, 67].map((p) => padsForPitch(song.base, p).at(-1)!);
    follow.press(c);
    follow.press(e);
    expect(follow.index).toBe(0);
    follow.press(g);
    expect(follow.done).toBe(true);
  });
});
