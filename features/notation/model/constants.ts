import type { ClefType, StaffGeometry } from "./types";

export const STAFF_WIDTH = 640;
export const STAFF_HEIGHT = 220;
export const STAFF_RENDER_SCALE = 1.5;

export const SCALE_NOTES_MAX = 7;
export const KEY_SIGNATURE_MAX = 7;

export const SCALE_NOTE_X_START = 60;
export const SCALE_NOTE_X_STEP = 75;

export const KEYSIG_X_START = 56;
export const KEYSIG_X_STEP = 44;

export const NOTE_TOP_LINE_INDEX = 5;

export const NOTE_KEYS_BY_CLEF: Record<ClefType, readonly string[]> = {
  treble: [
    "d/6",
    "c/6",
    "b/5",
    "a/5",
    "g/5",
    "f/5",
    "e/5",
    "d/5",
    "c/5",
    "b/4",
    "a/4",
    "g/4",
    "f/4",
    "e/4",
    "d/4",
    "c/4",
    "b/3",
    "a/3",
    "g/3",
  ],
  bass: [
    "f/4",
    "e/4",
    "d/4",
    "c/4",
    "b/3",
    "a/3",
    "g/3",
    "f/3",
    "e/3",
    "d/3",
    "c/3",
    "b/2",
    "a/2",
    "g/2",
    "f/2",
    "e/2",
    "d/2",
    "c/2",
    "b/1",
  ],
};

export const D_MAJOR_SCALE = ["d", "e", "f#", "g", "a", "b", "c#"];

export const D_MAJOR_KEYSIG_BY_CLEF: Record<ClefType, readonly string[]> = {
  treble: ["f/5#", "c/5#"],
  bass: ["f/3#", "c/3#"],
};

export function defaultStaffGeometry(): StaffGeometry {
  return {
    topLineY: 84,
    spacingBetweenLines: 10,
    scale: STAFF_RENDER_SCALE,
  };
}
