"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useAuthSession } from "@/features/auth/state/AuthProvider";
import { useExamDraft } from "@/features/exam/state/useExamDraft";

export default function Home() {
  const { user, isReady, isConfigured } = useAuthSession();
  const { draft, isHydrated, patchDraft } = useExamDraft();
  const canEnterExam = !isConfigured || Boolean(user?.emailVerified);
  const hasStartedNotationExercise =
    draft.keySignature.notes.length > 0 ||
    Boolean(draft.keySignature.result) ||
    draft.keySignatureCMinor.notes.length > 0 ||
    Boolean(draft.keySignatureCMinor.result) ||
    draft.scale.notes.length > 0 ||
    Boolean(draft.scale.result) ||
    draft.scaleBMinor.notes.length > 0 ||
    Boolean(draft.scaleBMinor.result);

  const handleClefChange = (nextClef: "treble" | "bass") => {
    patchDraft((prev) => {
      if (prev.selectedClef === nextClef) {
        return prev;
      }

      return {
        ...prev,
        currentPage: 1,
        selectedClef: nextClef,
        keySignature: {
          clef: nextClef,
          notes: [],
          result: null,
        },
        keySignatureCMinor: {
          clef: nextClef,
          notes: [],
          result: null,
        },
        scale: {
          clef: nextClef,
          notes: [],
          result: null,
        },
        scaleBMinor: {
          clef: nextClef,
          notes: [],
          result: null,
        },
      };
    });
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Lydian Lab</p>
        <h1>Lydian Lab Music Theory Entrance Exam</h1>
        <p>
          A two-part notation assessment for class placement. The exam focuses
          on scale construction and key signature fluency.
        </p>
      </section>

      <section className={styles.card}>
        <h2>Exam Structure</h2>
        <div className={styles.grid}>
          <article className={styles.panel}>
            <p className={styles.panelTag}>Section 1</p>
            <h3>Scale Notation</h3>
            <p>Enter the D major scale using correct accidentals and order.</p>
          </article>
          <article className={styles.panel}>
            <p className={styles.panelTag}>Section 2</p>
            <h3>Key Signature Notation</h3>
            <p>Place sharps or flats in accurate staff positions.</p>
          </article>
        </div>
        <div className={styles.facts}>
          <p>
            <strong>Time Limit:</strong> 60 minutes
          </p>
          <p>
            <strong>Save Behavior:</strong> Auto-save enabled
          </p>
          <p>
            <strong>Feedback:</strong> Immediate section results
          </p>
        </div>

        <div className={styles.clefPicker}>
          <label>
            Notation clef
            <select
              value={draft.selectedClef}
              onChange={(event) =>
                handleClefChange(event.target.value as "treble" | "bass")
              }
            >
              <option value="treble">Treble Clef</option>
              <option value="bass">Bass Clef</option>
            </select>
          </label>
          <p>
            Choose this before starting. It applies to all notation exercises.
          </p>
        </div>
      </section>

      <div className={styles.ctaWrap}>
        {canEnterExam ? (
          <Link href="/exam/1" className={styles.cta}>
            Start Exam
          </Link>
        ) : (
          <Link href="/auth" className={styles.cta}>
            Sign In to Start
          </Link>
        )}
      </div>

      {isReady && isConfigured && !canEnterExam && (
        <p className={styles.authHint}>
          Sign in and verify your email to sync progress across devices.
        </p>
      )}
    </main>
  );
}
