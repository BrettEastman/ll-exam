import { NOTE_KEYS_BY_CLEF } from "../model/constants";
import type { ClefType } from "../model/types";
import { clampIndex } from "./mapping";

export function moveLineIndex(
  current: number,
  direction: "up" | "down",
  clef: ClefType
): number {
  const step = direction === "up" ? -1 : 1;
  return clampIndex(current + step, NOTE_KEYS_BY_CLEF[clef].length);
}
