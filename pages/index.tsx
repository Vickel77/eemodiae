import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Nav from "../components/redesign/Nav";
import Footer from "../components/redesign/Footer";
import useReveal from "../components/redesign/useReveal";
import useContentful from "../hooks/useContentful";
import { SITE_CONTACT_EMAIL } from "../lib/siteContact";

/* ============================================================
   eemodiae.org — HOME
   Ported 1:1 from the redesign. Warm-gold serif design system
   (Cinzel / Cormorant Garamond / Crimson Pro / EB Garamond).
   Shared chrome comes from <Nav /> and <Footer />.
   ============================================================ */

const TRUST = [
  { num: "365", label: "Daily Confessions", count: 365 },
  { num: "120+", label: "Messages & Sermons", count: 120 },
  { num: "50+", label: "Poems & Articles", count: 50 },
  { num: "HJCW", label: "House of Joy Worldwide", count: null },
];

const START = [
  {
    href: "/dvc",
    step: "Step One",
    title: "Decree Today\u2019s Word",
    body: "Open the Daily Victory Confession and speak the promise of God over your day.",
    go: "Read the DVC \u2192",
  },
  {
    href: "/messages",
    step: "Step Two",
    title: "Hear A Message",
    body: "Sit under prophetic teaching that stirs faith and reveals your purpose.",
    go: "Listen now \u2192",
  },
  {
    href: "/about",
    step: "Step Three",
    title: "Know The Story",
    body: "Meet Emmanuel and the heart behind the ministry, the pulpit, and the pen.",
    go: "Read the story \u2192",
  },
];

type LatestCard = {
  meta: string;
  title: string;
  excerpt: string;
  href: string;
  link: string;
  image?: string;
};

const cleanSlug = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const stripHtml = (html: string) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const absUrl = (u?: string) => {
  if (!u) return "";
  const s = String(u);
  return s.startsWith("http") ? s : s.startsWith("//") ? "https:" + s : "https:" + s;
};

const imgOf = (a: any) =>
  absUrl(
    a?.image ||
      a?.imageUrl?.fields?.file?.url ||
      a?.image_url?.fields?.file?.url ||
      a?.imageUrl
  );

const excerptFrom = (raw: string, fallback: string) => {
  const t = stripHtml(raw);
  if (!t || t.startsWith("(")) return fallback;
  return t.length > 140 ? t.slice(0, 140).trim() + "…" : t;
};

const IconMessage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconArticle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const IconMusic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const POEMS = [
  {
    num: "I",
    title: "What Is Time",
    body: "Time is eternity taking a break. The summation of human existence is captured within this brief ephemeral break...",
  },
  {
    num: "II",
    title: "Ghost Mode",
    body: "Many have gone incognito. I don\u2019t mean WhatsApp where some do it to secretly keep tabs on your info. I mean some have gone ghost mode...",
  },
  {
    num: "III",
    title: "Everything Is Working",
    body: "They heard my dreams. They said it cannot start. I started it. They said it will not last...",
  },
];

const TESTI = [
  {
    quote:
      "My family and I have witnessed prophetic words from God\u2019s servant come to fruition, including the miraculous conception of our child exactly as he declared.",
    name: "Jasmine O.",
    img: "/redesign/testi-1.jpg",
  },
  {
    quote:
      "I am deeply grateful to God that I encountered Pastor Emmanuel Emodiae early in life. His life, teachings, and ministry have been a tremendous blessing to me.",
    name: "Mercy A. E.",
    img: "/redesign/testi-2.jpg",
  },
  {
    quote:
      "When hope seemed lost, God\u2019s Word through Pastor Emmanuel Emodiae became the turning point that ushered me into restoration, healing, and enduring testimonies of His faithfulness.",
    name: "Victor M.",
    img: "/redesign/testi-3.jpg",
  },
];

/* The site-wide globals.css sets html/body { font-size: 1.25rem } (20px base),
   which inflates every rem-based size on this page ~25% versus the redesign,
   which assumes a 16px root. Reset the root to 16px only while the Home page
   is mounted (a class is toggled on <html>) so legacy pages are unaffected. */
const HomeBase = createGlobalStyle`
  html.home-redesign-root {
    font-size: 16px;
  }
`;

const Home: NextPage = styled(({ className }: { className?: string }) => {
  useReveal();
  const trustRef = useRef<HTMLDivElement>(null);
  const counted = useRef(false);
  const { getMessages, getArticles, getMusic, messages, articles, music } =
    useContentful();

  useEffect(() => {
    getMessages();
    getArticles();
    getMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestCards = useMemo<LatestCard[]>(() => {
    // Prefer a standalone teaching (no series category) so ?m= opens the play screen
    const list = (messages || []) as any[];
    const msg = list.find((a) => a && !a.category) || list[0] || null;
    const art = (articles || [])[0] as any;
    const song = (music || [])[0] as any;

    const msgSlug = cleanSlug(msg?.title || "");
    const artSlug = cleanSlug(art?.title || "");
    let artBody = "";
    try {
      // Contentful rich text may already be a string, or document JSON
      if (typeof art?.content === "string") artBody = art.content;
      else if (art?.excerpt) artBody = String(art.excerpt);
      else if (art?.description) artBody = String(art.description);
    } catch {
      /* ignore */
    }

    const msgIsSeries = Boolean(msg?.category);
    const msgHref = !msgSlug
      ? "/messages"
      : msgIsSeries
        ? `/messages?series=${encodeURIComponent(cleanSlug(String(msg.category || msg.title)))}`
        : `/messages?m=${encodeURIComponent(msgSlug)}`;

    return [
      {
        meta: "Message",
        title: msg?.title || "Latest Message",
        excerpt: excerptFrom(
          msg?.description || msg?.subtitle || msg?.excerpt || msg?.overview || "",
          "Sit under prophetic teaching that stirs faith and reveals your purpose."
        ),
        href: msgHref,
        link: "Listen now \u2192",
        image: imgOf(msg),
      },
      {
        meta: "Article",
        title: art?.title || "Latest Article",
        excerpt: excerptFrom(
          artBody || art?.excerpt || "",
          "Read the newest word from the article vault."
        ),
        href: artSlug ? `/articles?read=${encodeURIComponent(artSlug)}` : "/articles",
        link: "Read now \u2192",
        image: imgOf(art),
      },
      {
        meta: "Music",
        title: song?.title || "Latest Release",
        excerpt: excerptFrom(
          song?.artiste || song?.artist || song?.description || "",
          "A featured song from the eemodiae catalogue."
        ),
        href: "/music",
        link: "Play now \u2192",
        image: imgOf(song),
      },
    ];
  }, [messages, articles, music]);

  // Insulate this page from the site-wide 20px root font-size (globals.css)
  // so the redesign's rem-based sizing matches the mockup's 16px base.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-redesign-root");
    return () => root.classList.remove("home-redesign-root");
  }, []);

  useEffect(() => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    const runCount = () => {
      if (counted.current) return;
      counted.current = true;
      document
        .querySelectorAll<HTMLElement>(".el-trust__num[data-count]")
        .forEach((el) => {
          const target = parseInt(el.getAttribute("data-count") || "0", 10);
          const suffix = /\+/.test(el.textContent || "") ? "+" : "";
          if (reduce) {
            el.textContent = target + suffix;
            return;
          }
          let t0: number | null = null;
          const dur = 1400;
          const step = (ts: number) => {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
    };

    const trust = trustRef.current;
    if (trust && "IntersectionObserver" in window && !reduce) {
      const to = new IntersectionObserver(
        (e) => {
          if (e[0].isIntersecting) {
            runCount();
            to.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      to.observe(trust);
      return () => to.disconnect();
    }
    runCount();
  }, []);

  return (
    <div className={`eemodiae-page${className ? ` ${className}` : ""}`}>
      <HomeBase />
      <Head>
        <title>Emmanuel I. Emodiae · Prophet | Preacher | Poet</title>
        <meta
          name="description"
          content="A prophetic voice calling believers to deepen their faith, discover their purpose, and walk boldly in the destiny God has written for them."
        />
        <meta name="keyword" content="Preacher, Prophet, Poet" />
        <meta property="og:site_name" content="Emmanuel I. Emodiae" />
        <meta
          property="og:title"
          content="Emmanuel I. Emodiae · Prophet | Preacher | Poet"
          key="title"
        />
        <meta
          property="og:description"
          content="Preaching Christ...Changing Lives!"
          key="description"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Emmanuel I. Emodiae" />
        <meta name="twitter:description" content="Prophet | Preacher | Poet" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@eemodiae" />
      </Head>

      <Nav />

      {/* ============================ HERO ============================ */}
      <section className="el-hero" id="top">
        <div className="el-hero__bg" aria-hidden="true" />
        <div className="el-hero__scrim" aria-hidden="true" />
        <div className="el-hero__grain" aria-hidden="true" />
        <div className="el-hero__inner">
          <div className="el-hero__copy">
            <p className="el-eyebrow el-hero__eyebrow">
              PROPHET | PREACHER | POET
            </p>
            <h1 className="el-hero__title">Emmanuel I. Emodiae</h1>
            <p className="el-hero__lead">
              A prophetic voice calling believers to deepen their faith,
              discover their purpose, and walk boldly in the destiny God has
              written for them.
            </p>
            <p className="el-hero__tagline">Preaching Christ...Changing Lives!</p>
          </div>
        </div>
        <div className="el-hero__scroll" aria-hidden="true">
          Scroll<span />
        </div>
      </section>

      <main id="main">
        {/* ============================ TRUST BAND ============================ */}
        <section className="el-trust" aria-label="Ministry at a glance">
          <div className="el-trust__inner" ref={trustRef}>
            {TRUST.map((t, i) => (
              <Fragment key={t.label}>
                <div className="el-trust__item">
                  {t.count != null ? (
                    <span className="el-trust__num" data-count={t.count}>
                      {t.num}
                    </span>
                  ) : (
                    <span className="el-trust__num">{t.num}</span>
                  )}
                  <span className="el-trust__label">{t.label}</span>
                </div>
                {i < TRUST.length - 1 && <div className="el-trust__divider" />}
              </Fragment>
            ))}
          </div>
        </section>

        {/* ============================ WAYFINDING ============================ */}
        <section className="el-section el-section--dark">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">New Here?</span>
              <h2>Start Here</h2>
              <p>Three simple ways to begin. Pick the door that fits today.</p>
              <div className="el-rule" />
            </div>
            <div className="el-start">
              {START.map((s) => (
                <Link
                  href={s.href}
                  className="el-start__card el-reveal"
                  key={s.step}
                >
                  <span className="el-start__step">{s.step}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <span className="el-start__go">{s.go}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ LATEST STRIP ============================ */}
        <section className="el-section el-section--cream">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">Fresh From The Spirit</span>
              <h2>Latest</h2>
              <p>
                The newest word, writing, and revelation, gathered in one place.
              </p>
              <div className="el-rule" />
            </div>
            <div className="el-latest">
              {latestCards.map((c) => (
                <Link href={c.href} className="el-card el-reveal" key={c.meta}>
                  <div
                    className={
                      "el-card__media" + (c.image ? "" : " el-card__media--dummy")
                    }
                  >
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt="" loading="lazy" />
                    ) : c.meta === "Message" ? (
                      <IconMessage />
                    ) : c.meta === "Article" ? (
                      <IconArticle />
                    ) : (
                      <IconMusic />
                    )}
                  </div>
                  <div className="el-card__body">
                    <span className="el-card__meta">{c.meta}</span>
                    <h3 className="el-card__title">{c.title}</h3>
                    <p className="el-card__excerpt">{c.excerpt}</p>
                    <span className="el-card__link">{c.link}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ POEMS ============================ */}
        <section className="el-section el-section--dark">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">In Verse</span>
              <h2>Poems</h2>
              <p>Where scripture meets the ache and wonder of being human.</p>
              <div className="el-rule" />
            </div>
            <div className="el-poems">
              {POEMS.map((p) => (
                <article className="el-poem el-reveal" key={p.num}>
                  <span className="el-poem__num">{p.num}</span>
                  <h3 className="el-poem__title">{p.title}</h3>
                  <p className="el-poem__body">{p.body}</p>
                  <Link href="/poems" className="el-poem__link">
                    Read poem &rarr;
                  </Link>
                </article>
              ))}
            </div>
            <div
              style={{ textAlign: "center", marginTop: 48 }}
              className="el-reveal"
            >
              <Link href="/poems" className="el-btn el-btn--ghost">
                All Poems
              </Link>
            </div>
          </div>
        </section>

        {/* ============================ ABOUT ============================ */}
        <section className="el-section el-section--light">
          <div className="el-wrap el-about__inner">
            <div className="el-about__media el-reveal">
              <div className="el-about__frame">
                <img
                  src="/redesign/about-portrait.jpg"
                  alt="Emmanuel I. Emodiae in prayer"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="el-about__copy el-reveal">
              <span className="el-eyebrow">About Me</span>
              <h2>A Voice For Your Destiny</h2>
              <p>
                I am a passionate and prophetic preacher of Jesus Christ, called
                to share His transformative message with a generation hungry for
                more.
              </p>
              <p>
                Through my ministry, I aim to inspire believers to deepen their
                faith, discover their purpose, and walk in the destiny God has
                ordained for their lives. Whether through the pulpit, the pen,
                or the poem, the mission is one: to point every heart back to
                Him.
              </p>
              <p className="el-about__sig">Emmanuel I. Emodiae</p>
              <div className="el-about__cta">
                <Link href="/about" className="el-btn el-btn--dark">
                  My Full Story
                </Link>
                <a
                  href={`mailto:${SITE_CONTACT_EMAIL}?subject=Request%20for%20Mentorship`}
                  className="el-btn el-btn--ghost"
                  style={{ color: "var(--coffee)", borderColor: "var(--line)" }}
                >
                  Request Mentorship
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ TESTIMONIALS ============================ */}
        <section className="el-section el-section--cream">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">Changed Lives</span>
              <h2>Testimonies</h2>
              <p>What the Word has done in the lives of those who received it.</p>
              <div className="el-rule" />
            </div>
            <div className="el-testi">
              {TESTI.map((t) => (
                <article className="el-testi__card el-reveal" key={t.name}>
                  <div className="el-testi__stars" aria-label="Five stars">
                    ★★★★★
                  </div>
                  <p className="el-testi__quote">{t.quote}</p>
                  <div className="el-testi__who">
                    <div className="el-testi__avatar">
                      <img src={t.img} alt={t.name} loading="lazy" />
                    </div>
                    <div>
                      <div className="el-testi__name">{t.name}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ STORE ============================ */}
        <section className="el-section el-section--light">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">The Store</span>
              <h2>Coming Soon</h2>
              <p>
                The bookstore is under construction. Books and resources will be available here shortly.
              </p>
              <div className="el-rule" />
            </div>
            <div
              style={{ textAlign: "center", marginTop: 36 }}
              className="el-reveal"
            >
              <Link href="/shop" className="el-btn el-btn--dark">
                Visit The Store
              </Link>
            </div>
          </div>
        </section>

        {/* ============================ CTA BAND ============================ */}
        <section className="el-ctacards">
          <div className="el-ctacards__wrap">
            <div className="el-ctacard el-reveal">
              <h2>Invite Emmanuel To Minister</h2>
              <p>
                For conferences, crusades, and speaking engagements, let&rsquo;s
                begin the conversation.
              </p>
              <div className="el-ctacard__cta">
                <Link href="/bookings" className="el-btn el-btn--dark">
                  Book An Engagement
                </Link>
              </div>
            </div>
            <div className="el-ctacard el-ctacard--alt el-reveal">
              <h2>Become A Partner</h2>
              <p>
                Sow your seed today and take your place in the harvest. Every
                gift carries this ministry further.
              </p>
              <div className="el-ctacard__cta">
                <Link href="/give" className="el-btn el-btn--dark">
                  Partner &amp; Give
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
})`
  /* ---------- design tokens + base ---------- */
  --ivory: #faf6ee;
  --cream: #f5f0e6;
  --coffee: #4a3b2a;
  --chocolate: #2c2013;
  --text-on-light: #2c2013;
  --muted-on-light: #6b5a44;
  --line: rgba(201, 162, 75, 0.22);
  --line-soft: rgba(201, 162, 75, 0.12);

  background: var(--ivory);
  color: var(--text-on-light);
  font-family: "Crimson Pro", "EB Garamond", Georgia, serif;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;

  --hero-img: url("/redesign/home-hero.jpg");
  --hero-img-mobile: url("/redesign/home-hero-mobile.jpg");

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  img {
    max-width: 100%;
    display: block;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  h1,
  h2,
  h3 {
    font-family: "Cinzel", serif;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.15;
  }
  .el-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  @media (max-width: 768px) {
    .el-wrap {
      padding: 0 18px;
    }
  }
  .el-eyebrow {
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #b8923f;
  }

  /* ---------- buttons ---------- */
  .el-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-family: "Cinzel", serif;
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.95rem 1.8rem;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
      box-shadow 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
      background 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
      color 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
  }
  .el-btn:focus-visible {
    outline: 2px solid #e4c169;
    outline-offset: 3px;
  }
  .el-btn--ghost {
    background: transparent;
    border-color: rgba(201, 162, 75, 0.22);
    color: #e4c169;
  }
  .el-btn--ghost:hover {
    background: rgba(201, 162, 75, 0.1);
    transform: translateY(-3px);
  }
  .el-btn--dark {
    background: #2c2013;
    color: #f5f0e6;
  }
  .el-btn--dark:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 44px -20px rgba(0, 0, 0, 0.5);
  }
  @media (prefers-reduced-motion: reduce) {
    .el-btn:hover {
      transform: none;
    }
  }

  /* ============================ HERO ============================ */
  .el-hero {
    position: relative;
    background: #080606;
    color: #efe7d6;
    overflow: hidden;
    min-height: calc(100vh - 74px);
    display: flex;
    align-items: center;
  }
  .el-hero__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image: var(--hero-img);
    background-size: cover;
    background-position: 72% top;
    background-repeat: no-repeat;
  }
  .el-hero__scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
        90deg,
        #080606 0%,
        rgba(8, 6, 6, 0.92) 26%,
        rgba(8, 6, 6, 0.55) 48%,
        rgba(8, 6, 6, 0.05) 66%,
        rgba(8, 6, 6, 0) 80%
      ),
      linear-gradient(
        180deg,
        rgba(8, 6, 6, 0.55) 0%,
        rgba(8, 6, 6, 0) 22%,
        rgba(8, 6, 6, 0) 74%,
        rgba(8, 6, 6, 0.65) 100%
      );
  }
  .el-hero__grain {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    pointer-events: none;
    mix-blend-mode: overlay;
  }
  .el-hero__inner {
    position: relative;
    z-index: 3;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 64px 24px;
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    min-height: calc(100vh - 74px);
  }
  .el-hero__copy {
    max-width: 600px;
    padding: 40px 0;
  }
  .el-hero__eyebrow {
    margin-bottom: 1.4rem;
    color: #c9a24b;
    opacity: 0;
    animation: elFadeUp 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) 0.1s forwards;
  }
  .el-hero__title {
    font-size: clamp(2.6rem, 6.2vw, 4.6rem);
    font-weight: 700;
    color: #f5f0e6;
    line-height: 1.06;
    margin-bottom: 1.1rem;
    opacity: 0;
    animation: elFadeUp 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) 0.22s forwards;
  }
  .el-hero__lead {
    font-family: "Cormorant Garamond", serif;
    font-size: clamp(1.15rem, 2.4vw, 1.5rem);
    color: #efe7d6;
    line-height: 1.5;
    margin-bottom: 2rem;
    max-width: 34ch;
    opacity: 0;
    animation: elFadeUp 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) 0.34s forwards;
  }
  .el-hero__tagline {
    margin-top: 2.2rem;
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-weight: 500;
    color: #e4c169;
    font-size: clamp(1.05rem, 4.6vw, 1.7rem);
    letter-spacing: 0.03em;
    white-space: nowrap;
    opacity: 0;
    animation: elFadeUp 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) 0.46s forwards;
  }
  .el-hero__scroll {
    position: absolute;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #b8ad97;
    font-family: "Cinzel", serif;
    font-size: 0.6rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }
  .el-hero__scroll span {
    width: 1px;
    height: 34px;
    background: linear-gradient(#c9a24b, transparent);
    animation: elScrollPulse 2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
  }
  @keyframes elFadeUp {
    from {
      opacity: 0;
      transform: translateY(22px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes elScrollPulse {
    0%,
    100% {
      opacity: 0.3;
      transform: scaleY(0.6);
    }
    50% {
      opacity: 1;
      transform: scaleY(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .el-hero__eyebrow,
    .el-hero__title,
    .el-hero__lead,
    .el-hero__tagline {
      animation: none;
      opacity: 1;
    }
    .el-hero__scroll span {
      animation: none;
    }
  }
  @media (max-width: 860px) {
    .el-hero__bg {
      background-image: var(--hero-img-mobile);
      background-position: center 12%;
    }
    .el-hero__scrim {
      background: linear-gradient(
        180deg,
        rgba(8, 6, 6, 0.15) 0%,
        rgba(8, 6, 6, 0.35) 42%,
        rgba(8, 6, 6, 0.82) 66%,
        #080606 100%
      );
    }
    .el-hero__inner {
      padding: 48px 24px 64px;
      align-items: flex-end;
    }
    .el-hero__copy {
      max-width: none;
      padding-top: 44vh;
      text-align: center;
    }
    .el-hero__lead {
      margin-left: auto;
      margin-right: auto;
    }
    .el-hero__tagline {
      margin-top: 1.6rem;
    }
  }

  /* ============================ TRUST BAND ============================ */
  .el-trust {
    background: #2c2013;
    color: #f5f0e6;
    border-top: 1px solid rgba(201, 162, 75, 0.12);
    border-bottom: 1px solid rgba(201, 162, 75, 0.12);
  }
  .el-trust__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2.6rem;
    padding: 26px 24px;
  }
  .el-trust__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 120px;
  }
  .el-trust__num {
    font-family: "Cinzel", serif;
    font-size: 1.7rem;
    font-weight: 700;
    color: #e4c169;
    line-height: 1;
  }
  .el-trust__label {
    font-family: "Cinzel", serif;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #b8ad97;
    margin-top: 0.4rem;
  }
  .el-trust__divider {
    width: 1px;
    height: 38px;
    background: rgba(201, 162, 75, 0.22);
    align-self: center;
  }
  @media (max-width: 640px) {
    .el-trust__divider {
      display: none;
    }
    .el-trust__inner {
      gap: 1.8rem 2.6rem;
    }
  }

  /* ============================ SECTION SHELL ============================ */
  .el-section {
    padding: 96px 0;
  }
  .el-section--light {
    background: var(--ivory);
  }
  .el-section--cream {
    background: var(--cream);
  }
  .el-section--dark {
    background: radial-gradient(
        120% 80% at 20% 0%,
        rgba(201, 162, 75, 0.12),
        transparent 50%
      ),
      linear-gradient(160deg, #141118, #211a33);
    color: #efe7d6;
  }
  .el-head {
    text-align: center;
    max-width: 640px;
    margin: 0 auto 58px;
  }
  .el-head .el-eyebrow {
    display: block;
    margin-bottom: 1rem;
  }
  .el-head h2 {
    font-size: clamp(2rem, 4.4vw, 2.9rem);
    color: inherit;
    margin-bottom: 1rem;
  }
  .el-section--dark .el-head h2 {
    color: #f5f0e6;
  }
  .el-head p {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.25rem;
    color: var(--muted-on-light);
  }
  .el-section--dark .el-head p {
    color: #b8ad97;
  }
  .el-rule {
    width: 64px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #c9a24b, transparent);
    margin: 1.2rem auto 0;
  }

  /* reveal on scroll */
  .el-reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-reveal.is-in {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .el-reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }

  /* ============================ WAYFINDING ============================ */
  .el-start {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
  }
  .el-start__card {
    display: block;
    background: linear-gradient(
      160deg,
      rgba(201, 162, 75, 0.1),
      rgba(20, 17, 24, 0.35)
    );
    border: 1px solid rgba(201, 162, 75, 0.22);
    border-radius: 18px;
    padding: 2rem 1.8rem;
    transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    position: relative;
    overflow: hidden;
  }
  .el-start__card:hover {
    transform: translateY(-6px);
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.6);
  }
  .el-start__step {
    font-family: "Cinzel", serif;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #b8923f;
  }
  .el-start__card h3 {
    font-family: "Cinzel", serif;
    font-size: 1.15rem;
    color: #e4c169;
    margin: 0.5rem 0 0.6rem;
  }
  .el-start__card p {
    font-size: 1rem;
    color: #b8ad97;
  }
  .el-start__card .el-start__go {
    margin-top: 1rem;
    font-family: "Cinzel", serif;
    font-size: 0.64rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b8923f;
    display: inline-flex;
    gap: 0.4rem;
    transition: gap 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-start__card:hover .el-start__go {
    gap: 0.7rem;
    color: #e4c169;
  }
  @media (max-width: 820px) {
    .el-start {
      grid-template-columns: 1fr;
      max-width: 440px;
      margin: 0 auto;
    }
  }

  /* ============================ LATEST STRIP ============================ */
  .el-latest {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
  }
  .el-card {
    background: var(--ivory);
    border: 1px solid var(--line-soft);
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      border-color 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 18px 44px -20px rgba(0, 0, 0, 0.5);
    border-color: rgba(201, 162, 75, 0.22);
  }
  .el-card__media {
    aspect-ratio: 16/10;
    position: relative;
    overflow: hidden;
    background: linear-gradient(150deg, #2a2233, #171019);
  }
  .el-card__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .el-card__body {
    padding: 1.6rem 1.5rem 1.8rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .el-card__meta {
    font-family: "Cinzel", serif;
    font-size: 0.6rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b8923f;
    margin-bottom: 0.6rem;
  }
  .el-card__title {
    font-family: "Cinzel", serif;
    font-size: 1.1rem;
    color: var(--coffee);
    line-height: 1.3;
    margin-bottom: 0.6rem;
  }
  .el-card__excerpt {
    font-size: 1rem;
    color: var(--muted-on-light);
    flex: 1;
  }
  .el-card__link {
    margin-top: 1.1rem;
    font-family: "Cinzel", serif;
    font-size: 0.66rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b8923f;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: gap 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
      color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-card:hover .el-card__link {
    gap: 0.7rem;
    color: #e4c169;
  }
  .el-card__media--dummy {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(201, 162, 75, 0.22);
  }
  .el-card__media--dummy svg {
    width: 40px;
    height: 40px;
    opacity: 0.5;
  }
  @media (max-width: 800px) {
    .el-latest {
      grid-template-columns: 1fr;
      max-width: 440px;
      margin: 0 auto;
    }
  }

  /* ============================ POEMS ============================ */
  .el-poems {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
  }
  .el-poem {
    background: linear-gradient(
      160deg,
      rgba(201, 162, 75, 0.08),
      rgba(20, 17, 24, 0.35)
    );
    border: 1px solid rgba(201, 162, 75, 0.22);
    border-radius: 18px;
    padding: 2.2rem 2rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    position: relative;
    overflow: hidden;
  }
  .el-poem::before {
    content: "\\201C";
    position: absolute;
    top: 2px;
    right: 18px;
    font-family: "Cormorant Garamond", serif;
    font-size: 4.5rem;
    color: rgba(201, 162, 75, 0.12);
    line-height: 1;
  }
  .el-poem:hover {
    transform: translateY(-8px);
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.6);
  }
  .el-poem__num {
    font-family: "Cinzel", serif;
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    color: #b8923f;
  }
  .el-poem__title {
    font-family: "Cinzel", serif;
    font-size: 1.2rem;
    color: #e4c169;
    margin: 0.6rem 0 1rem;
    letter-spacing: 0.06em;
  }
  .el-poem__body {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.15rem;
    font-style: italic;
    color: #efe7d6;
    line-height: 1.55;
    flex: 1;
  }
  .el-poem__link {
    margin-top: 1.4rem;
    font-family: "Cinzel", serif;
    font-size: 0.64rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b8923f;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: gap 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
      color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-poem:hover .el-poem__link {
    gap: 0.7rem;
    color: #e4c169;
  }
  @media (max-width: 800px) {
    .el-poems {
      grid-template-columns: 1fr;
      max-width: 440px;
      margin: 0 auto;
    }
  }

  /* ============================ ABOUT ============================ */
  .el-about__inner {
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 56px;
    align-items: center;
  }
  .el-about__media {
    position: relative;
  }
  .el-about__frame {
    aspect-ratio: 4/5;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(201, 162, 75, 0.22);
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.6);
    background: linear-gradient(150deg, #241d2e, #171019);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .el-about__frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .el-about__copy h2 {
    font-size: clamp(2rem, 4.4vw, 2.8rem);
    color: #4a3b2a;
    margin: 1rem 0 1.2rem;
  }
  .el-about__copy p {
    font-size: 1.12rem;
    color: #6b5a44;
    margin-bottom: 1.2rem;
    max-width: 52ch;
  }
  .el-about__sig {
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-size: 1.6rem;
    color: #b8923f;
    margin-top: 1.4rem;
  }
  .el-about__cta {
    margin-top: 1.8rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
  }
  @media (max-width: 800px) {
    .el-about__inner {
      grid-template-columns: 1fr;
      gap: 36px;
    }
    .el-about__media {
      max-width: 360px;
      margin: 0 auto;
    }
  }

  /* ============================ TESTIMONIALS ============================ */
  .el-testi {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
  }
  .el-testi__card {
    background: #faf6ee;
    border: 1px solid rgba(201, 162, 75, 0.12);
    border-radius: 18px;
    padding: 2.2rem 2rem;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-testi__card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 44px -20px rgba(0, 0, 0, 0.5);
  }
  .el-testi__stars {
    color: #c9a24b;
    letter-spacing: 0.2em;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  .el-testi__quote {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.25rem;
    font-style: italic;
    color: #4a3b2a;
    line-height: 1.5;
    flex: 1;
  }
  .el-testi__who {
    margin-top: 1.4rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  .el-testi__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #c9a24b, #b8923f);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Cinzel", serif;
    color: #241a08;
    font-size: 1rem;
    font-weight: 600;
    overflow: hidden;
  }
  .el-testi__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  .el-testi__name {
    font-family: "Cinzel", serif;
    font-size: 0.82rem;
    color: #4a3b2a;
    letter-spacing: 0.04em;
  }
  @media (max-width: 820px) {
    .el-testi {
      grid-template-columns: 1fr;
      max-width: 460px;
      margin: 0 auto;
    }
  }

  /* ============================ STORE ============================ */
  .el-store {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;
  }
  .el-book {
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-book:hover {
    transform: translateY(-8px);
  }
  .el-book__cover {
    aspect-ratio: 2/3;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 18px 44px -20px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(201, 162, 75, 0.12);
    background: linear-gradient(150deg, #2a2233, #171019);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .el-book__cover--dummy {
    flex-direction: column;
    gap: 0.5rem;
    color: rgba(201, 162, 75, 0.22);
    text-align: center;
    padding: 1rem;
  }
  .el-book__cover--dummy span {
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-size: 1.05rem;
    color: #b8ad97;
  }
  .el-book__title {
    font-family: "Cinzel", serif;
    font-size: 0.86rem;
    color: #4a3b2a;
    margin-top: 1rem;
    line-height: 1.35;
  }
  .el-book__price {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.05rem;
    color: #b8923f;
    margin-top: 0.3rem;
  }
  @media (max-width: 800px) {
    .el-store {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ============================ CTA CARDS ============================ */
  .el-ctacards {
    background: #f5f0e6;
    padding: clamp(56px, 9vw, 96px) 20px clamp(40px, 6vw, 64px);
  }
  .el-ctacards__wrap {
    max-width: 760px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: clamp(28px, 5vw, 44px);
  }
  .el-ctacard {
    background: linear-gradient(135deg, #e4c169, #c9a24b 50%, #b8923f);
    color: #241a08;
    text-align: center;
    border-radius: 28px;
    padding: clamp(44px, 7vw, 68px) clamp(24px, 5vw, 52px);
    box-shadow: 0 30px 60px -28px rgba(58, 44, 16, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
  .el-ctacard--alt {
    background: linear-gradient(135deg, #b8923f, #c9a24b 50%, #e4c169);
  }
  .el-ctacard h2 {
    font-size: clamp(1.7rem, 4vw, 2.4rem);
    color: #241a08;
    margin: 0 0 1rem;
    line-height: 1.15;
  }
  .el-ctacard p {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.25rem;
    color: #3a2c10;
    margin: 0 auto 2rem;
    max-width: 42ch;
    line-height: 1.5;
  }
  .el-ctacard__cta {
    display: flex;
    justify-content: center;
  }
`;

export default Home;
