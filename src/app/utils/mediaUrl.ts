/**
 * API may return image paths as either:
 * - Absolute URLs (e.g. https://bucket.s3.../key) — use as-is
 * - Root-relative paths (e.g. /uploads/x.jpg) — prefix with API base when served by API
 */
export function resolvePublicAssetUrl(
  pathOrUrl: string | undefined | null
): string | undefined {
  if (pathOrUrl == null || typeof pathOrUrl !== "string") return undefined;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.SERVER_API_BASE_URL ||
    "";
  const pathPart = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!base) {
    return pathPart;
  }
  return `${base.replace(/\/$/, "")}${pathPart}`;
}
