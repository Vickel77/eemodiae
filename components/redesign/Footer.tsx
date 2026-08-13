import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { SITE_CONTACT_EMAIL } from "../../lib/siteContact";
import { sendSiteMail } from "../../util/sendSiteMail";

/* ============================================================
   eemodiae.org redesign — shared footer + back-to-top
   Ported 1:1 from the redesign (el-footer / el-top).
   Contact form posts to the web inbox (MAIL_WEB_USER).
   ============================================================ */

const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/articles", label: "Articles" },
  { href: "/poems", label: "Poems" },
  { href: "/messages", label: "Messages" },
];

const ENGAGE = [
  { href: "/dvc", label: "Daily Confession" },
  { href: "/music", label: "Music" },
  { href: "/shop", label: "Store" },
  { href: "/bookings", label: "Bookings" },
  { href: "/give", label: "Give" },
];

const SOCIAL = [
  {
    href: "https://www.tiktok.com/@eemodiae",
    label: "TikTok",
    path: (
      <path d="M19.32 6.55a4.79 4.79 0 0 1-2.77-2.55 4.7 4.7 0 0 1-.36-1.5h-3.07v12.4a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V9.27a5.9 5.9 0 0 0-.78-.05 5.68 5.68 0 1 0 5.68 5.68V9.63a7.8 7.8 0 0 0 4.3 1.29V7.85a4.8 4.8 0 0 1-1.18-.3z" />
    ),
    fill: true,
  },
  {
    href: "https://x.com/eemodiae",
    label: "X",
    path: (
      <path d="M17.53 3H20.5l-6.56 7.5L21.5 21h-6.05l-4.74-6.2L5.29 21H2.32l7.02-8.02L2.5 3h6.2l4.28 5.66L17.53 3zm-1.06 16.2h1.64L7.7 4.7H5.94l10.53 14.5z" />
    ),
    fill: true,
  },
  {
    href: "https://www.youtube.com/@eemodiae",
    label: "YouTube",
    path: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
      </>
    ),
    fill: false,
  },
  {
    href: "https://www.facebook.com/eemodiae",
    label: "Facebook",
    path: (
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.6v3h2.4v7h2.5z" />
    ),
    fill: true,
  },
  {
    href: "https://instagram.com/eemodiae",
    label: "Instagram",
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    fill: false,
  },
];

const Footer = styled(({ className }: { className?: string }) => {
  const [showTop, setShowTop] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<{ text: string; kind: string }>({
    text: "",
    kind: "",
  });
  const [sending, setSending] = useState(false);
  const year = new Date().getFullYear();
  const count = form.message.length;

  useEffect(() => {
    const onScroll = () => setShowTop((window.pageYOffset || 0) > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!form.name.trim() || !okEmail || !form.message.trim()) {
      setStatus({
        text: "Please fill every field with a valid email.",
        kind: "err",
      });
      return;
    }
    setSending(true);
    setStatus({ text: "Sending...", kind: "" });
    try {
      await sendSiteMail({
        inbox: "web",
        subject: "New message from eemodiae.org",
        replyTo: form.email.trim(),
        name: form.name.trim(),
        message: form.message.trim(),
        fields: {
          Name: form.name.trim(),
          Email: form.email.trim(),
          Message: form.message.trim(),
          Source: "footer contact form",
        },
      });
      setStatus({ text: "Message sent. Grace and peace.", kind: "ok" });
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus({
        text: `Could not send. Email us at ${SITE_CONTACT_EMAIL}.`,
        kind: "err",
      });
    } finally {
      setSending(false);
    }
  };

  const countClass =
    count >= 1000 ? " is-max" : count >= 900 ? " is-near" : "";

  return (
    <div className={className}>
      <footer className="el-footer">
        <div className="el-wrap">
          <div className="el-footer__grid">
            <div className="el-footer__brand">
              <div className="el-footer__logo">
                <img
                  src="/redesign/logo.png"
                  alt="eemodiae · Prophet, Preacher, Poet"
                />
              </div>
              <p className="el-footer__tagline">
                Preaching Christ...Changing Lives!
              </p>
              <div className="el-footer__social">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={s.fill ? "currentColor" : "none"}
                      stroke={s.fill ? undefined : "currentColor"}
                      strokeWidth={s.fill ? undefined : 1.6}
                    >
                      {s.path}
                    </svg>
                  </a>
                ))}
              </div>
              <p className="el-footer__handle">@eemodiae</p>
              <a className="el-footer__email" href={`mailto:${SITE_CONTACT_EMAIL}`}>
                {SITE_CONTACT_EMAIL}
              </a>
            </div>

            <div>
              <h4>Explore</h4>
              <nav className="el-footer__links" aria-label="Footer explore">
                {EXPLORE.map((l) => (
                  <Link key={l.href} href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4>Engage</h4>
              <nav className="el-footer__links" aria-label="Footer engage">
                {ENGAGE.map((l) => (
                  <Link key={l.href} href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="el-footer__contact">
              <h4>Send A Message</h4>
              <form onSubmit={submit} noValidate>
                <label className="sr-only" htmlFor="elCName">
                  Your name
                </label>
                <input
                  type="text"
                  id="elCName"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <label className="sr-only" htmlFor="elCEmail">
                  Your email
                </label>
                <input
                  type="email"
                  id="elCEmail"
                  name="email"
                  placeholder="Your email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <label className="sr-only" htmlFor="elCMsg">
                  Your message
                </label>
                <textarea
                  id="elCMsg"
                  name="message"
                  rows={3}
                  placeholder="Your message"
                  maxLength={1000}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                />
                <p
                  className={`el-footer__count${countClass}`}
                  aria-live="polite"
                >
                  {count}/1000
                </p>
                <button
                  type="submit"
                  className="el-btn el-btn--gold"
                  disabled={sending}
                >
                  Send Message
                </button>
                <p
                  className={`el-footer__msg ${status.kind}`}
                  role="status"
                  aria-live="polite"
                >
                  {status.text}
                </p>
              </form>
            </div>
          </div>

          <div className="el-footer__bottom">
            <p>&copy; {year} Emmanuel I. Emodiae. All rights reserved.</p>
            <div className="el-footer__hoj">
              A ministry of House of Joy Church Worldwide
            </div>
          </div>
        </div>
      </footer>

      <button
        className={`el-top${showTop ? " is-visible" : ""}`}
        aria-label="Back to top"
        onClick={toTop}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
})`
  display: contents;

  .el-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
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
      box-shadow 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
  }
  .el-btn--gold {
    background: linear-gradient(135deg, #e4c169, #c9a24b 55%, #b8923f);
    color: #241a08;
    box-shadow: 0 14px 30px -12px rgba(201, 162, 75, 0.7);
  }
  .el-btn--gold:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px -12px rgba(201, 162, 75, 0.85);
  }

  .el-footer {
    background: #0e0e0e;
    color: #b8ad97;
    padding: 72px 0 32px;
    font-family: "Crimson Pro", "EB Garamond", Georgia, serif;
    line-height: 1.65;
  }
  .el-footer__grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1.3fr;
    gap: 40px;
    margin-bottom: 48px;
  }
  .el-footer__brand .el-footer__logo {
    margin-bottom: 1rem;
  }
  .el-footer__brand .el-footer__logo img {
    height: 52px;
    width: auto;
    display: block;
  }
  .el-footer__brand p {
    font-size: 1rem;
    max-width: 34ch;
  }
  .el-footer__tagline {
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-size: 1.25rem;
    color: #e4c169;
  }
  .el-footer__handle {
    font-family: "Crimson Pro", serif;
    font-size: 1.05rem;
    letter-spacing: 0.08em;
    color: #f5f0e6;
    margin-top: 0.7rem;
  }
  .el-footer__email {
    display: inline-block;
    margin-top: 0.45rem;
    font-family: "Crimson Pro", serif;
    font-size: 0.95rem;
    letter-spacing: 0.04em;
    color: #e7b35a;
    text-decoration: none;
  }
  .el-footer__email:hover {
    text-decoration: underline;
  }
  .el-footer__social {
    display: flex;
    gap: 0.8rem;
    margin-top: 1.4rem;
  }
  .el-footer__social a {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(201, 162, 75, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b8923f;
    transition: background 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
      color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-footer__social a:hover {
    background: rgba(201, 162, 75, 0.12);
    color: #e4c169;
    transform: translateY(-3px);
  }
  .el-footer__social svg {
    width: 18px;
    height: 18px;
  }
  .el-footer h4 {
    font-family: "Cinzel", serif;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #b8923f;
    margin-bottom: 1.2rem;
    font-weight: 600;
  }
  .el-footer__links a {
    display: block;
    font-size: 1rem;
    padding: 0.35rem 0;
    color: #b8ad97;
    transition: color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
      padding-left 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
    text-decoration: none;
  }
  .el-footer__links a:hover {
    color: #e4c169;
    padding-left: 0.35rem;
  }
  .el-footer__contact form {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .el-footer__contact input,
  .el-footer__contact textarea {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(201, 162, 75, 0.22);
    background: rgba(255, 255, 255, 0.04);
    color: #f5f0e6;
    font-family: "Crimson Pro", serif;
    font-size: 0.95rem;
    resize: vertical;
  }
  .el-footer__contact input:focus-visible,
  .el-footer__contact textarea:focus-visible {
    outline: 2px solid #e4c169;
    outline-offset: 2px;
    border-color: #c9a24b;
  }
  .el-footer__contact button {
    margin-top: 0.2rem;
  }
  .el-footer__contact button:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .el-footer__bottom {
    border-top: 1px solid rgba(201, 162, 75, 0.12);
    padding-top: 28px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }
  .el-footer__bottom p {
    font-size: 0.85rem;
  }
  .el-footer__hoj {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: "Cinzel", serif;
    font-size: 0.66rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b8923f;
  }
  .el-footer__msg {
    font-family: "Cinzel", serif;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    min-height: 1rem;
    margin-top: 0.3rem;
  }
  .el-footer__msg.ok {
    color: #e4c169;
  }
  .el-footer__msg.err {
    color: #e0916f;
  }
  .el-footer__count {
    font-family: "Cinzel", serif;
    font-size: 0.64rem;
    letter-spacing: 0.12em;
    color: #b8ad97;
    text-align: right;
    margin-top: -0.3rem;
  }
  .el-footer__count.is-near {
    color: #e4c169;
  }
  .el-footer__count.is-max {
    color: #e0916f;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  @media (max-width: 900px) {
    .el-footer__grid {
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
  }
  @media (max-width: 560px) {
    .el-footer__grid {
      grid-template-columns: 1fr;
    }
  }

  .el-top {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 70;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e4c169, #b8923f);
    color: #241a08;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 18px 44px -20px rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    transform: translateY(12px);
    transition: opacity 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .el-top.is-visible {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }
  .el-top svg {
    width: 20px;
    height: 20px;
  }
`;

export default Footer;
