/** Strip scripts and rewrite static file links for in-app routes */

const GUIDE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&display=swap";

export { GUIDE_FONTS };

export function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export function extractBodyInner(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

/** Raw CSS from embedded guide <style> blocks (no wrapper tags) */
export function extractStyles(html: string): string {
  const blocks = html.match(/<style[\s\S]*?<\/style>/gi);
  if (!blocks) return "";
  return blocks
    .map((block) => block.replace(/<\/?style[^>]*>/gi, "").trim())
    .filter(Boolean)
    .join("\n");
}

/** Scope standalone guide CSS (body/html/:root) onto our React wrapper */
export function scopeGuideStyles(css: string, scope = ".dvc-guide-root"): string {
  return css
    .replace(/:root\b/g, scope)
    .replace(/\bhtml\b/g, scope)
    .replace(/\bbody\b/g, scope);
}

export function rewriteGuideShellLinks(
  html: string,
  option: "a" | "b",
  month?: string
): string {
  const base = option === "a" ? "/dvc/a" : "/dvc/b";
  let out = stripScripts(html);

  out = out.replace(/href="\.\/index\.html"/g, `href="${base}"`);
  out = out.replace(/href="\.\/2026\.html"/g, `href="${base}/2026"`);
  out = out.replace(/href="\.\.\/2026\.html"/g, `href="${base}/2026"`);
  out = out.replace(/href="\.\.\/\.\.\/2026\.html"/g, `href="${base}/2026"`);

  if (option === "a") {
    out = out.replace(
      /href="\.\/2026\/([a-z]+)\.html"/g,
      (_, m) => `href="${base}/2026/${m}"`
    );
  } else {
    out = out.replace(
      /href="\.\/2026\/([a-z]+)\/index\.html"/g,
      (_, m) => `href="${base}/2026/${m}"`
    );
    if (month) {
      const monthBase = `${base}/2026/${month}`;
      out = out.replace(/href="index\.html"/g, `href="${monthBase}"`);
      out = out.replace(/href="\.\/(\d+)\.html"/g, (_, d) => {
        const day = parseInt(d, 10);
        return `href="${monthBase}/${day}"`;
      });
    }
  }

  return out;
}

export function rewriteOptionAContent(html: string): string {
  let out = rewriteGuideShellLinks(html, "a");
  out = out.replace(
    /onclick="shareDay\((\d+),'([^']*)','([^']*)'\)"/g,
    'data-share-day="$1" data-share-theme="$2" data-share-anchor="$3"'
  );
  return out;
}

export function rewriteOptionBDayContent(
  html: string,
  month: string,
  day: number,
  shareText?: string
): string {
  let out = rewriteGuideShellLinks(html, "b", month);
  const monthBase = `/dvc/b/2026/${month}`;
  out = out.replace(/href="(\d{1,2})\.html"/g, (_, d) => {
    const dayNum = parseInt(d, 10);
    return `href="${monthBase}/${dayNum}"`;
  });
  const shareAttr = shareText
    ? ` data-share-text="${shareText.replace(/"/g, "&quot;")}"`
    : "";
  out = out.replace(
    /onclick="shareDay\(\)"/g,
    `data-share-day="${day}"${shareAttr}`
  );
  return out;
}

function showToast(root: HTMLElement, msg: string) {
  const toast = root.querySelector<HTMLElement>("#toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

export function attachShareHandlers(root: HTMLElement, getUrl: (day: number) => string) {
  const buttons = root.querySelectorAll<HTMLElement>("[data-share-day]");
  buttons.forEach((btn) => {
    if (btn.dataset.shareBound) return;
    btn.dataset.shareBound = "1";

    const day = parseInt(btn.dataset.shareDay || "1", 10);
    const theme = btn.dataset.shareTheme || `Day ${day}`;
    const anchor = btn.dataset.shareAnchor || "";
    const customText = btn.dataset.shareText;

    const handler = () => {
      const url = getUrl(day);
      const text =
        customText ||
        (anchor
          ? `Today's Daily Victory Confession: ${theme}. Anchor: ${anchor}. Decree it. See it established.`
          : `Daily Victory Confession — ${theme}`);

      if (navigator.share) {
        navigator.share({ title: "Daily Victory Confession", text, url }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard
          .writeText(`${text} ${url}`)
          .then(() => showToast(root, "Link copied to clipboard"))
          .catch(() => showToast(root, url));
      } else {
        showToast(root, url);
      }
    };

    btn.addEventListener("click", handler);
    btn.style.cursor = "pointer";
  });
}
