"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IdentifyKeySignaturesExercise.module.css";
import type { SectionResult } from "@/features/exam/model/types";
import {
  IDENTIFY_KEY_SIGNATURE_PROMPTS,
} from "@/features/notation/grading/gradeIdentifyKeySignatures";
import { drawKeySignaturePrompt } from "@/features/notation/render/drawKeySignaturePrompt";

interface IdentifyKeySignaturesExerciseProps {
  initialAnswers?: string[];
  initialResult?: SectionResult | null;
  clef?: "treble" | "bass";
  onDraftChange?: (payload: { answers: string[]; result: SectionResult | null }) => void;
}

export default function IdentifyKeySignaturesExercise({
  initialAnswers = [],
  clef = "treble",
  onDraftChange,
}: IdentifyKeySignaturesExerciseProps) {
  const [answers, setAnswers] = useState<string[]>(
    IDENTIFY_KEY_SIGNATURE_PROMPTS.map((_, index) => initialAnswers[index] ?? ""),
  );
  const staffRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    IDENTIFY_KEY_SIGNATURE_PROMPTS.forEach((prompt, index) => {
      const container = staffRefs.current[index];
      if (!container) return;
      void drawKeySignaturePrompt({ container, keySpec: prompt.keySpec, clef });
    });
  }, [clef]);

  useEffect(() => {
    if (!onDraftChange) return;
    onDraftChange({
      answers,
      result: null,
    });
  }, [answers, onDraftChange]);

  const onChange = (index: number, value: string) => {
    setAnswers((prev) => prev.map((entry, i) => (i === index ? value : entry)));
  };

  const reset = () => {
    setAnswers(IDENTIFY_KEY_SIGNATURE_PROMPTS.map(() => ""));
  };

  return (
    <section className={styles.wrap}>
      <div className={styles.instructions}>
        <p>Identify the key signature shown in each staff.</p>
      </div>

      <div className={styles.grid}>
        {IDENTIFY_KEY_SIGNATURE_PROMPTS.map((prompt, index) => (
          <div key={`${prompt.tonic}-${prompt.mode}`} className={styles.card}>
            <div
              ref={(node) => {
                staffRefs.current[index] = node;
              }}
              className={styles.staff}
            />
            <label className={styles.answer}>
              <input
                type="text"
                value={answers[index] ?? ""}
                onChange={(event) => onChange(index, event.target.value)}
              />
              <span>{prompt.mode}</span>
            </label>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={reset}>
          Clear Answers
        </button>
      </div>
    </section>
  );
}
