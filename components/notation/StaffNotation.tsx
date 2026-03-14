"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./StaffNotation.module.css";
import type {
  AccidentalSymbol,
  ClefType,
} from "@/features/notation/model/types";
import { SCALE_NOTES_MAX } from "@/features/notation/model/constants";
import {
  keyFromLineIndex,
  lineIndexFromSvgClickY,
} from "@/features/notation/interaction/mapping";
import { moveLineIndex } from "@/features/notation/interaction/keyboard";
import {
  gradeScaleAttempt,
  normalizeKeyToPitchClass,
} from "@/features/notation/grading/gradeScale";
import { drawStaff } from "@/features/notation/render/drawStaff";

interface PlacedNote {
  key: string;
  accidental?: AccidentalSymbol;
}

export default function StaffNotation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);
  const [clef, setClef] = useState<ClefType>("treble");
  const [accidental, setAccidental] = useState<AccidentalSymbol | null>(null);
  const [cursorLine, setCursorLine] = useState(6);
  const [eraseMode, setEraseMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const draw = async () => {
      if (!containerRef.current) return;

      await drawStaff({
        container: containerRef.current,
        clef,
        kind: "scale",
        items: placedNotes,
      });
    };

    draw();
  }, [placedNotes, clef]);

  const onStaffClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isSubmitted) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const line = lineIndexFromSvgClickY(clickY);
    const key = keyFromLineIndex(clef, line);
    setCursorLine(line);

    if (eraseMode) {
      setPlacedNotes((prev) => prev.slice(0, -1));
      return;
    }

    if (placedNotes.length < SCALE_NOTES_MAX) {
      setPlacedNotes((prev) => [
        ...prev,
        { key, accidental: accidental || undefined },
      ]);
    }
  };

  const onNotationKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isSubmitted) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursorLine((line) => moveLineIndex(line, "up", clef));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursorLine((line) => moveLineIndex(line, "down", clef));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (eraseMode) {
        setPlacedNotes((prev) => prev.slice(0, -1));
        return;
      }

      if (placedNotes.length < SCALE_NOTES_MAX) {
        const key = keyFromLineIndex(clef, cursorLine);
        setPlacedNotes((prev) => [
          ...prev,
          { key, accidental: accidental || undefined },
        ]);
      }
    }
  };

  const grade = () => {
    const actual = placedNotes.map((note) =>
      normalizeKeyToPitchClass(note.key, note.accidental)
    );
    const result = gradeScaleAttempt(actual);
    setScore(result.score);
    setIsSubmitted(true);
  };

  const reset = () => {
    setPlacedNotes([]);
    setScore(null);
    setIsSubmitted(false);
    setEraseMode(false);
    setAccidental(null);
  };

  return (
    <section className={styles.wrap}>
      <div className={styles.instructions}>
        <p>
          Enter the D major scale in order: D, E, F#, G, A, B, C#. Octave does
          not matter.
        </p>
      </div>

      <div className={styles.controls}>
        <label>
          Clef
          <select
            value={clef}
            onChange={(e) => setClef(e.target.value as ClefType)}
            disabled={isSubmitted}
          >
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </label>

        <div className={styles.accidentals}>
          <button
            type="button"
            className={accidental === null && !eraseMode ? styles.active : ""}
            onClick={() => setAccidental(null)}
            disabled={isSubmitted}
          >
            None
          </button>
          <button
            type="button"
            className={accidental === "#" && !eraseMode ? styles.active : ""}
            onClick={() => setAccidental("#")}
            disabled={isSubmitted}
          >
            Sharp
          </button>
          <button
            type="button"
            className={accidental === "b" && !eraseMode ? styles.active : ""}
            onClick={() => setAccidental("b")}
            disabled={isSubmitted}
          >
            Flat
          </button>
          <button
            type="button"
            className={accidental === "n" && !eraseMode ? styles.active : ""}
            onClick={() => setAccidental("n")}
            disabled={isSubmitted}
          >
            Natural
          </button>
        </div>

        {!isSubmitted && (
          <button
            type="button"
            onClick={() => setEraseMode((prev) => !prev)}
            className={eraseMode ? styles.eraseActive : ""}
          >
            {eraseMode ? "Erase Mode" : "Erase"}
          </button>
        )}

        {!isSubmitted ? (
          <button type="button" onClick={grade} disabled={placedNotes.length === 0}>
            Submit Scale ({placedNotes.length}/{SCALE_NOTES_MAX})
          </button>
        ) : (
          <button type="button" onClick={reset}>
            Try Again
          </button>
        )}
      </div>

      <div className={styles.canvasWrap}>
        <div
          ref={containerRef}
          className="vexflow-container"
          onClick={onStaffClick}
          onKeyDown={onNotationKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Scale notation staff"
        />
      </div>

      {score !== null && (
        <p className={styles.result}>
          Score: <strong>{score}%</strong>
        </p>
      )}
    </section>
  );
}
