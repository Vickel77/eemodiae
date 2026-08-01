import Link from "next/link";
import Image from "next/image";
import logo from "../../public/assets/eemodiae-logo.png";

export default function SiteFooter() {
  return (
    <footer className="el-footer">
      <div className="el-wrap">
        <div className="el-footer__grid">
          <div className="el-footer__brand">
            <div className="el-footer__logo">
              <Image src={logo} alt="eemodiae · Prophet, Preacher, Poet" />
            </div>
            <p className="el-footer__tagline">Preaching Christ...Changing Lives!</p>
            <div className="el-footer__social">
              <a href="https://www.tiktok.com/@eemodiae" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.32 6.55a4.79 4.79 0 0 1-2.77-2.55 4.7 4.7 0 0 1-.36-1.5h-3.07v12.4a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V9.27a5.9 5.9 0 0 0-.78-.05 5.68 5.68 0 1 0 5.68 5.68V9.63a7.8 7.8 0 0 0 4.3 1.29V7.85a4.8 4.8 0 0 1-1.18-.3z" />
                </svg>
              </a>
              <a href="https://x.com/eemodiae" aria-label="X" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.53 3H20.5l-6.56 7.5L21.5 21h-6.05l-4.74-6.2L5.29 21H2.32l7.02-8.02L2.5 3h6.2l4.28 5.66L17.53 3zm-1.06 16.2h1.64L7.7 4.7H5.94l10.53 14.5z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@eemodiae" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="5" width="20" height="14" rx="4" />
                  <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://www.facebook.com/eemodiae" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.6v3h2.4v7h2.5z" />
                </svg>
              </a>
              <a href="https://instagram.com/eemodiae" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
            <p className="el-footer__handle">@eemodiae</p>
          </div>
          <div>
            <h4>Explore</h4>
            <nav className="el-footer__links" aria-label="Footer explore">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/articles">Articles</Link>
              <Link href="/poems">Poems</Link>
              <Link href="/messages">Messages</Link>
            </nav>
          </div>
          <div>
            <h4>Engage</h4>
            <nav className="el-footer__links" aria-label="Footer engage">
              <Link href="/dvc">Daily Confession</Link>
              <Link href="/music">Music</Link>
              <Link href="/shop">Store</Link>
              <Link href="/bookings">Bookings</Link>
              <Link href="/give">Give</Link>
            </nav>
          </div>
          <div className="el-footer__contact">
            <h4>Send A Message</h4>
            <form id="elContactForm" noValidate>
              <label className="sr-only" htmlFor="elCName">
                Your name
              </label>
              <input type="text" id="elCName" name="name" placeholder="Your name" autoComplete="name" required />
              <label className="sr-only" htmlFor="elCEmail">
                Your email
              </label>
              <input type="email" id="elCEmail" name="email" placeholder="Your email" autoComplete="email" required />
              <label className="sr-only" htmlFor="elCMsg">
                Your message
              </label>
              <textarea id="elCMsg" name="message" rows={3} placeholder="Your message" maxLength={1000} required />
              <p className="el-footer__count" id="elCCount" aria-live="polite">
                0/1000
              </p>
              <button type="submit" className="el-btn el-btn--gold">
                Send Message
              </button>
              <p className="el-footer__msg" id="elContactMsg" role="status" aria-live="polite" />
            </form>
          </div>
        </div>
        <div className="el-footer__bottom">
          <p>
            &copy; <span id="elYear">{new Date().getFullYear()}</span> Emmanuel I. Emodiae. All rights reserved.
          </p>
          <div className="el-footer__hoj">A ministry of House of Joy Church Worldwide</div>
        </div>
      </div>
    </footer>
  );
}
