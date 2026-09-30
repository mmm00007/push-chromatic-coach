# Push Chromatic Coach

Song-first lessons for playing the **Ableton Push 3 in chromatic mode** (4ths layout).
Every lesson is a tune you know. Watch the pads light up on your Push, then play them
back one note at a time. Each song teaches one idea about the grid (a scale shape,
octaves, major versus minor, chromatic notes) in plain words, after you've played it.

It is a web app. Chrome and Edge talk to the Push directly over Web MIDI and play a
sampled piano. Safari has no Web MIDI.

## Use it

1. Open the GitHub Pages site of this repo in **Chrome** or **Edge** (a Mac works as is).
   To get a Dock icon, use Chrome's *Install* button in the address bar.
2. Set up the Push 3: connect USB-C and power. On a standalone Push 3 choose
   *Setup → Status → Control Live*. Keep Live **closed**, then press **User**.
3. Click **Start** and allow MIDI devices when Chrome asks.
4. First time: open **Check Push**. Press the corner pads and try the colour tests.

In a lesson, the app lights the Push the way chromatic mode does: the root in blue,
notes in the key in white, and other notes unlit. It adds a green pad for the note to
play now. With no Push connected, you can click the pads on screen.

## Lessons

- **Watch**: hear the phrase and see the pads light in order (tempo 40–100 %).
- **Play**: the green pad waits for you. Wrong notes sound but flash red. Chords need
  every note held.
- When you finish a section, the concept card explains the idea behind it.

Bundled songs are public-domain or traditional, because this repo is public.

### Adding a song

Songs live in `src/songs.ts`. Notes are written as text: a note or a chord
(`C4+E4+G4`), then its length in beats. `r` is a rest.

```ts
{ name: 'Line 1', notes: 'E4 1, E4 1, F4 1, G4 1, r .5, C4+E4+G4 2' }
```

`npm test` checks that every song parses, fits the 8×8 grid and fills whole bars.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/push-chromatic-coach/
npm test         # unit tests: grid mapping, songs, lesson engine through a fake Push
npm run check    # type check
npm run e2e      # build + headless Firefox run through a lesson (needs Firefox)
```

Web MIDI needs `https` or `localhost`. Pushes to `main` deploy to GitHub Pages once
tests, the type check and the build pass (`.github/workflows/pages.yml`).

## Roadmap

- **V1**: play-along with metronome, tempo steps and stars; from-memory mode; drills
  for each concept; a Concepts page; daily practice sessions with a practice log;
  MIDI-file import for your own songs.
- **V2**: rock riffs and power chords, chord loops, two-handed songs.

## Credits

Piano: [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3)
by Alexander Holm, CC-BY 3.0 (MP3 subset as distributed with Tone.js).
Push MIDI details: Ableton's [push-interface](https://github.com/Ableton/push-interface) documentation.
