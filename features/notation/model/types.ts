export type ClefType = "treble" | "bass";

export type AccidentalSymbol = "#" | "b" | "n";

export interface StaffGeometry {
  topLineY: number;
  spacingBetweenLines: number;
  scale: number;
}

export interface NotationItem {
  key: string;
  accidental?: AccidentalSymbol;
}

export interface GradeResult {
  correct: string[];
  incorrect: string[];
  missing: string[];
  score: number;
}
