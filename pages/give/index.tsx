import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Head from "next/head";
import SiteHtmlPage from "../../components/Site/SiteHtmlPage";

type Props = { html: string };

export default function GivePage({ html }: Props) {
  return (
    <>
      <Head>
        <title>Give · Emmanuel I. Emodiae</title>
        <meta name="description" content="Give securely to House of Joy Church Worldwide and the ministry of Emmanuel I. Emodiae." />
        <link rel="canonical" href="https://www.eemodiae.org/give" />
      </Head>
      <SiteHtmlPage
        html={html}
        initScript="/site/give-init.js"
        className="give-page"
        hero={false}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const html = fs.readFileSync(path.join(process.cwd(), "lib/site/give-content.html"), "utf8");
  return { props: { html } };
};
