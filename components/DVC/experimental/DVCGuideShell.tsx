import Head from "next/head";
import { useEffect } from "react";
import { GUIDE_FONTS } from "../../../lib/dvc/experimentalHtml";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

/** Standalone guide shell — no site Navbar/Footer */
export default function DVCGuideShell({ title, description, children }: Props) {
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
      {children}
    </>
  );
}
