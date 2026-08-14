import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Nav from "../redesign/Nav";
import Footer from "../redesign/Footer";

/* ============================================================
   DVC host — shared by /dvc and /dvc/[month]
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

type Props = {
  monthSlug?: string;
};

export default function DVCHost({ monthSlug }: Props) {
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

  const titleMonth = monthSlug
    ? monthSlug.charAt(0).toUpperCase() + monthSlug.slice(1)
    : "";

  return (
    <>
      <Head>
        <title>
          {titleMonth
            ? `Daily Victory Confession · ${titleMonth} 2026 | House of Joy Church Worldwide`
            : "Daily Victory Confession 2026 | House of Joy Church Worldwide"}
        </title>
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
}
