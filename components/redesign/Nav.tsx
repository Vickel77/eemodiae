import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useAppearance } from "../../context/AppearanceContext";

/* ============================================================
   eemodiae.org redesign — shared top navigation
   Sticky glass nav + desktop "More" mega menu + mobile drawer.
   Ported 1:1 from the redesign (el-nav / el-mega / el-mobile).
   ============================================================ */

const PRIMARY = [
  { href: "/about", label: "About" },
  { href: "/articles", label: "Articles" },
  { href: "/poems", label: "Poems" },
  { href: "/messages", label: "Messages" },
  { href: "/dvc", label: "DVC" },
  { href: "/music", label: "Music" },
];

const MEGA = [
  {
    href: "/shop",
    title: "Store",
    desc: "Books and resources for your walk.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 7h16l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H6.7a1.5 1.5 0 0 1-1.5-1.3z" />
        <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
      </svg>
    ),
  },
  {
    href: "/testimonies",
    title: "Testimonies",
    desc: "Lives changed by Christ the Blessing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 21s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.8 4.5 4.5 0 0 1 19.5 11c0 5.4-7.5 10-7.5 10z" />
      </svg>
    ),
  },
  {
    href: "/bookings",
    title: "Bookings",
    desc: "Invite Emmanuel to minister.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3v3M8 5v2M16 5v2" />
        <path d="M4.5 8.5h15v11a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5z" />
        <path d="M4.5 12.5h15" />
      </svg>
    ),
  },
  {
    href: "/events",
    title: "Events",
    desc: "Gatherings, crusades and campaigns.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2.5l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 8.9l6.1-.8z" />
      </svg>
    ),
  },
];

const MOBILE = [
  { href: "/about", label: "About" },
  { href: "/articles", label: "Articles" },
  { href: "/poems", label: "Poems" },
  { href: "/messages", label: "Messages" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/dvc", label: "DVC" },
  { href: "/shop", label: "Store" },
  { href: "/music", label: "Music" },
  { href: "/bookings", label: "Bookings" },
  { href: "/events", label: "Events" },
];

const Nav = styled(({ className }: { className?: string }) => {
  const router = useRouter();
  const { mode, toggle } = useAppearance();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);
  const megaActive = MEGA.some((m) => isActive(m.href));

  useEffect(() => {
    const onScroll = () => setScrolled((window.pageYOffset || 0) > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={className}>
      <a href="#main" className="el-skip">
        Skip to content
      </a>

      <header className={`el-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="el-wrap el-nav__inner">
          <Link href="/" className="el-nav__logo" aria-label="eemodiae home">
            <img src="/redesign/logo.png" alt="eemodiae · Prophet, Preacher, Poet" />
          </Link>

          <nav className="el-nav__links" aria-label="Primary">
            {PRIMARY.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(l.href) ? "is-active" : ""}
              >
                {l.label}
              </Link>
            ))}

            <div
              className={`el-mega${megaOpen ? " is-open" : ""}${
                megaActive ? " is-active" : ""
              }`}
              ref={megaRef}
            >
              <button
                type="button"
                className="el-mega__trigger"
                aria-expanded={megaOpen}
                aria-haspopup="true"
                aria-controls="elMegaPanel"
                onClick={() => setMegaOpen((o) => !o)}
              >
                More
                <svg
                  className="el-mega__chev"
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="el-mega__panel" id="elMegaPanel" role="menu">
                <div className="el-mega__glow" aria-hidden="true" />
                <div className="el-mega__grid">
                  {MEGA.map((m) => (
                    <Link
                      key={m.href}
                      className="el-mega__item"
                      role="menuitem"
                      href={m.href}
                      onClick={() => setMegaOpen(false)}
                    >
                      <span className="el-mega__icon" aria-hidden="true">
                        {m.icon}
                      </span>
                      <span className="el-mega__body">
                        <span className="el-mega__title">{m.title}</span>
                        <span className="el-mega__desc">{m.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/give" className="el-nav__give">
              Give
            </Link>
            <button
              type="button"
              className="el-nav__theme"
              aria-label={mode === "day" ? "Switch to night mode" : "Switch to day mode"}
              title={mode === "day" ? "Night" : "Day"}
              onClick={toggle}
            >
              <span aria-hidden="true">{mode === "day" ? "☾" : "✷"}</span>
              <span className="el-nav__theme-label">{mode === "day" ? "Night" : "Day"}</span>
            </button>

          </nav>

          <div className="el-nav__mobile-tools">
            <button
              type="button"
              className="el-nav__theme el-nav__theme--mobile"
              aria-label={mode === "day" ? "Switch to night mode" : "Switch to day mode"}
              title={mode === "day" ? "Night" : "Day"}
              onClick={toggle}
            >
              <span aria-hidden="true">{mode === "day" ? "☾" : "✷"}</span>
            </button>
            <button
              className={`el-nav__toggle${mobileOpen ? " is-open" : ""}`}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="elMobile"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`el-mobile${mobileOpen ? " is-open" : ""}`}
        id="elMobile"
      >
        {MOBILE.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={isActive(l.href) ? "is-active" : ""}
            onClick={() => setMobileOpen(false)}
          >
            {l.label}
          </Link>
        ))}
   
        <Link
          href="/give"
          className="el-mobile__give"
          onClick={() => setMobileOpen(false)}
        >
          Give
        </Link>
        <button
          type="button"
          className="el-mobile__theme"
          onClick={() => { toggle(); setMobileOpen(false); }}
        >
          {mode === "day" ? "☾ Night mode" : "✷ Day mode"}
        </button>
      </div>
    </div>
  );
})`
  display: contents;

  .el-nav {
    position: sticky;
    top: 0;
    z-index: 60;
    background: var(--ee-nav-bg, rgba(14, 14, 14, 0.55));
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--ee-nav-border, rgba(201, 162, 75, 0.14));
    transition: background 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    font-family: "Crimson Pro", "EB Garamond", Georgia, serif;
  }
  .el-nav.is-scrolled {
    background: var(--ee-nav-bg-scrolled, rgba(14, 14, 14, 0.85));
  }
  .el-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .el-nav__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 74px;
  }
  .el-nav__logo {
    display: flex;
    align-items: center;
  }
  .el-nav__logo img {
    height: 44px;
    width: auto;
    display: block;
  }
  @media (max-width: 480px) {
    .el-nav__logo img {
      height: 38px;
    }
  }
  .el-nav__links {
    display: flex;
    gap: 1.6rem;
    align-items: center;
  }
  .el-nav__links a {
    font-family: "Cinzel", serif;
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ee-nav-link, #b8ad97);
    position: relative;
    padding: 0.3rem 0;
    transition: color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
    text-decoration: none;
  }
  .el-nav__links a::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 1.5px;
    background: var(--ee-gold, #c9a24b);
    transition: width 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-nav__links a:hover,
  .el-nav__links a:focus-visible {
    color: var(--ee-nav-link-hover, #e4c169);
  }
  .el-nav__links a:hover::after,
  .el-nav__links a:focus-visible::after {
    width: 100%;
  }
  .el-nav__links a.el-nav__give {
    color: var(--ee-nav-give, #9b6dff);
    font-weight: 600;
  }
  .el-nav__links a.el-nav__give::after {
    width: 100%;
    background: var(--ee-nav-give, #9b6dff);
  }
  .el-nav__links a.is-active {
    color: var(--ee-nav-link-hover, #e4c169);
    font-weight: 600;
  }
  .el-nav__links a.is-active::after {
    width: 100%;
    background: var(--ee-nav-link-hover, #e4c169);
  }
  .el-nav__theme {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--ee-line, rgba(201, 162, 75, 0.28));
    border-radius: 999px;
    cursor: pointer;
    font-family: "Cinzel", serif;
    font-size: 0.66rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ee-gold-soft, #e4c169);
    padding: 0.42rem 0.85rem;
    transition: background 0.25s, border-color 0.25s, color 0.25s;
  }
  .el-nav__theme:hover,
  .el-nav__theme:focus-visible {
    background: rgba(201, 162, 75, 0.16);
    border-color: var(--ee-gold-soft, rgba(228, 193, 105, 0.55));
    color: var(--ee-gold-soft, #f3e2a8);
  }
  .el-nav__theme-label {
    line-height: 1;
  }
  .el-nav__mobile-tools {
    display: none;
    align-items: center;
    gap: 0.35rem;
  }
  .el-nav__theme--mobile {
    padding: 0.45rem 0.65rem;
  }
  .el-nav__theme--mobile .el-nav__theme-label {
    display: none;
  }
  .el-mobile__theme {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    border-top: 1px solid var(--ee-line, rgba(201, 162, 75, 0.18));
    margin-top: 0.5rem;
    padding: 1rem 0 0.4rem;
    font-family: "Cinzel", serif;
    font-size: 0.9rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ee-gold-soft, #e4c169);
    cursor: pointer;
  }
  .el-nav__toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    flex-direction: column;
    gap: 5px;
  }
  .el-nav__toggle span {
    width: 24px;
    height: 2px;
    background: var(--ee-gold, #c9a24b);
    border-radius: 2px;
    transition: 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-nav__toggle.is-open span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .el-nav__toggle.is-open span:nth-child(2) {
    opacity: 0;
  }
  .el-nav__toggle.is-open span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  /* ===================== DESKTOP MEGA MENU ===================== */
  .el-mega {
    position: relative;
    display: flex;
    align-items: center;
  }
  .el-mega__trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.34rem;
    background: none;
    border: none;
    cursor: pointer;
    font-family: "Cinzel", serif;
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ee-nav-link, #b8ad97);
    padding: 0.3rem 0;
    position: relative;
    transition: color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-mega__trigger::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 1.5px;
    background: var(--ee-gold, #c9a24b);
    transition: width 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-mega__trigger:hover,
  .el-mega__trigger:focus-visible,
  .el-mega.is-open .el-mega__trigger {
    color: var(--ee-nav-link-hover, #e4c169);
  }
  .el-mega__trigger:hover::after,
  .el-mega__trigger:focus-visible::after,
  .el-mega.is-open .el-mega__trigger::after {
    width: 100%;
  }
  .el-mega.is-active .el-mega__trigger {
    color: var(--ee-nav-link-hover, #e4c169);
    font-weight: 600;
  }
  .el-mega.is-active .el-mega__trigger::after {
    width: 100%;
    background: var(--ee-nav-link-hover, #e4c169);
  }
  .el-mega__chev {
    transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
    margin-top: 1px;
  }
  .el-mega.is-open .el-mega__chev {
    transform: rotate(180deg);
  }
  .el-mega__panel {
    position: absolute;
    top: calc(100% + 18px);
    right: 0;
    left: auto;
    transform: translateY(10px);
    width: min(560px, calc(100vw - 48px));
    padding: 18px;
    z-index: 80;
    background: linear-gradient(
      160deg,
      rgba(22, 20, 18, 0.97),
      rgba(14, 14, 14, 0.98)
    );
    border: 1px solid rgba(201, 162, 75, 0.26);
    border-radius: 20px;
    box-shadow: 0 34px 70px -26px rgba(0, 0, 0, 0.75),
      0 0 0 1px rgba(255, 255, 255, 0.03) inset;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.32s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), visibility 0.32s;
    contain: layout paint;
    max-height: 0;
    overflow: hidden;
  }
  .el-mega.is-open .el-mega__panel {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
    max-height: none;
    overflow: visible;
  }
  .el-mega__panel::before {
    content: "";
    position: absolute;
    top: -7px;
    right: 64px;
    width: 13px;
    height: 13px;
    background: rgba(22, 20, 18, 0.99);
    border-left: 1px solid rgba(201, 162, 75, 0.26);
    border-top: 1px solid rgba(201, 162, 75, 0.26);
    transform: rotate(45deg);
    border-radius: 3px 0 0 0;
  }
  .el-mega__glow {
    position: absolute;
    inset: 0;
    border-radius: 20px;
    pointer-events: none;
    background: radial-gradient(
      120% 90% at 50% 0%,
      rgba(201, 162, 75, 0.16),
      transparent 62%
    );
  }
  .el-mega__grid {
    position: relative;
    display: grid;
    gap: 6px;
  }
  .el-mega__item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 15px;
    border-radius: 14px;
    border: 1px solid transparent;
    transition: background 0.28s cubic-bezier(0.22, 0.61, 0.36, 1),
      border-color 0.28s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
    text-decoration: none;
  }
  .el-mega__item:hover,
  .el-mega__item:focus-visible {
    background: linear-gradient(
      135deg,
      rgba(201, 162, 75, 0.14),
      rgba(201, 162, 75, 0.05)
    );
    border-color: rgba(201, 162, 75, 0.3);
    transform: translateX(3px);
  }
  .el-mega__icon {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(201, 162, 75, 0.22),
      rgba(201, 162, 75, 0.08)
    );
    border: 1px solid var(--ee-line, rgba(201, 162, 75, 0.3));
    color: var(--ee-gold-soft, #e4c169);
  }
  .el-mega__icon svg {
    width: 19px;
    height: 19px;
  }
  .el-mega__body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .el-mega__title {
    font-family: "Cinzel", serif;
    font-size: 0.78rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--ee-text-on-dark, #f5f0e6);
    transition: color 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-mega__item:hover .el-mega__title {
    color: var(--ee-gold-soft, #e4c169);
  }
  .el-mega__desc {
    font-family: "Cormorant Garamond", serif;
    font-size: 0.98rem;
    line-height: 1.35;
    color: var(--ee-muted-on-dark, #b8ad97);
    opacity: 0.85;
  }
  @media (max-width: 920px) {
    .el-nav__links {
      display: none;
    }
    .el-nav__mobile-tools {
      display: flex;
    }
    .el-nav__toggle {
      display: flex;
    }
    .el-mega {
      display: none;
    }
  }

  /* ===================== MOBILE DRAWER ===================== */
  .el-mobile {
    position: fixed;
    inset: 74px 0 auto 0;
    z-index: 55;
    background: linear-gradient(
      180deg,
      rgba(14, 14, 14, 0.82),
      rgba(14, 14, 14, 0.72)
    );
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border-bottom: 1px solid rgba(201, 162, 75, 0.22);
    transform: translateY(-120%);
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
    padding: 0.6rem 24px 1.2rem;
    font-family: "Crimson Pro", "EB Garamond", Georgia, serif;
  }
  .el-mobile.is-open {
    transform: translateY(0);
  }
  .el-mobile a {
    display: block;
    font-family: "Cinzel", serif;
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ee-text-on-dark, #f5f0e6);
    padding: 0.55rem 0;
    border-bottom: 1px solid var(--ee-line-soft, rgba(201, 162, 75, 0.14));
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    text-decoration: none;
  }
  .el-mobile a:last-of-type {
    border-bottom: none;
  }
  .el-mobile a.el-mobile__give {
    color: var(--ee-nav-give, #9b6dff);
    font-weight: 600;
  }
  .el-mobile a.is-active {
    color: var(--ee-nav-link-hover, #e4c169);
    font-weight: 600;
  }

  /* ===================== SKIP LINK ===================== */
  .el-skip {
    position: absolute;
    left: -999px;
    top: 0;
    z-index: 200;
    background: var(--ee-gold, #c9a24b);
    color: var(--ee-ink, #241a08);
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.7rem 1.2rem;
    border-radius: 0 0 8px 0;
  }
  .el-skip:focus {
    left: 0;
  }
`;

export default Nav;
