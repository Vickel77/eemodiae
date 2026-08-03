"use client";

import { useState } from "react";
import Link from "next/link";
import { DVC_MONTHS } from "../../../lib/dvc/months";
import {
  isCurrentMonth,
  isMonthNavigable,
  isPastMonth,
  monthReadHref,
} from "../../../lib/dvc/monthUtils";
import dvcHero from "../../../assets/dvc-hero.jpg";

const YEARS = [
  {
    year: 2026,
    status: "Available" as const,
    desc: "July to December · six months",
    gradient: "linear-gradient(160deg,#0c2748,#1b4d86)",
  },
  {
    year: 2027,
    status: "Coming" as const,
    desc: "The full year · in preparation",
    gradient: "linear-gradient(160deg,#1e1205,#3a2a10)",
  },
  {
    year: 2028,
    status: "Coming" as const,
    desc: "The full year · in preparation",
    gradient: "linear-gradient(160deg,#0a1a17,#123028)",
  },
];

function todaysHref(): string {
  const current = DVC_MONTHS.find((m) => isCurrentMonth(m.monthNum, m.year));
  if (current) return monthReadHref(current.slug, current.monthNum, current.year, current.days);
  const latestPast = [...DVC_MONTHS]
    .reverse()
    .find((m) => isPastMonth(m.monthNum, m.year));
  if (latestPast) {
    return monthReadHref(latestPast.slug, latestPast.monthNum, latestPast.year, latestPast.days);
  }
  return `/dvc/${DVC_MONTHS[0].slug}`;
}

/** New /dvc landing — photo hero, then an inline Years → Months picker
 * (no page reload between views), replacing the older two-page flow. */
export default function DVCNewLanding() {
  const [view, setView] = useState<"years" | "months">("years");

  return (
    <div className="dvc-landing-root">
      <header className="hero">
        <h1 className="sr-only">
          Daily Victory Confession — Decree it. See it established. &ldquo;Thou shalt also
          decree a thing, and it shall be established unto thee: and the light shall shine
          upon thy ways.&rdquo; Job 22:28
        </h1>
        <img
          className="hero-img"
          src={dvcHero.src}
          alt="Daily Victory Confession. Decree it. See it established. A worshipper lifting his hands into streaming golden light."
        />
        <div className="hero-edge" />
      </header>

      <div className={"hero-actions" + (view === "months" ? " with-back" : "")}>
        {view === "months" && (
          <button type="button" className="go-back" onClick={() => setView("years")}>
            &larr; Go Back
          </button>
        )}
        <Link className="today-cta" href={todaysHref()}>
          See Today&rsquo;s Devotional &rarr;
        </Link>
      </div>

      <section className={"view" + (view === "years" ? " active" : "")}>
        <div className="years">
          <h2>Choose a Year</h2>
          <p className="sub">A daily devotional, year by year</p>
          <div className="grid">
            {YEARS.map((y) =>
              y.status === "Available" ? (
                <button
                  key={y.year}
                  type="button"
                  className="y-card ready"
                  style={{ ["--yg" as string]: y.gradient }}
                  onClick={() => setView("months")}
                >
                  <div className="y-top">
                    <span className="y-year">{y.year}</span>
                    <span className="y-status ready">Available</span>
                  </div>
                  <div className="y-body">
                    <p className="y-label">Year {y.year}</p>
                    <p className="y-desc">{y.desc}</p>
                  </div>
                </button>
              ) : (
                <div key={y.year} className="y-card" style={{ ["--yg" as string]: y.gradient }}>
                  <div className="y-top">
                    <span className="y-year">{y.year}</span>
                    <span className="y-status soon">Coming</span>
                  </div>
                  <div className="y-body">
                    <p className="y-label">Year {y.year}</p>
                    <p className="y-desc">{y.desc}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className={"view" + (view === "months" ? " active" : "")}>
        <div className="months">
          <h2>The Months of 2026</h2>
          <p className="sub">Six months of daily decrees, each in its own colour</p>
          <div className="grid">
            {DVC_MONTHS.map((m) => {
              const navigable = isMonthNavigable(m.monthNum, m.year);
              const cardStyle = {
                ["--mgrad" as string]: m.gradient,
                ["--mbright" as string]: m.bright,
              };
              return navigable ? (
                <Link
                  key={m.slug}
                  className="m-card ready"
                  style={cardStyle}
                  href={`/dvc/${m.slug}`}
                >
                  <div className="m-top">
                    <span className="m-num">{String(m.monthNum).padStart(2, "0")}</span>
                    <span className="m-status ready">Ready</span>
                  </div>
                  <div className="m-body">
                    <p className="m-name">{m.name}</p>
                    <p className="m-theme">{m.theme}</p>
                    <span className="m-open">Open {m.name} &rarr;</span>
                  </div>
                </Link>
              ) : (
                <div key={m.slug} className="m-card" style={cardStyle}>
                  <div className="m-top">
                    <span className="m-num">{String(m.monthNum).padStart(2, "0")}</span>
                    <span className="m-status soon">Coming</span>
                  </div>
                  <div className="m-body">
                    <p className="m-name">{m.name}</p>
                    <p className="m-theme">{m.theme}</p>
                    <span className="m-soon">Opens {m.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
