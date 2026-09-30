// Per-browser settings (palette indices, note names) in localStorage.

import { DEFAULT_PALETTE, type Palette } from './push';

export type Settings = {
  palette: Palette;
  showNames: boolean;
  metronome: boolean;
  /** Play along: hear the part softly while you play it. */
  guide: boolean;
  /** Play along: an empty rock meter doesn't end the run. */
  noFail: boolean;
  /** Extra timing correction in ms for play along (e.g. Bluetooth headphones); + means you play later. */
  offsetMs: number;
};

const KEY = 'push-coach-settings';

export function loadSettings(): Settings {
  const settings: Settings = { palette: { ...DEFAULT_PALETTE }, showNames: true, metronome: false, guide: true, noFail: true, offsetMs: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    for (const role of Object.keys(DEFAULT_PALETTE) as (keyof Palette)[]) {
      const v = saved.palette?.[role];
      if (Number.isInteger(v) && v >= 0 && v <= 127) settings.palette[role] = v;
    }
    for (const flag of ['showNames', 'metronome', 'guide', 'noFail'] as const) {
      if (typeof saved[flag] === 'boolean') settings[flag] = saved[flag];
    }
    if (Number.isFinite(saved.offsetMs)) settings.offsetMs = saved.offsetMs;
  } catch {
    // Storage unavailable or corrupt: defaults.
  }
  return settings;
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable: settings last for this visit only.
  }
}
