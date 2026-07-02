export function parsePageQuery(
  value: string | string[] | undefined
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}

/** Build `/path?page=N` (omits page when 1). */
export function listHref(
  path: string,
  page: number,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams();
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Restore list URL from detail-page query (e.g. Back button). */
export function listBackHref(
  path: string,
  query: Record<string, string | string[] | undefined>,
  extraKeys: string[] = []
): string {
  const params = new URLSearchParams();
  extraKeys.forEach((key) => {
    const value = query[key];
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  });
  const page = parsePageQuery(query.page);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Append `page` to an existing query string (`tab=messages`). */
export function withPageInSearch(baseSearch: string, page: number): string {
  const params = new URLSearchParams(baseSearch);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  return params.toString();
}
