import { useMemo } from "react";
import { useAuthSession } from "@/features/auth/state/AuthProvider";

interface ExamAccessState {
  isReady: boolean;
  isAllowed: boolean;
  shouldRedirectToAuth: boolean;
  reason: string | null;
}

export function useExamAccess(): ExamAccessState {
  const { user, isReady, isConfigured } = useAuthSession();

  return useMemo(() => {
    if (!isReady) {
      return {
        isReady: false,
        isAllowed: false,
        shouldRedirectToAuth: false,
        reason: "Checking account state...",
      };
    }

    if (!isConfigured) {
      return {
        isReady: true,
        isAllowed: true,
        shouldRedirectToAuth: false,
        reason: "Firebase not configured. Running in local draft mode.",
      };
    }

    if (!user) {
      return {
        isReady: true,
        isAllowed: false,
        shouldRedirectToAuth: true,
        reason: "Sign in required to access the exam.",
      };
    }

    if (!user.emailVerified) {
      return {
        isReady: true,
        isAllowed: false,
        shouldRedirectToAuth: true,
        reason: "Verify your email before starting the exam.",
      };
    }

    return {
      isReady: true,
      isAllowed: true,
      shouldRedirectToAuth: false,
      reason: null,
    };
  }, [isConfigured, isReady, user]);
}
