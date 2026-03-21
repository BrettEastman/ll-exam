import styles from "./ExamNavigation.module.css";

interface ExamNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  finishDisabled?: boolean;
}

export default function ExamNavigation({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onFinish,
  finishDisabled = false,
}: ExamNavigationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const isKeySignatureSection = currentPage <= Math.ceil(totalPages / 2);
  const sectionLabel = isKeySignatureSection
    ? "Section 1: Key Signatures"
    : "Section 2: Scales";

  return (
    <nav className={styles.nav} aria-label="Exam page navigation">
      <button className={styles.button} onClick={onPrevious} disabled={isFirstPage}>
        Previous
      </button>

      <div className={styles.progress}>
        <p className={styles.sectionLabel}>{sectionLabel}</p>
        <div className={styles.dots}>
          {Array.from({ length: totalPages }, (_, i) => (
            <span
              key={i + 1}
              className={
                i + 1 === currentPage
                  ? `${styles.dot} ${styles.current}`
                  : i + 1 < currentPage
                  ? `${styles.dot} ${styles.complete}`
                  : styles.dot
              }
            />
          ))}
        </div>
        <p>
          {currentPage} of {totalPages}
        </p>
      </div>

      {isLastPage ? (
        <button
          className={`${styles.button} ${styles.finish}`}
          onClick={onFinish}
          disabled={finishDisabled}
        >
          Finish Exam
        </button>
      ) : (
        <button className={`${styles.button} ${styles.next}`} onClick={onNext}>
          Next
        </button>
      )}
    </nav>
  );
}
