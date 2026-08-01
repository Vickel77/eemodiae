"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SiteLayout from "../Site/SiteLayout";
import SiteHero from "../Site/SiteHero";
import useContentful from "../../hooks/useContentful";
import { mapArticles } from "../../lib/content/mapExperience";
import { mapMusicData } from "../../lib/content/mapMusic";
import aboutPortrait from "../../assets/about-portrait.jpg";

const fallbackPoems = [
  {
    num: "I",
    title: "What Is Time",
    body: "Time is eternity taking a break. The summation of human existence is captured within this brief ephemeral break...",
  },
  {
    num: "II",
    title: "Ghost Mode",
    body: "Many have gone incognito. I don't mean WhatsApp where some do it to secretly keep tabs on your info. I mean some have gone ghost mode...",
  },
  {
    num: "III",
    title: "Everything Is Working",
    body: "They heard my dreams. They said it cannot start. I started it. They said it will not last...",
  },
];

const testimonials = [
  {
    quote:
      "My family and I have witnessed prophetic words from God's servant come to fruition, including the miraculous conception of our child exactly as he declared.",
    name: "Jasmine O.",
  },
  {
    quote:
      "I am deeply grateful to God that I encountered Pastor Emmanuel Emodiae early in life. His life, teachings, and ministry have been a tremendous blessing to me.",
    name: "Mercy A. E.",
  },
  {
    quote:
      "When hope seemed lost, God's Word through Pastor Emmanuel Emodiae became the turning point that ushered me into restoration, healing, and enduring testimonies of His faithfulness.",
    name: "Victor M.",
  },
];

function plainExcerpt(text: string, max = 140): string {
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max).trim()}...` : plain;
}

export default function HomePage() {
  const { getArticles, getMessages, getMusic, getPoems, getStore, getArtiste, articles, messages, music, store, artiste } =
    useContentful();

  useEffect(() => {
    getArticles();
    getMessages();
    getMusic();
    getPoems();
    getStore();
    getArtiste();
  }, []);

  const latestMessage = messages?.[0];
  const latestArticle = useMemo(() => {
    const mapped = articles?.length ? mapArticles(articles) : [];
    return mapped[0];
  }, [articles]);
  const latestMusic = useMemo(() => {
    if (!music?.length) return undefined;
    const mapped = mapMusicData(music, artiste || []);
    return mapped.songs[0];
  }, [music, artiste]);

  const storeItems = (store || []).slice(0, 4);

  return (
    <SiteLayout hero={<SiteHero />}>
      <section className="el-trust" aria-label="Ministry at a glance">
        <div className="el-trust__inner">
          <div className="el-trust__item">
            <span className="el-trust__num" data-count="365">
              365
            </span>
            <span className="el-trust__label">Daily Confessions</span>
          </div>
          <div className="el-trust__divider" />
          <div className="el-trust__item">
            <span className="el-trust__num" data-count="120">
              120+
            </span>
            <span className="el-trust__label">Messages &amp; Sermons</span>
          </div>
          <div className="el-trust__divider" />
          <div className="el-trust__item">
            <span className="el-trust__num" data-count="50">
              50+
            </span>
            <span className="el-trust__label">Poems &amp; Articles</span>
          </div>
          <div className="el-trust__divider" />
          <div className="el-trust__item">
            <span className="el-trust__num">HJCW</span>
            <span className="el-trust__label">House of Joy Worldwide</span>
          </div>
        </div>
      </section>

      <section className="el-section el-section--dark">
        <div className="el-wrap">
          <div className="el-head el-reveal">
            <span className="el-eyebrow">New Here?</span>
            <h2>Start Here</h2>
            <p>Three simple ways to begin. Pick the door that fits today.</p>
            <div className="el-rule" />
          </div>
          <div className="el-start">
            <Link href="/dvc" className="el-start__card el-reveal">
              <span className="el-start__step">Step One</span>
              <h3>Decree Today&apos;s Word</h3>
              <p>Open the Daily Victory Confession and speak the promise of God over your day.</p>
              <span className="el-start__go">Read the DVC &rarr;</span>
            </Link>
            <Link href="/messages" className="el-start__card el-reveal">
              <span className="el-start__step">Step Two</span>
              <h3>Hear A Message</h3>
              <p>Sit under prophetic teaching that stirs faith and reveals your purpose.</p>
              <span className="el-start__go">Listen now &rarr;</span>
            </Link>
            <Link href="/about" className="el-start__card el-reveal">
              <span className="el-start__step">Step Three</span>
              <h3>Know The Story</h3>
              <p>Meet Emmanuel and the heart behind the ministry, the pulpit, and the pen.</p>
              <span className="el-start__go">Read the story &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="el-section el-section--cream">
        <div className="el-wrap">
          <div className="el-head el-reveal">
            <span className="el-eyebrow">Fresh From The Spirit</span>
            <h2>Latest</h2>
            <p>The newest word, writing, and revelation, gathered in one place.</p>
            <div className="el-rule" />
          </div>
          <div className="el-latest" id="elLatest">
            <article className="el-card el-reveal">
              <div className="el-card__media el-card__media--dummy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="el-card__body">
                <span className="el-card__meta">Message</span>
                <h3 className="el-card__title">{latestMessage?.title || "Latest Message"}</h3>
                <p className="el-card__excerpt">
                  {latestMessage?.preacher
                    ? `${latestMessage.preacher}${latestMessage.category ? ` · ${latestMessage.category}` : ""}`
                    : "A featured sermon excerpt appears here, pulled from the messages backend."}
                </p>
                <Link href="/messages" className="el-card__link">
                  Listen now &rarr;
                </Link>
              </div>
            </article>
            <article className="el-card el-reveal">
              <div className="el-card__media el-card__media--dummy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="el-card__body">
                <span className="el-card__meta">Article</span>
                <h3 className="el-card__title">{latestArticle?.title || "Latest Article"}</h3>
                <p className="el-card__excerpt">
                  {latestArticle?.excerpt || "A featured article excerpt appears here, pulled from the articles backend."}
                </p>
                <Link href="/articles" className="el-card__link">
                  Read now &rarr;
                </Link>
              </div>
            </article>
            <article className="el-card el-reveal">
              <div className="el-card__media el-card__media--dummy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="el-card__body">
                <span className="el-card__meta">Music</span>
                <h3 className="el-card__title">{latestMusic?.title || "Latest Release"}</h3>
                <p className="el-card__excerpt">
                  {latestMusic?.title
                    ? `Latest release: ${latestMusic.title}`
                    : "A featured song appears here, pulled from the music backend."}
                </p>
                <Link href="/music" className="el-card__link">
                  Play now &rarr;
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="el-section el-section--dark">
        <div className="el-wrap">
          <div className="el-head el-reveal">
            <span className="el-eyebrow">In Verse</span>
            <h2>Poems</h2>
            <p>Where scripture meets the ache and wonder of being human.</p>
            <div className="el-rule" />
          </div>
          <div className="el-poems" id="elPoems">
            {fallbackPoems.map((poem) => (
              <article key={poem.title} className="el-poem el-reveal">
                <span className="el-poem__num">{poem.num}</span>
                <h3 className="el-poem__title">{poem.title}</h3>
                <p className="el-poem__body">{poem.body}</p>
                <Link href="/poems" className="el-poem__link">
                  Read poem &rarr;
                </Link>
              </article>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }} className="el-reveal">
            <Link href="/poems" className="el-btn el-btn--ghost">
              All Poems
            </Link>
          </div>
        </div>
      </section>

      <section className="el-section el-section--light">
        <div className="el-wrap el-about__inner">
          <div className="el-about__media el-reveal">
            <div className="el-about__frame">
              <Image src={aboutPortrait} alt="Emmanuel I. Emodiae in prayer" loading="lazy" />
            </div>
          </div>
          <div className="el-about__copy el-reveal">
            <span className="el-eyebrow">About Me</span>
            <h2>A Voice For Your Destiny</h2>
            <p>
              I am a passionate and prophetic preacher of Jesus Christ, called to share His transformative message with a
              generation hungry for more.
            </p>
            <p>
              Through my ministry, I aim to inspire believers to deepen their faith, discover their purpose, and walk in
              the destiny God has ordained for their lives. Whether through the pulpit, the pen, or the poem, the mission
              is one: to point every heart back to Him.
            </p>
            <p className="el-about__sig">Emmanuel I. Emodiae</p>
            <div className="el-about__cta">
              <Link href="/about" className="el-btn el-btn--dark">
                My Full Story
              </Link>
              <a
                href="mailto:eemodiae@gmail.com?subject=Request%20for%20Mentorship"
                className="el-btn el-btn--ghost"
                style={{ color: "var(--coffee)", borderColor: "var(--line)" }}
              >
                Request Mentorship
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="el-section el-section--cream">
        <div className="el-wrap">
          <div className="el-head el-reveal">
            <span className="el-eyebrow">Changed Lives</span>
            <h2>Testimonies</h2>
            <p>What the Word has done in the lives of those who received it.</p>
            <div className="el-rule" />
          </div>
          <div className="el-testi" id="elTesti">
            {testimonials.map((item) => (
              <article key={item.name} className="el-testi__card el-reveal">
                <div className="el-testi__stars" aria-label="Five stars">★★★★★</div>
                <p className="el-testi__quote">{item.quote}</p>
                <div className="el-testi__who">
                  <div className="el-testi__avatar">{item.name.charAt(0)}</div>
                  <div>
                    <div className="el-testi__name">{item.name}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="el-section el-section--light">
        <div className="el-wrap">
          <div className="el-head el-reveal">
            <span className="el-eyebrow">The Store</span>
            <h2>Read &amp; Grow</h2>
            <p>Books and resources to establish your walk, one page at a time.</p>
            <div className="el-rule" />
          </div>
          <div className="el-store" id="elStore">
            {(storeItems.length ? storeItems : [1, 2, 3, 4]).map((item: any, index: number) => (
              <article key={item?.id || index} className="el-book el-reveal">
                <div className="el-book__cover el-book__cover--dummy">
                  <span>
                    Cover
                    <br />
                    pending
                  </span>
                </div>
                <h3 className="el-book__title">{item?.title || `Featured Title ${index + 1}`}</h3>
                <p className="el-book__price">{item?.price ? `₦${item.price}` : "₦0.00"}</p>
              </article>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }} className="el-reveal">
            <Link href="/shop" className="el-btn el-btn--dark">
              Visit The Store
            </Link>
          </div>
        </div>
      </section>

      <section className="el-ctacards">
        <div className="el-ctacards__wrap">
          <div className="el-ctacard el-reveal">
            <h2>Invite Emmanuel To Minister</h2>
            <p>For conferences, crusades, and speaking engagements, let&apos;s begin the conversation.</p>
            <div className="el-ctacard__cta">
              <Link href="/bookings" className="el-btn el-btn--dark">
                Book An Engagement
              </Link>
            </div>
          </div>
          <div className="el-ctacard el-ctacard--alt el-reveal">
            <h2>Become A Partner</h2>
            <p>Sow your seed today and take your place in the harvest. Every gift carries this ministry further.</p>
            <div className="el-ctacard__cta">
              <Link href="/give" className="el-btn el-btn--dark">
                Partner &amp; Give
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
