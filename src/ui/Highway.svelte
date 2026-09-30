<script lang="ts">
  import { describe, type Key } from '../music';
  import type { Section } from '../song';

  let {
    section,
    key,
    beat,
    states,
    beatsPerBar,
    smooth = false,
    overview = false,
  }: {
    section: Section;
    key: Key;
    /** Song position in beats at the hit line. */
    beat: number;
    /** Per step: 'perfect' | 'great' | 'good' | 'miss' | 'done' | 'current', or nothing yet. */
    states: (string | undefined)[];
    beatsPerBar: number;
    /** Glide between positions (step-by-step mode) instead of following the clock. */
    smooth?: boolean;
    /** Show the whole section at once (before starting and on the results), without scrolling. */
    overview?: boolean;
  } = $props();

  const HEIGHT = 104;
  const NOTE = 24;
  const LINE = 64;

  // Spread short notes wider so fast passages stay readable.
  const ppb = $derived(Math.min(140, Math.max(60, 26 / Math.min(...section.steps.map((s) => s.dur)))));
  const top = $derived(section.steps.map((s) => Math.max(...s.pitches)));
  const lo = $derived(Math.min(...top));
  const hi = $derived(Math.max(...top));
  // Positions: pixels on a scrolling track, or percentages of the width in overview.
  const unit = $derived(overview ? '%' : 'px');
  const scale = $derived(overview ? 100 / section.beats : ppb);
  const notes = $derived(
    section.steps.map((s, i) => {
      const d = describe(s.pitches, key)!;
      return {
        x: s.start * scale,
        w: overview ? s.dur * scale : Math.max(s.dur * ppb - 4, 22),
        y: hi === lo ? (HEIGHT - NOTE) / 2 : ((hi - top[i]) / (hi - lo)) * (HEIGHT - NOTE),
        text: d.symbol || d.name,
        label: s.label,
      };
    }),
  );
  const bars = $derived(Array.from({ length: Math.floor(section.beats / beatsPerBar) + 1 }, (_, i) => i * beatsPerBar * scale));
</script>

<div class="highway" class:overview style="height: {HEIGHT}px">
  <div class="track" class:smooth style={overview ? '' : `transform: translateX(${LINE - beat * ppb}px)`}>
    {#each bars as x (x)}<div class="bar" style="left: {x}{unit}"></div>{/each}
    {#each notes as n, i (i)}
      <div class="note {states[i] ?? ''}" style="left: {n.x}{unit}; top: {n.y}px; width: calc({n.w}{unit} - {overview ? 2 : 0}px); height: {NOTE}px">
        {n.text}{#if n.label}<small>{n.label}</small>{/if}
      </div>
    {/each}
  </div>
  {#if !overview}<div class="line" style="left: {LINE}px"></div>{/if}
</div>

<style>
  .highway {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(90deg, #15161a, #1c1d22);
    border: 1px solid var(--line);
  }
  .track { position: absolute; inset: 0; will-change: transform; }
  .overview .track { inset: 0 8px; }
  .overview .note { padding: 0 3px; font-size: 11px; }
  .track.smooth { transition: transform 180ms ease-out; }
  .bar { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--line); }
  .line { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1px; background: var(--pad-target); box-shadow: 0 0 10px var(--pad-target); }
  .note {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px;
    border-radius: 6px;
    background: var(--pad-key);
    color: #26272b;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
  }
  .note small { font-weight: 600; opacity: 0.7; }
  .current { background: var(--pad-target); color: #07140c; }
  .done, .perfect { background: var(--pad-target); color: #07140c; opacity: 0.55; }
  .perfect { opacity: 0.9; }
  .great { background: #8fd14f; color: #0d1a05; opacity: 0.85; }
  .good { background: #f2c94c; color: #2a2000; opacity: 0.85; }
  .miss { background: var(--pad-wrong); color: #fff; opacity: 0.7; }
</style>
