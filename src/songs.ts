// Bundled songs: public-domain or traditional melodies only (the repo is public).
// Your own favourites come in through MIDI import.

import { buildSong, type SongDef } from './song';

/** Broken chord, guitar style: root, 3rd, 5th, octave, 5th, 3rd (one beat each). */
const arpeggio = (chord: string) => {
  const [root, third, fifth, octave] = chord.split(' ');
  return [root, third, fifth, octave, fifth, third].map((n) => `${n} 1`).join(', ');
};
const AM = 'A3 C4 E4 A4';
const C = 'C4 E4 G4 C5';
const D = 'D4 F#4 A4 D5';
const F = 'F3 A3 C4 F4';
const E = 'E3 G#3 B3 E4';

const defs: SongDef[] = [
  {
    id: 'carol-of-the-bells',
    title: 'Carol of the Bells',
    subtitle: 'Leontovych — the ringing figure from Home Alone',
    level: 1,
    key: 'G minor',
    bpm: 140,
    beatsPerBar: 3,
    sections: [
      { name: 'The bells', notes: 'Bb4 1, A4 .5, Bb4 .5, G4 1, Bb4 1, A4 .5, Bb4 .5, G4 1, Bb4 1, A4 .5, Bb4 .5, G4 1, Bb4 1, A4 .5, Bb4 .5, G4 1' },
    ],
    concept: {
      title: 'A pattern that repeats',
      text: 'Four notes, three neighbouring pads on one row, played over and over. Film music calls this an ostinato. The G you land on is the lit root pad: songs love to come home to it.',
    },
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    subtitle: "Beethoven's 9th — heard in Die Hard and countless films",
    level: 1,
    key: 'C major',
    bpm: 100,
    beatsPerBar: 4,
    sections: [
      { name: 'Line 1', notes: 'E4 1, E4 1, F4 1, G4 1, G4 1, F4 1, E4 1, D4 1, C4 1, C4 1, D4 1, E4 1, E4 1.5, D4 .5, D4 2' },
      { name: 'Line 2', notes: 'E4 1, E4 1, F4 1, G4 1, G4 1, F4 1, E4 1, D4 1, C4 1, C4 1, D4 1, E4 1, D4 1.5, C4 .5, C4 2' },
      { name: 'Middle', notes: 'D4 1, D4 1, E4 1, C4 1, D4 1, E4 .5, F4 .5, E4 1, C4 1, D4 1, E4 .5, F4 .5, E4 1, D4 1, C4 1, D4 1, G3 2' },
    ],
    form: [0, 1, 2, 1],
    concept: {
      title: 'The first five notes of the major scale',
      text: 'C D E F G: the tune only walks between neighbouring lit pads. Skipped (unlit) pads are the notes outside the key. This five-note walk is the start of the major scale, the "happy" scale behind most pop choruses.',
    },
  },
  {
    id: 'dies-irae',
    title: 'Dies Irae',
    subtitle: 'Medieval chant — the "doom" motif in The Shining and many horror scores',
    level: 1,
    key: 'D minor',
    bpm: 60,
    beatsPerBar: 4,
    sections: [
      { name: 'The chant', notes: 'F4 1, E4 1, F4 1, D4 1, E4 1, C4 1, D4 1, D4 1' },
      { name: 'Low and slow (the film version)', notes: 'F3 2, E3 2, F3 2, D3 6' },
    ],
    concept: {
      title: 'Octaves',
      text: 'The film version is the same tune one octave lower: two rows down and two pads to the right. Every octave on the grid has that same shape, so any tune can be moved up or down this way.',
    },
  },
  {
    id: 'korobeiniki',
    title: 'Korobeiniki',
    subtitle: 'Russian folk song — the Tetris theme',
    level: 2,
    key: 'A minor',
    bpm: 140,
    beatsPerBar: 4,
    sections: [
      { name: 'First half', notes: 'E5 1, B4 .5, C5 .5, D5 1, C5 .5, B4 .5, A4 1, A4 .5, C5 .5, E5 1, D5 .5, C5 .5, B4 1.5, C5 .5, D5 1, E5 1, C5 1, A4 1, A4 2' },
      { name: 'Second half', notes: 'r .5, D5 1, F5 .5, A5 1, G5 .5, F5 .5, E5 1.5, C5 .5, E5 1, D5 .5, C5 .5, B4 1, B4 .5, C5 .5, D5 1, E5 1, C5 1, A4 1, A4 2' },
    ],
    concept: {
      title: 'The minor key',
      text: 'Every lit pad here belongs to A minor: the same notes as C major, but starting from A. Ending on the root A (the coloured pad) is what makes the tune sound finished.',
    },
  },
  {
    id: 'mountain-king',
    title: 'In the Hall of the Mountain King',
    subtitle: 'Grieg — sneaking-villain music in films, ads and games',
    level: 2,
    key: 'B minor',
    bpm: 120,
    beatsPerBar: 4,
    sections: [
      { name: 'Sneaking', notes: 'B3 .5, C#4 .5, D4 .5, E4 .5, F#4 .5, D4 .5, F#4 1, E#4 .5, C#4 .5, E#4 1, E4 .5, C4 .5, E4 1' },
      { name: 'Climbing higher', notes: 'B3 .5, C#4 .5, D4 .5, E4 .5, F#4 .5, D4 .5, F#4 .5, B4 .5, A4 .5, F#4 .5, D4 .5, F#4 .5, A4 2' },
    ],
    concept: {
      title: 'Chromatic notes',
      text: 'In bar 2 the tune slides onto unlit pads, one semitone at a time. Notes outside the key sound tense and sneaky. Chromatic mode keeps them within reach, right next to the lit ones.',
    },
  },
  {
    id: 'zarathustra',
    title: 'Also sprach Zarathustra',
    subtitle: 'Richard Strauss — the 2001: A Space Odyssey fanfare',
    level: 2,
    key: 'C major',
    bpm: 60,
    beatsPerBar: 4,
    sections: [
      { name: 'Sunrise (major to minor)', notes: 'C4 2, G4 2, C5 3, E5 1, Eb5 4' },
      { name: 'Answer (minor to major)', notes: 'C4 2, G4 2, C5 3, Eb5 1, E5 4' },
    ],
    concept: {
      title: 'Major and minor thirds',
      text: 'The last two notes are neighbouring pads: E (lit) is the bright major third, Eb (the unlit pad on its left) is the dark minor third. One pad to the left is the whole difference between happy and sad.',
    },
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    subtitle: 'English Renaissance tune, often heard in films and games',
    level: 2,
    key: 'A minor',
    bpm: 110,
    beatsPerBar: 3,
    pickup: 1,
    sections: [
      { name: 'Phrase 1', notes: 'A4 1, C5 2, D5 1, E5 1.5, F5 .5, E5 1, D5 2, B4 1, G4 1.5, A4 .5, B4 1, C5 2, A4 1, A4 1.5, G#4 .5, A4 1, B4 2, G#4 1, E4 2' },
      { name: 'Phrase 2', notes: 'A4 1, C5 2, D5 1, E5 1.5, F5 .5, E5 1, D5 2, B4 1, G4 1.5, A4 .5, B4 1, C5 1.5, B4 .5, A4 1, G#4 1.5, F#4 .5, G#4 1, A4 2' },
    ],
    concept: {
      title: 'The leading note',
      text: 'G# is an unlit pad just left of the root A. Raising G to G# makes the melody lean back toward home: the classic minor-key cadence of film and folk music.',
    },
  },
  {
    id: 'jingle-bells',
    title: 'Jingle Bells',
    subtitle: 'Pierpont (1857) — the sleigh-ride tune of every holiday film',
    level: 1,
    key: 'C major',
    bpm: 120,
    beatsPerBar: 4,
    sections: [
      { name: 'Jingle bells', notes: 'E4 1, E4 1, E4 2, E4 1, E4 1, E4 2, E4 1, G4 1, C4 1.5, D4 .5, E4 4' },
      { name: 'Oh what fun', notes: 'F4 1, F4 1, F4 1.5, F4 .5, F4 1, E4 1, E4 1, E4 .5, E4 .5, E4 1, D4 1, D4 1, E4 1, D4 2, G4 2' },
      { name: 'Ending', notes: 'F4 1, F4 1, F4 1.5, F4 .5, F4 1, E4 1, E4 1, E4 .5, E4 .5, G4 1, G4 1, F4 1, D4 1, C4 4' },
    ],
    form: [0, 1, 0, 2],
    concept: {
      title: 'Rhythm on one pad',
      text: 'The whole tune sits on one row, and most of it repeats a single pad (E). That makes it perfect for rhythm: switch on the metronome and keep the repeated notes steady, long and short.',
    },
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    subtitle: "Traditional hymn — the bagpipe farewell in Star Trek II and many films",
    level: 2,
    key: 'G major',
    bpm: 80,
    beatsPerBar: 3,
    pickup: 1,
    sections: [
      { name: 'Amazing grace', notes: 'D4 1, G4 2, B4 .5, G4 .5, B4 2, A4 1, G4 2, E4 1, D4 2, D4 1, G4 2, B4 .5, G4 .5, B4 2, A4 1, D5 5' },
      { name: 'I once was lost', notes: 'B4 1, D5 2, B4 .5, G4 .5, B4 2, A4 1, G4 2, E4 1, D4 2, D4 1, G4 2, B4 .5, G4 .5, B4 2, A4 1, G4 5' },
    ],
    concept: {
      title: 'Melodies built on a chord',
      text: 'The tune keeps leaping between G, B and D, the three notes of the G major chord, then steps down through the notes in between. Many melodies are chord notes joined by steps.',
    },
  },
  {
    id: 'fur-elise',
    title: 'Für Elise',
    subtitle: 'Beethoven — the music-box tune everyone knows',
    level: 2,
    key: 'A minor',
    bpm: 120,
    beatsPerBar: 3,
    pickup: 1,
    sections: [
      {
        name: 'The famous opening',
        notes:
          'E5 .5, D#5 .5, E5 .5, D#5 .5, E5 .5, B4 .5, D5 .5, C5 .5, A4 1, r .5, C4 .5, E4 .5, A4 .5, B4 1, r .5, E4 .5, G#4 .5, B4 .5, C5 1, r .5, E4 .5, E5 .5, D#5 .5, E5 .5, D#5 .5, E5 .5, B4 .5, D5 .5, C5 .5, A4 1, r .5, C4 .5, E4 .5, A4 .5, B4 1, r .5, E4 .5, C5 .5, B4 .5, A4 2',
      },
    ],
    concept: {
      title: 'Chromatic neighbours',
      text: 'The tune rocks between E and the unlit pad right next to it, D#. A note outside the key, one pad away, adds tension that resolves back to the lit pad. Chromatic mode keeps these neighbours under your finger.',
    },
  },
  {
    id: 'minuet-in-g',
    title: 'Minuet in G',
    subtitle: 'Petzold (long credited to Bach) — the melody of the 1965 pop hit "A Lover\'s Concerto"',
    level: 2,
    key: 'G major',
    bpm: 110,
    beatsPerBar: 3,
    sections: [
      {
        name: 'Part 1',
        notes:
          'D5 1, G4 .5, A4 .5, B4 .5, C5 .5, D5 1, G4 1, G4 1, E5 1, C5 .5, D5 .5, E5 .5, F#5 .5, G5 1, G4 1, G4 1, C5 1, D5 .5, C5 .5, B4 .5, A4 .5, B4 1, C5 .5, B4 .5, A4 .5, G4 .5, F#4 1, G4 .5, A4 .5, B4 .5, G4 .5, A4 3',
      },
    ],
    concept: {
      title: 'Scale runs',
      text: 'Most of the tune runs step by step along the lit pads of G major. It is the same shape as the C major scale, just started from a different root: learn a scale shape once, and runs like these fall under your fingers.',
    },
  },
  {
    id: 'the-entertainer',
    title: 'The Entertainer',
    subtitle: 'Scott Joplin (1902) — the ragtime theme of the film The Sting',
    level: 2,
    key: 'C major',
    bpm: 72,
    beatsPerBar: 2,
    pickup: 0.5,
    sections: [
      {
        name: 'The famous opening',
        notes: 'D4 .25, D#4 .25, E4 .25, C5 .5, E4 .25, C5 .5, E4 .25, C5 1.5, C5 .25, D5 .25, D#5 .25, E5 .25, C5 .25, D5 .25, E5 .5, B4 .25, D5 .5, C5 1.5',
      },
    ],
    concept: {
      title: 'Sneaking in from below',
      text: 'The tune slides into E from the unlit pad just to its left, and does it again an octave higher. Approaching a lit pad from its neighbour is a trick ragtime, jazz and funk use all the time.',
    },
  },
  {
    id: 'toccata',
    title: 'Toccata in D minor',
    subtitle: 'Bach — the spooky organ opening of horror films and haunted-castle games',
    level: 2,
    key: 'D minor',
    bpm: 60,
    beatsPerBar: 4,
    sections: [
      { name: 'The call', notes: 'A4 .25, G4 .25, A4 3.5, G4 .25, F4 .25, E4 .25, D4 .25, C#4 1, D4 2' },
      { name: 'An octave lower', notes: 'A3 .25, G3 .25, A3 3.5, G3 .25, F3 .25, E3 .25, D3 .25, C#3 1, D3 2' },
    ],
    concept: {
      title: 'Same shape, lower octave',
      text: 'The second call is the first one an octave down: the same finger shape, two rows lower and two pads right. The unlit C# just below the root D gives it that dramatic pull home.',
    },
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    subtitle: 'Pachelbel — the wedding classic whose chords run through many pop songs',
    level: 3,
    key: 'D major',
    bpm: 60,
    beatsPerBar: 4,
    sections: [
      { name: 'Bass line', notes: 'D3 2, A2 2, B2 2, F#2 2, G2 2, D2 2, G2 2, A2 2' },
      { name: 'Chords', notes: 'D4+F#4+A4 2, A3+C#4+E4 2, B3+D4+F#4 2, F#3+A3+C#4 2, G3+B3+D4 2, D4+F#4+A4 2, G3+B3+D4 2, A3+C#4+E4 2' },
      { name: 'Chords, smooth', notes: 'D4+F#4+A4 2, C#4+E4+A4 2, B3+D4+F#4 2, C#4+F#4+A4 2, B3+D4+G4 2, A3+D4+F#4 2, B3+D4+G4 2, C#4+E4+A4 2' },
    ],
    form: [],
    concept: {
      title: 'A chord progression',
      text: 'Eight chords, D A Bm F#m G D G A, over a bass that walks down and back up. Watch the chord names as you play. The smooth version keeps the same chords but picks the nearest pads, so your hand barely moves.',
    },
  },
  {
    id: 'rising-sun',
    title: 'House of the Rising Sun',
    subtitle: 'Traditional folk song — the rolling chords rock bands made famous',
    level: 3,
    key: 'A minor',
    bpm: 180,
    beatsPerBar: 6,
    sections: [
      { name: 'Chords', notes: 'A3+C4+E4 6, C4+E4+G4 6, D4+F#4+A4 6, F3+A3+C4 6, A3+C4+E4 6, C4+E4+G4 6, E3+G#3+B3 6, E3+G#3+B3 6' },
      { name: 'Arpeggios', notes: [AM, C, D, F, AM, C, E, E].map(arpeggio).join(', ') },
    ],
    form: [],
    concept: {
      title: 'Arpeggios',
      text: 'Play a chord one note at a time and you get an arpeggio, the rolling guitar pattern. Same shapes as the block chords, spread out in time. The D and E chords borrow unlit pads (F# and G#): that is where the song gets its colour.',
    },
  },
];

export const SONGS = defs.map(buildSong).sort((a, b) => a.level - b.level);
