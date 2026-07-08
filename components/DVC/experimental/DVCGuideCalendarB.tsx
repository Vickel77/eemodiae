"use client";

import { useEffect, useRef } from "react";
import type { DVCMonthConfig } from "../../../lib/dvc/months";
import { isCalendarDayEnabled } from "../../../lib/dvc/monthUtils";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type Props = {
  month: DVCMonthConfig;
  open: boolean;
  currentDay?: number | null;
  themes?: Record<number, string>;
  onClose: () => void;
  onSelect: (day: number) => void;
};

/** Option B calendar — themed like the guide section itself (navy/gold,
 * Cinzel/Cormorant, per-month palette) with a vertically scrolling day list.
 * Only today and previous dates are selectable. */
export default function DVCGuideCalendarB({
  month,
  open,
  currentDay,
  themes,
  onClose,
  onSelect,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(".dvc-bcal-day.active")
      ?.scrollIntoView({ block: "center" });
  }, [open]);

  if (!open) return null;

  const { monthNum, year, days: totalDays, startWeekday = 0 } = month;

  return (
    <div
      className="dvc-bcal-overlay"
      role="dialog"
      aria-modal
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={
        {
          "--bcal-grad": month.gradient,
          "--bcal-gold": month.gold,
          "--bcal-bright": month.bright,
        } as React.CSSProperties
      }
    >
      <div className="dvc-bcal-panel">
        <div className="dvc-bcal-head">
          <div>
            <p className="dvc-bcal-eyebrow">Daily Victory Confession</p>
            <h2 className="dvc-bcal-title">
              {month.name} {year}
            </h2>
            <p className="dvc-bcal-sub">Choose a day to read its confession</p>
          </div>
          <button type="button" className="dvc-bcal-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="dvc-bcal-list" ref={listRef}>
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const enabled = isCalendarDayEnabled(day, monthNum, year, totalDays);
            const weekday = WEEKDAYS[(startWeekday + day - 1) % 7];
            return (
              <button
                key={day}
                type="button"
                disabled={!enabled}
                className={`dvc-bcal-day${currentDay === day ? " active" : ""}${
                  !enabled ? " disabled" : ""
                }`}
                onClick={() => {
                  if (!enabled) return;
                  onClose();
                  onSelect(day);
                }}
              >
                <span className="dvc-bcal-num">{String(day).padStart(2, "0")}</span>
                <span className="dvc-bcal-meta">
                  <span className="dvc-bcal-theme">{themes?.[day] || `Day ${day}`}</span>
                  <span className="dvc-bcal-wd">{weekday}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
