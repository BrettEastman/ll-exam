"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>LydianLab</p>
        <h1>LydianLab Music Theory Entrance Exam</h1>
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
      </section>

      <div className={styles.ctaWrap}>
        <Link href="/exam/1" className={styles.cta}>
          Start Exam
        </Link>
      </div>
    </main>
  );
}
