import { appConfig } from "./app-config";

export function isStaleUploadPath(filepath) {
  if (!filepath) {
    return false;
  }

  return (
    filepath.startsWith("uploads/") ||
    filepath.startsWith("/uploads/") ||
    filepath.startsWith("/opt/render/project/src/uploads/")
  );
}

export function getMediaUrl(filepath) {
  if (!filepath) {
    return "";
  }

  if (isStaleUploadPath(filepath)) {
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
