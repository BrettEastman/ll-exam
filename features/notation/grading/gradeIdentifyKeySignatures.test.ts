import { describe, expect, test } from "bun:test";
import {
  gradeIdentifyKeySignaturesAttempt,
  IDENTIFY_KEY_SIGNATURE_PROMPTS,
} from "./gradeIdentifyKeySignatures";

describe("gradeIdentifyKeySignaturesAttempt", () => {
  test("returns 100 when all answers are correct", () => {
    const answers = IDENTIFY_KEY_SIGNATURE_PROMPTS.map(
      (item) => `${item.tonic} ${item.mode}`,
    );
    const result = gradeIdentifyKeySignaturesAttempt(answers);
    expect(result.score).toBe(100);
    expect(result.incorrect).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  test("accepts enharmonic text formats and minor shorthand", () => {
    const result = gradeIdentifyKeySignaturesAttempt([
      "D flat major",
      "A",
      "F minor",
      "C#m",
    ]);
    expect(result.score).toBe(100);
  });

  test("accepts case-insensitive tonic variants like Db and D flat", () => {
    const firstPromptVariants = ["Db", "db", "D flat", "d flat"];

    for (const variant of firstPromptVariants) {
      const result = gradeIdentifyKeySignaturesAttempt([
        variant,
        "A",
        "F minor",
        "C# minor",
      ]);

      expect(result.score).toBe(100);
    }
  });

  test("accepts hyphen and symbol accidental input variants", () => {
    const firstPromptVariants = ["D-flat", "d-flat", "D♭", "d♭", "dflat"];
    const fourthPromptVariants = ["C sharp", "c sharp", "C-sharp", "C♯", "csharp"];

    for (const dbVariant of firstPromptVariants) {
      for (const cSharpVariant of fourthPromptVariants) {
        const result = gradeIdentifyKeySignaturesAttempt([
          dbVariant,
          "A",
          "F minor",
          cSharpVariant,
        ]);

        expect(result.score).toBe(100);
      }
    }
  });

  test("handles mixed and blank answers", () => {
    const result = gradeIdentifyKeySignaturesAttempt([
      "Db Major",
      "",
      "f minor",
      "d minor",
    ]);
    expect(result.score).toBe(50);
    expect(result.correct).toEqual(["db major", "f minor"]);
    expect(result.incorrect).toEqual(["(blank)", "d minor"]);
    expect(result.missing).toEqual(["a major", "c# minor"]);
  });
});
