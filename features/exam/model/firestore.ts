import type { ExamDraft, KeySignatureDraftNote, ScaleDraftNote } from "./types";

export const EXAM_ATTEMPT_SCHEMA_VERSION = 1;

export interface FirestoreExamAttempt {
  version: number;
  status: "draft" | "submitted";
  startedAt: number;
  updatedAt: number;
  currentPage: number;
  submitted: boolean;
  autoSubmitted: boolean;
  scale: {
    clef: "treble" | "bass";
    notes: ScaleDraftNote[];
    result: ExamDraft["scale"]["result"];
  };
  keySignature: {
    clef: "treble" | "bass";
    notes: KeySignatureDraftNote[];
    result: ExamDraft["keySignature"]["result"];
  };
}

export function toFirestoreExamAttempt(draft: ExamDraft): FirestoreExamAttempt {
  return {
    version: EXAM_ATTEMPT_SCHEMA_VERSION,
    status: draft.submitted ? "submitted" : "draft",
    startedAt: draft.startedAt,
    updatedAt: draft.updatedAt,
    currentPage: draft.currentPage,
    submitted: draft.submitted,
    autoSubmitted: draft.autoSubmitted,
    scale: {
      clef: draft.scale.clef,
      notes: draft.scale.notes,
      result: draft.scale.result,
    },
    keySignature: {
      clef: draft.keySignature.clef,
      notes: draft.keySignature.notes,
      result: draft.keySignature.result,
    },
  };
}

function sanitizeScaleNotes(input: unknown): ScaleDraftNote[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((note): ScaleDraftNote | null => {
      if (!note || typeof note !== "object") return null;
      const key = (note as { key?: unknown }).key;
      const accidental = (note as { accidental?: unknown }).accidental;
      if (typeof key !== "string" || key.length === 0) return null;
      if (
        accidental !== undefined &&
        accidental !== "#" &&
        accidental !== "b" &&
        accidental !== "n"
      ) {
        return null;
      }

      if (accidental === undefined) {
        return { key };
      }

      return { key, accidental };
    })
    .filter((note): note is ScaleDraftNote => note !== null);
}

function sanitizeKeySignatureNotes(input: unknown): KeySignatureDraftNote[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((note) => {
      if (!note || typeof note !== "object") return null;
      const pitch = (note as { note?: unknown }).note;
      const type = (note as { type?: unknown }).type;
      if (typeof pitch !== "string" || pitch.length === 0) return null;
      if (type !== "#" && type !== "b") return null;

      return {
        note: pitch,
        type,
      };
    })
    .filter((note): note is KeySignatureDraftNote => note !== null);
}

function sanitizeResult(input: unknown): ExamDraft["scale"]["result"] {
  if (!input || typeof input !== "object") return null;
  const score = (input as { score?: unknown }).score;
  const submittedAt = (input as { submittedAt?: unknown }).submittedAt;
  if (typeof score !== "number" || typeof submittedAt !== "number") return null;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    submittedAt,
  };
}

export function isFirestoreExamAttempt(input: unknown): input is FirestoreExamAttempt {
  if (!input || typeof input !== "object") return false;
  const value = input as Partial<FirestoreExamAttempt>;

  if (typeof value.version !== "number") return false;
  if (typeof value.startedAt !== "number" || typeof value.updatedAt !== "number") {
    return false;
  }

  if (value.currentPage !== 1 && value.currentPage !== 2) return false;
  if (typeof value.submitted !== "boolean" || typeof value.autoSubmitted !== "boolean") {
    return false;
  }

  return Boolean(value.scale && value.keySignature);
}

export function sanitizeFirestoreExamAttempt(
  input: unknown,
  fallback: ExamDraft
): ExamDraft {
  if (!isFirestoreExamAttempt(input)) return fallback;
  const value = input as FirestoreExamAttempt;

  return {
    startedAt: value.startedAt,
    updatedAt: value.updatedAt,
    currentPage: value.currentPage,
    submitted: value.submitted,
    autoSubmitted: value.autoSubmitted,
    scale: {
      clef: value.scale?.clef === "bass" ? "bass" : "treble",
      notes: sanitizeScaleNotes(value.scale?.notes),
      result: sanitizeResult(value.scale?.result),
    },
    keySignature: {
      clef: value.keySignature?.clef === "bass" ? "bass" : "treble",
      notes: sanitizeKeySignatureNotes(value.keySignature?.notes),
      result: sanitizeResult(value.keySignature?.result),
    },
  };
}
