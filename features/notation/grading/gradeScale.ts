import { D_MAJOR_SCALE } from "../model/constants";
import type { GradeResult } from "../model/types";

export function normalizeKeyToPitchClass(key: string, accidental?: string): string {
  const [name] = key.split("/");
  return `${name}${accidental ?? ""}`;
}

export function gradeScaleAttempt(input: string[]): GradeResult {
  const result: GradeResult = {
    correct: [],
    incorrect: [],
    missing: [],
    score: 0,
  };

  input.forEach((note, index) => {
    if (D_MAJOR_SCALE[index] === note) {
      result.correct.push(note);
    } else {
      result.incorrect.push(note);
    }
  });

  D_MAJOR_SCALE.forEach((correct, index) => {
    if (input[index] !== correct) {
      result.missing.push(correct);
    }
  });

  result.score = Math.round((result.correct.length / D_MAJOR_SCALE.length) * 100);
  return result;
}
