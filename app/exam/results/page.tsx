"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useExamAccess } from "@/features/exam/state/useExamAccess";
import { getExamProgress } from "@/features/exam/model/flow";
import { clearDraft } from "@/features/exam/persistence/draft";
import { useExamDraft } from "@/features/exam/state/useExamDraft";

export default function ExamResultsPage() {
  const router = useRouter();
  const { draft, isHydrated } = useExamDraft();
  const access = useExamAccess();
  const { totalScore } = getExamProgress(draft);

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
        <p>Scale Score: {draft.scale.result?.score ?? 0}%</p>
        <p>Key Signature Score: {draft.keySignature.result?.score ?? 0}%</p>
        <p className={styles.total}>
          <strong>Overall Score: {totalScore ?? 0}%</strong>
        </p>
        <button type="button" className={styles.button} onClick={startNewAttempt}>
          Start New Attempt
        </button>
      </section>
    </main>
  );
}
