import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Head from "next/head";
import SiteHtmlPage from "../../components/Site/SiteHtmlPage";
import eventsHero from "../../assets/events-hero.jpg";

type Props = { html: string };

export default function EventsPage({ html }: Props) {
  return (
    <>
      <Head>
        <title>Events · Emmanuel I. Emodiae</title>
        <meta name="description" content="Upcoming gatherings, conferences, and services. Register to save your place." />
        <link rel="canonical" href="https://www.eemodiae.org/events" />
      </Head>
      <SiteHtmlPage
        html={html}
        initScript="/site/events-init.js"
        className="events-page"
        hero={{
          banner: { src: eventsHero.src, alt: "Events", ratio: "1989/790" },
        }}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const html = fs.readFileSync(path.join(process.cwd(), "lib/site/events-content.html"), "utf8");
  return { props: { html } };
};
