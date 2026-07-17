import type { GradeResult } from "../model/types";

export const A_MAJOR_TRIAD = ["a", "c#", "e"] as const;
export const F_SHARP_MINOR_TRIAD = ["f#", "a", "c#"] as const;

export function gradeTriadAttempt(
  input: string[],
  expectedTriad: readonly string[],
): GradeResult {
  const result: GradeResult = {
    correct: [],
    incorrect: [],
    missing: [],
    score: 0,
  };

  const expected = [...expectedTriad].sort();
  const actual = [...input].sort();
  const exactMatch =
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);

  if (exactMatch) {
    result.correct = [...expectedTriad];
    result.score = 100;
    return result;
  }

  const expectedNotes = [...expectedTriad];
  const expectedSet = new Set<string>(expectedNotes);
  result.incorrect = input.filter((value) => !expectedSet.has(value));
  result.missing = expectedNotes.filter((value) => !input.includes(value));
  result.score = 0;
  return result;
}

export function gradeAMajorTriadAttempt(input: string[]): GradeResult {
  return gradeTriadAttempt(input, A_MAJOR_TRIAD);
}

export function gradeFSharpMinorTriadAttempt(input: string[]): GradeResult {
  return gradeTriadAttempt(input, F_SHARP_MINOR_TRIAD);
}
