import StaffNotation from "../notation/StaffNotation";
import type { ScaleDraftNote, SectionResult } from "@/features/exam/model/types";

interface ScaleExerciseProps {
  initialClef?: "treble" | "bass";
  clef?: "treble" | "bass";
  allowClefChange?: boolean;
  initialNotes?: ScaleDraftNote[];
  initialResult?: SectionResult | null;
  onDraftChange?: (payload: {
    clef: "treble" | "bass";
    notes: ScaleDraftNote[];
    result: SectionResult | null;
  }) => void;
  prompt?: string;
  scaleId?: "d-major" | "b-minor";
}

export default function ScaleExercise(props: ScaleExerciseProps) {
  return <StaffNotation {...props} />;
}
