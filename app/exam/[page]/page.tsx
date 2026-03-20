"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
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
import type {
  KeySignatureDraftNote,
  ScaleDraftNote,
} from "@/features/exam/model/types";
import { getExamProgress } from "@/features/exam/model/flow";

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
  b: KeySignatureDraftNote[],
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
  const { draft, isHydrated, patchDraft } = useExamDraft();
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
    [patchDraft],
  );

  const handleKeySignatureDraftChange = useCallback(
    (keySignature: (typeof draft)["keySignature"]) => {
      patchDraft((prev) => {
        if (
          prev.keySignature.clef === keySignature.clef &&
          prev.keySignature.result?.score === keySignature.result?.score &&
          prev.keySignature.result?.submittedAt ===
            keySignature.result?.submittedAt &&
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
    [patchDraft],
  );

  const { canFinish } = getExamProgress(draft);

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
    router.replace("/exam/results");
  }, [isHydrated, draft.submitted, timer.isExpired, patchDraft, router]);

  useEffect(() => {
    if (!isHydrated || !draft.submitted || timer.isExpired) return;
    router.replace("/exam/results");
  }, [draft.submitted, isHydrated, router, timer.isExpired]);

  if (isNaN(currentPage) || currentPage < 1 || currentPage > EXAM_TOTAL_PAGES) {
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
    router.push("/exam/results");
  };

  return (
    <main className={styles.examPage}>
      <header className={styles.header}>
        <h1>Lydian Lab Music Theory Exam</h1>
        <div className={styles.titleRow}>
          <h2>{currentExam.title}</h2>
          <p>
            Page {currentPage} of {EXAM_TOTAL_PAGES}
          </p>
        </div>
        <p className={styles.description}>{currentExam.description}</p>
        <p className={styles.timer}>Time Remaining: {timer.label}</p>
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
        finishDisabled={!canFinish}
      />
    </main>
  );
}
