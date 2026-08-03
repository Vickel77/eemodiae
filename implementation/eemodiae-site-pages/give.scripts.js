
{
  "@context": "https://schema.org",
  "@type": "DonateAction",
  "name": "Give to House of Joy Church Worldwide",
  "recipient": {
    "@type": "Organization",
    "name": "House of Joy Church Worldwide",
    "url": "https://eemodiae.org"
  },
  "url": "https://eemodiae.org/give.html"
}


// --- script boundary ---


/* ============================================================
   CONFIGURATION. Edit accounts, currencies, and keys here only.
   ============================================================ */

/* Paystack public key. Paste the ministry's live public key here. */
const PAYSTACK_PUBLIC_KEY = "";

/* Currencies offered on the card form. Only currencies enabled on
   the ministry's Paystack account will actually process. Presets
   are quick-tap amounts shown as chips, in that currency's units. */
const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira",        symbol: "\u20A6", presets: [5000, 10000, 25000, 50000] },
  { code: "USD", label: "US Dollar",              symbol: "$",      presets: [10, 25, 50, 100] },
  { code: "GHS", label: "Ghanaian Cedi",           symbol: "GH\u20B5", presets: [50, 100, 250, 500] },
  { code: "ZAR", label: "South African Rand",      symbol: "R",      presets: [100, 250, 500, 1000] },
  { code: "KES", label: "Kenyan Shilling",         symbol: "KSh",    presets: [500, 1000, 2500, 5000] }
];

/* Monthly giving plan codes, created in the Paystack dashboard.
   Leave a currency blank until a plan exists for it; monthly
   giving in that currency will still submit as a one-time gift
   and flag the intent in the transaction metadata instead. */
const RECURRING_PLANS = {
  NGN: "",
  USD: "",
  GHS: "",
  ZAR: "",
  KES: ""
};

const MINISTRY_DESK = {
  swift: "GTBINGLA",
  sort: "058083273",
  accounts: [
    { currency: "Naira",  number: "0532205655", bank: "Guaranty Trust Bank" },
    { currency: "Dollar", number: "0532205662", bank: "Guaranty Trust Bank" },
    { currency: "Pound",  number: "0532205239", bank: "Guaranty Trust Bank" },
    { currency: "Euro",   number: "0532205246", bank: "Guaranty Trust Bank" }
  ]
};

const PROPHET_DESK = {
  swift: "ZEIBNGLA",
  sort: "057080219",
  accounts: [
    { currency: "Naira",  number: "2407117008", bank: "Zenith" },
    { currency: "Dollar", number: "5073513947", bank: "Zenith" },
    { currency: "Pound",  number: "5061142766", bank: "Zenith" },
    { currency: "Euro",   number: "5080920886", bank: "Zenith" }
  ]
};

/* ============================================================
   ENGINE. No edits needed below this line.
   ============================================================ */
(function(){
"use strict";
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

function srAnnounce(text){
  const el = $("#sr-announcer");
  if (!el) return;
  el.textContent = "";
  requestAnimationFrame(() => { el.textContent = text; });
}
function formatNumber(n){ return Number(n).toLocaleString("en-US"); }
function setFieldError(fieldEl){ if (fieldEl) fieldEl.classList.add("field-error"); }
function clearFieldError(fieldEl){ if (fieldEl) fieldEl.classList.remove("field-error"); }

/* ---------- Reveal on scroll ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); revealIO.unobserve(e.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => revealIO.observe(el));

/* ---------- Panel switching ---------- */
$$(".desk").forEach(desk => {
  const panels = $$(".panel", desk);
  desk.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-open-panel]");
    if (!btn) return;
    const target = btn.getAttribute("data-open-panel");
    panels.forEach(p => p.classList.toggle("is-open", p.getAttribute("data-panel") === target));
    const opened = panels.find(p => p.getAttribute("data-panel") === target);
    if (opened && opened.hasAttribute("tabindex")) opened.focus({ preventScroll: true });
  });
});

/* ---------- Render account desks (accounts + swift/sort) ---------- */
const COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

function renderDesk(acctHostId, codesHostId, desk){
  const acctHost = document.getElementById(acctHostId);
  const codesHost = document.getElementById(codesHostId);
  if (!acctHost) return;
  desk.accounts.forEach(a => {
    const row = document.createElement("div");
    row.className = "acct";
    row.innerHTML =
      '<div class="acct-top">' +
        '<div><span class="acct-cur"></span><p class="acct-num"></p><p class="acct-bank"></p></div>' +
        '<div class="acct-actions">' +
          '<button class="copy-btn" type="button">' + COPY_ICON + '<span class="copy-toast">Copied</span></button>' +
        '</div>' +
      '</div>';

    row.querySelector(".acct-cur").textContent = a.currency;
    row.querySelector(".acct-num").textContent = a.number;
    row.querySelector(".acct-bank").textContent = a.bank;

    const singleBtn = row.querySelector(".copy-btn");
    singleBtn.setAttribute("data-copy", a.number);
    singleBtn.setAttribute("aria-label", "Copy " + a.currency + " account number " + a.number);

    acctHost.appendChild(row);
  });
  if (codesHost){
    codesHost.innerHTML = "";
    const p1 = document.createElement("p"); p1.innerHTML = "Swift code: <b>" + desk.swift + "</b>";
    const p2 = document.createElement("p"); p2.innerHTML = "Sort code: <b>" + desk.sort + "</b>";
    codesHost.appendChild(p1); codesHost.appendChild(p2);
  }
}
renderDesk("ministry-accts", "ministry-codes", MINISTRY_DESK);
renderDesk("prophet-accts", "prophet-codes", PROPHET_DESK);

/* ---------- Copy to clipboard ---------- */
function fallbackCopy(text){
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch(e){}
  document.body.removeChild(ta);
}
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".copy-btn");
  if (!btn) return;
  const text = btn.getAttribute("data-copy") || "";
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
  btn.classList.add("copied");
  clearTimeout(btn._t);
  btn._t = setTimeout(() => btn.classList.remove("copied"), 1600);
  srAnnounce("Account number copied to clipboard.");
});

/* ---------- Paystack card form ---------- */
const amountInput   = $("#ps-amount");
const amountLabel   = $("#ps-amount-label");
const currencySel   = $("#ps-currency");
const freqButtons   = $$(".freq-btn");
let frequency = "once";

CURRENCIES.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.code;
  opt.textContent = c.code + " (" + c.label + ")";
  currencySel.appendChild(opt);
});

function updateAmountLabel(){
  const cur = CURRENCIES.find(c => c.code === currencySel.value) || CURRENCIES[0];
  amountLabel.textContent = "Amount (" + cur.code + ")";
}
currencySel.addEventListener("change", updateAmountLabel);
updateAmountLabel();

amountInput.addEventListener("input", () => {
  clearFieldError(amountInput.closest(".field"));
});

freqButtons.forEach(b => {
  b.addEventListener("click", () => {
    freqButtons.forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
    frequency = b.getAttribute("data-freq");
  });
});

let paystackLoading = null;
function loadPaystack(){
  if (window.PaystackPop) return Promise.resolve();
  if (paystackLoading) return paystackLoading;
  paystackLoading = new Promise((resolve, reject) => {
    const s = d