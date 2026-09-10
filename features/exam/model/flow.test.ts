import { describe, expect, test } from "bun:test";
import { createEmptyDraft } from "@/features/exam/persistence/draft";
import { getExamProgress } from "./flow";

describe("getExamProgress", () => {
  test("reports incomplete exam when one section missing", () => {
    const draft = createEmptyDraft(100);
    draft.scale.result = { score: 86, submittedAt: 200 };
    draft.keySignature.result = { score: 74, submittedAt: 250 };
    draft.scaleBMinor.result = { score: 92, submittedAt: 275 };
    draft.keySignatureCMinor.result = { score: 80, submittedAt: 290 };
    draft.triad.result = { score: 100, submittedAt: 295 };
    draft.triadBMinor.result = { score: 90, submittedAt: 298 };
    draft.seventhChordG7.result = { score: 75, submittedAt: 299 };
    draft.seventhChordEMajor7.result = { score: 88, submittedAt: 300 };

    const progress = getExamProgress(draft);
    expect(progress.scaleCompleted).toBe(true);
    expect(progress.keySignatureCompleted).toBe(true);
    expect(progress.bMinorScaleCompleted).toBe(true);
    expect(progress.cMinorKeySignatureCompleted).toBe(true);
    expect(progress.triadCompleted).toBe(true);
    expect(progress.bMinorTriadCompleted).toBe(true);
    expect(progress.g7Completed).toBe(true);
    expect(progress.eMajor7Completed).toBe(true);
    expect(progress.identifyKeySignaturesCompleted).toBe(false);
    expect(progress.canFinish).toBe(false);
    expect(progress.totalScore).toBeNull();
  });

  test("reports finishable exam and average score when all complete", () => {
    const draft = createEmptyDraft(100);
    draft.scale.result = { score: 86, submittedAt: 200 };
    draft.keySignature.result = { score: 74, submittedAt: 300 };
    draft.scaleBMinor.result = { score: 92, submittedAt: 350 };
    draft.keySignatureCMinor.result = { score: 80, submittedAt: 400 };
    draft.triad.result = { score: 100, submittedAt: 425 };
    draft.triadBMinor.result = { score: 90, submittedAt: 440 };
    draft.seventhChordG7.result = { score: 75, submittedAt: 445 };
    draft.seventhChordEMajor7.result = { score: 88, submittedAt: 447 };
    draft.identifyKeySignatures.result = { score: 75, submittedAt: 450 };

    const progress = getExamProgress(draft);
    expect(progress.scaleCompleted).toBe(true);
    expect(progress.keySignatureCompleted).toBe(true);
    expect(progress.bMinorScaleCompleted).toBe(true);
    expect(progress.cMinorKeySignatureCompleted).toBe(true);
    expect(progress.triadCompleted).toBe(true);
    expect(progress.bMinorTriadCompleted).toBe(true);
    expect(progress.g7Completed).toBe(true);
    expect(progress.eMajor7Completed).toBe(true);
    expect(progress.identifyKeySignaturesCompleted).toBe(true);
    expect(progress.canFinish).toBe(true);
    expect(progress.totalScore).toBe(84);
  });
});
