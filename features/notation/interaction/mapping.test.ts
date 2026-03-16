import { expect, test } from "bun:test";
import {
  NOTE_TOP_LINE_INDEX,
  defaultStaffGeometry,
} from "@/features/notation/model/constants";
import {
  inferStaffGeometryFromSvg,
  keyFromLineIndex,
  lineIndexFromSvgClickY,
} from "./mapping";

function yForIndex(index: number): number {
  const geometry = defaultStaffGeometry();
  const halfStep = geometry.spacingBetweenLines / 2;
  return (geometry.topLineY + (index - NOTE_TOP_LINE_INDEX) * halfStep) * geometry.scale;
}

test("maps click Y back to expected line indices", () => {
  for (const index of [0, 2, 5, 8, 10, 15, 18]) {
    expect(lineIndexFromSvgClickY(yForIndex(index))).toBe(index);
  }
});

test("maps treble click targets to expected notes", () => {
  const trebleE = keyFromLineIndex("treble", lineIndexFromSvgClickY(yForIndex(13)));
  const trebleD = keyFromLineIndex("treble", lineIndexFromSvgClickY(yForIndex(14)));

  expect(trebleE).toBe("e/4");
  expect(trebleD).toBe("d/4");
});

test("maps bass click targets to expected notes", () => {
  const bassC = keyFromLineIndex("bass", lineIndexFromSvgClickY(yForIndex(3)));
  const bassD = keyFromLineIndex("bass", lineIndexFromSvgClickY(yForIndex(2)));

  expect(bassC).toBe("c/4");
  expect(bassD).toBe("d/4");
});

test("clamps clicks above and below expanded range", () => {
  expect(lineIndexFromSvgClickY(-1000)).toBe(0);
  expect(lineIndexFromSvgClickY(10000)).toBe(18);
});

test("infers staff geometry from SVG staff lines", () => {
  const makeLine = (y: number) => ({
    getAttribute(name: string) {
      if (name === "x1") return "10";
      if (name === "x2") return "620";
      if (name === "y1") return String(y);
      if (name === "y2") return String(y);
      return null;
    },
  });

  const svg = {
    querySelectorAll(selector: string) {
      if (selector !== "line") return [];
      return [makeLine(84), makeLine(94), makeLine(104), makeLine(114), makeLine(124)];
    },
    getBoundingClientRect() {
      return { height: 330 };
    },
    getAttribute(name: string) {
      if (name === "height") return "220";
      return null;
    },
  } as unknown as SVGSVGElement;

  const geometry = inferStaffGeometryFromSvg(svg);
  expect(geometry).not.toBeNull();
  expect(geometry?.topLineY).toBe(84);
  expect(geometry?.spacingBetweenLines).toBe(10);
  expect(geometry?.scale).toBe(1.5);
});
