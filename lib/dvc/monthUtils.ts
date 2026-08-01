import type { DVCMonthConfig } from "./months";

/** Ministry calendar — West Africa Time (UTC+1). */
const DVC_TIMEZONE = "Africa/Lagos";

export function getDvcNow(): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DVC_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function isCurrentMonth(month: number, year: number): boolean {
  const now = getDvcNow();
  return now.year === year && now.month === month;
}

export function isPastMonth(month: number, year: number): boolean {
  const now = getDvcNow();
  if (year < now.year) return true;
  return year === now.year && month < now.month;
}

export function isFutureMonth(month: number, year: number): boolean {
  const now = getDvcNow();
  if (year > now.year) return true;
  return year === now.year && month > now.month;
}

/** Past and current months only — future months stay on the shelf. */
export function isMonthNavigable(month: number, year: number): boolean {
  return !isFutureMonth(month, year);
}

function todayDay(): number {
  return getDvcNow().day;
}

export function getDefaultDay(
  month: number,
  year: number,
  totalDays: number
): number {
  if (isFutureMonth(month, year)) return 0;
  if (isCurrentMonth(month, year)) {
    return Math.min(todayDay(), totalDays);
  }
  if (isPastMonth(month, year)) {
    return totalDays;
  }
  return 1;
}

export function isCalendarDayEnabled(
  day: number,
  month: number,
  year: number,
  totalDays: number
): boolean {
  if (day < 1 || day > totalDays) return false;
  if (isFutureMonth(month, year)) return false;
  if (isCurrentMonth(month, year)) {
    return day <= todayDay();
  }
  return true;
}

export function isNavigableDay(
  day: number,
  month: number,
  year: number,
  totalDays: number
): boolean {
  return isCalendarDayEnabled(day, month, year, totalDays);
}

export function clampDay(
  day: number,
  month: number,
  year: number,
  totalDays: number
): number {
  if (isFutureMonth(month, year)) return 0;
  let d = Math.max(1, Math.min(day, totalDays));
  if (isCurrentMonth(month, year)) {
    d = Math.min(d, todayDay());
  }
  return d;
}

export function maxNavigableDay(
  month: number,
  year: number,
  totalDays: number
): number {
  if (isFutureMonth(month, year)) return 0;
  if (isCurrentMonth(month, year)) {
    return Math.min(todayDay(), totalDays);
  }
  return totalDays;
}

export function monthReadHref(
  slug: string,
  month: number,
  year: number,
  totalDays: number
): string {
  const day = getDefaultDay(month, year, totalDays);
  return `/dvc/${slug}#day${day || 1}`;
}

export function readOnlineLabel(month: number, year: number): string {
  if (isCurrentMonth(month, year)) return "Today's confession";
  if (isPastMonth(month, year)) return "Latest confession";
  return "Read online";
}

/** Disable future month tiles on the /dvc year grid (runs in the browser). */
export function gateFutureMonthCardsInDom(
  root: HTMLElement,
  months: DVCMonthConfig[]
): void {
  for (const m of months) {
    if (isMonthNavigable(m.monthNum, m.year)) continue;

    root.querySelectorAll<HTMLAnchorElement>(`a.m-card.ready[href="/dvc/${m.slug}"]`).forEach(
      (card) => {
        const div = document.createElement("div");
        div.className = card.className.replace(/\bready\b/, "").trim();
        for (const attr of Array.from(card.attributes)) {
          if (attr.name !== "href") div.setAttribute(attr.name, attr.value);
        }
        div.innerHTML = card.innerHTML
          .replace(/class="m-status ready"/g, 'class="m-status soon"')
          .replace(/>Ready</g, ">Coming soon<");
        card.replaceWith(div);
      }
    );
  }
}
