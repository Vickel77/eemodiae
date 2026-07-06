import Link from "next/link";
import { DVCExperimentalBack } from "./DVCExperimentalShell";
import type { DVCMonthConfig } from "../../../lib/dvc/months";
import type { DayEntry } from "../../../lib/dvc/experimentalContent";

type Props = {
  month: DVCMonthConfig;
  days: DayEntry[];
  yearHref: string;
};

export default function DVCOptionBDayGrid({ month, days, yearHref }: Props) {
  const base = `/dvc/b/2026/${month.slug}`;

  return (
    <div
      className="dvc-exp-day-grid-page"
      style={{
        background: month.gradient,
        minHeight: "calc(100vh - 5rem)",
      }}
    >
      <DVCExperimentalBack href={yearHref}>← Months of 2026</DVCExperimentalBack>

      <header className="dvc-exp-hero" style={{ padding: "24px 0 20px" }}>
        <div className="dvc-exp-hero-inner">
          <p className="dvc-exp-eyebrow">House of Joy Church Worldwide</p>
          <h1>{month.name} 2026</h1>
          <p className="dvc-exp-tagline">Choose a day to read its confession</p>
        </div>
      </header>

      <div className="dvc-exp-day-grid">
        {days.map((d) => (
          <Link key={d.day} href={`${base}/${d.day}`} className="dvc-exp-day-card">
            <span className="dvc-exp-day-num">{String(d.day).padStart(2, "0")}</span>
            <span className="dvc-exp-day-theme">{d.theme}</span>
            {d.weekday ? <span className="dvc-exp-day-wd">{d.weekday}</span> : null}
          </Link>
        ))}
      </div>

      <footer className="dvc-exp-foot" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <Link href={yearHref}>← All months</Link>
      </footer>
    </div>
  );
}
