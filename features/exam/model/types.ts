import type { AccidentalSymbol, ClefType } from "@/features/notation/model/types";

export interface ScaleDraftNote {
  key: string;
  accidental?: AccidentalSymbol;
}

export interface KeySignatureDraftNote {
  note: string;
  type: Extract<AccidentalSymbol, "#" | "b">;
}

export interface SectionResult {
  score: number;
  submittedAt: number;
}

export interface ExamDraft {
  startedAt: number;
  updatedAt: number;
  currentPage: number;
  submitted: boolean;
  autoSubmitted: boolean;
  scale: {
    clef: ClefType;
    notes: ScaleDraftNote[];
    result: SectionResult | null;
  };
  keySignature: {
    clef: ClefType;
    notes: KeySignatureDraftNote[];
    result: SectionResult | null;
  };
  scaleBMinor: {
    clef: ClefType;
    notes: ScaleDraftNote[];
    result: SectionResult | null;
  };
  keySignatureCMinor: {
    clef: ClefType;
    notes: KeySignatureDraftNote[];
    result: SectionResult | null;
  };
  identifyKeySignatures: {
    answers: string[];
    result: SectionResult | null;
  };
}

export type ExamSyncStatus =
  | "disabled"
  | "idle"
  | "loading"
  | "syncing"
  | "synced"
  | "offline"
  | "error";
