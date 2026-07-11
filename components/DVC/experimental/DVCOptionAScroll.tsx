"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DVCMonthConfig } from "../../../lib/dvc/months";
import { attachShareHandlers } from "../../../lib/dvc/experimentalHtml";
import {
  clampDay,
  getDefaultDay,
  maxNavigableDay,
} from "../../../lib/dvc/monthUtils";
import DVCGuideCalendarB from "./DVCGuideCalendarB";

type Props = {
  month: DVCMonthConfig;
  styles: string;
  body: string;
};

/** Option A — paged month viewer: one confession per page, the daybar
 * "← Prev" / "Next →" move between days (day 1 keeps "← Days"). */
export default function DVCOptionAScroll({ month, styles, body }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [themes, setThemes] = useState<Record<number, string>>({});

  const { monthNum, year, days: totalDays } = month;
  const maxDay = maxNavigableDay(monthNum, year, totalDays);

  const goToDay = useCallback(
    (day: number) => {
      if (day < 1 || day > maxDay) return;
      setCurrentDay(day);
    },
    [maxDay]
  );

  // One-time DOM setup per month body
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    attachShareHandlers(root, (day) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}/dvc/${month.slug}#day${day}`;
    });

    // Day themes for the calendar cells (from the hidden TOC)
    const themeMap: Record<number, string> = {};
    root.querySelectorAll<HTMLAnchorElement>(".toc-item").forEach((item) => {
      const day = parseInt((item.getAttribute("href") || "").replace("#day", ""), 10);
      if (day) themeMap[day] = item.querySelector(".toc-theme")?.textContent || "";
    });
    setThemes(themeMap);

    const injected: HTMLAnchorElement[] = [];

    root.querySelectorAll<HTMLElement>("section.day").forEach((section) => {
      const dayNum = parseInt((section.id || "").replace("day", ""), 10);
      if (!dayNum) return;

      const bar = section.querySelector(".daybar");
      if (bar) {
        // Back link: "← Days" only on day 1, otherwise "← Prev"
        const back = bar.querySelector<HTMLAnchorElement>("a.db-nav");
        if (back && dayNum > 1) {
          back.textContent = "\u2190 Prev";
          back.setAttribute("href", `#day${dayNum - 1}`);
          back.dataset.dayNav = "prev";
        }

        // Next link moves to the next page (disabled past today)
        bar.querySelectorAll<HTMLAnchorElement>('a[href^="#day"]').forEach((a) => {
          if (a === back) return;
          a.dataset.dayNav = "next";
          if (dayNum >= maxDay) {
            a.style.opacity = "0.45";
            a.style.pointerEvents = "none";
            a.setAttribute("aria-disabled", "true");
          }
        });

        // Calendar link (same styling as the other daybar links)
        if (!bar.querySelector(".db-cal")) {
          const el = document.createElement("a");
          el.className = "db-nav db-cal";
          el.textContent = "Calendar";
          el.setAttribute("role", "button");
          el.style.cursor = "pointer";
          el.dataset.dayNav = "calendar";
          if (back) back.insertAdjacentElement("afterend", el);
          else bar.prepend(el);
          injected.push(el);
        }
      }

      // Bottom page-nav: arrows page through days, "Contents" opens the calendar
      section.querySelectorAll<HTMLAnchorElement>(".page-nav a").forEach((a) => {
        const href = a.getAttribute("href") || "";
        if (a.classList.contains("pn-toc") || href === "#toc") {
          a.dataset.dayNav = "calendar";
        } else if (href.startsWith("#day")) {
          const target = parseInt(href.replace("#day", ""), 10);
          a.dataset.dayNav = target < dayNum ? "prev" : "next";
          if (target > maxDay || target < 1) {
            a.style.opacity = "0.45";
            a.style.pointerEvents = "none";
            a.setAttribute("aria-disabled", "true");
          }
        }
      });
    });

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-day-nav]");
      if (!target) return;
      e.preventDefault();
      const nav = target.dataset.dayNav;
      if (nav === "calendar") setCalendarOpen(true);
      else if (nav === "prev") setCurrentDay((d) => (d && d > 1 ? d - 1 : d));
      else if (nav === "next") setCurrentDay((d) => (d && d < maxDay ? d + 1 : d));
    };
    root.addEventListener("click", onClick);

    // Initial day: hash if present, otherwise today / latest readable day
    const match = window.location.hash.match(/^#day(\d{1,2})$/i);
    const initial = match
      ? clampDay(parseInt(match[1], 10), monthNum, year, totalDays)
      : getDefaultDay(monthNum, year, totalDays);
    setCurrentDay(initial);

    return () => {
      root.removeEventListener("click", onClick);
      injected.forEach((el) => el.remove());
    };
  }, [month.slug, monthNum, year, totalDays, maxDay, body]);

  // Show only the current day's section
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !currentDay) return;

    root.querySelectorAll<HTMLElement>("section.day").forEach((section) => {
      const dayNum = parseInt((section.id || "").replace("day", ""), 10);
      section.classList.toggle("dvc-day-active", dayNum === currentDay);
    });

    window.history.replaceState(null, "", `/dvc/${month.slug}#day${currentDay}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentDay, month.slug]);

  return (
    <>
      <div className="dvc-guide-root dvc-a-paged" ref={rootRef}>
        {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <DVCGuideCalendarB
        month={month}
        open={calendarOpen}
        currentDay={currentDay}
        themes={themes}
        onClose={() => setCalendarOpen(false)}
        onSelect={goToDay}
      />
    </>
  );
}
