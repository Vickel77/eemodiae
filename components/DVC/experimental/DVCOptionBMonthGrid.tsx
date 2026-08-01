"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import type { DVCMonthConfig } from "../../../lib/dvc/months";
import { isFutureMonth, maxNavigableDay } from "../../../lib/dvc/monthUtils";

type Props = {
  month: DVCMonthConfig;
  styles: string;
  body: string;
};

/** Option B day grid — the grid itself is the calendar, so future
 * day cards are disabled (only today and previous dates open). */
export default function DVCOptionBMonthGrid({ month, styles, body }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { monthNum, year, days: totalDays } = month;

  useEffect(() => {
    if (isFutureMonth(monthNum, year)) {
      router.replace("/dvc/b/2026");
    }
  }, [monthNum, year, router]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const maxDay = maxNavigableDay(monthNum, year, totalDays);
    root.querySelectorAll<HTMLAnchorElement>("a.d-card").forEach((card) => {
      const match = (card.getAttribute("href") || "").match(/\/(\d{1,2})$/);
      if (match && parseInt(match[1], 10) > maxDay) {
        card.style.opacity = "0.4";
        card.style.pointerEvents = "none";
        card.setAttribute("aria-disabled", "true");
      }
    });
  }, [monthNum, year, totalDays, body]);

  return (
    <div className="dvc-guide-root" ref={rootRef}>
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
