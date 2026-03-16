import StaffNotation from "../notation/StaffNotation";
import type { ScaleDraftNote, SectionResult } from "@/features/exam/model/types";

interface ScaleExerciseProps {
  initialClef?: "treble" | "bass";
  initialNotes?: ScaleDraftNote[];
  initialResult?: SectionResult | null;
  onDraftChange?: (payload: {
    clef: "treble" | "bass";
    notes: ScaleDraftNote[];
    result: SectionResult | null;
  }) => void;
}

export default function ScaleExercise(props: ScaleExerciseProps) {
  return <StaffNotation {...props} />;
}
