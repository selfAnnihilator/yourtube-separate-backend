const rawApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.BACKEND_URL ||
  "/api";

const normalizedApiBaseUrl = rawApiBaseUrl.endsWith("/")
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

const rawMediaBaseUrl =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
  process.env.BACKEND_URL ||
  "";

const normalizedMediaBaseUrl = rawMediaBaseUrl.endsWith("/")
  ? rawMediaBaseUrl.slice(0, -1)
  : rawMediaBaseUrl;

export const appConfig = {
  apiBaseUrl: normalizedApiBaseUrl,
  mediaBaseUrl: normalizedMediaBaseUrl,
};
