import { describe, expect, test } from "bun:test";
import { createEmptyDraft, sanitizeDraft } from "./draft";

describe("createEmptyDraft", () => {
  test("creates deterministic default shape", () => {
    const draft = createEmptyDraft(1234);
    expect(draft.startedAt).toBe(1234);
    expect(draft.updatedAt).toBe(1234);
    expect(draft.currentPage).toBe(1);
    expect(draft.scale.clef).toBe("treble");
    expect(draft.keySignature.clef).toBe("treble");
    expect(draft.scaleBMinor.clef).toBe("treble");
    expect(draft.keySignatureCMinor.clef).toBe("treble");
    expect(draft.identifyKeySignatures.answers).toEqual([]);
  });
});

describe("sanitizeDraft", () => {
  test("clamps current page and defaults invalid clefs", () => {
    const sanitized = sanitizeDraft({
      startedAt: 10,
      updatedAt: 20,
      currentPage: 99,
      submitted: 1,
      autoSubmitted: 0,
      scale: { clef: "alto", notes: [{ key: "d/4" }], result: null },
        keySignature: {
          clef: "bass",
          notes: [{ note: "f/3", type: "#" }],
          result: null,
        },
        scaleBMinor: {
          clef: "bass",
          notes: [{ key: "b/3" }],
          result: null,
        },
        keySignatureCMinor: {
          clef: "treble",
          notes: [{ note: "b/4", type: "b" }],
          result: null,
        },
        identifyKeySignatures: {
          answers: ["db major", "a major"],
          result: null,
        },
    });

    expect(sanitized.startedAt).toBe(10);
    expect(sanitized.updatedAt).toBe(20);
    expect(sanitized.currentPage).toBe(5);
    expect(sanitized.submitted).toBe(true);
    expect(sanitized.autoSubmitted).toBe(false);
    expect(sanitized.scale.clef).toBe("treble");
    expect(sanitized.keySignature.clef).toBe("bass");
    expect(sanitized.scaleBMinor.clef).toBe("bass");
    expect(sanitized.keySignatureCMinor.clef).toBe("treble");
    expect(sanitized.identifyKeySignatures.answers).toEqual(["db major", "a major"]);
  });

  test("returns fallback draft for non-object payload", () => {
    const sanitized = sanitizeDraft(null);
    expect(sanitized.currentPage).toBe(1);
    expect(sanitized.scale.notes).toEqual([]);
    expect(sanitized.keySignature.notes).toEqual([]);
    expect(sanitized.scaleBMinor.notes).toEqual([]);
    expect(sanitized.keySignatureCMinor.notes).toEqual([]);
    expect(sanitized.identifyKeySignatures.answers).toEqual([]);
  });
});
