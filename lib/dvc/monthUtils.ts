export function isCurrentMonth(month: number, year: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
}

export function isPastMonth(month: number, year: number): boolean {
  const now = new Date();
  if (year < now.getFullYear()) return true;
  return year === now.getFullYear() && month < now.getMonth() + 1;
}

export function isFutureMonth(month: number, year: number): boolean {
  const now = new Date();
  if (year > now.getFullYear()) return true;
  return year === now.getFullYear() && month > now.getMonth() + 1;
}

/** Past and current months only — future months stay on the shelf. */
export function isMonthNavigable(month: number, year: number): boolean {
  return !isFutureMonth(month, year);
}

function todayDay(): number {
  return new Date().getDate();
}

export function getDefaultDay(
  month: number,
  year: number,
  totalDays: number
): number {
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
  if (isCurrentMonth(month, year)) {
    return day <= todayDay();
  }
  if (isFutureMonth(month, year)) return false;
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
  return `/dvc/${slug}#day${day}`;
}

export function readOnlineLabel(month: number, year: number): string {
  if (isCurrentMonth(month, year)) return "Today's confession";
  if (isPastMonth(month, year)) return "Latest confession";
  return "Read online";
}
