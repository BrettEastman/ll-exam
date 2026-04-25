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

  const exactMatch =
    input.length === expected.length &&
    input.every((entry) => expected.includes(entry)) &&
    expected.every((entry) => input.includes(entry));

  if (exactMatch) {
    result.correct = [...expected];
    result.score = 100;
    return result;
  }

  result.incorrect = input.filter((entry) => !expected.includes(entry));
  result.missing = expected.filter((entry) => !input.includes(entry));
  result.correct = [];
  result.score = 0;
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
