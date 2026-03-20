"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  loginWithEmail,
  registerWithEmail,
  resendVerificationEmail,
} from "@/features/auth/api/client";
import { getAuthErrorMessage } from "@/features/auth/model/errors";
import { useAuthSession } from "@/features/auth/state/AuthProvider";
import styles from "./page.module.css";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const { user, isReady, isConfigured, refreshUser, signOut } =
    useAuthSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const headerText = useMemo(
    () =>
      mode === "login"
        ? "Sign in to continue your exam"
        : "Create your account",
    [mode],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const nextUser = await loginWithEmail({ email, password });
        if (nextUser.emailVerified) {
          setMessage("Signed in successfully.");
        } else {
          setMessage(
            "Signed in. Please verify your email before starting the exam.",
          );
        }
      } else {
        await registerWithEmail({ email, password });
        setMessage(
          "Account created. Check your inbox for a verification email.",
        );
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendVerification = async () => {
    setError(null);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage("Verification email sent.");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    }
  };

  const onRefreshVerification = async () => {
    setError(null);
    setMessage(null);
    try {
      await refreshUser();
      setMessage("Account status refreshed.");
    } catch {
      setError("Could not refresh verification status.");
    }
  };

  if (!isReady) {
    return <main className={styles.page}>Loading account...</main>;
  }

  if (!isConfigured) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Authentication is not configured</h1>
          <p>
            Add <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables to
            enable Firebase auth and Firestore sync.
          </p>
          <Link href="/exam/1" className={styles.cta}>
            Continue with Local Drafts
          </Link>
        </section>
      </main>
    );
  }

  if (user && user.emailVerified) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Welcome back</h1>
          <p>You are signed in and verified. You can continue your exam now.</p>
          <div className={styles.actions}>
            <Link href="/exam/1" className={styles.cta}>
              Go to Exam
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className={styles.ghost}
            >
              Sign Out
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Verify your email</h1>
          <p>
            You are signed in as <strong>{user.email ?? "your account"}</strong>
            . Verify your email to unlock the exam.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cta}
              onClick={onResendVerification}
            >
              Resend Verification
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={onRefreshVerification}
            >
              I Verified, Refresh
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => void signOut()}
            >
              Use Another Account
            </button>
          </div>
          {message && <p className={styles.message}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.kicker}>Lydian Lab</p>
        <h1>{headerText}</h1>
        <p>Use your account so your exam draft syncs to Firestore.</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" className={styles.cta} disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={mode === "login" ? styles.activeMode : ""}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === "register" ? styles.activeMode : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </section>
    </main>
  );
}
