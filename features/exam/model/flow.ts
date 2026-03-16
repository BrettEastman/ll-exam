import type { ExamDraft } from "./types";

export interface ExamProgress {
  scaleCompleted: boolean;
  keySignatureCompleted: boolean;
  canFinish: boolean;
  totalScore: number | null;
}

export function getExamProgress(draft: ExamDraft): ExamProgress {
  const scaleCompleted = Boolean(draft.scale.result);
  const keySignatureCompleted = Boolean(draft.keySignature.result);
  const canFinish = scaleCompleted && keySignatureCompleted;
  const totalScore = canFinish
    ? Math.round((draft.scale.result!.score + draft.keySignature.result!.score) / 2)
    : null;

  return {
    scaleCompleted,
    keySignatureCompleted,
    canFinish,
    totalScore,
  };
}
