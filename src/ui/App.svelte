<script lang="ts">
  import { startAudio } from '../audio';
  import { Push } from '../push';
  import { loadSettings, saveSettings } from '../settings';
  import { SONGS } from '../songs';
  import Check from './Check.svelte';
  import Lesson from './Lesson.svelte';
  import Library from './Library.svelte';

  type View = 'library' | 'lesson' | 'check';
  let view = $state<View>('library');
  let songId = $state('');
  let started = $state(false);
  let audio = $state<'loading' | 'ready' | 'failed'>('loading');
  let push = $state<Push | null>(null);
  let midiError = $state('');
  const settings = $state(loadSettings());
  const song = $derived(SONGS.find((s) => s.id === songId));

  $effect(() => saveSettings($state.snapshot(settings)));

  // Turn the pads off when the page closes.
  $effect(() => {
    const off = () => push?.clear();
    window.addEventListener('pagehide', off);
    return () => window.removeEventListener('pagehide', off);
  });

  async function start() {
    started = true;
    startAudio().then(
      () => (audio = 'ready'),
      (e) => {
        audio = 'failed';
        console.error(e);
      },
    );
    if (!('requestMIDIAccess' in navigator)) {
      midiError = 'This browser has no Web MIDI, so it cannot talk to the Push. Use Chrome or Edge.';
      return;
    }
    try {
      push = new Push(await navigator.requestMIDIAccess(), settings.palette);
    } catch (e) {
      midiError = `MIDI access was refused (${(e as Error).message}). Allow MIDI devices for this site from Chrome's address bar, then reload.`;
    }
  }

  function go(next: View) {
    push?.clear();
    view = next;
  }
</script>

<header>
  <button class="brand" onclick={() => go('library')}>Push Chromatic Coach</button>
  {#if started}
    <nav>
      <button class:selected={view !== 'check'} onclick={() => go('library')}>Songs</button>
      <button class:selected={view === 'check'} onclick={() => go('check')}>Check Push</button>
    </nav>
    <span class="status muted">
      {push?.found ? '● Push connected' : '○ No Push'} · {audio === 'ready' ? 'piano ready' : audio === 'loading' ? 'loading piano…' : 'piano failed to load'}
    </span>
  {/if}
</header>

<main>
  {#if !started}
    <div class="welcome panel">
      <h1>Learn the Push 3 chromatic grid through songs</h1>
      <p>Every lesson is a tune you know. Watch the pads light up, then play them back, one note at a time, at your own pace. Each song teaches one idea about the grid.</p>
      <p class="muted">Use Chrome or Edge. Push 3: Control mode, Live closed, then press <strong>User</strong>. No Push? You can click the pads on screen.</p>
      <button class="primary" onclick={start}>Start</button>
    </div>
  {:else if view === 'check'}
    <Check {push} {settings} {midiError} />
  {:else if view === 'lesson' && song}
    {#key song.id}
      <Lesson {song} {push} {settings} onback={() => go('library')} />
    {/key}
  {:else}
    {#if midiError}<div class="panel error">{midiError}</div>{/if}
    <Library songs={SONGS} onopen={(id) => { songId = id; go('lesson'); }} />
  {/if}
</main>

<style>
  header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; padding: 0.75rem 1rem; border-bottom: 1px solid var(--line); }
  .brand { background: none; border: none; font-weight: 700; font-size: 1.05rem; padding: 0; }
  nav { display: flex; gap: 8px; }
  .status { margin-left: auto; font-size: 0.9em; }
  main { max-width: 1100px; margin: 0 auto; padding: 1rem; }
  .welcome { max-width: 620px; margin: 3rem auto; padding: 2rem; }
  .welcome h1 { font-size: 1.6rem; }
  .error { border-color: var(--pad-wrong); margin-bottom: 1rem; }
</style>
