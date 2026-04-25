import { describe, expect, test } from "bun:test";
import {
  gradeCMinorKeySignatureAttempt,
  gradeDKeySignatureAttempt,
} from "./gradeKeySignature";

describe("gradeDKeySignatureAttempt", () => {
  test("grades correct treble key signature as 100", () => {
    const result = gradeDKeySignatureAttempt("treble", ["f/5#", "c/5#"]);
    expect(result.score).toBe(100);
    expect(result.incorrect).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  test("tracks incorrect and missing entries for bass clef", () => {
    const result = gradeDKeySignatureAttempt("bass", ["f/3#", "c/4#"]);
    expect(result.score).toBe(0);
    expect(result.correct).toEqual([]);
    expect(result.incorrect).toEqual(["c/4#"]);
    expect(result.missing).toEqual(["c/3#"]);
  });

  test("returns zero when extra accidentals are submitted", () => {
    const result = gradeDKeySignatureAttempt("treble", [
      "f/5#",
      "c/5#",
      "g/5#",
      "d/5#",
    ]);

    expect(result.score).toBe(0);
    expect(result.correct).toEqual([]);
    expect(result.incorrect).toEqual(["g/5#", "d/5#"]);
    expect(result.missing).toEqual([]);
  });
});

describe("gradeCMinorKeySignatureAttempt", () => {
  test("grades correct treble key signature as 100", () => {
    const result = gradeCMinorKeySignatureAttempt("treble", ["b/4b", "e/5b", "a/4b"]);
    expect(result.score).toBe(100);
    expect(result.incorrect).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});
