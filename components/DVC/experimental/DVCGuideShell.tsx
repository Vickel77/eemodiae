import Head from "next/head";
import { GUIDE_FONTS } from "../../../lib/dvc/experimentalHtml";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

/** Standalone guide shell — no site Navbar/Footer */
export default function DVCGuideShell({ title, description, children }: Props) {
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
