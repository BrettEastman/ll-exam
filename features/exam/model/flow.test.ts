import { describe, expect, test } from "bun:test";
import { createEmptyDraft } from "@/features/exam/persistence/draft";
import { getExamProgress } from "./flow";

describe("getExamProgress", () => {
  test("reports incomplete exam when one section missing", () => {
    const draft = createEmptyDraft(100);
    draft.scale.result = { score: 86, submittedAt: 200 };

    const progress = getExamProgress(draft);
    expect(progress.scaleCompleted).toBe(true);
    expect(progress.keySignatureCompleted).toBe(false);
    expect(progress.canFinish).toBe(false);
    expect(progress.totalScore).toBeNull();
  });

  test("reports finishable exam and average score when both complete", () => {
    const draft = createEmptyDraft(100);
    draft.scale.result = { score: 86, submittedAt: 200 };
    draft.keySignature.result = { score: 74, submittedAt: 300 };

    const progress = getExamProgress(draft);
    expect(progress.scaleCompleted).toBe(true);
    expect(progress.keySignatureCompleted).toBe(true);
    expect(progress.canFinish).toBe(true);
    expect(progress.totalScore).toBe(80);
  });
});
