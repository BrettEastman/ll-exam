import type { ExamDraft } from "./types";

export interface ExamProgress {
  scaleCompleted: boolean;
  keySignatureCompleted: boolean;
  bMinorScaleCompleted: boolean;
  cMinorKeySignatureCompleted: boolean;
  identifyKeySignaturesCompleted: boolean;
  canFinish: boolean;
  totalScore: number | null;
}

export function getExamProgress(draft: ExamDraft): ExamProgress {
  const scaleCompleted = Boolean(draft.scale.result);
  const keySignatureCompleted = Boolean(draft.keySignature.result);
  const bMinorScaleCompleted = Boolean(draft.scaleBMinor.result);
  const cMinorKeySignatureCompleted = Boolean(draft.keySignatureCMinor.result);
  const identifyKeySignaturesCompleted = Boolean(draft.identifyKeySignatures.result);
  const canFinish =
    scaleCompleted &&
    keySignatureCompleted &&
    bMinorScaleCompleted &&
    cMinorKeySignatureCompleted &&
    identifyKeySignaturesCompleted;
  const totalScore = canFinish
    ? Math.round(
        (draft.scale.result!.score +
          draft.keySignature.result!.score +
          draft.scaleBMinor.result!.score +
          draft.keySignatureCMinor.result!.score +
          draft.identifyKeySignatures.result!.score) /
          5
      )
    : null;

  return {
    scaleCompleted,
    keySignatureCompleted,
    bMinorScaleCompleted,
    cMinorKeySignatureCompleted,
    identifyKeySignaturesCompleted,
    canFinish,
    totalScore,
  };
}
