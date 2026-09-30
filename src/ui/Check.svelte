<script lang="ts">
  import { choosePads, padIndex, SIZE } from '../grid';
  import { keyLighting, markPads, type Cell } from '../lesson';
  import { DEFAULT_PALETTE, FIRST_PAD_NOTE, type Palette, type Push } from '../push';
  import type { Settings } from '../settings';
  import { SONGS } from '../songs';
  import Grid from './Grid.svelte';

  let { push, settings, midiError }: { push: Push | null; settings: Settings; midiError: string } = $props();

  type Test = 'pads' | 'low' | 'high' | 'lesson';
  let test = $state<Test>('pads');
  let log = $state<string[]>([]);
  let lastPad = $state<number | null>(null);
  let showExpression = $state(false);
  let portsVersion = $state(0);

  const ROLES: [keyof Palette, string][] = [
    ['root', 'Root note (blue on Push)'],
    ['inKey', 'Notes in the key (white)'],
    ['target', 'Pad to play now'],
    ['next', 'Pad after that (0 = not shown on Push)'],
    ['pressed', 'Pad you are holding'],
    ['wrong', 'Wrong note'],
  ];

  // Example lesson lighting: Ode to Joy with each highlight shown once.
  const example = $derived.by<Cell[]>(() => {
    const song = SONGS.find((s) => s.id === 'ode-to-joy')!;
    const pads = choosePads(song.base, song.sections[0].steps.map((s) => s.pitches));
    const cells = keyLighting(song.base, song.key);
    markPads(cells, pads[3], 'next');
    markPads(cells, pads[2], 'target');
    cells[padIndex(pads[0][0])].mark = 'pressed';
    cells[1].mark = 'wrong';
    return cells;
  });

  const neutral: Cell[] = Array.from({ length: SIZE * SIZE }, () => ({ pitch: 0, base: 'off' }));
  const screenCells = $derived.by<Cell[]>(() => {
    if (test === 'lesson') return example;
    if (test !== 'pads' || lastPad === null) return neutral;
    return neutral.map((c, i) => (i === lastPad ? { ...c, mark: 'target' } : c));
  });
  const screenLabels = $derived(
    Array.from({ length: SIZE * SIZE }, (_, i) =>
      test === 'low' ? String(i) : test === 'high' ? String(64 + i) : test === 'lesson' ? '' : String(FIRST_PAD_NOTE + i),
    ),
  );
  const ports = $derived.by(() => {
    portsVersion;
    return push ? [...push.inputs.map((p) => `in: ${p.name} (${p.state})`), ...push.outputs.map((p) => `out: ${p.name} (${p.state})`)] : [];
  });

  $effect(() => {
    if (!push) return;
    const p = push;
    p.onMessage = (port, data) => {
      const kind = data[0] & 0xf0;
      const expression = kind === 0xa0 || kind === 0xd0 || kind === 0xe0 || (kind === 0xb0 && data[1] === 74);
      if (expression && !showExpression) return;
      log = [`${port}: ${hex(data)}   ${describe(data)}`, ...log].slice(0, 40);
    };
    p.onPad = (e) => {
      if (e.velocity > 0) lastPad = padIndex(e.pad);
    };
    return () => {
      p.onMessage = () => {};
      p.onPad = () => {};
    };
  });

  // Send the selected test to the Push LEDs (re-sent when palette numbers change).
  $effect(() => {
    if (!push) return;
    if (test === 'lesson') push.show(example);
    else if (test === 'low' || test === 'high') for (let i = 0; i < SIZE * SIZE; i++) push.setLed(i, (test === 'high' ? 64 : 0) + i);
    else for (let i = 0; i < SIZE * SIZE; i++) push.setLed(i, i === lastPad ? settings.palette.target : 0);
  });

  function hex(d: Uint8Array) {
    return [...d].map((b) => b.toString(16).padStart(2, '0')).join(' ');
  }

  function describe(d: Uint8Array) {
    const kind = d[0] & 0xf0;
    const ch = (d[0] & 0x0f) + 1;
    if (kind === 0x90 && d[2] > 0) return `note on ${d[1]} vel ${d[2]} ch ${ch}`;
    if (kind === 0x80 || kind === 0x90) return `note off ${d[1]} ch ${ch}`;
    if (kind === 0xa0) return `poly pressure ${d[1]} = ${d[2]} ch ${ch}`;
    if (kind === 0xb0) return `CC ${d[1]} = ${d[2]} ch ${ch}`;
    if (kind === 0xd0) return `channel pressure ${d[1]} ch ${ch}`;
    if (kind === 0xe0) return `pitch bend ch ${ch}`;
    return 'system';
  }
</script>

<h1>Check Push</h1>
{#if midiError}
  <div class="panel error">{midiError}</div>
{/if}

<div class="layout">
  <div>
    <div class="tabs">
      <button class:selected={test === 'pads'} onclick={() => (test = 'pads')}>Pad test</button>
      <button class:selected={test === 'low'} onclick={() => (test = 'low')}>Colours 0–63</button>
      <button class:selected={test === 'high'} onclick={() => (test = 'high')}>Colours 64–127</button>
      <button class:selected={test === 'lesson'} onclick={() => (test = 'lesson')}>Lesson colours</button>
    </div>
    <Grid cells={screenCells} labels={screenLabels} onpress={() => {}} onrelease={() => {}} />
    <p class="muted small">
      {#if test === 'pads'}Numbers are the MIDI notes each pad should send. Press a pad on the Push: the same square lights here and on the Push.
      {:else if test === 'lesson'}The Push shows a lesson: root, key notes, the pad to play now, the next pad, a held pad and a wrong note.
      {:else}Each Push pad shows the colour with the number on the same square here. Pick good numbers for the lesson colours below.{/if}
    </p>
  </div>

  <div class="side">
    <div class="panel">
      <h3>Setup</h3>
      <ol>
        <li>Connect Push 3 by USB-C and plug in its power supply.</li>
        <li>Standalone Push 3: <em>Setup → Status → Control Live</em>. Leave Live closed.</li>
        <li>Press <strong>User</strong> on the Push.</li>
        <li>Press the corner pads: they should log notes 36 (bottom-left), 43, 92 and 99 (top-right).</li>
        <li>Try the colour tests, then screenshot this page to share the results.</li>
      </ol>
    </div>

    <div class="panel">
      <h3>MIDI ports <button class="small" onclick={() => portsVersion++}>Refresh</button></h3>
      {#each ports as port (port)}<div class="mono">{port}</div>{:else}<div class="muted">No MIDI ports.</div>{/each}
    </div>

    <div class="panel">
      <h3>Lesson colours on the Push</h3>
      {#each ROLES as [role, label] (role)}
        <label class="role">
          <span>{label}</span>
          <input type="number" min="0" max="127" bind:value={settings.palette[role]} onfocus={() => (test = 'lesson')} />
        </label>
      {/each}
      <button class="small" onclick={() => Object.assign(settings.palette, DEFAULT_PALETTE)}>Reset to defaults</button>
    </div>

    <div class="panel">
      <h3>Play-along timing</h3>
      <p class="muted small">Your speakers' delay is corrected automatically. If Play along keeps saying you are late
        (or early) when you are sure you are on the beat, for example with Bluetooth headphones, set a correction here.</p>
      <label class="role"><span>Timing offset (ms, + if judged late)</span>
        <input type="number" min="-300" max="500" step="10" bind:value={settings.offsetMs} /></label>
    </div>

    <div class="panel">
      <h3>Incoming MIDI</h3>
      <label class="muted small"><input type="checkbox" bind:checked={showExpression} /> Show pressure, slide and pitch bend</label>
      <div class="log mono">
        {#each log as line, i (i)}<div>{line}</div>{:else}<div class="muted">Press a pad…</div>{/each}
      </div>
    </div>
  </div>
</div>

<style>
  h1 { font-size: 1.4rem; }
  .layout { display: grid; grid-template-columns: minmax(0, 540px) minmax(280px, 1fr); gap: 1.25rem; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .side { display: flex; flex-direction: column; gap: 12px; }
  .side ol { margin: 0; padding-left: 1.2rem; }
  .role { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .role input { width: 5em; }
  .log { max-height: 260px; overflow: auto; margin-top: 8px; }
  .mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
  .small { font-size: 0.85em; }
  .error { border-color: var(--pad-wrong); margin-bottom: 1rem; }
</style>
