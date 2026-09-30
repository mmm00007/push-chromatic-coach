// Per-browser settings (palette indices, note names) in localStorage.

import { DEFAULT_PALETTE, type Palette } from './push';

export type Settings = { palette: Palette; showNames: boolean };

const KEY = 'push-coach-settings';

export function loadSettings(): Settings {
  const settings: Settings = { palette: { ...DEFAULT_PALETTE }, showNames: true };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    for (const role of Object.keys(DEFAULT_PALETTE) as (keyof Palette)[]) {
      const v = saved.palette?.[role];
      if (Number.isInteger(v) && v >= 0 && v <= 127) settings.palette[role] = v;
    }
    if (typeof saved.showNames === 'boolean') settings.showNames = saved.showNames;
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
