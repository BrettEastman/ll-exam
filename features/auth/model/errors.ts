import type { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as Partial<FirebaseError> | null)?.code;

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already in use. Try signing in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Use a stronger password with at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/missing-continue-uri":
      return "Verification email could not be sent. Set an authDomain and authorized domain in Firebase.";
    case "auth/unauthorized-continue-uri":
      return "Verification link domain is not authorized. Add this site domain in Firebase Authentication settings.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Authentication failed. Please try again.";
  }
}
