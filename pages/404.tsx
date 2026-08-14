import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Nav from "../components/redesign/Nav";
import Footer from "../components/redesign/Footer";

/* ============================================================
   Interactive 404 — keep visitors in the house.
   Shows the broken path, ranks close matches, and offers a live
   destination finder so people land somewhere useful instead of
   bouncing.
   ============================================================ */

type Destination = {
  href: string;
  label: string;
  blurb: string;
  aliases: string[];
};

const DESTINATIONS: Destination[] = [
  { href: "/", label: "Home", blurb: "Start again from the front door.", aliases: ["home", "index", "start"] },
  { href: "/about", label: "About", blurb: "The ministry and Emmanuel’s story.", aliases: ["about", "bio", "emmanuel", "ministry", "story"] },
  { href: "/articles", label: "Articles", blurb: "Written teaching and reflections.", aliases: ["articles", "article", "blog", "write", "writing"] },
  { href: "/poems", label: "Poems", blurb: "Spirit-breathed poetry.", aliases: ["poems", "poem", "poetry", "verse"] },
  { href: "/messages", label: "Messages", blurb: "Audio messages and series.", aliases: ["messages", "message", "sermon", "sermons", "teaching", "word"] },
  { href: "/messages/podcasts", label: "Podcasts", blurb: "Podcast episodes and listens.", aliases: ["podcasts", "podcast", "pod"] },
  { href: "/messages/series", label: "Series", blurb: "Message series collections.", aliases: ["series", "collection"] },
  { href: "/dvc", label: "Daily Voice Call", blurb: "Today’s DVC devotion.", aliases: ["dvc", "devotion", "devotional", "daily", "voice", "call"] },
  { href: "/music", label: "Music", blurb: "Songs, artistes and albums.", aliases: ["music", "song", "songs", "album", "albums", "artiste", "artist"] },
  { href: "/shop", label: "Store", blurb: "Books and ministry resources.", aliases: ["shop", "store", "book", "books", "bookstore"] },
  { href: "/testimonies", label: "Testimonies", blurb: "Lives changed by Christ.", aliases: ["testimonies", "testimony", "stories", "witness"] },
  { href: "/bookings", label: "Bookings", blurb: "Invite Emmanuel to minister.", aliases: ["bookings", "booking", "invite", "speak", "speaking", "appointment"] },
  { href: "/events", label: "Events", blurb: "Gatherings, crusades and campaigns.", aliases: ["events", "event", "crusade", "conference"] },
  { href: "/give", label: "Give", blurb: "Partner with the work.", aliases: ["give", "offering", "tithe", "partner", "donation", "sow"] },
];

const DVC_MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const normalize = (s: string) =>
  s.toLowerCase().replace(/[%20_+]+/g, " ").replace(/[^a-z0-9/\s-]/g, " ").replace(/\s+/g, " ").trim();

const tokensOf = (path: string) =>
  normalize(path)
    .split(/[/\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t && t !== "www" && t !== "eemodiae" && t !== "org" && t !== "html" && t !== "php");

/** Tiny Levenshtein for typo tolerance on short tokens. */
const editDistance = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    let prev = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cur = a[i] === b[j] ? row[j] : 1 + Math.min(row[j], row[j + 1], prev);
      row[j] = prev;
      prev = cur;
    }
    row[b.length] = prev;
  }
  return row[b.length];
};

const scoreDestination = (dest: Destination, pathTokens: string[], query: string) => {
  const hay = [dest.label, dest.href, ...dest.aliases].map(normalize);
  let score = 0;

  for (const token of pathTokens) {
    for (const h of hay) {
      if (h === token) score += 12;
      else if (h.includes(token) || token.includes(h)) score += 7;
      else if (token.length >= 3 && editDistance(token, h) <= 1) score += 8;
      else if (token.length >= 5 && editDistance(token, h) <= 2) score += 5;
    }
  }

  if (query) {
    const q = normalize(query);
    for (const h of hay) {
      if (h === q) score += 20;
      else if (h.startsWith(q) || h.includes(q)) score += 10;
      else if (q.length >= 3 && editDistance(q, h) <= 1) score += 8;
    }
  }

  return score;
};

const parentHint = (rawPath: string): Destination | null => {
  const clean = rawPath.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const parts = clean.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const parent = "/" + parts[0];
  return DESTINATIONS.find((d) => d.href === parent) || null;
};

const dvcMonthHint = (pathTokens: string[]): Destination | null => {
  for (const token of pathTokens) {
    for (const month of DVC_MONTHS) {
      if (token === month || (token.length >= 4 && editDistance(token, month) <= 2)) {
        return {
          href: `/dvc/${month}`,
          label: `DVC · ${month[0].toUpperCase()}${month.slice(1)}`,
          blurb: `Open the ${month} Daily Voice Call.`,
          aliases: [month, "dvc"],
        };
      }
    }
  }
  return null;
};

const Wrap = styled.div`
  min-height: 100vh;
  background: var(--ee-bg);
  color: var(--ee-ink);

  .nf-shell {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    padding: 7.5rem 1.25rem 4.5rem;
  }

  .nf-shell::before {
    content: "";
    position: absolute;
    inset: -20% -10% auto;
    height: 70%;
    background:
      radial-gradient(ellipse 55% 50% at 18% 30%, rgba(201, 162, 75, 0.18), transparent 70%),
      radial-gradient(ellipse 45% 55% at 88% 20%, rgba(76, 45, 143, 0.12), transparent 68%),
      radial-gradient(ellipse 40% 40% at 50% 80%, rgba(201, 162, 75, 0.08), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .nf-orbit {
    position: absolute;
    inset: 8% 0 auto;
    height: 320px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.55;
  }

  .nf-orbit span {
    position: absolute;
    font-family: "Cinzel", serif;
    font-weight: 600;
    color: var(--ee-gold);
    opacity: 0.14;
    user-select: none;
    animation: nf-float 7s ease-in-out infinite;
  }

  .nf-orbit span:nth-child(1) { left: 8%; top: 10%; font-size: clamp(4rem, 14vw, 9rem); animation-delay: 0s; }
  .nf-orbit span:nth-child(2) { left: 42%; top: 0; font-size: clamp(5rem, 18vw, 11rem); animation-delay: -2.2s; opacity: 0.1; }
  .nf-orbit span:nth-child(3) { right: 6%; top: 18%; font-size: clamp(4rem, 14vw, 9rem); animation-delay: -4.1s; }

  @keyframes nf-float {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-18px) rotate(2deg); }
  }

  .nf-inner {
    position: relative;
    z-index: 1;
    max-width: 920px;
    margin: 0 auto;
  }

  .nf-kicker {
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ee-gold-rich);
    margin-bottom: 1rem;
  }

  .nf-title {
    font-family: "Cormorant Garamond", serif;
    font-weight: 500;
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    line-height: 1.08;
    letter-spacing: -0.01em;
    color: var(--ee-ink);
    margin: 0 0 0.85rem;
  }

  .nf-lead {
    font-family: "Cormorant Garamond", serif;
    font-size: clamp(1.15rem, 2.4vw, 1.4rem);
    line-height: 1.45;
    color: var(--ee-ink-soft);
    max-width: 38rem;
    margin: 0 0 1.75rem;
  }

  .nf-path {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
    max-width: 100%;
    padding: 0.7rem 1rem;
    border: 1px solid var(--ee-line);
    background: color-mix(in srgb, var(--ee-surface) 88%, transparent);
    backdrop-filter: blur(8px);
    margin-bottom: 1.75rem;
  }

  .nf-path__label {
    font-family: "Cinzel", serif;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ee-muted);
  }

  .nf-path__value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.92rem;
    color: var(--ee-ink);
    word-break: break-all;
  }

  .nf-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 2.75rem;
  }

  .nf-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.85rem;
    padding: 0.7rem 1.25rem;
    border: 1px solid transparent;
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  }

  .nf-btn:hover { transform: translateY(-2px); }
  .nf-btn:focus-visible { outline: 2px solid var(--ee-gold); outline-offset: 3px; }

  .nf-btn--primary {
    background: var(--ee-inverse);
    color: var(--ee-on-inverse);
  }

  .nf-btn--ghost {
    background: transparent;
    border-color: var(--ee-line);
    color: var(--ee-gold-rich);
  }

  .nf-btn--ghost:hover {
    background: color-mix(in srgb, var(--ee-gold) 12%, transparent);
  }

  .nf-panel {
    border-top: 1px solid var(--ee-line-soft);
    padding-top: 2rem;
  }

  .nf-panel__head {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .nf-panel__title {
    font-family: "Cinzel", serif;
    font-size: 0.78rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ee-ink);
    margin: 0 0 0.35rem;
  }

  .nf-panel__sub {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.15rem;
    color: var(--ee-muted);
    margin: 0;
  }

  .nf-search {
    position: relative;
    width: min(100%, 280px);
  }

  .nf-search input {
    width: 100%;
    min-height: 2.7rem;
    padding: 0.65rem 0.9rem 0.65rem 2.4rem;
    border: 1px solid var(--ee-line);
    background: var(--ee-surface);
    color: var(--ee-ink);
    font-family: "Cormorant Garamond", serif;
    font-size: 1.1rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .nf-search input::placeholder { color: var(--ee-muted); }
  .nf-search input:focus {
    border-color: var(--ee-gold);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ee-gold) 22%, transparent);
  }

  .nf-search svg {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    width: 1rem;
    height: 1rem;
    transform: translateY(-50%);
    color: var(--ee-muted);
    pointer-events: none;
  }

  .nf-suggest {
    margin-bottom: 1.5rem;
  }

  .nf-suggest__label {
    font-family: "Cinzel", serif;
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ee-gold-rich);
    margin-bottom: 0.65rem;
  }

  .nf-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
  }

  .nf-card {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1.05rem 1.1rem 1.15rem;
    text-decoration: none;
    color: inherit;
    border: 1px solid var(--ee-line-soft);
    background: var(--ee-surface);
    transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
  }

  .nf-card:hover,
  .nf-card.is-hot {
    transform: translateY(-3px);
    border-color: var(--ee-gold);
    background: var(--ee-surface-hi);
  }

  .nf-card.is-hot {
    box-shadow: inset 3px 0 0 var(--ee-gold);
  }

  .nf-card__label {
    font-family: "Cinzel", serif;
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ee-ink);
  }

  .nf-card__blurb {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.05rem;
    line-height: 1.35;
    color: var(--ee-muted);
  }

  .nf-card__href {
    margin-top: 0.35rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.72rem;
    color: var(--ee-gold-rich);
  }

  .nf-empty {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.15rem;
    color: var(--ee-muted);
    padding: 1rem 0;
  }

  .nf-foot-note {
    margin-top: 2rem;
    font-family: "Cormorant Garamond", serif;
    font-size: 1.05rem;
    color: var(--ee-muted);
  }

  .nf-foot-note a {
    color: var(--ee-gold-rich);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 640px) {
    .nf-shell { padding-top: 6.5rem; }
    .nf-path { width: 100%; }
    .nf-search { width: 100%; }
  }
`;

const NotFound: NextPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const brokenPath = useMemo(() => {
    if (!mounted) return "";
    const asPath = router.asPath || "";
    if (!asPath || asPath === "/404" || asPath.startsWith("/404?")) {
      if (typeof window !== "undefined") return window.location.pathname + window.location.search;
      return "";
    }
    return asPath;
  }, [mounted, router.asPath]);

  const pathTokens = useMemo(() => tokensOf(brokenPath), [brokenPath]);

  const ranked = useMemo(() => {
    const scored = DESTINATIONS.map((d) => ({
      dest: d,
      score: scoreDestination(d, pathTokens, query),
    })).sort((a, b) => b.score - a.score || a.dest.label.localeCompare(b.dest.label));

    if (query.trim()) {
      return scored.filter((s) => s.score > 0).map((s) => s.dest);
    }
    return scored.map((s) => s.dest);
  }, [pathTokens, query]);

  const closeMatches = useMemo(() => {
    const month = dvcMonthHint(pathTokens);
    const parent = parentHint(brokenPath);
    const top = DESTINATIONS.map((d) => ({
      dest: d,
      score: scoreDestination(d, pathTokens, ""),
    }))
      .filter((s) => s.score >= 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.dest);

    const extras: Destination[] = [];
    if (month) extras.push(month);
    if (parent && !top.some((t) => t.href === parent.href) && !extras.some((e) => e.href === parent.href)) {
      extras.push({ ...parent, blurb: `Close to what you opened — the ${parent.label} section.` });
    }

    const merged = [...extras, ...top].filter(
      (d, i, arr) => arr.findIndex((x) => x.href === d.href) === i
    );
    return merged.slice(0, 4);
  }, [brokenPath, pathTokens]);

  const displayPath = brokenPath || "/…";

  return (
    <Wrap className="eemodiae-page">
      <Head>
        <title>Page not found · eemodiae</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className="nf-shell">
        <div className="nf-orbit" aria-hidden="true">
          <span>4</span>
          <span>0</span>
          <span>4</span>
        </div>
        <div className="nf-inner">
          <p className="nf-kicker">Lost, but not left behind</p>
          <h1 className="nf-title">This path doesn’t live here.</h1>
          <p className="nf-lead">
            The link may be old, mistyped, or moved. Stay with us — we’ll walk you
            to the nearest door, or back to where you meant to go.
          </p>

          {displayPath ? (
            <div className="nf-path" aria-live="polite">
              <span className="nf-path__label">You opened</span>
              <code className="nf-path__value">{displayPath}</code>
            </div>
          ) : null}

          <div className="nf-actions">
            <Link href="/" className="nf-btn nf-btn--primary">
              Go home
            </Link>
            <button
              type="button"
              className="nf-btn nf-btn--ghost"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
            >
              Go back
            </button>
            {closeMatches[0] ? (
              <Link href={closeMatches[0].href} className="nf-btn nf-btn--ghost">
                Try {closeMatches[0].label}
              </Link>
            ) : null}
          </div>

          {closeMatches.length > 0 && !query.trim() ? (
            <div className="nf-suggest">
              <p className="nf-suggest__label">Closest to your link</p>
              <div className="nf-grid">
                {closeMatches.map((d) => (
                  <Link key={d.href} href={d.href} className="nf-card is-hot">
                    <span className="nf-card__label">{d.label}</span>
                    <span className="nf-card__blurb">{d.blurb}</span>
                    <span className="nf-card__href">{d.href}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <section className="nf-panel" aria-labelledby="nf-find-title">
            <div className="nf-panel__head">
              <div>
                <h2 id="nf-find-title" className="nf-panel__title">
                  Find your way
                </h2>
                <p className="nf-panel__sub">Type a word — messages, DVC, give, poems…</p>
              </div>
              <div className="nf-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where were you headed?"
                  aria-label="Filter destinations"
                  autoComplete="off"
                />
              </div>
            </div>

            {ranked.length ? (
              <div className="nf-grid">
                {ranked.map((d, i) => (
                  <Link
                    key={d.href}
                    href={d.href}
                    className={`nf-card${i === 0 && query.trim() ? " is-hot" : ""}`}
                  >
                    <span className="nf-card__label">{d.label}</span>
                    <span className="nf-card__blurb">{d.blurb}</span>
                    <span className="nf-card__href">{d.href}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="nf-empty">
                No matches for “{query}”. Try home, messages, or DVC — or{" "}
                <Link href="/">return home</Link>.
              </p>
            )}

            <p className="nf-foot-note">
              Still stuck? Reach us from the footer, or write{" "}
              <a href="mailto:eemodiaeweb@gmail.com">eemodiaeweb@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </Wrap>
  );
};

export default NotFound;
