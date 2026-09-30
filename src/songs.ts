// Bundled songs: public-domain or traditional melodies only (the repo is public).
// Your own favourites come in through MIDI import.

import { buildSong, type SongDef } from './song';

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
    sections: [
      { name: 'Phrase 1', notes: 'A4 1, C5 2, D5 1, E5 1.5, F5 .5, E5 1, D5 2, B4 1, G4 1.5, A4 .5, B4 1, C5 2, A4 1, A4 1.5, G#4 .5, A4 1, B4 2, G#4 1, E4 2' },
      { name: 'Phrase 2', notes: 'A4 1, C5 2, D5 1, E5 1.5, F5 .5, E5 1, D5 2, B4 1, G4 1.5, A4 .5, B4 1, C5 1.5, B4 .5, A4 1, G#4 1.5, F#4 .5, G#4 1, A4 2' },
    ],
    concept: {
      title: 'The leading note',
      text: 'G# is an unlit pad just left of the root A. Raising G to G# makes the melody lean back toward home: the classic minor-key cadence of film and folk music.',
    },
  },
];

export const SONGS = defs.map(buildSong);
