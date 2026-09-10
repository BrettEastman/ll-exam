import { describe, expect, test } from "bun:test";
import {
  E_MAJOR_7_CHORD,
  G7_CHORD,
  gradeSeventhChordAttempt,
} from "./gradeSeventhChord";

describe("gradeSeventhChordAttempt", () => {
  test("returns 100 for exact G7 regardless of order", () => {
    expect(gradeSeventhChordAttempt(["g", "b", "d", "f"], G7_CHORD).score).toBe(
      100,
    );
    expect(gradeSeventhChordAttempt(["f", "g", "d", "b"], G7_CHORD).score).toBe(
      100,
    );
  });

  test("returns 0 when notes are missing", () => {
    const result = gradeSeventhChordAttempt(["g", "b", "d"], G7_CHORD);
    expect(result.score).toBe(0);
    expect(result.missing).toEqual(["f"]);
  });

  test("returns 100 for exact E major 7", () => {
    expect(
      gradeSeventhChordAttempt(["e", "g#", "b", "d#"], E_MAJOR_7_CHORD).score,
    ).toBe(100);
  });
});
