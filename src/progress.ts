// Best play-along results per song section, kept in this browser's localStorage.

export type Best = { score: number; stars: number; accuracy: number; tempo: number };
type Store = Record<string, Record<string, Best>>;

const KEY = 'push-coach-progress';

function load(): Store {
  const store: Store = {};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    for (const [song, sections] of Object.entries(saved ?? {})) {
      for (const [section, b] of Object.entries(sections as Record<string, Partial<Best>>)) {
        if ([b?.score, b?.stars, b?.accuracy, b?.tempo].every((v) => typeof v === 'number')) (store[song] ??= {})[section] = b as Best;
      }
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return store;
}

export function bestOf(song: string, section: string): Best | undefined {
  return load()[song]?.[section];
}

/** Most stars earned on any section of a song. */
export function songStars(song: string): number {
  return Math.max(0, ...Object.values(load()[song] ?? {}).map((b) => b.stars));
}

/** Save a result if it beats the best score; returns whether it did. */
export function record(song: string, section: string, result: Best): boolean {
  const store = load();
  const previous = store[song]?.[section];
  if (previous && previous.score >= result.score) return false;
  (store[song] ??= {})[section] = result;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Storage unavailable: the best lasts for this visit's results screen only.
  }
  return true;
}

export const starText = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
