<script lang="ts">
  import { noteOff, noteOn } from '../audio';
  import { padIndex, padPitch, type Pad } from '../grid';
  import { keyLighting, type Cell } from '../lesson';
  import { makeKey, noteName, SCALES, type ScaleId } from '../music';
  import type { Push } from '../push';
  import type { Settings } from '../settings';
  import Grid from './Grid.svelte';
  import MetronomeControl from './MetronomeControl.svelte';
  import NowPlaying from './NowPlaying.svelte';

  let { push, settings }: { push: Push | null; settings: Settings } = $props();

  const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  let root = $state(0);
  let scale = $state<ScaleId>('major');
  let octave = $state(3);
  let bpm = $state(90);
  let beatsPerBar = $state(4);
  let version = $state(0);
  /** Held pads (pad index → pitch), so a key change mid-note still releases the right sound. */
  const held = new Map<number, number>();

  const key = $derived(makeKey(root, scale));
  const base = $derived((octave + 1) * 12 + root);
  const cells = $derived.by<Cell[]>(() => {
    version;
    const c = keyLighting(base, key);
    for (const i of held.keys()) c[i].mark = 'pressed';
    return c;
  });
  const labels = $derived(settings.showNames ? cells.map((c) => noteName(c.pitch, key)) : undefined);
  const playing = $derived.by(() => {
    version;
    return [...held.values()];
  });

  $effect(() => push?.show(cells));
  $effect(() => {
    if (!push) return;
    const p = push;
    p.onPad = (e) => (e.velocity > 0 ? press(e.pad, e.velocity) : release(e.pad));
    return () => {
      p.onPad = () => {};
    };
  });

  function press(pad: Pad, velocity = 100) {
    const pitch = padPitch(base, pad);
    noteOn(pitch, velocity);
    held.set(padIndex(pad), pitch);
    version++;
  }

  function release(pad: Pad) {
    const pitch = held.get(padIndex(pad));
    if (pitch !== undefined) noteOff(pitch);
    held.delete(padIndex(pad));
    version++;
  }
</script>

<h1>Free play</h1>
<p class="muted">Pick a key and play anything: the panel names every note, interval and chord you hold, and its role in the key.</p>

<div class="layout">
  <div class="left">
    <div class="panel controls">
      <label>Key
        <select bind:value={root}>
          {#each ROOTS as name, pc (pc)}<option value={pc}>{name}</option>{/each}
        </select>
        <select bind:value={scale}>
          {#each Object.entries(SCALES) as [id, s] (id)}<option value={id}>{s.name}</option>{/each}
        </select>
      </label>
      <span class="octave">
        Bottom-left pad
        <button onclick={() => (octave = Math.max(0, octave - 1))} aria-label="Octave down">−</button>
        <strong>{noteName(base, key)}{octave}</strong>
        <button onclick={() => (octave = Math.min(5, octave + 1))} aria-label="Octave up">+</button>
      </span>
    </div>
    <Grid {cells} {labels} onpress={(p) => press(p)} onrelease={release} />
    <div class="panel controls">
      <MetronomeControl bind:on={settings.metronome} {bpm} {beatsPerBar} />
      <label class="muted">BPM <input type="number" min="30" max="240" bind:value={bpm} /></label>
      <label class="muted">Beats per bar
        <select bind:value={beatsPerBar}>{#each [2, 3, 4, 6] as n (n)}<option value={n}>{n}</option>{/each}</select>
      </label>
      <label class="muted"><input type="checkbox" bind:checked={settings.showNames} /> Note names on pads</label>
    </div>
  </div>
  <div class="side">
    <NowPlaying pitches={playing} {key} />
    <div class="panel muted small">
      <strong>Same layout on your Push with Live:</strong> Scale {ROOTS[root]} {SCALES[scale].push}, Chromatic (In Key off),
      Layout 4ths, Fixed off. The blue pads are the root.
    </div>
  </div>
</div>

<style>
  h1 { font-size: 1.4rem; margin-bottom: 0.2rem; }
  .layout { display: grid; grid-template-columns: minmax(0, 540px) minmax(260px, 1fr); gap: 1.25rem; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  .left, .side { display: flex; flex-direction: column; gap: 12px; }
  .controls { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; }
  .octave { display: inline-flex; align-items: center; gap: 6px; }
  .octave button { padding: 0.1em 0.6em; }
  select, input[type='number'] { font: inherit; background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 6px; padding: 2px 4px; }
  input[type='number'] { width: 4.5em; }
  .small { font-size: 0.9em; }
</style>
