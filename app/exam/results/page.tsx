"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useExamAccess } from "@/features/exam/state/useExamAccess";
import { getExamProgress } from "@/features/exam/model/flow";
import { buildExamReview } from "@/features/exam/model/review";
import { clearDraft } from "@/features/exam/persistence/draft";
import { useExamDraft } from "@/features/exam/state/useExamDraft";
import { useAuthSession } from "@/features/auth/state/AuthProvider";

export default function ExamResultsPage() {
  const router = useRouter();
  const { draft, isHydrated } = useExamDraft();
  const access = useExamAccess();
  const { user, isReady: isAuthReady, isConfigured, signOut } = useAuthSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { totalScore } = getExamProgress(draft);
  const reviewSections = buildExamReview(draft);

  useEffect(() => {
    if (!access.isReady) return;
    if (access.shouldRedirectToAuth) {
      router.replace("/auth");
    }
  }, [access.isReady, access.shouldRedirectToAuth, router]);

  useEffect(() => {
    if (!isHydrated || draft.submitted) return;
    router.replace(`/exam/${draft.currentPage}`);
  }, [draft.currentPage, draft.submitted, isHydrated, router]);

  const startNewAttempt = () => {
    clearDraft();
    router.push("/exam/1");
    router.refresh();
  };

  const handleSignOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSignOutError("Could not sign out right now. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isHydrated) {
    return <main className={styles.page}>Loading results...</main>;
  }

  if (!access.isReady || !access.isAllowed) {
    return <main className={styles.page}>Preparing exam access...</main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Exam Summary</h1>
        <p className={styles.meta}>Your exam has been submitted.</p>
        <p>D Major Key Signature Score: {draft.keySignature.result?.score ?? 0}%</p>
        <p>C Minor Key Signature Score: {draft.keySignatureCMinor.result?.score ?? 0}%</p>
        <p>D Major Scale Score: {draft.scale.result?.score ?? 0}%</p>
        <p>B Minor Scale Score: {draft.scaleBMinor.result?.score ?? 0}%</p>
        <p>
          Identify Key Signatures Score: {draft.identifyKeySignatures.result?.score ?? 0}%
        </p>
        <p className={styles.total}>
          <strong>Overall Score: {totalScore ?? 0}%</strong>
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={startNewAttempt}>
            Start New Attempt
          </button>
          {isAuthReady && isConfigured && user && (
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </button>
          )}
        </div>
        {signOutError && <p className={styles.meta}>{signOutError}</p>}
      </section>

      <section className={styles.card}>
        <h2>Answer Review</h2>
        <p className={styles.meta}>
          Your original responses are shown first, followed by the expected answer key.
        </p>

        <div className={styles.reviewList}>
          {reviewSections.map((section) => (
            <article key={section.id} className={styles.reviewCard}>
              <h3>{section.title}</h3>
              <p className={styles.reviewScore}>
                {section.correctCount}/{section.totalCount} correct
              </p>

              <p className={styles.reviewLabel}>Your answers</p>
              <ol className={styles.answerList}>
                {section.studentAnswers.map((answer, index) => (
                  <li key={`${section.id}-student-${index}`}>{answer}</li>
                ))}
              </ol>

              <p className={styles.reviewLabel}>Correct answers</p>
              <ol className={styles.answerList}>
                {section.correctAnswers.map((answer, index) => (
                  <li key={`${section.id}-correct-${index}`}>{answer}</li>
                ))}
              </ol>

              {section.incorrectAnswers.length > 0 && (
                <p className={styles.reviewMeta}>
                  Incorrect submitted: {section.incorrectAnswers.join(", ")}
                </p>
              )}
              {section.missingAnswers.length > 0 && (
                <p className={styles.reviewMeta}>
                  Missing expected: {section.missingAnswers.join(", ")}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
