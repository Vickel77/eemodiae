import Head from "next/head";
import { useEffect } from "react";
import SiteNav from "../../Site/SiteNav";
import SiteFooter from "../../Site/SiteFooter";
import { useSiteChrome } from "../../../hooks/useSiteChrome";
import { GUIDE_FONTS } from "../../../lib/dvc/experimentalHtml";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

/** Guide shell — site Navbar on top, guide content rendered untouched below */
export default function DVCGuideShell({ title, description, children }: Props) {
  useSiteChrome();

  // Neutralise site-wide html/body styles that break the guide rendering:
  // font-size 1.25rem skews every rem unit, and overflow-x hidden on body
  // stops position:sticky (the share daybar) from working.
  useEffect(() => {
    document.documentElement.classList.add("dvc-guide-html");
    return () => {
      document.documentElement.classList.remove("dvc-guide-html");
    };
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={GUIDE_FONTS} rel="stylesheet" />
      </Head>
      <div className="el-site">
        <SiteNav />
        <div className="pt-[4.625rem]">{children}</div>
        <SiteFooter />
        <button type="button" className="el-top" id="elTop" aria-label="Back to top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </>
  );
}
