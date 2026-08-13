import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import styled from "styled-components";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";
import { sendSiteMail } from "../../util/sendSiteMail";

/* ============================================================
   eemodiae.org — BOOKINGS  (redesign port)
   Choice stage → Appointments (online/offline + Calendly) and
   Speaking Engagement (full event form). Ported 1:1 from the
   redesign. Self-contained: no CMS. Set the CONFIG values below.
   ============================================================ */

/* ---- CONFIG (set these; safe defaults keep it working) ---- */
const CALENDLY_ONLINE =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CALENDLY_ONLINE_URL?.trim()) ||
  "https://calendly.com/eemodiaeweb";
const ENGAGEMENT_EMAIL = "eemodiaebookings@gmail.com";
const MAIL_INBOX = "bookings" as const;

const buildCalendlyUrl = (name: string, reason: string, notes: string) => {
  const prefill = new URLSearchParams();
  if (name.trim()) prefill.set("name", name.trim());
  const base =
    CALENDLY_ONLINE + (CALENDLY_ONLINE.includes("?") ? "&" : "?") + prefill.toString();
  const a1 = encodeURIComponent("Reason");
  const a2 = encodeURIComponent(reason.trim());
  return (
    base +
    `&a1=${a1}:${a2}` +
    (notes.trim()
      ? `&a2=${encodeURIComponent("Notes")}:${encodeURIComponent(notes.trim())}`
      : "")
  );
};

const BOOKINGS_HERO = "/redesign/bookings-hero.jpg";

const COUNTRIES = ["Nigeria","Ghana","Kenya","South Africa","United States","United Kingdom","Canada","Australia","Ireland","Germany","France","Netherlands","Italy","Spain","Portugal","Sweden","Norway","Denmark","Switzerland","Austria","Belgium","United Arab Emirates","Saudi Arabia","Qatar","India","Pakistan","Philippines","Malaysia","Singapore","Indonesia","Japan","South Korea","China","Brazil","Mexico","Argentina","Chile","Colombia","Egypt","Morocco","Ethiopia","Uganda","Tanzania","Rwanda","Zambia","Zimbabwe","Botswana","Cameroon","Ivory Coast","Senegal","Togo","Benin","Liberia","Sierra Leone","Gambia","Namibia","Malawi","Mozambique","Angola","New Zealand"];

const isBrowser = () => typeof window !== "undefined";
const validEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

type EventData = {
  firstName: string; lastName: string; organisation: string; email: string; phone: string;
  website: string; socialMedia: string; eventTheme: string; natureOfEvent: string;
  eventTime: string; eventCountry: string; eventState: string; eventAddress: string; additionalInfo: string;
};
const EMPTY: EventData = {
  firstName: "", lastName: "", organisation: "", email: "", phone: "", website: "",
  socialMedia: "", eventTheme: "", natureOfEvent: "", eventTime: "", eventCountry: "",
  eventState: "", eventAddress: "", additionalInfo: "",
};

const REQUIRED: { key: keyof EventData; label: string; email?: boolean }[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "organisation", label: "Name of Organisation" },
  { key: "email", label: "Email", email: true },
  { key: "phone", label: "Phone Number" },
  { key: "socialMedia", label: "Social Media Page" },
  { key: "eventTheme", label: "Event Name or Theme" },
  { key: "natureOfEvent", label: "Nature of Event" },
  { key: "eventTime", label: "Event Date & Time" },
  { key: "eventCountry", label: "Event Country" },
  { key: "eventState", label: "Event State" },
  { key: "eventAddress", label: "Event Address" },
];

/* ---- .ics builder ---- */
const pad = (n: number) => String(n).padStart(2, "0");
const toICSDate = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const icsEscape = (s: string) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const buildICS = (data: EventData): string | null => {
  if (!data.eventTime) return null;
  const start = new Date(data.eventTime);
  if (isNaN(+start)) return null;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const loc = [data.eventAddress, data.eventState, data.eventCountry].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//eemodiae.org//Bookings//EN", "BEGIN:VEVENT",
    "UID:" + Date.now() + "@eemodiae.org", "DTSTAMP:" + toICSDate(new Date()),
    "DTSTART:" + toICSDate(start), "DTEND:" + toICSDate(end),
    "SUMMARY:" + icsEscape(data.eventTheme || "Speaking Engagement"),
    "LOCATION:" + icsEscape(loc),
    "DESCRIPTION:" + icsEscape("Speaking engagement with Emmanuel I. Emodiae. Organised by " + data.organisation + "."),
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
};
const buildSummary = (d: EventData) =>
  [`Speaking Engagement Invitation`, ``, `Name: ${d.firstName} ${d.lastName}`, `Organisation: ${d.organisation}`,
   `Email: ${d.email}`, `Phone: ${d.phone}`, d.website ? `Website: ${d.website}` : "", `Social: ${d.socialMedia}`,
   `Event: ${d.eventTheme}`, `Nature: ${d.natureOfEvent}`, `When: ${d.eventTime}`,
   `Where: ${[d.eventAddress, d.eventState, d.eventCountry].filter(Boolean).join(", ")}`,
   d.additionalInfo ? `Notes: ${d.additionalInfo}` : ""].filter(Boolean).join("\n");

const Wrap = styled.div`
  /* ===== design tokens (scoped) ===== */

  --gold-metal:#B57A1F;
  --gold-rich:#D39B2A;
  --gold-honey:#E7B35A;
  --amber:#F0C46A;
  --cream:#F3E7DC;
  --ivory:#FFF8F1;
  --camel:#B88B68;
  --beige:#C8A88A;
  --coffee:#6C4A38;
  --chocolate:#4B2F23;
  --warmgray:#8A7A73;
  --error:#B0402C;
  --ok:#4E7A46;
  --font-display:'Cinzel',serif;
  --font-serif:'Cormorant Garamond',serif;
  --font-body:'Jost',sans-serif;
  --shadow-soft:0 10px 34px rgba(75,47,35,.10);
  --shadow-lift:0 22px 54px rgba(75,47,35,.16);
  --ease:cubic-bezier(.22,.61,.24,1);

  position:relative;

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0} &{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
} &{
  font-family:var(--font-body);
  font-size:18px;
  line-height:1.75;
  color:var(--chocolate);
  background:var(--cream);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
img{max-width:100%;display:block}
button{font-family:inherit;cursor:pointer}
input,select,textarea{font-family:inherit}
:focus-visible{outline:3px solid var(--gold-rich);outline-offset:3px;border-radius:4px}
.visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip-link{position:absolute;left:-999px;top:0;background:var(--chocolate);color:var(--ivory);padding:.7rem 1.2rem;z-index:200;border-radius:0 0 12px 0;font-weight:500;text-decoration:none}
.skip-link:focus{left:0}
.wrap{width:min(1120px,92%);margin-inline:auto}

/* ---------- Hero: the artwork, full bleed, never cropped ---------- */
.hero{width:100%;display:block;position:relative;overflow:hidden}
.hero img{width:100%;height:auto;aspect-ratio:768/305;object-fit:cover;display:block}
.hero-particles{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}
.hp-rise{position:absolute;bottom:-14px;will-change:transform,opacity;animation:hp-rise linear infinite;opacity:0}
.hp-sway{display:block;animation:hp-sway ease-in-out infinite alternate;will-change:transform}
.hp-dust{
  display:block;border-radius:50%;
  background:radial-gradient(circle,#FFF3D0 0%,rgba(240,196,106,.9) 38%,rgba(240,196,106,0) 70%);
  filter:blur(.4px);
}
.hp-dust.hp-soft{filter:blur(1.6px);opacity:.8}
.hp-spark{
  display:block;border-radius:50%;
  background:radial-gradient(circle,#FFFDF4 0%,#FFE9B8 30%,rgba(231,179,90,.75) 55%,rgba(231,179,90,0) 75%);
  animation:hp-pulse ease-in-out infinite;will-change:transform,opacity;
}
.hp-glint{position:absolute;width:0;height:0;animation:hp-glint ease-in-out infinite;opacity:0;will-change:transform,opacity}
.hp-glint::before,.hp-glint::after{
  content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  background:linear-gradient(180deg,rgba(255,244,214,0),#FFF6DC 45%,#FFE9B8 50%,#FFF6DC 55%,rgba(255,244,214,0));
  border-radius:999px;
}
.hp-glint::before{width:1.6px;height:var(--g,22px)}
.hp-glint::after{width:var(--g,22px);height:1.6px}
.hp-glint i{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:5px;height:5px;border-radius:50%;
  background:radial-gradient(circle,#FFFDF4 0%,rgba(255,233,184,.95) 45%,rgba(255,233,184,0) 75%);
}
@keyframes hp-rise{
  0%{transform:translateY(0);opacity:0}
  10%{opacity:var(--o,.85)}
  80%{opacity:calc(var(--o,.85)*.45)}
  100%{transform:translateY(calc(-1*var(--h,42vw)));opacity:0}
}
@keyframes hp-sway{
  from{transform:translateX(calc(-1*var(--sw,1.2vw)))}
  to{transform:translateX(var(--sw,1.2vw))}
}
@keyframes hp-pulse{
  0%,100%{transform:scale(.72)}
  50%{transform:scale(1.18)}
}
@keyframes hp-glint{
  0%,100%{opacity:0;transform:scale(.35) rotate(0deg)}
  45%{opacity:var(--o,.9)}
  50%{opacity:var(--o,.9);transform:scale(1) rotate(18deg)}
  55%{opacity:calc(var(--o,.9)*.85)}
}
@media (prefers-reduced-motion:reduce){
  .hero-particles{display:none}
}

/* ---------- Section shell ---------- */
.section{padding:5.2rem 0 6.2rem}
.section-head{text-align:center;max-width:64ch;margin-inline:auto}
.eyebrow{font-weight:500;letter-spacing:.36em;text-transform:uppercase;font-size:.78rem;color:var(--gold-metal)}
.section-title{
  font-family:var(--font-display);font-weight:600;color:var(--chocolate);
  font-size:clamp(1.9rem,4.4vw,2.9rem);line-height:1.22;margin-top:.8rem;letter-spacing:.03em;
}
.section-lede{color:var(--coffee);margin-top:1.15rem;font-size:1.04rem}
.stroke-divider{width:170px;margin:1.4rem auto 0;display:block}
.scripture{
  font-family:var(--font-serif);font-style:italic;color:var(--coffee);
  font-size:clamp(1.15rem,2.5vw,1.5rem);line-height:1.5;max-width:52ch;margin:1.6rem auto 0;
}
.scripture cite{display:block;font-style:normal;font-family:var(--font-body);font-size:.8rem;
  letter-spacing:.2em;text-transform:uppercase;color:var(--gold-metal);margin-top:.7rem}

/* ---------- Reveal ---------- */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
.reveal.in{opacity:1;transform:none}

/* ---------- Choice cards ---------- */
.choice-stage{margin-top:3.4rem;display:grid;gap:1.8rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));max-width:860px;margin-inline:auto}
.pick-card{
  position:relative;text-align:left;background:var(--ivory);
  border:1px solid rgba(184,139,104,.3);border-radius:26px;
  padding:2.5rem 2.1rem 2.2rem;box-shadow:var(--shadow-soft);
  transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s var(--ease);
  overflow:hidden;display:flex;flex-direction:column;gap:1rem;
}
.pick-card::before{
  content:"";position:absolute;inset:0 0 auto 0;height:5px;
  background:linear-gradient(90deg,transparent,var(--gold-honey),var(--gold-metal),var(--gold-honey),transparent);
  opacity:.55;
}
.pick-card:hover{transform:translateY(-6px);border-color:var(--gold-rich);box-shadow:var(--shadow-lift)}
.pick-ico{
  width:64px;height:64px;border-radius:18px;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 25%,rgba(240,196,106,.4),rgba(240,196,106,.12));
  border:1px solid rgba(211,155,42,.4);
}
.pick-ico svg{width:32px;height:32px;color:var(--gold-metal)}
.pick-title{font-family:var(--font-display);font-weight:600;font-size:1.5rem;color:var(--chocolate);letter-spacing:.02em}
.pick-desc{color:var(--coffee);font-size:1rem;line-height:1.6}
.pick-cta{
  margin-top:auto;display:inline-flex;align-items:center;gap:.55rem;
  font-weight:500;letter-spacing:.12em;text-transform:uppercase;font-size:.82rem;color:var(--gold-metal);
}
.pick-cta svg{width:17px;height:17px;transition:transform .35s var(--ease)}
.pick-card:hover .pick-cta svg{transform:translateX(5px)}

/* ---------- Panels / desk ---------- */
.flow{max-width:820px;margin:3.2rem auto 0}
.panel{display:none;animation:panelIn .5s var(--ease)}
.panel.is-open{display:block}
@keyframes panelIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.desk-body{
  background:var(--ivory);border-radius:28px;border:1px solid rgba(184,139,104,.3);
  box-shadow:var(--shadow-lift);padding:2.8rem 2.4rem 2.6rem;position:relative;overflow:hidden;
}
.desk-&::before{
  content:"";position:absolute;inset:0 0 auto 0;height:5px;
  background:linear-gradient(90deg,transparent,var(--gold-honey),var(--gold-metal),var(--gold-honey),transparent);
  opacity:.55;
}
.desk-title{font-family:var(--font-display);font-weight:600;font-size:clamp(1.4rem,3.4vw,1.9rem);color:var(--chocolate);letter-spacing:.02em}
.desk-sub{color:var(--coffee);font-size:1rem;margin-top:.5rem}
.back-btn{
  display:inline-flex;align-items:center;gap:.5rem;background:none;border:0;
  color:var(--coffee);font-weight:500;letter-spacing:.1em;text-transform:uppercase;font-size:.8rem;
  padding:.4rem .6rem .4rem 0;margin-bottom:1.4rem;border-radius:8px;
  transition:color .3s var(--ease),transform .3s var(--ease);
}
.back-btn svg{width:16px;height:16px}
.back-btn:hover{color:var(--gold-metal);transform:translateX(-3px)}

/* ---------- Appointment type toggle ---------- */
.type-row{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.9rem}
.type-btn{
  flex:1 1 200px;display:flex;flex-direction:column;align-items:flex-start;gap:.55rem;
  padding:1.4rem 1.5rem;border-radius:18px;text-align:left;
  background:var(--cream);border:1.5px solid rgba(184,139,104,.42);color:var(--chocolate);
  transition:transform .35s var(--ease),box-shadow .35s var(--ease),border-color .35s var(--ease),background .35s var(--ease);
}
.type-btn:hover:not(:disabled){transform:translateY(-3px);border-color:var(--gold-rich);background:#FBF1E2;box-shadow:0 14px 28px rgba(107,66,15,.16)}
.type-btn.is-active{border-color:var(--gold-metal);background:#FBF1E2;box-shadow:0 12px 26px rgba(107,66,15,.18)}
.type-btn:disabled,.type-btn.is-disabled{
  opacity:.55; cursor:not-allowed; filter:grayscale(.55);
  background:#ebe4dc; border-color:rgba(138,122,115,.35); transform:none; box-shadow:none;
}
.type-btn .t-ico{width:30px;height:30px;color:var(--gold-metal)}
.type-btn .t-name{font-family:var(--font-display);font-weight:600;font-size:1.2rem;display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.type-btn .t-note{font-size:.9rem;color:var(--coffee);line-height:1.45}
.type-btn .t-soon{
  font-family:var(--font-body); font-weight:600; font-size:.68rem; letter-spacing:.08em; text-transform:uppercase;
  color:var(--warmgray); background:rgba(138,122,115,.16); border:1px solid rgba(138,122,115,.28);
  border-radius:999px; padding:.2rem .55rem;
}

/* ---------- Form ---------- */
.form-grid{display:grid;gap:1.3rem 1.2rem;grid-template-columns:1fr 1fr;margin-top:1.9rem}
.field{display:flex;flex-direction:column;gap:.45rem;min-width:0}
.field.col-2{grid-column:1 / -1}
.field label{font-weight:500;font-size:.9rem;color:var(--chocolate);letter-spacing:.02em}
.field label .req{color:var(--gold-metal)}
.field input,.field select,.field textarea{
  width:100%;padding:.85rem 1rem;border-radius:12px;font-size:1rem;color:var(--chocolate);
  background:#FFFDFA;border:1.5px solid rgba(184,139,104,.4);
  transition:border-color .25s var(--ease),box-shadow .25s var(--ease);
}
.field textarea{resize:vertical;min-height:120px}
.field input:focus,.field select:focus,.field textarea:focus{
  outline:none;border-color:var(--gold-rich);box-shadow:0 0 0 3px rgba(211,155,42,.18);
}
.field select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23B57A1F' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 1rem center;padding-right:2.6rem}
.field-error input,.field-error select,.field-error textarea{border-color:var(--error);box-shadow:0 0 0 3px rgba(176,64,44,.16)}
.field-hint{font-size:.78rem;color:var(--warmgray)}
.field-error .field-hint{color:var(--error)}

.form-actions{grid-column:1 / -1;display:flex;align-items:center;gap:1.2rem;flex-wrap:wrap;margin-top:.6rem}
.btn-primary{
  display:inline-flex;align-items:center;gap:.6rem;
  font-weight:500;letter-spacing:.1em;text-transform:uppercase;font-size:.86rem;color:#FFF6E6;
  background:linear-gradient(150deg,var(--gold-rich) 0%,var(--gold-metal) 55%,#8F5F16 100%);
  border:0;border-radius:999px;padding:.95rem 2.4rem;box-shadow:0 14px 30px rgba(107,66,15,.32);
  transition:transform .35s var(--ease),box-shadow .35s var(--ease);
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 18px 38px rgba(107,66,15,.4)}
.btn-primary svg{width:18px;height:18px}
.form-msg{font-size:.92rem;color:var(--error);min-height:1.2em}
.form-msg.ok{color:var(--ok)}

/* ---------- Success card ---------- */
.success{text-align:center;padding:1rem 0 .4rem}
.success-check{
  width:78px;height:78px;margin:0 auto 1.4rem;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 25%,rgba(240,196,106,.45),rgba(240,196,106,.14));
  border:1px solid rgba(211,155,42,.5);
}
.success-check svg{width:38px;height:38px;color:var(--gold-metal)}
.success h3{font-family:var(--font-display);font-weight:600;font-size:1.6rem;color:var(--chocolate)}
.success p{color:var(--coffee);margin-top:.7rem;max-width:46ch;margin-inline:auto}
.success .btn-primary{margin-top:1.8rem}

/* ---------- Footer strip ---------- */
.foot{padding:3rem 0 3.4rem;text-align:center;color:var(--warmgray);font-size:.86rem;letter-spacing:.04em}
.foot .brand{font-family:var(--font-display);letter-spacing:.22em;color:var(--gold-metal);font-size:.9rem}
.foot .tag{margin-top:.35rem;text-transform:uppercase;letter-spacing:.24em;font-size:.66rem}

/* ---------- Error summary (a11y) ---------- */
.error-summary{
  grid-column:1 / -1;display:none;border:1.5px solid var(--error);
  background:rgba(176,64,44,.08);border-radius:16px;padding:1.1rem 1.3rem;margin-bottom:.4rem;
}
.error-summary.is-open{display:block;animation:panelIn .35s var(--ease)}
.error-summary h4{font-family:var(--font-body);font-weight:600;font-size:.95rem;color:var(--error);
  display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem}
.error-summary h4 svg{width:18px;height:18px}
.error-summary ul{list-style:none;display:flex;flex-direction:column;gap:.3rem}
.error-summary a{color:var(--error);font-size:.88rem;text-decoration:underline;text-underline-offset:3px}

/* ---------- Honeypot (kept out of view, out of tab order) ---------- */
.hp-field{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}

/* ---------- Sending spinner ---------- */
.btn-primary[aria-busy="true"]{opacity:.8;pointer-events:none}
.spin{width:18px;height:18px;border:2.5px solid rgba(255,246,230,.4);border-top-color:#FFF6E6;
  border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ---------- Consent / next-steps ---------- */
.next-steps{grid-column:1 / -1;background:rgba(240,196,106,.12);border:1px solid rgba(211,155,42,.32);
  border-radius:16px;padding:1rem 1.2rem;color:var(--coffee);font-size:.88rem;line-height:1.55;margin-top:.4rem}
.next-steps strong{color:var(--chocolate);font-weight:600}
.success .ics-link{display:inline-flex;align-items:center;gap:.5rem;margin-top:1.1rem;
  color:var(--gold-metal);font-weight:500;font-size:.9rem;letter-spacing:.06em;text-transform:uppercase;text-decoration:none}
.success .ics-link svg{width:17px;height:17px}
.success .ics-link:hover{text-decoration:underline;text-underline-offset:3px}
.tz-hint{font-size:.78rem;color:var(--warmgray)}

@media (max-width:640px){
  .form-grid{grid-template-columns:1fr}
  .desk-body{padding:2.2rem 1.5rem 2rem}
}
`;

type EngFieldProps = {
  k: keyof EventData;
  label: string;
  type?: string;
  req?: boolean;
  col2?: boolean;
  hint?: string;
  autoComplete?: string;
  list?: string;
  value: string;
  error?: boolean;
  min?: string;
  onChange: (v: string) => void;
  children?: ReactNode;
};

/** Stable field component — must live outside the page to avoid remount/focus loss on each keystroke. */
const EngField = ({
  k, label, type = "text", req, col2, hint, autoComplete, list, value, error, min, onChange, children,
}: EngFieldProps) => (
  <div className={"field" + (col2 ? " col-2" : "") + (error ? " field-error" : "")}>
    <label htmlFor={"ef-" + k}>{label} {req && <span className="req">*</span>}</label>
    {children ? children : type === "textarea" ? (
      <textarea id={"ef-" + k} value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} />
    ) : (
      <input
        id={"ef-" + k}
        type={type}
        value={value}
        autoComplete={autoComplete}
        list={list}
        min={type === "datetime-local" ? min : undefined}
        placeholder={type === "url" ? "https://" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </div>
);

const BookingsPage: NextPage = () => {
  const [panel, setPanel] = useState<"choice" | "appointments" | "engagement">("choice");
  const [apReason, setApReason] = useState("");
  const [apName, setApName] = useState("");
  const [apNotes, setApNotes] = useState("");
  const [apType, setApType] = useState<"" | "online">("");
  const [apMsg, setApMsg] = useState("");

  const [form, setForm] = useState<EventData>(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<{ key: string; label: string; msg: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);
  const errSummaryRef = useRef<HTMLDivElement>(null);
  const heroParticlesRef = useRef<HTMLDivElement>(null);

  const nowLocalMin = useCallback(() => {
    const d = new Date();
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  }, []);

  const set = useCallback((k: keyof EventData, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  // reveal-on-scroll
  useEffect(() => {
    if (!isBrowser() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [panel]);

  // hero particles
  useEffect(() => {
    const host = heroParticlesRef.current;
    if (!host || !isBrowser()) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    host.innerHTML = "";
    for (let i = 0; i < 26; i++) {
      const rise = document.createElement("span");
      rise.className = "hp-rise";
      let left = rand(4, 98); if (Math.random() < 0.45) left = rand(58, 98);
      rise.style.left = left + "%";
      rise.style.setProperty("--h", rand(24, 52) + "vw");
      rise.style.setProperty("--o", rand(0.4, 0.9).toFixed(2));
      rise.style.animationDuration = rand(9, 18) + "s";
      rise.style.animationDelay = -rand(0, 18) + "s";
      const sway = document.createElement("span"); sway.className = "hp-sway";
      sway.style.setProperty("--sw", rand(0.6, 2) + "vw");
      sway.style.animationDuration = rand(3, 6) + "s";
      const dust = document.createElement("span"); dust.className = "hp-dust" + (Math.random() < 0.4 ? " hp-soft" : "");
      const size = rand(2, 5.5); dust.style.width = size + "px"; dust.style.height = size + "px";
      sway.appendChild(dust); rise.appendChild(sway); host.appendChild(rise);
    }
    for (let j = 0; j < 10; j++) {
      const srise = document.createElement("span"); srise.className = "hp-rise";
      let sleft = rand(6, 96); if (Math.random() < 0.5) sleft = rand(56, 96);
      srise.style.left = sleft + "%";
      srise.style.setProperty("--h", rand(28, 50) + "vw");
      srise.style.setProperty("--o", rand(0.5, 1).toFixed(2));
      srise.style.animationDuration = rand(10, 16) + "s";
      srise.style.animationDelay = -rand(0, 16) + "s";
      const ssway = document.createElement("span"); ssway.className = "hp-sway";
      ssway.style.setProperty("--sw", rand(0.8, 2.2) + "vw");
      ssway.style.animationDuration = rand(3.5, 6.5) + "s";
      const spark = document.createElement("span"); spark.className = "hp-spark";
      const ssize = rand(3, 6); spark.style.width = ssize + "px"; spark.style.height = ssize + "px";
      spark.style.animationDuration = rand(1.4, 2.6) + "s";
      ssway.appendChild(spark); srise.appendChild(ssway); host.appendChild(srise);
    }
    const spots: [number, number][] = [[12,30],[20,62],[30,20],[40,72],[62,26],[72,58],[80,34],[88,66],[92,22],[8,55],[50,14],[68,78]];
    spots.forEach((pt) => {
      const glint = document.createElement("span"); glint.className = "hp-glint";
      glint.style.left = pt[0] + "%"; glint.style.top = pt[1] + "%";
      glint.style.setProperty("--g", rand(14, 26) + "px");
      glint.style.setProperty("--o", rand(0.6, 1).toFixed(2));
      glint.style.animationDuration = rand(3, 6) + "s";
      glint.style.animationDelay = -rand(0, 6) + "s";
      glint.appendChild(document.createElement("i"));
      host.appendChild(glint);
    });
    return () => { if (host) host.innerHTML = ""; };
  }, []);

  const openCalendly = () => {
    setApMsg("");
    if (!apReason.trim() || !apName.trim()) {
      setApMsg("Please tell us the reason and your name, then continue.");
      return;
    }
    if (apType !== "online") {
      setApMsg("Please choose Online to continue. Offline appointments are not available for now.");
      return;
    }
    if (!CALENDLY_ONLINE) {
      setApMsg("Online booking is being set up. Kindly email " + ENGAGEMENT_EMAIL + ".");
      return;
    }
    const url = buildCalendlyUrl(apName, apReason, apNotes);
    if (!isBrowser()) return;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      setApMsg("Pop-up blocked. Allow pop-ups for this site, then try again.");
    } else {
      setApMsg("Calendly opened in a new tab. Pick a time there to confirm.");
    }
  };

  // validation
  const validate = (): boolean => {
    const errs: { key: string; label: string; msg: string }[] = [];
    REQUIRED.forEach(({ key, label, email }) => {
      const v = (form[key] || "").trim();
      let bad = !v;
      let msg = "is required";
      if (!bad && email && !validEmail(v)) { bad = true; msg = "enter a valid email"; }
      if (!bad && key === "eventTime" && v && v < nowLocalMin()) { bad = true; msg = "choose a future date"; }
      if (bad) errs.push({ key, label, msg });
    });
    setErrors(errs);
    if (errs.length) { requestAnimationFrame(() => errSummaryRef.current?.focus()); }
    return errs.length === 0;
  };

  const sendViaBackend = async (data: EventData): Promise<void> => {
    await sendSiteMail({
      inbox: MAIL_INBOX,
      subject: "Speaking Engagement Invitation — " + data.eventTheme,
      replyTo: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      message: buildSummary(data),
      fields: {
        "First name": data.firstName,
        "Last name": data.lastName,
        Organisation: data.organisation,
        Email: data.email,
        Phone: data.phone,
        Website: data.website,
        "Social media": data.socialMedia,
        "Event theme": data.eventTheme,
        "Nature of event": data.natureOfEvent,
        "Event time": data.eventTime,
        "Event country": data.eventCountry,
        "Event state": data.eventState,
        "Event address": data.eventAddress,
        "Additional info": data.additionalInfo,
      },
      honeypot,
    });
  };

  const showSuccess = (data: EventData) => {
    const ics = buildICS(data);
    if (ics) { const blob = new Blob([ics], { type: "text/calendar" }); setIcsUrl(URL.createObjectURL(blob)); }
    else setIcsUrl(null);
    setSuccess(true);
    setFormMsg("");
  };

  const submit = async () => {
    setFormMsg("");
    if (honeypot) { showSuccess(form); return; } // bot trap
    if (!validate()) { setFormMsg("Kindly correct the highlighted fields to proceed."); return; }
    setBusy(true); setFormMsg("Sending your invitation...");
    try {
      await sendViaBackend(form);
      setBusy(false);
      setFormMsg("");
      showSuccess(form);
    } catch {
      setBusy(false);
      setFormMsg("We could not send it just now. Kindly try again, or email us at " + ENGAGEMENT_EMAIL + ".");
    }
  };

  const sendAnother = () => {
    setSuccess(false); setForm(EMPTY); setErrors([]); setFormMsg("");
    if (icsUrl) { URL.revokeObjectURL(icsUrl); setIcsUrl(null); }
  };

  const goPanel = (name: typeof panel) => {
    setPanel(name);
    if (name !== "appointments") setApMsg("");
    if (isBrowser()) window.scrollTo({ top: document.getElementById("booking")?.offsetTop || 0, behavior: "smooth" });
  };

  useEffect(() => () => { if (icsUrl) URL.revokeObjectURL(icsUrl); }, [icsUrl]);
  const hasErr = (k: string) => errors.some((e) => e.key === k);
  const localMin = nowLocalMin();

  return (
    <Wrap className="eemodiae-page ee-base-18">
      <Head>
        <title>Bookings | eemodiae.org</title>
        <meta name="description" content="Book an appointment for counselling or prayer, or invite Pastor Emmanuel I. Emodiae to your seminar, conference, or church program." />
      </Head>
      <Nav />

      <a className="skip-link" href="#booking">Skip to booking</a>
      <div className="visually-hidden" role="status" aria-live="polite" />

      <header className="hero">
        <img src={BOOKINGS_HERO} alt="Bookings. Commit thy way unto the LORD; trust also in him, and he shall bring it to pass. Psalm 37:5 KJV." />
        <div className="hero-particles" aria-hidden="true" ref={heroParticlesRef} />
      </header>

      <main className="section" id="booking" aria-labelledby="booking-title">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Bookings</p>
            <h1 className="section-title" id="booking-title">Schedule. Connect. Experience.</h1>
            <svg className="stroke-divider" viewBox="0 0 300 22" fill="none" aria-hidden="true"><path d="M6 12 C 80 4, 220 4, 294 10" stroke="#D39B2A" strokeWidth="5" strokeLinecap="round" opacity=".8" /></svg>
            <p className="scripture">Commit thy works unto the LORD, and thy thoughts shall be established.<cite>Proverbs 16:3 KJV</cite></p>
          </div>

          {/* CHOICE */}
          <div className={"panel" + (panel === "choice" ? " is-open" : "")} data-panel="choice">
            <div className="choice-stage">
              <button className="pick-card reveal" type="button" onClick={() => goPanel("appointments")} aria-label="Book an appointment for counselling or prayer">
                <span className="pick-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /><circle cx="16.5" cy="15" r="3.4" /><path d="M16.5 13.4v1.6l1 1" /></svg></span>
                <span className="pick-title">Appointments</span>
                <span className="pick-desc">Book a one-on-one time for counselling or prayer, online or in person. Choose the slot that suits you.</span>
                <span className="pick-cta">Book a time<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              </button>
              <button className="pick-card reveal" type="button" onClick={() => goPanel("engagement")} aria-label="Invite to a speaking engagement">
                <span className="pick-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></svg></span>
                <span className="pick-title">Speaking Engagement</span>
                <span className="pick-desc">Invite Pastor Emmanuel I. Emodiae to your seminar, conference, or church program. Share your event details.</span>
                <span className="pick-cta">Send an invitation<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              </button>
            </div>
          </div>

          {/* APPOINTMENTS */}
          <div className={"panel" + (panel === "appointments" ? " is-open" : "")} data-panel="appointments" tabIndex={-1}>
            <div className="flow">
              <div className="desk-body">
                <button className="back-btn" type="button" onClick={() => goPanel("choice")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg> Back</button>
                <h2 className="desk-title">Book Your Appointment</h2>
                <p className="desk-sub">For counselling or prayer. Tell us a little, choose how you would like to meet, then pick a time that works for you.</p>
                <div className="form-grid" style={{ marginTop: "1.6rem" }}>
                  <div className="field">
                    <label htmlFor="ap-reason">What is this about? <span className="req">*</span></label>
                    <select id="ap-reason" value={apReason} onChange={(e) => setApReason(e.target.value)} required>
                      <option value="" disabled>Select</option>
                      <option>Counselling</option><option>Prayer</option><option>Both counselling and prayer</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="ap-name">Your Name <span className="req">*</span></label>
                    <input id="ap-name" type="text" autoComplete="name" value={apName} onChange={(e) => setApName(e.target.value)} required />
                  </div>
                  <div className="field col-2">
                    <label htmlFor="ap-notes">Anything you would like us to know <span className="tz-hint">(optional, kept confidential)</span></label>
                    <textarea id="ap-notes" value={apNotes} onChange={(e) => setApNotes(e.target.value)} placeholder="A sentence or two helps us prepare to serve you well." style={{ minHeight: 90 }} />
                  </div>
                </div>
                <p className="desk-sub" style={{ marginTop: "1.6rem", fontWeight: 500, color: "var(--chocolate)" }}>How would you like to meet?</p>
                <div className="type-row" role="group" aria-label="Select appointment type">
                  <button
                    className={"type-btn" + (apType === "online" ? " is-active" : "")}
                    type="button"
                    aria-pressed={apType === "online"}
                    onClick={() => { setApType("online"); setApMsg(""); }}
                  >
                    <svg className="t-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="12" rx="2" /><path d="M17.5 9l4-2.5v11L17.5 15" /></svg>
                    <span className="t-name">Online</span>
                    <span className="t-note">Meet by video call from anywhere in the world.</span>
                  </button>
                  <button
                    className="type-btn is-disabled"
                    type="button"
                    disabled
                    aria-disabled="true"
                    title="Not available for now"
                  >
                    <svg className="t-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
                    <span className="t-name">Offline <span className="t-soon">Coming soon</span></span>
                    <span className="t-note">Not available for now. In-person appointments will open later.</span>
                  </button>
                </div>
                <div className="form-actions" style={{ marginTop: "1.6rem" }}>
                  <button
                    className="btn-primary"
                    type="button"
                    disabled={!apReason.trim() || !apName.trim() || apType !== "online"}
                    onClick={openCalendly}
                  >
                    <span className="btn-label">Continue to Calendly</span>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                  <p className={"form-msg" + (apMsg.startsWith("Calendly opened") ? " ok" : "")} role="status" aria-live="polite">{apMsg}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ENGAGEMENT */}
          <div className={"panel" + (panel === "engagement" ? " is-open" : "")} data-panel="engagement" tabIndex={-1}>
            <div className="flow">
              <div className="desk-body">
                <button className="back-btn" type="button" onClick={() => goPanel("choice")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg> Back</button>

                {!success ? (
                  <>
                    <h2 className="desk-title">Speaking Engagement</h2>
                    <p className="desk-sub">Share your event details and our team will be in touch. Fields marked <span style={{ color: "var(--gold-metal)" }}>*</span> are required.</p>
                    <div className="form-grid">
                      <div className={"error-summary" + (errors.length ? " is-open" : "")} ref={errSummaryRef} tabIndex={-1} role="alert">
                        <h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>Please check the fields below</h4>
                        <ul>{errors.map((e) => <li key={e.key}><a href={"#ef-" + e.key} onClick={(ev) => { ev.preventDefault(); document.getElementById("ef-" + e.key)?.focus(); }}>{e.label} {e.msg}</a></li>)}</ul>
                      </div>
                      <div className="hp-field" aria-hidden="true">
                        <label htmlFor="ef-company">Company (leave blank)</label>
                        <input id="ef-company" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                      </div>
                      <EngField k="firstName" label="First Name" req autoComplete="given-name" value={form.firstName} error={hasErr("firstName")} onChange={(v) => set("firstName", v)} />
                      <EngField k="lastName" label="Last Name" req autoComplete="family-name" value={form.lastName} error={hasErr("lastName")} onChange={(v) => set("lastName", v)} />
                      <EngField k="organisation" label="Name of Organisation" req col2 autoComplete="organization" value={form.organisation} error={hasErr("organisation")} onChange={(v) => set("organisation", v)} />
                      <div className={"field" + (hasErr("email") ? " field-error" : "")}>
                        <label htmlFor="ef-email">Email <span className="req">*</span></label>
                        <input id="ef-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                        <span className="field-hint">We will reply to this address.</span>
                      </div>
                      <EngField k="phone" label="Phone Number" req type="tel" autoComplete="tel" value={form.phone} error={hasErr("phone")} onChange={(v) => set("phone", v)} />
                      <EngField k="website" label="Website" col2 type="url" autoComplete="url" value={form.website} error={hasErr("website")} onChange={(v) => set("website", v)} />
                      <EngField k="socialMedia" label="Social Media Page" req col2 value={form.socialMedia} error={hasErr("socialMedia")} onChange={(v) => set("socialMedia", v)} />
                      <EngField k="eventTheme" label="Event Name or Theme" req col2 value={form.eventTheme} error={hasErr("eventTheme")} onChange={(v) => set("eventTheme", v)} />
                      <div className={"field" + (hasErr("natureOfEvent") ? " field-error" : "")}>
                        <label htmlFor="ef-natureOfEvent">Nature of Event <span className="req">*</span></label>
                        <select id="ef-natureOfEvent" value={form.natureOfEvent} onChange={(e) => set("natureOfEvent", e.target.value)}>
                          <option value="" disabled>Select</option>
                          <option>Seminar</option><option>Conference</option><option>Church Program</option><option>Convention</option><option>Workshop / Training</option><option>Crusade / Outreach</option><option>Other</option>
                        </select>
                      </div>
                      <div className={"field" + (hasErr("eventTime") ? " field-error" : "")}>
                        <label htmlFor="ef-eventTime">Event Date &amp; Time <span className="req">*</span></label>
                        <input id="ef-eventTime" type="datetime-local" min={localMin} value={form.eventTime} onChange={(e) => set("eventTime", e.target.value)} />
                        <span className="tz-hint">Your local time zone.</span>
                      </div>
                      <div className={"field" + (hasErr("eventCountry") ? " field-error" : "")}>
                        <label htmlFor="ef-eventCountry">Event Country <span className="req">*</span></label>
                        <input id="ef-eventCountry" type="text" autoComplete="country-name" list="country-list" value={form.eventCountry} onChange={(e) => set("eventCountry", e.target.value)} />
                        <datalist id="country-list">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
                      </div>
                      <EngField k="eventState" label="Event State" req value={form.eventState} error={hasErr("eventState")} onChange={(v) => set("eventState", v)} />
                      <EngField k="eventAddress" label="Event Address" req value={form.eventAddress} error={hasErr("eventAddress")} onChange={(v) => set("eventAddress", v)} />
                      <EngField k="additionalInfo" label="Additional Information about Event" col2 type="textarea" hint="Audience size, dates, agenda, or anything else we should know." value={form.additionalInfo} error={hasErr("additionalInfo")} onChange={(v) => set("additionalInfo", v)} />
                      <div className="next-steps"><strong>What happens next:</strong> our team reviews your invitation and replies to your email, usually within 3 to 5 working days. You will receive an acknowledgement shortly after you submit.</div>
                      <div className="form-actions">
                        <button className="btn-primary" type="button" disabled={busy} onClick={submit}>
                          <span className="btn-label">{busy ? "Sending..." : "Submit Invitation"}</span>
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
                        </button>
                        <p className={"form-msg" + (formMsg && formMsg.startsWith("Sending") ? " ok" : "")} role="status" aria-live="polite">{formMsg}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="success" tabIndex={-1}>
                    <div className="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg></div>
                    <h3>Invitation Received</h3>
                    <p>Thank you. Your event details have been sent, and our team will reach out to you soon.</p>
                    {icsUrl && <a className="ics-link" href={icsUrl} download="eemodiae-event.ics"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /><path d="M9 14l2 2 4-4" /></svg>Add event to my calendar</a>}
                    <div style={{ marginTop: "1.8rem" }}><button className="btn-primary" type="button" onClick={sendAnother}>Send Another</button></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </Wrap>
  );
};

export default BookingsPage;
