import Head from "next/head";
import Link from "next/link";
import Navbar from "../../Navbar";
import Footer from "../../Footer";

type Props = {
  option: "A" | "B";
  title: string;
  description?: string;
  children: React.ReactNode;
  dark?: boolean;
};

export default function DVCExperimentalShell({
  option,
  title,
  description,
  children,
  dark = true,
}: Props) {
  const label = option === "A" ? "Option A — scrolling month" : "Option B — one page per day";

  return (
    <>
      <Head>
        <title>{title} | Eemodiae</title>
        {description ? <meta name="description" content={description} /> : null}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fjalla+One&family=Poppins:wght@400;500;600&family=Raleway:ital,wght@0,400;0,500;1,400&family=Sacramento&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Navbar />
      <div className="dvc-exp-demo-banner">
        Experimental demo · {label}
        <span> · not linked in navigation</span>
      </div>
      <div className={dark ? "dvc-exp-page pt-[5rem]" : "pt-[5rem] min-h-screen bg-[#FBFBFF]"}>
        {children}
      </div>
      <Footer />
    </>
  );
}

export function DVCExperimentalBack({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="dvc-exp-topbar dvc-exp-inner">
      <Link href={href} className="dvc-exp-back">
        {children}
      </Link>
    </div>
  );
}
