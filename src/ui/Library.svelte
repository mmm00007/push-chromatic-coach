<script lang="ts">
  import type { Song } from '../song';

  let { groups, onopen }: { groups: { title: string; songs: Song[] }[]; onopen: (id: string) => void } = $props();
</script>

{#each groups as group (group.title)}
  <h2>{group.title}</h2>
  <div class="cards">
    {#each group.songs as song (song.id)}
      <button class="card" onclick={() => onopen(song.id)}>
        <strong>{song.title}</strong>
        <span class="muted">{song.subtitle}</span>
        {#if song.concept}<span class="learn">Learn: {song.concept.title}</span>{/if}
      </button>
    {/each}
  </div>
{/each}

<style>
  h2 { margin-top: 1.5rem; font-size: 1.05rem; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
  .card { display: flex; flex-direction: column; gap: 4px; text-align: left; padding: 1rem; border-radius: 12px; }
  .learn { color: var(--accent); font-size: 0.9em; margin-top: 4px; }
</style>
