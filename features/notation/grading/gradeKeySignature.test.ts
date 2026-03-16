import { describe, expect, test } from "bun:test";
import { gradeDKeySignatureAttempt } from "./gradeKeySignature";

describe("gradeDKeySignatureAttempt", () => {
  test("grades correct treble key signature as 100", () => {
    const result = gradeDKeySignatureAttempt("treble", ["f/5#", "c/5#"]);
    expect(result.score).toBe(100);
    expect(result.incorrect).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  test("tracks incorrect and missing entries for bass clef", () => {
    const result = gradeDKeySignatureAttempt("bass", ["f/3#", "c/4#"]);
    expect(result.score).toBe(50);
    expect(result.correct).toEqual(["f/3#"]);
    expect(result.incorrect).toEqual(["c/4#"]);
    expect(result.missing).toEqual(["c/3#"]);
  });
});
