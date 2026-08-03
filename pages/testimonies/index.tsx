import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Head from "next/head";
import SiteHtmlPage from "../../components/Site/SiteHtmlPage";
import testimoniesHero from "../../assets/testimonies-hero.jpg";

type Props = { html: string };

export default function TestimoniesPage({ html }: Props) {
  return (
    <>
      <Head>
        <title>Testimonies · Emmanuel I. Emodiae</title>
        <meta name="description" content="Lives changed by Christ the Blessing. Browse testimonies and share what God has done." />
        <link rel="canonical" href="https://www.eemodiae.org/testimonies" />
      </Head>
      <SiteHtmlPage
        html={html}
        initScript="/site/testimonies-init.js"
        className="testimonies-page"
        hero={{
          banner: { src: testimoniesHero.src, alt: "Testimonies" },
        }}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const html = fs.readFileSync(path.join(process.cwd(), "lib/site/testimonies-content.html"), "utf8");
  return { props: { html } };
};
