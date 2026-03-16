import assert from "node:assert/strict";
import test from "node:test";
import { keyFromLineIndex, lineIndexFromSvgClickY } from "./mapping";

function yForIndex(index: number): number {
  const topLineY = 74;
  const halfStep = 5;
  const scale = 1.5;
  return (topLineY + (index + 1) * halfStep) * scale;
}

test("maps click Y back to expected line indices", () => {
  for (const index of [0, 1, 4, 6, 9, 10, 12]) {
    assert.equal(lineIndexFromSvgClickY(yForIndex(index)), index);
  }
});

test("maps treble click targets to expected notes", () => {
  const trebleE = keyFromLineIndex("treble", lineIndexFromSvgClickY(yForIndex(9)));
  const trebleD = keyFromLineIndex("treble", lineIndexFromSvgClickY(yForIndex(10)));

  assert.equal(trebleE, "e/4");
  assert.equal(trebleD, "d/4");
});

test("maps bass click targets to expected notes", () => {
  const bassE = keyFromLineIndex("bass", lineIndexFromSvgClickY(yForIndex(4)));
  const bassD = keyFromLineIndex("bass", lineIndexFromSvgClickY(yForIndex(5)));

  assert.equal(bassE, "e/3");
  assert.equal(bassD, "d/3");
});
