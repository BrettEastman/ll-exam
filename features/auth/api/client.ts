import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth } from "@/features/firebase/client";

export interface AuthCredentials {
  email: string;
  password: string;
}

function getVerificationActionSettings() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    url: `${window.location.origin}/auth`,
    handleCodeInApp: false,
  };
}

export async function registerWithEmail(credentials: AuthCredentials) {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );

  if (result.user && !result.user.emailVerified) {
    await sendEmailVerification(result.user, getVerificationActionSettings());
  }

  return result.user;
}

export async function loginWithEmail(credentials: AuthCredentials) {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );

  return result.user;
}

export async function resendVerificationEmail() {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("No authenticated user available for verification email.");
  }

  await sendEmailVerification(user, getVerificationActionSettings());
}
