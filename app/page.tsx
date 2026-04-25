"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useAuthSession } from "@/features/auth/state/AuthProvider";
import { useExamDraft } from "@/features/exam/state/useExamDraft";

export default function Home() {
  const { user, isReady, isConfigured } = useAuthSession();
  const { draft, isHydrated, patchDraft } = useExamDraft();
  const canEnterExam = !isConfigured || Boolean(user?.emailVerified);
  const hasStartedExam =
    draft.keySignature.notes.length > 0 ||
    Boolean(draft.keySignature.result) ||
    draft.keySignatureCMinor.notes.length > 0 ||
    Boolean(draft.keySignatureCMinor.result) ||
    draft.scale.notes.length > 0 ||
    Boolean(draft.scale.result) ||
    draft.scaleBMinor.notes.length > 0 ||
    Boolean(draft.scaleBMinor.result) ||
    draft.identifyKeySignatures.answers.some((answer) => answer.trim().length > 0) ||
    Boolean(draft.identifyKeySignatures.result);

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
        <h1>Lydian Lab Music Theory Exam Demo</h1>
        <p>
          This example app simulates a timed online placement exam with VexFlow
          notation input, autosave, and final-score-only grading.
        </p>
      </section>

      <section className={styles.card}>
        <h2>What to Expect</h2>
        <div className={styles.grid}>
          <article className={styles.panel}>
            <p className={styles.panelTag}>Section 1</p>
            <h3>Key Signature Notation</h3>
            <p>Place the correct accidentals on the staff for two prompts.</p>
          </article>
          <article className={styles.panel}>
            <p className={styles.panelTag}>Section 2</p>
            <h3>Scale Notation</h3>
            <p>Build the requested scales in order with accurate accidentals.</p>
          </article>
          <article className={styles.panel}>
            <p className={styles.panelTag}>Section 3</p>
            <h3>Identify Key Signatures</h3>
            <p>Type key names using flexible formats such as Db or D flat.</p>
          </article>
          <article className={styles.panel}>
            <p className={styles.panelTag}>Scoring</p>
            <h3>Final Results Page</h3>
            <p>Answers are graded when you finish; no per-question score is shown.</p>
          </article>
        </div>
        <div className={styles.facts}>
          <p>
            <strong>Time Limit:</strong> 60 minutes
          </p>
          <p>
            <strong>Navigation:</strong> Next saves your current page automatically
          </p>
          <p>
            <strong>Save Behavior:</strong> Local draft + Firestore sync when signed in
          </p>
          <p>
            <strong>Feedback:</strong> Final summary appears only after submission
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
            Choose this before starting. Changing clef resets notation answers.
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <h2>First-Time Tips</h2>
        <ul className={styles.tips}>
          <li>Click directly on the staff to place notes or accidentals.</li>
          <li>Use the accidental buttons before placing each entry.</li>
          <li>Use Erase mode to remove entries; use Previous to review pages.</li>
          <li>Your progress is saved as you work, so you can safely navigate.</li>
        </ul>
      </section>

      <div className={styles.ctaWrap}>
        {canEnterExam ? (
          <Link href="/exam/1" className={styles.cta}>
            {isHydrated && hasStartedExam && !draft.submitted
              ? `Resume Exam (Page ${draft.currentPage})`
              : "Start Exam"}
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
