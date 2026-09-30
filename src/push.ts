// Ableton Push over Web MIDI. Pads send notes 36 (bottom-left) to 99 (top-right),
// row by row; a note-on sent back to the same number sets that pad's LED, with the
// velocity picking a palette colour (Push 2 MIDI spec; confirmed for Push 3 on the Check page).

import { padAt, SIZE, type Pad } from './grid';
import type { Base, Cell, Mark } from './lesson';

export const FIRST_PAD_NOTE = 36;

export type Palette = Record<Base | Mark, number>;
/** Push 2 default palette: 0 off, 122 white, 125 blue, 126 green, 127 red. 0 for a mark means "don't show it on the Push". */
export const DEFAULT_PALETTE: Palette = { off: 0, inKey: 122, root: 125, target: 126, next: 0, pressed: 126, wrong: 127 };

export type PadEvent = { pad: Pad; velocity: number };

const isPush = (port: MIDIPort) => /push/i.test(port.name ?? '');

export class Push {
  /** Called for pad presses (velocity > 0) and releases (velocity 0). */
  onPad: (e: PadEvent) => void = () => {};
  /** Called for every incoming message on any input, for the Check page log. */
  onMessage: (port: string, data: Uint8Array) => void = () => {};
  private readonly sent: (number | undefined)[] = new Array(SIZE * SIZE);

  constructor(readonly access: MIDIAccess, readonly palette: Palette) {
    access.onstatechange = () => this.bind();
    this.bind();
  }

  get inputs(): MIDIInput[] {
    return [...this.access.inputs.values()];
  }

  get outputs(): MIDIOutput[] {
    return [...this.access.outputs.values()];
  }

  get found(): boolean {
    return this.inputs.some(isPush);
  }

  /** Light the grid from lesson cells; only changed pads are sent. */
  show(cells: Cell[]): void {
    cells.forEach((c, i) => {
      const colour = c.mark && this.palette[c.mark] ? this.palette[c.mark] : this.palette[c.base];
      this.setLed(i, colour);
    });
  }

  /**
   * Set one pad LED to a palette index. Sent to every Push output: Push only
   * accepts LED messages on the port of its current mode (Live or User).
   */
  setLed(index: number, colour: number, channel = 0): void {
    if (channel === 0 && this.sent[index] === colour) return;
    this.sent[index] = channel === 0 ? colour : undefined;
    for (const out of this.outputs.filter(isPush)) out.send([0x90 | channel, FIRST_PAD_NOTE + index, colour]);
  }

  clear(): void {
    for (let i = 0; i < SIZE * SIZE; i++) this.setLed(i, 0);
  }

  private bind(): void {
    for (const input of this.access.inputs.values()) {
      input.onmidimessage = (e) => e.data && this.receive(input, e.data);
    }
    this.sent.fill(undefined);
  }

  private receive(input: MIDIInput, data: Uint8Array): void {
    this.onMessage(input.name ?? '?', data);
    if (!isPush(input)) return;
    const type = data[0] & 0xf0;
    const i = data[1] - FIRST_PAD_NOTE;
    if ((type !== 0x90 && type !== 0x80) || i < 0 || i >= SIZE * SIZE) return;
    this.onPad({ pad: padAt(i), velocity: type === 0x90 ? data[2] : 0 });
  }
}
