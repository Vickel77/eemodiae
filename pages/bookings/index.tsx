import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Head from "next/head";
import SiteHtmlPage from "../../components/Site/SiteHtmlPage";

type Props = { html: string };

export default function BookingsPage({ html }: Props) {
  return (
    <>
      <Head>
        <title>Bookings · Emmanuel I. Emodiae</title>
        <meta name="description" content="Book appointments and speaking engagements with Emmanuel I. Emodiae." />
        <link rel="canonical" href="https://www.eemodiae.org/bookings" />
      </Head>
      <SiteHtmlPage
        html={html}
        initScript="/site/bookings-init.js"
        className="bookings-page"
        hero={false}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const html = fs.readFileSync(path.join(process.cwd(), "lib/site/bookings-content.html"), "utf8");
  return { props: { html } };
};
