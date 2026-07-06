import Link from "next/link";
import { DVCExperimentalBack } from "./DVCExperimentalShell";
import type { DVCMonthConfig } from "../../../lib/dvc/months";

type Props = {
  option: "A" | "B";
  months: DVCMonthConfig[];
  landingHref: string;
  monthHref: (slug: string) => string;
};

export default function DVCExperimentalYear({
  option,
  months,
  landingHref,
  monthHref,
}: Props) {
  return (
    <>
      <DVCExperimentalBack href={landingHref}>← All Years</DVCExperimentalBack>

      <header className="dvc-exp-hero" style={{ paddingBottom: 30 }}>
        <div className="dvc-exp-hero-inner">
          <p className="dvc-exp-eyebrow">House of Joy Church Worldwide</p>
          <h1>Daily Victory Confession · 2026</h1>
          <p className="dvc-exp-tagline">Decree it. See it established.</p>
        </div>
      </header>

      <section className="dvc-exp-section dvc-exp-inner">
        <h2>The Months of 2026</h2>
        <p className="sub">
          {option === "A"
            ? "Six months — each opens as one scrolling page"
            : "Six months — pick a day to read"}
        </p>
        <div className="dvc-exp-grid">
          {months.map((m) => (
            <Link
              key={m.slug}
              href={monthHref(m.slug)}
              className="dvc-exp-card ready"
              style={{ "--card-grad": m.gradient } as React.CSSProperties}
            >
              <div className="dvc-exp-card-top">
                <span className="dvc-exp-card-num">{String(m.monthNum).padStart(2, "0")}</span>
                <span className="dvc-exp-card-status ready">Ready</span>
              </div>
              <div className="dvc-exp-card-body">
                <p className="dvc-exp-card-name">{m.name}</p>
                <p className="dvc-exp-card-desc">{m.theme}</p>
                <span className="dvc-exp-card-cta">Open {m.name} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="dvc-exp-foot dvc-exp-inner">
        <p>House of Joy Church Worldwide</p>
        <p style={{ marginTop: 8 }}>
          <Link href={landingHref}>← Back to years</Link>
        </p>
      </footer>
    </>
  );
}
