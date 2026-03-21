export const EXAM_TOTAL_PAGES = 5;
export const EXAM_DURATION_SECONDS = 60 * 60;
export const EXAM_DRAFT_STORAGE_KEY = "lydianlab.exam.draft.v1";

export const EXAM_PAGE_META = {
  1: {
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for D major.",
  },
  2: {
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for C minor.",
  },
  3: {
    title: "Scale Notation",
    description: "Enter the D major scale notes in order.",
  },
  4: {
    title: "Scale Notation",
    description: "Enter the B natural minor scale notes in order.",
  },
  5: {
    title: "Identify Key Signatures",
    description: "Name each key signature shown on the staff.",
  },
} as const;
