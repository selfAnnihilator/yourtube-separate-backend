export const COMMENT_MAX_LENGTH = 1000;
export const RECENT_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

const abusiveWordBlocklist = [
  "idiot",
  "stupid",
  "moron",
  "dumb",
  "loser",
  "trash",
  "kill yourself",
];

const punctuationOnlyPattern = /^[\s!?.。，、;:]+$/u;
const repeatedWordPattern = /\b([\p{L}\p{N}]{2,})\b(?:\s+\1\b){5,}/iu;

export function normalizeCommentText(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function detectCommentLanguage(text) {
  const value = String(text || "");

  if (/^[\x00-\x7F]*$/.test(value)) {
    return { language: "en", confidence: "high" };
  }

  if (/[A-Za-z]/.test(value) && /[^\x00-\x7F]/.test(value)) {
    return { language: "und", confidence: "low" };
  }

  return { language: "und", confidence: "high" };
}

export function validateCommentText(text) {
  const originalText = String(text || "").trim();

  if (!originalText) {
    return {
      ok: false,
      status: 400,
      body: {
        code: "COMMENT_INVALID",
        message: "Comment cannot be empty.",
      },
    };
  }

  if (originalText.length > COMMENT_MAX_LENGTH) {
    return {
      ok: false,
      status: 400,
      body: {
        code: "COMMENT_INVALID",
        message: `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`,
      },
    };
  }

  return {
    ok: true,
    originalText,
    normalizedText: normalizeCommentText(originalText),
  };
}

export function checkCommentSafety({ originalText, normalizedText, detectedLanguage }) {
  if (
    (detectedLanguage === "en" || detectedLanguage === "und") &&
    abusiveWordBlocklist.some((blockedTerm) => {
      const escapedTerm = blockedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escapedTerm}\\b`, "i").test(normalizedText);
    })
  ) {
    return {
      ok: false,
      status: 400,
      body: {
        code: "COMMENT_BLOCKED",
        reason: "abusive_language",
        message: "Comment was blocked for abusive language.",
      },
    };
  }

  if (
    originalText.length >= 6 &&
    punctuationOnlyPattern.test(originalText) &&
    /([!?.。，、;:])\1{2,}/u.test(originalText)
  ) {
    return {
      ok: false,
      status: 400,
      body: {
        code: "COMMENT_BLOCKED",
        reason: "repeated_punctuation",
        message: "Comment was blocked for repeated punctuation.",
      },
    };
  }

  if (repeatedWordPattern.test(normalizedText)) {
    return {
      ok: false,
      status: 400,
      body: {
        code: "COMMENT_BLOCKED",
        reason: "spam_like",
        message: "Comment was blocked as spam-like.",
      },
    };
  }

  return { ok: true };
}
