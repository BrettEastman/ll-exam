import {
  C_MINOR_KEYSIG_BY_CLEF,
  D_MAJOR_KEYSIG_BY_CLEF,
} from "../model/constants";
import type { ClefType, GradeResult } from "../model/types";

function gradeAgainstExpected(
  expected: readonly string[],
  input: string[]
): GradeResult {
  const result: GradeResult = {
    correct: [],
    incorrect: [],
    missing: [],
    score: 0,
  };

  input.forEach((entry) => {
    if (expected.includes(entry)) {
      result.correct.push(entry);
    } else {
      result.incorrect.push(entry);
    }
  });

  expected.forEach((entry) => {
    if (!input.includes(entry)) {
      result.missing.push(entry);
    }
  });

  result.score = Math.round((result.correct.length / expected.length) * 100);
  return result;
}

export function gradeDKeySignatureAttempt(clef: ClefType, input: string[]): GradeResult {
  return gradeAgainstExpected(D_MAJOR_KEYSIG_BY_CLEF[clef], input);
}

export function gradeCMinorKeySignatureAttempt(
  clef: ClefType,
  input: string[]
): GradeResult {
  return gradeAgainstExpected(C_MINOR_KEYSIG_BY_CLEF[clef], input);
}
