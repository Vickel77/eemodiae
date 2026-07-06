import Link from "next/link";
import { DVCExperimentalBack } from "./DVCExperimentalShell";

type Props = {
  option: "A" | "B";
  yearHref: string;
};

export default function DVCExperimentalLanding({ option, yearHref }: Props) {
  const base = option === "A" ? "/dvc/a" : "/dvc/b";

  return (
    <>
      <DVCExperimentalBack href="/dvc">← Production DVC</DVCExperimentalBack>

      <header className="dvc-exp-hero">
        <div className="dvc-exp-hero-inner">
          <p className="dvc-exp-eyebrow">House of Joy Church Worldwide</p>
          <h1>Daily Victory Confession</h1>
          <p className="dvc-exp-tagline">Decree it. See it established.</p>
          <div className="dvc-exp-rule" />
          <p className="dvc-exp-verse">
            &ldquo;Thou shalt also decree a thing, and it shall be established unto thee: and the
            light shall shine upon thy ways.&rdquo;
            <cite>Job 22:28</cite>
          </p>
        </div>
      </header>

      <section className="dvc-exp-section dvc-exp-inner">
        <h2>Choose a Year</h2>
        <p className="sub">A daily devotional, year by year</p>
        <div className="dvc-exp-grid">
          <Link
            href={yearHref}
            className="dvc-exp-card ready"
            style={{ "--card-grad": "linear-gradient(160deg,#0c2748,#1b4d86)" } as React.CSSProperties}
          >
            <div className="dvc-exp-card-top">
              <span className="dvc-exp-card-num">2026</span>
              <span className="dvc-exp-card-status ready">Available</span>
            </div>
            <div className="dvc-exp-card-body">
              <p className="dvc-exp-card-name">Year 2026</p>
              <p className="dvc-exp-card-desc">July to December · six months</p>
              <span className="dvc-exp-card-cta">Open 2026 →</span>
            </div>
          </Link>
          <div
            className="dvc-exp-card"
            style={{ "--card-grad": "linear-gradient(160deg,#1e1205,#3a2a10)" } as React.CSSProperties}
          >
            <div className="dvc-exp-card-top">
              <span className="dvc-exp-card-num">2027</span>
              <span className="dvc-exp-card-status">Coming</span>
            </div>
            <div className="dvc-exp-card-body">
              <p className="dvc-exp-card-name">Year 2027</p>
              <p className="dvc-exp-card-desc">The full year · in preparation</p>
            </div>
          </div>
          <div
            className="dvc-exp-card"
            style={{ "--card-grad": "linear-gradient(160deg,#0a1a17,#123028)" } as React.CSSProperties}
          >
            <div className="dvc-exp-card-top">
              <span className="dvc-exp-card-num">2028</span>
              <span className="dvc-exp-card-status">Coming</span>
            </div>
            <div className="dvc-exp-card-body">
              <p className="dvc-exp-card-name">Year 2028</p>
              <p className="dvc-exp-card-desc">The full year · in preparation</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="dvc-exp-foot dvc-exp-inner">
        <p>House of Joy Church Worldwide</p>
        <p className="dvc-exp-tagline" style={{ marginTop: 8 }}>
          Preaching Christ · Changing Lives
        </p>
        <p style={{ marginTop: 16 }}>
          <a href="https://www.eemodiae.org">www.eemodiae.org</a>
        </p>
        <p style={{ marginTop: 8, fontSize: "0.86rem" }}>
          Also try{" "}
          <Link href={option === "A" ? "/dvc/b" : "/dvc/a"}>
            Option {option === "A" ? "B" : "A"}
          </Link>{" "}
          · <Link href={base}>Demo home</Link>
        </p>
      </footer>
    </>
  );
}
