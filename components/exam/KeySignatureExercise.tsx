"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./KeySignatureExercise.module.css";
import type {
  AccidentalSymbol,
  ClefType,
} from "@/features/notation/model/types";
import { KEY_SIGNATURE_MAX } from "@/features/notation/model/constants";
import {
  inferStaffGeometryFromSvg,
  keyFromLineIndex,
  lineIndexFromSvgClickY,
} from "@/features/notation/interaction/mapping";
import { drawStaff } from "@/features/notation/render/drawStaff";
import { moveLineIndex } from "@/features/notation/interaction/keyboard";
import type {
  KeySignatureDraftNote,
  SectionResult,
} from "@/features/exam/model/types";

type AccidentalType = Extract<AccidentalSymbol, "#" | "b">;

interface PlacedAccidental {
  note: string;
  type: AccidentalType;
}

interface KeySignatureExerciseProps {
  initialClef?: ClefType;
  clef?: ClefType;
  allowClefChange?: boolean;
  initialNotes?: KeySignatureDraftNote[];
  initialResult?: SectionResult | null;
  onDraftChange?: (payload: {
    clef: ClefType;
    notes: KeySignatureDraftNote[];
    result: SectionResult | null;
  }) => void;
  prompt?: string;
  keySignatureId?: "d-major" | "c-minor";
}

export default function KeySignatureExercise({
  initialClef = "treble",
  clef: forcedClef,
  allowClefChange = true,
  initialNotes = [],
  onDraftChange,
  prompt = "Place the correct accidentals for the D major key signature.",
}: KeySignatureExerciseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<PlacedAccidental[]>(
    initialNotes as PlacedAccidental[]
  );
  const [clef, setClef] = useState<ClefType>(initialClef);
  const [accidental, setAccidental] = useState<AccidentalType>("#");
  const [eraseMode, setEraseMode] = useState(false);
  const [cursorLine, setCursorLine] = useState(2);

  useEffect(() => {
    if (!forcedClef) return;
    setEraseMode(false);
    setClef(forcedClef);
  }, [forcedClef]);

  useEffect(() => {
    if (!containerRef.current) return;

    const draw = async () => {
      if (!containerRef.current) return;

      await drawStaff({
        container: containerRef.current,
        clef,
        kind: "keysig",
        items: placed.map((item) => ({
          key: item.note,
          accidental: item.type,
        })),
      });
    };

    draw();
  }, [placed, clef]);

  useEffect(() => {
    if (!onDraftChange) return;

    onDraftChange({
      clef,
      notes: placed,
      result: null,
    });
  }, [clef, placed, onDraftChange]);

  const onStaffClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const geometry = inferStaffGeometryFromSvg(svg) ?? undefined;
    const line = lineIndexFromSvgClickY(y, geometry);
    const note = keyFromLineIndex(clef, line);
    setCursorLine(line);

    if (eraseMode) {
      setPlaced((prev) => prev.filter((entry) => entry.note !== note));
      return;
    }

    setPlaced((prev) => {
      const withoutNote = prev.filter((entry) => entry.note !== note);
      return [...withoutNote, { note, type: accidental }].slice(
        0,
        KEY_SIGNATURE_MAX
      );
    });
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
      const note = keyFromLineIndex(clef, cursorLine);
      if (eraseMode) {
        setPlaced((prev) => prev.filter((entry) => entry.note !== note));
        return;
      }

      setPlaced((prev) => {
        const withoutNote = prev.filter((entry) => entry.note !== note);
        return [...withoutNote, { note, type: accidental }].slice(
          0,
          KEY_SIGNATURE_MAX
        );
      });
    }
  };

  const reset = () => {
    setPlaced([]);
    setEraseMode(false);
    setAccidental("#");
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
              onChange={(e) => {
                setEraseMode(false);
                setClef(e.target.value as ClefType);
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
        </div>

        <button
          type="button"
          className={eraseMode ? styles.eraseActive : ""}
          onClick={() => setEraseMode((prev) => !prev)}
        >
          {eraseMode ? "Erase Mode" : "Erase"}
        </button>

        <button type="button" onClick={reset} disabled={placed.length === 0}>
          Clear Notes
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
          aria-label="Key signature notation staff"
        />
      </div>
    </section>
  );
}
