import { TRIAD_EXERCISES, TRIAD_START_PAGE } from "./triads";
import {
  SEVENTH_CHORD_EXERCISES,
  SEVENTH_CHORD_START_PAGE,
} from "./sevenths";

const NON_CHORD_PAGE_COUNT = TRIAD_START_PAGE;
export const EXAM_TOTAL_PAGES =
  NON_CHORD_PAGE_COUNT + TRIAD_EXERCISES.length + SEVENTH_CHORD_EXERCISES.length;
export const EXAM_DURATION_SECONDS = 60 * 60;
export const EXAM_DRAFT_STORAGE_KEY = "lydianlab.exam.draft.v1";

const triadPageMeta = Object.fromEntries(
  TRIAD_EXERCISES.map((exercise, index) => [
    TRIAD_START_PAGE + index,
    {
      title: "Triads Notation",
      description: exercise.description,
    },
  ]),
);

const seventhChordPageMeta = Object.fromEntries(
  SEVENTH_CHORD_EXERCISES.map((exercise, index) => [
    SEVENTH_CHORD_START_PAGE + index,
    {
      title: "Seventh Chords Notation",
      description: exercise.description,
    },
  ]),
);

export const EXAM_PAGE_META = {
  1: {
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for D major.",
  },
  2: {
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for C minor.",
  },
  3: {
    title: "Scale Notation",
    description: "Enter the D major scale notes in order.",
  },
  4: {
    title: "Scale Notation",
    description: "Enter the B natural minor scale notes in order.",
  },
  ...triadPageMeta,
  ...seventhChordPageMeta,
  [EXAM_TOTAL_PAGES]: {
    title: "Identify Key Signatures",
    description: "Name each key signature shown on the staff.",
  },
} as const;
