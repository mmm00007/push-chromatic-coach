<script lang="ts">
  import { describe, keyName, noteName, SCALES, type Key } from '../music';

  let { pitches, key }: { pitches: number[]; key: Key } = $props();

  // Keep showing the last notes after release so there is time to read them.
  let last = $state<number[]>([]);
  $effect(() => {
    if (pitches.length) last = [...pitches];
  });
  const shown = $derived(pitches.length ? pitches : last);
  const d = $derived(describe(shown, key));
  const shownPcs = $derived(new Set(shown.map((p) => ((p % 12) + 12) % 12)));
  const scale = $derived(SCALES[key.scale].steps.map((s) => ({ pc: (key.root + s) % 12, name: noteName(key.root + s, key) })));
</script>

<div class="panel now" class:stale={!pitches.length}>
  <div class="muted small">What you're playing</div>
  {#if d}
    <div class="big">{d.symbol || d.name}</div>
    {#if d.symbol && d.symbol !== d.name}<div>{d.name}</div>{/if}
    {#if d.notes.length > 1}<div class="notes">{d.notes.join(' · ')}</div>{/if}
    {#if d.detail}<div class="muted">{d.detail}</div>{/if}
  {:else}
    <div class="big muted">–</div>
    <div class="muted">Press a pad</div>
  {/if}
  <div class="scale">
    <span class="muted small">{keyName(key)}</span>
    <div class="chips">
      {#each scale as s (s.pc)}
        <span class="chip" class:root={s.pc === key.root} class:on={shownPcs.has(s.pc)}>{s.name}</span>
      {/each}
    </div>
  </div>
</div>

<style>
  .now { display: flex; flex-direction: column; gap: 2px; }
  .big { font-size: 2rem; font-weight: 700; line-height: 1.1; margin-top: 4px; }
  .notes { font-weight: 600; letter-spacing: 0.03em; }
  .stale .big, .stale .notes { opacity: 0.6; }
  .scale { margin-top: 10px; border-top: 1px solid var(--line); padding-top: 8px; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .chip { min-width: 2.2em; text-align: center; padding: 2px 6px; border-radius: 6px; background: var(--pad-key); color: #26272b; font-weight: 600; font-size: 0.9em; }
  .chip.root { background: var(--pad-root); color: #fff; }
  .chip.on { background: var(--pad-target); color: #07140c; }
  .small { font-size: 0.85em; }
</style>
