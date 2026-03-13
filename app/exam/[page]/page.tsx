"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScaleExercise from "../../../components/exam/ScaleExercise";
import KeySignatureExercise from "../../../components/exam/KeySignatureExercise";
import ExamNavigation from "../../../components/exam/ExamNavigation";
import styles from "./page.module.css";

const EXAM_PAGES = [
  {
    id: 1,
    title: "Scale Notation",
    description: "Enter the D Major scale notes in order",
  },
  {
    id: 2,
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for the key signature",
  },
];

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const currentPage = parseInt(params.page as string);
  const [examStartTime] = useState(Date.now());

  // Redirect invalid pages
  useEffect(() => {
    if (
      isNaN(currentPage) ||
      currentPage < 1 ||
      currentPage > EXAM_PAGES.length
    ) {
      router.push("/exam/1");
    }
  }, [currentPage, router]);

  if (
    isNaN(currentPage) ||
    currentPage < 1 ||
    currentPage > EXAM_PAGES.length
  ) {
    return <main className={styles.examPage}>Loading...</main>;
  }

  const currentExam = EXAM_PAGES[currentPage - 1];

  const handleNext = () => {
    if (currentPage < EXAM_PAGES.length) {
      router.push(`/exam/${currentPage + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      router.push(`/exam/${currentPage - 1}`);
    }
  };

  const handleFinish = () => {
    alert("Exam completed! (This would normally save results)");
  };

  return (
    <main className={styles.examPage}>
      <header className={styles.header}>
        <h1>LydianLab Music Theory Exam</h1>
        <div className={styles.titleRow}>
          <h2>{currentExam.title}</h2>
          <p>
            Page {currentPage} of {EXAM_PAGES.length}
          </p>
        </div>
        <p className={styles.description}>{currentExam.description}</p>
      </header>

      <section>{currentPage === 1 ? <ScaleExercise /> : <KeySignatureExercise />}</section>

      <ExamNavigation
        currentPage={currentPage}
        totalPages={EXAM_PAGES.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFinish={handleFinish}
      />
    </main>
  );
}
