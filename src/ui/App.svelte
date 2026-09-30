<script lang="ts">
  import { startAudio } from '../audio';
  import { BASICS, CATEGORIES } from '../basics';
  import { Push } from '../push';
  import { loadSettings, saveSettings } from '../settings';
  import { SONGS } from '../songs';
  import Check from './Check.svelte';
  import FreePlay from './FreePlay.svelte';
  import Lesson from './Lesson.svelte';
  import Library from './Library.svelte';

  type View = 'basics' | 'songs' | 'free' | 'lesson' | 'check';
  const LEVELS: Record<number, string> = {
    1: 'Level 1 · Short tunes on a few pads',
    2: 'Level 2 · Two rows, and the unlit pads',
    3: 'Level 3 · Chords and bass lines',
  };
  const basicGroups = CATEGORIES.map((title) => ({ title, songs: BASICS.filter((b) => b.category === title) }));
  const songGroups = [...new Set(SONGS.map((s) => s.level))].map((level) => ({
    title: LEVELS[level] ?? `Level ${level}`,
    songs: SONGS.filter((s) => s.level === level),
  }));

  let view = $state<View>('basics');
  /** The list a lesson was opened from, for its Back button. */
  let from = $state<View>('basics');
  let songId = $state('');
  let started = $state(false);
  let audio = $state<'loading' | 'ready' | 'failed'>('loading');
  let push = $state<Push | null>(null);
  let midiError = $state('');
  const settings = $state(loadSettings());
  const song = $derived([...BASICS, ...SONGS].find((s) => s.id === songId));

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

  function open(id: string) {
    from = view;
    songId = id;
    go('lesson');
  }
</script>

<header>
  <button class="brand" onclick={() => go('basics')}>Push Chromatic Coach</button>
  {#if started}
    <nav>
      <button class:selected={view === 'basics' || (view === 'lesson' && from === 'basics')} onclick={() => go('basics')}>Basics</button>
      <button class:selected={view === 'songs' || (view === 'lesson' && from === 'songs')} onclick={() => go('songs')}>Songs</button>
      <button class:selected={view === 'free'} onclick={() => go('free')}>Free play</button>
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
      <p>Start with the basics (notes, scales, chords and the chord loops behind pop songs), then play tunes you know. Watch the pads light up, then play them back at your own pace. Every note and chord you play is named as you go.</p>
      <p class="muted">Use Chrome or Edge. Push 3: Control mode, Live closed, then press <strong>User</strong>. No Push? You can click the pads on screen.</p>
      <button class="primary" onclick={start}>Start</button>
    </div>
  {:else if view === 'check'}
    <Check {push} {settings} {midiError} />
  {:else if view === 'free'}
    <FreePlay {push} {settings} />
  {:else if view === 'lesson' && song}
    {#key song.id}
      <Lesson {song} {push} {settings} onback={() => go(from)} />
    {/key}
  {:else}
    {#if midiError}<div class="panel error">{midiError}</div>{/if}
    {#if view === 'songs'}
      <p class="muted intro">Tunes you know, in order of difficulty. Each one teaches one idea about the grid.</p>
      <Library groups={songGroups} onopen={open} />
    {:else}
      <p class="muted intro">Short exercises: find your way around the grid, then scales, intervals, chords and the chord loops behind popular songs. The panel names everything you play.</p>
      <Library groups={basicGroups} onopen={open} />
    {/if}
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
  .intro { margin: 0.25rem 0 0; }
</style>
