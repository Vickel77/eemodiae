import Head from "next/head";
import HomePage from "../components/Home/HomePage";

export default function Home() {
  return (
    <>
      <Head>
        <title>Emmanuel I. Emodiae · Preaching Christ...Changing Lives!</title>
        <meta
          name="description"
          content="Prophetic voice, preacher, and poet. Daily Victory Confession, messages, articles, poems, music, and resources from Emmanuel I. Emodiae."
        />
        <meta name="keyword" content="Preacher, Prophet, Poet, Emmanuel Emodiae, DVC" />
        <meta property="og:site_name" content="Emmanuel Emodiae" />
        <meta property="og:title" content="Emmanuel I. Emodiae" />
        <meta
          property="og:description"
          content="Preaching Christ...Changing Lives! Explore messages, articles, poems, music, and the Daily Victory Confession."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dwgywtak8/image/upload/v1728428668/mmppbzvmceyiw4rc6j32.png"
        />
        <meta name="twitter:title" content="Emmanuel I. Emodiae" />
        <meta name="twitter:description" content="Preacher, Prophet, Poet" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta
          property="twitter:image"
          content="https://res.cloudinary.com/dwgywtak8/image/upload/v1728428668/mmppbzvmceyiw4rc6j32.png"
        />
        <link rel="canonical" href="https://eemodiae.org" />
      </Head>
      <HomePage />
    </>
  );
}
