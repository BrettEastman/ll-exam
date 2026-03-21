import { B_NATURAL_MINOR_SCALE, D_MAJOR_SCALE } from "../model/constants";
import type { GradeResult } from "../model/types";

export function normalizeKeyToPitchClass(key: string, accidental?: string): string {
  const [name] = key.split("/");
  return `${name}${accidental ?? ""}`;
}

function gradeAgainstExpected(input: string[], expected: readonly string[]): GradeResult {
  const result: GradeResult = {
    correct: [],
    incorrect: [],
    missing: [],
    score: 0,
  };

  input.forEach((note, index) => {
    if (expected[index] === note) {
      result.correct.push(note);
    } else {
      result.incorrect.push(note);
    }
  });

  expected.forEach((correct, index) => {
    if (input[index] !== correct) {
      result.missing.push(correct);
    }
  });

  result.score = Math.round((result.correct.length / expected.length) * 100);
  return result;
}

export function gradeScaleAttempt(input: string[]): GradeResult {
  return gradeAgainstExpected(input, D_MAJOR_SCALE);
}

export function gradeBMinorScaleAttempt(input: string[]): GradeResult {
  return gradeAgainstExpected(input, B_NATURAL_MINOR_SCALE);
}
