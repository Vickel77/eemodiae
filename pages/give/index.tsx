import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";

/* ============================================================
   eemodiae.org — GIVE  (redesign port)
   Two giving desks (Ministry + Prophet), each offering card
   giving via Paystack and verified bank-transfer accounts with
   copy-to-clipboard. Ported 1:1 from the redesign. Self-contained:
   no CMS. Set PAYSTACK_PUBLIC_KEY and accounts in CONFIG below.
   ============================================================ */

/* ---- CONFIG (edit accounts, currencies, and keys here only) ---- */
const PAYSTACK_PUBLIC_KEY = ""; // paste the ministry's live public key

type Currency = { code: string; label: string; symbol: string; presets: number[] };
const CURRENCIES: Currency[] = [
  { code: "NGN", label: "Nigerian Naira", symbol: "\u20A6", presets: [5000, 10000, 25000, 50000] },
  { code: "USD", label: "US Dollar", symbol: "$", presets: [10, 25, 50, 100] },
  { code: "GHS", label: "Ghanaian Cedi", symbol: "GH\u20B5", presets: [50, 100, 250, 500] },
  { code: "ZAR", label: "South African Rand", symbol: "R", presets: [100, 250, 500, 1000] },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh", presets: [500, 1000, 2500, 5000] },
];
const RECURRING_PLANS: Record<string, string> = { NGN: "", USD: "", GHS: "", ZAR: "", KES: "" };

type Desk = { swift: string; sort: string; accounts: { currency: string; number: string; bank: string }[] };
const MINISTRY_DESK: Desk = {
  swift: "GTBINGLA", sort: "058083273",
  accounts: [
    { currency: "Naira", number: "0532205655", bank: "Guaranty Trust Bank" },
    { currency: "Dollar", number: "0532205662", bank: "Guaranty Trust Bank" },
    { currency: "Pound", number: "0532205239", bank: "Guaranty Trust Bank" },
    { currency: "Euro", number: "0532205246", bank: "Guaranty Trust Bank" },
  ],
};
const PROPHET_DESK: Desk = {
  swift: "ZEIBNGLA", sort: "057080219",
  accounts: [
    { currency: "Naira", number: "2407117008", bank: "Zenith" },
    { currency: "Dollar", number: "5073513947", bank: "Zenith" },
    { currency: "Pound", number: "5061142766", bank: "Zenith" },
    { currency: "Euro", number: "5080920886", bank: "Zenith" },
  ],
};

const GIVE_HERO = "/redesign/give-hero.jpg";
const isBrowser = () => typeof window !== "undefined";
const formatNumber = (n: number) => Number(n).toLocaleString("en-US");
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

type PanelName = "choice" | "paystack" | "transfer";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

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
:focus-visible{outline:3px solid var(--gold-rich);outline-offset:3px;border-radius:4px}
.visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip-link{position:absolute;left:-999px;top:0;background:var(--chocolate);color:var(--ivory);padding:.7rem 1.2rem;z-index:200;border-radius:0 0 12px 0;font-weight:500;text-decoration:none}
.skip-link:focus{left:0}
.wrap{width:min(1120px,92%);margin-inline:auto}

/* ---------- Hero: the artwork, full bleed, never cropped ---------- */
.hero{width:100%;display:block;position:relative;overflow:hidden}
.hero img{width:100%;height:auto;aspect-ratio:768/305;object-fit:cover;display:block}
.hero-particles{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}

/* Layer 1: dust motes. Outer span rises, inner span sways, so the
   path is a gentle S-curve instead of a straight line. */
.hp-rise{position:absolute;bottom:-14px;will-change:transform,opacity;animation:hp-rise linear infinite;opacity:0}
.hp-sway{display:block;animation:hp-sway ease-in-out infinite alternate;will-change:transform}
.hp-dust{
  display:block;border-radius:50%;
  background:radial-gradient(circle,#FFF3D0 0%,rgba(240,196,106,.9) 38%,rgba(240,196,106,0) 70%);
  filter:blur(.4px);
}
.hp-dust.hp-soft{filter:blur(1.6px);opacity:.8}

/* Layer 2: rising sparks. Same rise+sway carriage, but the core
   pulses as it climbs, like an ember catching light. */
.hp-spark{
  display:block;border-radius:50%;
  background:radial-gradient(circle,#FFFDF4 0%,#FFE9B8 30%,rgba(231,179,90,.75) 55%,rgba(231,179,90,0) 75%);
  animation:hp-pulse ease-in-out infinite;will-change:transform,opacity;
}

/* Layer 3: star glints. Fixed positions scattered over the artwork,
   shimmering in and out like glitter catching sunlight. Four-point
   star drawn with two crossed bars plus a bright core. */
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

/* ---------- Ways to give ---------- */
.section{padding:5.6rem 0 6.4rem}
.section-head{text-align:center;max-width:64ch;margin-inline:auto}
.eyebrow{font-weight:500;letter-spacing:.36em;text-transform:uppercase;font-size:.78rem;color:var(--gold-metal)}
.section-title{
  font-family:var(--font-display);font-weight:600;color:var(--chocolate);
  font-size:clamp(1.9rem,4.4vw,2.9rem);line-height:1.22;margin-top:.8rem;letter-spacing:.03em;
}
.section-lede{color:var(--coffee);margin-top:1.15rem;font-size:1.04rem}
.stroke-divider{width:170px;margin:1.4rem auto 0;display:block}

.give-stage{margin-top:3.6rem;display:grid;gap:3.6rem}
.desk{position:relative;max-width:760px;width:100%;margin-inline:auto}
.desk-banner{
  position:relative;z-index:2;width:max-content;max-width:92%;margin:0 auto -1.65rem;
  font-family:var(--font-display);font-weight:600;letter-spacing:.08em;
  font-size:clamp(1.15rem,2.6vw,1.5rem);color:#FFF6E6;text-align:center;
  background:linear-gradient(150deg,var(--gold-rich) 0%,var(--gold-metal) 55%,#8F5F16 100%);
  padding:.85rem 2.6rem;border-radius:999px;
  box-shadow:0 14px 30px rgba(107,66,15,.35);
}
.desk-body{
  background:var(--ivory);border-radius:28px;border:1px solid rgba(184,139,104,.3);
  box-shadow:var(--shadow-lift);padding:3.1rem 2.4rem 2.5rem;position:relative;overflow:hidden;
}
.desk-&::before{
  content:"";position:absolute;inset:0 0 auto 0;height:5px;
  background:linear-gradient(90deg,transparent,var(--gold-honey),var(--gold-metal),var(--gold-honey),transparent);
  opacity:.55;
}
.desk-note{text-align:center;color:var(--warmgray);font-size:.92rem;margin-top:1.1rem}
.panel{display:none;animation:panelIn .5s var(--ease)}
.panel.is-open{display:block}
@keyframes panelIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.choice-row{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.chip-btn{
  display:inline-flex;align-items:center;gap:.6rem;
  font-weight:500;letter-spacing:.14em;text-transform:uppercase;font-size:.84rem;color:var(--chocolate);
  background:var(--cream);border:1px solid rgba(184,139,104,.42);border-radius:999px;
  padding:.95rem 1.9rem;box-shadow:0 8px 20px rgba(75,47,35,.10);
  transition:transform .35s var(--ease),box-shadow .35s var(--ease),border-color .35s var(--ease),background .35s var(--ease);
}
.chip-btn svg{width:19px;height:19px;color:var(--gold-metal)}
.chip-btn:hover{transform:translateY(-3px);border-color:var(--gold-rich);background:#FBF1E2;box-shadow:0 14px 28px rgba(107,66,15,.2)}
.back-btn{
  display:inline-flex;align-items:center;gap:.5rem;background:none;border:0;
  color:var(--coffee);font-weight:500;letter-spacing:.1em;text-transform:uppercase;font-size:.8rem;
  padding:.4rem .6rem .4rem 0;margin-bottom:1.4rem;border-radius:8px;
  transition:color .3s var(--ease),transform .3s var(--ease);
}
.back-btn svg{width:16px;height:16px}
.back-btn:hover{color:var(--gold-metal);transform:translateX(-3px)}

/* ---------- Accounts ---------- */
.acct-list{display:grid;gap:1.45rem}
.acct{
  display:flex;flex-direction:column;gap:.7rem;
  padding:1.15rem 1.3rem;border-radius:18px;background:#FFFDFA;
  border:1px solid rgba(184,139,104,.26);
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease);
}
.acct:hover{border-color:var(--gold-honey);box-shadow:0 10px 24px rgba(107,66,15,.12)}
.acct-top{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.acct-cur{
  display:inline-block;font-size:.72rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;
  color:var(--gold-metal);border:1px solid rgba(211,155,42,.55);border-radius:999px;
  padding:.14rem .7rem;margin-bottom:.45rem;background:rgba(240,196,106,.14);
}
.acct-num{
  font-family:var(--font-display);font-weight:600;font-size:clamp(1.35rem,3.6vw,1.8rem);
  letter-spacing:.06em;color:var(--chocolate);line-height:1.15;
}
.acct-bank{color:var(--warmgray);font-size:.9rem;letter-spacing:.06em;margin-top:.2rem}
.acct-actions{display:flex;gap:.6rem;flex:none}
.copy-btn{
  flex:none;display:grid;place-items:center;width:46px;height:46px;border-radius:14px;
  background:rgba(240,196,106,.16);border:1px solid rgba(211,155,42,.42);color:var(--gold-metal);
  transition:background .3s var(--ease),transform .3s var(--ease),color .3s var(--ease);
  position:relative;
}
.copy-btn svg{width:20px;height:20px}
.copy-btn:hover{background:rgba(240,196,106,.36);transform:translateY(-2px)}
.copy-btn.copied{background:var(--gold-metal);border-color:var(--gold-metal);color:#FFF6E6}
.copy-toast{
  position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);
  background:var(--chocolate);color:var(--ivory);font-size:.72rem;letter-spacing:.08em;
  padding:.3rem .7rem;border-radius:8px;white-space:nowrap;opacity:0;pointer-events:none;
  transition:opacity .3s var(--ease),transform .3s var(--ease);
}
.copied .copy-toast{opacity:1;transform:translateX(-50%) translateY(0)}
.acct-codes{
  margin-top:.4rem;padding-top:1.3rem;border-top:1px dashed rgba(184,139,104,.5);
  color:var(--coffee);font-size:.98rem;display:grid;gap:.3rem;
}
.acct-codes b{color:var(--chocolate);letter-spacing:.08em}

/* ---------- Form ---------- */
.pay-form{display:grid;gap:1.15rem;max-width:520px;margin-inline:auto}
.field label{display:block;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:500;color:var(--coffee);margin-bottom:.45rem}
.field input,.field select{
  width:100%;font-family:var(--font-body);font-size:1.05rem;color:var(--chocolate);
  background:#FFFDFA;border:1px solid rgba(184,139,104,.4);border-radius:14px;
  padding:.95rem 1.15rem;transition:border-color .3s var(--ease),box-shadow .3s var(--ease);
}
.field select{
  appearance:none;-webkit-appearance:none;cursor:pointer;
  background-image:url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236C4A38' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 1rem center;background-size:18px;
}
.field input::placeholder{color:var(--warmgray)}
.field input:focus,.field select:focus{outline:none;border-color:var(--gold-rich);box-shadow:0 0 0 4px rgba(211,155,42,.18)}
.field.field-error input,.field.field-error select{border-color:var(--error);box-shadow:0 0 0 3px rgba(176,64,44,.14)}
.form-msg{text-align:center;font-size:.92rem;font-weight:500;color:var(--error);min-height:1.4em;letter-spacing:.03em}
.form-msg.ok{color:#4E6B3A}

.freq-field{text-align:center}
.freq-toggle{display:inline-flex;border:1px solid rgba(184,139,104,.42);border-radius:999px;padding:.25rem;gap:.25rem}
.freq-btn{border:0;background:none;padding:.6rem 1.35rem;border-radius:999px;font-size:.82rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--coffee);transition:background .3s var(--ease),color .3s var(--ease)}
.freq-btn[aria-pressed="true"]{background:linear-gradient(150deg,var(--gold-honey),var(--gold-metal));color:#FFF6E6}

.secure-note{display:flex;align-items:center;justify-content:center;gap:.4rem;color:var(--warmgray);font-size:.78rem;letter-spacing:.06em}
.secure-note svg{width:14px;height:14px;color:var(--gold-metal);flex:none}

.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.55rem;
  font-weight:500;letter-spacing:.12em;text-transform:uppercase;font-size:.86rem;
  text-decoration:none;border-radius:999px;padding:.95rem 2.8rem;border:1px solid transparent;
  color:#3A2312;
  background:linear-gradient(150deg,#F5D389 0%,var(--gold-honey) 30%,var(--gold-rich) 68%,var(--gold-metal) 100%);
  box-shadow:0 14px 32px rgba(107,66,15,.38);
  transition:transform .35s var(--ease),box-shadow .35s var(--ease);
  position:relative;overflow:hidden;
}
.btn::after{
  content:"";position:absolute;inset:0;
  background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.5) 48%,transparent 62%);
  transform:translateX(-130%);transition:transform .8s var(--ease);
}
.btn:hover{transform:translateY(-3px);box-shadow:0 20px 42px rgba(107,66,15,.46)}
.btn:hover::after{transform:translateX(130%)}
.pay-form .btn{justify-self:center}

/* ---------- Success ---------- */
.pay-success{text-align:center;padding:.6rem 0 .2rem}
.success-check{
  display:grid;place-items:center;width:64px;height:64px;border-radius:50%;margin:0 auto 1.2rem;
  background:linear-gradient(150deg,var(--gold-honey),var(--gold-metal));color:#FFF6E6;
  box-shadow:0 10px 24px rgba(107,66,15,.3);
}
.success-check svg{width:30px;height:30px}
.pay-success h3{font-family:var(--font-serif);font-weight:600;font-size:1.55rem;color:var(--chocolate)}
.pay-success p{color:var(--coffee);margin-top:.65rem;font-size:1.02rem}
.success-verse{font-style:italic;font-family:var(--font-serif);color:var(--chocolate);margin-top:1.15rem!important;max-width:38ch;margin-inline:auto}
.success-cite{
  display:block;font-style:normal;margin-top:.5rem;letter-spacing:.2em;text-transform:uppercase;
  font-size:.74rem;color:var(--gold-metal);font-weight:500;
}
.pay-success .btn{margin-top:1.7rem;padding:.85rem 2.3rem}

.reveal{opacity:0;transform:translateY(26px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.reveal.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}}
@media (max-width:640px){
  .section{padding:3.8rem 0 4.6rem}
  .desk-body{padding:2.6rem 1.25rem 2rem}
  .acct-actions{width:100%;justify-content:flex-end}
}

  /* preset amount chips (enhancement using config presets) */
  .preset-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .preset-chip{font-family:'Cinzel',serif;font-size:.72rem;letter-spacing:.04em;padding:8px 14px;border-radius:999px;border:1px solid var(--line,rgba(201,162,75,.3));background:transparent;color:var(--chocolate,#2c2013);cursor:pointer;transition:background .2s,border-color .2s,color .2s}
  .preset-chip:hover{background:linear-gradient(135deg,var(--gold-metal,#c9a24b),var(--gold-soft,#b8923f));border-color:transparent;color:#fff}

`;

let paystackLoading: Promise<void> | null = null;
function loadPaystack(): Promise<void> {
  if (isBrowser() && window.PaystackPop) return Promise.resolve();
  if (paystackLoading) return paystackLoading;
  paystackLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("paystack"));
    document.head.appendChild(s);
  });
  return paystackLoading;
}

const CopyBtn = ({ value, label, onCopied }: { value: string; label: string; onCopied: () => void }) => {
  const [copied, setCopied] = useState(false);
  const t = useRef<number | undefined>(undefined);
  const doCopy = () => {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = value; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    };
    if (isBrowser() && navigator.clipboard?.writeText) navigator.clipboard.writeText(value).catch(fallback);
    else fallback();
    setCopied(true); onCopied();
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button className={"copy-btn" + (copied ? " copied" : "")} type="button" aria-label={label} onClick={doCopy}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
      <span className="copy-toast">Copied</span>
    </button>
  );
};

function GiveDesk({ id, banner, desk, announce }: { id: string; banner: string; desk: Desk; announce: (t: string) => void }) {
  const [panel, setPanel] = useState<PanelName>("choice");
  const [email, setEmail] = useState("");
  const [freq, setFreq] = useState<"once" | "monthly">("once");
  const [currency, setCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [designation, setDesignation] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [amountErr, setAmountErr] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(false);
  const [success, setSuccess] = useState<{ symbol: string; amount: number; freq: string } | null>(null);
  const paystackPanelRef = useRef<HTMLDivElement>(null);

  const cur = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const openPanel = (p: PanelName) => {
    setPanel(p);
    if (p === "paystack") requestAnimationFrame(() => paystackPanelRef.current?.focus({ preventScroll: true }));
  };

  const pay = () => {
    setMsg(""); setMsgOk(false); setEmailErr(false); setAmountErr(false);
    const amt = parseFloat(amount);
    let bad = false;
    if (!email || !validEmail(email)) { setEmailErr(true); bad = true; }
    if (!amt || amt <= 0) { setAmountErr(true); bad = true; }
    if (bad) { setMsg("Kindly fill out all fields correctly to proceed"); return; }
    if (!PAYSTACK_PUBLIC_KEY) { setMsg("Card giving is being set up. Kindly give by bank transfer for now."); return; }

    const planCode = freq === "monthly" ? (RECURRING_PLANS[currency] || "") : "";
    setMsg("Opening secure payment..."); setMsgOk(true);
    loadPaystack().then(() => {
      const opts: any = {
        key: PAYSTACK_PUBLIC_KEY, email, amount: Math.round(amt * 100), currency,
        metadata: { custom_fields: [
          { display_name: "Designation", variable_name: "designation", value: designation || "General" },
          { display_name: "Frequency", variable_name: "frequency", value: freq === "monthly" ? "Monthly" : "One-Time" },
        ] },
        onClose: () => { setMsgOk(false); setMsg(""); },
        callback: () => { setMsg(""); setSuccess({ symbol: cur.symbol, amount: amt, freq }); announce("Payment received. Thank you for giving."); },
      };
      if (planCode) opts.plan = planCode;
      const pop = window.PaystackPop;
      if (!pop) {
        setMsgOk(false);
        setMsg("Unable to reach the payment service. Kindly try again or give by transfer.");
        return;
      }
      const handler = pop.setup(opts);
      handler.openIframe();
    }).catch(() => { setMsgOk(false); setMsg("Unable to reach the payment service. Kindly try again or give by transfer."); });
  };

  const giveAgain = () => { setSuccess(null); setEmail(""); setAmount(""); setDesignation(""); setFreq("once"); };

  return (
    <article className="desk reveal in" id={id}>
      <h2 className="desk-banner">{banner}</h2>
      <div className="desk-body">
        {/* CHOICE */}
        <div className={"panel" + (panel === "choice" ? " is-open" : "")} data-panel="choice">
          <div className="choice-row">
            {/* <button className="chip-btn" type="button" onClick={() => openPanel("paystack")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /></svg>
              Paystack
            </button> */}
            <button className="chip-btn" type="button" onClick={() => openPanel("transfer")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h14M14 6l6 6-6 6" /></svg>
              Give With Transfer
            </button>
          </div>
          <p className="desk-note">Card giving is powered by Paystack. Transfers show our verified accounts.</p>
        </div>

        {/* PAYSTACK */}
        <div className={"panel" + (panel === "paystack" ? " is-open" : "")} data-panel="paystack" tabIndex={-1} ref={paystackPanelRef}>
          <button className="back-btn" type="button" onClick={() => openPanel("choice")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg> Back
          </button>

          {!success ? (
            <div className="pay-form">
              <div className={"field" + (emailErr ? " field-error" : "")}>
                <label htmlFor={id + "-email"}>Email</label>
                <input type="email" id={id + "-email"} placeholder="you@example.com" autoComplete="email" inputMode="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailErr(false); }} />
              </div>
              <div className="field freq-field">
                <label id={id + "-freq-label"}>Give</label>
                <div className="freq-toggle" role="group" aria-labelledby={id + "-freq-label"}>
                  <button type="button" className="freq-btn" data-freq="once" aria-pressed={freq === "once"} onClick={() => setFreq("once")}>One-Time</button>
                  <button type="button" className="freq-btn" data-freq="monthly" aria-pressed={freq === "monthly"} onClick={() => setFreq("monthly")}>Monthly</button>
                </div>
              </div>
              <div className="field">
                <label htmlFor={id + "-currency"}>Currency</label>
                <select id={id + "-currency"} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} ({c.label})</option>)}
                </select>
              </div>
              <div className={"field" + (amountErr ? " field-error" : "")}>
                <label htmlFor={id + "-amount"}>Amount ({cur.code})</label>
                <input type="number" id={id + "-amount"} placeholder="Enter amount" min={1} inputMode="numeric" value={amount} onChange={(e) => { setAmount(e.target.value); setAmountErr(false); }} />
                <div className="preset-row">
                  {cur.presets.map((p) => (
                    <button key={p} type="button" className="preset-chip" onClick={() => setAmount(String(p))}>{cur.symbol}{formatNumber(p)}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor={id + "-designation"}>Designation (optional)</label>
                <select id={id + "-designation"} value={designation} onChange={(e) => setDesignation(e.target.value)}>
                  <option value="">General</option><option>Tithe</option><option>Offering</option><option>Missions</option><option>Building Project</option><option>Seed</option>
                </select>
              </div>
              <p className={"form-msg" + (msgOk ? " ok" : "")} role="status" aria-live="polite">{msg}</p>
              <p className="secure-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="9" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                Secured by Paystack
              </p>
              <button className="btn" type="button" onClick={pay}>Give Now</button>
            </div>
          ) : (
            <div className="pay-success" role="status" aria-live="polite">
              <span className="success-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg></span>
              <h3>Received With Joy</h3>
              <p>Your {success.freq === "monthly" ? "monthly gift" : "gift"} of {success.symbol}{formatNumber(success.amount)} has been received.</p>
              <p className="success-verse">&ldquo;Every man according as he purposeth in his heart, so let him give&hellip; for God loveth a cheerful giver.&rdquo;<cite className="success-cite">2 Corinthians 9:7</cite></p>
              <button className="btn" type="button" onClick={giveAgain}>Give Again</button>
            </div>
          )}
        </div>

        {/* TRANSFER */}
        <div className={"panel" + (panel === "transfer" ? " is-open" : "")} data-panel="transfer" tabIndex={-1}>
          <button className="back-btn" type="button" onClick={() => openPanel("choice")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg> Back
          </button>
          <div className="acct-list">
            {desk.accounts.map((a) => (
              <div className="acct" key={a.currency}>
                <div className="acct-top">
                  <div><span className="acct-cur">{a.currency}</span><p className="acct-num">{a.number}</p><p className="acct-bank">{a.bank}</p></div>
                  <div className="acct-actions"><CopyBtn value={a.number} label={"Copy " + a.currency + " account number " + a.number} onCopied={() => announce("Account number copied to clipboard.")} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="acct-codes">
            <p>Swift code: <b>{desk.swift}</b></p>
            <p>Sort code: <b>{desk.sort}</b></p>
          </div>
        </div>
      </div>
    </article>
  );
}

const GivePage: NextPage = () => {
  const [announcement, setAnnouncement] = useState("");
  const announce = (t: string) => { setAnnouncement(""); requestAnimationFrame(() => setAnnouncement(t)); };

  useEffect(() => {
    if (!isBrowser() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <Wrap className="eemodiae-page ee-base-18">
      <Head>
        <title>Give | eemodiae.org</title>
        <meta name="description" content="Partner with the ministry of Emmanuel I. Emodiae. Give securely by card through Paystack, or by direct bank transfer, in multiple currencies." />
      </Head>
      <Nav />

      <div className="visually-hidden" id="sr-announcer" role="status" aria-live="polite">{announcement}</div>

      <header className="hero">
        <img src={GIVE_HERO} alt="Give. Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver. 2 Corinthians 9:7." />
      </header>

      <main className="section" id="ways-to-give" aria-labelledby="ways-title">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Ways To Give</p>
            <h1 className="section-title" id="ways-title">Choose How You Would Love To Sow</h1>
            <svg className="stroke-divider" viewBox="0 0 300 22" fill="none" aria-hidden="true"><path d="M6 12 C 80 4, 220 4, 294 10" stroke="#D39B2A" strokeWidth="5" strokeLinecap="round" opacity=".8" /></svg>
            <p className="section-lede">Give securely by card or by direct bank transfer. Every channel below goes straight to the ministry.</p>
          </div>
          <div className="give-stage">
            <GiveDesk id="ministry-desk" banner="Ministry Account" desk={MINISTRY_DESK} announce={announce} />
            <GiveDesk id="prophet-desk" banner="Prophet's Account" desk={PROPHET_DESK} announce={announce} />
          </div>
        </div>
      </main>

      <Footer />
    </Wrap>
  );
};

export default GivePage;
