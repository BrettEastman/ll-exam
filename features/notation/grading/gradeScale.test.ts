import { describe, expect, test } from "bun:test";
import {
  gradeBMinorScaleAttempt,
  gradeScaleAttempt,
  normalizeKeyToPitchClass,
} from "./gradeScale";

describe("normalizeKeyToPitchClass", () => {
  test("normalizes pitch classes with and without accidental", () => {
    expect(normalizeKeyToPitchClass("d/4")).toBe("d");
    expect(normalizeKeyToPitchClass("f/4", "#")).toBe("f#");
    expect(normalizeKeyToPitchClass("b/3", "n")).toBe("bn");
  });
});

describe("gradeScaleAttempt", () => {
  test("returns 100 when full D major scale is correct", () => {
    const result = gradeScaleAttempt(["d", "e", "f#", "g", "a", "b", "c#"]);
    expect(result.score).toBe(100);
    expect(result.incorrect).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  test("marks incorrect notes and missing expected notes", () => {
    const result = gradeScaleAttempt(["d", "e", "f", "g", "a", "b", "c"]);
    expect(result.score).toBe(71);
    expect(result.correct).toEqual(["d", "e", "g", "a", "b"]);
    expect(result.incorrect).toEqual(["f", "c"]);
    expect(result.missing).toEqual(["f#", "c#"]);
  });
});

describe("gradeBMinorScaleAttempt", () => {
  test("returns 100 when full B natural minor scale is correct", () => {
    const result = gradeBMinorScaleAttempt(["b", "c#", "d", "e", "f#", "g", "a"]);
    expect(result.score).toBe(100);
    expect(result.incorrect).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});
