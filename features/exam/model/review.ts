import {
  gradeBMinorScaleAttempt,
  gradeScaleAttempt,
  normalizeKeyToPitchClass,
} from "@/features/notation/grading/gradeScale";
import {
  gradeCMinorKeySignatureAttempt,
  gradeDKeySignatureAttempt,
} from "@/features/notation/grading/gradeKeySignature";
import {
  gradeIdentifyKeySignaturesAttempt,
  IDENTIFY_KEY_SIGNATURE_PROMPTS,
} from "@/features/notation/grading/gradeIdentifyKeySignatures";
import {
  B_NATURAL_MINOR_SCALE,
  C_MINOR_KEYSIG_BY_CLEF,
  D_MAJOR_KEYSIG_BY_CLEF,
  D_MAJOR_SCALE,
} from "@/features/notation/model/constants";
import type { ExamDraft } from "./types";

const NO_ANSWER_LABEL = "(No answer provided)";

export interface AnswerReviewSection {
  id: string;
  title: string;
  correctCount: number;
  totalCount: number;
  studentAnswers: string[];
  correctAnswers: string[];
  missingAnswers: string[];
  incorrectAnswers: string[];
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function formatPitchClass(value: string): string {
  if (!value) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function formatKeySignatureEntry(value: string): string {
  const match = /^([a-g])\/\d([#b])$/.exec(value);
  if (!match) return value;
  return `${match[1].toUpperCase()}${match[2]}`;
}

function formatIdentifyExpected(tonic: string, mode: string): string {
  return `${formatPitchClass(tonic)} ${mode}`;
}

function withFallback(values: string[]): string[] {
  if (values.length === 0) return [NO_ANSWER_LABEL];
  return values.map((value) => (value.trim() ? value : NO_ANSWER_LABEL));
}

export function buildExamReview(draft: ExamDraft): AnswerReviewSection[] {
  const dMajorKeySigStudent = draft.keySignature.notes.map(
    (note) => `${note.note}${note.type}`,
  );
  const dMajorKeySigExpected = D_MAJOR_KEYSIG_BY_CLEF[draft.keySignature.clef];
  const dMajorKeySigGrade = gradeDKeySignatureAttempt(
    draft.keySignature.clef,
    dMajorKeySigStudent,
  );

  const cMinorKeySigStudent = draft.keySignatureCMinor.notes.map(
    (note) => `${note.note}${note.type}`,
  );
  const cMinorKeySigExpected = C_MINOR_KEYSIG_BY_CLEF[draft.keySignatureCMinor.clef];
  const cMinorKeySigGrade = gradeCMinorKeySignatureAttempt(
    draft.keySignatureCMinor.clef,
    cMinorKeySigStudent,
  );

  const dMajorScaleStudent = draft.scale.notes.map((note) =>
    normalizeKeyToPitchClass(note.key, note.accidental),
  );
  const dMajorScaleGrade = gradeScaleAttempt(dMajorScaleStudent);

  const bMinorScaleStudent = draft.scaleBMinor.notes.map((note) =>
    normalizeKeyToPitchClass(note.key, note.accidental),
  );
  const bMinorScaleGrade = gradeBMinorScaleAttempt(bMinorScaleStudent);

  const identifyStudent = IDENTIFY_KEY_SIGNATURE_PROMPTS.map(
    (_, index) => draft.identifyKeySignatures.answers[index] ?? "",
  );
  const identifyGrade = gradeIdentifyKeySignaturesAttempt(identifyStudent);
  const identifyExpected = IDENTIFY_KEY_SIGNATURE_PROMPTS.map((prompt) =>
    formatIdentifyExpected(prompt.tonic, prompt.mode),
  );

  return [
    {
      id: "d-major-keysig",
      title: "D Major Key Signature (Notation)",
      correctCount: dMajorKeySigGrade.correct.length,
      totalCount: dMajorKeySigExpected.length,
      studentAnswers: withFallback(dMajorKeySigStudent.map(formatKeySignatureEntry)),
      correctAnswers: dMajorKeySigExpected.map(formatKeySignatureEntry),
      missingAnswers: dMajorKeySigGrade.missing.map(formatKeySignatureEntry),
      incorrectAnswers: dMajorKeySigGrade.incorrect.map(formatKeySignatureEntry),
    },
    {
      id: "c-minor-keysig",
      title: "C Minor Key Signature (Notation)",
      correctCount: cMinorKeySigGrade.correct.length,
      totalCount: cMinorKeySigExpected.length,
      studentAnswers: withFallback(cMinorKeySigStudent.map(formatKeySignatureEntry)),
      correctAnswers: cMinorKeySigExpected.map(formatKeySignatureEntry),
      missingAnswers: cMinorKeySigGrade.missing.map(formatKeySignatureEntry),
      incorrectAnswers: cMinorKeySigGrade.incorrect.map(formatKeySignatureEntry),
    },
    {
      id: "d-major-scale",
      title: "D Major Scale",
      correctCount: dMajorScaleGrade.correct.length,
      totalCount: D_MAJOR_SCALE.length,
      studentAnswers: withFallback(dMajorScaleStudent.map(formatPitchClass)),
      correctAnswers: D_MAJOR_SCALE.map(formatPitchClass),
      missingAnswers: dMajorScaleGrade.missing.map(formatPitchClass),
      incorrectAnswers: dMajorScaleGrade.incorrect.map(formatPitchClass),
    },
    {
      id: "b-minor-scale",
      title: "B Natural Minor Scale",
      correctCount: bMinorScaleGrade.correct.length,
      totalCount: B_NATURAL_MINOR_SCALE.length,
      studentAnswers: withFallback(bMinorScaleStudent.map(formatPitchClass)),
      correctAnswers: B_NATURAL_MINOR_SCALE.map(formatPitchClass),
      missingAnswers: bMinorScaleGrade.missing.map(formatPitchClass),
      incorrectAnswers: bMinorScaleGrade.incorrect.map(formatPitchClass),
    },
    {
      id: "identify-keysig",
      title: "Identify Key Signatures",
      correctCount: identifyGrade.correct.length,
      totalCount: IDENTIFY_KEY_SIGNATURE_PROMPTS.length,
      studentAnswers: withFallback(identifyStudent),
      correctAnswers: identifyExpected,
      missingAnswers: identifyGrade.missing.map(capitalizeFirst),
      incorrectAnswers: identifyGrade.incorrect.map((value) =>
        value === "(blank)" ? NO_ANSWER_LABEL : value,
      ),
    },
  ];
}
