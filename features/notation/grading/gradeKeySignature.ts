import { D_MAJOR_KEYSIG_BY_CLEF } from "../model/constants";
import type { ClefType, GradeResult } from "../model/types";

export function gradeDKeySignatureAttempt(clef: ClefType, input: string[]): GradeResult {
  const expected = D_MAJOR_KEYSIG_BY_CLEF[clef];
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
