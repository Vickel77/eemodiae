
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
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return paystackLoading;
}

function showSuccess(currencyCode, amount, freq){
  const cur = CURRENCIES.find(c => c.code === currencyCode) || { symbol: "" };
  const kind = freq === "monthly" ? "monthly gift" : "gift";
  $("#success-detail").textContent = "Your " + kind + " of " + cur.symbol + formatNumber(amount) + " has been received.";
  $("#ps-form-wrap").hidden = true;
  $("#ps-success").hidden = false;
  $("#ps-success").focus({ preventScroll: true });
  srAnnounce("Payment received. Thank you for giving.");
}

const giveAgainBtn = $("#give-again");
if (giveAgainBtn){
  giveAgainBtn.addEventListener("click", () => {
    $("#ps-success").hidden = true;
    $("#ps-form-wrap").hidden = false;
    $("#ps-email").value = "";
    amountInput.value = "";
    $("#ps-designation").value = "";
    freqButtons.forEach(x => x.setAttribute("aria-pressed", x.getAttribute("data-freq") === "once" ? "true" : "false"));
    frequency = "once";
    $("#ps-email").focus();
  });
}

const psPay = $("#ps-pay");
if (psPay){
  psPay.addEventListener("click", () => {
    const emailField  = $("#ps-email");
    const emailWrap    = emailField.closest(".field");
    const amountWrap   = amountInput.closest(".field");
    const msg = $("#ps-msg");
    msg.classList.remove("ok");
    clearFieldError(emailWrap);
    clearFieldError(amountWrap);

    const email  = emailField.value.trim();
    const amount = parseFloat(amountInput.value);
    let hasError = false;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setFieldError(emailWrap);
      hasError = true;
    }
    if (!amount || amount <= 0){
      setFieldError(amountWrap);
      hasError = true;
    }
    if (hasError){
      msg.textContent = "Kindly fill out all fields correctly to proceed";
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY){
      msg.textContent = "Card giving is being set up. Kindly give by bank transfer for now.";
      return;
    }

    const currencyCode = currencySel.value;
    const designation = $("#ps-designation").value;
    const planCode = frequency === "monthly" ? (RECURRING_PLANS[currencyCode] || "") : "";

    msg.textContent = "Opening secure payment...";
    msg.classList.add("ok");

    loadPaystack().then(() => {
      const setupOpts = {
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: Math.round(amount * 100),
        currency: currencyCode,
        metadata: {
          custom_fields: [
            { display_name: "Designation", variable_name: "designation", value: designation || "General" },
            { display_name: "Frequency", variable_name: "frequency", value: frequency === "monthly" ? "Monthly" : "One-Time" }
          ]
        },
        onClose: function(){ msg.classList.remove("ok"); msg.textContent = ""; },
        callback: function(){
          msg.textContent = "";
          showSuccess(currencyCode, amount, frequency);
        }
      };
      if (planCode) setupOpts.plan = planCode;
      const handler = window.PaystackPop.setup(setupOpts);
      handler.openIframe();
    }).catch(() => {
      msg.classList.remove("ok");
      msg.textContent = "Unable to reach the payment service. Kindly try again or give by transfer.";
    });
  });
}
})();



/* Hero gold-dust choreography. Three layers over the artwork:
   drifting dust motes, pulsing rising sparks, and shimmering star
   glints. Self-contained, respects reduced motion, and never
   touches the image itself. Density and drift are biased toward
   the right side, following the light streams in the artwork. */
(function(){
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var host = document.getElementById("hero-particles");
  if (!host) return;

  var frag = document.createDocumentFragment();
  function rand(min, max){ return min + Math.random() * (max - min); }

  /* Weighted horizontal position: about 60% of particles favour the
     right side of the artwork where its golden light flows. */
  function biasedLeft(){
    return Math.random() < 0.6 ? rand(52, 98) : rand(2, 52);
  }

  /* Layer 1: dust motes (slow, soft, ambient) */
  for (var i = 0; i < 12; i++){
    var rise = document.createElement("span");
    rise.className = "hp-rise";
    rise.style.left = biasedLeft() + "%";
    rise.style.setProperty("--h", rand(30, 46) + "vw");
    rise.style.setProperty("--o", rand(.45, .8).toFixed(2));
    rise.style.animationDuration = rand(11, 20).toFixed(1) + "s";
    rise.style.animationDelay = rand(0, 16).toFixed(1) + "s";

    var sway = document.createElement("span");
    sway.className = "hp-sway";
    sway.style.setProperty("--sw", rand(.5, 1.8).toFixed(2) + "vw");
    sway.style.animationDuration = rand(2.6, 4.8).toFixed(1) + "s";
    sway.style.animationDelay = (-rand(0, 4)).toFixed(1) + "s";

    var dust = document.createElement("span");
    dust.className = "hp-dust" + (Math.random() < .45 ? " hp-soft" : "");
    var d = rand(3, 8);
    dust.style.width = dust.style.height = d.toFixed(1) + "px";

    sway.appendChild(dust);
    rise.appendChild(sway);
    frag.appendChild(rise);
  }

  /* Layer 2: rising sparks (small, bright, pulsing) */
  for (var j = 0; j < 8; j++){
    var rise2 = document.createElement("span");
    rise2.className = "hp-rise";
    rise2.style.left = biasedLeft() + "%";
    rise2.style.setProperty("--h", rand(34, 48) + "vw");
    rise2.style.setProperty("--o", rand(.7, 1).toFixed(2));
    rise2.style.animationDuration = rand(8, 14).toFixed(1) + "s";
    rise2.style.animationDelay = rand(0, 14).toFixed(1) + "s";

    var sway2 = document.createElement("span");
    sway2.className = "hp-sway";
    sway2.style.setProperty("--sw", rand(.3, 1.1).toFixed(2) + "vw");
    sway2.style.animationDuration = rand(2, 3.8).toFixed(1) + "s";
    sway2.style.animationDelay = (-rand(0, 3)).toFixed(1) + "s";

    var spark = document.createElement("span");
    spark.className = "hp-spark";
    var s = rand(2.5, 5);
    spark.style.width = spark.style.height = s.toFixed(1) + "px";
    spark.style.animationDuration = rand(1.4, 2.6).toFixed(1) + "s";

    sway2.appendChild(spark);
    rise2.appendChild(sway2);
    frag.appendChild(rise2);
  }

  /* Layer 3: star glints (fixed shimmer points across the artwork,
     kept toward the edges and upper area so faces stay clear) */
  var glintSpots = [
    { x: rand(4, 16),  y: rand(12, 40) },
    { x: rand(18, 30), y: rand(52, 78) },
    { x: rand(44, 54), y: rand(10, 26) },
    { x: rand(58, 68), y: rand(58, 82) },
    { x: rand(84, 96), y: rand(10, 30) },
    { x: rand(88, 97), y: rand(48, 72) }
  ];
  glintSpots.forEach(function(spot){
    var g = document.createElement("span");
    g.className = "hp-glint";
    g.style.left = spot.x.toFixed(1) + "%";
    g.style.top = spot.y.toFixed(1) + "%";
    g.style.setProperty("--g", rand(14, 26).toFixed(0) + "px");
    g.style.setProperty("--o", rand(.55, .95).toFixed(2));
    g.style.animationDuration = rand(4.5, 8).toFixed(1) + "s";
    g.style.animationDelay = rand(0, 7).toFixed(1) + "s";
    g.appendChild(document.createElement("i"));
    frag.appendChild(g);
  });

  host.appendChild(frag);
})();
