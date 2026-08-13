import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Nav from "../components/redesign/Nav";
import Footer from "../components/redesign/Footer";
import useReveal from "../components/redesign/useReveal";
import { ListenButton, type PlatformAudioTrack } from "../components/audio";
import { SITE_CONTACT_EMAIL } from "../lib/siteContact";

const ABOUT_STORY_AUDIO: PlatformAudioTrack = {
  id: "about-story",
  src: "/assets/audio/about-story.mp3",
  title: "The Story",
  subtitle: "Emmanuel I. Emodiae",
};

/* ============================================================
   eemodiae.org \u2014 ABOUT
   Ported 1:1 from the redesign. Warm-gold serif design system
   (Cinzel / Cormorant Garamond / Crimson Pro / EB Garamond).
   Shared chrome comes from <Nav /> and <Footer />.
   ============================================================ */

const TESTIMONIES = [
  {
    id: "t1",
    name: "Jasmine O.",
    role: "Upper Room Business",
    title: "From Discipleship to Divine Testimonies",
    img: "/redesign/tsti-t1.jpg",
    intro: "My family and I have witnessed prophetic words from God's servant come to fruition, including the miraculous conception of our child exactly as he declared.",
    full: [
      "I met Pastor Emodiae in my second year of college through my roommate, who was a member of Upper Room Business. Little did I know that this encounter would become the bedrock of a vibrant Christian journey.",
      "I have been privileged to experience many personal blessings through this ministry. Notable among them are the seriousness of purpose, training, and impartation I received through the Upper Room Business platform. I also continue to be mentored by Pastor Emodiae.",
      "At Upper Room Business, I heard the Word of God taught in a way I had never heard before. This ignited in me a deep hunger to know God more and brought me to the understanding that Christ is the center and the Blessing.",
      "Furthermore, I cultivated a vibrant prayer life through the weekly Upper Room Business prayer meetings and our annual retreats, where I learned how to pray long, fervent prayers in line with God's Word.",
      "My family and I have witnessed many prophetic words from God's servant come to fruition in our lives. One such instance occurred when we were trusting God for a child. After several months of trying to conceive without success, Pastor Emodiae prayed with us and declared that we would see God's hand in our situation on or before May. To the glory of God, we conceived our child in May 2025, exactly as he had declared, just a few months after that prophetic utterance.",
      "I have also experienced answers to prayer concerning my health, finances, and ministry by virtue of this association.",
      "There are so many blessings that words fail me to adequately express them all. Through it all, Pastor Emodiae has continued to be a steady voice of wisdom and guidance in my life and in the life of my family. I am truly blessed by his consistent character and tireless labor of love, and I remain closely connected to and continually anchored by his ministry.",
    ],
  },
  {
    id: "t2",
    name: "Mercy A. E.",
    role: "Mentee",
    title: "Strengthened Through God's Promises",
    img: "/redesign/tsti-t2.jpg",
    intro: "I am deeply grateful to God that I encountered Pastor Emmanuel Emodiae early in life. His life, teachings, and ministry have been a tremendous blessing to me.",
    full: [
      "I met Pastor Emmanuel Emodiae when I was a teenager, and one of the greatest things he instilled in me was confidence. I was very shy and afraid of facing crowds, but he intentionally placed me in roles that helped me overcome that fear. As a teenage church usher, he encouraged me to smile while serving and to carry out my responsibilities with confidence. Those moments played a significant role in shaping the person I have become.",
      "Pastor Emmanuel Emodiae's counsel and instruction greatly strengthened my spiritual life. His consistent teaching of God's Word established my faith and made it steadfast.",
      "He was also my relationship counselor. I always felt free to discuss every relationship I was in and every suitor who came my way. His wisdom and godly guidance helped me make sound decisions.",
      "Pastor Emmanuel Emodiae has been a tremendous blessing to my life, especially in helping me understand God's Word and the finished work of Christ. His teachings on the Gospel are simple, practical, and easy to understand, without any ambiguity.",
      "I remember my final year in school when I was deeply concerned that I would not graduate with my classmates because I was working and studying at the same time. I called him, and he assured me that God was with me. He confidently told me that I would graduate with my classmates and that, when it was time for the National Youth Service, I would also serve with them. Everything happened exactly as he had said.",
      "One remarkable thing about Pastor Emmanuel Emodiae is the peace and confidence he has in God's Word. Regardless of how difficult a situation may appear, he remains certain that it will end well and that all things will work together for good. That unwavering faith has inspired me on many occasions.",
      "I am deeply grateful to God that I encountered him early in life. His life, teachings, and ministry have been, and continue to be, a tremendous blessing to me.",
    ],
  },
  {
    id: "t3",
    name: "Victor M.",
    role: "Kaduna, Nigeria",
    title: "Healed, Restored, and Established by God's Grace",
    img: "/redesign/tsti-t3.jpg",
    intro: "When hope seemed lost, God's Word through Pastor Emmanuel Emodiae became the turning point that ushered me into restoration, healing, and enduring testimonies of His faithfulness.",
    full: [
      "I have countless reasons to thank God for the impact of His servant, Pastor Emmanuel Emodiae, and his ministry on my life and family.",
      "I had the privilege of meeting Pastor Emmanuel as a teenager, and his influence has been instrumental in keeping me grounded in the ways of God. Through the different seasons of my life, especially the difficult ones, he has always been there with prayers, encouragement, and godly counsel.",
      "One experience that stands out was in 2017. I was at one of the lowest points in my life financially and professionally while also dealing with my father's ill health. I had returned to Kaduna to stay with my parents and was desperately searching for a means of livelihood. During one of Pastor Emmanuel's visits to Kaduna, we took a walk together. As we talked, he spoke God's Word into my life and prayed for me. Those words lifted my spirit and rekindled my hope. Today, I can boldly say that the prophecies and prayers from that day are evident in my life. God has blessed me with a wonderful family, landed properties, cars, and financial stability.",
      "Another remarkable encounter happened in 2024 during one of Pastor Emmanuel's online prayer sessions. He shared a word of wisdom with me and gave me a specific instruction from the Lord concerning my health. Before then, I had experienced a troubling dream in which it seemed my life was under spiritual attack. When I shared the dream with him, he prayed fervently and strengthened my faith with God's Word. A few weeks later, I went through a serious health challenge during which I struggled to breathe for several days. Although medical examinations could not identify the cause, I held firmly to the instruction God had given me through His servant and stood on His Word. By God's grace, I came through that season, and my health was completely restored.",
      "I thank God for blessing me with a mentor who genuinely loves God and sincerely cares for me. I believe God has placed Pastor Emmanuel Emodiae as a watchman over my life, and I do not take that privilege for granted.",
      "To God alone be all the glory.",
    ],
  },
  {
    id: "t8",
    name: "Janet C. I.",
    role: "",
    title: "Rest On Every Side Through God's Faithfulness",
    img: "/redesign/tsti-t8.jpg",
    intro: "God turned my season of being single into a testimony of a blessed marriage, wonderful children, and a family sustained through prayer and godly wisdom.",
    full: [
      "I met Pastor Emmanuel Emodiae when he came to Jalingo, Taraba State, for his National Youth Service Corps (NYSC). Since then, my life has never been the same. It has truly been a journey from one level of glory to another.",
      "His teaching of God's Word has given me a deeper understanding of Scripture and taught me how to put the Word into practice. My mind has been renewed, my character transformed, and my prayer life greatly revived through the regular prayer meetings. I give God all the glory for this spiritual growth.",
      "When I met Pastor Emmanuel, I was single. Through his prayers, guidance, and godly counsel, God settled me in marriage and blessed my home with two wonderful children. Even when I faced challenges in my family, his prayers and words of wisdom helped me overcome them.",
      "During difficult seasons, Pastor Emmanuel has always been available. He stood with me in prayer and made prophetic declarations during health emergencies involving my children and me. Through God's power working through His servant, my family has experienced victory over sickness, disease, and the fear of death.",
      "God also used him to impact my career. Through his prayers and encouragement, I completed my tertiary education, which led to my promotion at work. Whenever I encountered challenges in my workplace, he prayed with me until every obstacle was removed.",
      "Today, I can confidently say that Pastor Emmanuel Emodiae is God's servant to my family and me. Both my immediate and extended family have benefited from the grace upon his life. I thank God that our paths crossed. God has given me rest on every side, and I return all the glory to Him alone.",
    ],
  },
  {
    id: "t4",
    name: "Esan B. K.",
    role: "Mentee",
    title: "A Life Transformed Through Fulfilled Prophecies",
    img: "/redesign/tsti-t4.jpg",
    intro: "What began as a teenage encounter became a lifelong journey of divine guidance, miraculous healing, fulfilled prophecies, and undeniable testimonies of God's faithfulness.",
    full: [
      "I give God all the glory for bringing Pastor Emmanuel Emodiae into my life. I first met him as a teenager, and from that moment, God has used him mightily as a vessel of blessing, guidance, and transformation in my life and family.",
      "The grace and gift of God upon his life have been evident on countless occasions. Many times, God has revealed things to him through words of knowledge with remarkable accuracy. There have been instances when, even before an ailment manifested, God revealed it to him, prompting him to pray concerning it. On several occasions, while I was experiencing pain or illness, he would call me unexpectedly and tell me exactly what I was going through. He would then pray, and God would bring instant healing. These experiences have continually strengthened my faith in God's power and love.",
      "God has also used Pastor Emmanuel to provide direction and clarity at critical moments in my life. Through his counsel, prayers, and spiritual guidance, I have received divine direction regarding several important decisions.",
      "One area where God has particularly used his ministry to impact my life is in my finances. Several years ago, while I was searching for a good job, I sought his prayers and blessing. He instructed me to write down the monthly salary I desired. At the time, the figure I wrote seemed impossibly high, and I was tempted to lower it. However, I chose to stand in faith and left it unchanged. To the glory of God, before long, I began earning twice the amount I had written down. Through God's grace and the ministry of His servant, my financial story was transformed.",
      "I can boldly testify that every prophecy specifically spoken into my life through God's servant has come to pass. Over the years, Pastor Emmanuel has become more than a pastor to me; he has been a mentor, a spiritual father, and a consistent source of encouragement and wisdom.",
      "Today, I give all the glory, honor, and praise to God for His faithfulness and for using Pastor Emmanuel Emodiae as a blessing in my life and family. May God's name alone be exalted.",
    ],
  },
  {
    id: "t5",
    name: "Chinenye O.",
    role: "Testimony of Healing",
    title: "Healing From Constant Severe Stomach Pains",
    img: "/redesign/tsti-t5.jpg",
    intro: "The pain I had silently endured for months vanished after Pastor Emmanuel prayed for me, leaving me with an undeniable testimony of God's healing power.",
    full: [
      "For almost two months, I suffered from severe stomach pains almost every day.",
      "I had become so accustomed to the pain that I didn't bother mentioning it to anyone. I simply endured it quietly until the night Pastor Emmanuel called and asked if I had been experiencing stomach pains. He then prayed for me.",
      "From that very night he prayed for me until this moment, I have not felt a single pain.",
      "I thought the pain might return when my menstrual cycle came because I had become used to experiencing intense pain during that time. However, when my period came at the end of last month, I still felt no pain. That was when I realized God had not just healed me for a night, He had healed me completely.",
      "I cannot thank God enough for connecting me to Pastor Emmanuel Emodiae, and I cannot thank him enough for his constant love, prayers, and care.",
      "Thank you so much, Pastor Emma. I am truly grateful, sir.",
    ],
  },
  {
    id: "t6",
    name: "Hayatu U. O.",
    role: "Ministry Member",
    title: "Spiritual Growth Through Sound Teaching and Mentorship",
    img: "/redesign/tsti-t6.jpg",
    intro: "The consistent teaching of God's Word and faithful mentorship have transformed my spiritual life, giving me strength, stability, and continual growth in my walk with God.",
    full: [
      "I have been part of this ministry for some time now, and it has greatly helped me maintain a vibrant spiritual life. Through the consistent teaching of the Word, regular prayer meetings, and godly mentorship, I have experienced tremendous growth and strength in my walk with God.",
      "I am truly grateful to the Lord for connecting me to this ministry and to His servant, Pastor Emmanuel I. Emodiae. His guidance, counsel, and unwavering commitment to God's Word have been a tremendous blessing to my life.",
    ],
  },
  {
    id: "t7",
    name: "Kelechi A.",
    role: "Change of Level",
    title: "Divine Turnaround Through Faith and Obedience",
    img: "/redesign/tsti-t7.jpg",
    intro: "What began as a season of uncertainty became a year of extraordinary turnaround as obedience to God's instructions opened doors of favour, breakthrough, and lasting transformation.",
    full: [
      "I want to thank God for His mighty hand upon my life, made manifest through His servant, Pastor Emmanuel Emodiae.",
      "I went through a very low and uncertain season in my life. It felt like a wilderness season, where nothing significant seemed to be happening. Despite putting in so much effort, I had little or nothing to show for it. I found myself asking questions such as, \"What happened to all the prophecies spoken over my life? What happened to all the blessings I received in church every week? Had they suddenly passed me by?\"",
      "Then an instruction came through God's servant for me to relocate from my current city to a metropolitan city where the cost of living was almost ten times higher. I was deeply concerned because I had no solid plan for how I would survive, where I would live, or how I would manage the many uncertainties ahead. Nevertheless, I chose to obey and moved in faith.",
      "Shortly afterward, another instruction came to participate in a five-day fast titled \"Change of Level.\" I obeyed wholeheartedly. Within the space of one year, I experienced a remarkable turnaround, with multiple doors of favour and breakthrough opening in my life and career.",
      "Jehovah Overdo visited me with blessings that money can buy and blessings that money cannot buy. By God's grace, I rented a decent home, secured a choice job, acquired my dream car, and witnessed many other remarkable wonders that the Lord brought to pass through the word of His servant.",
      "Hallelujah!",
    ],
  },
];

const STORY: { kind: "p" | "word" | "title"; text: string }[] = [
  { kind: "p", text: "I was saved in 1996, and the following year I was filled with the Holy Spirit with the evidence of speaking in tongues. I did not know then how far that beginning would carry me, only that I had been found by God and would never again belong to myself." },
  { kind: "p", text: "On the 23rd of July, 2002, in a place of prayer, God said to me:" },
  { kind: "word", text: "Just as Abraham delivered Lot, Moses the children of Israel, and Daniel did the same, I am raising friends in this generation and the next generation who will deliver my people from mediocrity, poverty, and shame, and you are one of them." },
  { kind: "p", text: "I was young, and the words were larger than my life. I wrote them down and carried them the way you carry a promise you cannot yet explain." },
  { kind: "p", text: "Two years later, on the 19th of November, 2004, I was talking with God. I had just listened to a message by a beloved brother titled The Six-Day Creation Package, in which he revealed how each person's assignment is connected to a day of creation. I did not know mine, so I asked the Lord which day my assignment was tied to, and I heard, God said." },
  { kind: "p", text: "God said? I asked. And the Lord answered:" },
  { kind: "word", text: "Know what I am saying, and say it unto them." },
  { kind: "p", text: "I still did not understand, and He did not leave me there. He opened my understanding with these words:" },
  { kind: "word", text: "Your assignment has nothing to do with any day, but with the Word that created every day. And as you keep speaking what I tell you over their lives, I will keep creating new things for them, as I did in the beginning." },
  { kind: "p", text: "On the 4th of January, 2006, the Upper Room Business was launched, a prayer room ordained to guard and birth the vision so that what God had promised would not suffer a spiritual miscarriage. In that room we saw miracles, signs and wonders, and the manifestation of spiritual gifts." },
  { kind: "p", text: "And yet, in the middle of all of it, I was hungry for an understanding. I sensed there was more to everything I knew, a certainty I had not yet laid hold of." },
  { kind: "p", text: "On the 22nd of November, 2010, the answer came. God opened my eyes to see a vision of the beginning, and there I saw it: the first word man ever heard was the blessing. Before man had done anything, before there was any striving to earn or any shame to hide, God had already spoken a blessing over him." },
  { kind: "p", text: "That was the understanding and certainty I had been searching for. It was revealed to me that the core of my message, the thing my whole life had been reaching toward, was to preach Christ, the Blessing." },
  { kind: "p", text: "For Christ is called the Blessing because every blessing God has for man is wrapped up in Him. He is the fullness of God's blessing to man, and everything the Father ever intended to give is found in the Son." },
  { kind: "p", text: "In July of 2014, I was ordained into the ministry. In April of 2016, House of Joy Church Worldwide opened its doors for its first service. What God had whispered in a prayer room in 2002 had, over fourteen years, become a house where people could come and hear it for themselves." },
  { kind: "p", text: "And the house was never meant to hold it. Out of that same word came GIMA, the Gospel Invasion Mandate, carrying one mission: to spread the gospel of Christ across the nations of the earth. Its flagship campaign went out from Kaduna on the 10th of November, 2017, and from that day it has moved from city to city, carrying the Blessing beyond our walls to whoever will hear." },
  { kind: "p", text: "I preach Christ, not only as a doctrine to be believed and as the way to blessings, but above all as the Blessing Himself to be received, until mediocrity, poverty, and shame lose their grip on every life that hears." },
  { kind: "p", text: "So welcome. Whatever brought you here, you did not arrive by accident. Everything on this site, the Messages, the Articles, the Poems, and the Daily Victory Confession, has been prepared to feed your spirit and take you from one level of glory to another. Explore it freely, return to it often, and let the Word that created every day begin to create something new in yours." },
];

const IDENTITY = [
  { href: "/dvc", step: "As A Prophet", title: "I See And I Say", body: "I receive what heaven is saying and place it in your mouth as a decree, so that what God has spoken over you becomes what you speak over yourself.", go: "Take the Daily Confession \u2192" },
  { href: "/messages", step: "As A Preacher", title: "I Teach And I Shepherd", body: "I preach Christ the Blessing, feeding God\u2019s people with the Word until faith rises and lives are changed from the inside out.", go: "Hear the messages \u2192" },
  { href: "/poems", step: "As A Poet", title: "I Give The Soul Words", body: "I write verses that carry the ache and the wonder of being human, and point them both back to the God who understands.", go: "Read the poems \u2192" },
];

const TIMELINE = [
  { year: "2006", title: "The Upper Room", date: "January 4, 2006", body: "A prayer meeting hosted by Emmanuel I. Emodiae, the seedbed of everything that followed, prior to the launch of House of Joy Church Worldwide." },
  { year: "2014", title: "Ordination", date: "July 14, 2014", body: "Set apart and ordained into the ministry of the gospel of Jesus Christ." },
  { year: "2016", title: "House of Joy Church Worldwide", date: "April 10, 2016", body: "HJCW launched services, a house with a mandate to preach Christ the Blessing." },
  { year: "2017", title: "Gospel Invasion Mandate", date: "November 10, 2017", body: "A mission to spread the gospel across the nations of the earth." },
  { year: "2021", title: "Daily Victory Confession", date: "September 1, 2021", body: "The DVC devotional launched, placing a daily decree of victory in the mouths of believers everywhere." },
];

const FAITH = [
  { h: "The Scriptures", p: "We believe the Bible is the inspired and infallible Word of God, given for doctrine, reproof, correction, and instruction in righteousness. It is our final authority in all things.", ref: "2 Timothy 3:16" },
  { h: "The Godhead", p: "We believe in one God, eternally existing as Father, Son, and Holy Spirit, the Maker of heaven and earth and of all things visible and invisible.", ref: "Matthew 28:19" },
  { h: "The Lord Jesus Christ", p: "We believe in the deity of the Lord Jesus Christ, His virgin birth, His sinless life, His atoning death, His bodily resurrection, and His soon return in glory.", ref: "John 1:1,14 \u00b7 1 Corinthians 15:3-4" },
  { h: "Salvation", p: "We believe salvation is by grace through faith in the finished work of Christ alone, not of works, and that whosoever calls upon the name of the Lord shall be saved.", ref: "Ephesians 2:8-9 \u00b7 Romans 10:13" },
  { h: "The Believer\u2019s Inheritance", p: "We believe every believer is blessed with all spiritual blessings in Christ, called out of mediocrity, poverty, and shame into a glorious inheritance in Him.", ref: "Ephesians 1:3,18 \u00b7 Galatians 3:13-14" },
  { h: "The Holy Spirit and the Church", p: "We believe in the person and power of the Holy Spirit at work in the believer, and in the church as the body of Christ, gathered to worship, grow, and carry the gospel to the world.", ref: "Acts 1:8 \u00b7 Ephesians 4:11-13" },
];

const GALLERY = [
  { src: "/redesign/gallery-1.jpg", alt: "Pastor Emmanuel Emodiae ministering the word" },
  { src: "/redesign/gallery-2.jpg", alt: "Pastor Emmanuel Emodiae preaching" },
  { src: "/redesign/gallery-3.jpg", alt: "Pastor Emmanuel Emodiae teaching with conviction" },
  { src: "/redesign/gallery-4.jpg", alt: "Pastor Emmanuel Emodiae ministering from the scriptures" },
  { src: "/redesign/gallery-5.jpg", alt: "Pastor Emmanuel Emodiae in worship" },
  { src: "/redesign/gallery-6.jpg", alt: "Pastor Emmanuel Emodiae addressing the congregation" },
  { src: "/redesign/gallery-7.jpg", alt: "Pastor Emmanuel Emodiae ministering" },
];

const WORD = [
  "Thank you for taking the time to know a little of my story. But the truth is, this page was never really about me. It is about the One who found me, and who is looking for you too.",
  "Whatever brought you here today, I want you to know that God is not finished with you. The circumstances around you do not have the final say over your life. Christ does. And in Him there is no mediocrity, no poverty, and no shame, only an inheritance waiting to be walked in.",
  "So let me pray for you. May the eyes of your understanding be opened. May you see what heaven says about you. And may everything you decree in faith be established, in Jesus\u2019 name.",
];


/* The site-wide globals.css sets html/body { font-size: 1.25rem } (20px base),
   which inflates every rem-based size on this page ~25% versus the redesign,
   which assumes a 16px root. Reset the root to 16px only while the About page
   is mounted (a class is toggled on <html>) so legacy pages are unaffected. */
const AboutBase = createGlobalStyle`
  html.about-redesign-root {
    font-size: 16px;
  }
`;

const Wrap = styled.div`
  display: block;

  /* ===== base tokens — alias redesign names to site --ee-* standards ===== */
  --gold: var(--ee-gold, #c9a24b);
  --gold-bright: var(--ee-gold-soft, #e4c169);
  --gold-soft: var(--ee-gold-rich, #b8923f);
  --cream: var(--ee-bg-deep, #f5f0e6);
  --ivory: var(--ee-bg, #faf6ee);
  --coffee: var(--ee-ink-soft, #4a3b2a);
  --chocolate: var(--ee-inverse, #2c2013);
  --line: var(--ee-line, rgba(201, 162, 75, 0.22));
  --line-soft: var(--ee-line-soft, rgba(201, 162, 75, 0.12));
  --text-on-dark: var(--ee-text-on-dark, #efe7d6);
  --muted-on-dark: var(--ee-muted-on-dark, #b8ad97);
  --text-on-light: var(--ee-ink, #2c2013);
  --muted-on-light: var(--ee-muted, #6b5a44);
  --charcoal: #141118;
  --navy: #211a33;
  --ink: var(--ee-ink, #0e0e0e);
  --btn-dark-bg: var(--ee-inverse, #2c2013);
  --btn-dark-fg: var(--ee-on-inverse, #f5f0e6);
  --shadow-lg: var(--ee-shadow, 0 30px 80px -30px rgba(0, 0, 0, 0.6));
  --shadow-md: 0 18px 44px -20px rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 8px 22px -12px rgba(22, 11, 20, 0.46);
  --radius: 18px;
  --radius-sm: 12px;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);

  font-family: "Crimson Pro", "EB Garamond", Georgia, serif;
  background: var(--ivory);
  color: var(--text-on-light);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;

  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }

  .el-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  h1, h2, h3 {
    font-family: "Cinzel", serif;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.15;
  }
  .el-eyebrow {
    font-family: "Cinzel", serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--gold-soft);
  }

  /* ===== buttons ===== */
  .el-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-family: "Cinzel", serif;
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.95rem 1.8rem;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease),
      background 0.35s var(--ease), color 0.35s var(--ease);
    white-space: nowrap;
  }
  .el-btn:focus-visible { outline: 2px solid var(--gold-bright); outline-offset: 3px; }
  .el-btn--ghost { background: transparent; border-color: var(--line); color: var(--gold-bright); }
  .el-btn--ghost:hover { background: rgba(201, 162, 75, 0.1); transform: translateY(-3px); }
  .el-btn--dark { background: var(--btn-dark-bg); color: var(--btn-dark-fg); }
  .el-btn--dark:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

  /* ===== hero ===== */
  .el-hero {
    position: relative;
    background: #080606;
    color: var(--text-on-dark);
    overflow: hidden;
    min-height: calc(100vh - 74px);
    display: flex;
    align-items: center;
  }
  .el-hero__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image: linear-gradient(180deg, rgba(8, 6, 6, 0.35), rgba(8, 6, 6, 0.35));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .el-hero__scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(115deg, rgba(8, 6, 6, 0.92) 0%, rgba(8, 6, 6, 0.72) 34%, rgba(8, 6, 6, 0.3) 62%, rgba(8, 6, 6, 0.12) 100%);
  }
  .el-hero__grain { position: absolute; inset: 0; z-index: 2; opacity: 0.5; pointer-events: none; }
  .el-hero__inner { position: relative; z-index: 3; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .el-hero__eyebrow { color: var(--gold-bright); }
  .el-hero__title {
    font-family: "Cinzel", serif;
    font-size: clamp(2.6rem, 6vw, 4.6rem);
    color: var(--text-on-dark);
    margin: 1.1rem 0 1.4rem;
    line-height: 1.08;
  }
  .el-hero__lead {
    font-family: "Cormorant Garamond", serif;
    font-size: clamp(1.15rem, 2.3vw, 1.5rem);
    color: var(--text-on-dark);
    max-width: 52ch;
    line-height: 1.5;
  }
  .el-hero__tagline {
    margin-top: 1.6rem;
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-size: 1.3rem;
    color: var(--gold-bright);
  }
  .el-hero__scroll {
    position: absolute;
    left: 50%;
    bottom: 26px;
    transform: translateX(-50%);
    z-index: 4;
    font-family: "Cinzel", serif;
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--muted-on-dark);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }
  .el-hero__scroll span {
    width: 1px;
    height: 42px;
    background: linear-gradient(var(--gold), transparent);
  }

  /* ===== about hero variant ===== */
  .el-abhero {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 48px;
    display: grid;
    align-items: center;
  }
  .el-abhero__media { justify-self: center; }
  .el-abhero__frame {
    width: min(400px, 78vw);
    aspect-ratio: 4 / 5;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--line);
    box-shadow: var(--shadow-lg);
  }
  .el-abhero__frame img { width: 100%; height: 100%; object-fit: cover; }

  /* ===== section shell ===== */
  .el-section { padding: 96px 0; }
  .el-section--light { background: var(--ivory); }
  .el-section--cream { background: var(--cream); }
  .el-section--dark {
    background: radial-gradient(120% 80% at 20% 0%, rgba(201, 162, 75, 0.12), transparent 50%),
      linear-gradient(160deg, var(--charcoal), var(--navy));
    color: var(--text-on-dark);
  }
  .el-head { text-align: center; max-width: 640px; margin: 0 auto 58px; }
  .el-head .el-eyebrow { display: block; margin-bottom: 1rem; }
  .el-head h2 { font-size: clamp(2rem, 4.4vw, 2.9rem); color: inherit; margin-bottom: 1rem; }
  .el-section--dark .el-head h2 { color: var(--text-on-dark); }
  .el-head p { font-family: "Cormorant Garamond", serif; font-size: 1.25rem; color: var(--muted-on-light); }
  .el-section--dark .el-head p { color: var(--muted-on-dark); }
  .el-rule { width: 64px; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); margin: 1.2rem auto 0; }

  /* reveal */
  .el-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s var(--ease), transform 0.8s var(--ease); }
  .el-reveal.is-in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .el-reveal { opacity: 1; transform: none; transition: none; } }

  /* ===== story ===== */
  .el-story__body { max-width: 720px; margin: 0 auto; }
  .el-story__body p { font-size: 1.18rem; color: var(--text-on-light); margin-bottom: 1.4rem; line-height: 1.75; }
  .el-story__body p:first-of-type::first-letter {
    font-family: "Cinzel", serif;
    font-size: 3.4em;
    float: left;
    line-height: 0.85;
    padding-right: 0.12em;
    color: var(--gold-soft);
  }
  .el-story__title {
    font-family: "Cinzel", serif;
    font-size: clamp(1.3rem, 3vw, 1.9rem);
    color: var(--coffee);
    margin: 0 0 1.4rem;
    line-height: 1.25;
    letter-spacing: 0.01em;
  }
  .el-story__word {
    margin: 1.6rem 0;
    padding: 1rem 0 1rem 1.4rem;
    border-left: 3px solid var(--gold);
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-size: 1.28rem;
    line-height: 1.55;
    color: var(--coffee);
  }
  .el-story__listen {
    display: flex;
    justify-content: center;
    margin: 0 0 1.8rem;
  }
  .el-story__listen .ea-listen {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-family: "Cinzel", serif;
    font-weight: 600;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.85rem 1.65rem;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid var(--line);
    background: var(--btn-dark-bg);
    color: var(--btn-dark-fg);
    transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease),
      background 0.35s var(--ease);
  }
  .el-story__listen .ea-listen:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  .el-story__listen .ea-listen:focus-visible {
    outline: 2px solid var(--gold-bright);
    outline-offset: 3px;
  }
  .el-story__listen .ea-listen[aria-pressed="true"] {
    background: linear-gradient(135deg, var(--gold-soft), var(--gold));
    color: var(--ee-ink, #241a08);
    border-color: transparent;
  }

  /* ===== creed / mandate ===== */
  .el-creed__inner { max-width: 860px; margin: 0 auto; text-align: center; }
  .el-creed__text {
    font-family: "Cormorant Garamond", serif;
    font-size: clamp(1.7rem, 4.4vw, 2.7rem);
    line-height: 1.4;
    color: var(--text-on-dark);
    margin-top: 1.2rem;
  }
  .el-creed__text strong { color: var(--gold-bright); font-weight: 600; letter-spacing: 0.04em; }
  .el-creed__text em { color: var(--gold-soft); }

  /* ===== mission ===== */
  .el-mission { max-width: 760px; margin: 0 auto; text-align: center; }
  .el-mission__text {
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-size: clamp(1.4rem, 3.4vw, 2rem);
    color: var(--coffee);
    line-height: 1.5;
    margin-top: 1.2rem;
  }

  /* ===== identity / wayfinding cards ===== */
  .el-start { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .el-start__card {
    display: block;
    background: linear-gradient(160deg, rgba(201, 162, 75, 0.1), rgba(20, 17, 24, 0.35));
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 2rem 1.8rem;
    transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
    position: relative;
    overflow: hidden;
  }
  .el-start__card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
  .el-start__step { font-family: "Cinzel", serif; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-soft); }
  .el-start__card h3 { font-family: "Cinzel", serif; font-size: 1.15rem; color: var(--gold-bright); margin: 0.5rem 0 0.6rem; }
  .el-start__card p { font-size: 1rem; color: var(--muted-on-dark); }
  .el-start__go {
    margin-top: 1rem;
    font-family: "Cinzel", serif;
    font-size: 0.64rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold-soft);
    display: inline-flex;
    gap: 0.4rem;
    transition: gap 0.3s var(--ease);
  }
  .el-start__card:hover .el-start__go { gap: 0.7rem; color: var(--gold-bright); }

  /* ===== timeline ===== */
  .el-tl { max-width: 820px; margin: 0 auto; position: relative; }
  .el-tl::before {
    content: "";
    position: absolute;
    left: 92px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: linear-gradient(var(--line), var(--gold), var(--line));
  }
  .el-tl__item { display: grid; grid-template-columns: 70px 44px 1fr; align-items: start; margin-bottom: 2.2rem; }
  .el-tl__year { font-family: "Cinzel", serif; font-weight: 700; font-size: 1.15rem; color: var(--gold-soft); text-align: right; padding-top: 0.2rem; }
  .el-tl__dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold-bright), var(--gold-soft));
    border: 3px solid var(--ivory);
    box-shadow: 0 0 0 1px var(--line);
    justify-self: center;
    margin-top: 0.35rem;
  }
  .el-tl__card { background: var(--ivory); border: 1px solid var(--line-soft); border-radius: var(--radius-sm); padding: 1.4rem 1.6rem; box-shadow: 0 10px 26px -18px rgba(0, 0, 0, 0.35); }
  .el-tl__card h3 { font-size: 1.05rem; color: var(--coffee); margin-bottom: 0.25rem; }
  .el-tl__date { font-family: "Cinzel", serif; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-soft); margin-bottom: 0.6rem; }
  .el-tl__card p { color: var(--muted-on-light); font-size: 1.02rem; }

  /* ===== faith ===== */
  .el-faith { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 960px; margin: 0 auto; }
  .el-faith__item { background: var(--ivory); border: 1px solid var(--line-soft); border-radius: var(--radius); padding: 1.8rem 1.7rem; }
  .el-faith__item h3 { font-size: 0.98rem; color: var(--coffee); margin-bottom: 0.6rem; letter-spacing: 0.06em; }
  .el-faith__item p { color: var(--muted-on-light); font-size: 1.02rem; }
  .el-faith__ref { display: block; font-family: "Cinzel", serif; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-soft); margin-top: 0.7rem; }

  /* ===== photos / gallery ===== */
  .el-photos { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
  .el-photos__frame { aspect-ratio: 4 / 5; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--line-soft); box-shadow: var(--shadow-md); }
  .el-photos__frame img { width: 100%; height: 100%; object-fit: cover; }

  /* ===== word ===== */
  .el-word__inner { max-width: 680px; margin: 0 auto; text-align: center; }
  .el-word__body { margin-top: 1.6rem; }
  .el-word__body p { font-family: "Cormorant Garamond", serif; font-size: 1.3rem; color: var(--text-on-dark); line-height: 1.65; margin-bottom: 1.3rem; }
  .el-word__sig { font-style: italic; font-size: 1.6rem; color: var(--gold-bright); margin-top: 0.6rem; }

  /* ===== cta band ===== */
  .el-cta-band { background: linear-gradient(135deg, var(--gold-bright), var(--gold) 50%, var(--gold-soft)); color: #241a08; text-align: center; }
  .el-cta-band__inner { padding: 70px 24px; }
  .el-cta-band h2 { font-size: clamp(1.9rem, 4vw, 2.7rem); color: #241a08; margin-bottom: 1rem; }
  .el-cta-band p { font-family: "Cormorant Garamond", serif; font-size: 1.3rem; color: #3a2c10; margin-bottom: 2rem; max-width: 44ch; margin-left: auto; margin-right: auto; }
  .el-cta-band__cta { display: flex; flex-wrap: wrap; gap: 0.9rem; justify-content: center; }

  /* ===== testimony carousel ===== */
  .tsti-wrap { max-width: 1180px; margin: 0 auto; position: relative; }
  .tsti-viewport { overflow: hidden; }
  .tsti-track {
    display: flex;
    gap: 26px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    padding: 6px 4px 10px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .tsti-track::-webkit-scrollbar { display: none; }
  .tsti-card {
    flex: 0 0 calc((100% - 2 * 26px) / 3);
    scroll-snap-align: start;
    box-sizing: border-box;
    background: var(--ivory);
    border: 1px solid var(--line-soft);
    border-radius: var(--radius);
    padding: 2rem 1.8rem;
    display: flex;
    flex-direction: column;
  }
  .tsti-card__top { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1rem; }
  .tsti-card__avatar { width: 54px; height: 54px; border-radius: 50%; overflow: hidden; flex: 0 0 auto; border: 2px solid var(--gold-soft); box-shadow: var(--shadow-sm); }
  .tsti-card__avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tsti-card__name { font-family: "Cinzel", serif; font-size: 0.9rem; color: var(--coffee); letter-spacing: 0.03em; }
  .tsti-card__stars { color: var(--gold); letter-spacing: 0.2em; font-size: 0.9rem; margin-bottom: 0.7rem; }
  .tsti-card__intro { font-family: "Cormorant Garamond", serif; font-size: 1.18rem; font-style: italic; color: var(--coffee); line-height: 1.5; flex: 1; margin: 0 0 1.3rem; }
  .tsti-card__more {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Cinzel", serif;
    font-size: 0.66rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--coffee);
    background: transparent;
    border: 1px solid var(--line-soft);
    border-radius: 999px;
    padding: 0.62rem 1.1rem;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s, color 0.3s;
  }
  .tsti-card__more:hover { background: linear-gradient(135deg, var(--gold), var(--gold-soft)); border-color: transparent; color: #fff; }
  .tsti-card__more svg { transition: transform 0.3s; }
  .tsti-card__more:hover svg { transform: translateX(3px); }
  .tsti-controls { display: flex; align-items: center; justify-content: center; gap: 1.1rem; margin-top: 1.8rem; }
  .tsti-arrow {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: var(--ivory);
    border: 1px solid var(--line-soft);
    color: var(--coffee);
    transition: background 0.3s, border-color 0.3s, color 0.3s, transform 0.3s, opacity 0.3s;
  }
  .tsti-arrow:hover { background: linear-gradient(135deg, var(--gold), var(--gold-soft)); border-color: transparent; color: #fff; }
  .tsti-arrow:active { transform: scale(0.94); }
  .tsti-arrow[disabled] { opacity: 0.32; cursor: default; pointer-events: none; }
  .tsti-arrow svg { width: 20px; height: 20px; }
  .tsti-nav { display: flex; gap: 0.55rem; align-items: center; }
  .tsti-dot { width: 9px; height: 9px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; background: var(--line-soft); transition: transform 0.3s, background 0.3s; }
  .tsti-dot.is-on { background: linear-gradient(135deg, var(--gold), var(--gold-soft)); transform: scale(1.35); }
  .tsti-hint { text-align: center; margin-top: 0.7rem; font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 0.95rem; color: var(--muted-on-light); opacity: 0.85; }

  /* ===== testimony modal ===== */
  .tsti-modal { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; }
  .tsti-modal__veil { position: absolute; inset: 0; background: rgba(28, 22, 18, 0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: tstiFade 0.35s ease; }
  .tsti-modal__panel {
    position: relative;
    z-index: 1;
    width: min(720px, 100%);
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    background: #fffdf8;
    border: 1px solid var(--line-soft);
    border-radius: calc(var(--radius) + 4px);
    box-shadow: 0 40px 90px -30px rgba(28, 22, 18, 0.5);
    overflow: hidden;
    animation: tstiPop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .tsti-modal__close {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid var(--line-soft);
    color: var(--coffee);
    transition: background 0.25s, transform 0.25s;
  }
  .tsti-modal__close:hover { background: #fff; transform: rotate(90deg); }
  .tsti-modal__scroll { overflow-y: auto; padding: clamp(2rem, 5vw, 3.2rem); -webkit-overflow-scrolling: touch; }
  .tsti-modal__head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .tsti-modal__avatar { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; flex: 0 0 auto; border: 2px solid var(--gold-soft); box-shadow: var(--shadow-sm); }
  .tsti-modal__avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tsti-modal__name { font-family: "Cinzel", serif; font-size: 1.05rem; color: var(--coffee); letter-spacing: 0.03em; }
  .tsti-modal__role { font-size: 0.9rem; color: var(--muted-on-light); }
  .tsti-modal__stars { color: var(--gold); letter-spacing: 0.2em; font-size: 1rem; margin: 0.2rem 0 0.8rem; }
  .tsti-modal__title { font-family: "Cinzel", serif; font-size: clamp(1.15rem, 2.6vw, 1.6rem); color: var(--coffee); margin: 0 0 1.2rem; line-height: 1.3; }
  .tsti-modal__body p { font-family: "Cormorant Garamond", serif; font-size: 1.2rem; line-height: 1.7; color: var(--coffee); margin: 0 0 1.1rem; }
  .tsti-modal__sign { margin-top: 0.4rem; font-family: "Cinzel", serif; font-size: 0.82rem; letter-spacing: 0.06em; color: var(--muted-on-light); }
  @keyframes tstiFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tstiPop { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }

  /* ===== responsive ===== */
  @media (max-width: 980px) {
    .tsti-card { flex-basis: calc((100% - 26px) / 2 - 22px); }
  }
  @media (max-width: 920px) {
    .el-abhero { grid-template-columns: 1fr; gap: 32px; }
    .el-abhero__media { order: -1; }
  }
  @media (max-width: 860px) {
    .el-hero__bg { background-position: center 12%; }
    .el-hero__scrim { background: linear-gradient(180deg, rgba(8,6,6,.15) 0%, rgba(8,6,6,.35) 42%, rgba(8,6,6,.82) 66%, #080606 100%); }
    .el-hero__inner { padding: 48px 24px 64px; align-items: flex-end; }
    .el-hero__copy { max-width: none; padding-top: 44vh; text-align: center; }
    .el-hero__lead { margin-left: auto; margin-right: auto; }
    .el-hero__tagline { margin-top: 1.6rem; }
    .el-hero { padding-top: 0; }
    .el-hero .el-hero__copy { padding-top: 0; }
    .el-abhero { grid-template-columns: 1fr; gap: 32px; }
    .el-abhero__media { order: -1; }
  }
  @media (max-width: 820px) {
    .el-start { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; }
  }
  @media (max-width: 700px) {
    .el-faith { grid-template-columns: 1fr; }
    .el-photos { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .tsti-wrap { max-width: 100%; }
    .tsti-track { gap: 16px; padding: 6px 0 10px; }
    .tsti-card { flex-basis: 86%; }
    .tsti-card:last-child { margin-right: 14%; }
    .tsti-arrow { display: none; }
  }
  @media (max-width: 600px) {
    .el-tl { padding-left: 0; }
    .el-tl::before { left: 18px; }
    .el-tl__item { grid-template-columns: 36px 1fr; grid-template-areas: "dot card"; }
    .el-tl__year { display: none; }
    .el-tl__dot { grid-area: dot; justify-self: start; margin-left: 12px; }
    .el-tl__card { grid-area: card; }
  }
  @media (max-width: 480px) {
    .el-section { padding: 68px 0; }
  }
`;

const AboutPage: NextPage = () => {
  useReveal();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [modal, setModal] = useState<number | null>(null);

  // Insulate this page from the site-wide 20px root font-size (globals.css)
  // so the redesign's rem-based sizing matches the mockup's 16px base.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("about-redesign-root");
    return () => root.classList.remove("about-redesign-root");
  }, []);

  const stepWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const cards = track.children;
    if (cards.length > 1) {
      return (
        cards[1].getBoundingClientRect().left -
        cards[0].getBoundingClientRect().left
      );
    }
    return track.clientWidth;
  }, []);

  const syncNav = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const st = stepWidth();
    const idx = st > 0 ? Math.round(track.scrollLeft / st) : 0;
    setActive(idx);
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 2);
  }, [stepWidth]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let t: number | undefined;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(syncNav, 80);
    };
    const onResize = () => syncNav();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    syncNav();
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, [syncNav]);

  const scrollByStep = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * stepWidth(), behavior: "smooth" });
  };

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * stepWidth(), behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    if (modal !== null) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal]);

  const md = modal !== null ? TESTIMONIES[modal] : null;

  return (
    <>
      <AboutBase />
      <Wrap className="eemodiae-page">
      <Head>
        <title>About Emmanuel I. Emodiae | Prophet, Preacher, Poet</title>
        <meta
          name="description"
          content="Lead Pastor of House of Joy Church Worldwide. A prophet, preacher, and poet preaching Christ the Blessing, that every believer would see who they are in Christ and live in the fullness of it."
        />
        <meta property="og:title" content="About Emmanuel I. Emodiae" />
        <meta
          property="og:description"
          content="Preaching Christ...Changing Lives! The story, the mandate, and the mission behind the ministry."
        />
      </Head>

      <Nav />

      <section className="el-hero" id="top">
        <div className="el-hero__bg" aria-hidden="true" />
        <div className="el-hero__scrim" aria-hidden="true" />
        <div className="el-hero__grain" aria-hidden="true" />
        <div className="el-hero__inner el-abhero">
          <div className="el-hero__copy">
            <p className="el-eyebrow el-hero__eyebrow">About Emmanuel I. Emodiae</p>
            <h1 className="el-hero__title" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}>
              Preaching Christ...
              <br />
              Changing Lives!
            </h1>
            <p className="el-hero__lead">
              Lead Pastor of House of Joy Church Worldwide. A prophet, preacher,
              and poet with one consuming burden: that every believer would see
              who they are in Christ and live in the fullness of it.
            </p>
            <p className="el-hero__tagline" style={{ whiteSpace: "normal" }}>
              <a href="#story" style={{ borderBottom: "1px solid rgba(201,162,75,.22)" }}>
                Read the story below
              </a>
            </p>
          </div>
          <div className="el-abhero__media">
            <div className="el-abhero__frame">
              <img src="/redesign/about-portrait.jpg" alt="Pastor Emmanuel I. Emodiae" />
            </div>
          </div>
        </div>
        <div className="el-hero__scroll" aria-hidden="true">
          Scroll<span />
        </div>
      </section>

      <main id="main">
        {/* STORY */}
        <section className="el-section el-section--light" id="story">
          <div className="el-wrap el-story">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">My Journey</span>
              <h2>The Story</h2>
              <div className="el-rule" />
            </div>
            <div className="el-story__listen el-reveal">
              <ListenButton track={ABOUT_STORY_AUDIO} />
            </div>
            <div className="el-story__body el-reveal">
              {STORY.map((s, i) =>
                s.kind === "title" ? (
                  <p className="el-story__title" key={i}>
                    {s.text}
                  </p>
                ) : s.kind === "word" ? (
                  <blockquote className="el-story__word" key={i}>
                    {s.text}
                  </blockquote>
                ) : (
                  <p key={i}>{s.text}</p>
                )
              )}
            </div>
          </div>
        </section>

        {/* MANDATE */}
        <section className="el-section el-section--dark el-creed">
          <div className="el-wrap el-creed__inner el-reveal">
            <span className="el-eyebrow">The Mandate</span>
            <p className="el-creed__text">
              Preaching Christ <strong>THE BLESSING</strong> to deliver God&apos;s
              people from <em>mediocrity, poverty, and shame.</em>
            </p>
          </div>
        </section>

        {/* MISSION */}
        <section className="el-section el-section--cream">
          <div className="el-wrap el-mission el-reveal">
            <span className="el-eyebrow">The Mission</span>
            <p className="el-mission__text">
              To preach the unsearchable riches of Christ and make all men see
              their glorious riches in Him.
            </p>
          </div>
        </section>

        {/* IDENTITY */}
        <section className="el-section el-section--dark">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">Prophet &middot; Preacher &middot; Poet</span>
              <div className="el-rule" />
            </div>
            <div className="el-start">
              {IDENTITY.map((c) => (
                <Link href={c.href} className="el-start__card el-reveal" key={c.step}>
                  <span className="el-start__step">{c.step}</span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                  <span className="el-start__go">{c.go}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* MILESTONES */}
        <section className="el-section el-section--light">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">Milestones In Ministry</span>
              <h2>The Road So Far</h2>
              <div className="el-rule" />
            </div>
            <div className="el-tl">
              {TIMELINE.map((t) => (
                <div className="el-tl__item el-reveal" key={t.year}>
                  <div className="el-tl__year">{t.year}</div>
                  <div className="el-tl__dot" />
                  <div className="el-tl__card">
                    <h3>{t.title}</h3>
                    <p className="el-tl__date">{t.date}</p>
                    <p>{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIES */}
        <section className="el-section el-section--cream">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">Fruit That Remains</span>
              <h2>Testimonies</h2>
              <div className="el-rule" />
            </div>
            <div className="tsti-wrap el-reveal">
              <div className="tsti-viewport">
                <div className="tsti-track" ref={trackRef}>
                  {TESTIMONIES.map((t, i) => (
                    <article className="tsti-card" key={t.id}>
                      <div className="tsti-card__top">
                        <div className="tsti-card__avatar">
                          <img src={t.img} alt={t.name} loading="lazy" />
                        </div>
                        <div className="tsti-card__id">
                          <div className="tsti-card__name">{t.name}</div>
                        </div>
                      </div>
                      <div className="tsti-card__stars" aria-label="Five stars">
                        &#9733;&#9733;&#9733;&#9733;&#9733;
                      </div>
                      <p className="tsti-card__intro">{t.intro}</p>
                      <button
                        type="button"
                        className="tsti-card__more"
                        onClick={() => setModal(i)}
                      >
                        Read full testimony
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    </article>
                  ))}
                </div>
              </div>
              <div className="tsti-controls">
                <button
                  type="button"
                  className="tsti-arrow"
                  aria-label="Previous testimony"
                  disabled={atStart}
                  onClick={() => scrollByStep(-1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="tsti-nav" role="tablist" aria-label="Testimony position">
                  {TESTIMONIES.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`tsti-dot${i === active ? " is-on" : ""}`}
                      aria-label={`Go to testimony ${i + 1}`}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="tsti-arrow"
                  aria-label="Next testimony"
                  disabled={atEnd}
                  onClick={() => scrollByStep(1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
              <p className="tsti-hint">
                Swipe or use the arrows to read more testimonies
              </p>
            </div>
          </div>
        </section>

        {/* STATEMENT OF FAITH */}
        <section className="el-section el-section--cream">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">What We Hold</span>
              <h2>Statement of Faith</h2>
              <div className="el-rule" />
            </div>
            <div className="el-faith">
              {FAITH.map((f) => (
                <div className="el-faith__item el-reveal" key={f.h}>
                  <h3>{f.h}</h3>
                  <p>
                    {f.p} <span className="el-faith__ref">{f.ref}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="el-section el-section--light">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">Moments In Ministry</span>
              <h2>Gallery</h2>
              <div className="el-rule" />
            </div>
            <div className="el-photos">
              {GALLERY.map((g) => (
                <div className="el-photos__frame el-reveal" key={g.src}>
                  <img src={g.src} alt={g.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MENTORSHIP */}
        <section className="el-section el-section--light">
          <div className="el-wrap el-mission el-reveal" style={{ maxWidth: 640 }}>
            <span className="el-eyebrow">Walk Closer</span>
            <p className="el-mission__text">
              If you sense a call to grow under this grace, mentorship is open to
              you.
            </p>
            <div style={{ marginTop: "1.8rem" }}>
              <a
                href={`mailto:${SITE_CONTACT_EMAIL}?subject=Request%20for%20Mentorship`}
                className="el-btn el-btn--dark"
              >
                Request Mentorship
              </a>
            </div>
          </div>
        </section>

        {/* A WORD */}
        <section className="el-section el-section--dark el-word">
          <div className="el-wrap el-word__inner el-reveal">
            <span className="el-eyebrow">A Word From Emmanuel</span>
            <div className="el-word__body">
              {WORD.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className="el-word__sig">Emmanuel I. Emodiae</p>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="el-cta-band">
          <div className="el-cta-band__inner el-reveal">
            <h2>Walk With Me From Here</h2>
            <p>
              Invite me to minister in your city, or let the Word meet you every
              morning.
            </p>
            <div className="el-cta-band__cta">
              <Link href="/bookings" className="el-btn el-btn--dark">
                Invite Me To Minister
              </Link>
              <Link
                href="/dvc"
                className="el-btn el-btn--ghost"
                style={{ color: "#241a08", borderColor: "rgba(36,26,8,.35)" }}
              >
                Walk With Me Daily
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* TESTIMONY MODAL */}
      {md && (
        <div className="tsti-modal" role="dialog" aria-modal="true" aria-label={md.title}>
          <div className="tsti-modal__veil" onClick={() => setModal(null)} />
          <div className="tsti-modal__panel">
            <button
              type="button"
              className="tsti-modal__close"
              aria-label="Close"
              onClick={() => setModal(null)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="tsti-modal__scroll">
              <div className="tsti-modal__head">
                <div className="tsti-modal__avatar">
                  <img src={md.img} alt={md.name} />
                </div>
                <div>
                  <div className="tsti-modal__name">{md.name}</div>
                  {/* {md.role ? <div className="tsti-modal__role">{md.role}</div> : null} */}
                </div>
              </div>
              <div className="tsti-modal__stars" aria-label="Five stars">
                &#9733;&#9733;&#9733;&#9733;&#9733;
              </div>
              <h3 className="tsti-modal__title">{md.title}</h3>
              <div className="tsti-modal__body">
                {md.full.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="tsti-modal__sign">&mdash; {md.name}</p>
            </div>
          </div>
        </div>
      )}
    </Wrap>
    </>
  );
};

export default AboutPage;
