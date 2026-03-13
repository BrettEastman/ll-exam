"use client";

import { useEffect, useRef, useState } from "react";
import { Accidental, Renderer, Stave, StaveNote, TickContext } from "vexflow";
import { ensureVexFlowFonts } from "@/lib/vexflow-fonts";
import styles from "./KeySignatureExercise.module.css";

type Clef = "treble" | "bass";
type AccidentalType = "#" | "b";

interface PlacedAccidental {
  note: string;
  type: AccidentalType;
}

const EXPECTED_D_MAJOR: PlacedAccidental[] = [
  { note: "f/5", type: "#" },
  { note: "c/5", type: "#" },
];

const TREBLE_NOTES = ["f/5", "e/5", "d/5", "c/5", "b/4", "a/4", "g/4", "f/4", "e/4"];
const BASS_NOTES = ["a/3", "g/3", "f/3", "e/3", "d/3", "c/3", "b/2", "a/2", "g/2"];

export default function KeySignatureExercise() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<PlacedAccidental[]>([]);
  const [clef, setClef] = useState<Clef>("treble");
  const [accidental, setAccidental] = useState<AccidentalType>("#");
  const [eraseMode, setEraseMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

      placed.forEach((item, index) => {
        const vfNote = new StaveNote({
          clef,
          keys: [item.note],
          duration: "q",
        });
        vfNote.addModifier(new Accidental(item.type), 0);

        const tick = new TickContext();
        tick.addTickable(vfNote).preFormat().setX(56 + index * 44);
        vfNote.setStave(stave);
        vfNote.setContext(context);
        vfNote.draw();
      });
    };

    draw();
  }, [placed, clef]);

  const currentNotes = clef === "treble" ? TREBLE_NOTES : BASS_NOTES;

  const lineFromClick = (y: number) => {
    const vexY = y / 1.5;
    const top = 76.67;
    const spacing = 5;
    const line = Math.round((vexY - top) / spacing);
    return Math.max(0, Math.min(currentNotes.length - 1, line));
  };

  const onStaffClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || submitted) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const note = currentNotes[lineFromClick(y)];

    if (eraseMode) {
      setPlaced((prev) => prev.filter((entry) => entry.note !== note));
      return;
    }

    setPlaced((prev) => {
      const withoutNote = prev.filter((entry) => entry.note !== note);
      return [...withoutNote, { note, type: accidental }].slice(0, 7);
    });
  };

  const grade = () => {
    const expected = EXPECTED_D_MAJOR.map((item) => `${item.note}${item.type}`);
    const student = placed.map((item) => `${item.note}${item.type}`);
    const correct = student.filter((item) => expected.includes(item)).length;
    setScore(Math.round((correct / expected.length) * 100));
    setSubmitted(true);
  };

  const reset = () => {
    setPlaced([]);
    setScore(null);
    setSubmitted(false);
    setEraseMode(false);
    setAccidental("#");
  };

  return (
    <section className={styles.wrap}>
      <div className={styles.instructions}>
        <p>Place the correct accidentals for the D major key signature.</p>
        <p>Hint: D major requires two sharps (F# and C#).</p>
      </div>

      <div className={styles.controls}>
        <label>
          Clef
          <select value={clef} onChange={(e) => setClef(e.target.value as Clef)} disabled={submitted}>
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </label>

        <div className={styles.accidentals}>
          <button
            type="button"
            className={accidental === "#" && !eraseMode ? styles.active : ""}
            onClick={() => setAccidental("#")}
            disabled={submitted}
          >
            Sharp
          </button>
          <button
            type="button"
            className={accidental === "b" && !eraseMode ? styles.active : ""}
            onClick={() => setAccidental("b")}
            disabled={submitted}
          >
            Flat
          </button>
        </div>

        {!submitted && (
          <button
            type="button"
            className={eraseMode ? styles.eraseActive : ""}
            onClick={() => setEraseMode((prev) => !prev)}
          >
            {eraseMode ? "Erase Mode" : "Erase"}
          </button>
        )}

        {!submitted ? (
          <button type="button" onClick={grade} disabled={placed.length === 0}>
            Submit Key Signature
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
