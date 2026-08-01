import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Head from "next/head";
import SiteHtmlPage from "../components/Site/SiteHtmlPage";
import aboutPortrait from "../assets/about-portrait.jpg";

type Props = { html: string };

export default function AboutPage({ html }: Props) {
  return (
    <>
      <Head>
        <title>About Emmanuel I. Emodiae · Preaching Christ...Changing Lives!</title>
        <meta
          name="description"
          content="The story, mandate, and mission of Emmanuel I. Emodiae, lead pastor of House of Joy Church Worldwide."
        />
        <link rel="canonical" href="https://www.eemodiae.org/about" />
      </Head>
      <SiteHtmlPage
        html={html}
        hero={{
          eyebrow: "About Emmanuel I. Emodiae",
          title: (
            <>
              Preaching Christ...
              <br />
              Changing Lives!
            </>
          ),
          titleStyle: { fontSize: "clamp(2.2rem, 5vw, 3.8rem)" },
          lead: "Lead Pastor of House of Joy Church Worldwide. A prophet, preacher, and poet with one consuming burden: that every believer would see who they are in Christ and live in the fullness of it.",
          tagline: "Read the story below",
          taglineHref: "#story",
          portrait: { src: aboutPortrait, alt: "Pastor Emmanuel I. Emodiae" },
        }}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib/site/about-content.html"),
    "utf8"
  );
  return { props: { html } };
};
