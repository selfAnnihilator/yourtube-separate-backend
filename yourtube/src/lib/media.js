import { appConfig } from "./app-config";

export function getMediaUrl(filepath) {
  if (!filepath) {
    return "";
  }

  if (/^https?:\/\//i.test(filepath)) {
    return filepath;
  }

  const normalizedPath = filepath.startsWith("/") ? filepath : `/${filepath}`;

  if (!appConfig.mediaBaseUrl) {
    return normalizedPath;
  }

  return `${appConfig.mediaBaseUrl}${normalizedPath}`;
}
