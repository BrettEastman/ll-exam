import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthSession } from "@/features/auth/state/AuthProvider";
import {
  loadRemoteExamAttempt,
  saveRemoteExamAttempt,
  type ExamSyncError,
} from "@/features/exam/persistence/firestore";
import type { ExamDraft, ExamSyncStatus } from "../model/types";
import { createEmptyDraft, loadDraft, saveDraft } from "../persistence/draft";

export function useExamDraft() {
  const [draft, setDraft] = useState<ExamDraft>(() => createEmptyDraft());
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<ExamSyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isRemoteLoaded, setIsRemoteLoaded] = useState(false);
  const loadedRemoteUserIdRef = useRef<string | null>(null);
  const { user, isReady, isConfigured } = useAuthSession();
  const userId = user?.uid ?? null;

  useEffect(() => {
    const hydrated = loadDraft();
    setDraft(hydrated);
    setIsHydrated(true);
    setSyncStatus("idle");
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveDraft(draft);
  }, [draft, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isReady) return;

    if (!isConfigured) {
      setSyncStatus("disabled");
      setSyncMessage("Firebase is not configured. Saving locally only.");
      setIsRemoteLoaded(true);
      loadedRemoteUserIdRef.current = null;
      return;
    }

    if (!userId) {
      setSyncStatus("idle");
      setSyncMessage("Sign in to sync your exam progress across devices.");
      setIsRemoteLoaded(true);
      loadedRemoteUserIdRef.current = null;
      return;
    }

    if (loadedRemoteUserIdRef.current === userId) {
      return;
    }

    setIsRemoteLoaded(false);

    let cancelled = false;
    const loadRemote = async () => {
      setSyncStatus("loading");
      setSyncMessage("Loading cloud draft...");

      try {
        const localDraft = loadDraft();
        const remoteDraft = await loadRemoteExamAttempt(userId, localDraft);
        if (cancelled) return;

        if (remoteDraft && remoteDraft.updatedAt > localDraft.updatedAt) {
          setDraft(remoteDraft);
          saveDraft(remoteDraft);
        }

        setSyncStatus("synced");
        setSyncMessage("Cloud sync connected.");
      } catch (error) {
        if (cancelled) return;
        const syncError = error as ExamSyncError;
        if (syncError.code === "offline") {
          setSyncStatus("offline");
          setSyncMessage(syncError.message);
        } else {
          setSyncStatus("error");
          setSyncMessage(syncError.message);
        }
      } finally {
        if (!cancelled) {
          loadedRemoteUserIdRef.current = userId;
          setIsRemoteLoaded(true);
        }
      }
    };

    void loadRemote();

    return () => {
      cancelled = true;
    };
  }, [isConfigured, isHydrated, isReady, userId]);

  useEffect(() => {
    if (!isHydrated || !isReady || !isRemoteLoaded || !userId || !isConfigured) return;

    const timeout = window.setTimeout(async () => {
      setSyncStatus((prev) => (prev === "offline" ? "offline" : "syncing"));

      try {
        await saveRemoteExamAttempt(userId, {
          ...draft,
          updatedAt: Date.now(),
        });
        setSyncStatus("synced");
        setSyncMessage("Cloud sync connected.");
      } catch (error) {
        const syncError = error as ExamSyncError;
        if (syncError.code === "offline") {
          setSyncStatus("offline");
          setSyncMessage(syncError.message);
          return;
        }

        setSyncStatus("error");
        setSyncMessage(syncError.message);
      }
    }, 600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [draft, isConfigured, isHydrated, isReady, isRemoteLoaded, userId]);

  const patchDraft = useCallback((updater: (prev: ExamDraft) => ExamDraft) => {
    setDraft((prev) => {
      const next = updater(prev);
      if (next === prev) {
        return prev;
      }

      return {
        ...next,
        updatedAt: Date.now(),
      };
    });
  }, []);

  return {
    draft,
    isHydrated,
    syncStatus,
    syncMessage,
    patchDraft,
  };
}
