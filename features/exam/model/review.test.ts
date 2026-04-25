import { describe, expect, test } from "bun:test";
import { createEmptyDraft } from "../persistence/draft";
import { buildExamReview } from "./review";

describe("buildExamReview", () => {
  test("returns fallback labels for unanswered sections", () => {
    const draft = createEmptyDraft();
    const review = buildExamReview(draft);

    expect(review).toHaveLength(5);
    expect(review[0].studentAnswers).toEqual(["(No answer provided)"]);
    expect(review[2].studentAnswers).toEqual(["(No answer provided)"]);
    expect(review[4].studentAnswers).toEqual([
      "(No answer provided)",
      "(No answer provided)",
      "(No answer provided)",
      "(No answer provided)",
    ]);
  });

  test("shows raw identify answers and expected key formatting", () => {
    const draft = createEmptyDraft();
    draft.identifyKeySignatures.answers = ["db", "A", "", "C sharp minor"];

    const review = buildExamReview(draft);
    const identify = review.find((section) => section.id === "identify-keysig");

    expect(identify).toBeDefined();
    expect(identify?.studentAnswers).toEqual(["db", "A", "(No answer provided)", "C sharp minor"]);
    expect(identify?.correctAnswers).toEqual([
      "Db major",
      "A major",
      "F minor",
      "C# minor",
    ]);
  });
});
