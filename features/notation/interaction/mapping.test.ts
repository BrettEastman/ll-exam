import { expect, test } from "bun:test";
import { keyFromLineIndex, lineIndexFromSvgClickY } from "./mapping";

function yForIndex(index: number): number {
  const topLineY = 74;
  const halfStep = 5;
  const scale = 1.5;
  return (topLineY + (index + 1) * halfStep) * scale;
}

test("maps click Y back to expected line indices", () => {
  for (const index of [0, 1, 4, 6, 9, 10, 12]) {
    expect(lineIndexFromSvgClickY(yForIndex(index))).toBe(index);
  }
});

test("maps treble click targets to expected notes", () => {
  const trebleE = keyFromLineIndex("treble", lineIndexFromSvgClickY(yForIndex(9)));
  const trebleD = keyFromLineIndex("treble", lineIndexFromSvgClickY(yForIndex(10)));

  expect(trebleE).toBe("e/4");
  expect(trebleD).toBe("d/4");
});

test("maps bass click targets to expected notes", () => {
  const bassE = keyFromLineIndex("bass", lineIndexFromSvgClickY(yForIndex(4)));
  const bassD = keyFromLineIndex("bass", lineIndexFromSvgClickY(yForIndex(5)));

  expect(bassE).toBe("e/3");
  expect(bassD).toBe("d/3");
});
