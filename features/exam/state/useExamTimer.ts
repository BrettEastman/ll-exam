import { useEffect, useMemo, useState } from "react";
import { EXAM_DURATION_SECONDS } from "../model/constants";

export function useExamTimer(startedAt: number, isStopped: boolean) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (isStopped) return;

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [isStopped]);

  const remainingSeconds = useMemo(() => {
    const elapsedSeconds = Math.floor((now - startedAt) / 1000);
    return Math.max(0, EXAM_DURATION_SECONDS - elapsedSeconds);
  }, [now, startedAt]);

  const isExpired = remainingSeconds <= 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const label = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    remainingSeconds,
    isExpired,
    label,
  };
}
