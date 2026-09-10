import { TRIAD_EXERCISES, TRIAD_START_PAGE } from "./triads";

export const SEVENTH_CHORD_START_PAGE = TRIAD_START_PAGE + TRIAD_EXERCISES.length;

export const SEVENTH_CHORD_EXERCISES = [
  {
    id: "g7",
    title: "G7",
    description: "Notate a G7 chord as stacked chord tones.",
    prompt: "Notate a G7 chord with stacked notes (G, B, D, F).",
    expectedNotes: ["g", "b", "d", "f"],
    draftKey: "seventhChordG7",
  },
  {
    id: "e-major-7",
    title: "E major 7",
    description: "Notate an E major 7 chord as stacked chord tones.",
    prompt: "Notate an E major 7 chord with stacked notes (E, G#, B, D#).",
    expectedNotes: ["e", "g#", "b", "d#"],
    draftKey: "seventhChordEMajor7",
  },
] as const;

export type SeventhChordExercise = (typeof SEVENTH_CHORD_EXERCISES)[number];
export type SeventhChordDraftKey = SeventhChordExercise["draftKey"];
