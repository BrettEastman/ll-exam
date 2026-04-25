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

function modeAndTonicSource(input: string): {
  tonicSource: string;
  mode: "major" | "minor" | null;
} {
  const normalized = normalizeAnswer(input);
  if (!normalized) {
    return { tonicSource: "", mode: null };
  }

  const compact = normalized.replace(/\s+/g, "");
  if (/^[a-g](#|b)?m$/.test(compact)) {
    return {
      tonicSource: compact.slice(0, -1),
      mode: "minor",
    };
  }

  const hasMajor = /\bmajor\b/.test(normalized) || /\bmaj\b/.test(normalized);
  const hasMinor =
    /\bminor\b/.test(normalized) ||
    /\bmin\b/.test(normalized) ||
    /\bm\b/.test(normalized);

  return {
    tonicSource: normalized
      .replace(/\bmajor\b|\bmaj\b|\bminor\b|\bmin\b|\bm\b/g, " ")
      .trim(),
    mode: hasMajor ? "major" : hasMinor ? "minor" : null,
  };
}

function tonicMatchesTarget(tonicSource: string, targetTonic: string): boolean {
  const normalized = normalizeAnswer(tonicSource)
    .replace(/\s+/g, "")
    .replace(/flat/g, "b")
    .replace(/sharp/g, "#");

  const letter = targetTonic[0];

  if (targetTonic.endsWith("b")) {
    return new RegExp(`^${letter}(?:b|flat)$`).test(
      normalizeAnswer(tonicSource).replace(/\s+/g, ""),
    ) || normalized === targetTonic;
  }

  if (targetTonic.endsWith("#")) {
    return new RegExp(`^${letter}(?:#|sharp)$`).test(
      normalizeAnswer(tonicSource).replace(/\s+/g, ""),
    ) || normalized === targetTonic;
  }

  return normalized === targetTonic;
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
    const answer = modeAndTonicSource(raw);
    const tonicMatches = tonicMatchesTarget(answer.tonicSource, target.tonic);
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
