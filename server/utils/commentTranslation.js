import { detectCommentLanguage as detectCommentLanguageHeuristic } from "./commentSafety.js";

const ENGLISH_LANGUAGE = "en";
const UNKNOWN_LANGUAGE = "und";
const DEEPL_DEFAULT_API_URL = "https://api-free.deepl.com";

function getTranslationProvider() {
  return String(process.env.TRANSLATION_PROVIDER || "libretranslate").toLowerCase();
}

function getTranslationApiUrl() {
  const configuredUrl = String(process.env.TRANSLATION_API_URL || "").replace(/\/+$/, "");

  if (configuredUrl) {
    return configuredUrl;
  }

  if (getTranslationProvider() === "deepl") {
    return DEEPL_DEFAULT_API_URL;
  }

  return "";
}

function getTranslationApiKey() {
  return process.env.TRANSLATION_API_KEY || process.env.DEEPL_API_KEY || "";
}

function detectCommentLanguageForDeepLTranslation(text) {
  const detectedLanguage = detectCommentLanguageHeuristic(text);

  if (detectedLanguage.language === ENGLISH_LANGUAGE) {
    return { language: UNKNOWN_LANGUAGE, confidence: "high" };
  }

  return detectedLanguage;
}

export function getCommentTranslationLanguage({ detectedLanguage, languageDetectionConfidence }) {
  const language = normalizeLanguageCode(detectedLanguage);
  const confidence = languageDetectionConfidence === "high" ? "high" : "low";

  if (
    getTranslationProvider() === "deepl" &&
    process.env.DEEPL_DETECT_LANGUAGE_ENABLED !== "true" &&
    language === ENGLISH_LANGUAGE
  ) {
    return { language: UNKNOWN_LANGUAGE, confidence: "high" };
  }

  return { language, confidence };
}

function normalizeLanguageCode(language) {
  const value = String(language || "").trim().toLowerCase();

  if (!value) {
    return UNKNOWN_LANGUAGE;
  }

  return value.split("-")[0] || UNKNOWN_LANGUAGE;
}

function toLibreTranslateConfidence(value) {
  if (typeof value === "number") {
    return value >= 0.7 ? "high" : "low";
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "high" || normalized === "low") {
      return normalized;
    }
  }

  return "low";
}

function parseLibreTranslateDetectResponse(payload) {
  const detection = Array.isArray(payload) ? payload[0] : payload;
  const language = normalizeLanguageCode(detection?.language);

  if (language === UNKNOWN_LANGUAGE) {
    return { language: UNKNOWN_LANGUAGE, confidence: "low" };
  }

  return {
    language,
    confidence: toLibreTranslateConfidence(detection?.confidence),
  };
}

function parseDeepLDetectResponse(payload) {
  const result = Array.isArray(payload?.results) ? payload.results[0] : null;

  if (result?.detection_status !== "success") {
    return { language: UNKNOWN_LANGUAGE, confidence: "low" };
  }

  return {
    language: normalizeLanguageCode(result.detected_language),
    confidence: "high",
  };
}

function getLibreTranslateHeaders() {
  const headers = { "Content-Type": "application/json" };
  const apiKey = getTranslationApiKey();

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

function withLibreTranslateApiKey(body) {
  const apiKey = getTranslationApiKey();

  if (!apiKey) {
    return body;
  }

  return {
    ...body,
    api_key: apiKey,
  };
}

function getDeepLHeaders() {
  const apiKey = getTranslationApiKey();
  const headers = { "Content-Type": "application/json" };

  if (apiKey) {
    headers.Authorization = `DeepL-Auth-Key ${apiKey}`;
  }

  return headers;
}

function getSourceLanguageForDeepL(sourceLanguage) {
  const language = normalizeLanguageCode(sourceLanguage);

  if (!language || language === UNKNOWN_LANGUAGE) {
    return undefined;
  }

  return language.toUpperCase();
}

async function detectLanguageWithLibreTranslate(text, apiUrl) {
  const response = await fetch(`${apiUrl}/detect`, {
    method: "POST",
    headers: getLibreTranslateHeaders(),
    body: JSON.stringify(withLibreTranslateApiKey({ q: text })),
  });

  if (!response.ok) {
    return detectCommentLanguageHeuristic(text);
  }

  const detectedLanguage = parseLibreTranslateDetectResponse(await response.json());

  if (detectedLanguage.confidence === "low") {
    return detectCommentLanguageHeuristic(text);
  }

  return detectedLanguage;
}

async function detectLanguageWithDeepL(text, apiUrl) {
  if (!getTranslationApiKey() || process.env.DEEPL_DETECT_LANGUAGE_ENABLED !== "true") {
    return detectCommentLanguageForDeepLTranslation(text);
  }

  const response = await fetch(`${apiUrl}/v3/detect/language`, {
    method: "POST",
    headers: getDeepLHeaders(),
    body: JSON.stringify({ text: [text] }),
  });

  if (!response.ok) {
    return detectCommentLanguageForDeepLTranslation(text);
  }

  const detectedLanguage = parseDeepLDetectResponse(await response.json());

  if (detectedLanguage.confidence === "low") {
    return detectCommentLanguageForDeepLTranslation(text);
  }

  return detectedLanguage;
}

export async function detectCommentLanguage(text) {
  const apiUrl = getTranslationApiUrl();

  if (!apiUrl) {
    return detectCommentLanguageHeuristic(text);
  }

  try {
    if (getTranslationProvider() === "deepl") {
      return await detectLanguageWithDeepL(text, apiUrl);
    }

    return await detectLanguageWithLibreTranslate(text, apiUrl);
  } catch (error) {
    if (getTranslationProvider() === "deepl") {
      return detectCommentLanguageForDeepLTranslation(text);
    }

    return detectCommentLanguageHeuristic(text);
  }
}

function translationConfigurationError() {
  if (getTranslationProvider() === "deepl" && !getTranslationApiKey()) {
    return {
      ok: false,
      status: 503,
      body: {
        code: "TRANSLATION_NOT_CONFIGURED",
        message: "DeepL API key is not configured.",
      },
    };
  }

  if (!getTranslationApiUrl()) {
    return {
      ok: false,
      status: 503,
      body: {
        code: "TRANSLATION_NOT_CONFIGURED",
        message: "Translation service is not configured.",
      },
    };
  }

  return null;
}

function translationFailed() {
  return {
    ok: false,
    status: 502,
    body: {
      code: "TRANSLATION_FAILED",
      message: "Could not translate this comment right now.",
    },
  };
}

async function translateWithLibreTranslate({ text, sourceLanguage, apiUrl }) {
  const response = await fetch(`${apiUrl}/translate`, {
    method: "POST",
    headers: getLibreTranslateHeaders(),
    body: JSON.stringify(
      withLibreTranslateApiKey({
        q: text,
        source: sourceLanguage && sourceLanguage !== UNKNOWN_LANGUAGE ? sourceLanguage : "auto",
        target: ENGLISH_LANGUAGE,
        format: "text",
      })
    ),
  });

  if (!response.ok) {
    return translationFailed();
  }

  const payload = await response.json();
  const translatedText = String(payload?.translatedText || "").trim();

  if (!translatedText) {
    return translationFailed();
  }

  return { ok: true, translatedText };
}

async function translateWithDeepL({ text, sourceLanguage, apiUrl }) {
  const body = {
    text: [text],
    target_lang: ENGLISH_LANGUAGE.toUpperCase(),
  };
  const normalizedSourceLanguage = getSourceLanguageForDeepL(sourceLanguage);

  if (normalizedSourceLanguage) {
    body.source_lang = normalizedSourceLanguage;
  }

  const response = await fetch(`${apiUrl}/v2/translate`, {
    method: "POST",
    headers: getDeepLHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return translationFailed();
  }

  const payload = await response.json();
  const translatedText = String(payload?.translations?.[0]?.text || "").trim();

  if (!translatedText) {
    return translationFailed();
  }

  return { ok: true, translatedText };
}

export async function translateCommentToEnglish({ text, sourceLanguage }) {
  const configurationError = translationConfigurationError();

  if (configurationError) {
    return configurationError;
  }

  const apiUrl = getTranslationApiUrl();

  try {
    if (getTranslationProvider() === "deepl") {
      return await translateWithDeepL({ text, sourceLanguage, apiUrl });
    }

    return await translateWithLibreTranslate({ text, sourceLanguage, apiUrl });
  } catch (error) {
    return translationFailed();
  }
}
