import type { ExamDraft } from "./types";

export interface ExamProgress {
  scaleCompleted: boolean;
  keySignatureCompleted: boolean;
  bMinorScaleCompleted: boolean;
  cMinorKeySignatureCompleted: boolean;
  triadCompleted: boolean;
  bMinorTriadCompleted: boolean;
  g7Completed: boolean;
  eMajor7Completed: boolean;
  identifyKeySignaturesCompleted: boolean;
  canFinish: boolean;
  totalScore: number | null;
}

export function getExamProgress(draft: ExamDraft): ExamProgress {
  const scaleCompleted = Boolean(draft.scale.result);
  const keySignatureCompleted = Boolean(draft.keySignature.result);
  const bMinorScaleCompleted = Boolean(draft.scaleBMinor.result);
  const cMinorKeySignatureCompleted = Boolean(draft.keySignatureCMinor.result);
  const triadCompleted = Boolean(draft.triad.result);
  const bMinorTriadCompleted = Boolean(draft.triadBMinor.result);
  const g7Completed = Boolean(draft.seventhChordG7.result);
  const eMajor7Completed = Boolean(draft.seventhChordEMajor7.result);
  const identifyKeySignaturesCompleted = Boolean(draft.identifyKeySignatures.result);
  const canFinish =
    scaleCompleted &&
    keySignatureCompleted &&
    bMinorScaleCompleted &&
    cMinorKeySignatureCompleted &&
    triadCompleted &&
    bMinorTriadCompleted &&
    g7Completed &&
    eMajor7Completed &&
    identifyKeySignaturesCompleted;
  const totalScore = canFinish
    ? Math.round(
        (draft.scale.result!.score +
          draft.keySignature.result!.score +
          draft.scaleBMinor.result!.score +
          draft.keySignatureCMinor.result!.score +
          draft.triad.result!.score +
          draft.triadBMinor.result!.score +
          draft.seventhChordG7.result!.score +
          draft.seventhChordEMajor7.result!.score +
          draft.identifyKeySignatures.result!.score) /
          9
      )
    : null;

  return {
    scaleCompleted,
    keySignatureCompleted,
    bMinorScaleCompleted,
    cMinorKeySignatureCompleted,
    triadCompleted,
    bMinorTriadCompleted,
    g7Completed,
    eMajor7Completed,
    identifyKeySignaturesCompleted,
    canFinish,
    totalScore,
  };
}
