import { describe, expect, test } from "bun:test";
import {
  gradeBMinorTriadAttempt,
  gradeDMajorTriadAttempt,
} from "./gradeTriad";

describe("gradeDMajorTriadAttempt", () => {
  test("returns 100 for exact triad regardless of order", () => {
    expect(gradeDMajorTriadAttempt(["d", "f#", "a"]).score).toBe(100);
    expect(gradeDMajorTriadAttempt(["a", "d", "f#"]).score).toBe(100);
  });

  test("returns 0 when note is missing", () => {
    const result = gradeDMajorTriadAttempt(["d", "f#"]);
    expect(result.score).toBe(0);
    expect(result.missing).toEqual(["a"]);
  });

  test("returns 0 when extra note is provided", () => {
    const result = gradeDMajorTriadAttempt(["d", "f#", "a", "c#"]);
    expect(result.score).toBe(0);
    expect(result.incorrect).toEqual(["c#"]);
  });
});

describe("gradeBMinorTriadAttempt", () => {
  test("returns 100 for exact B minor triad regardless of order", () => {
    expect(gradeBMinorTriadAttempt(["b", "d", "f#"]).score).toBe(100);
    expect(gradeBMinorTriadAttempt(["f#", "b", "d"]).score).toBe(100);
  });

  test("returns 0 for incorrect set", () => {
    const result = gradeBMinorTriadAttempt(["b", "d", "a"]);
    expect(result.score).toBe(0);
    expect(result.incorrect).toEqual(["a"]);
    expect(result.missing).toEqual(["f#"]);
  });
});
