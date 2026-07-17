import { describe, expect, test } from "bun:test";
import {
  gradeAMajorTriadAttempt,
  gradeFSharpMinorTriadAttempt,
} from "./gradeTriad";

describe("gradeAMajorTriadAttempt", () => {
  test("returns 100 for exact triad regardless of order", () => {
    expect(gradeAMajorTriadAttempt(["a", "c#", "e"]).score).toBe(100);
    expect(gradeAMajorTriadAttempt(["e", "a", "c#"]).score).toBe(100);
  });

  test("returns 0 when note is missing", () => {
    const result = gradeAMajorTriadAttempt(["a", "c#"]);
    expect(result.score).toBe(0);
    expect(result.missing).toEqual(["e"]);
  });

  test("returns 0 when extra note is provided", () => {
    const result = gradeAMajorTriadAttempt(["a", "c#", "e", "g#"]);
    expect(result.score).toBe(0);
    expect(result.incorrect).toEqual(["g#"]);
  });
});

describe("gradeFSharpMinorTriadAttempt", () => {
  test("returns 100 for exact F# minor triad regardless of order", () => {
    expect(gradeFSharpMinorTriadAttempt(["f#", "a", "c#"]).score).toBe(100);
    expect(gradeFSharpMinorTriadAttempt(["c#", "f#", "a"]).score).toBe(100);
  });

  test("returns 0 for incorrect set", () => {
    const result = gradeFSharpMinorTriadAttempt(["f#", "a", "d"]);
    expect(result.score).toBe(0);
    expect(result.incorrect).toEqual(["d"]);
    expect(result.missing).toEqual(["c#"]);
  });
});
