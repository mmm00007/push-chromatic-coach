// Basic lessons: the grid, scales, intervals, chords and chord loops, played in
// Watch and Play like songs. Each one explains its idea up front; the
// "what you're playing" panel names every note and chord as you go.

import { buildSong, type SongDef } from './song';

/** Notes one after another, `beats` each: seq('C4 D4') → 'C4 1, D4 1'. */
const seq = (notes: string, beats = 1) => notes.split(' ').map((n) => `${n} ${beats}`).join(', ');
/** Up a scale and back down: updown('C4 D4 E4') → C4 D4 E4 D4 C4. */
const updown = (notes: string, beats = 1) => {
  const up = notes.split(' ');
  return seq([...up, ...up.slice(0, -1).reverse()].join(' '), beats);
};
/** One bar of the boogie shuffle: root + 5th, root + 6th, twice. */
const boogie = (root: string, fifth: string, sixth: string) => seq(`${root}+${fifth} ${root}+${sixth} ${root}+${fifth} ${root}+${sixth}`);

type Basic = Omit<SongDef, 'level' | 'beatsPerBar'> & { beatsPerBar?: number };

const FIND = 'Find your way';
const SCALES = 'Scales';
const INTERVALS = 'Intervals';
const CHORDS = 'Chords';
const LOOPS = 'Chord loops';

const basics: Basic[] = [
  {
    id: 'roots-octaves',
    category: FIND,
    title: 'Root pads and octaves',
    subtitle: 'Where "home" is on the grid',
    key: 'C major',
    bpm: 80,
    sections: [
      { name: 'C in every octave', notes: seq('C3 C4 C5 C6', 2) },
      { name: 'Up and down', notes: `${seq('C3 C4 C5 C6 C5 C4 C3')}, r 1` },
    ],
    concept: {
      title: 'The grid repeats every octave',
      text: 'The blue pads are all C, the root of the key. Going up an octave is always the same move: two rows up and two pads right. Find a blue pad and you have found home.',
    },
  },
  {
    id: 'key-notes',
    category: FIND,
    title: 'The lit pads: notes of the key',
    subtitle: 'C major, the white keys of a piano',
    key: 'C major',
    bpm: 90,
    sections: [
      { name: 'Up', notes: seq('C4 D4 E4 F4 G4 A4 B4 C5') },
      { name: 'Down', notes: seq('C5 B4 A4 G4 F4 E4 D4 C4') },
    ],
    concept: {
      title: 'Lit pads are the key',
      text: 'In chromatic mode the white pads are the 7 notes of the key (for C major, the white keys of a piano). Songs in a key mostly stay on these pads. Watch the note names in the panel as you climb.',
    },
  },
  {
    id: 'unlit-pads',
    category: FIND,
    title: 'The unlit pads: sharps and flats',
    subtitle: 'Every pad is one semitone',
    key: 'C major',
    bpm: 90,
    sections: [
      { name: 'One row, left to right', notes: seq('C4 C#4 D4 D#4 E4 F4 F#4 G4') },
      { name: 'The chromatic scale', notes: `${seq('C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4 B4 C5')}, r 3` },
    ],
    concept: {
      title: 'Semitones',
      text: 'One pad to the right is always one semitone higher, the smallest step. The unlit pads are the sharps and flats, the notes outside the key. Chromatic mode keeps them right next to the lit ones.',
    },
  },
  {
    id: 'major-scale',
    category: SCALES,
    title: 'The major scale',
    subtitle: 'Do re mi, the bright scale of most pop',
    key: 'C major',
    bpm: 90,
    sections: [
      { name: 'One octave', notes: `${updown('C4 D4 E4 F4 G4 A4 B4 C5')}, r 1` },
      { name: 'Two octaves', notes: `${updown('C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5 B5 C6', 0.5)}, r 1.5` },
    ],
    concept: {
      title: 'One shape, every key',
      text: 'The major scale is the "do re mi" you already know. With the Push root at the bottom-left, its shape is identical in every key: learn it once from the blue pad and it works everywhere.',
    },
  },
  {
    id: 'minor-scale',
    category: SCALES,
    title: 'The minor scale',
    subtitle: 'The darker scale of Korobeiniki and Greensleeves',
    key: 'A minor',
    bpm: 90,
    sections: [{ name: 'One octave', notes: `${updown('A3 B3 C4 D4 E4 F4 G4 A4')}, r 1` }],
    concept: {
      title: 'Same notes, new home',
      text: 'A minor uses the same notes as C major but treats A as home. That shift alone turns the mood from bright to dark.',
    },
  },
  {
    id: 'same-shape',
    category: SCALES,
    title: 'Same shape in another key',
    subtitle: 'G major: the C major shape, moved',
    key: 'G major',
    bpm: 90,
    sections: [{ name: 'G major scale', notes: `${updown('G3 A3 B3 C4 D4 E4 F#4 G4')}, r 1` }],
    concept: {
      title: 'Transposing is free',
      text: 'With Fixed off, the Push puts the root at the bottom-left in every key, so G major looks exactly like C major. Only the note names change (F# replaces F). One shape covers all 12 keys.',
    },
  },
  {
    id: 'major-pentatonic',
    category: SCALES,
    title: 'Major pentatonic',
    subtitle: 'Five notes, nothing sounds wrong',
    key: 'C major pentatonic',
    bpm: 90,
    sections: [{ name: 'Up and down', notes: `${updown('C4 D4 E4 G4 A4 C5')}, r 1` }],
    concept: {
      title: 'The "happy five"',
      text: 'Leave out two notes of the major scale and you get the major pentatonic, behind countless pop, country and film melodies. On the Push: Scale → Major Pentatonic lights only these pads.',
    },
  },
  {
    id: 'minor-pentatonic',
    category: SCALES,
    title: 'Minor pentatonic',
    subtitle: 'The rock and blues solo scale',
    key: 'A minor pentatonic',
    bpm: 90,
    sections: [
      { name: 'The box', notes: `${updown('A3 C4 D4 E4 G4 A4')}, r 1` },
      { name: 'A rock lick', notes: 'E4 .5, G4 .5, A4 1, G4 .5, A4 .5, C5 1, A4 .5, G4 .5, E4 .5, D4 .5, E4 2' },
    ],
    concept: {
      title: 'The guitarist\'s box',
      text: 'Five notes, no wrong ones: the minor pentatonic is the scale of rock and blues solos. The 4ths layout is tuned like a bass guitar, so this is literally the guitarist\'s "box" shape.',
    },
  },
  {
    id: 'blues-scale',
    category: SCALES,
    title: 'The blues scale',
    subtitle: 'Minor pentatonic plus one blue note',
    key: 'A blues',
    bpm: 90,
    sections: [{ name: 'Up and down', notes: `${updown('A3 C4 D4 Eb4 E4 G4 A4')}, r 3` }],
    concept: {
      title: 'The blue note',
      text: 'Add one pad between D and E, the "blue note" Eb, to the minor pentatonic and you get the blues scale. Slide through it for instant blues and rock flavour.',
    },
  },
  {
    id: 'octave-fifth-fourth',
    category: INTERVALS,
    title: 'Octaves, fifths and fourths',
    subtitle: 'The strong, open intervals',
    key: 'C major',
    bpm: 70,
    sections: [
      { name: 'Together', notes: 'C4+C5 2, C4+G4 2, C4+F4 2, C4+C5 2' },
      { name: 'One after the other', notes: 'C4 1, C5 1, C4 1, G4 1, C4 1, F4 1, C4 2' },
    ],
    concept: {
      title: 'Intervals are shapes',
      text: 'An interval is the distance between two notes. On the grid each one is a fixed shape: a fourth is straight up one row, a fifth is up one row and two pads right, an octave is up two rows and two right.',
    },
  },
  {
    id: 'thirds',
    category: INTERVALS,
    title: 'Major and minor thirds',
    subtitle: 'The interval that decides happy or sad',
    key: 'C major',
    bpm: 70,
    sections: [
      { name: 'Together', notes: 'C4+E4 2, C4+Eb4 2, A3+C#4 2, A3+C4 2' },
      { name: 'One after the other', notes: 'C4 1, E4 1, C4 1, Eb4 1, A3 1, C#4 1, A3 1, C4 1' },
    ],
    concept: {
      title: 'Four pads or three',
      text: 'A major third is 4 pads to the right, a minor third is 3. That one-pad difference is what makes a chord sound happy or sad, as in the 2001 fanfare.',
    },
  },
  {
    id: 'power-chords',
    category: CHORDS,
    title: 'Power chords',
    subtitle: 'Root + fifth, the sound of rock guitar',
    key: 'E minor',
    bpm: 90,
    sections: [
      { name: 'The shape', notes: 'E3+B3+E4 2, G3+D4+G4 2, A3+E4+A4 2, E3+B3+E4 2' },
      { name: 'A rock riff', notes: 'E3+B3 1, E3+B3 .5, G3+D4 1, A3+E4 1.5, E3+B3 1, E3+B3 .5, D3+A3 1, C3+G3 1.5' },
    ],
    concept: {
      title: 'Slide one shape around',
      text: 'Root, fifth and octave make the power chord: neither happy nor sad, just strong. Its shape is the same everywhere, so you can slide it around the grid to play whole riffs.',
    },
  },
  {
    id: 'triads',
    category: CHORDS,
    title: 'Major and minor chords',
    subtitle: 'Three notes, two moods',
    key: 'C major',
    bpm: 70,
    sections: [
      { name: 'C and F', notes: 'C4+E4+G4 2, C4+Eb4+G4 2, F4+A4+C5 2, F4+Ab4+C5 2' },
      { name: 'G and A', notes: 'G3+B3+D4 2, G3+Bb3+D4 2, A3+C#4+E4 2, A3+C4+E4 2' },
    ],
    concept: {
      title: 'Move one finger',
      text: 'A chord is three notes stacked in thirds. Major: 4 semitones then 3. Minor: 3 then 4. On the grid, the minor chord is the major shape with the middle note moved one pad left.',
    },
  },
  {
    id: 'key-chords',
    category: CHORDS,
    title: 'The chords of a key',
    subtitle: 'I ii iii IV V vi vii°: the chords most songs use',
    key: 'C major',
    bpm: 70,
    sections: [
      { name: 'Up the key', notes: 'C4+E4+G4 2, D4+F4+A4 2, E4+G4+B4 2, F4+A4+C5 2, G4+B4+D5 2, A4+C5+E5 2, B4+D5+F5 2, C5+E5+G5 2' },
    ],
    concept: {
      title: 'Stack every other lit pad',
      text: 'Build a chord on each lit pad using only lit pads and you get the 7 chords of the key: three major (I, IV, V), three minor (ii, iii, vi) and one diminished. Most songs in C major use only these.',
    },
  },
  {
    id: 'inversions',
    category: CHORDS,
    title: 'Inversions',
    subtitle: 'Same chord, smaller moves',
    key: 'C major',
    bpm: 70,
    sections: [
      { name: 'C, three ways', notes: 'C4+E4+G4 2, E4+G4+C5 2, G4+C5+E5 2, C5+E5+G5 2' },
      { name: 'Smooth changes', notes: 'C4+E4+G4 2, C4+F4+A4 2, B3+D4+G4 2, C4+E4+G4 2' },
    ],
    concept: {
      title: 'Keep your hand still',
      text: 'The same three notes in another order are still the same chord: an inversion (the panel shows it as C/E or C/G). Picking the nearest inversion lets your hand barely move between chords, which is how players make changes sound smooth.',
    },
  },
  {
    id: 'sevenths',
    category: CHORDS,
    title: 'Seventh chords',
    subtitle: 'Four notes: richer and jazzier',
    key: 'C major',
    bpm: 70,
    sections: [{ name: 'The ii–V–I', notes: 'D4+F4+A4+C5 2, G3+B3+D4+F4 2, C4+E4+G4+B4 4' }],
    concept: {
      title: 'One more third',
      text: 'Stack one more third on a chord and you get a seventh chord. Dm7, G7, Cmaj7 is the ii–V–I, the backbone of jazz and many ballads. G7 pulls hard back to C.',
    },
  },
  {
    id: 'pop-loop',
    category: LOOPS,
    title: 'The pop loop: I–V–vi–IV',
    subtitle: "Let It Be, Don't Stop Believin', With or Without You…",
    key: 'C major',
    bpm: 80,
    sections: [
      { name: 'Root position', notes: 'C4+E4+G4 4, G3+B3+D4 4, A3+C4+E4 4, F3+A3+C4 4' },
      { name: 'Smooth', notes: 'C4+E4+G4 4, B3+D4+G4 4, C4+E4+A4 4, C4+F4+A4 4' },
    ],
    concept: {
      title: 'Four chords, hundreds of hits',
      text: 'C G Am F, looped: turn on the metronome, play one chord per bar, and hum any of those songs over it. The smooth version uses inversions so only one or two fingers move.',
    },
  },
  {
    id: 'fifties-loop',
    category: LOOPS,
    title: 'The 50s loop: I–vi–IV–V',
    subtitle: 'Stand by Me, Every Breath You Take, doo-wop',
    key: 'C major',
    bpm: 80,
    sections: [{ name: 'Chords', notes: 'C4+E4+G4 4, A3+C4+E4 4, F3+A3+C4 4, G3+B3+D4 4' }],
    concept: {
      title: 'Same chords, new order',
      text: 'Swap the order of the pop loop and you jump back to the 1950s. The order of chords matters as much as the chords.',
    },
  },
  {
    id: 'sad-loop',
    category: LOOPS,
    title: 'The anthem loop: vi–IV–I–V',
    subtitle: 'Zombie, Apologize, many ballads (in other keys)',
    key: 'C major',
    bpm: 80,
    sections: [{ name: 'Chords', notes: 'A3+C4+E4 4, F3+A3+C4 4, C4+E4+G4 4, G3+B3+D4 4' }],
    concept: {
      title: 'Start on the minor chord',
      text: 'The pop loop started from Am instead of C. Beginning on the minor chord makes the same four chords feel melancholic and anthemic.',
    },
  },
  {
    id: 'andalusian',
    category: LOOPS,
    title: 'The Andalusian cadence: i–VII–VI–V',
    subtitle: 'Hit the Road Jack, flamenco, film noir',
    key: 'A minor',
    bpm: 80,
    sections: [{ name: 'Chords', notes: 'A3+C4+E4 4, G3+B3+D4 4, F3+A3+C4 4, E3+G#3+B3 4' }],
    concept: {
      title: 'Walking down',
      text: 'The bass steps down A G F E. The last chord is E major (its G# is an unlit pad), which pulls straight back to Am: drama in four chords.',
    },
  },
  {
    id: 'heroic-ending',
    category: LOOPS,
    title: 'The heroic ending: ♭VI–♭VII–I',
    subtitle: 'The victory fanfare of games and action films',
    key: 'C major',
    bpm: 80,
    sections: [{ name: 'Chords', notes: 'Ab3+C4+Eb4 4 [♭VI], Bb3+D4+F4 4 [♭VII], C4+E4+G4 8 [I]' }],
    concept: {
      title: 'Borrowed chords',
      text: 'Ab and Bb sit on unlit pads: they are borrowed from C minor. Climbing Ab → Bb → C major sounds like a hero arriving, the "level complete" cadence.',
    },
  },
  {
    id: 'twelve-bar-blues',
    category: LOOPS,
    title: '12-bar blues',
    subtitle: 'The form of blues and early rock and roll',
    key: 'A major',
    bpm: 100,
    sections: [
      { name: 'The shuffle', notes: boogie('A3', 'E4', 'F#4') },
      {
        name: 'All 12 bars',
        notes: ['A', 'A', 'A', 'A', 'D', 'D', 'A', 'A', 'E', 'D', 'A', 'E']
          .map((c) => ({ A: boogie('A3', 'E4', 'F#4'), D: boogie('D4', 'A4', 'B4'), E: boogie('E4', 'B4', 'C#5') })[c]!)
          .join(', '),
      },
    ],
    form: [],
    concept: {
      title: 'Three chords, twelve bars',
      text: 'Four bars of A, two of D, two of A, then E, D, A, E. Rocking between root + fifth and root + sixth is the classic rock-and-roll rhythm part.',
    },
  },
];

/** Category order for the Basics page. */
export const CATEGORIES = [FIND, SCALES, INTERVALS, CHORDS, LOOPS];
export const BASICS = basics.map((b) => buildSong({ level: 0, beatsPerBar: 4, ...b }));
