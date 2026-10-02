# Push Chromatic Coach

**▶ Open the app: <https://mmm00007.github.io/push-chromatic-coach/>** (Chrome or Edge). Lessons, songs, free play and scored Play along are all there.

Lessons for playing the **Ableton Push 3 in chromatic mode** (4ths layout), taught
through examples.

- **Basics**: find your way around the grid, then scales, intervals, chords and the chord loops
  behind popular songs.
- **Songs**: 15 tunes you know, from Ode to Joy to the Tetris theme, Für Elise and House of the Rising Sun.
- **Free play**: pick any key and scale and play.

Everywhere, a panel names what you are playing: the note and its place in the key, the
interval, or the chord with its roman numeral ("Am · vi chord in C major"). The panel
also shows the scale. A metronome with a count-in keeps you in time.

It is a web app. Chrome and Edge talk to the Push directly over Web MIDI and play a
sampled piano. Safari has no Web MIDI.

## Use it

1. Open **<https://mmm00007.github.io/push-chromatic-coach/>** in **Chrome** or **Edge** (a Mac works as is).
   To get a Dock icon, use Chrome's *Install* button in the address bar.
2. Set up the Push 3: connect USB-C and power. On a standalone Push 3 choose
   *Setup → Status → Control Live*. Keep Live **closed**, then press **User**.
3. Click **Start** and allow MIDI devices when Chrome asks.
4. First time: open **Check Push**. Press the corner pads and try the colour tests.

In a lesson, the app lights the Push the way chromatic mode does: the root in blue,
notes in the key in white, and other notes unlit. It adds a green pad for the note to
play now. With no Push connected, you can click the pads on screen.

## Lessons

- **Watch**: hear the phrase and see the pads light in order (tempo 40–120 %). With
  the metronome on, a one-bar count-in comes first.
- **Step by step**: the green pad waits for you, and a green ring marks the pad after it. Wrong notes sound
  but flash red. On the Push, chords need every note held together. On screen, click each
  note of the chord.
- **Play along ★**: play in time, Guitar Hero style. Notes scroll along a highway (higher notes
  sit higher) toward a hit line, and the pads light up just before each note is due. There is a
  one-bar count-in, the metronome, and an optional soft guide of the part.
  - Each note is judged **Perfect / Great / Good** (±60 / 120 / 200 ms), with an early/late hint,
    or **Miss**. Chords count once all their notes are in.
  - A **combo** raises the multiplier to ×2/×3/×4 at 10/20/30 notes in a row. Misses and
    wrong notes break the combo and drain the **rock meter**. With *No fail* off, an empty
    meter ends the run.
  - **Stars** come from accuracy (1★ at 20 % up to 5★ at 95 %). There is a full-combo badge, and
    points scale with tempo. The best score per section is kept in this browser and shown on
    the song cards. At 4★ or better you are offered a run 10 % faster.
  - The results show the whole phrase, coloured by judgment, and whether you rush or drag.
    Speaker latency is corrected automatically. Use *Check Push → Timing offset* for Bluetooth delay.
- Basic lessons explain their idea up front. Songs show theirs when you finish a section.

Bundled songs are public-domain or traditional, because this repo is public. Chord
loops are labelled with the hits that use them; progressions themselves can't be copyrighted.

### Adding a song

Songs live in `src/songs.ts` and basic lessons in `src/basics.ts`. Notes are written as text:
a note or a chord (`C4+E4+G4`), then its length in beats, then an optional `[label]`
to show while it plays. `r` is a rest.

```ts
{ name: 'Line 1', notes: 'E4 1, E4 1, F4 1, G4 1, r .5, C4+E4+G4 2 [I]' }
```

A song with an upbeat sets `pickup` (in beats), so the metronome's accent lands on bar 1.
`npm test` checks that every song and lesson parses, fits the 8×8 grid and fills whole bars.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/push-chromatic-coach/
npm test         # unit tests: grid mapping, chord naming, songs, scoring, lesson engine through a fake Push
npm run check    # type check
npm run e2e      # build + headless Firefox run: a song, a scored play-along, a chord lesson, free play
```

Web MIDI needs `https` or `localhost`. Pushes to `main` deploy to GitHub Pages once
tests, the type check and the build pass (`.github/workflows/pages.yml`).

## Roadmap

- **V1**: from-memory mode; drills for each concept; a Concepts page; daily practice
  sessions with a practice log; MIDI-file import for your own songs.
- **V2**: two-handed songs (melody over chords, bass under chords).

## Credits

Piano: [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3)
by Alexander Holm, CC-BY 3.0 (MP3 subset as distributed with Tone.js).
Push MIDI details: Ableton's [push-interface](https://github.com/Ableton/push-interface) documentation.
