<script lang="ts">
  import { onDestroy } from 'svelte';
  import { audioNow, heardTime, metronome, noteOff, noteOn, playSteps } from '../audio';
  import { padIndex, padPitch, type Pad } from '../grid';
  import { Follow, keyLighting, markPads, type Cell } from '../lesson';
  import { describe, noteName, SCALES } from '../music';
  import { bestOf, record, starText } from '../progress';
  import type { Push } from '../push';
  import { PlayAlong, WINDOWS, type Judgment, type Summary } from '../scoring';
  import type { Settings } from '../settings';
  import type { Song } from '../song';
  import Grid from './Grid.svelte';
  import Highway from './Highway.svelte';
  import MetronomeControl from './MetronomeControl.svelte';
  import NowPlaying from './NowPlaying.svelte';

  let { song, push, settings, onback }: { song: Song; push: Push | null; settings: Settings; onback: () => void } = $props();

  type Phase = 'ready' | 'watch' | 'follow' | 'done' | 'playalong' | 'results';
  let sectionIndex = $state(0);
  let phase = $state<Phase>('ready');
  let tempo = $state(80);
  let watchStep = $state(-1);
  let version = $state(0);
  const section = $derived(song.sections[sectionIndex]);
  const follow = $derived(new Follow(song, section));
  const bpm = $derived(Math.round((song.bpm * tempo) / 100));
  const spb = $derived(60 / bpm);
  const basic = $derived(Boolean(song.category));
  /** Pads held outside Step-by-step mode (pad index → pitch), and which of them were wrong notes. */
  const free = new Map<number, number>();
  const wrongHeld = new Set<number>();
  /** A chord just completed in Step-by-step mode: named until the next press, even after release. */
  let completed = $state<number[] | null>(null);
  let stopPlayback: (() => void) | null = null;

  /** Audio time of the section's beat 0 while Watch or Play along runs; `now` follows the audio clock. */
  let clock = $state<number | null>(null);
  let now = $state(0);
  /** The current or last play-along run (read through `version`/`now`). */
  let run: PlayAlong | null = null;
  let result = $state<(Summary & { newBest: boolean; failed: boolean; tempo: number }) | null>(null);
  let popup = $state<{ id: number; text: string; kind: string; sub: string } | null>(null);
  let popupId = 0;

  const bests = $derived.by(() => {
    version;
    return song.sections.map((s) => bestOf(song.id, s.name));
  });

  const cells = $derived.by<Cell[]>(() => {
    version;
    if (phase === 'follow') return follow.cells();
    const c = keyLighting(song.base, song.key);
    if (phase === 'watch' && watchStep >= 0) markPads(c, follow.pads[watchStep], 'target');
    if (phase === 'playalong' && run && clock !== null) {
      // Pads light up ahead of time: a ring 1.5 beats early, solid green from half a beat before.
      const beat = (now - clock) / spb;
      const soon = Math.max(0.5, WINDOWS.good / spb);
      const open = section.steps.map((s, i) => (run!.results[i] ? Infinity : s.start - beat));
      open.forEach((ahead, i) => ahead > soon && ahead <= 1.5 && markPads(c, follow.pads[i], 'next'));
      open.forEach((ahead, i) => ahead <= soon && ahead >= -WINDOWS.good / spb && markPads(c, follow.pads[i], 'target'));
    }
    for (const i of free.keys()) c[i].mark = wrongHeld.has(i) ? 'wrong' : 'pressed';
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
  const beat = $derived.by(() => {
    version;
    if (clock !== null) return (now - clock) / spb;
    if (phase === 'follow') return section.steps[follow.index]?.start ?? section.beats;
    if (phase === 'done' || phase === 'results') return section.beats;
    return 0;
  });
  const noteStates = $derived.by(() => {
    version;
    now;
    return section.steps.map((_, i) => {
      if (phase === 'playalong' || phase === 'results') return run?.results[i]?.judgment;
      if (phase === 'follow' || phase === 'done') return i < follow.index ? 'done' : i === follow.index ? 'current' : undefined;
      if (phase === 'watch') return i === watchStep ? 'current' : undefined;
      return undefined;
    });
  });
  const hud = $derived.by(() => {
    version;
    now;
    return run && (phase === 'playalong' || phase === 'results') ? { score: run.score, combo: run.combo, mult: run.multiplier, meter: run.meter } : null;
  });
  const rootName = $derived(noteName(song.key.root, song.key));

  $effect(() => push?.show(cells));
  $effect(() => {
    if (!push) return;
    const p = push;
    p.onPad = (e) => (e.velocity > 0 ? press(e.pad, e.velocity, e.time) : release(e.pad));
    return () => {
      p.onPad = () => {};
    };
  });
  // Follow the audio clock every frame while something plays; in Play along, close missed notes.
  $effect(() => {
    if (clock === null) return;
    let frame = requestAnimationFrame(function tick() {
      now = audioNow();
      if (run && phase === 'playalong' && clock !== null) {
        const closed = run.update(now);
        if (closed.length) {
          showPopup(run.results[closed[closed.length - 1]]!.judgment);
          version++;
        }
        if ((run.failed && !settings.noFail) || now > clock + section.beats * spb + WINDOWS.good + 0.3) {
          finishRun();
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  });
  onDestroy(() => stop());

  function press(pad: Pad, velocity = 100, time = performance.now(), latch = false) {
    const i = padIndex(pad);
    const pitch = padPitch(song.base, pad);
    noteOn(pitch, velocity);
    completed = null;
    if (phase === 'follow') {
      const step = section.steps[follow.index];
      follow.press(pad, latch);
      if (step !== section.steps[follow.index] && step.pitches.length > 1) completed = step.pitches;
      if (follow.done) phase = 'done';
    } else {
      free.set(i, pitch);
      if (phase === 'playalong' && run) {
        const hit = run.press(pitch, heardTime(time) - settings.offsetMs / 1000);
        if (!hit) {
          wrongHeld.add(i);
          showPopup('wrong');
        } else if (hit.judgment) {
          showPopup(hit.judgment, run.results[hit.step]!.offset);
        }
      }
    }
    version++;
  }

  function release(pad: Pad) {
    const i = padIndex(pad);
    noteOff(padPitch(song.base, pad));
    follow.release(pad);
    free.delete(i);
    wrongHeld.delete(i);
    version++;
  }

  function showPopup(kind: Judgment | 'wrong', offset?: number | null) {
    const text = { perfect: 'PERFECT', great: 'GREAT', good: 'GOOD', miss: 'MISS', wrong: 'WRONG NOTE' }[kind];
    const sub = offset != null && kind !== 'perfect' && Math.abs(offset) > WINDOWS.perfect ? (offset < 0 ? 'early' : 'late') : '';
    popup = { id: ++popupId, text, kind, sub };
  }

  function stop() {
    stopPlayback?.();
    stopPlayback = null;
    watchStep = -1;
    clock = null;
    if (!settings.metronome) metronome.stop();
  }

  /** Beats of count-in: at least one full bar before bar 1, less any upbeat. */
  function countIn(): number {
    const pickup = song.pickup ?? 0;
    return song.beatsPerBar * (pickup ? 2 : 1) - pickup;
  }

  function watch() {
    stop();
    phase = 'watch';
    const leadIn = settings.metronome ? countIn() : 0;
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
    clock = playback.start + leadIn * spb;
    now = audioNow();
    if (settings.metronome) metronome.start(bpm, song.beatsPerBar, playback.start);
  }

  function startFollow() {
    stop();
    follow.restart();
    phase = 'follow';
    version++;
  }

  function playAlong() {
    stop();
    const leadIn = countIn();
    const playback = playSteps(section.steps, section.beats, bpm, () => {}, () => {}, leadIn, settings.guide ? 0.35 : 0);
    stopPlayback = playback.stop;
    clock = playback.start + leadIn * spb;
    now = audioNow();
    metronome.start(bpm, song.beatsPerBar, playback.start);
    run = new PlayAlong(section, spb, clock, tempo / 100);
    result = null;
    popup = null;
    phase = 'playalong';
    version++;
  }

  function finishRun() {
    if (!run) return;
    run.update(Infinity);
    const failed = run.failed && !settings.noFail;
    const summary = run.summary();
    const newBest = !failed && record(song.id, section.name, { score: summary.score, stars: summary.stars, accuracy: summary.accuracy, tempo });
    result = { ...summary, newBest, failed, tempo };
    stop();
    phase = 'results';
    version++;
  }

  function faster() {
    tempo = Math.min(120, tempo + 10);
    playAlong();
  }

  function pickSection(i: number) {
    stop();
    sectionIndex = i;
    phase = 'ready';
    run = null;
    result = null;
  }

  function timing(ms: number): string {
    if (Math.abs(ms) < 20) return 'Right on the beat.';
    return `On average ${Math.abs(ms)} ms ${ms < 0 ? 'early: you are rushing' : 'late: you are dragging'}.`;
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
    <button class:selected={i === sectionIndex} onclick={() => pickSection(i)}>
      {s.name}{#if bests[i]}<span class="tabstars">{starText(bests[i]!.stars)}</span>{/if}
    </button>
  {/each}
</div>

<div class="layout">
  <div class="left">
    <div class="stage">
      {#if hud}
        <div class="hud">
          <span class="score">{hud.score.toLocaleString()}</span>
          <span class="combo">{hud.combo > 1 ? `${hud.combo} combo` : ''}</span>
          <span class="mult m{hud.mult}">×{hud.mult}</span>
          <span class="meter" title="Rock meter"><span class:low={hud.meter < 0.25} style="width: {hud.meter * 100}%"></span></span>
        </div>
      {/if}
      <Highway
        {section}
        key={song.key}
        {beat}
        states={noteStates}
        beatsPerBar={song.beatsPerBar}
        smooth={phase === 'follow'}
        overview={phase === 'ready' || phase === 'done' || phase === 'results'}
      />
      {#if popup && phase === 'playalong'}
        {#key popup.id}
          <div class="popup {popup.kind}">{popup.text}{#if popup.sub}<small>{popup.sub}</small>{/if}</div>
        {/key}
      {/if}
    </div>
    <Grid {cells} {labels} onpress={(p) => press(p, 100, performance.now(), true)} onrelease={release} />
    <div class="panel controls">
      <MetronomeControl bind:on={settings.metronome} {bpm} beatsPerBar={song.beatsPerBar} />
      <label class="row muted">
        Tempo
        <input type="range" min="40" max="120" step="5" bind:value={tempo} disabled={phase === 'playalong'} />
        {tempo}%
      </label>
      <div class="row muted">
        <label><input type="checkbox" bind:checked={settings.showNames} /> Note names</label>
        <label title="Play along: hear the part softly while you play it"><input type="checkbox" bind:checked={settings.guide} /> Guide notes</label>
        <label title="Play along: an empty rock meter does not end the run"><input type="checkbox" bind:checked={settings.noFail} /> No fail</label>
      </div>
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
        <p><strong>Watch</strong> it first, learn it <strong>step by step</strong>, then <strong>play along</strong> in time for a score.</p>
      {:else if phase === 'watch'}
        <p>Watch and listen… your turn comes next.</p>
      {:else if phase === 'follow' && target}
        <p class="big">
          Play: <strong>{target.d.symbol || target.d.name}</strong>
          {#if target.label}<span class="tag">{target.label}</span>{/if}
        </p>
        <p class="muted">{progress}</p>
      {:else if phase === 'done'}
        <p class="big">{follow.mistakes === 0 ? 'Clean run! 🎉' : `Done, with ${follow.mistakes} wrong note${follow.mistakes > 1 ? 's' : ''}.`}</p>
        <p class="muted">{follow.mistakes === 0 ? 'Now Play along: hit each note in time as it reaches the line.' : 'Go again for a clean run.'}</p>
      {:else if phase === 'playalong'}
        <p class="big">Play along at {tempo}%</p>
        <p class="muted">Hit each note as it reaches the green line. The count-in clicks one bar first.</p>
      {:else if result}
        <div class="results">
          <div class="stars">{starText(result.stars)}</div>
          {#if result.failed}<p><strong>The rock meter ran out.</strong> Try a slower tempo, or turn on No fail.</p>{/if}
          <p class="big">
            <strong>{result.score.toLocaleString()}</strong> points at {result.tempo}%
            {#if result.newBest}<span class="tag">New best!</span>{/if}
            {#if result.fullCombo}<span class="tag fc">FULL COMBO</span>{/if}
          </p>
          <p>Accuracy {Math.round(result.accuracy * 100)}% · best combo {result.maxCombo}</p>
          <p class="counts">
            <span class="perfect">{result.counts.perfect} perfect</span> · <span class="great">{result.counts.great} great</span> ·
            <span class="good">{result.counts.good} good</span> · <span class="miss">{result.counts.miss} missed</span>{#if result.wrong} · {result.wrong} wrong notes{/if}
          </p>
          <p class="muted">{timing(result.meanOffsetMs)}{#if result.meanOffsetMs > 80} Always late with good playing? Bluetooth headphones add delay: set a timing offset on Check Push.{/if}</p>
        </div>
      {/if}
      <div class="row">
        <button class:primary={phase === 'ready'} onclick={watch}>{phase === 'watch' ? 'Restart' : 'Watch'}</button>
        <button class:primary={phase === 'watch'} onclick={startFollow}>{phase === 'follow' ? 'Restart' : 'Step by step'}</button>
        <button class:primary={phase === 'done' || phase === 'results'} onclick={playAlong}>
          {phase === 'playalong' ? 'Restart' : phase === 'results' ? 'Retry' : 'Play along ★'}
        </button>
        {#if phase === 'playalong'}<button onclick={finishRun}>Stop</button>{/if}
        {#if phase === 'results' && result && result.stars >= 4 && tempo < 120}
          <button onclick={faster}>Faster ({Math.min(120, tempo + 10)}%) →</button>
        {/if}
        {#if (phase === 'done' || phase === 'results') && sectionIndex < song.sections.length - 1}
          <button onclick={() => pickSection(sectionIndex + 1)}>Next section →</button>
        {/if}
      </div>
    </div>

    <NowPlaying pitches={playing} key={song.key} />

    {#if !basic && (phase === 'done' || phase === 'results') && song.concept}
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
  .tabstars { margin-left: 6px; color: #f2c94c; font-size: 0.8em; letter-spacing: -1px; }
  .layout { display: grid; grid-template-columns: minmax(0, 540px) minmax(260px, 1fr); gap: 1.25rem; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  .left, .side { display: flex; flex-direction: column; gap: 12px; }
  .stage { position: relative; display: flex; flex-direction: column; gap: 6px; width: min(100%, 540px); }
  .hud { display: flex; align-items: center; gap: 12px; font-weight: 700; }
  .score { font-size: 1.3rem; font-variant-numeric: tabular-nums; min-width: 5ch; }
  .combo { color: var(--muted); min-width: 7ch; }
  .mult { padding: 1px 8px; border-radius: 6px; background: var(--pad-off); }
  .mult.m2 { background: #f2c94c; color: #2a2000; }
  .mult.m3 { background: #8fd14f; color: #0d1a05; }
  .mult.m4 { background: #b36bff; color: #fff; box-shadow: 0 0 10px #b36bff; }
  .meter { flex: 1; height: 10px; border-radius: 5px; background: var(--pad-off); overflow: hidden; }
  .meter span { display: block; height: 100%; background: var(--pad-target); transition: width 150ms; }
  .meter span.low { background: var(--pad-wrong); }
  .popup {
    position: absolute;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    font-size: 1.6rem;
    font-weight: 900;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 8px #000;
    pointer-events: none;
    animation: pop 600ms ease-out forwards;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .popup small { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  @keyframes pop {
    0% { opacity: 0; transform: translateX(-50%) scale(0.7); }
    15% { opacity: 1; transform: translateX(-50%) scale(1.1); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(1); }
  }
  .perfect { color: var(--pad-target); }
  .great { color: #8fd14f; }
  .good { color: #f2c94c; }
  .miss, .wrong { color: var(--pad-wrong); }
  .controls { display: flex; flex-direction: column; gap: 6px; }
  .status p { margin: 0 0 0.5rem; }
  .big { font-size: 1.25rem; }
  .tag { margin-left: 6px; padding: 1px 8px; border-radius: 6px; border: 1px solid var(--accent); color: var(--accent); font-size: 0.8em; }
  .tag.fc { border-color: #b36bff; color: #b36bff; }
  .results .stars { font-size: 2rem; color: #f2c94c; letter-spacing: 2px; }
  .row { display: flex; gap: 8px 12px; align-items: center; flex-wrap: wrap; }
  .status .row { margin-top: 0.6rem; }
  .concept { border-color: var(--accent); }
  .concept p { margin: 0; }
  .small { font-size: 0.9em; }
</style>
