import { describe, expect, test } from "bun:test";
import { createEmptyDraft } from "@/features/exam/persistence/draft";
import { getExamProgress } from "./flow";

describe("getExamProgress", () => {
  test("reports incomplete exam when one section missing", () => {
    const draft = createEmptyDraft(100);
    draft.scale.result = { score: 86, submittedAt: 200 };
    draft.keySignature.result = { score: 74, submittedAt: 250 };
    draft.scaleBMinor.result = { score: 92, submittedAt: 275 };

    const progress = getExamProgress(draft);
    expect(progress.scaleCompleted).toBe(true);
    expect(progress.keySignatureCompleted).toBe(true);
    expect(progress.bMinorScaleCompleted).toBe(true);
    expect(progress.cMinorKeySignatureCompleted).toBe(false);
    expect(progress.canFinish).toBe(false);
    expect(progress.totalScore).toBeNull();
  });

  test("reports finishable exam and average score when all complete", () => {
    const draft = createEmptyDraft(100);
    draft.scale.result = { score: 86, submittedAt: 200 };
    draft.keySignature.result = { score: 74, submittedAt: 300 };
    draft.scaleBMinor.result = { score: 92, submittedAt: 350 };
    draft.keySignatureCMinor.result = { score: 80, submittedAt: 400 };

    const progress = getExamProgress(draft);
    expect(progress.scaleCompleted).toBe(true);
    expect(progress.keySignatureCompleted).toBe(true);
    expect(progress.bMinorScaleCompleted).toBe(true);
    expect(progress.cMinorKeySignatureCompleted).toBe(true);
    expect(progress.canFinish).toBe(true);
    expect(progress.totalScore).toBe(83);
  });
});
