import Head from "next/head";
import Link from "next/link";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { DVC_MONTHS } from "../../lib/dvc/months";
import {
  monthReadHref,
  readOnlineLabel,
} from "../../lib/dvc/monthUtils";

const FEATURES = [
  {
    title: "Anchor Verse",
    text: "The day's word in full, straight from the King James Bible.",
  },
  {
    title: "Reflection",
    text: "A short teaching that opens the theme before you begin.",
  },
  {
    title: "I Decree",
    text: "Five Scripture-backed decrees to speak over your day.",
  },
  {
    title: "Prophecy & Prayer",
    text: "A prophetic word to receive and prayer points to pray.",
  },
  {
    title: "A Word in Verse",
    text: "A closing devotional poem to carry into your day.",
  },
];

export default function DVCLanding() {
  return (
    <>
      <Head>
        <title>Daily Victory Confession 2026 | Eemodiae</title>
        <meta
          name="description"
          content="Daily Victory Confession 2026. Decree it. See it established. Job 22:28."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Navbar />
      <div className="pt-[5rem] min-h-screen bg-[#FBFBFF] text-[#444444]">
        <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[50%] top-[5%] opacity-10 rounded-full z-0 pointer-events-none" />
        <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[50%] top-[15%] opacity-10 rounded-full z-0 pointer-events-none" />

        <header className="relative z-10 text-center px-6 py-16 md:py-20">
          <p className="font-['Cinzel'] text-xs tracking-[0.35em] uppercase text-primary mb-4">
            House of Joy Church Worldwide
          </p>
          <h1 className="font-['Cinzel'] text-4xl md:text-5xl font-bold text-primary leading-tight">
            Daily Victory Confession
          </h1>
          <p className="font-['Cormorant_Garamond'] italic text-xl md:text-2xl text-secondary mt-4">
            Decree it. See it established.
          </p>
          <div className="w-24 h-0.5 bg-primary mx-auto my-8 opacity-60" />
          <p className="max-w-xl mx-auto font-['Crimson_Pro'] italic text-lg text-gray-600 leading-relaxed">
            &ldquo;Thou shalt also decree a thing, and it shall be established unto thee: and the
            light shall shine upon thy ways.&rdquo;
            <cite className="block font-['Cinzel'] not-italic text-sm tracking-widest text-primary mt-3">
              Job 22:28
            </cite>
          </p>
        </header>

        <p className="relative z-10 max-w-2xl mx-auto text-center px-6 text-gray-600 font-['Crimson_Pro'] text-lg leading-relaxed">
          A daily devotional for 2026. Each day opens the Word, anchors your heart in a verse, and
          leads you through decree, reflection, prophecy, prayer, and a closing verse.
        </p>

        <section className="relative z-10 max-w-6xl mx-auto px-6 py-14">
          <h2 className="font-['Cinzel'] text-center text-primary text-xl tracking-widest mb-2">
            The 2026 Collection
          </h2>
          <p className="font-['Cormorant_Garamond'] italic text-center text-secondary text-lg mb-10">
            Six months of daily decrees, each in its own colour
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DVC_MONTHS.map((month) =>
              month.ready ? (
                <Link
                  key={month.slug}
                  href={monthReadHref(month.slug, month.monthNum, month.year, month.days)}
                  className="group relative overflow-hidden rounded-2xl min-h-[230px] flex flex-col justify-end p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-white/10"
                  style={{ background: month.gradient }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{
                      background: `linear-gradient(90deg, ${month.gold} 0%, ${month.bright} 50%, ${month.navy} 100%)`,
                    }}
                  />
                  <div className="relative z-10 flex justify-between items-start mb-auto">
                    <span className="font-['Cinzel'] text-4xl font-bold opacity-90">
                      {String(month.monthNum).padStart(2, "0")}
                    </span>
                    <span className="font-['Cinzel'] text-[0.6rem] tracking-widest uppercase px-3 py-1 rounded-full border border-white/40 bg-white/15">
                      Ready
                    </span>
                  </div>
                  <div className="relative z-10 mt-8">
                    <p className="font-['Cinzel'] text-2xl font-bold">{month.name}</p>
                    <p className="font-['Cormorant_Garamond'] italic text-white/90 mt-1 mb-4">
                      {month.theme}
                    </p>
                    <span className="inline-block font-['Cinzel'] text-[0.65rem] tracking-wider uppercase bg-white text-primary px-4 py-2 rounded-lg group-hover:bg-primaryAccent transition-colors">
                      {readOnlineLabel(month.monthNum, month.year)}
                    </span>
                  </div>
                </Link>
              ) : (
                <div
                  key={month.slug}
                  className="relative overflow-hidden rounded-2xl min-h-[230px] flex flex-col justify-end p-6 text-white shadow-md opacity-90 border border-white/10"
                  style={{ background: month.gradient }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{
                      background: `linear-gradient(90deg, ${month.gold} 0%, ${month.bright} 50%, ${month.navy} 100%)`,
                    }}
                  />
                  <div className="relative z-10 flex justify-between items-start mb-auto">
                    <span className="font-['Cinzel'] text-4xl font-bold opacity-90">
                      {String(month.monthNum).padStart(2, "0")}
                    </span>
                    <span className="font-['Cinzel'] text-[0.6rem] tracking-widest uppercase px-3 py-1 rounded-full border border-white/40 opacity-70">
                      Coming soon
                    </span>
                  </div>
                  <div className="relative z-10 mt-8">
                    <p className="font-['Cinzel'] text-2xl font-bold">{month.name}</p>
                    <p className="font-['Cormorant_Garamond'] italic text-white/90 mt-1 mb-2">
                      {month.theme}
                    </p>
                    <p className="font-['Cormorant_Garamond'] italic text-white/75 text-sm">
                      Being prepared
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
          <h2 className="font-['Cinzel'] text-center text-primary text-lg tracking-widest mb-8">
            What each day holds
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-primary/10 bg-white p-5 text-center shadow-sm"
              >
                <p className="font-['Cinzel'] text-xs tracking-widest uppercase text-primary mb-2">
                  {f.title}
                </p>
                <p className="font-['Crimson_Pro'] text-gray-600 text-sm leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
