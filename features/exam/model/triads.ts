export const TRIAD_START_PAGE = 5;

export const TRIAD_EXERCISES = [
  {
    id: "d-major",
    title: "D Major Triad",
    description: "Notate a D major triad as stacked chord tones.",
    prompt: "Notate a D major triad with stacked notes (D, F#, A).",
    expectedNotes: ["d", "f#", "a"],
    draftKey: "triad",
  },
  {
    id: "b-minor",
    title: "B Minor Triad",
    description: "Notate a B minor triad as stacked chord tones.",
    prompt: "Notate a B minor triad with stacked notes (B, D, F#).",
    expectedNotes: ["b", "d", "f#"],
    draftKey: "triadBMinor",
  },
] as const;

export type TriadExercise = (typeof TRIAD_EXERCISES)[number];
export type TriadExerciseId = TriadExercise["id"];
export type TriadDraftKey = TriadExercise["draftKey"];

export function getTriadExerciseById(id: TriadExerciseId): TriadExercise {
  const exercise = TRIAD_EXERCISES.find((item) => item.id === id);
  if (!exercise) {
    throw new Error(`Unknown triad exercise id: ${id}`);
  }
  return exercise;
}
