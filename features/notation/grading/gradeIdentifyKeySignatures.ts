import type { GradeResult } from "../model/types";

export const IDENTIFY_KEY_SIGNATURE_PROMPTS = [
  { keySpec: "Db", tonic: "db", mode: "major" },
  { keySpec: "A", tonic: "a", mode: "major" },
  { keySpec: "Fm", tonic: "f", mode: "minor" },
  { keySpec: "C#m", tonic: "c#", mode: "minor" },
] as const;

function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeTonic(input: string): string {
  let value = input;
  value = value.replace(/\b([a-g])\s*flat\b/g, "$1b");
  value = value.replace(/\b([a-g])\s*sharp\b/g, "$1#");
  value = value.replace(/\s+/g, "");
  return value;
}

function parseAnswer(input: string): { tonic: string; mode: "major" | "minor" | null } {
  const normalized = normalizeAnswer(input);
  if (!normalized) {
    return { tonic: "", mode: null };
  }

  const compact = normalized.replace(/\s+/g, "");
  if (/^[a-g](#|b)?m$/.test(compact)) {
    return {
      tonic: compact.slice(0, -1),
      mode: "minor",
    };
  }

  const hasMajor = /\bmajor\b/.test(normalized) || /\bmaj\b/.test(normalized);
  const hasMinor =
    /\bminor\b/.test(normalized) ||
    /\bmin\b/.test(normalized) ||
    /\bm\b/.test(normalized);
  const mode = hasMajor ? "major" : hasMinor ? "minor" : null;
  const tonicSource = normalized
    .replace(/\bmajor\b|\bmaj\b|\bminor\b|\bmin\b|\bm\b/g, " ")
    .trim();

  return {
    tonic: normalizeTonic(tonicSource),
    mode,
  };
}

export function gradeIdentifyKeySignaturesAttempt(input: string[]): GradeResult {
  const result: GradeResult = {
    correct: [],
    incorrect: [],
    missing: [],
    score: 0,
  };

  IDENTIFY_KEY_SIGNATURE_PROMPTS.forEach((target, index) => {
    const raw = input[index] ?? "";
    const answer = parseAnswer(raw);
    const tonicMatches = answer.tonic === target.tonic;
    const modeMatches = answer.mode === null || answer.mode === target.mode;

    if (tonicMatches && modeMatches) {
      result.correct.push(`${target.tonic} ${target.mode}`);
    } else {
      result.incorrect.push(raw.trim() || "(blank)");
      result.missing.push(`${target.tonic} ${target.mode}`);
    }
  });

  result.score = Math.round(
    (result.correct.length / IDENTIFY_KEY_SIGNATURE_PROMPTS.length) * 100,
  );
  return result;
}
