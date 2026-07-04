import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { DVCMonthConfig } from "../../lib/dvc/months";
import {
  clampDay,
  getDefaultDay,
  isCalendarDayEnabled,
  isNavigableDay,
  maxNavigableDay,
} from "../../lib/dvc/monthUtils";

type DayMeta = { day: number; theme: string; weekday: string };

type Props = {
  month: DVCMonthConfig;
};

export default function DVCMonthViewer({ month }: Props) {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [viewerReady, setViewerReady] = useState(false);

  const sourceRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const { monthNum, year, days: totalDays, startWeekday = 0 } = month;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/dvc/content/${month.slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.text();
      })
      .then((html) => {
        if (!cancelled) {
          setHtmlContent(html);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month.slug]);

  const dayMetaList = useMemo((): DayMeta[] => {
    if (!htmlContent || typeof window === "undefined") return [];
    const doc = new DOMParser().parseFromString(
      `<div>${htmlContent}</div>`,
      "text/html"
    );
    const items = doc.querySelectorAll(".toc-item");
    return Array.from(items).map((item) => {
      const href = item.getAttribute("href") || "";
      const day = parseInt(href.replace("#day", ""), 10);
      return {
        day,
        theme: item.querySelector(".toc-theme")?.textContent || "",
        weekday: item.querySelector(".toc-wd")?.textContent || "",
      };
    });
  }, [htmlContent]);

  const getDayMeta = useCallback(
    (day: number) =>
      dayMetaList.find((d) => d.day === day) || {
        day,
        theme: `Day ${day}`,
        weekday: "",
      },
    [dayMetaList]
  );

  const openDay = useCallback(
    (day: number) => {
      if (!isNavigableDay(day, monthNum, year, totalDays)) return;
      setCurrentDay(day);
      if (typeof window !== "undefined") {
        const url = `/dvc/${month.slug}#day${day}`;
        window.history.replaceState(null, "", url);
      }
    },
    [month.slug, monthNum, year, totalDays]
  );

  const mountSlides = useCallback(() => {
    const source = sourceRef.current;
    const track = trackRef.current;
    if (!source || !track) return;

    track.innerHTML = "";
    const sections = source.querySelectorAll("section.day");
    sections.forEach((section) => {
      const slide = document.createElement("div");
      slide.className = "dvc-slide";
      slide.appendChild(section.cloneNode(true));
      track.appendChild(slide);
    });
    setViewerReady(true);
  }, []);

  useEffect(() => {
    if (!htmlContent) return;
    const t = setTimeout(mountSlides, 0);
    return () => clearTimeout(t);
  }, [htmlContent, mountSlides]);

  useEffect(() => {
    if (!viewerReady) return;
    const hash = window.location.hash;
    const match = hash.match(/^#day(\d{1,2})$/i);
    const fromHash = match ? parseInt(match[1], 10) : null;
    const entry = fromHash
      ? clampDay(fromHash, monthNum, year, totalDays)
      : getDefaultDay(monthNum, year, totalDays);
    openDay(entry);
  }, [viewerReady, monthNum, year, totalDays, openDay]);

  useEffect(() => {
    if (!trackRef.current) return;
    const idx = currentDay - 1;
    trackRef.current.style.transform = `translateX(-${idx * 100}%)`;
  }, [currentDay, viewerReady]);

  useEffect(() => {
    const onHash = () => {
      const match = window.location.hash.match(/^#day(\d{1,2})$/i);
      if (!match) return;
      const day = clampDay(parseInt(match[1], 10), monthNum, year, totalDays);
      setCurrentDay(day);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [monthNum, year, totalDays]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const shareDay = () => {
    const meta = getDayMeta(currentDay);
    const url = `${window.location.origin}/dvc/${month.slug}#day${currentDay}`;
    const title = `Daily Victory Confession — ${month.name} ${currentDay}, ${year}`;
    const text = `${meta.theme} — Daily Victory Confession`;
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {
        navigator.clipboard?.writeText(url);
        showToast("Link copied");
      });
    } else {
      navigator.clipboard?.writeText(url);
      showToast("Link copied");
    }
  };

  const meta = getDayMeta(currentDay);
  const maxDay = maxNavigableDay(monthNum, year, totalDays);

  if (loading) {
    return <p className="dvc-loading">Loading {month.name} devotional…</p>;
  }

  if (!htmlContent) {
    return (
      <p className="dvc-loading">
        Content unavailable.{" "}
        <Link href="/dvc" className="underline text-primary">
          Back to DVC
        </Link>
      </p>
    );
  }

  return (
    <div className={`dvc-app-viewer dvc-viewer-active`}>
      <div
        ref={sourceRef}
        className="dvc-content-source"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      <div className="dvc-viewer-shell">
        <header className="dvc-toolbar">
          <div className="dvc-toolbar-left">
            <Link href="/dvc" className="dvc-btn">
              All months
            </Link>
            <button type="button" className="dvc-btn" onClick={() => setCalendarOpen(true)}>
              Calendar
            </button>
          </div>
          <div className="dvc-toolbar-center">
           
          </div>
          <div className="dvc-toolbar-right">
            <button type="button" className="dvc-btn primary" onClick={shareDay}>
              Share
            </button>
          </div>
        </header>

        <div
          className="dvc-slider-viewport"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchMove={(e) => {
            touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
          }}
          onTouchEnd={() => {
            if (Math.abs(touchDeltaX.current) < 50) return;
            if (touchDeltaX.current < 0) openDay(currentDay + 1);
            else openDay(currentDay - 1);
            touchDeltaX.current = 0;
          }}
        >
          <div ref={trackRef} className="dvc-slider-track" />
        </div>

        <footer className="dvc-slide-nav">
          <button
            type="button"
            className="dvc-btn"
            disabled={currentDay <= 1}
            onClick={() => openDay(currentDay - 1)}
          >
            ← Prev
          </button>
          <span className="dvc-slide-counter">
            {String(currentDay).padStart(2, "0")} / {totalDays}
          </span>
          <button
            type="button"
            className="dvc-btn"
            disabled={currentDay >= maxDay}
            onClick={() => openDay(currentDay + 1)}
          >
            Next →
          </button>
        </footer>
      </div>

      {calendarOpen && (
        <div
          className="dvc-cal-overlay"
          role="dialog"
          aria-modal
          onClick={(e) => e.target === e.currentTarget && setCalendarOpen(false)}
        >
          <div className="dvc-cal-panel">
            <div className="dvc-cal-head">
              <h2>
                {month.name} {year}
              </h2>
              <button type="button" className="dvc-btn" onClick={() => setCalendarOpen(false)}>
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
                const dm = getDayMeta(day);
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
                      setCalendarOpen(false);
                      openDay(day);
                    }}
                  >
                    <span className="dvc-cal-num">{String(day).padStart(2, "0")}</span>
                    <span className="dvc-cal-theme">{dm.theme}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className={`dvc-toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
