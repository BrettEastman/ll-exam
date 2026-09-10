import type { GradeResult } from "../model/types";

export const G7_CHORD = ["g", "b", "d", "f"] as const;
export const E_MAJOR_7_CHORD = ["e", "g#", "b", "d#"] as const;

export function gradeSeventhChordAttempt(
  input: string[],
  expectedChord: readonly string[],
): GradeResult {
  const result: GradeResult = {
    correct: [],
    incorrect: [],
    missing: [],
    score: 0,
  };

  const expected = [...expectedChord].sort();
  const actual = [...input].sort();
  const exactMatch =
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);

  if (exactMatch) {
    result.correct = [...expectedChord];
    result.score = 100;
    return result;
  }

  const expectedSet = new Set<string>(expectedChord);
  result.incorrect = input.filter((value) => !expectedSet.has(value));
  result.missing = expectedChord.filter((value) => !input.includes(value));
  return result;
}
