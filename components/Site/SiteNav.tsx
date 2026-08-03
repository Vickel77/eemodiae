"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import logo from "../../public/assets/eemodiae-logo.png";

const primaryLinks = [
  { href: "/about", label: "About" },
  { href: "/articles", label: "Articles" },
  { href: "/poems", label: "Poems" },
  { href: "/messages", label: "Messages" },
  { href: "/dvc", label: "DVC" },
  { href: "/music", label: "Music" },
];

const megaLinks = [
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

const mobileLinks = [
  ...primaryLinks.slice(0, 4),
  { href: "/testimonies", label: "Testimonies" },
  primaryLinks[4],
  { href: "/shop", label: "Store" },
  primaryLinks[5],
  { href: "/bookings", label: "Bookings" },
  { href: "/events", label: "Events" },
  { href: "/give", label: "Give", give: true },
];

function pathMatches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav() {
  const { pathname } = useRouter();
  const megaActive = megaLinks.some((item) => pathMatches(pathname, item.href));

  return (
    <>
      <a href="#main" className="el-skip">
        Skip to content
      </a>
      <header className="el-nav" id="elNav">
        <div className="el-wrap el-nav__inner">
          <Link href="/" className="el-nav__logo" aria-label="eemodiae home">
            <Image src={logo} alt="eemodiae · Prophet, Preacher, Poet" priority />
          </Link>
          <nav className="el-nav__links" aria-label="Primary">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathMatches(pathname, link.href) ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className={`el-mega${megaActive ? " is-active" : ""}`} id="elMega">
              <button
                type="button"
                className="el-mega__trigger"
                id="elMegaBtn"
                aria-expanded="false"
                aria-haspopup="true"
                aria-controls="elMegaPanel"
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
              <div className="el-mega__panel" id="elMegaPanel" role="menu" aria-labelledby="elMegaBtn">
                <div className="el-mega__glow" aria-hidden="true" />
                <div className="el-mega__grid">
                  {megaLinks.map((item) => (
                    <Link
                      key={item.href}
                      className={`el-mega__item${pathMatches(pathname, item.href) ? " is-active" : ""}`}
                      role="menuitem"
                      href={item.href}
                    >
                      <span className="el-mega__icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="el-mega__body">
                        <span className="el-mega__title">{item.title}</span>
                        <span className="el-mega__desc">{item.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/give" className="el-nav__give">
              Give
            </Link>
          </nav>
          <button
            className="el-nav__toggle"
            id="elToggle"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="elMobile"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      <div className="el-mobile" id="elMobile">
        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "give" in link && link.give ? "el-mobile__give" : "",
              !("give" in link && link.give) && pathMatches(pathname, link.href) ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
