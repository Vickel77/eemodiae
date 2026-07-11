"use client";

import Head from "next/head";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../Navbar";
import BookCover from "./BookCover";
import { DEFAULT_STORE_CONFIG } from "../../lib/store/config";
import {
  PLATFORM_META,
  catColor,
  coursePeekFor,
  findItem,
  fmt,
  isCourse,
  matchesSearch,
  paginationMeta,
  peekFor,
  toneOf,
} from "../../lib/store/helpers";
import type { StoreBook, StoreConfig, StoreCourse, StoreItem } from "../../lib/store/types";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
    FlutterwaveCheckout?: (opts: Record<string, unknown>) => void;
  }
}

type Props = {
  initialOpenId?: string;
};

function PeekText({ text }: { text: string }) {
  const parts = text.split("\n\n").filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className={i === 0 ? "peek-open" : i === parts.length - 1 ? "peek-close" : undefined}>
          {p}
        </p>
      ))}
    </>
  );
}

export default function BookstorePage({ initialOpenId }: Props) {
  const [store, setStore] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [currency, setCurrency] = useState<"USD" | "NGN">(
    DEFAULT_STORE_CONFIG.settings.defaultCurrency || "USD"
  );
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookPage, setBookPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);
  const [currentItem, setCurrentItem] = useState<StoreItem | null>(null);
  const [peekOpen, setPeekOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [deliveryRef, setDeliveryRef] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"shelves" | "academy">("shelves");
  const [quicknavPinned, setQuicknavPinned] = useState(false);
  const [quicknavSlotHeight, setQuicknavSlotHeight] = useState(0);
  const [topbarHeight, setTopbarHeight] = useState(0);
  const shelvesRef = useRef<HTMLElement>(null);
  const academyRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const quicknavRef = useRef<HTMLElement>(null);
  const quicknavWrapRef = useRef<HTMLDivElement>(null);
  const quicknavSentinelRef = useRef<HTMLDivElement>(null);

  const fxRate = store.settings.fxRate;
  const perBook = store.settings.booksPerPage || 12;
  const perCourse = store.settings.coursesPerPage || 6;

  const featured = useMemo(
    () => store.books.find((b) => b.id === store.featuredId) || store.books[0],
    [store]
  );

  const filteredBooks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return store.books.filter(
      (b) =>
        (activeFilter === "All" || b.category === activeFilter) &&
        matchesSearch(b, term)
    );
  }, [store.books, activeFilter, searchTerm]);

  const bookPg = useMemo(
    () => paginationMeta(filteredBooks.length, perBook, bookPage),
    [filteredBooks.length, perBook, bookPage]
  );

  const bookSlice = useMemo(
    () => filteredBooks.slice((bookPage - 1) * perBook, bookPage * perBook),
    [filteredBooks, bookPage, perBook]
  );

  const coursePg = useMemo(
    () => paginationMeta(store.courses.length, perCourse, coursePage),
    [store.courses.length, perCourse, coursePage]
  );

  const courseSlice = useMemo(
    () => store.courses.slice((coursePage - 1) * perCourse, coursePage * perCourse),
    [store.courses, coursePage, perCourse]
  );

  const categories = useMemo(
    () => [
      "All",
      ...store.categories.filter((c) => store.books.some((b) => b.category === c)),
    ],
    [store]
  );

  const openModal = useCallback((id: string, withPeek = false) => {
    const item = findItem(store, id);
    if (!item) return;
    setCurrentItem(item);
    setDeliveryRef(null);
    setPeekOpen(withPeek);
  }, [store]);

  const closeModal = useCallback(() => {
    setCurrentItem(null);
    setPeekOpen(false);
    setDeliveryRef(null);
  }, []);

  useEffect(() => {
    if (initialOpenId) openModal(initialOpenId);
  }, [initialOpenId, openModal]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eemodiae-theme") as "day" | "night" | null;
      if (saved) setTheme(saved);
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        setTheme("night");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("eemodiae-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (indexOpen || currentItem) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [indexOpen, currentItem]);

  useEffect(() => {
    const url = store.settings.externalConfigUrl;
    if (!url) return;
    fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((ext) => {
        if (ext?.books?.length) {
          setStore({
            settings: { ...DEFAULT_STORE_CONFIG.settings, ...(ext.settings || {}) },
            payments: { ...DEFAULT_STORE_CONFIG.payments, ...(ext.payments || {}) },
            categories: ext.categories || DEFAULT_STORE_CONFIG.categories,
            featuredId: ext.featuredId || DEFAULT_STORE_CONFIG.featuredId,
            books: ext.books,
            courses: Array.isArray(ext.courses)
              ? ext.courses
              : DEFAULT_STORE_CONFIG.courses,
          });
        }
      })
      .catch(() => undefined);
  }, [store.settings.externalConfigUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        setIndexOpen(false);
        document.body.style.overflow = "";
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);

  useEffect(() => {
    const sections = [
      { el: shelvesRef.current, tab: "shelves" as const },
      { el: academyRef.current, tab: "academy" as const },
    ].filter((s) => s.el);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const match = sections.find((s) => s.el === e.target);
          if (match) setActiveTab(match.tab);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => s.el && spy.observe(s.el));
    return () => spy.disconnect();
  }, [store.courses.length]);

  useEffect(() => {
    const topbar = topbarRef.current;
    const root = topbar?.closest(".bookstore-root") as HTMLElement | null;
    if (!topbar || !root) return;

    const syncTopbarHeight = () => {
      const height = topbar.offsetHeight;
      setTopbarHeight(height);
      root.style.setProperty("--store-topbar-h", `${height}px`);
    };

    syncTopbarHeight();
    const ro = new ResizeObserver(syncTopbarHeight);
    ro.observe(topbar);
    window.addEventListener("resize", syncTopbarHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncTopbarHeight);
    };
  }, []);

  useEffect(() => {
    const sentinel = quicknavSentinelRef.current;
    if (!sentinel) return;

    const readCssPx = (styles: CSSStyleDeclaration, name: string, fallbackRem: number) => {
      const raw = styles.getPropertyValue(name).trim();
      if (!raw) return fallbackRem * 16;
      if (raw.endsWith("px")) return parseFloat(raw) || fallbackRem * 16;
      return (parseFloat(raw) || fallbackRem) * 16;
    };

    const pinLinePx = () => {
      const root = sentinel.closest(".bookstore-root");
      const styles = root ? getComputedStyle(root) : getComputedStyle(document.documentElement);
      const navPx = readCssPx(styles, "--store-nav-h", 5);
      const topbarPx = topbarHeight || readCssPx(styles, "--store-topbar-h", 3.25);
      const gapPx = readCssPx(styles, "--store-quicknav-gap", 0.15);
      return navPx + topbarPx + gapPx;
    };

    const pinObserver = new IntersectionObserver(
      ([entry]) => {
        setQuicknavPinned(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: `-${pinLinePx()}px 0px 0px 0px` }
    );

    pinObserver.observe(sentinel);

    const onResize = () => {
      pinObserver.disconnect();
      pinObserver.observe(sentinel);
    };
    window.addEventListener("resize", onResize);
    return () => {
      pinObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [topbarHeight]);

  useEffect(() => {
    const nav = quicknavRef.current;
    const wrap = quicknavWrapRef.current;
    if (!nav || !wrap) return;

    const measure = () => {
      const padTop = parseFloat(getComputedStyle(wrap).paddingTop) || 0;
      setQuicknavSlotHeight(nav.offsetHeight + padTop);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".bookstore-root .reveal:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  });

  useEffect(() => {
    if (bookPage > bookPg.pages) setBookPage(bookPg.pages);
  }, [bookPage, bookPg.pages]);

  useEffect(() => {
    if (coursePage > coursePg.pages) setCoursePage(coursePg.pages);
  }, [coursePage, coursePg.pages]);

  const onPaid = (ref: string) => {
    setDeliveryRef(ref);
  };

  const askEmail = () => {
    const e = prompt("Enter your email for your receipt and download:");
    return e && e.includes("@") ? e.trim() : null;
  };

  const payPaystack = () => {
    if (!currentItem || !window.PaystackPop) return;
    const email = askEmail();
    if (!email) return;
    const amountNGN = Number(
      currentItem.priceNGN || Math.round(currentItem.priceUSD * fxRate)
    );
    const handler = window.PaystackPop.setup({
      key: store.payments.paystackPublicKey,
      email,
      amount: amountNGN * 100,
      currency: "NGN",
      metadata: {
        custom_fields: [
          { display_name: "Book", variable_name: "book_id", value: currentItem.id },
        ],
      },
      callback: (res: { reference: string }) => onPaid(res.reference),
      onClose: () => undefined,
    });
    handler.openIframe();
  };

  const payFlutterwave = (cur: "USD" | "NGN") => {
    if (!currentItem || !window.FlutterwaveCheckout) return;
    const email = askEmail();
    if (!email) return;
    const amount =
      cur === "USD"
        ? Number(currentItem.priceUSD)
        : Number(currentItem.priceNGN || Math.round(currentItem.priceUSD * fxRate));
    window.FlutterwaveCheckout({
      public_key: store.payments.flutterwavePublicKey,
      tx_ref: `eemodiae-${currentItem.id}-${Date.now()}`,
      amount,
      currency: cur,
      payment_options: "card,banktransfer,ussd,mobilemoney",
      customer: { email },
      meta: { book_id: currentItem.id },
      customizations: {
        title: "eemodiae.org Bookstore",
        description: currentItem.title,
      },
      callback: (res: { status?: string; tx_ref?: string }) => {
        if (res.status === "successful" || res.status === "completed") {
          onPaid(res.tx_ref || "");
        }
      },
      onclose: () => undefined,
    });
  };

  const renderPagination = (
    meta: ReturnType<typeof paginationMeta>,
    page: number,
    setPage: (n: number) => void
  ) => {
    if (!meta.show) return null;
    return (
      <nav className="pagination" aria-label="Pages">
        <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          ‹
        </button>
        {meta.navPages.map((n, i) =>
          n === -1 ? (
            <span key={`e-${i}`} className="p-ellipsis">
              ···
            </span>
          ) : (
            <button
              key={n}
              type="button"
              className={n === page ? "current" : ""}
              aria-current={n === page ? "page" : undefined}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= meta.pages}
          onClick={() => setPage(page + 1)}
        >
          ›
        </button>
      </nav>
    );
  };

  const modalCourse = currentItem && isCourse(currentItem, store);
  const modalBook = currentItem as StoreBook | null;
  const modalTone = currentItem ? toneOf(currentItem) : catColor();
  const modalPrice = currentItem ? fmt(currentItem, currency, fxRate) : null;
  const fulfilUrl =
    currentItem &&
    (modalCourse ? (currentItem as StoreCourse).accessUrl : modalBook?.downloadUrl);

  const indexGroups = categories
    .filter((c) => c !== "All")
    .map((cat) => ({
      cat,
      books: store.books.filter((b) => b.category === cat),
    }))
    .filter((g) => g.books.length);

  return (
    <div
      className={`bookstore-root${theme === "night" ? " night" : ""}${
        indexOpen ? " ix-open" : ""
      }`}
    >
      <Head>
        <title>The Bookstore | eemodiae.org</title>
        <meta
          name="description"
          content="Books, devotionals, and study resources by Pastor Emmanuel I. Emodiae. Available worldwide in USD and NGN."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Script src="https://js.paystack.co/v2/inline.js" strategy="lazyOnload" />
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="lazyOnload" />

      <Navbar />

      <div className="aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
        <span className="a4" />
      </div>

      <header className="topbar" ref={topbarRef}>
        <div className="theme-toggle" role="group" aria-label="Appearance">
          <button
            type="button"
            id="thDay"
            className={theme === "day" ? "active" : ""}
            onClick={() => setTheme("day")}
          >
            <span className="t-ico">✷</span> Day
          </button>
          <button
            type="button"
            id="thNight"
            className={theme === "night" ? "active" : ""}
            onClick={() => setTheme("night")}
          >
            <span className="t-ico">☾</span> Night
          </button>
        </div>
        <div className="currency-toggle" role="group" aria-label="Currency">
          <button
            type="button"
            id="curUSD"
            className={currency === "USD" ? "active" : ""}
            onClick={() => setCurrency("USD")}
          >
            $ USD
          </button>
          <button
            type="button"
            id="curNGN"
            className={currency === "NGN" ? "active" : ""}
            onClick={() => setCurrency("NGN")}
          >
            ₦ NGN
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-banner">
          <img src="/images/store-hero.jpg" alt="The Eemodiae Bookstore" />
        </div>
      </section>

      <div className="quicknav-wrap" ref={quicknavWrapRef}>
        <div ref={quicknavSentinelRef} className="quicknav-sentinel" aria-hidden="true" />
        {quicknavPinned ? (
          <div
            className="quicknav-spacer"
            style={{ height: quicknavSlotHeight }}
            aria-hidden="true"
          />
        ) : null}
        <nav
          ref={quicknavRef}
          className={`quicknav${quicknavPinned ? " is-pinned" : ""}`}
          aria-label="Store sections"
        >
          <a
            href="#shelves"
            className={`qn-tab${activeTab === "shelves" ? " active" : ""}`}
            id="qnBooks"
          >
            <span className="qn-ico">❦</span> The Shelves
          </a>
          <a
            href="#academy"
            className={`qn-tab${activeTab === "academy" ? " active" : ""}`}
            id="qnAcademy"
          >
            <span className="qn-ico">✦</span> The Academy
          </a>
          <button type="button" className="qn-tab qn-index" onClick={() => setIndexOpen(true)}>
            <span className="qn-ico">☰</span> Library Index
          </button>
        </nav>
      </div>

      {featured ? (
        <section className="featured reveal in" id="featured">
          <BookCover book={featured} size="lg" />
          <div className="featured-copy">
            <p className="eyebrow">Featured Volume</p>
            <h2>{featured.title}</h2>
            <p className="sub" style={{ color: catColor(featured.category).deep }}>
              {featured.subtitle}
            </p>
            <p className="desc">{featured.description}</p>
            <p className="featured-price">
              {fmt(featured, currency, fxRate).main}
              <span className="alt">{fmt(featured, currency, fxRate).alt}</span>
            </p>
            <button className="btn btn-gold" type="button" onClick={() => openModal(featured.id)}>
              Get this book
            </button>
          </div>
        </section>
      ) : null}

      <section className="shelf" id="shelves" ref={shelvesRef}>
        <div className="shelf-head reveal">
          <h2>The Shelves</h2>
          <p>Every volume, in dollars or naira, delivered to your hands or your device</p>
        </div>
        <div className="search-wrap reveal">
          <span className="s-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            id="searchBox"
            placeholder="Search the library by title, theme, or word"
            aria-label="Search the library"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setBookPage(1);
            }}
          />
        </div>
        <div className="filters reveal" id="filters">
          {categories.map((cat) => {
            const c = cat === "All" ? catColor() : catColor(cat);
            return (
              <button
                key={cat}
                type="button"
                className={cat === activeFilter ? "active" : ""}
                style={{ "--chip": c.tone } as React.CSSProperties}
                onClick={() => {
                  setActiveFilter(cat);
                  setBookPage(1);
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="grid" id="grid">
          {bookSlice.length ? (
            bookSlice.map((b) => {
              const p = fmt(b, currency, fxRate);
              const c = toneOf(b);
              return (
                <article key={b.id} className="card reveal in" style={{ "--tone": c.tone } as React.CSSProperties}>
                  <div className="ribbon" aria-hidden="true" />
                  {b.comingSoon ? <span className="soon-seal">Coming Soon</span> : null}
                  <BookCover book={b} />
                  <p className="cat-tag">{b.category}</p>
                  <h3>{b.title}</h3>
                  <p className="card-sub">{b.subtitle}</p>
                  <div className="badges">
                    {(b.formats || []).map((f) => (
                      <span key={f} className="badge">
                        {f}
                      </span>
                    ))}
                  </div>
                  <p className="price">
                    {p.main}
                    <span className="alt">also {p.alt}</span>
                  </p>
                  <div className="card-actions">
                    <button
                      className="btn btn-tone"
                      type="button"
                      onClick={() => openModal(b.id)}
                    >
                      {b.comingSoon ? "Reserve a copy" : "Get this book"}
                    </button>
                    <button
                      className="peek-mini"
                      type="button"
                      aria-label={`Read the one page peek for ${b.title}`}
                      onClick={() => openModal(b.id, true)}
                    >
                      ❧ Peek
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <p
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                fontFamily: "var(--serif-head)",
                fontStyle: "italic",
                color: "var(--ink-soft)",
                fontSize: "1.15rem",
                padding: "2rem 0",
              }}
            >
              No volumes match your search yet. Try another word, or clear the search to see the
              whole library.
            </p>
          )}
        </div>
        {renderPagination(bookPg, bookPage, (n) => {
          setBookPage(n);
          shelvesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        })}
        {bookPg.note ? <p className="page-note">{bookPg.note} volumes</p> : null}
      </section>

      {store.courses.length ? (
        <section className="academy" id="academy" ref={academyRef}>
          <div className="academy-head reveal">
            <p className="a-eyebrow">The Academy</p>
            <h2>Online Courses</h2>
            <p>Learn at your own pace, taught in the voice you trust</p>
          </div>
          <div className="lifetime-banner reveal">
            <span className="lb-mark">✦</span>
            <span>
              One payment. <strong>Lifetime access.</strong> Every lesson, every update, yours
              forever.
            </span>
            <span className="lb-mark">✦</span>
          </div>
          <div className="course-grid" id="courseGrid">
            {courseSlice.map((c) => {
              const p = fmt(c, currency, fxRate);
              const t = toneOf(c);
              const meta = [
                c.modules ? `${c.modules} modules` : "",
                c.hours ? `${c.hours}+ hours` : "",
                c.level || "",
              ]
                .filter(Boolean)
                .map((m) => <span key={m}>{m}</span>);
              return (
                <article
                  key={c.id}
                  className="course-card reveal in"
                  style={
                    {
                      "--tone": t.tone,
                      "--tone-deep": t.deep,
                    } as React.CSSProperties
                  }
                >
                  <span className="lifetime-seal">✦ Lifetime Access</span>
                  <div className="c-band">
                    <p className="c-track">{c.track || "Course"}</p>
                    <h3>{c.title}</h3>
                  </div>
                  <div className="c-body">
                    <p className="c-desc">{c.description}</p>
                    <div className="course-meta">{meta}</div>
                    <div className="c-footer">
                      <p className="price">
                        {p.main}
                        <span className="alt">also {p.alt}</span>
                      </p>
                      <div className="card-actions">
                        <button className="btn btn-tone" type="button" onClick={() => openModal(c.id)}>
                          Enroll now
                        </button>
                        <button
                          className="peek-mini"
                          type="button"
                          aria-label={`Read the one page peek for ${c.title}`}
                          onClick={() => openModal(c.id, true)}
                        >
                          ❧ Peek
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {renderPagination(coursePg, coursePage, (n) => {
            setCoursePage(n);
            academyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          })}
          {coursePg.note ? <p className="page-note">{coursePg.note} courses</p> : null}
        </section>
      ) : null}

      <footer>
        <div className="glass-rule" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <p className="f-brand">Eemodiae.org</p>
        <p className="f-sub">Prophet | Preacher | Poet</p>
        <p className="f-links">
          <a href="https://eemodiae.org" rel="noopener">
            eemodiae.org
          </a>{" "}
          · @thehjcw on all platforms
        </p>
        <p className="f-note">
          © House of Joy Church Worldwide. All titles by Pastor Emmanuel I. Emodiae.
        </p>
      </footer>

      <div
        className="index-veil"
        id="indexVeil"
        onClick={() => setIndexOpen(false)}
      />
      <aside
        className="index-drawer"
        id="indexDrawer"
        role="dialog"
        aria-modal="true"
        aria-label="Library index"
      >
        <div className="ix-head">
          <div>
            <p className="ix-title">Library Index</p>
            <p className="ix-sub" id="ixCount">
              {store.books.length} books · {store.courses.length} courses
              {store.books.some((b) => b.comingSoon)
                ? ` · ${store.books.filter((b) => b.comingSoon).length} coming soon`
                : ""}
            </p>
          </div>
          <button className="ix-close" aria-label="Close index" type="button" onClick={() => setIndexOpen(false)}>
            ×
          </button>
        </div>
        <div className="ix-list" id="indexList">
          {indexGroups.map((g) => (
            <div key={g.cat} className="ix-group">
              <p className="ix-cat">
                {g.cat}
                <span>{g.books.length}</span>
              </p>
              {g.books.map((b) => {
                const t = toneOf(b);
                const p = fmt(b, currency, fxRate);
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`ix-row${b.comingSoon ? " soon" : ""}`}
                    style={{ "--tone": t.tone } as React.CSSProperties}
                    onClick={() => {
                      setIndexOpen(false);
                      openModal(b.id);
                    }}
                  >
                    <span className="ix-dot" aria-hidden="true" />
                    <span className="ix-t">{b.title}</span>
                    <span className="ix-meta">{b.comingSoon ? "Coming Soon" : p.main}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {store.courses.length ? (
            <div className="ix-group">
              <p className="ix-cat">
                The Academy
                <span>{store.courses.length}</span>
              </p>
              {store.courses.map((c) => {
                const t = toneOf(c);
                const p = fmt(c, currency, fxRate);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="ix-row"
                    style={{ "--tone": t.tone } as React.CSSProperties}
                    onClick={() => {
                      setIndexOpen(false);
                      openModal(c.id);
                    }}
                  >
                    <span className="ix-dot" aria-hidden="true" />
                    <span className="ix-t">{c.title}</span>
                    <span className="ix-meta">{p.main}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </aside>

      <div
        className={`modal-veil${currentItem ? " open" : ""}`}
        id="modalVeil"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        onClick={(e) => e.currentTarget === e.target && closeModal()}
      >
        {currentItem && modalPrice ? (
          <div className="modal">
            <div className="modal-ribbon" aria-hidden="true" />
            <button className="modal-close" aria-label="Close" type="button" onClick={closeModal}>
              ×
            </button>
            <h3 id="modalTitle">{currentItem.title}</h3>
            <p className="modal-sub" id="modalSub">
              {modalBook?.subtitle ||
                (modalCourse
                  ? [
                      (currentItem as StoreCourse).modules
                        ? `${(currentItem as StoreCourse).modules} modules`
                        : "",
                      (currentItem as StoreCourse).hours
                        ? `${(currentItem as StoreCourse).hours}+ hours of teaching`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : "")}
            </p>
            <p className="modal-price" id="modalPrice">
              {modalPrice.main}{" "}
              <span style={{ color: "var(--ink-soft)", fontSize: ".8em" }}>· {modalPrice.alt}</span>
            </p>
            <div id="modalBody">
              {modalCourse ? (
                <p className="modal-lifetime">
                  <span className="lb-mark">✦</span> One payment. Lifetime access. Every lesson and
                  every future update, yours forever.
                </p>
              ) : null}

              {modalBook?.comingSoon ? (
                <div className="soon-note">
                  <p className="sn-line">
                    <span className="lb-mark">✦</span> This volume is on the press. It will appear
                    on these shelves the moment it is released.
                  </p>
                  <a
                    className="btn btn-gold"
                    href={`mailto:${store.settings.supportEmail}?subject=${encodeURIComponent(`Reserve: ${currentItem.title}`)}`}
                  >
                    Reserve your copy
                  </a>
                </div>
              ) : null}

              {!modalBook?.comingSoon &&
              (store.payments.paystackPublicKey || store.payments.flutterwavePublicKey) ? (
                <>
                  <p className="modal-section-label">Buy direct, instant delivery</p>
                  <div className="platform-list">
                    {store.payments.paystackPublicKey ? (
                      <button type="button" style={{ "--pm": "#1E7F63" } as React.CSSProperties} onClick={payPaystack}>
                        <span className="p-mark">₦</span>
                        <span>
                          Pay in Naira
                          <small>Paystack secure checkout</small>
                        </span>
                      </button>
                    ) : null}
                    {store.payments.flutterwavePublicKey ? (
                      <>
                        <button
                          type="button"
                          style={{ "--pm": "#D98324" } as React.CSSProperties}
                          onClick={() => payFlutterwave("USD")}
                        >
                          <span className="p-mark">$</span>
                          <span>
                            Pay in Dollars
                            <small>Flutterwave secure checkout</small>
                          </span>
                        </button>
                        <button
                          type="button"
                          style={{ "--pm": "#2E5EAA" } as React.CSSProperties}
                          onClick={() => payFlutterwave("NGN")}
                        >
                          <span className="p-mark">₦</span>
                          <span>
                            Pay in Naira
                            <small>Flutterwave secure checkout</small>
                          </span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}

              {!modalBook?.comingSoon &&
              Object.entries(currentItem.links || {}).filter(([, url]) => url).length ? (
                <>
                  <p className="modal-section-label">Also available on</p>
                  <div className="platform-list">
                    {Object.entries(currentItem.links || {})
                      .filter(([, url]) => url)
                      .map(([key, url]) => {
                        const m = PLATFORM_META[key as keyof typeof PLATFORM_META] || PLATFORM_META.other;
                        const name =
                          key === "other" && currentItem.otherLabel
                            ? currentItem.otherLabel
                            : m.name;
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ "--pm": m.color } as React.CSSProperties}
                          >
                            <span className="p-mark">{m.mark}</span>
                            <span>
                              {name}
                              <small>{m.note}</small>
                            </span>
                          </a>
                        );
                      })}
                  </div>
                </>
              ) : null}

              {!modalBook?.comingSoon &&
              !store.payments.paystackPublicKey &&
              !store.payments.flutterwavePublicKey &&
              !Object.entries(currentItem.links || {}).filter(([, url]) => url).length ? (
                <p
                  style={{
                    fontFamily: "var(--serif-head)",
                    fontStyle: "italic",
                    color: modalTone.deep,
                    textAlign: "center",
                    padding: "1rem 0",
                  }}
                >
                  This title is being prepared for release. Write to{" "}
                  <a href={`mailto:${store.settings.supportEmail}`}>{store.settings.supportEmail}</a>{" "}
                  to reserve a copy.
                </p>
              ) : null}

              <button
                type="button"
                className="peek-btn"
                onClick={() => setPeekOpen((v) => !v)}
              >
                <span>❧</span> The One Page Peek
              </button>
              <div className={`peek-panel${peekOpen ? " open" : ""}`} id="peekPanel">
                <p className="peek-kicker">The One Page Peek</p>
                <PeekText
                  text={
                    currentItem.peek ||
                    (modalCourse
                      ? coursePeekFor(currentItem as StoreCourse)
                      : peekFor(currentItem as StoreBook))
                  }
                />
              </div>
            </div>
            <div className={`delivery-box${deliveryRef ? " show" : ""}`} id="deliveryBox">
              <p>
                {deliveryRef
                  ? modalCourse
                    ? "Payment received. Your lifetime access begins now."
                    : "Payment received. Your book is ready."
                  : "Payment received. Your book is ready."}
              </p>
              <a
                className="btn btn-gold"
                id="deliveryLink"
                href={
                  fulfilUrl ||
                  `mailto:${store.settings.supportEmail}?subject=${encodeURIComponent(
                    `Book delivery: ${currentItem.title} (ref ${deliveryRef || ""})`
                  )}`
                }
                {...(fulfilUrl && !modalCourse ? { download: true } : {})}
              >
                {fulfilUrl
                  ? modalCourse
                    ? "Enter your course"
                    : "Download your copy"
                  : "Email us your reference"}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
