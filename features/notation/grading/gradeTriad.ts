import type { GradeResult } from "../model/types";

export const D_MAJOR_TRIAD = ["d", "f#", "a"] as const;
export const B_MINOR_TRIAD = ["b", "d", "f#"] as const;

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

export function gradeDMajorTriadAttempt(input: string[]): GradeResult {
  return gradeTriadAttempt(input, D_MAJOR_TRIAD);
}

export function gradeBMinorTriadAttempt(input: string[]): GradeResult {
  return gradeTriadAttempt(input, B_MINOR_TRIAD);
}
