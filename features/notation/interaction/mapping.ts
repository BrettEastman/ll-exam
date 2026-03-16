import { NOTE_KEYS_BY_CLEF, defaultStaffGeometry } from "../model/constants";
import type { ClefType } from "../model/types";

export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}

export function keyFromLineIndex(clef: ClefType, lineIndex: number): string {
  const keys = NOTE_KEYS_BY_CLEF[clef];
  return keys[clampIndex(lineIndex, keys.length)];
}

export function lineIndexFromSvgClickY(y: number): number {
  const geometry = defaultStaffGeometry();
  const halfStep = geometry.spacingBetweenLines / 2;
  const unscaledY = y / geometry.scale;
  const idx = Math.round((unscaledY - geometry.topLineY) / halfStep) - 1;
  return clampIndex(idx, NOTE_KEYS_BY_CLEF.treble.length);
}
