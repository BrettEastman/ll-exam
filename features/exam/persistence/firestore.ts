import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type FirestoreError,
} from "firebase/firestore";
import { getFirebaseDb } from "@/features/firebase/client";
import type { ExamDraft } from "@/features/exam/model/types";
import {
  sanitizeFirestoreExamAttempt,
  toFirestoreExamAttempt,
} from "@/features/exam/model/firestore";

export class ExamSyncError extends Error {
  constructor(
    message: string,
    readonly code: "offline" | "permission" | "unavailable" | "unknown"
  ) {
    super(message);
    this.name = "ExamSyncError";
  }
}

function toExamSyncError(error: unknown): ExamSyncError {
  const firestoreError = error as Partial<FirestoreError> | null;
  const code = firestoreError?.code;

  if (code === "permission-denied") {
    return new ExamSyncError(
      "You do not have permission to access this exam attempt.",
      "permission"
    );
  }

  if (code === "unavailable") {
    return new ExamSyncError(
      "Firestore is temporarily unavailable. Please try again.",
      "unavailable"
    );
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return new ExamSyncError(
      "You are offline. Your latest changes remain saved locally.",
      "offline"
    );
  }

  return new ExamSyncError("Could not sync exam progress.", "unknown");
}

function getAttemptDoc(userId: string) {
  return doc(getFirebaseDb(), "examAttempts", userId);
}

export async function loadRemoteExamAttempt(
  userId: string,
  fallback: ExamDraft
): Promise<ExamDraft | null> {
  try {
    const snapshot = await getDoc(getAttemptDoc(userId));
    if (!snapshot.exists()) return null;
    return sanitizeFirestoreExamAttempt(snapshot.data(), fallback);
  } catch (error) {
    throw toExamSyncError(error);
  }
}

export async function saveRemoteExamAttempt(
  userId: string,
  draft: ExamDraft
): Promise<void> {
  const payload = toFirestoreExamAttempt(draft);
  try {
    await setDoc(
      getAttemptDoc(userId),
      {
        ...payload,
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    throw toExamSyncError(error);
  }
}
