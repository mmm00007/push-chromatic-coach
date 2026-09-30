<script lang="ts">
  import { metronome } from '../audio';

  let { on = $bindable(), bpm, beatsPerBar }: { on: boolean; bpm: number; beatsPerBar: number } = $props();

  let beat = $state(-1);
  $effect(() => {
    metronome.onBeat = (b) => (beat = b);
    return () => {
      metronome.onBeat = () => {};
    };
  });
  // (Re)start on changes. Watch mode restarts it in time with the playback.
  $effect(() => {
    if (on) metronome.start(bpm, beatsPerBar);
    return () => metronome.stop();
  });
</script>

<div class="metro">
  <label><input type="checkbox" bind:checked={on} /> Metronome</label>
  <span class="dots" aria-hidden="true">
    {#each Array.from({ length: beatsPerBar }, (_, i) => i) as i (i)}
      <span class="dot" class:first={i === 0} class:lit={on && beat === i}></span>
    {/each}
  </span>
  <span class="muted">{bpm} BPM · {beatsPerBar}/{beatsPerBar === 6 ? 8 : 4}</span>
</div>

<style>
  .metro { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .dots { display: inline-flex; gap: 5px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--pad-off); }
  .dot.first { outline: 1px solid var(--muted); }
  .dot.lit { background: var(--pad-target); }
  .dot.first.lit { background: var(--pad-root); }
</style>
