"use client";

import type { DVCMonthConfig } from "../../../lib/dvc/months";
import { isCalendarDayEnabled } from "../../../lib/dvc/monthUtils";

type Props = {
  month: DVCMonthConfig;
  open: boolean;
  currentDay?: number | null;
  /** Optional day-number → theme label map shown inside each cell */
  themes?: Record<number, string>;
  onClose: () => void;
  onSelect: (day: number) => void;
};

/** Same calendar overlay as /dvc (reuses .dvc-app-viewer styles):
 * only today and previous dates are selectable. */
export default function DVCGuideCalendar({
  month,
  open,
  currentDay,
  themes,
  onClose,
  onSelect,
}: Props) {
  if (!open) return null;

  const { monthNum, year, days: totalDays, startWeekday = 0 } = month;

  return (
    <div className="dvc-app-viewer">
      <div
        className="dvc-cal-overlay"
        role="dialog"
        aria-modal
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="dvc-cal-panel">
          <div className="dvc-cal-head">
            <h2>
              {month.name} {year}
            </h2>
            <button type="button" className="dvc-btn" onClick={onClose}>
              Close
            </button>
          </div>
          <p className="dvc-cal-sub">Tap a day to jump to that decree</p>
          <div className="dvc-cal-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="dvc-cal-grid">
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`e-${i}`} className="dvc-cal-cell empty" />
            ))}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const enabled = isCalendarDayEnabled(day, monthNum, year, totalDays);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={!enabled}
                  className={`dvc-cal-cell${currentDay === day ? " active" : ""}${
                    !enabled ? " disabled" : ""
                  }`}
                  onClick={() => {
                    if (!enabled) return;
                    onClose();
                    onSelect(day);
                  }}
                >
                  <span className="dvc-cal-num">{String(day).padStart(2, "0")}</span>
                  <span className="dvc-cal-theme">
                    {themes?.[day] || `Day ${day}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
