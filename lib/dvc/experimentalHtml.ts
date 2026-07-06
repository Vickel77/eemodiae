/** Strip scripts and rewrite static file links for in-app routes */

export function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export function extractBodyInner(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

export function extractStyles(html: string): string {
  const styles = html.match(/<style[\s\S]*?<\/style>/gi);
  return styles ? styles.join("\n") : "";
}

export function rewriteOptionAContent(html: string): string {
  let out = stripScripts(html);
  out = out.replace(/href="\.\.\/2026\.html"/g, 'href="/dvc/a/2026"');
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
  let out = stripScripts(html);
  const base = `/dvc/b/2026/${month}`;
  out = out.replace(/href="\.\.\/\.\.\/2026\.html"/g, 'href="/dvc/b/2026"');
  out = out.replace(/href="index\.html"/g, `href="${base}"`);
  out = out.replace(/href="(\d{1,2})\.html"/g, (_, d) => {
    const dayNum = parseInt(d, 10);
    return `href="${base}/${dayNum}"`;
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

export function attachShareHandlers(root: HTMLElement, getUrl: (day: number) => string) {
  const buttons = root.querySelectorAll<HTMLElement>("[data-share-day]");
  buttons.forEach((btn) => {
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
        navigator.clipboard.writeText(`${text} ${url}`);
      }
    };
    btn.addEventListener("click", handler);
    btn.style.cursor = "pointer";
  });
}
