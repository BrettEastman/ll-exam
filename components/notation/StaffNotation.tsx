"use client";

import { useEffect, useRef, useState } from "react";
import { Accidental, Renderer, Stave, StaveNote, TickContext } from "vexflow";
import { ensureVexFlowFonts } from "@/lib/vexflow-fonts";
import styles from "./StaffNotation.module.css";

type Clef = "treble" | "bass";

interface PlacedNote {
  line: number;
  accidental?: string;
}

const D_MAJOR_SCALE = ["d", "e", "f#", "g", "a", "b", "c#"];
const MAX_NOTES = 7;

export default function StaffNotation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);
  const [clef, setClef] = useState<Clef>("treble");
  const [accidental, setAccidental] = useState<string | null>(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const draw = async () => {
      await ensureVexFlowFonts();
      if (!containerRef.current) return;

      containerRef.current.innerHTML = "";
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
      renderer.resize(640, 220);

      const context = renderer.getContext();
      const stave = new Stave(10, 44, 620);
      stave.addClef(clef);
      stave.setContext(context).draw();

      placedNotes.forEach((note, index) => {
        const key = getNoteName(note.line, clef);
        const vfNote = new StaveNote({ clef, keys: [key], duration: "q" });
        if (note.accidental) {
          vfNote.addModifier(new Accidental(note.accidental), 0);
        }
        const tick = new TickContext();
        tick.addTickable(vfNote).preFormat().setX(60 + index * 75);
        vfNote.setStave(stave);
        vfNote.setContext(context);
        vfNote.draw();
      });
    };

    draw();
  }, [placedNotes, clef]);

  const getNoteName = (line: number, currentClef: Clef): string => {
    const treble = [
      "g/5",
      "f/5",
      "e/5",
      "d/5",
      "c/5",
      "b/4",
      "a/4",
      "g/4",
      "f/4",
      "e/4",
      "d/4",
      "c/4",
      "b/3",
    ];
    const bass = [
      "b/3",
      "a/3",
      "g/3",
      "f/3",
      "e/3",
      "d/3",
      "c/3",
      "b/2",
      "a/2",
      "g/2",
      "f/2",
      "e/2",
      "d/2",
    ];

    const notes = currentClef === "treble" ? treble : bass;
    return notes[Math.max(0, Math.min(12, line))];
  };

  const getLineFromClick = (y: number) => {
    const vexflowY = y / 1.5;
    const staffTop = 76.67;
    const spacing = 5;
    return Math.max(0, Math.min(12, Math.round((vexflowY - staffTop) / spacing)));
  };

  const onStaffClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isSubmitted) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const line = getLineFromClick(clickY);

    if (eraseMode) {
      setPlacedNotes((prev) => prev.slice(0, -1));
      return;
    }

    if (placedNotes.length < MAX_NOTES) {
      setPlacedNotes((prev) => [...prev, { line, accidental: accidental || undefined }]);
    }
  };

  const grade = () => {
    const actual = placedNotes.map((note) => {
      const [name] = getNoteName(note.line, clef).split("/");
      return `${name}${note.accidental || ""}`;
    });

    const correct = actual.filter((note, idx) => D_MAJOR_SCALE[idx] === note).length;
    setScore(Math.round((correct / D_MAJOR_SCALE.length) * 100));
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
            onChange={(e) => setClef(e.target.value as Clef)}
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
            Submit Scale ({placedNotes.length}/{MAX_NOTES})
          </button>
        ) : (
          <button type="button" onClick={reset}>
            Try Again
          </button>
        )}
      </div>

      <div className={styles.canvasWrap}>
        <div ref={containerRef} className="vexflow-container" onClick={onStaffClick} />
      </div>

      {score !== null && (
        <p className={styles.result}>
          Score: <strong>{score}%</strong>
        </p>
      )}
    </section>
  );
}
