export const EXAM_TOTAL_PAGES = 2;
export const EXAM_DURATION_SECONDS = 60 * 60;
export const EXAM_DRAFT_STORAGE_KEY = "lydianlab.exam.draft.v1";

export const EXAM_PAGE_META = {
  1: {
    title: "Scale Notation",
    description: "Enter the D major scale notes in order.",
  },
  2: {
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for D major.",
  },
} as const;
