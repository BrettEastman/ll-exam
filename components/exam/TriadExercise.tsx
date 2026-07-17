"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../notation/StaffNotation.module.css";
import type {
  AccidentalSymbol,
  ClefType,
} from "@/features/notation/model/types";
import {
  inferStaffGeometryFromSvg,
  keyFromLineIndex,
  lineIndexFromSvgClickY,
} from "@/features/notation/interaction/mapping";
import { drawStaff } from "@/features/notation/render/drawStaff";
import { moveLineIndex } from "@/features/notation/interaction/keyboard";
import type { ScaleDraftNote, SectionResult } from "@/features/exam/model/types";

interface TriadExerciseProps {
  initialClef?: ClefType;
  clef?: ClefType;
  allowClefChange?: boolean;
  initialNotes?: ScaleDraftNote[];
  initialResult?: SectionResult | null;
  onDraftChange?: (payload: {
    clef: ClefType;
    notes: ScaleDraftNote[];
    result: SectionResult | null;
  }) => void;
  prompt?: string;
}

function normalizeTriadNote(item: ScaleDraftNote): string {
  return `${item.key}:${item.accidental ?? ""}`;
}

export default function TriadExercise({
  initialClef = "treble",
  clef: forcedClef,
  allowClefChange = true,
  initialNotes = [],
  onDraftChange,
  prompt = "Notate the requested triad using stacked chord tones.",
}: TriadExerciseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localClef, setLocalClef] = useState<ClefType>(initialClef);
  const clef = forcedClef ?? localClef;
  const [notes, setNotes] = useState<ScaleDraftNote[]>(initialNotes);
  const [accidental, setAccidental] = useState<AccidentalSymbol | null>(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [cursorLine, setCursorLine] = useState(6);

  useEffect(() => {
    if (!containerRef.current) return;

    void drawStaff({
      container: containerRef.current,
      clef,
      kind: "triad",
      items: notes,
    });
  }, [clef, notes]);

  useEffect(() => {
    if (!onDraftChange) return;
    onDraftChange({
      clef,
      notes,
      result: null,
    });
  }, [clef, notes, onDraftChange]);

  const notesCountLabel = useMemo(() => `${notes.length}/3`, [notes.length]);

  const upsertNote = (key: string) => {
    setNotes((prev) => {
      if (eraseMode) {
        return prev.filter((item) => item.key !== key);
      }

      const nextNote: ScaleDraftNote = { key, accidental: accidental ?? undefined };
      const nextId = normalizeTriadNote(nextNote);
      if (prev.some((item) => normalizeTriadNote(item) === nextId)) {
        return prev;
      }

      const withoutSamePitch = prev.filter((item) => item.key !== key);
      if (withoutSamePitch.length >= 3) {
        return withoutSamePitch;
      }

      return [...withoutSamePitch, nextNote];
    });
  };

  const onStaffClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const geometry = inferStaffGeometryFromSvg(svg) ?? undefined;
    const line = lineIndexFromSvgClickY(clickY, geometry);
    const key = keyFromLineIndex(clef, line);
    setCursorLine(line);
    upsertNote(key);
  };

  const onNotationKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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
      const key = keyFromLineIndex(clef, cursorLine);
      upsertNote(key);
    }
  };

  const clear = () => {
    setNotes([]);
    setEraseMode(false);
    setAccidental(null);
  };

  return (
    <section className={styles.wrap}>
      <p className={styles.prompt}>{prompt}</p>
      <div className={styles.controls}>
        {allowClefChange && (
          <label>
            Clef
            <select
              value={clef}
              onChange={(event) => {
                setEraseMode(false);
                setLocalClef(event.target.value as ClefType);
              }}
            >
              <option value="treble">Treble</option>
              <option value="bass">Bass</option>
            </select>
          </label>
        )}

        <div className={styles.accidentals}>
          <button
            type="button"
            className={accidental === null && !eraseMode ? styles.active : ""}
            onClick={() => {
              setEraseMode(false);
              setAccidental(null);
            }}
          >
            None
          </button>
          <button
            type="button"
            className={accidental === "#" && !eraseMode ? styles.active : ""}
            onClick={() => {
              setEraseMode(false);
              setAccidental("#");
            }}
          >
            Sharp
          </button>
          <button
            type="button"
            className={accidental === "b" && !eraseMode ? styles.active : ""}
            onClick={() => {
              setEraseMode(false);
              setAccidental("b");
            }}
          >
            Flat
          </button>
          <button
            type="button"
            className={accidental === "n" && !eraseMode ? styles.active : ""}
            onClick={() => {
              setEraseMode(false);
              setAccidental("n");
            }}
          >
            Natural
          </button>
        </div>

        <button
          type="button"
          onClick={() => setEraseMode((prev) => !prev)}
          className={eraseMode ? styles.eraseActive : ""}
        >
          {eraseMode ? "Erase Mode" : "Erase"}
        </button>

        <button type="button" onClick={clear} disabled={notes.length === 0}>
          Clear Notes ({notesCountLabel})
        </button>
      </div>

      <div className={styles.canvasWrap}>
        <div
          ref={containerRef}
          className="vexflow-container"
          onClick={onStaffClick}
          onKeyDown={onNotationKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Triad notation staff"
        />
      </div>
    </section>
  );
}
