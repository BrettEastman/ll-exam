import { describe, expect, test } from "bun:test";
import { createEmptyDraft } from "@/features/exam/persistence/draft";
import {
  EXAM_ATTEMPT_SCHEMA_VERSION,
  isFirestoreExamAttempt,
  sanitizeFirestoreExamAttempt,
  toFirestoreExamAttempt,
} from "./firestore";

describe("toFirestoreExamAttempt", () => {
  test("maps draft fields and status correctly", () => {
    const draft = createEmptyDraft(1000);
    draft.currentPage = 4;
    draft.submitted = true;
    draft.autoSubmitted = true;
    draft.scale.notes = [{ key: "d/4" }, { key: "f/4", accidental: "#" }];
    draft.scaleBMinor.notes = [{ key: "b/3" }, { key: "c/4", accidental: "#" }];
    draft.keySignatureCMinor.notes = [
      { note: "b/4", type: "b" },
      { note: "e/5", type: "b" },
    ];

    const payload = toFirestoreExamAttempt(draft);
    expect(payload.version).toBe(EXAM_ATTEMPT_SCHEMA_VERSION);
    expect(payload.status).toBe("submitted");
    expect(payload.currentPage).toBe(4);
    expect(payload.scale.notes).toEqual(draft.scale.notes);
    expect(payload.scaleBMinor.notes).toEqual(draft.scaleBMinor.notes);
    expect(payload.keySignatureCMinor.notes).toEqual(draft.keySignatureCMinor.notes);
  });

  test("omits undefined accidentals for Firestore compatibility", () => {
    const draft = createEmptyDraft(1000);
    draft.scale.notes = [
      { key: "d/4", accidental: undefined },
      { key: "f/4", accidental: "#" },
    ];

    const payload = toFirestoreExamAttempt(draft);
    expect(payload.scale.notes).toEqual([
      { key: "d/4" },
      { key: "f/4", accidental: "#" },
    ]);
  });
});

describe("isFirestoreExamAttempt", () => {
  test("accepts valid attempt shape", () => {
    const valid = {
      version: 1,
      status: "draft",
      startedAt: 1,
      updatedAt: 2,
      currentPage: 1,
      submitted: false,
      autoSubmitted: false,
      scale: { clef: "treble", notes: [], result: null },
      keySignature: { clef: "treble", notes: [], result: null },
      scaleBMinor: { clef: "treble", notes: [], result: null },
      keySignatureCMinor: { clef: "treble", notes: [], result: null },
    };

    expect(isFirestoreExamAttempt(valid)).toBe(true);
  });

  test("rejects invalid page and missing required sections", () => {
    expect(
      isFirestoreExamAttempt({
        version: 1,
        startedAt: 1,
        updatedAt: 2,
        currentPage: 5,
        submitted: false,
        autoSubmitted: false,
      })
    ).toBe(false);
  });
});

describe("sanitizeFirestoreExamAttempt", () => {
  test("sanitizes malformed nested fields", () => {
    const fallback = createEmptyDraft(500);
    const sanitized = sanitizeFirestoreExamAttempt(
      {
        version: 1,
        status: "draft",
        startedAt: 10,
        updatedAt: 20,
        currentPage: 4,
        submitted: true,
        autoSubmitted: false,
        scale: {
          clef: "bass",
          notes: [{ key: "d/3", accidental: "#" }, { key: "", accidental: "#" }],
          result: { score: 110, submittedAt: 123 },
        },
        keySignature: {
          clef: "treble",
          notes: [{ note: "f/5", type: "#" }, { note: "x", type: "n" }],
          result: { score: 70, submittedAt: 456 },
        },
        scaleBMinor: {
          clef: "treble",
          notes: [{ key: "b/4" }, { key: "c/5", accidental: "#" }],
          result: { score: 84, submittedAt: 789 },
        },
        keySignatureCMinor: {
          clef: "bass",
          notes: [{ note: "b/2", type: "b" }, { note: "a/2", type: "x" }],
          result: { score: 90, submittedAt: 999 },
        },
      },
      fallback
    );

    expect(sanitized.scale.clef).toBe("bass");
    expect(sanitized.scale.notes).toEqual([{ key: "d/3", accidental: "#" }]);
    expect(sanitized.scale.result?.score).toBe(100);
    expect(sanitized.keySignature.notes).toEqual([{ note: "f/5", type: "#" }]);
    expect(sanitized.scaleBMinor.notes).toEqual([
      { key: "b/4" },
      { key: "c/5", accidental: "#" },
    ]);
    expect(sanitized.keySignatureCMinor.notes).toEqual([{ note: "b/2", type: "b" }]);
  });

  test("returns fallback when payload is invalid", () => {
    const fallback = createEmptyDraft(42);
    const sanitized = sanitizeFirestoreExamAttempt({ nope: true }, fallback);
    expect(sanitized).toBe(fallback);
  });
});
