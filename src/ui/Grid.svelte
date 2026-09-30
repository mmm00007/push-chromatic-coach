<script lang="ts">
  import { padAt, SIZE, type Pad } from '../grid';
  import type { Cell } from '../lesson';

  let {
    cells,
    labels,
    onpress,
    onrelease,
  }: {
    cells: Cell[];
    labels?: string[];
    onpress: (pad: Pad) => void;
    onrelease: (pad: Pad) => void;
  } = $props();

  // Screen order: the Push's top row (row 7) first.
  const order = Array.from({ length: SIZE * SIZE }, (_, k) => (SIZE - 1 - Math.floor(k / SIZE)) * SIZE + (k % SIZE));
  const held = new Set<number>();

  function down(i: number) {
    held.add(i);
    onpress(padAt(i));
  }

  function up(i: number) {
    if (held.delete(i)) onrelease(padAt(i));
  }
</script>

<div class="grid">
  {#each order as i (i)}
    <button
      class="pad {cells[i].base} {cells[i].mark ?? ''}"
      onpointerdown={() => down(i)}
      onpointerup={() => up(i)}
      onpointerleave={() => up(i)}
    >
      {labels?.[i] ?? ''}
    </button>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
    width: min(100%, 540px);
    user-select: none;
    touch-action: none;
  }
  .pad {
    aspect-ratio: 1;
    border: none;
    border-radius: 6px;
    padding: 0;
    font-size: clamp(9px, 1.5vw, 13px);
    font-weight: 600;
  }
  .pad:focus:not(:focus-visible) { outline: none; }
  .off { background: var(--pad-off); color: var(--muted); }
  .inKey { background: var(--pad-key); color: #26272b; }
  .root { background: var(--pad-root); color: #fff; }
  .next { box-shadow: inset 0 0 0 4px var(--pad-target); }
  .target { background: var(--pad-target); color: #07140c; box-shadow: 0 0 14px var(--pad-target); }
  .pressed { transform: scale(0.9); filter: brightness(0.7); }
  .wrong { background: var(--pad-wrong); color: #fff; transform: scale(0.92); }
</style>
