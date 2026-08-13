import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";
import { sendSiteMail } from "../../util/sendSiteMail";

/* ============================================================
   eemodiae.org — EVENTS  (redesign port)
   Upcoming + past gatherings with a live countdown to the next
   one, event cards (date, venue, speaker, seats, status), a
   featured spotlight, add-to-calendar (.ics), share, and dual
   registration (WhatsApp handoff + Email via Nodemailer API).
   Ported 1:1 from the redesign. Self-contained and CMS-hookable.
   Uses the shared el- design system.

   TO ADD GATHERINGS: push objects into EVENTS below. Everything
   else is automatic — events sort by date, split into upcoming/
   past, drive the countdown, seats, calendar file and the
   registration dropdown. Sample shape (copy, uncomment, edit):

   {
     id: "ev-2026-conference",
     title: "Word & Spirit Conference",
     type: "conference",              // one of TYPES ids below
     start: "2026-09-18T16:00:00",    // local time, ISO, no Z
     end: "2026-09-20T20:00:00",
     venue: "Venue name, city",
     address: "Full address for the map link (optional)",
     speaker: "Pastor Emmanuel Emodiae",
     blurb: "One sentence on what to expect.",
     image: "/redesign/your-event-cover.jpg", // optional
     capacity: 400,                   // 0 hides the seats bar
     taken: 0,
     stream: "",                      // live-stream URL (shown when live)
     message: "",                     // sermon URL (shown on past events)
     featured: true,                  // lifts it into the spotlight
   }
   ============================================================ */

const EVENTS_HERO = "/redesign/events-hero.jpg";
/* Ministry WhatsApp number, digits only, country code first, no + or spaces
   (e.g. "2348012345678"). Blank → the WhatsApp option routes to Email. */
const WHATSAPP_NUMBER = "";
const REGISTER_EMAIL = "eemodiaeevents@gmail.com";
const MAIL_INBOX = "events" as const;
const MESSAGES_URL = "/messages";

type EventType = { id: string; name: string };
const TYPES: EventType[] = [
  { id: "conference", name: "Conference" },
  { id: "crusade", name: "Crusade" },
  { id: "service", name: "Service" },
  { id: "workshop", name: "Workshop" },
  { id: "prayer", name: "Prayer" },
  { id: "online", name: "Online" },
];

type Gathering = {
  id: string; title: string; type: string; start: string; end?: string;
  venue?: string; address?: string; speaker?: string; blurb?: string; image?: string;
  capacity?: number; taken?: number; stream?: string; message?: string; featured?: boolean;
};

/* Empty by design — the page launches clean and ready. Add real
   gatherings here (see the sample shape above). */
const EVENTS: Gathering[] = [];

const isBrowser = () => typeof window !== "undefined";
const esc = (s: string) => String(s || "");
const parseDate = (s?: string): Date | null => { if (!s) return null; const d = new Date(s); return isNaN(+d) ? null : d; };
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (d: Date) => { let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + (m ? ":" + pad(m) : "") + ap; };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const fmtLongDate = (d: Date) => DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
const fmtWhen = (ev: Gathering) => { const s = parseDate(ev.start); return s ? MONTHS[s.getMonth()].slice(0, 3) + " " + s.getDate() : ""; };

const Wrap = styled.div`
  /* ===== design tokens (scoped) ===== */

  /* ============================================================
     EVENING ROOM
     Every value below is sampled from the hero banner: the
     aubergine shadow at its edges, the mulberry panelled wall,
     the dusty rose of the rug and sofa, and the peach-gold pool
     of afternoon light by the window. The page and the picture
     are the same room.
     ============================================================ */

  /* darks - the banner's own shadow, never true black */
  --ink:#160B14;          /* deepest corner shadow */
  --charcoal:#1E0F1B;     /* aubergine */
  --plum:#2A1522;         /* wall in shade */
  --navy:#3A1D2A;         /* mulberry, the panelled wall */
  --wine:#5C2F38;         /* sofa and warm shadow */

  /* the accent: peach-gold light, with rose for emphasis.
     Named --gold* so the whole sheet inherits without rewiring. */
  --gold:#E0A87C;         /* peach-gold, the light pool */
  --gold-bright:#F2C79B;  /* the brightest edge of that light */
  --gold-soft:#C98080;     /* dusty rose, from the rug - for dark grounds */
  --rose-deep:#9C4F55;     /* the same rose, deepened so it stays legible on cream */

  /* lights - the lit cream wall */
  --cream:#F7EDE2;
  --ivory:#FBF3EA;
  --camel:#D9A98C;
  --coffee:#5A3038;       /* wine-brown for body text on light */
  --chocolate:#3A1D2A;    /* mulberry for headings on light */

  /* hairlines, tinted rose rather than brass */
  --line:rgba(224,168,124,.26);
  --line-soft:rgba(224,168,124,.14);

  --text-on-dark:#F4E4D6;
  --muted-on-dark:#C9A99C;
  --text-on-light:#3A1D2A;
  --muted-on-light:#7A5158;

  --live:#A6454C;         /* wine-rose, still in family */

  --shadow-lg:0 30px 80px -30px rgba(22,11,20,.62);
  --shadow-md:0 18px 44px -20px rgba(22,11,20,.52);
  --shadow-sm:0 8px 22px -12px rgba(22,11,20,.46);
  --radius:18px;
  --radius-sm:12px;
  --maxw:1200px;
  --ease:cubic-bezier(.22,.61,.36,1);

  position:relative;

/* ============================================================
   EVENTS  |  eemodiae.org
   Design system: Cinzel / Cormorant Garamond / Crimson Pro
   Palette inherited from the eemodiae house style so this page
   sits beside Testimonies as a sibling, not a stranger.
   ============================================================ */



*,*::before,*::after{box-sizing:border-box} &{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}} &{
  margin:0;background:var(--ivory);color:var(--text-on-light);
  font-family:"Crimson Pro","EB Garamond",Georgia,serif;
  font-size:18px;line-height:1.65;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button{font:inherit}
:focus-visible{outline:2px solid var(--gold-bright);outline-offset:3px;border-radius:4px}

h1,h2,h3,.el-display{font-family:"Cinzel",serif;font-weight:600;letter-spacing:.02em;line-height:1.15}
h2{font-size:clamp(1.9rem,4.4vw,3rem);margin:0}
h3{font-size:clamp(1.2rem,2.4vw,1.5rem);margin:0}
p{margin:0}

.el-wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px}
@media (max-width:768px){.el-wrap{padding:0 18px}}
.el-eyebrow{
  font-family:"Cinzel",serif;font-size:.72rem;font-weight:600;
  letter-spacing:.3em;text-transform:uppercase;color:var(--rose-deep);
}

/* ============================ BUTTONS ============================ */
.el-btn{
  display:inline-flex;align-items:center;gap:.55rem;cursor:pointer;
  font-family:"Cinzel",serif;font-size:.76rem;font-weight:600;
  letter-spacing:.16em;text-transform:uppercase;
  padding:.9rem 1.7rem;border-radius:999px;border:1px solid transparent;
  transition:transform .3s var(--ease),box-shadow .3s var(--ease),background .3s var(--ease),color .3s var(--ease);
}
.el-btn svg{width:16px;height:16px;flex:0 0 auto}
.el-btn--gold{background:linear-gradient(135deg,var(--gold-bright),var(--gold-soft));color:#2A1522;box-shadow:var(--shadow-sm)}
.el-btn--gold:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
.el-btn--ghost{background:transparent;color:var(--gold-bright);border-color:var(--line)}
.el-btn--ghost:hover{background:rgba(224,168,124,.14);border-color:var(--gold)}
.el-btn--quiet{background:transparent;color:var(--coffee);border-color:rgba(224,168,124,.45)}
.el-btn--quiet:hover{background:rgba(224,168,124,.12);border-color:var(--gold)}
@media (prefers-reduced-motion:reduce){.el-btn:hover{transform:none}}

/* ============================ HERO ============================
   The banner is a finished 1989x790 artwork carrying its own title
   and verse, so the frame keeps its exact ratio at every width and
   the image is contained - never cropped, never covered by text. */
.el-hero{position:relative;overflow:hidden;background:var(--charcoal);display:block}
.el-hero__frame{
  position:relative;width:100%;
  aspect-ratio:var(--hero-ratio,1989/790);
  overflow:hidden;
}
.el-hero__bg{
  position:absolute;inset:0;z-index:0;
  background-image:var(--hero-img,none);
  background-size:contain;background-position:center;background-repeat:no-repeat;
  background-color:#2A1522;
  transform-origin:center;will-change:transform;
  animation:heroDrift 30s var(--ease) infinite alternate;
}
/* a slow breath in and out - the room feels inhabited, never restless */
@keyframes heroDrift{
  from{transform:scale(1.005) translate3d(0,0,0)}
  to  {transform:scale(1.04) translate3d(0,-0.5%,0)}
}
@media (max-width:900px){
  .el-hero__bg{animation-name:heroDriftSm}
}
@keyframes heroDriftSm{
  from{transform:scale(1.005)}
  to  {transform:scale(1.03)}
}
/* warm light drifting across the wall, echoing the window in the art */
.el-hero__frame::after{
  content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(102deg,transparent 36%,rgba(255,232,208,.17) 47%,rgba(255,240,222,.27) 50%,rgba(255,232,208,.17) 53%,transparent 64%);
  transform:translateX(-115%);
  animation:heroSheen 11s ease-in-out 1.8s infinite;
  mix-blend-mode:screen;
}
@keyframes heroSheen{
  0%{transform:translateX(-115%)}
  58%,100%{transform:translateX(115%)}
}
.el-hero__scrim{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(180deg,rgba(22,11,20,.22) 0%,rgba(22,11,20,0) 20%,rgba(22,11,20,0) 76%,rgba(22,11,20,.32) 100%);
}
.el-hero__frame{animation:heroRise 1.3s var(--ease) both}
@keyframes heroRise{
  from{opacity:0;transform:scale(1.02)}
  to{opacity:1;transform:scale(1)}
}
@media (prefers-reduced-motion:reduce){
  .el-hero__bg,.el-hero__frame,.el-hero__frame::after{animation:none}
  .el-hero__bg{transform:none}
}

/* ============================ COUNTDOWN BAND ============================
   The next gathering, counted down in real time. This is the page's
   signature: the whole point of an events page is "how long until
   we gather", so that question gets its own band directly under the
   banner rather than being buried inside a card. */
.el-next{
  background:linear-gradient(118deg,var(--charcoal),var(--navy) 55%,var(--wine) 130%);
  color:var(--text-on-dark);border-bottom:1px solid var(--line-soft);
  padding:clamp(1.5rem,4vw,2.4rem) 0;
}
.el-next__inner{
  max-width:var(--maxw);margin:0 auto;padding:0 24px;
  display:flex;align-items:center;justify-content:space-between;
  gap:clamp(1.2rem,4vw,3rem);flex-wrap:wrap;
}
.el-next__label{font-family:"Cinzel",serif;font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;color:var(--gold-soft);display:block;margin-bottom:.5rem}
.el-next__title{font-family:"Cinzel",serif;font-size:clamp(1.15rem,2.6vw,1.5rem);color:var(--gold-bright);line-height:1.25;margin-bottom:.4rem}
.el-next__when{color:var(--muted-on-dark);font-size:.98rem}
.el-clock{display:flex;gap:clamp(.6rem,2vw,1.3rem);flex-wrap:wrap}
.el-clock__unit{text-align:center;min-width:58px}
.el-clock__num{
  display:block;font-family:"Cinzel",serif;font-size:clamp(1.5rem,4vw,2.3rem);
  color:#F7EDE2;line-height:1;font-variant-numeric:tabular-nums;
}
.el-clock__word{font-size:.64rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted-on-dark);margin-top:.4rem;display:block}
.el-clock__sep{align-self:center;color:var(--gold-soft);font-size:1.4rem;opacity:.5;margin-top:-.6rem}
@media (max-width:560px){.el-clock__sep{display:none}}

/* ============================ SECTION SHELL ============================ */
.el-section{padding:clamp(46px,8vw,80px) 0}
.el-section--light{background:var(--ivory)}
.el-section--warm{background:linear-gradient(180deg,var(--ivory),#F3E4D8)}
.el-section--dark{background:linear-gradient(160deg,var(--charcoal),var(--plum) 70%,var(--navy));color:var(--text-on-dark)}
.el-head{max-width:640px;margin:0 auto clamp(2rem,5vw,3rem);text-align:center}
.el-head h2{margin:.7rem 0 0;color:var(--chocolate)}
.el-section--dark .el-head h2{color:#F7EDE2}
.el-head p{margin-top:1rem;color:var(--muted-on-light);font-size:1.05rem}
.el-section--dark .el-head p{color:var(--muted-on-dark)}
.el-rule{width:74px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:1.4rem auto 0}

/* ============================ EVENT CARD ============================
   One card carries the whole decision: when, where, who, and the two
   actions that matter (register, add to calendar). Status is derived
   from the date at load, so the ministry never moves an event by hand. */
.el-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr));gap:clamp(1.2rem,3vw,1.8rem)}

.el-card{
  position:relative;display:flex;flex-direction:column;
  background:#FFFCF8;border:1px solid var(--line-soft);border-radius:var(--radius);
  overflow:hidden;box-shadow:0 12px 30px -22px rgba(0,0,0,.4);
  transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s var(--ease);
}
.el-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md);border-color:var(--line)}
@media (prefers-reduced-motion:reduce){.el-card:hover{transform:none}}

/* cover image, with a date medallion anchored to it */
.el-card__media{position:relative;aspect-ratio:16/9;overflow:hidden;background:linear-gradient(135deg,var(--navy),var(--charcoal))}
.el-card__media img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
.el-card:hover .el-card__media img{transform:scale(1.05)}
.el-card__media--empty{display:grid;place-items:center}
.el-card__media--empty span{
  font-family:"Cinzel",serif;font-size:.62rem;letter-spacing:.24em;text-transform:uppercase;
  color:rgba(242,199,155,.5);border:1px dashed rgba(242,199,155,.32);padding:.4rem .9rem;border-radius:999px;
}
/* the date reads as a stamp on the cover - the single most scanned fact */
.el-date{
  position:absolute;left:1rem;bottom:1rem;z-index:2;
  background:rgba(251,243,234,.95);backdrop-filter:blur(4px);
  border-radius:var(--radius-sm);padding:.5rem .85rem;text-align:center;
  box-shadow:var(--shadow-sm);min-width:62px;
}
.el-date__day{display:block;font-family:"Cinzel",serif;font-size:1.5rem;line-height:1;color:var(--chocolate)}
.el-date__mon{display:block;font-size:.64rem;letter-spacing:.18em;text-transform:uppercase;color:var(--rose-deep);margin-top:.25rem}
.el-date__yr{display:block;font-size:.58rem;letter-spacing:.14em;color:var(--muted-on-light);margin-top:.1rem}

/* status: upcoming / live / past, computed not typed */
.el-status{
  position:absolute;top:1rem;right:1rem;z-index:2;
  font-family:"Cinzel",serif;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;
  padding:.32rem .7rem;border-radius:999px;display:inline-flex;align-items:center;gap:.4rem;
}
.el-status--soon{background:rgba(240,199,155,.94);color:#2A1522}
.el-status--past{background:rgba(58,29,42,.86);color:var(--cream)}
.el-status--live{background:var(--live);color:#fff}
.el-status--live::before{
  content:"";width:7px;height:7px;border-radius:50%;background:#fff;
  animation:pulse 1.4s ease-in-out infinite;
}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.75)}}
@media (prefers-reduced-motion:reduce){.el-status--live::before{animation:none}}

.el-card__body{padding:1.4rem 1.5rem 1.5rem;display:flex;flex-direction:column;flex:1}
.el-card__type{font-family:"Cinzel",serif;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--rose-deep);margin-bottom:.6rem}
/* inside the dark spotlight the lighter rose is correct */
.el-spot .el-card__type{color:var(--gold-soft)}
.el-card__title{font-family:"Cinzel",serif;font-size:1.12rem;color:var(--chocolate);line-height:1.3;margin-bottom:.7rem}
.el-card__blurb{color:var(--muted-on-light);font-size:1rem;line-height:1.6;margin-bottom:1.1rem;flex:1}

/* the facts: time, venue, speaker - iconed so they scan without reading */
.el-facts{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem}
.el-fact{display:flex;align-items:flex-start;gap:.6rem;font-size:.95rem;color:var(--coffee);min-width:0}
.el-fact svg{width:15px;height:15px;flex:0 0 auto;margin-top:.28rem;color:var(--rose-deep)}
.el-fact span{min-width:0;overflow-wrap:anywhere}
.el-fact a{color:var(--coffee);border-bottom:1px solid var(--line);transition:color .3s var(--ease)}
.el-fact a:hover{color:var(--gold-soft)}

/* seats remaining - momentum without pressure */
.el-seats{margin-bottom:1.1rem}
.el-seats__bar{height:5px;border-radius:999px;background:rgba(224,168,124,.18);overflow:hidden}
.el-seats__fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--gold-soft),var(--gold-bright));transition:width 1.1s var(--ease)}
.el-seats__text{font-size:.85rem;color:var(--muted-on-light);margin-top:.45rem;display:flex;justify-content:space-between;gap:.6rem;flex-wrap:wrap}
.el-seats__text b{color:var(--coffee);font-weight:600}
.el-seats--full .el-seats__fill{background:linear-gradient(90deg,#8C3A44,#B0555C)}

.el-card__actions{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:auto}
.el-card__actions .el-btn{font-size:.68rem;padding:.7rem 1.15rem}

/* a quiet row of secondary links under the main actions */
.el-mini{display:flex;gap:1rem;flex-wrap:wrap;margin-top:.9rem;padding-top:.9rem;border-top:1px solid var(--line-soft)}
.el-mini button,.el-mini a{
  background:none;border:none;padding:0;cursor:pointer;
  font-family:"Cinzel",serif;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--rose-deep);display:inline-flex;align-items:center;gap:.35rem;transition:color .3s var(--ease);
}
.el-mini button:hover,.el-mini a:hover{color:var(--wine)}
/* on the dark spotlight they invert */
.el-spot .el-mini button,.el-spot .el-mini a{color:var(--gold-soft)}
.el-spot .el-mini button:hover,.el-spot .el-mini a:hover{color:var(--gold-bright)}
.el-mini svg{width:13px;height:13px}

/* ============================ FEATURED NEXT EVENT ============================ */
.el-spot{
  position:relative;max-width:940px;margin:0 auto clamp(2rem,5vw,3rem);
  background:linear-gradient(150deg,var(--navy),var(--plum) 58%,var(--charcoal));
  color:var(--text-on-dark);border:1px solid var(--line);border-radius:var(--radius);
  overflow:hidden;box-shadow:var(--shadow-lg);
  display:grid;grid-template-columns:1.05fr 1fr;
}
@media (max-width:820px){.el-spot{grid-template-columns:1fr}}
.el-spot__media{position:relative;min-height:230px;overflow:hidden;background:rgba(0,0,0,.25)}
.el-spot__media img{width:100%;height:100%;object-fit:cover}
.el-spot__media--empty{display:grid;place-items:center}
.el-spot__media--empty span{
  font-family:"Cinzel",serif;font-size:.62rem;letter-spacing:.24em;text-transform:uppercase;
  color:rgba(242,199,155,.45);border:1px dashed rgba(242,199,155,.3);padding:.4rem .9rem;border-radius:999px;
}
.el-spot__body{padding:clamp(1.6rem,4vw,2.4rem);display:flex;flex-direction:column}
.el-spot__tag{
  display:inline-flex;align-items:center;gap:.45rem;align-self:flex-start;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold-soft));color:#2A1522;
  font-family:"Cinzel",serif;font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;
  padding:.35rem .8rem;border-radius:999px;margin-bottom:1rem;
}
.el-spot__tag svg{width:13px;height:13px}
.el-spot__title{font-family:"Cinzel",serif;font-size:clamp(1.3rem,3vw,1.8rem);color:var(--gold-bright);line-height:1.25;margin-bottom:.8rem}
.el-spot__blurb{color:var(--text-on-dark);font-size:1.02rem;line-height:1.65;margin-bottom:1.2rem}
.el-spot .el-fact{color:var(--text-on-dark)}
.el-spot .el-fact svg{color:var(--gold-soft)}
.el-spot .el-fact a{color:var(--text-on-dark);border-bottom-color:var(--line)}
.el-spot .el-fact a:hover{color:var(--gold-bright)}
.el-spot .el-seats__text{color:var(--muted-on-dark)}
.el-spot .el-seats__text b{color:var(--gold-bright)}
.el-spot .el-mini{border-top-color:var(--line-soft)}

/* ============================ FILTERS ============================ */
.el-filters{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;margin-bottom:clamp(1.6rem,4vw,2.4rem)}
.el-chip{
  cursor:pointer;background:transparent;border:1px solid var(--line);
  border-radius:999px;padding:.5rem 1.1rem;
  font-family:"Cinzel",serif;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--muted-on-light);display:inline-flex;align-items:center;gap:.45rem;
  transition:all .3s var(--ease);
}
.el-chip:hover{border-color:var(--gold);color:var(--coffee)}
.el-chip.is-active{background:var(--chocolate);color:var(--gold-bright);border-color:var(--chocolate)}
.el-chip__count{font-size:.6rem;opacity:.75}

/* ============================ PAST EVENTS ============================
   Past gatherings are an archive, not a feed: tighter rows, and the
   single action that matters is hearing what was preached. */
.el-past{display:flex;flex-direction:column;gap:.9rem;max-width:900px;margin:0 auto}
.el-row{
  display:grid;grid-template-columns:82px 1fr auto;align-items:center;gap:1.2rem;
  background:rgba(255,255,255,.05);border:1px solid var(--line-soft);
  border-radius:var(--radius-sm);padding:1rem 1.2rem;
  transition:border-color .35s var(--ease),background .35s var(--ease),transform .35s var(--ease);
}
.el-row:hover{border-color:var(--line);background:rgba(255,255,255,.08);transform:translateX(3px)}
@media (prefers-reduced-motion:reduce){.el-row:hover{transform:none}}
@media (max-width:640px){
  .el-row{grid-template-columns:62px 1fr;gap:.9rem}
  .el-row__go{grid-column:1 / -1;justify-self:start;margin-top:.3rem}
}
.el-row__date{text-align:center}
.el-row__day{display:block;font-family:"Cinzel",serif;font-size:1.35rem;line-height:1;color:var(--gold-bright)}
.el-row__mon{display:block;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-on-dark);margin-top:.28rem}
.el-row__yr{display:block;font-size:.56rem;letter-spacing:.12em;color:var(--muted-on-dark);opacity:.7;margin-top:.1rem}
.el-row__title{font-family:"Cinzel",serif;font-size:1rem;color:#F7EDE2;line-height:1.35;margin-bottom:.25rem}
.el-row__meta{font-size:.9rem;color:var(--muted-on-dark);display:flex;gap:.9rem;flex-wrap:wrap}
.el-row__meta span{display:inline-flex;align-items:center;gap:.35rem}
.el-row__meta svg{width:13px;height:13px;color:var(--gold-soft)}
.el-row__go{
  display:inline-flex;align-items:center;gap:.5rem;white-space:nowrap;
  font-family:"Cinzel",serif;font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--gold-bright);border:1px solid var(--line);border-radius:999px;padding:.55rem 1.05rem;
  transition:all .3s var(--ease);
}
.el-row__go:hover{background:var(--gold-bright);color:#2A1522;border-color:var(--gold-bright)}
.el-row__go svg{width:14px;height:14px}
.el-row__none{font-size:.85rem;color:var(--muted-on-dark);opacity:.65;font-style:italic}

/* ============================ EMPTY STATE ============================ */
.el-empty{
  text-align:center;padding:clamp(2rem,6vw,3.4rem) 1.5rem;
  border:1px dashed var(--line);border-radius:var(--radius);max-width:520px;margin:0 auto;
}
.el-empty h3{color:var(--chocolate);margin-bottom:.7rem}
.el-section--dark .el-empty h3{color:#F7EDE2}
.el-empty p{color:var(--muted-on-light);font-size:1rem}
.el-section--dark .el-empty p{color:var(--muted-on-dark)}

/* ============================ REGISTER ============================ */
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
.el-channel__btn.is-active{background:linear-gradient(135deg,rgba(224,168,124,.2),rgba(201,128,128,.07));border-color:var(--gold);color:#F7EDE2}
.el-channel__pill{
  position:absolute;top:-.6rem;right:-.4rem;font-style:normal;font-family:"Cinzel",serif;
  font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;color:#2A1522;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold-soft));
  padding:.2rem .55rem;border-radius:999px;
}
@media (prefers-reduced-motion:reduce){.el-channel__btn:hover{transform:none}}

.el-form{
  max-width:640px;margin:0 auto;background:rgba(255,255,255,.03);
  border:1px solid var(--line);border-radius:var(--radius);padding:clamp(1.6rem,4vw,2.6rem);
  backdrop-filter:blur(6px);
}
.el-field{margin-bottom:1.2rem;min-width:0}
.el-field label{
  display:block;font-family:"Cinzel",serif;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--gold-bright);margin-bottom:.5rem;
}
.el-field label .req{color:var(--gold);opacity:.8}
.el-input,.el-select,.el-textarea{
  width:100%;box-sizing:border-box;max-width:100%;
  font-family:"Crimson Pro",serif;font-size:1rem;color:#F7EDE2;
  background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:var(--radius-sm);
  padding:.85rem 1rem;transition:border-color .3s var(--ease),box-shadow .3s var(--ease);
}
.el-textarea{resize:vertical;min-height:110px;line-height:1.6}
.el-select{cursor:pointer}
.el-select option{background:var(--charcoal);color:#F7EDE2}
.el-input::placeholder,.el-textarea::placeholder{color:rgba(201,169,156,.62)}
.el-input:focus,.el-select:focus,.el-textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(224,168,124,.2)}
.el-row2{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}
.el-row2 > .el-field{min-width:0}
@media (max-width:560px){
  .el-row2{grid-template-columns:1fr}
  .el-form{padding:1.3rem 1.1rem}
  .el-channel{gap:.7rem}
  .el-channel__btn{flex:1 1 100%;max-width:none;padding:.9rem 1rem}
  .el-channel__pill{right:.5rem;top:-.5rem}
  .el-section{padding-top:40px;padding-bottom:40px}
}
.el-check{display:flex;align-items:flex-start;gap:.7rem;margin-bottom:1.2rem}
.el-check input{margin-top:.35rem;width:17px;height:17px;accent-color:var(--gold);flex:0 0 auto}
.el-check label{font-size:.95rem;color:var(--text-on-dark);line-height:1.5}
.el-note{
  display:flex;align-items:flex-start;gap:.6rem;margin:.2rem 0 1.2rem;
  font-size:.92rem;line-height:1.5;color:var(--muted-on-dark);
  background:rgba(224,168,124,.07);border:1px solid var(--line-soft);
  border-radius:var(--radius-sm);padding:.85rem 1rem;min-width:0;max-width:100%;
}
.el-note > span{min-width:0;flex:1 1 auto;overflow-wrap:anywhere}
.el-note svg{width:18px;height:18px;flex:0 0 auto;margin-top:.15rem;color:var(--gold-soft)}
.el-note--photo{background:rgba(224,168,124,.12);border-color:var(--line)}
.el-note__mail{color:var(--gold-bright);font-weight:600;overflow-wrap:anywhere;word-break:break-all}
.el-form__submit{width:100%;justify-content:center;margin-top:.4rem}
.el-form__msg{margin-top:.9rem;font-size:.95rem;min-height:1.2em}
.el-form__msg.ok{color:var(--gold-bright)}
.el-form__msg.err{color:#E9A0A0}
.el-honey{position:absolute;left:-9999px;opacity:0;height:0;overflow:hidden}

/* ============================ TOAST ============================ */
.el-toast{
  position:fixed;left:50%;bottom:26px;transform:translate(-50%,140%);
  z-index:200;background:var(--chocolate);color:var(--cream);
  border:1px solid var(--line);border-radius:999px;padding:.8rem 1.5rem;
  font-family:"Cinzel",serif;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;
  box-shadow:var(--shadow-md);transition:transform .45s var(--ease);max-width:90vw;text-align:center;
}
.el-toast.is-shown{transform:translate(-50%,0)}

/* ============================ REVEAL ============================ */
.el-reveal{opacity:0;transform:translateY(22px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
.el-reveal.is-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.el-reveal{opacity:1;transform:none;transition:none}}
`;

const EventsPage: NextPage = () => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [typeFilter, setTypeFilter] = useState("all");
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [toast, setToast] = useState<{ msg: string; on: boolean }>({ msg: "", on: false });
  const toastTimer = useRef<number | undefined>(undefined);
  const registerRef = useRef<HTMLDivElement>(null);

  const typeById = useMemo(() => Object.fromEntries(TYPES.map((t) => [t.id, t])), []);

  const statusOf = (ev: Gathering, ref: Date): "upcoming" | "live" | "past" => {
    const s = parseDate(ev.start);
    const e = parseDate(ev.end || "") || (s ? new Date(s.getTime() + 3 * 3600000) : null);
    if (!s) return "upcoming";
    if (ref < s) return "upcoming";
    if (e && ref <= e) return "live";
    return "past";
  };

  const processed = useMemo(() => {
    const withStatus = EVENTS.map((ev) => ({ ...ev, _status: statusOf(ev, now) }));
    withStatus.sort((a, b) => (parseDate(a.start)?.getTime() || 0) - (parseDate(b.start)?.getTime() || 0));
    const upcoming = withStatus.filter((e) => e._status !== "past");
    const past = withStatus.filter((e) => e._status === "past").sort((a, b) => (parseDate(b.start)?.getTime() || 0) - (parseDate(a.start)?.getTime() || 0));
    return { upcoming, past };
  }, [now]);

  const { upcoming, past } = processed;
  const liveNow = upcoming.find((e) => e._status === "live") || null;
  const countdownTarget = !liveNow ? upcoming.find((e) => e._status === "upcoming") || null : null;
  const featured = upcoming.find((e) => e.featured) || upcoming[0] || null;

  // filtered upcoming (by type)
  const filteredUpcoming = useMemo(() => typeFilter === "all" ? upcoming : upcoming.filter((e) => e.type === typeFilter), [upcoming, typeFilter]);
  const gridUpcoming = featured ? filteredUpcoming.filter((e) => e.id !== featured.id) : filteredUpcoming;

  // types present in upcoming (for filters)
  const typesPresent = useMemo(() => {
    const ids = new Set(upcoming.map((e) => e.type));
    return TYPES.filter((t) => ids.has(t.id));
  }, [upcoming]);

  // clock tick
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const showToast = (msg: string) => {
    setToast({ msg, on: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 2600);
  };

  // reveal-on-scroll
  useEffect(() => {
    if (!isBrowser() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".el-reveal:not(.is-in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filteredUpcoming, past]);

  // countdown parts
  const cd = useMemo(() => {
    if (!countdownTarget) return null;
    const d = parseDate(countdownTarget.start); if (!d) return null;
    const diff = d.getTime() - now.getTime();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hrs: Math.floor(diff / 3600000) % 24,
      mins: Math.floor(diff / 60000) % 60,
      secs: Math.floor(diff / 1000) % 60,
      when: fmtLongDate(d) + " at " + fmtTime(d) + (countdownTarget.venue ? " \u00b7 " + countdownTarget.venue : ""),
      title: countdownTarget.title,
    };
  }, [countdownTarget, now]);

  // .ics
  const icsStamp = (d: Date) => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
  const icsEscape = (s: string) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const downloadICS = (ev: Gathering) => {
    const s = parseDate(ev.start); if (!s) { showToast("That event has no date yet"); return; }
    const e = parseDate(ev.end || "") || new Date(s.getTime() + 2 * 3600000);
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//eemodiae.org//Events//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT", "UID:" + ev.id + "@eemodiae.org", "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(s), "DTEND:" + icsStamp(e), "SUMMARY:" + icsEscape(ev.title),
      "DESCRIPTION:" + icsEscape((ev.blurb || "") + (ev.speaker ? "\n\nMinistering: " + ev.speaker : "")),
      "LOCATION:" + icsEscape(ev.address || ev.venue || ""),
      "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:" + icsEscape(ev.title + " begins in an hour"), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = ev.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "") + ".ics";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Calendar file downloaded");
  };
  const shareEvent = async (ev: Gathering) => {
    const url = "https://eemodiae.org/events#" + ev.id;
    const text = ev.title + (parseDate(ev.start) ? " \u00b7 " + fmtLongDate(parseDate(ev.start)!) : "");
    try {
      if (isBrowser() && (navigator as any).share) { await (navigator as any).share({ title: ev.title, text, url }); return; }
      if (isBrowser() && navigator.clipboard) { await navigator.clipboard.writeText(url); showToast("Link copied to clipboard"); return; }
    } catch {}
    showToast("Copy this link: " + url);
  };

  const goRegister = (ev?: Gathering) => {
    if (ev) { setWaEvent(ev.title); setRgEvent(ev.title); }
    const el = registerRef.current;
    if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 20; window.scrollTo({ top: y, behavior: "smooth" }); }
  };

  // ---- registration form state ----
  const [waName, setWaName] = useState(""); const [waPhone, setWaPhone] = useState("");
  const [waEvent, setWaEvent] = useState(""); const [waSeats, setWaSeats] = useState("1"); const [waNote, setWaNote] = useState("");
  const [waMsg, setWaMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [rgEvent, setRgEvent] = useState(""); const [honey, setHoney] = useState("");
  const [rgMsg, setRgMsg] = useState<{ t: string; ok: boolean } | null>(null);

  const eventOptions = useMemo(() => {
    if (!upcoming.length) return [{ value: "General enquiry", label: "General enquiry" }];
    return upcoming.map((e) => ({ value: e.title, label: e.title + " \u00b7 " + fmtWhen(e) }));
  }, [upcoming]);

  const sendWhatsApp = () => {
    setWaMsg(null);
    if (!waName.trim() || !waPhone.trim() || !waEvent) { setWaMsg({ t: "Please fill in your name, phone and which event.", ok: false }); return; }
    if (!WHATSAPP_NUMBER) { setWaMsg({ t: "The WhatsApp line is being set up. Please use the Email option for now.", ok: false }); return; }
    const msg = "Event Registration - eemodiae.org\n\n" + "Name: " + waName + "\n" + "Phone: " + waPhone + "\n" + "Event: " + waEvent + "\n" + "Seats: " + (waSeats || "1") + (waNote ? "\n\nNote: " + waNote : "");
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
    setWaMsg({ t: "Opening WhatsApp to confirm your place...", ok: true });
    if (isBrowser()) window.open(url, "_blank", "noopener");
  };
  const submitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRgMsg(null);
    if (honey) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const fd = new FormData(form);
    const name = String(fd.get("Name") || "").trim();
    const email = String(fd.get("Email") || "").trim();
    const eventName = String(fd.get("Event") || rgEvent || "").trim();
    const seats = String(fd.get("Seats") || "1").trim();
    const note = String(fd.get("Note") || "").trim();
    setRgMsg({ t: "Sending your registration...", ok: true });
    try {
      await sendSiteMail({
        inbox: MAIL_INBOX,
        subject: "New Event Registration (eemodiae.org)",
        replyTo: email,
        name,
        message: [
          "Event Registration",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Event: ${eventName}`,
          `Seats: ${seats}`,
          note ? `Note: ${note}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        fields: {
          Name: name,
          Email: email,
          Event: eventName,
          Seats: seats,
          Note: note,
        },
        honeypot: honey,
      });
      setRgMsg({ t: "You’re registered. We’ll be in touch at " + email + ".", ok: true });
      form.reset();
      setRgEvent("");
    } catch {
      setRgMsg({
        t: "We could not send it just now. Please try again, or email " + REGISTER_EMAIL + ".",
        ok: false,
      });
    }
  };

  // ---- sub-components ----
  const Medallion = ({ ev }: { ev: Gathering }) => {
    const s = parseDate(ev.start); if (!s) return null;
    return <div className="el-date" aria-hidden="true"><span className="el-date__mon">{MONTHS[s.getMonth()].slice(0, 3)}</span><span className="el-date__day">{s.getDate()}</span></div>;
  };
  const StatusBadge = ({ ev }: { ev: Gathering & { _status?: string } }) => {
    if (ev._status === "live") return <span className="el-status el-status--live">Live now</span>;
    if (ev._status === "past") return <span className="el-status el-status--past">Held</span>;
    return null;
  };
  const Facts = ({ ev }: { ev: Gathering }) => {
    const s = parseDate(ev.start), e = parseDate(ev.end || "");
    let when = "";
    if (s) { when = fmtLongDate(s) + ", " + fmtTime(s); if (e && e.getDate() === s.getDate() && e.getMonth() === s.getMonth()) when += " - " + fmtTime(e); else if (e) when += " - " + fmtLongDate(e); }
    return (
      <div className="el-facts">
        {s && <div className="el-fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg><span>{when}</span></div>}
        {ev.venue && <div className="el-fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg><span>{ev.address ? <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(ev.address)} target="_blank" rel="noopener">{ev.venue}</a> : ev.venue}</span></div>}
        {ev.speaker && <div className="el-fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4" /></svg><span>{ev.speaker}</span></div>}
      </div>
    );
  };
  const Seats = ({ ev }: { ev: Gathering }) => {
    const cap = Number(ev.capacity) || 0; if (!cap) return null;
    const taken = Math.min(Number(ev.taken) || 0, cap); const left = cap - taken; const pct = Math.round((taken / cap) * 100); const full = left <= 0;
    return (
      <div className={"el-seats" + (full ? " el-seats--full" : "")}>
        <div className="el-seats__bar"><div className="el-seats__fill" style={{ width: pct + "%" }} /></div>
        <div className="el-seats__text"><span><b>{taken}</b> registered</span><span>{full ? "Full - join the waiting list" : <><b>{left}</b> seats left</>}</span></div>
      </div>
    );
  };
  const Actions = ({ ev }: { ev: Gathering & { _status?: string } }) => (
    <>
      <div className="el-card__actions">
        {ev._status === "live" && ev.stream ? (
          <a className="el-btn el-btn--gold" href={ev.stream} target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>Watch Live</a>
        ) : ev._status !== "past" ? (
          <button type="button" className="el-btn el-btn--gold" onClick={() => goRegister(ev)}>Register</button>
        ) : null}
        {ev._status === "past" && ev.message && <a className="el-btn el-btn--quiet" href={ev.message}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>Listen</a>}
      </div>
      <div className="el-mini">
        {ev._status !== "past" && <button type="button" onClick={() => downloadICS(ev)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>Add to calendar</button>}
        <button type="button" onClick={() => shareEvent(ev)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>Share</button>
      </div>
    </>
  );
  const Card = ({ ev }: { ev: Gathering & { _status?: string } }) => {
    const t = typeById[ev.type];
    return (
      <article className="el-card el-reveal" data-type={ev.type}>
        {ev.image ? <div className="el-card__media"><img src={ev.image} alt={ev.title} loading="lazy" /></div> : <div className="el-card__media el-card__media--empty"><span>Cover image space</span></div>}
        <Medallion ev={ev} /><StatusBadge ev={ev} />
        <div className="el-card__body">
          {t && <p className="el-card__type">{t.name}</p>}
          <h3 className="el-card__title">{ev.title}</h3>
          {ev.blurb && <p className="el-card__blurb">{ev.blurb}</p>}
          <Facts ev={ev} /><Seats ev={ev} /><Actions ev={ev} />
        </div>
      </article>
    );
  };

  return (
    <Wrap className="eemodiae-page ee-base-18">
      <Head>
        <title>Events &middot; Emmanuel Emodiae</title>
        <meta name="description" content="Upcoming conferences, crusades, services, and gatherings with Pastor Emmanuel I. Emodiae. Register, add to your calendar, and join us." />
      </Head>
      <Nav />

      {/* HERO */}
      <section className="el-hero" id="top" aria-label="Events" style={{ ["--hero-img" as any]: `url('${EVENTS_HERO}')`, ["--hero-ratio" as any]: "1989/790" }}>
        <div className="el-hero__frame"><div className="el-hero__bg" aria-hidden="true" /><div className="el-hero__scrim" aria-hidden="true" /></div>
      </section>

      {/* NEXT GATHERING COUNTDOWN */}
      <section className={"el-next"} aria-label="Next gathering" hidden={!liveNow && !cd}>
        <div className="el-next__inner">
          <div>
            <span className="el-next__label">Next Gathering</span>
            <p className="el-next__title">{liveNow ? liveNow.title : cd?.title}</p>
            <p className="el-next__when">{liveNow ? "Happening now" + (liveNow.venue ? " at " + liveNow.venue : "") : cd?.when}</p>
          </div>
          <div className="el-clock" aria-label="Countdown">
            {liveNow ? (
              <div className="el-clock__unit" style={{ minWidth: "auto" }}><span className="el-status el-status--live" style={{ position: "static" }}>Live</span></div>
            ) : cd ? (
              <>
                <span className="el-clock__unit"><b>{pad(cd.days)}</b><em>Days</em></span><span className="el-clock__sep">:</span>
                <span className="el-clock__unit"><b>{pad(cd.hrs)}</b><em>Hours</em></span><span className="el-clock__sep">:</span>
                <span className="el-clock__unit"><b>{pad(cd.mins)}</b><em>Minutes</em></span><span className="el-clock__sep">:</span>
                <span className="el-clock__unit"><b>{pad(cd.secs)}</b><em>Seconds</em></span>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <main id="main">
        {/* UPCOMING */}
        <section className="el-section el-section--light">
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow">Come And Worship</span>
              <h2>Upcoming Gatherings</h2>
              <p>Where we will be next. Register, add it to your calendar, and come expectant.</p>
              <div className="el-rule" />
            </div>

            {typesPresent.length > 0 && (
              <div className="el-filters el-reveal" role="tablist" aria-label="Filter by type">
                <button className={"el-chip" + (typeFilter === "all" ? " is-active" : "")} role="tab" aria-selected={typeFilter === "all"} onClick={() => setTypeFilter("all")}>All</button>
                {typesPresent.map((t) => (
                  <button key={t.id} className={"el-chip" + (typeFilter === t.id ? " is-active" : "")} role="tab" aria-selected={typeFilter === t.id} onClick={() => setTypeFilter(t.id)}>{t.name}</button>
                ))}
              </div>
            )}

            {/* spotlight */}
            {featured && typeFilter === "all" && (
              <div className="el-spot el-reveal">
                {featured.image ? <div className="el-spot__media"><img src={featured.image} alt={featured.title} /></div> : <div className="el-spot__media el-card__media--empty"><span>Cover image space</span></div>}
                <Medallion ev={featured} />
                <div className="el-spot__body">
                  <span className="el-spot__badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.6l1.3-6.8-5-4.7 6.8-.8z" /></svg>Featured</span>
                  {typeById[featured.type] && <p className="el-card__type">{typeById[featured.type].name}</p>}
                  <h3 className="el-spot__title">{featured.title}</h3>
                  {featured.blurb && <p className="el-spot__blurb">{featured.blurb}</p>}
                  <Facts ev={featured} /><Seats ev={featured} /><Actions ev={{ ...featured, _status: statusOf(featured, now) }} />
                </div>
              </div>
            )}

            {gridUpcoming.length > 0 ? (
              <div className="el-grid">{gridUpcoming.map((ev) => <Card key={ev.id} ev={ev} />)}</div>
            ) : !featured ? (
              <div className="el-empty el-reveal">
                <p>No upcoming gatherings are scheduled right now.</p>
                <p className="el-empty__sub">New dates are added here as they are set. Check back soon, or explore past teachings on the <a href={MESSAGES_URL}>Messages page</a>.</p>
              </div>
            ) : null}
          </div>
        </section>

        {/* PAST */}
        {past.length > 0 && (
          <section className="el-section el-section--dark">
            <div className="el-wrap">
              <div className="el-head el-reveal">
                <span className="el-eyebrow">From The Archive</span>
                <h2>Past Gatherings</h2>
                <p>Moments of grace already shared. Catch up on the messages.</p>
                <div className="el-rule" />
              </div>
              <div className="el-past">
                {past.map((ev) => {
                  const s = parseDate(ev.start);
                  return (
                    <div className="el-row2 el-reveal" key={ev.id}>
                      <div className="el-row2__date">{s ? <><b>{s.getDate()}</b><span>{MONTHS[s.getMonth()].slice(0, 3)} {s.getFullYear()}</span></> : null}</div>
                      <div className="el-row2__body">
                        {typeById[ev.type] && <p className="el-card__type">{typeById[ev.type].name}</p>}
                        <h3>{ev.title}</h3>
                        {ev.venue && <p className="el-row2__venue">{ev.venue}</p>}
                      </div>
                      <div className="el-row2__actions">
                        {ev.message && <a className="el-btn el-btn--quiet" href={ev.message}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>Listen</a>}
                        <button type="button" onClick={() => shareEvent(ev)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* REGISTER */}
        <section className="el-section el-section--dark" id="register" ref={registerRef}>
          <div className="el-wrap">
            <div className="el-head el-reveal">
              <span className="el-eyebrow" style={{ color: "var(--gold-bright)" }}>Reserve Your Place</span>
              <h2>Register To Attend</h2>
              <p>Let us know you are coming. Choose the gathering and how you would like to register.</p>
              <div className="el-rule" />
            </div>

            <div className="el-channel el-reveal" role="tablist" aria-label="Choose how to register">
              <button type="button" className={"el-channel__btn" + (channel === "whatsapp" ? " is-active" : "")} role="tab" aria-selected={channel === "whatsapp"} onClick={() => setChannel("whatsapp")}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.8.8-2.8-.2-.3A8 8 0 1 1 12 20z" /></svg>
                <span>WhatsApp</span><em className="el-channel__pill">Fastest</em>
              </button>
              <button type="button" className={"el-channel__btn" + (channel === "email" ? " is-active" : "")} role="tab" aria-selected={channel === "email"} onClick={() => setChannel("email")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                <span>Email</span>
              </button>
            </div>

            {channel === "whatsapp" ? (
              <div className="el-form el-reveal">
                <div className="el-row2">
                  <div className="el-field"><label htmlFor="waName">Your Name <span className="req">*</span></label><input className="el-input" id="waName" type="text" autoComplete="name" value={waName} onChange={(e) => setWaName(e.target.value)} /></div>
                  <div className="el-field"><label htmlFor="waPhone">Phone <span className="req">*</span></label><input className="el-input" id="waPhone" type="tel" autoComplete="tel" value={waPhone} onChange={(e) => setWaPhone(e.target.value)} /></div>
                </div>
                <div className="el-row2">
                  <div className="el-field"><label htmlFor="waEvent">Which Gathering <span className="req">*</span></label>
                    <select className="el-select" id="waEvent" value={waEvent} onChange={(e) => setWaEvent(e.target.value)}>
                      <option value="" disabled>Choose a gathering</option>
                      {eventOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="el-field"><label htmlFor="waSeats">Seats</label><input className="el-input" id="waSeats" type="number" min={1} value={waSeats} onChange={(e) => setWaSeats(e.target.value)} /></div>
                </div>
                <div className="el-field"><label htmlFor="waNote">Anything we should know</label><textarea className="el-textarea" id="waNote" value={waNote} onChange={(e) => setWaNote(e.target.value)} /></div>
                {waMsg && <p className={"el-form__msg " + (waMsg.ok ? "ok" : "err")} aria-live="polite">{waMsg.t}</p>}
                <button type="button" className="el-btn el-btn--send" onClick={sendWhatsApp}>Register on WhatsApp</button>
              </div>
            ) : (
              <form className="el-form el-reveal" onSubmit={submitEmail} noValidate>
                <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
                <div className="el-row2">
                  <div className="el-field"><label htmlFor="rgName">Your Name <span className="req">*</span></label><input className="el-input" id="rgName" name="Name" type="text" autoComplete="name" required /></div>
                  <div className="el-field"><label htmlFor="rgEmail">Email <span className="req">*</span></label><input className="el-input" id="rgEmail" name="Email" type="email" autoComplete="email" required /></div>
                </div>
                <div className="el-row2">
                  <div className="el-field"><label htmlFor="rgEvent">Which Gathering <span className="req">*</span></label>
                    <select className="el-select" id="rgEvent" name="Event" required value={rgEvent} onChange={(e) => setRgEvent(e.target.value)}>
                      <option value="" disabled>Choose a gathering</option>
                      {eventOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="el-field"><label htmlFor="rgSeats">Seats</label><input className="el-input" id="rgSeats" name="Seats" type="number" min={1} defaultValue={1} /></div>
                </div>
                <div className="el-field"><label htmlFor="rgNote">Anything we should know</label><textarea className="el-textarea" id="rgNote" name="Note" /></div>
                {rgMsg && <p className={"el-form__msg " + (rgMsg.ok ? "ok" : "err")} aria-live="polite">{rgMsg.t}</p>}
                <button type="submit" className="el-btn el-btn--send">Register by Email</button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <div className={"el-toast" + (toast.on ? " is-on" : "")} role="status" aria-live="polite">{toast.msg}</div>
    </Wrap>
  );
};

export default EventsPage;
