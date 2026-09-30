<script lang="ts">
  import { onDestroy } from 'svelte';
  import { metronome, noteOff, noteOn, playSteps } from '../audio';
  import { padIndex, padPitch, type Pad } from '../grid';
  import { Follow, keyLighting, markPads, type Cell } from '../lesson';
  import { describe, noteName, SCALES } from '../music';
  import type { Push } from '../push';
  import type { Settings } from '../settings';
  import type { Song } from '../song';
  import Grid from './Grid.svelte';
  import MetronomeControl from './MetronomeControl.svelte';
  import NowPlaying from './NowPlaying.svelte';

  let { song, push, settings, onback }: { song: Song; push: Push | null; settings: Settings; onback: () => void } = $props();

  type Phase = 'ready' | 'watch' | 'follow' | 'done';
  let sectionIndex = $state(0);
  let phase = $state<Phase>('ready');
  let tempo = $state(80);
  let watchStep = $state(-1);
  let version = $state(0);
  const section = $derived(song.sections[sectionIndex]);
  const follow = $derived(new Follow(song, section));
  const bpm = $derived(Math.round((song.bpm * tempo) / 100));
  const basic = $derived(Boolean(song.category));
  /** Pads held outside Play mode (pad index → pitch). */
  const free = new Map<number, number>();
  /** A chord just completed in Play mode: named until the next press, even after release. */
  let completed = $state<number[] | null>(null);
  let stopPlayback: (() => void) | null = null;

  const cells = $derived.by<Cell[]>(() => {
    version;
    if (phase === 'follow') return follow.cells();
    const c = keyLighting(song.base, song.key);
    if (phase === 'watch' && watchStep >= 0) markPads(c, follow.pads[watchStep], 'target');
    for (const i of free.keys()) c[i].mark = 'pressed';
    return c;
  });
  const labels = $derived(settings.showNames ? cells.map((c) => noteName(c.pitch, song.key)) : undefined);
  const playing = $derived.by(() => {
    version;
    if (phase === 'watch') return watchStep >= 0 ? section.steps[watchStep].pitches : [];
    return completed ?? [...follow.heldPitches, ...free.values()];
  });
  const target = $derived.by(() => {
    version;
    const step = section.steps[follow.index];
    return step && { d: describe(step.pitches, song.key)!, label: step.label };
  });
  const rootName = $derived(noteName(song.key.root, song.key));
  const progress = $derived.by(() => {
    version;
    return [
      target && target.d.notes.length > 1 ? target.d.notes.join(' · ') : '',
      `step ${follow.index + 1} of ${section.steps.length}`,
      follow.mistakes ? `${follow.mistakes} wrong` : '',
    ]
      .filter(Boolean)
      .join(' · ');
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
  onDestroy(() => stopPlayback?.());

  function press(pad: Pad, velocity = 100, latch = false) {
    const pitch = padPitch(song.base, pad);
    noteOn(pitch, velocity);
    completed = null;
    if (phase === 'follow') {
      const step = section.steps[follow.index];
      follow.press(pad, latch);
      if (step !== section.steps[follow.index] && step.pitches.length > 1) completed = step.pitches;
      if (follow.done) phase = 'done';
    } else {
      free.set(padIndex(pad), pitch);
    }
    version++;
  }

  function release(pad: Pad) {
    noteOff(padPitch(song.base, pad));
    follow.release(pad);
    free.delete(padIndex(pad));
    version++;
  }

  function stop() {
    stopPlayback?.();
    stopPlayback = null;
    watchStep = -1;
  }

  function watch() {
    stop();
    phase = 'watch';
    // With the metronome on, count in one bar (less any upbeat) so bar 1 lands on the accent.
    const leadIn = settings.metronome ? song.beatsPerBar - (song.pickup ?? 0) : 0;
    const playback = playSteps(
      section.steps,
      section.beats,
      bpm,
      (i, on) => {
        if (on) watchStep = i;
        else if (watchStep === i) watchStep = -1;
      },
      () => {
        stopPlayback = null;
        startFollow();
      },
      leadIn,
    );
    stopPlayback = playback.stop;
    if (settings.metronome) metronome.start(bpm, song.beatsPerBar, playback.start);
  }

  function startFollow() {
    stop();
    follow.restart();
    phase = 'follow';
    version++;
  }

  function pickSection(i: number) {
    stop();
    sectionIndex = i;
    phase = 'ready';
  }
</script>

<div class="top">
  <button onclick={onback}>← Back</button>
  <div>
    <h1>{song.title}</h1>
    <div class="muted">{song.subtitle}</div>
  </div>
</div>

<div class="sections">
  {#each song.sections as s, i (s.name)}
    <button class:selected={i === sectionIndex} onclick={() => pickSection(i)}>{s.name}</button>
  {/each}
</div>

<div class="layout">
  <div class="left">
    <Grid {cells} {labels} onpress={(p) => press(p, 100, true)} onrelease={release} />
    <div class="panel controls">
      <MetronomeControl bind:on={settings.metronome} {bpm} beatsPerBar={song.beatsPerBar} />
      <label class="row muted">
        Tempo
        <input type="range" min="40" max="120" step="5" bind:value={tempo} />
        {tempo}%
      </label>
      <label class="row muted"><input type="checkbox" bind:checked={settings.showNames} /> Note names on pads</label>
    </div>
  </div>

  <div class="side">
    {#if basic && song.concept}
      <div class="panel concept">
        <h3>{song.concept.title}</h3>
        <p>{song.concept.text}</p>
      </div>
    {/if}

    <div class="panel status">
      {#if phase === 'ready'}
        <p><strong>Watch</strong> to hear it and see the pads light up, then play it back yourself.</p>
      {:else if phase === 'watch'}
        <p>Watch and listen… your turn comes next.</p>
      {:else if phase === 'follow' && target}
        <p class="big">
          Play: <strong>{target.d.symbol || target.d.name}</strong>
          {#if target.label}<span class="tag">{target.label}</span>{/if}
        </p>
        <p class="muted">{progress}</p>
      {:else}
        <p class="big">{follow.mistakes === 0 ? 'Clean run! 🎉' : `Done, with ${follow.mistakes} wrong note${follow.mistakes > 1 ? 's' : ''}.`}</p>
        <p class="muted">{follow.mistakes === 0 ? 'Try the next section, or turn the metronome on and play it in time.' : 'Go again for a clean run.'}</p>
      {/if}
      <div class="row">
        <button class:primary={phase === 'ready' || phase === 'done'} onclick={watch}>{phase === 'watch' ? 'Restart' : 'Watch'}</button>
        <button class:primary={phase === 'watch'} onclick={startFollow}>{phase === 'follow' ? 'Restart' : 'Play'}</button>
        {#if phase === 'done' && sectionIndex < song.sections.length - 1}
          <button onclick={() => pickSection(sectionIndex + 1)}>Next section →</button>
        {/if}
      </div>
    </div>

    <NowPlaying pitches={playing} key={song.key} />

    {#if !basic && phase === 'done' && song.concept}
      <div class="panel concept">
        <h3>{song.concept.title}</h3>
        <p>{song.concept.text}</p>
      </div>
    {/if}

    <div class="panel muted small">
      <strong>Same layout on your Push with Live:</strong> Scale {rootName} {SCALES[song.key.scale].push},
      Chromatic (In Key off), Layout 4ths, Fixed off. The blue pad is the root, {rootName}.
      {#if !push?.found}<br /><br />Push not found: click the pads on screen (for chords, click each note), or open <em>Check Push</em>.{/if}
    </div>
  </div>
</div>

<style>
  .top { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
  .top h1 { font-size: 1.4rem; margin: 0; }
  .sections { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem; }
  .layout { display: grid; grid-template-columns: minmax(0, 540px) minmax(260px, 1fr); gap: 1.25rem; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  .left, .side { display: flex; flex-direction: column; gap: 12px; }
  .controls { display: flex; flex-direction: column; gap: 6px; }
  .status p { margin: 0 0 0.5rem; }
  .big { font-size: 1.25rem; }
  .tag { margin-left: 6px; padding: 1px 8px; border-radius: 6px; border: 1px solid var(--accent); color: var(--accent); font-size: 0.85em; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .status .row { margin-top: 0.6rem; }
  .concept { border-color: var(--accent); }
  .concept p { margin: 0; }
  .small { font-size: 0.9em; }
</style>
