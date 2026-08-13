import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";
import { sendSiteMail } from "../../util/sendSiteMail";

/* ============================================================
   eemodiae.org — TESTIMONIES  (redesign port)
   Testimony gallery with a featured spotlight, theme filters,
   search, a read-full modal, and a "Share Your Testimony" form
   (WhatsApp handoff + Email via Nodemailer API). Ported 1:1 from the
   redesign. Self-contained and CMS-hookable: replace CATEGORIES /
   TESTIMONIES (or the loader) to feed live data. Uses the shared
   el- design system so it sits inside the redesign core.
   ============================================================ */

const TESTI_HERO = "/redesign/testimonies-hero.jpg";
/* Set the ministry WhatsApp number (country code, no +, digits only),
   e.g. "2348012345678". Blank → the WhatsApp option guides to Email. */
const WHATSAPP_NUMBER = "";
const TESTI_EMAIL = "eemodiaetestimonies@gmail.com";
const MAIL_INBOX = "testimonies" as const;
const MAX_WORDS = 250;

type Category = { id: string; name: string; icon: string; blurb: string };
type Testimony = {
  id: string; category: string; title: string; quote: string; full: string;
  image: string; name: string; verified: boolean; featured: boolean; stars: number;
};

const isBrowser = () => typeof window !== "undefined";
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const initialsOf = (name: string) => (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const paras = (text: string) => String(text || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

const CATEGORIES: Category[] = [
  { id: "healing", name: "Healing", icon: "heart", blurb: "Bodies restored by the power of God." },
  { id: "deliverance", name: "Deliverance", icon: "broken", blurb: "Freedom from every chain and bondage." },
  { id: "financial", name: "Financial Miracles", icon: "coins", blurb: "Provision, promotion, and open doors." },
  { id: "marriage", name: "Miracle Marriages", icon: "rings", blurb: "Homes rebuilt and covenants restored." },
  { id: "fruitfulness", name: "Fruitfulness", icon: "seed", blurb: "Long-awaited children and answered prayer." },
  { id: "salvation", name: "Salvation & Growth", icon: "cross", blurb: "Lives surrendered and faith deepened." },
  { id: "prophetic", name: "Prophetic Fulfilment", icon: "flame", blurb: "Words spoken that came to pass." },
];

const TESTIMONIES: Testimony[] = [
  {
    id: "t-jasmine", category: "salvation",
    title: "From Discipleship to Divine Testimonies",
    quote: "I met Pastor Emodiae in my second year of college through my roommate, who was a member of Upper Room Business. Little did I know that this encounter would become the bedrock of a vibrant Christian journey.",
    full: "I met Pastor Emodiae in my second year of college through my roommate, who was a member of Upper Room Business. Little did I know that this encounter would become the bedrock of a vibrant Christian journey.\n\nI have been privileged to experience many personal blessings through this ministry. Notable among them are the seriousness of purpose, training, and impartation I received through the Upper Room Business platform. I also continue to be mentored by Pastor Emodiae.\n\nAt Upper Room Business, I heard the Word of God taught in a way I had never heard before. This ignited in me a deep hunger to know God more and brought me to the understanding that Christ is the center and the Blessing.\n\nFurthermore, I cultivated a vibrant prayer life through the weekly Upper Room Business prayer meetings and our annual retreats, where I learned how to pray long, fervent prayers in line with God's Word.\n\nMy family and I have witnessed many prophetic words from God's servant come to fruition in our lives. One such instance occurred when we were trusting God for a child. After several months of trying to conceive without success, Pastor Emodiae prayed with us and declared that we would see God's hand in our situation on or before May. To the glory of God, we conceived our child in May 2025, exactly as he had declared, just a few months after that prophetic utterance.\n\nI have also experienced answers to prayer concerning my health, finances, and ministry by virtue of this association.\n\nThere are so many blessings that words fail me to adequately express them all. Through it all, Pastor Emodiae has continued to be a steady voice of wisdom and guidance in my life and in the life of my family. I am truly blessed by his consistent character and tireless labor of love, and I remain closely connected to and continually anchored by his ministry.",
    image: "/redesign/testi-jasmine.jpg",
    name: "Jasmine O.", verified: true, featured: false, stars: 5,
  },
  {
    id: "t-mercy", category: "salvation",
    title: "Strengthened Through God's Promises",
    quote: "I met Pastor Emmanuel Emodiae when I was a teenager, and one of the greatest things he instilled in me was confidence. I was very shy and afraid of facing crowds, but he intentionally placed me in...",
    full: "I met Pastor Emmanuel Emodiae when I was a teenager, and one of the greatest things he instilled in me was confidence. I was very shy and afraid of facing crowds, but he intentionally placed me in roles that helped me overcome that fear. As a teenage church usher, he encouraged me to smile while serving and to carry out my responsibilities with confidence. Those moments played a significant role in shaping the person I have become.\n\nPastor Emmanuel Emodiae's counsel and instruction greatly strengthened my spiritual life. His consistent teaching of God's Word established my faith and made it steadfast.\n\nHe was also my relationship counselor. I always felt free to discuss every relationship I was in and every suitor who came my way. His wisdom and godly guidance helped me make sound decisions.\n\nPastor Emmanuel Emodiae has been a tremendous blessing to my life, especially in helping me understand God's Word and the finished work of Christ. His teachings on the Gospel are simple, practical, and easy to understand, without any ambiguity.\n\nI remember my final year in school when I was deeply concerned that I would not graduate with my classmates because I was working and studying at the same time. I called him, and he assured me that God was with me. He confidently told me that I would graduate with my classmates and that, when it was time for the National Youth Service, I would also serve with them. Everything happened exactly as he had said.\n\nOne remarkable thing about Pastor Emmanuel Emodiae is the peace and confidence he has in God's Word. Regardless of how difficult a situation may appear, he remains certain that it will end well and that all things will work together for good. That unwavering faith has inspired me on many occasions.\n\nI am deeply grateful to God that I encountered him early in life. His life, teachings, and ministry have been, and continue to be, a tremendous blessing to me.",
    image: "/redesign/testi-mercy.jpg",
    name: "Mercy A. E.", verified: true, featured: false, stars: 5,
  },
  {
    id: "t-victor", category: "healing",
    title: "Healed, Restored, and Established by God's Grace",
    quote: "I have countless reasons to thank God for the impact of His servant, Pastor Emmanuel Emodiae, and his ministry on my life and family.",
    full: "I have countless reasons to thank God for the impact of His servant, Pastor Emmanuel Emodiae, and his ministry on my life and family.\n\nI had the privilege of meeting Pastor Emmanuel as a teenager, and his influence has been instrumental in keeping me grounded in the ways of God. Through the different seasons of my life, especially the difficult ones, he has always been there with prayers, encouragement, and godly counsel.\n\nOne experience that stands out was in 2017. I was at one of the lowest points in my life financially and professionally while also dealing with my father's ill health. I had returned to Kaduna to stay with my parents and was desperately searching for a means of livelihood. During one of Pastor Emmanuel's visits to Kaduna, we took a walk together. As we talked, he spoke God's Word into my life and prayed for me. Those words lifted my spirit and rekindled my hope. Today, I can boldly say that the prophecies and prayers from that day are evident in my life. God has blessed me with a wonderful family, landed properties, cars, and financial stability.\n\nAnother remarkable encounter happened in 2024 during one of Pastor Emmanuel's online prayer sessions. He shared a word of wisdom with me and gave me a specific instruction from the Lord concerning my health. Before then, I had experienced a troubling dream in which it seemed my life was under spiritual attack. When I shared the dream with him, he prayed fervently and strengthened my faith with God's Word. A few weeks later, I went through a serious health challenge during which I struggled to breathe for several days. Although medical examinations could not identify the cause, I held firmly to the instruction God had given me through His servant and stood on His Word. By God's grace, I came through that season, and my health was completely restored.\n\nI thank God for blessing me with a mentor who genuinely loves God and sincerely cares for me. I believe God has placed Pastor Emmanuel Emodiae as a watchman over my life, and I do not take that privilege for granted.\n\nTo God alone be all the glory.",
    image: "/redesign/testi-victor.jpg",
    name: "Victor M.", verified: true, featured: true, stars: 5,
  },
  {
    id: "t-janet", category: "marriage",
    title: "Rest On Every Side Through God's Faithfulness",
    quote: "I met Pastor Emmanuel Emodiae when he came to Jalingo, Taraba State, for his National Youth Service Corps (NYSC). Since then, my life has never been the same.",
    full: "I met Pastor Emmanuel Emodiae when he came to Jalingo, Taraba State, for his National Youth Service Corps (NYSC). Since then, my life has never been the same. It has truly been a journey from one level of glory to another.\n\nHis teaching of God's Word has given me a deeper understanding of Scripture and taught me how to put the Word into practice. My mind has been renewed, my character transformed, and my prayer life greatly revived through the regular prayer meetings. I give God all the glory for this spiritual growth.\n\nWhen I met Pastor Emmanuel, I was single. Through his prayers, guidance, and godly counsel, God settled me in marriage and blessed my home with two wonderful children. Even when I faced challenges in my family, his prayers and words of wisdom helped me overcome them.\n\nDuring difficult seasons, Pastor Emmanuel has always been available. He stood with me in prayer and made prophetic declarations during health emergencies involving my children and me. Through God's power working through His servant, my family has experienced victory over sickness, disease, and the fear of death.\n\nGod also used him to impact my career. Through his prayers and encouragement, I completed my tertiary education, which led to my promotion at work. Whenever I encountered challenges in my workplace, he prayed with me until every obstacle was removed.\n\nToday, I can confidently say that Pastor Emmanuel Emodiae is God's servant to my family and me. Both my immediate and extended family have benefited from the grace upon his life. I thank God that our paths crossed. God has given me rest on every side, and I return all the glory to Him alone.",
    image: "/redesign/testi-janet.jpg",
    name: "Janet C. I.", verified: true, featured: false, stars: 5,
  },
  {
    id: "t-esan", category: "prophetic",
    title: "A Life Transformed Through Fulfilled Prophecies",
    quote: "I give God all the glory for bringing Pastor Emmanuel Emodiae into my life. I first met him as a teenager, and from that moment, God has used him mightily as a vessel of blessing, guidance, and...",
    full: "I give God all the glory for bringing Pastor Emmanuel Emodiae into my life. I first met him as a teenager, and from that moment, God has used him mightily as a vessel of blessing, guidance, and transformation in my life and family.\n\nThe grace and gift of God upon his life have been evident on countless occasions. Many times, God has revealed things to him through words of knowledge with remarkable accuracy. There have been instances when, even before an ailment manifested, God revealed it to him, prompting him to pray concerning it. On several occasions, while I was experiencing pain or illness, he would call me unexpectedly and tell me exactly what I was going through. He would then pray, and God would bring instant healing. These experiences have continually strengthened my faith in God's power and love.\n\nGod has also used Pastor Emmanuel to provide direction and clarity at critical moments in my life. Through his counsel, prayers, and spiritual guidance, I have received divine direction regarding several important decisions.\n\nOne area where God has particularly used his ministry to impact my life is in my finances. Several years ago, while I was searching for a good job, I sought his prayers and blessing. He instructed me to write down the monthly salary I desired. At the time, the figure I wrote seemed impossibly high, and I was tempted to lower it. However, I chose to stand in faith and left it unchanged. To the glory of God, before long, I began earning twice the amount I had written down. Through God's grace and the ministry of His servant, my financial story was transformed.\n\nI can boldly testify that every prophecy specifically spoken into my life through God's servant has come to pass. Over the years, Pastor Emmanuel has become more than a pastor to me; he has been a mentor, a spiritual father, and a consistent source of encouragement and wisdom.\n\nToday, I give all the glory, honor, and praise to God for His faithfulness and for using Pastor Emmanuel Emodiae as a blessing in my life and family. May God's name alone be exalted.",
    image: "/redesign/testi-esan.jpg",
    name: "Esan B. K.", verified: true, featured: false, stars: 5,
  },
  {
    id: "t-chinenye", category: "healing",
    title: "Healing From Constant Severe Stomach Pains",
    quote: "For almost two months, I suffered from severe stomach pains almost every day.",
    full: "For almost two months, I suffered from severe stomach pains almost every day.\n\nI had become so accustomed to the pain that I didn't bother mentioning it to anyone. I simply endured it quietly until the night Pastor Emmanuel called and asked if I had been experiencing stomach pains. He then prayed for me.\n\nFrom that very night he prayed for me until this moment, I have not felt a single pain.\n\nI thought the pain might return when my menstrual cycle came because I had become used to experiencing intense pain during that time. However, when my period came at the end of last month, I still felt no pain. That was when I realized God had not just healed me for a night, He had healed me completely.\n\nI cannot thank God enough for connecting me to Pastor Emmanuel Emodiae, and I cannot thank him enough for his constant love, prayers, and care.\n\nThank you so much, Pastor Emma. I am truly grateful, sir.",
    image: "/redesign/testi-chinenye.jpg",
    name: "Chinenye O.", verified: true, featured: false, stars: 5,
  },
  {
    id: "t-hayatu", category: "salvation",
    title: "Spiritual Growth Through Sound Teaching and Mentorship",
    quote: "I have been part of this ministry for some time now, and it has greatly helped me maintain a vibrant spiritual life. Through the consistent teaching of the Word, regular prayer meetings, and godly...",
    full: "I have been part of this ministry for some time now, and it has greatly helped me maintain a vibrant spiritual life. Through the consistent teaching of the Word, regular prayer meetings, and godly mentorship, I have experienced tremendous growth and strength in my walk with God.\n\nI am truly grateful to the Lord for connecting me to this ministry and to His servant, Pastor Emmanuel I. Emodiae. His guidance, counsel, and unwavering commitment to God's Word have been a tremendous blessing to my life.",
    image: "/redesign/testi-hayatu.jpg",
    name: "Hayatu U. O.", verified: true, featured: false, stars: 5,
  },
  {
    id: "t-kelechi", category: "financial",
    title: "Divine Turnaround Through Faith and Obedience",
    quote: "I want to thank God for His mighty hand upon my life, made manifest through His servant, Pastor Emmanuel Emodiae.",
    full: "I want to thank God for His mighty hand upon my life, made manifest through His servant, Pastor Emmanuel Emodiae.\n\nI went through a very low and uncertain season in my life. It felt like a wilderness season, where nothing significant seemed to be happening. Despite putting in so much effort, I had little or nothing to show for it. I found myself asking questions such as, \"What happened to all the prophecies spoken over my life? What happened to all the blessings I received in church every week? Had they suddenly passed me by?\"\n\nThen an instruction came through God's servant for me to relocate from my current city to a metropolitan city where the cost of living was almost ten times higher. I was deeply concerned because I had no solid plan for how I would survive, where I would live, or how I would manage the many uncertainties ahead. Nevertheless, I chose to obey and moved in faith.\n\nShortly afterward, another instruction came to participate in a five-day fast titled \"Change of Level.\" I obeyed wholeheartedly. Within the space of one year, I experienced a remarkable turnaround, with multiple doors of favour and breakthrough opening in my life and career.\n\nJehovah Overdo visited me with blessings that money can buy and blessings that money cannot buy. By God's grace, I rented a decent home, secured a choice job, acquired my dream car, and witnessed many other remarkable wonders that the Lord brought to pass through the word of His servant.\n\nHallelujah!",
    image: "/redesign/testi-kelechi.jpg",
    name: "Kelechi A.", verified: true, featured: false, stars: 5,
  },
];

const TestiBase = createGlobalStyle`
  html.testi-redesign-root {
    font-size: 16px;
  }
`;

const Wrap = styled.div`
  /* ===== design tokens (scoped) ===== */

  --ink:#0E0E0E;
  --charcoal:#141118;
  --plum:#1c1622;
  --navy:#211a33;
  --gold:#c9a24b;
  --gold-bright:#e4c169;
  --gold-soft:#b8923f;
  --cream:#f5f0e6;
  --ivory:#faf6ee;
  --camel:#c9a878;
  --coffee:#4a3b2a;
  --chocolate:#2c2013;
  --line:rgba(201,162,75,.22);
  --line-soft:rgba(201,162,75,.12);
  --text-on-dark:#efe7d6;
  --muted-on-dark:#b8ad97;
  --text-on-light:#2c2013;
  --muted-on-light:#6b5a44;
  --shadow-lg:0 30px 80px -30px rgba(0,0,0,.6);
  --shadow-md:0 18px 44px -20px rgba(0,0,0,.5);
  --radius:18px;
  --radius-sm:12px;
  --maxw:1200px;
  --ease:cubic-bezier(.22,.61,.36,1);

  position:relative;

/* ============================================================
   eemodiae.org  TESTIMONIES
   Design system: Cinzel / Cormorant Garamond / Crimson Pro / EB Garamond
   Palette: warm gold, deep charcoal/plum-navy, cream/ivory
   Prefix: el-  (matches eemodiae landing)
   Self-contained. No external deps beyond fonts + FormSubmit action.
   CMS hooks via data-cms attrs. No em-dashes anywhere.
   ============================================================ */

& *{box-sizing:border-box;margin:0;padding:0}
  &{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}} &{
  font-family:"Crimson Pro","EB Garamond",Georgia,serif;
  background:var(--ivory);
  color:var(--text-on-light);
  line-height:1.65;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
.el-wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px}
@media (max-width:768px){.el-wrap{padding:0 18px}}
h1,h2,h3,.el-display{font-family:"Cinzel",serif;font-weight:600;letter-spacing:.02em;line-height:1.15}
.el-serif{font-family:"Cormorant Garamond",serif}
.el-eyebrow{
  font-family:"Cinzel",serif;font-size:.72rem;font-weight:600;
  letter-spacing:.32em;text-transform:uppercase;color:var(--gold-soft);
}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}

/* ---------- buttons ---------- */
.el-btn{
  display:inline-flex;align-items:center;gap:.55rem;
  font-family:"Cinzel",serif;font-weight:600;font-size:.82rem;
  letter-spacing:.14em;text-transform:uppercase;
  padding:.95rem 1.8rem;border-radius:999px;cursor:pointer;border:1px solid transparent;
  transition:transform .35s var(--ease),box-shadow .35s var(--ease),background .35s var(--ease),color .35s var(--ease);
  white-space:nowrap;
}
.el-btn:focus-visible{outline:2px solid var(--gold-bright);outline-offset:3px}
.el-btn--gold{
  background:linear-gradient(135deg,var(--gold-bright),var(--gold) 55%,var(--gold-soft));
  color:#241a08;box-shadow:0 14px 30px -12px rgba(201,162,75,.7);
}
.el-btn--gold:hover{transform:translateY(-3px);box-shadow:0 20px 40px -12px rgba(201,162,75,.85)}
.el-btn--ghost{background:transparent;border-color:var(--line);color:var(--gold-bright)}
.el-btn--ghost:hover{background:rgba(201,162,75,.1);transform:translateY(-3px)}
.el-btn--dark{background:var(--chocolate);color:var(--cream)}
.el-btn--dark:hover{transform:translateY(-3px);box-shadow:var(--shadow-md)}
@media (prefers-reduced-motion:reduce){.el-btn:hover{transform:none}}

/* ============================ HERO ============================ */
/* Reserved image space. Drop a panoramic image into --hero-img later.
   Until then a rich gold-on-charcoal plate carries the header. */
.el-hero{
  position:relative;
  background:
    radial-gradient(1200px 500px at 78% -10%, rgba(201,162,75,.18), transparent 60%),
    linear-gradient(180deg, #12100f 0%, #17130f 55%, #0d0b0a 100%);
  color:var(--text-on-dark);
  overflow:hidden;
  min-height:56vh;
  display:flex;align-items:center;
}
/* When Shemi supplies the image, set data-hero-img on the section (JS reads it)
   or add inline style="--hero-img:url('...')" and this layer paints it. */
.el-hero__bg{
  position:absolute;inset:0;z-index:0;
  background-image:var(--hero-img,none);
  background-size:cover;background-position:center;background-repeat:no-repeat;
}
.el-hero__scrim{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,rgba(8,6,6,.86) 0%,rgba(8,6,6,.55) 42%,rgba(8,6,6,.12) 72%,rgba(8,6,6,0) 100%),
             linear-gradient(180deg,rgba(8,6,6,.4) 0%,rgba(8,6,6,0) 30%,rgba(8,6,6,0) 70%,rgba(8,6,6,.55) 100%);
}
.el-hero__grain{
  position:absolute;inset:0;opacity:.05;pointer-events:none;mix-blend-mode:overlay;z-index:2;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url%28%23n%29'/%3E%3C/svg%3E");
}
/* the empty-state marker shows only while no image is set, so the space reads as intentional */
.el-hero__placeholder{
  position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;
  pointer-events:none;
}
.el-hero__placeholder span{
  font-family:"Cinzel",serif;font-size:.7rem;letter-spacing:.32em;text-transform:uppercase;
  color:rgba(201,162,75,.32);border:1px dashed rgba(201,162,75,.25);
  padding:.5rem 1rem;border-radius:999px;
}
.el-hero.has-image .el-hero__placeholder{display:none}

/* ---------- banner mode ----------
   Used when the hero image is a finished artwork that already carries
   its own title and verse. The overlaid text is hidden, the scrim is
   lightened so the art reads cleanly, and the image itself animates. */
.el-hero.is-banner{min-height:0;display:block}
.el-hero.is-banner .el-hero__inner{display:none}
.el-hero.is-banner .el-hero__scrim{
  background:linear-gradient(180deg,rgba(8,6,6,.30) 0%,rgba(8,6,6,0) 22%,rgba(8,6,6,0) 74%,rgba(8,6,6,.34) 100%);
}
.el-hero.is-banner .el-hero__grain{opacity:.035}
/* the frame keeps the banner's own aspect ratio so nothing is cropped away */
.el-hero__frame{position:relative;width:100%;aspect-ratio:var(--hero-ratio,1536/610);overflow:hidden}
.el-hero.is-banner .el-hero__bg{
  transform-origin:center;
  will-change:transform;
  animation:heroDrift 26s var(--ease) infinite alternate;
}
/* slow cinematic drift - gentle enough that the contained artwork
   never pushes its title or verse past the frame edge */
@keyframes heroDrift{
  from{transform:scale(1.005) translate3d(0,0,0)}
  to  {transform:scale(1.04) translate3d(0,-0.5%,0)}
}
/* light sweep travelling across the artwork, echoing the gold rays */
.el-hero.is-banner .el-hero__frame::after{
  content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(105deg,transparent 34%,rgba(255,240,205,.20) 47%,rgba(255,247,225,.30) 50%,rgba(255,240,205,.20) 53%,transparent 66%);
  transform:translateX(-115%);
  animation:heroSheen 9s ease-in-out 1.4s infinite;
  mix-blend-mode:screen;
}
@keyframes heroSheen{
  0%{transform:translateX(-115%)}
  55%,100%{transform:translateX(115%)}
}
/* first paint: the banner settles in rather than snapping on */
.el-hero.is-banner .el-hero__frame{animation:heroRise 1.25s var(--ease) both}
@keyframes heroRise{
  from{opacity:0;transform:scale(1.03)}
  to{opacity:1;transform:scale(1)}
}
@media (prefers-reduced-motion:reduce){
  .el-hero.is-banner .el-hero__bg,
  .el-hero.is-banner .el-hero__frame,
  .el-hero.is-banner .el-hero__frame::after{animation:none}
  .el-hero.is-banner .el-hero__bg{transform:none}
}
/* The banner is a finished 1536x610 artwork with its title and verse
   built in, so it must never be cropped. The frame keeps the exact
   2.52:1 ratio at every width and the image is contained, not covered
   - the whole banner stays readable down to the smallest phone. */
.el-hero.is-banner .el-hero__bg{
  background-size:contain;
  background-position:center;
  background-color:#0d0b0a;
}
@media (max-width:900px){
  /* drift gently reduced so nothing drifts out of frame when contained */
  .el-hero.is-banner .el-hero__bg{animation-name:heroDriftSm}
}
@keyframes heroDriftSm{
  from{transform:scale(1.005) translate3d(0,0,0)}
  to  {transform:scale(1.035) translate3d(0,-0.4%,0)}
}
.el-hero__inner{position:relative;z-index:3;width:100%}
.el-hero__copy{max-width:640px;padding:4.5rem 0}
.el-hero__eyebrow{color:var(--gold-bright);margin-bottom:1rem}
.el-hero__title{font-size:clamp(2.4rem,6vw,4rem);color:#fbf4e4}
.el-hero__lead{
  font-family:"Cormorant Garamond",serif;font-size:clamp(1.15rem,2.4vw,1.5rem);
  color:var(--text-on-dark);margin-top:1.1rem;max-width:52ch;font-style:italic;
}
.el-hero__verse{margin-top:1.4rem;color:var(--muted-on-dark);font-size:1.02rem}
.el-hero__verse b{color:var(--gold-bright);font-weight:600;font-style:normal}

/* ============================ SECTION SHELL ============================ */
.el-section{padding:clamp(3.5rem,7vw,6rem) 0}
.el-section--cream{background:var(--cream)}
.el-section--light{background:var(--ivory)}
.el-head{text-align:center;max-width:640px;margin:0 auto 2.6rem}
.el-head h2{font-size:clamp(1.9rem,4vw,2.7rem);margin-top:.6rem}
.el-head p{color:var(--muted-on-light);margin-top:.7rem;font-size:1.08rem}
.el-rule{width:64px;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:1.3rem auto 0}

/* ============================ FEATURED SPOTLIGHT ============================ */
.el-spotlight{
  position:relative;background:linear-gradient(150deg,var(--navy),var(--plum) 60%,var(--charcoal));
  color:var(--text-on-dark);border:1px solid var(--line);border-radius:var(--radius);
  padding:clamp(1.4rem,3.2vw,2.4rem);box-shadow:var(--shadow-lg);overflow:hidden;
  max-width:900px;margin:0 auto 2.2rem;
}
.el-spotlight__tag{
  display:inline-flex;align-items:center;gap:.45rem;font-family:"Cinzel",serif;font-size:.68rem;
  letter-spacing:.24em;text-transform:uppercase;color:#241a08;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold-soft));
  padding:.35rem .85rem;border-radius:999px;margin-bottom:1.1rem;
}
.el-spotlight__quote{
  font-family:"Cormorant Garamond",serif;font-size:clamp(1.3rem,2.6vw,1.7rem);
  font-style:italic;color:#fbf4e4;position:relative;z-index:1;
  display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;
}
.el-spotlight__who{margin-top:1.4rem;display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.el-spotlight__name{font-family:"Cinzel",serif;color:var(--gold-bright);font-size:1rem}
.el-spotlight__meta{color:var(--muted-on-dark);font-size:.92rem}
.el-spotlight__media{
  width:86px;height:86px;border-radius:50%;overflow:hidden;flex:0 0 auto;
  border:2px solid var(--gold-bright);box-shadow:var(--shadow-sm);margin-bottom:1.2rem;
}
.el-spotlight__media img{width:100%;height:100%;object-fit:cover;display:block}
.el-spotlight__read{margin-top:1.2rem;color:var(--gold-bright)}
.el-spotlight__title{font-family:"Cinzel",serif;font-size:clamp(1.15rem,2.6vw,1.5rem);color:var(--gold-bright);margin:.2rem 0 1rem;line-height:1.25}
.el-spotlight__read:hover{color:#fbf4e4}

/* ============================ CONTROLS: search + filter ============================ */
.el-controls{max-width:960px;margin:0 auto 2.4rem}
.el-search{position:relative;max-width:420px;margin:0 auto 1.4rem}
.el-search input{
  width:100%;font-family:"Crimson Pro",serif;font-size:1rem;color:var(--text-on-light);
  background:#fff;border:1px solid var(--line);border-radius:999px;padding:.85rem 1.1rem .85rem 2.8rem;
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease);
}
.el-search input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,162,75,.15)}
.el-search svg{position:absolute;left:1rem;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--gold-soft)}
.el-filters{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center}
.el-chip{
  font-family:"Cinzel",serif;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
  padding:.55rem 1rem;border-radius:999px;border:1px solid var(--line);
  background:#fff;color:var(--coffee);cursor:pointer;
  transition:all .3s var(--ease);display:inline-flex;align-items:center;gap:.5rem;
}
.el-chip:hover{border-color:var(--gold);transform:translateY(-2px)}
.el-chip.is-active{background:var(--chocolate);color:var(--cream);border-color:var(--chocolate)}
.el-chip__count{
  font-size:.66rem;background:rgba(201,162,75,.18);color:var(--gold-soft);
  padding:.05rem .45rem;border-radius:999px;min-width:1.4rem;text-align:center;
}
.el-chip.is-active .el-chip__count{background:rgba(255,255,255,.16);color:var(--cream)}

/* ============================ CATEGORY BLOCKS ============================ */
.el-cat{margin-bottom:3.2rem;scroll-margin-top:100px}
.el-cat__head{display:flex;align-items:center;gap:1rem;margin-bottom:1.4rem}
.el-cat__icon{
  width:44px;height:44px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;
  background:linear-gradient(135deg,rgba(201,162,75,.16),rgba(201,162,75,.05));
  border:1px solid var(--line);color:var(--gold-soft);
}
.el-cat__icon svg{width:22px;height:22px}
.el-cat__title{font-size:1.35rem;color:var(--chocolate)}
.el-cat__count{font-size:.82rem;color:var(--muted-on-light);letter-spacing:.04em}
.el-cat__line{flex:1;height:1px;background:linear-gradient(90deg,var(--line),transparent)}

.el-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));gap:1.4rem}

/* ---------- testimony card ---------- */
.el-card{
  background:#fff;border:1px solid var(--line-soft);border-radius:var(--radius);
  padding:1.6rem 1.6rem 1.3rem;position:relative;
  box-shadow:0 12px 30px -22px rgba(0,0,0,.4);
  transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s var(--ease);
  display:flex;flex-direction:column;
}
.el-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md);border-color:var(--line)}
.el-card__stars{color:var(--gold);letter-spacing:.15em;font-size:.9rem;margin-bottom:.7rem}
.el-card__title{font-family:"Cinzel",serif;font-size:1.02rem;font-weight:600;color:var(--chocolate);margin-bottom:.55rem;line-height:1.3}
.el-card__quote{font-size:1.02rem;color:var(--text-on-light);flex:1}
.el-card__quote.is-clamped{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.el-card__more{
  align-self:flex-start;background:none;border:none;cursor:pointer;padding:.3rem 0 0;
  font-family:"Cinzel",serif;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-soft);
}
.el-card__more:hover{color:var(--gold)}
.el-card__name{font-family:"Cinzel",serif;font-size:.9rem;color:var(--chocolate);display:flex;align-items:center;gap:.35rem}
.el-card__loc{font-size:.82rem;color:var(--muted-on-light)}
.el-card__verified{color:var(--gold);width:14px;height:14px}
.el-card__cat{
  position:absolute;top:1.1rem;right:1.1rem;font-family:"Cinzel",serif;font-size:.6rem;
  letter-spacing:.14em;text-transform:uppercase;color:var(--gold-soft);
  background:rgba(201,162,75,.1);padding:.25rem .6rem;border-radius:999px;z-index:2;
}

/* ---------- card photo (circular avatar, matches About page) ---------- */
.el-card__media{
  width:54px;height:54px;border-radius:50%;overflow:hidden;flex:0 0 auto;
  border:2px solid var(--gold-soft);box-shadow:var(--shadow-sm);
}
.el-card__media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s var(--ease)}
.el-card:hover .el-card__media img{transform:scale(1.06)}
/* reserved-space marker while a photo has not been supplied */
.el-card__media--empty{
  display:grid;place-items:center;border:2px dashed rgba(201,162,75,.35);
  background:linear-gradient(135deg,rgba(201,162,75,.16),rgba(201,162,75,.05));
}
.el-card__media--empty span{
  font-family:"Cinzel",serif;font-size:.82rem;letter-spacing:.02em;
  color:var(--gold-soft);
}
/* header row holding the avatar next to the name */
.el-card__top{display:flex;align-items:center;gap:.85rem;margin-bottom:1rem;padding-right:5.5rem;min-height:54px}
.el-card__top .el-card__name{font-family:"Cinzel",serif;font-size:.9rem;color:var(--coffee);letter-spacing:.03em;display:flex;align-items:center;gap:.35rem}
.el-card__top .el-card__loc{display:block;font-size:.85rem;color:var(--muted-on-light);margin-top:.15rem}

/* ---------- read full testimony ---------- */
.el-card__read{
  align-self:flex-start;margin-top:.4rem;background:none;border:none;cursor:pointer;padding:.3rem 0 0;
  font-family:"Cinzel",serif;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-soft);
  display:inline-flex;align-items:center;gap:.4rem;
}
.el-card__read:hover{color:var(--gold)}
.el-card__read svg{width:13px;height:13px}

/* ---------- full testimony modal ---------- */
.el-modal{
  position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;
  padding:18px;background:rgba(20,14,10,.62);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);
}
.el-modal.is-open{display:flex}
/* ---------- the reading page ----------
   A warm cream sheet with dark serif text, so a full testimony
   reads like a printed page rather than a dark UI panel. */
.el-modal__box{
  position:relative;max-width:660px;width:100%;max-height:90vh;overflow:auto;
  background:#fdfaf2;
  color:var(--coffee);
  border:1px solid rgba(201,162,75,.28);border-radius:22px;
  box-shadow:0 40px 90px -30px rgba(20,14,10,.7);
  -webkit-overflow-scrolling:touch;
}
.el-modal__media{
  width:86px;height:86px;border-radius:50%;overflow:hidden;flex:0 0 auto;
  border:2.5px solid var(--gold-soft);box-shadow:0 6px 18px -8px rgba(20,14,10,.5);
}
.el-modal__media img{width:100%;height:100%;object-fit:cover;display:block}
.el-modal__head{display:flex;align-items:center;gap:1.1rem;margin-bottom:1.6rem}
.el-modal__head .el-modal__name{
  font-family:"Cinzel",serif;font-size:1.15rem;color:var(--coffee);
  letter-spacing:.06em;display:flex;align-items:center;gap:.4rem;
}
.el-modal__body{padding:clamp(1.7rem,5vw,2.8rem)}
.el-modal__stars{color:var(--gold);letter-spacing:.22em;font-size:1.15rem;margin-bottom:1.1rem}
.el-modal__title{
  font-family:"Cinzel",serif;font-size:clamp(1.35rem,3.4vw,1.75rem);
  color:var(--chocolate);margin-bottom:1.5rem;line-height:1.3;letter-spacing:.01em;
}
/* body copy: roomy line height and a paper-like measure */
.el-modal__quote{
  font-family:"Cormorant Garamond",serif;
  font-size:clamp(1.22rem,3vw,1.42rem);
  color:#3b2f26;line-height:1.85;font-style:normal;
}
.el-modal__quote p{margin-bottom:1.35em}
.el-modal__quote p:last-child{margin-bottom:0}
/* opening line gets a little more presence */
.el-modal__quote p:first-child{color:#2f251d}
.el-modal__name{font-family:"Cinzel",serif;color:var(--coffee);font-size:1rem;display:flex;align-items:center;gap:.35rem}
.el-modal__meta{color:var(--muted-on-light);font-size:.92rem}
.el-modal__head .el-card__verified{width:17px;height:17px}
.el-modal__close{
  position:absolute;top:1rem;right:1rem;z-index:2;width:44px;height:44px;border-radius:50%;
  background:#fffdf7;color:var(--coffee);border:1px solid rgba(201,162,75,.35);cursor:pointer;
  display:grid;place-items:center;transition:all .3s var(--ease);
  box-shadow:0 4px 14px -6px rgba(20,14,10,.35);
}
.el-modal__close:hover{background:var(--gold-bright);color:#fffdf7;border-color:var(--gold-bright)}
.el-modal__close svg{width:20px;height:20px}

/* ---------- empty category state ---------- */
.el-empty{
  border:1px dashed var(--line);border-radius:var(--radius);padding:2rem 1.6rem;text-align:center;
  background:rgba(201,162,75,.04);
}
.el-empty p{color:var(--muted-on-light);font-style:italic;margin-bottom:1rem}
.el-empty a{
  font-family:"Cinzel",serif;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;
  color:var(--gold-soft);border-bottom:1px solid var(--line);padding-bottom:2px;
}
.el-empty a:hover{color:var(--gold)}

.el-noresults{text-align:center;padding:3rem 1rem;color:var(--muted-on-light);font-style:italic;display:none}

/* ============================ SHARE FORM ============================ */
.el-form-sec{background:linear-gradient(160deg,var(--charcoal),var(--plum) 70%,var(--navy));color:var(--text-on-dark)}
.el-form-sec .el-head h2{color:#fbf4e4}
.el-form-sec .el-head p{color:var(--muted-on-dark)}
.el-form{
  max-width:640px;margin:0 auto;background:rgba(255,255,255,.03);
  border:1px solid var(--line);border-radius:var(--radius);padding:clamp(1.6rem,4vw,2.6rem);
  backdrop-filter:blur(6px);
}
.el-field{margin-bottom:1.2rem}
.el-field label{
  display:block;font-family:"Cinzel",serif;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--gold-bright);margin-bottom:.5rem;
}
.el-field label .req{color:var(--gold);opacity:.8}
.el-input,.el-textarea{
  width:100%;font-family:"Crimson Pro",serif;font-size:1rem;color:#fbf4e4;
  background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:var(--radius-sm);
  padding:.85rem 1rem;transition:border-color .3s var(--ease),box-shadow .3s var(--ease);
}
.el-input::placeholder,.el-textarea::placeholder{color:rgba(184,173,151,.6)}
.el-input:focus,.el-textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,162,75,.18)}
.el-textarea{resize:vertical;min-height:150px;line-height:1.6}
.el-row{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}
.el-row > .el-field{min-width:0}
.el-input,.el-textarea,.el-select{box-sizing:border-box;max-width:100%}
@media (max-width:560px){
  .el-row{grid-template-columns:1fr}
  .el-form{padding:1.3rem 1.1rem}
  .el-note{font-size:.88rem;padding:.8rem .9rem}
  .el-channel{gap:.7rem}
  .el-channel__btn{flex:1 1 100%;max-width:none;padding:.9rem 1rem}
  .el-channel__pill{right:.5rem;top:-.5rem}
  .el-section{padding-top:40px;padding-bottom:40px}
  .el-spotlight__media{width:64px;height:64px;margin-bottom:.9rem}
  .el-spotlight__quote{font-size:1.18rem;-webkit-line-clamp:3}
  .el-grid{gap:1.1rem}
  .el-card{padding:1.3rem 1.3rem 1.1rem}
}
.el-select{
  width:100%;font-family:"Crimson Pro",serif;font-size:1rem;color:#fbf4e4;
  background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:var(--radius-sm);
  padding:.85rem 1rem;cursor:pointer;
}
.el-select option{background:var(--charcoal);color:#fbf4e4}
.el-count{text-align:right;font-size:.82rem;color:var(--muted-on-dark);margin-top:.4rem}
.el-count.is-over{color:#e08a6a}
.el-check{display:flex;align-items:flex-start;gap:.7rem;margin-bottom:1.2rem;font-size:.92rem;color:var(--muted-on-dark)}
.el-check input{margin-top:.35rem;width:18px;height:18px;accent-color:var(--gold);flex:0 0 auto;cursor:pointer}
.el-check label{font-family:"Crimson Pro",serif;text-transform:none;letter-spacing:0;color:var(--muted-on-dark);font-size:.92rem;margin:0}
.el-honey{position:absolute;left:-9999px;opacity:0;height:0;width:0;overflow:hidden}
.el-form__msg{margin-top:1rem;font-family:"Cormorant Garamond",serif;font-size:1.1rem;font-style:italic;min-height:1.4rem}
.el-form__msg.ok{color:var(--gold-bright)}
.el-form__msg.err{color:#e08a6a}
.el-form__submit{width:100%;justify-content:center;margin-top:.4rem}

/* ---------- share channel picker ---------- */
.el-channel{display:flex;gap:1rem;justify-content:center;max-width:640px;margin:0 auto 1.8rem;flex-wrap:wrap}
.el-channel__btn{
  flex:1 1 200px;max-width:280px;position:relative;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:.6rem;
  font-family:"Cinzel",serif;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--text-on-dark);background:rgba(255,255,255,.03);
  border:1px solid var(--line);border-radius:var(--radius-sm);padding:1rem 1.2rem;
  transition:all .3s var(--ease);
}
.el-channel__btn svg{width:22px;height:22px;flex:0 0 auto}
.el-channel__btn:hover{border-color:var(--gold);transform:translateY(-2px)}
.el-channel__btn.is-active{
  background:linear-gradient(135deg,rgba(201,162,75,.18),rgba(201,162,75,.05));
  border-color:var(--gold);color:#fbf4e4;
}
.el-channel__pill{
  position:absolute;top:-.6rem;right:-.4rem;font-style:normal;font-family:"Cinzel",serif;
  font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;color:#241a08;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold-soft));
  padding:.2rem .55rem;border-radius:999px;
}
/* note lines under each form */
.el-note{
  display:flex;align-items:flex-start;gap:.6rem;margin:.2rem 0 1.2rem;
  font-size:.92rem;line-height:1.5;color:var(--muted-on-dark);
  background:rgba(201,162,75,.06);border:1px solid var(--line-soft);
  border-radius:var(--radius-sm);padding:.85rem 1rem;
  min-width:0;max-width:100%;
}
.el-note > span{min-width:0;flex:1 1 auto;overflow-wrap:anywhere;word-break:break-word;hyphens:auto}
.el-note svg{width:18px;height:18px;flex:0 0 auto;margin-top:.15rem;color:var(--gold-soft)}
.el-note--photo{background:rgba(201,162,75,.1);border-color:var(--line)}
.el-note--photo b{color:var(--gold-bright);font-weight:600}
/* long email must be able to break mid-string on narrow screens */
.el-note__mail{
  color:var(--gold-bright);font-weight:600;
  overflow-wrap:anywhere;word-break:break-all;
}

/* reveal on scroll */
.el-reveal{opacity:0;transform:translateY(22px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
.el-reveal.is-in{opacity:1;transform:translateY(0)}
@media (prefers-reduced-motion:reduce){.el-reveal{opacity:1;transform:none}}
`;
const ICON_PATHS: Record<string, JSX.Element> = {
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />,
  broken: <path d="M13 3 4 14h6l-1 7 9-11h-6z" />,
  coins: <><ellipse cx="9" cy="6" rx="6" ry="3" /><path d="M3 6v6c0 1.7 2.7 3 6 3" /><path d="M3 12v6c0 1.7 2.7 3 6 3" /><circle cx="16" cy="16" r="5" /></>,
  rings: <><circle cx="8" cy="15" r="6" /><circle cx="16" cy="15" r="6" /><path d="m8 3 2 3M16 3l-2 3" /></>,
  seed: <><path d="M12 21V9" /><path d="M12 9C12 5 9 3 4 3c0 5 3 7 8 6z" /><path d="M12 12c0-3 3-5 8-5 0 4-3 6-8 5z" /></>,
  cross: <path d="M10 3h4v6h6v4h-6v8h-4v-8H4V9h6z" />,
  flame: <path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3 0 2 1.5 3 2.5 3 0-3-1-5 1.5-9z" />,
  star: <path d="m12 3 2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z" />,
};
const CatIcon = ({ k }: { k: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{ICON_PATHS[k] || ICON_PATHS.star}</svg>
);
const Stars = ({ n, cls = "el-card__stars" }: { n: number; cls?: string }) => {
  const c = n || 5;
  return <div className={cls} aria-label={c + " stars"}>{"\u2605".repeat(c) + "\u2606".repeat(Math.max(0, 5 - c))}</div>;
};
const Verified = () => (
  <svg className="el-card__verified" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified"><path d="M12 2 9.6 4.6 6 4l-.6 3.6L2 9.6 4.6 12 2 14.4l3.4 2L6 20l3.6-.6L12 22l2.4-2.6 3.6.6.6-3.6L22 14.4 19.4 12 22 9.6l-3.4-2L18 4l-3.6.6z" /><path d="m9 12 2 2 4-4" fill="none" stroke="#fff" strokeWidth="1.6" /></svg>
);

const TestimoniesPage: NextPage = () => {
  const [query, setQuery] = useState("");

  // Insulate this page from the site-wide 20px root font-size (globals.css)
  // so the redesign's rem-based sizing matches the mockup's 16px base.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("testi-redesign-root");
    return () => root.classList.remove("testi-redesign-root");
  }, []);

  const [activeCat, setActiveCat] = useState("all");
  const [modal, setModal] = useState<Testimony | null>(null);
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const lastFocused = useRef<HTMLElement | null>(null);

  const catById = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, c])), []);
  const featured = useMemo(() => TESTIMONIES.find((t) => t.featured) || null, []);

  // filtered testimonies (search + category), excluding the featured from the grid
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TESTIMONIES.filter((t) => {
      if (featured && t.id === featured.id && activeCat === "all" && !q) return false;
      if (activeCat !== "all" && t.category !== activeCat) return false;
      if (q) {
        const hay = (t.name + " " + t.title + " " + t.quote + " " + t.full + " " + (catById[t.category]?.name || "")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, activeCat, featured, catById]);

  // group filtered by category, in CATEGORIES order
  const grouped = useMemo(() => {
    return CATEGORIES.map((c) => ({ cat: c, items: filtered.filter((t) => t.category === c.id) })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const countIn = (catId: string) => TESTIMONIES.filter((t) => t.category === catId).length;

  // modal open/close with focus + body scroll lock + Esc
  const openModal = (t: Testimony) => { lastFocused.current = (isBrowser() ? document.activeElement : null) as HTMLElement; setModal(t); };
  const closeModal = () => { setModal(null); };
  useEffect(() => {
    if (!isBrowser()) return;
    document.body.style.overflow = modal ? "hidden" : "";
    if (!modal && lastFocused.current?.focus) lastFocused.current.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && modal) closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [modal]);

  // reveal-on-scroll
  useEffect(() => {
    if (!isBrowser() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".el-reveal:not(.is-in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [grouped, activeCat, query]);

  const hasFull = (t: Testimony) => !!(t.full && t.full.trim() && t.full.trim() !== t.quote.trim());
  const displayName = (t: Testimony) => t.name || "A member of the family";

  // ---- share form state ----
  const [waName, setWaName] = useState(""); const [waLoc, setWaLoc] = useState("");
  const [waTheme, setWaTheme] = useState(""); const [waText, setWaText] = useState("");
  const [waConsent, setWaConsent] = useState(false); const [waMsg, setWaMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [emName, setEmName] = useState(""); const [emLoc, setEmLoc] = useState("");
  const [emTheme, setEmTheme] = useState(""); const [emText, setEmText] = useState("");
  const [emConsent, setEmConsent] = useState(false); const [emMsg, setEmMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [honey, setHoney] = useState("");
  const waWords = wordCount(waText); const emWords = wordCount(emText);

  const sendWhatsApp = () => {
    setWaMsg(null);
    if (!waName.trim() || !waLoc.trim() || !waTheme || !waText.trim() || !waConsent) {
      setWaMsg({ t: "Please complete every field and give permission to publish.", ok: false }); return;
    }
    if (waWords > MAX_WORDS) { setWaMsg({ t: "Please shorten your testimony to 250 words or fewer.", ok: false }); return; }
    if (!WHATSAPP_NUMBER) { setWaMsg({ t: "The WhatsApp line is being set up. Please use the Email option for now.", ok: false }); return; }
    const themeName = catById[waTheme]?.name || waTheme;
    const msg = "New Testimony for eemodiae.org\n\n" + "Name: " + waName + "\n" + "Location: " + waLoc + "\n" + "Theme: " + themeName + "\n\n" + waText + "\n\n" + "(I give permission for this testimony to be reviewed and published on eemodiae.org. I will attach my photo here.)";
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
    setWaMsg({ t: "Opening WhatsApp... remember to attach your photo before you send.", ok: true });
    if (isBrowser()) window.open(url, "_blank", "noopener");
  };

  const submitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmMsg(null);
    if (honey) return; // bot
    if (emWords > MAX_WORDS) {
      setEmMsg({ t: "Please shorten your testimony to 250 words or fewer.", ok: false });
      return;
    }
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    setEmMsg({ t: "Sending your testimony to His glory... remember to email your photo too.", ok: true });
    try {
      await sendSiteMail({
        inbox: MAIL_INBOX,
        subject: "New Testimony Submission (eemodiae.org)",
        name: emName.trim(),
        message: emText.trim(),
        fields: {
          Name: emName.trim(),
          Location: emLoc.trim(),
          Theme: emTheme,
          Testimony: emText.trim(),
          Consent: emConsent ? "Granted" : "Not granted",
        },
        honeypot: honey,
      });
      setEmMsg({
        t: "Received. Thank you. Please email your photo to " + TESTI_EMAIL + " with your name in the subject.",
        ok: true,
      });
      setEmName("");
      setEmLoc("");
      setEmTheme("");
      setEmText("");
      setEmConsent(false);
    } catch {
      setEmMsg({
        t: "We could not send it just now. Please try again, or email " + TESTI_EMAIL + " directly.",
        ok: false,
      });
    }
  };

  return (
    <>
      <TestiBase />
      <Wrap className="eemodiae-page">
      <Head>
        <title>Testimonies | Emmanuel I. Emodiae</title>
        <meta name="description" content="Real stories of healing, deliverance, breakthrough, and restoration from those who received the Word and saw God move. Revelation 12:11." />
      </Head>
      <Nav />

      {/* HERO */}
      <section className="el-hero has-image is-banner" id="top" aria-label="Testimonies" style={{ ["--hero-img" as any]: `url('${TESTI_HERO}')`, ["--hero-ratio" as any]: "1536/610" }}>
        <div className="el-hero__frame"><div className="el-hero__bg" aria-hidden="true" /><div className="el-hero__scrim" aria-hidden="true" /><div className="el-hero__grain" aria-hidden="true" /></div>
        <div className="el-hero__placeholder" aria-hidden="true"><span>Hero image space reserved</span></div>
        <div className="el-hero__inner">
          <div className="el-wrap">
            <div className="el-hero__copy">
              <p className="el-eyebrow el-hero__eyebrow">His Faithfulness On Record</p>
              <h1 className="el-hero__title">Testimonies</h1>
              <p className="el-hero__lead">Real stories of healing, deliverance, breakthrough, and restoration from those who received the Word and saw God move.</p>
              <p className="el-hero__verse"><b>Revelation 12:11</b> They overcame him by the blood of the Lamb, and by the word of their testimony.</p>
            </div>
          </div>
        </div>
      </section>

      <main id="main">
        {/* SPOTLIGHT */}
        {featured && (
          <section className="el-section">
            <div className="el-wrap">
              <div className="el-spotlight el-reveal" id="elSpotlight">
                {featured.image && (
                  <div className="el-spotlight__media">
                    <img src={featured.image} alt={displayName(featured)} loading="lazy" />
                  </div>
                )}
                <span className="el-spotlight__tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14, color: "#241a08" }}><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3 0 2 1.5 3 2.5 3 0-3-1-5 1.5-9z" /></svg>
                  Featured Testimony
                </span>
                {featured.title && <h3 className="el-spotlight__title">{featured.title}</h3>}
                <p className="el-spotlight__quote">{featured.quote}</p>
                {hasFull(featured) && <button className="el-spotlight__read el-card__read" onClick={() => openModal(featured)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10" /></svg>Read Full Testimony</button>}
                <div className="el-spotlight__who">
                  <span className="el-spotlight__name">{displayName(featured)}{featured.verified && <Verified />}</span>
                  {catById[featured.category] && <span className="el-spotlight__meta">&middot; {catById[featured.category].name}</span>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEARCH + FILTERS + GRID */}
        <section className="el-section el-section--light">
          <div className="el-wrap">
            <div className="el-controls el-reveal">
              <div className="el-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                <input type="search" placeholder="Search testimonies..." aria-label="Search testimonies" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="el-filters" role="tablist" aria-label="Filter by theme">
                <button className={"el-chip" + (activeCat === "all" ? " is-active" : "")} role="tab" aria-selected={activeCat === "all"} onClick={() => setActiveCat("all")}>All<span className="el-chip__count">{TESTIMONIES.length}</span></button>
                {CATEGORIES.map((c) => (
                  <button key={c.id} className={"el-chip" + (activeCat === c.id ? " is-active" : "")} role="tab" aria-selected={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
                    {c.name}<span className="el-chip__count">{countIn(c.id)}</span>
                  </button>
                ))}
              </div>
            </div>

            {grouped.length === 0 ? (
              <div className="el-noresults el-reveal"><p>No testimonies match your search yet.</p><button className="el-btn" onClick={() => { setQuery(""); setActiveCat("all"); }}>Clear search</button></div>
            ) : (
              grouped.map(({ cat, items }) => (
                <div className="el-cat" id={"cat-" + cat.id} key={cat.id}>
                  <div className="el-cat__head el-reveal">
                    <span className="el-cat__icon"><CatIcon k={cat.icon} /></span>
                    <div>
                      <h3 className="el-cat__title">{cat.name}</h3>
                      <span className="el-cat__count">{items.length} {items.length === 1 ? "testimony" : "testimonies"}</span>
                    </div>
                    <span className="el-cat__line" />
                  </div>
                  <div className="el-grid">
                    {items.map((t) => (
                      <article className="el-card el-reveal" data-cat={t.category} key={t.id}>
                        {catById[t.category] && <span className="el-card__cat">{catById[t.category].name}</span>}
                        <div className="el-card__top">
                          {t.image ? <div className="el-card__media"><img src={t.image} alt={displayName(t)} loading="lazy" /></div> : <div className="el-card__media el-card__media--empty"><span>{initialsOf(displayName(t))}</span></div>}
                          <div><span className="el-card__name">{displayName(t)}{t.verified && <Verified />}</span></div>
                        </div>
                        <Stars n={t.stars} />
                        {t.title && <h4 className="el-card__title">{t.title}</h4>}
                        <p className="el-card__quote is-clamped" id={"q-" + t.id}>{t.quote}</p>
                        {!hasFull(t) && <button className="el-card__more" data-q={"q-" + t.id} hidden>Read more</button>}
                        {hasFull(t) && <button className="el-card__read" onClick={() => openModal(t)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10" /></svg>Read Full Testimony</button>}
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SHARE YOUR TESTIMONY */}
        <section className="el-section el-form-sec" id="share">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow" style={{ color: "var(--gold-bright)" }}>Give God The Glory</span>
              <h2>Share Your Testimony</h2>
              <p>Has the Word borne fruit in your life? Tell us what God has done. Every testimony is reviewed before it is published.</p>
              <div className="el-rule" />
            </div>

            <div className="el-channel el-reveal" role="tablist" aria-label="Choose how to share">
              <button type="button" className={"el-channel__btn" + (channel === "whatsapp" ? " is-active" : "")} role="tab" aria-selected={channel === "whatsapp"} onClick={() => setChannel("whatsapp")}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.6-6c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6 8c0 1.7 1.3 3.4 1.4 3.6a11 11 0 0 0 4.6 4 4.6 4.6 0 0 0 2.9.6c.6-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2l-.4-.3z" /></svg>
                <span>WhatsApp</span><em className="el-channel__pill">Fastest</em>
              </button>
              <button type="button" className={"el-channel__btn" + (channel === "email" ? " is-active" : "")} role="tab" aria-selected={channel === "email"} onClick={() => setChannel("email")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                <span>Email</span>
              </button>
            </div>

            {/* WhatsApp pane */}
            {channel === "whatsapp" && (
              <div className="el-form el-reveal" id="elWaPane">
                <div className="el-row">
                  <div className="el-field"><label htmlFor="waName">Your Name <span className="req">*</span></label><input className="el-input" type="text" id="waName" placeholder="Full name" autoComplete="name" value={waName} onChange={(e) => setWaName(e.target.value)} /></div>
                  <div className="el-field"><label htmlFor="waLoc">Location <span className="req">*</span></label><input className="el-input" type="text" id="waLoc" placeholder="City, Country" value={waLoc} onChange={(e) => setWaLoc(e.target.value)} /></div>
                </div>
                <div className="el-field"><label htmlFor="waCategory">Theme <span className="req">*</span></label>
                  <select className="el-select" id="waCategory" value={waTheme} onChange={(e) => setWaTheme(e.target.value)}>
                    <option value="" disabled>Choose a theme</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="el-field"><label htmlFor="waTestimony">Your Testimony <span className="req">*</span></label>
                  <textarea className="el-textarea" id="waTestimony" placeholder="Tell us what God did. Keep it to 250 words." value={waText} onChange={(e) => setWaText(e.target.value)} />
                  <p className={"el-count" + (waWords > MAX_WORDS ? " over" : "")} aria-live="polite">{waWords} / {MAX_WORDS} words</p>
                </div>
                <div className="el-check"><input type="checkbox" id="waConsent" checked={waConsent} onChange={(e) => setWaConsent(e.target.checked)} /><label htmlFor="waConsent">I give permission for this testimony to be reviewed and published on eemodiae.org to the glory of God. <span className="req">*</span></label></div>
                <p className="el-note"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2z" /></svg><span>Tap send and WhatsApp opens with your testimony ready. You can attach your photo before you send.</span></p>
                {waMsg && <p className={"el-form__msg " + (waMsg.ok ? "ok" : "err")} aria-live="polite">{waMsg.t}</p>}
                <button type="button" className="el-btn el-btn--gold el-form__submit" onClick={sendWhatsApp}>Send on WhatsApp</button>
              </div>
            )}

            {/* Email pane */}
            {channel === "email" && (
              <form className="el-form el-reveal" id="elTestiForm" onSubmit={submitEmail} noValidate>
                <div className="el-honey" aria-hidden="true">
                  <label>Leave this empty<input type="text" name="_honey" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} /></label>
                </div>
                <div className="el-row">
                  <div className="el-field"><label htmlFor="elName">Your Name <span className="req">*</span></label><input className="el-input" type="text" id="elName" name="Name" placeholder="Full name" autoComplete="name" required value={emName} onChange={(e) => setEmName(e.target.value)} /></div>
                  <div className="el-field"><label htmlFor="elLoc">Location <span className="req">*</span></label><input className="el-input" type="text" id="elLoc" name="Location" placeholder="City, Country" required value={emLoc} onChange={(e) => setEmLoc(e.target.value)} /></div>
                </div>
                <div className="el-field"><label htmlFor="elCategory">Theme <span className="req">*</span></label>
                  <select className="el-select" id="elCategory" name="Theme" required value={emTheme} onChange={(e) => setEmTheme(e.target.value)}>
                    <option value="" disabled>Choose a theme</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="el-field"><label htmlFor="elTestimony">Your Testimony <span className="req">*</span></label>
                  <textarea className="el-textarea" id="elTestimony" name="Testimony" placeholder="Tell us what God did. Keep it to 250 words." required value={emText} onChange={(e) => setEmText(e.target.value)} />
                  <p className={"el-count" + (emWords > MAX_WORDS ? " over" : "")} aria-live="polite">{emWords} / {MAX_WORDS} words</p>
                </div>
                <div className="el-check"><input type="checkbox" id="elConsent" name="Consent" value="Granted" required checked={emConsent} onChange={(e) => setEmConsent(e.target.checked)} /><label htmlFor="elConsent">I give permission for this testimony to be reviewed and published on eemodiae.org to the glory of God. <span className="req">*</span></label></div>
                <p className="el-note el-note--photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="10" r="1.6" /><path d="m5 19 5-5 4 4 2-2 3 3" /></svg><span>After you submit, please email your photo directly to <a className="el-note__mail" href={"mailto:" + TESTI_EMAIL + "?subject=Testimony%20Photo"}>{TESTI_EMAIL}</a> with your name in the subject line so we can publish it with your testimony.</span></p>
                {emMsg && <p className={"el-form__msg " + (emMsg.ok ? "ok" : "err")} aria-live="polite">{emMsg.t}</p>}
                <button type="submit" className="el-btn el-btn--gold el-form__submit">Submit Testimony</button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* MODAL */}
      <div className={"el-modal" + (modal ? " is-open" : "")} aria-hidden={!modal} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="el-modal__box" role="dialog" aria-modal="true" aria-label="Testimony">
          {modal && (
            <>
              <button className="el-modal__close" aria-label="Close testimony" onClick={closeModal}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
              <div className="el-modal__body">
                <div className="el-modal__head">
                  {modal.image ? <div className="el-modal__media"><img src={modal.image} alt={displayName(modal)} /></div> : <div className="el-modal__media el-card__media--empty"><span>{initialsOf(displayName(modal))}</span></div>}
                  <div><span className="el-modal__name">{displayName(modal)}{modal.verified && <Verified />}</span>{catById[modal.category] && <span className="el-modal__meta">{catById[modal.category].name}</span>}</div>
                </div>
                <Stars n={modal.stars} cls="el-modal__stars" />
                {modal.title && <h3 className="el-modal__title">{modal.title}</h3>}
                <div className="el-modal__quote">{(paras(modal.full && modal.full.trim() ? modal.full : modal.quote)).map((p, i) => <p key={i}>{p}</p>)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </Wrap>
    </>
  );
};

export default TestimoniesPage;
