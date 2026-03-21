import {
  EXAM_DRAFT_STORAGE_KEY,
  EXAM_TOTAL_PAGES,
} from "../model/constants";
import type { ExamDraft } from "../model/types";

export function createEmptyDraft(now = Date.now()): ExamDraft {
  return {
    startedAt: now,
    updatedAt: now,
    currentPage: 1,
    submitted: false,
    autoSubmitted: false,
    scale: {
      clef: "treble",
      notes: [],
      result: null,
    },
    keySignature: {
      clef: "treble",
      notes: [],
      result: null,
    },
    scaleBMinor: {
      clef: "treble",
      notes: [],
      result: null,
    },
    keySignatureCMinor: {
      clef: "treble",
      notes: [],
      result: null,
    },
    identifyKeySignatures: {
      answers: [],
      result: null,
    },
  };
}

export function sanitizeDraft(input: unknown): ExamDraft {
  const fallback = createEmptyDraft();
  if (!input || typeof input !== "object") return fallback;

  const draft = input as Partial<ExamDraft>;
  const currentPage =
    typeof draft.currentPage === "number"
      ? Math.max(1, Math.min(EXAM_TOTAL_PAGES, Math.floor(draft.currentPage)))
      : 1;

  return {
    startedAt:
      typeof draft.startedAt === "number" ? draft.startedAt : fallback.startedAt,
    updatedAt:
      typeof draft.updatedAt === "number" ? draft.updatedAt : fallback.updatedAt,
    currentPage,
    submitted: Boolean(draft.submitted),
    autoSubmitted: Boolean(draft.autoSubmitted),
    scale: {
      clef: draft.scale?.clef === "bass" ? "bass" : "treble",
      notes: Array.isArray(draft.scale?.notes) ? draft.scale.notes : [],
      result: draft.scale?.result ?? null,
    },
    keySignature: {
      clef: draft.keySignature?.clef === "bass" ? "bass" : "treble",
      notes: Array.isArray(draft.keySignature?.notes)
        ? draft.keySignature.notes
        : [],
      result: draft.keySignature?.result ?? null,
    },
    scaleBMinor: {
      clef: draft.scaleBMinor?.clef === "bass" ? "bass" : "treble",
      notes: Array.isArray(draft.scaleBMinor?.notes) ? draft.scaleBMinor.notes : [],
      result: draft.scaleBMinor?.result ?? null,
    },
    keySignatureCMinor: {
      clef: draft.keySignatureCMinor?.clef === "bass" ? "bass" : "treble",
      notes: Array.isArray(draft.keySignatureCMinor?.notes)
        ? draft.keySignatureCMinor.notes
        : [],
      result: draft.keySignatureCMinor?.result ?? null,
    },
    identifyKeySignatures: {
      answers: Array.isArray(draft.identifyKeySignatures?.answers)
        ? draft.identifyKeySignatures.answers.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
      result: draft.identifyKeySignatures?.result ?? null,
    },
  };
}

export function loadDraft(): ExamDraft {
  if (typeof window === "undefined") return createEmptyDraft();

  try {
    const raw = localStorage.getItem(EXAM_DRAFT_STORAGE_KEY);
    if (!raw) return createEmptyDraft();
    return sanitizeDraft(JSON.parse(raw));
  } catch {
    return createEmptyDraft();
  }
}

export function saveDraft(draft: ExamDraft): void {
  if (typeof window === "undefined") return;

  const payload: ExamDraft = {
    ...draft,
    updatedAt: Date.now(),
  };

  localStorage.setItem(EXAM_DRAFT_STORAGE_KEY, JSON.stringify(payload));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EXAM_DRAFT_STORAGE_KEY);
}
