import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";

/* ============================================================
   eemodiae.org — DAILY VICTORY CONFESSION (DVC 2026)
   Self-contained port of the redesign's DVC page. The whole
   devotional (landing, year/month calendar, and all 184 days'
   content) ships as static assets in /public/dvc and runs its
   own engine. We render the shell, load the scoped stylesheet,
   then inject the data + navigation scripts after mount so the
   browser executes them. Styles are scoped under #dvc-root so
   the DVC blue theme never leaks into the warm-gold site.
   ============================================================ */

const SHELL_URL = "/dvc/dvc-2026-shell.html";
const CSS_URL = "/dvc/dvc-2026.css";
const DATA_URL = "/dvc/dvc-2026-data.js";
const NAV_URL = "/dvc/dvc-2026-nav.js";

declare global {
  interface Window {
    __dvcScriptsLoaded?: boolean;
    __dvcBoot?: () => void;
    __dvcBindNav?: () => void;
  }
}

const loadScriptOnce = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-dvc-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.dataset.dvcSrc = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error(src));
    document.body.appendChild(s);
  });

const DVCPage: NextPage = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shell, setShell] = useState<string>("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(SHELL_URL)
      .then((r) => {
        if (!r.ok) throw new Error("shell");
        return r.text();
      })
      .then((html) => {
        if (alive) setShell(html);
      })
      .catch(() => {
        if (alive) setErr(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Load engine once the shell is in the live DOM. Scripts are kept
  // (not torn down) so Strict Mode remounts don't leave a detached #app.
  useEffect(() => {
    if (!shell || !rootRef.current) return;
    let cancelled = false;

    loadScriptOnce(DATA_URL)
      .then(() => {
        if (!cancelled) return loadScriptOnce(NAV_URL);
      })
      .then(() => {
        if (cancelled) return;
        window.__dvcScriptsLoaded = true;
        // Rebind to the live shell (handles React remount / re-inject)
        try {
          window.__dvcBoot?.();
        } catch {
          /* ignore */
        }
        try {
          window.__dvcBindNav?.();
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        if (!cancelled) setErr(true);
      });

    return () => {
      cancelled = true;
    };
  }, [shell]);

  return (
    <>
      <Head>
        <title>Daily Victory Confession 2026 | House of Joy Church Worldwide</title>
        <meta
          name="description"
          content="Daily Victory Confession — decree it, see it established. A daily devotional of decrees, prophecy, and prayer, July to December 2026. Job 22:28."
        />
        <link rel="stylesheet" href={CSS_URL} />
      </Head>

      <Nav />

      {err ? (
        <div
          style={{
            maxWidth: 640,
            margin: "80px auto",
            padding: "0 24px",
            textAlign: "center",
            fontFamily: "'Crimson Pro', Georgia, serif",
          }}
        >
          <h1 style={{ fontFamily: "'Cinzel', serif" }}>Daily Victory Confession</h1>
          <p>
            We couldn&apos;t load the devotional just now. Please refresh the page, and if it
            persists, check back shortly.
          </p>
        </div>
      ) : (
        <div
          id="dvc-root"
          className="eemodiae-page ee-base-175"
          ref={rootRef}
          dangerouslySetInnerHTML={{ __html: shell }}
        />
      )}

      <Footer />
    </>
  );
};

export default DVCPage;
