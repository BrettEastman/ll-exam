export const TRIAD_START_PAGE = 5;

export const TRIAD_EXERCISES = [
  {
    id: "a-major",
    title: "A Major Triad",
    description: "Notate an A major triad as stacked chord tones.",
    prompt: "Notate an A major triad with stacked notes (A, C#, E).",
    expectedNotes: ["a", "c#", "e"],
    draftKey: "triad",
  },
  {
    id: "f-sharp-minor",
    title: "F# Minor Triad",
    description: "Notate an F# minor triad as stacked chord tones.",
    prompt: "Notate an F# minor triad with stacked notes (F#, A, C#).",
    expectedNotes: ["f#", "a", "c#"],
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
