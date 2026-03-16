"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ScaleExercise from "../../../components/exam/ScaleExercise";
import KeySignatureExercise from "../../../components/exam/KeySignatureExercise";
import ExamNavigation from "../../../components/exam/ExamNavigation";
import styles from "./page.module.css";
import {
  EXAM_PAGE_META,
  EXAM_TOTAL_PAGES,
} from "@/features/exam/model/constants";
import { useExamTimer } from "@/features/exam/state/useExamTimer";
import { useExamDraft } from "@/features/exam/state/useExamDraft";
import { useExamAccess } from "@/features/exam/state/useExamAccess";
import { clearDraft } from "@/features/exam/persistence/draft";
import type { KeySignatureDraftNote, ScaleDraftNote } from "@/features/exam/model/types";

function areScaleNotesEqual(a: ScaleDraftNote[], b: ScaleDraftNote[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].key !== b[i].key || a[i].accidental !== b[i].accidental) {
      return false;
    }
  }
  return true;
}

function areKeySignatureNotesEqual(
  a: KeySignatureDraftNote[],
  b: KeySignatureDraftNote[]
) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].note !== b[i].note || a[i].type !== b[i].type) {
      return false;
    }
  }
  return true;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const currentPage = parseInt(params.page as string);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const { draft, isHydrated, patchDraft, syncStatus, syncMessage } = useExamDraft();
  const access = useExamAccess();
  const timer = useExamTimer(draft.startedAt, draft.submitted);

  const handleScaleDraftChange = useCallback(
    (scale: (typeof draft)["scale"]) => {
      patchDraft((prev) => {
        if (
          prev.scale.clef === scale.clef &&
          prev.scale.result?.score === scale.result?.score &&
          prev.scale.result?.submittedAt === scale.result?.submittedAt &&
          areScaleNotesEqual(prev.scale.notes, scale.notes)
        ) {
          return prev;
        }

        return {
          ...prev,
          scale,
        };
      });
    },
    [patchDraft]
  );

  const handleKeySignatureDraftChange = useCallback(
    (keySignature: (typeof draft)["keySignature"]) => {
      patchDraft((prev) => {
        if (
          prev.keySignature.clef === keySignature.clef &&
          prev.keySignature.result?.score === keySignature.result?.score &&
          prev.keySignature.result?.submittedAt === keySignature.result?.submittedAt &&
          areKeySignatureNotesEqual(prev.keySignature.notes, keySignature.notes)
        ) {
          return prev;
        }

        return {
          ...prev,
          keySignature,
        };
      });
    },
    [patchDraft]
  );

  const scaleCompleted = Boolean(draft.scale.result);
  const keySignatureCompleted = Boolean(draft.keySignature.result);
  const canFinish = scaleCompleted && keySignatureCompleted;

  const totalScore =
    draft.scale.result && draft.keySignature.result
      ? Math.round((draft.scale.result.score + draft.keySignature.result.score) / 2)
      : null;

  // Redirect invalid pages
  useEffect(() => {
    if (
      isNaN(currentPage) ||
      currentPage < 1 ||
      currentPage > EXAM_TOTAL_PAGES
    ) {
      router.push("/exam/1");
    }
  }, [currentPage, router]);

  useEffect(() => {
    if (!access.isReady) return;
    if (access.shouldRedirectToAuth) {
      router.replace("/auth");
    }
  }, [access.isReady, access.shouldRedirectToAuth, router]);

  useEffect(() => {
    if (!isHydrated || draft.submitted) return;
    if (draft.currentPage !== currentPage) {
      patchDraft((prev) => ({ ...prev, currentPage }));
    }
  }, [currentPage, draft.currentPage, draft.submitted, isHydrated, patchDraft]);

  useEffect(() => {
    if (!isHydrated || draft.submitted || !timer.isExpired) return;

    patchDraft((prev) => ({
      ...prev,
      submitted: true,
      autoSubmitted: true,
    }));
    setSummaryOpen(true);
  }, [isHydrated, draft.submitted, timer.isExpired, patchDraft]);

  if (
    isNaN(currentPage) ||
    currentPage < 1 ||
    currentPage > EXAM_TOTAL_PAGES
  ) {
    return <main className={styles.examPage}>Loading...</main>;
  }

  if (!isHydrated) {
    return <main className={styles.examPage}>Loading exam...</main>;
  }

  if (!access.isReady || !access.isAllowed) {
    return <main className={styles.examPage}>Preparing exam access...</main>;
  }

  const currentExam = EXAM_PAGE_META[currentPage as 1 | 2];

  const handleNext = () => {
    if (currentPage < EXAM_TOTAL_PAGES) {
      router.push(`/exam/${currentPage + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      router.push(`/exam/${currentPage - 1}`);
    }
  };

  const handleFinish = () => {
    patchDraft((prev) => ({
      ...prev,
      submitted: true,
      autoSubmitted: false,
    }));
    setSummaryOpen(true);
  };

  const startNewAttempt = () => {
    clearDraft();
    router.push("/exam/1");
    router.refresh();
  };

  return (
    <main className={styles.examPage}>
      <header className={styles.header}>
        <h1>LydianLab Music Theory Exam</h1>
        <div className={styles.titleRow}>
          <h2>{currentExam.title}</h2>
          <p>
            Page {currentPage} of {EXAM_TOTAL_PAGES}
          </p>
        </div>
        <p className={styles.description}>{currentExam.description}</p>
        <p className={styles.timer}>Time Remaining: {timer.label}</p>
        <p
          className={
            syncStatus === "error"
              ? `${styles.sync} ${styles.syncError}`
              : syncStatus === "offline"
              ? `${styles.sync} ${styles.syncOffline}`
              : styles.sync
          }
        >
          Sync: {syncStatus}
          {syncMessage ? ` — ${syncMessage}` : ""}
        </p>
      </header>

      <section>
        {currentPage === 1 ? (
          <ScaleExercise
            initialClef={draft.scale.clef}
            initialNotes={draft.scale.notes}
            initialResult={draft.scale.result}
            onDraftChange={handleScaleDraftChange}
          />
        ) : (
          <KeySignatureExercise
            initialClef={draft.keySignature.clef}
            initialNotes={draft.keySignature.notes}
            initialResult={draft.keySignature.result}
            onDraftChange={handleKeySignatureDraftChange}
          />
        )}
      </section>

      <ExamNavigation
        currentPage={currentPage}
        totalPages={EXAM_TOTAL_PAGES}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFinish={handleFinish}
        finishDisabled={!canFinish || draft.submitted}
      />

      {(summaryOpen || draft.submitted) && (
        <section className={styles.summary}>
          <h3>Exam Summary</h3>
          <p>
            Submission Type: {draft.autoSubmitted ? "Auto-submit" : "Manual submit"}
          </p>
          <p>Scale Score: {draft.scale.result?.score ?? 0}%</p>
          <p>Key Signature Score: {draft.keySignature.result?.score ?? 0}%</p>
          <p>
            <strong>Overall Score: {totalScore ?? 0}%</strong>
          </p>
          <button type="button" className={styles.newAttempt} onClick={startNewAttempt}>
            Start New Attempt
          </button>
        </section>
      )}
    </main>
  );
}
