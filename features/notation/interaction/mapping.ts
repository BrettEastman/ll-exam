import {
  NOTE_KEYS_BY_CLEF,
  NOTE_TOP_LINE_INDEX,
  defaultStaffGeometry,
} from "../model/constants";
import type { ClefType, StaffGeometry } from "../model/types";

export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}

export function keyFromLineIndex(clef: ClefType, lineIndex: number): string {
  const keys = NOTE_KEYS_BY_CLEF[clef];
  return keys[clampIndex(lineIndex, keys.length)];
}

export function inferStaffGeometryFromSvg(svg: SVGSVGElement): StaffGeometry | null {
  const lines = Array.from(svg.querySelectorAll("line"))
    .map((line) => {
      const x1 = Number(line.getAttribute("x1"));
      const x2 = Number(line.getAttribute("x2"));
      const y1 = Number(line.getAttribute("y1"));
      const y2 = Number(line.getAttribute("y2"));

      return { x1, x2, y1, y2 };
    })
    .filter(
      (line) =>
        Number.isFinite(line.x1) &&
        Number.isFinite(line.x2) &&
        Number.isFinite(line.y1) &&
        Number.isFinite(line.y2) &&
        Math.abs(line.y1 - line.y2) < 0.001 &&
        Math.abs(line.x2 - line.x1) > 500
    )
    .map((line) => line.y1)
    .sort((a, b) => a - b);

  if (lines.length < 5) return null;

  const topLineY = lines[0];
  const spacingBetweenLines = lines[1] - lines[0];
  const renderedHeight = svg.getBoundingClientRect().height;
  const intrinsicHeight = Number(svg.getAttribute("height"));
  const scale =
    Number.isFinite(intrinsicHeight) && intrinsicHeight > 0
      ? renderedHeight / intrinsicHeight
      : defaultStaffGeometry().scale;

  if (!Number.isFinite(spacingBetweenLines) || spacingBetweenLines <= 0) {
    return null;
  }

  return {
    topLineY,
    spacingBetweenLines,
    scale,
  };
}

export function lineIndexFromSvgClickY(
  y: number,
  geometry: StaffGeometry = defaultStaffGeometry()
): number {
  const halfStep = geometry.spacingBetweenLines / 2;
  const unscaledY = y / geometry.scale;
  const idx = Math.round((unscaledY - geometry.topLineY) / halfStep) + NOTE_TOP_LINE_INDEX;
  return clampIndex(idx, NOTE_KEYS_BY_CLEF.treble.length);
}
