"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import type { DVCMonthConfig } from "../../../lib/dvc/months";
import { attachShareHandlers } from "../../../lib/dvc/experimentalHtml";
import {
  isCalendarDayEnabled,
  maxNavigableDay,
} from "../../../lib/dvc/monthUtils";
import DVCGuideCalendarB from "./DVCGuideCalendarB";

type Props = {
  month: DVCMonthConfig;
  day: number;
  styles: string;
  body: string;
  themes?: Record<number, string>;
};

export default function DVCOptionBDayPage({ month, day, styles, body, themes }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { monthNum, year, days: totalDays } = month;
  const monthBase = `/dvc/b/2026/${month.slug}`;

  // Future dates are not readable — direct URLs bounce back to the day grid
  useEffect(() => {
    if (!isCalendarDayEnabled(day, monthNum, year, totalDays)) {
      router.replace(monthBase);
    }
  }, [day, monthNum, year, totalDays, monthBase, router]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    attachShareHandlers(root, () => {
      if (typeof window !== "undefined") return window.location.href;
      return `${monthBase}/${day}`;
    });

    const maxDay = maxNavigableDay(monthNum, year, totalDays);

    // Daybar back button: "← Days" only on day 1, otherwise "← Prev"
    if (day > 1) {
      const back = root.querySelector<HTMLAnchorElement>(
        `.daybar a[href="${monthBase}"]`
      );
      if (back) {
        back.textContent = "\u2190 Prev";
        back.setAttribute("href", `${monthBase}/${day - 1}`);
      }
    }

    // Disable prev/next links that point at future days
    root
      .querySelectorAll<HTMLAnchorElement>(`a[href^="${monthBase}/"]`)
      .forEach((a) => {
        const match = (a.getAttribute("href") || "").match(/\/(\d{1,2})$/);
        if (match && parseInt(match[1], 10) > maxDay) {
          a.style.opacity = "0.45";
          a.style.pointerEvents = "none";
          a.setAttribute("aria-disabled", "true");
        }
      });

    // Add a Calendar link to the daybar (same styling as its other links)
    const openCalendar = (e: Event) => {
      e.preventDefault();
      setCalendarOpen(true);
    };
    const injected: HTMLAnchorElement[] = [];
    root.querySelectorAll(".daybar").forEach((bar) => {
      if (bar.querySelector(".db-cal")) return;
      const el = document.createElement("a");
      el.className = "db-cal";
      el.textContent = "Calendar";
      el.setAttribute("role", "button");
      el.style.cursor = "pointer";
      el.addEventListener("click", openCalendar);
      const back = bar.querySelector("a");
      if (back) back.insertAdjacentElement("afterend", el);
      else bar.prepend(el);
      injected.push(el);
    });

    return () => {
      injected.forEach((el) => el.remove());
    };
  }, [month.slug, day, monthNum, year, totalDays, monthBase, body]);

  return (
    <>
      <div className="dvc-guide-root" ref={rootRef}>
        {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <DVCGuideCalendarB
        month={month}
        open={calendarOpen}
        currentDay={day}
        themes={themes}
        onClose={() => setCalendarOpen(false)}
        onSelect={(d) => router.push(`${monthBase}/${d}`)}
      />
    </>
  );
}
