"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import ScaleExercise from "../../../components/exam/ScaleExercise";
import KeySignatureExercise from "../../../components/exam/KeySignatureExercise";
import IdentifyKeySignaturesExercise from "../../../components/exam/IdentifyKeySignaturesExercise";
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

  const handleBMinorScaleDraftChange = useCallback(
    (scaleBMinor: (typeof draft)["scaleBMinor"]) => {
      patchDraft((prev) => {
        if (
          prev.scaleBMinor.clef === scaleBMinor.clef &&
          prev.scaleBMinor.result?.score === scaleBMinor.result?.score &&
          prev.scaleBMinor.result?.submittedAt === scaleBMinor.result?.submittedAt &&
          areScaleNotesEqual(prev.scaleBMinor.notes, scaleBMinor.notes)
        ) {
          return prev;
        }

        return {
          ...prev,
          scaleBMinor,
        };
      });
    },
    [patchDraft],
  );

  const handleCMinorKeySignatureDraftChange = useCallback(
    (keySignatureCMinor: (typeof draft)["keySignatureCMinor"]) => {
      patchDraft((prev) => {
        if (
          prev.keySignatureCMinor.clef === keySignatureCMinor.clef &&
          prev.keySignatureCMinor.result?.score === keySignatureCMinor.result?.score &&
          prev.keySignatureCMinor.result?.submittedAt ===
            keySignatureCMinor.result?.submittedAt &&
          areKeySignatureNotesEqual(
            prev.keySignatureCMinor.notes,
            keySignatureCMinor.notes,
          )
        ) {
          return prev;
        }

        return {
          ...prev,
          keySignatureCMinor,
        };
      });
    },
    [patchDraft],
  );

  const handleIdentifyKeySignaturesDraftChange = useCallback(
    (identifyKeySignatures: (typeof draft)["identifyKeySignatures"]) => {
      patchDraft((prev) => {
        const sameAnswers =
          prev.identifyKeySignatures.answers.length ===
            identifyKeySignatures.answers.length &&
          prev.identifyKeySignatures.answers.every(
            (value, index) => value === identifyKeySignatures.answers[index],
          );

        if (
          sameAnswers &&
          prev.identifyKeySignatures.result?.score ===
            identifyKeySignatures.result?.score &&
          prev.identifyKeySignatures.result?.submittedAt ===
            identifyKeySignatures.result?.submittedAt
        ) {
          return prev;
        }

        return {
          ...prev,
          identifyKeySignatures,
        };
      });
    },
    [patchDraft],
  );

  const { canFinish } = getExamProgress(draft);
  const hasStartedNotationExercise =
    draft.keySignature.notes.length > 0 ||
    Boolean(draft.keySignature.result) ||
    draft.keySignatureCMinor.notes.length > 0 ||
    Boolean(draft.keySignatureCMinor.result) ||
    draft.scale.notes.length > 0 ||
    Boolean(draft.scale.result) ||
    draft.scaleBMinor.notes.length > 0 ||
    Boolean(draft.scaleBMinor.result);

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

  const currentExam = EXAM_PAGE_META[currentPage as keyof typeof EXAM_PAGE_META];

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

  const handleClefChange = (nextClef: "treble" | "bass") => {
    patchDraft((prev) => {
      if (prev.selectedClef === nextClef) {
        return prev;
      }

      return {
        ...prev,
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
        {currentPage === 1 && (
          <div className={styles.clefSelectRow}>
            <label>
              Staff clef for notation sections
              <select
                value={draft.selectedClef}
                onChange={(event) =>
                  handleClefChange(event.target.value as "treble" | "bass")
                }
                disabled={hasStartedNotationExercise}
              >
                <option value="treble">Treble Clef</option>
                <option value="bass">Bass Clef</option>
              </select>
            </label>
            <p className={styles.clefHint}>
              This applies to both key signature and scale notation exercises.
            </p>
          </div>
        )}
      </header>

      <section>
        {currentPage === 1 ? (
          <KeySignatureExercise
            initialClef={draft.keySignature.clef}
            clef={draft.selectedClef}
            allowClefChange={false}
            initialNotes={draft.keySignature.notes}
            initialResult={draft.keySignature.result}
            onDraftChange={handleKeySignatureDraftChange}
          />
        ) : currentPage === 2 ? (
          <KeySignatureExercise
            initialClef={draft.keySignatureCMinor.clef}
            clef={draft.selectedClef}
            allowClefChange={false}
            initialNotes={draft.keySignatureCMinor.notes}
            initialResult={draft.keySignatureCMinor.result}
            onDraftChange={handleCMinorKeySignatureDraftChange}
            prompt="Place the correct accidentals for the C minor key signature."
            keySignatureId="c-minor"
          />
        ) : currentPage === 3 ? (
          <ScaleExercise
            initialClef={draft.scale.clef}
            clef={draft.selectedClef}
            allowClefChange={false}
            initialNotes={draft.scale.notes}
            initialResult={draft.scale.result}
            onDraftChange={handleScaleDraftChange}
          />
        ) : currentPage === 4 ? (
          <ScaleExercise
            initialClef={draft.scaleBMinor.clef}
            clef={draft.selectedClef}
            allowClefChange={false}
            initialNotes={draft.scaleBMinor.notes}
            initialResult={draft.scaleBMinor.result}
            onDraftChange={handleBMinorScaleDraftChange}
            prompt="Enter the B natural minor scale in order."
            scaleId="b-minor"
          />
        ) : (
          <IdentifyKeySignaturesExercise
            initialAnswers={draft.identifyKeySignatures.answers}
            initialResult={draft.identifyKeySignatures.result}
            onDraftChange={handleIdentifyKeySignaturesDraftChange}
            clef={draft.selectedClef}
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
