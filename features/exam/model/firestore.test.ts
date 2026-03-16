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
    draft.currentPage = 2;
    draft.submitted = true;
    draft.autoSubmitted = true;
    draft.scale.notes = [{ key: "d/4" }, { key: "f/4", accidental: "#" }];

    const payload = toFirestoreExamAttempt(draft);
    expect(payload.version).toBe(EXAM_ATTEMPT_SCHEMA_VERSION);
    expect(payload.status).toBe("submitted");
    expect(payload.currentPage).toBe(2);
    expect(payload.scale.notes).toEqual(draft.scale.notes);
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
    };

    expect(isFirestoreExamAttempt(valid)).toBe(true);
  });

  test("rejects invalid page and missing scale/keySignature", () => {
    expect(
      isFirestoreExamAttempt({
        version: 1,
        startedAt: 1,
        updatedAt: 2,
        currentPage: 3,
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
        currentPage: 2,
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
      },
      fallback
    );

    expect(sanitized.scale.clef).toBe("bass");
    expect(sanitized.scale.notes).toEqual([{ key: "d/3", accidental: "#" }]);
    expect(sanitized.scale.result?.score).toBe(100);
    expect(sanitized.keySignature.notes).toEqual([{ note: "f/5", type: "#" }]);
  });

  test("returns fallback when payload is invalid", () => {
    const fallback = createEmptyDraft(42);
    const sanitized = sanitizeFirestoreExamAttempt({ nope: true }, fallback);
    expect(sanitized).toBe(fallback);
  });
});
