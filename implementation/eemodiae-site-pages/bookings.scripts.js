
{
  "@context": "https://schema.org",
  "@type": "ReservationAction",
  "name": "Book with House of Joy Church Worldwide",
  "provider": {
    "@type": "Organization",
    "name": "House of Joy Church Worldwide",
    "url": "https://eemodiae.org"
  },
  "url": "https://eemodiae.org/bookings.html"
}


// --- script boundary ---


/* ============================================================
   EEMODIAE.ORG — Bookings
   CONFIG. Set the values below, then no edits are needed
   under the ENGINE line.
   ============================================================ */

/* --- 1. APPOINTMENTS (Calendly) ---------------------------------
   Paste your Calendly event-type URLs. Leave "" to show a graceful
   fallback for that type until it is set up. The reason and notes
   the visitor enters are passed to Calendly as prefill/answers. */
var CALENDLY_LINKS = {
  online:  "",   // e.g. "https://calendly.com/eemodiae/online-appointment"
  offline: ""    // e.g. "https://calendly.com/eemodiae/in-person-appointment"
};

/* --- 2. SPEAKING ENGAGEMENT DELIVERY ----------------------------
   A static HTML page cannot send email by itself. To capture every
   invitation and auto-reply to the sender, point BACKEND at a form
   service that delivers to eemodiaebookings@gmail.com. This page is
   built ready for any of the options below — set ONE and it works.

   Bookings inbox (shown to users, used by the email fallback): */
var ENGAGEMENT_EMAIL = "eemodiaebookings@gmail.com";

   /* Choose a provider by setting BACKEND.provider and its field(s).
      Until a provider is configured, the form falls back to opening
      the visitor's email client addressed to ENGAGEMENT_EMAIL. */
var BACKEND = {
  // "web3forms" | "formspree" | "custom" | "" (email fallback)
  provider: "",

  // web3forms: get a free access key at web3forms.com (delivers to your Gmail)
  web3formsKey: "",

  // formspree: your form endpoint, e.g. "https://formspree.io/f/abcdwxyz"
  formspreeEndpoint: "",

  // custom: your own URL that accepts a JSON POST
  customEndpoint: "",

  // Auto-reply to the booker. Web3Forms & Formspree support this natively.
  autoReply: true
};

/* ============================================================
   ENGINE. No edits needed below this line.
   ============================================================ */
(function(){
"use strict";
var $  = function(s, c){ return (c || document).querySelector(s); };
var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

function srAnnounce(text){
  var el = $("#sr-announcer");
  if (!el) return;
  el.textContent = "";
  requestAnimationFrame(function(){ el.textContent = text; });
}
function setFieldError(fieldEl){ if (fieldEl) fieldEl.classList.add("field-error"); }
function clearFieldError(fieldEl){ if (fieldEl) fieldEl.classList.remove("field-error"); }
function esc(s){ return String(s == null ? "" : s); }

/* ---------- Reveal on scroll ---------- */
if ("IntersectionObserver" in window){
  var revealIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); revealIO.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(function(el){ revealIO.observe(el); });
} else {
  $$(".reveal").forEach(function(el){ el.classList.add("in"); });
}

/* ---------- Panel switching ---------- */
var panels = $$(".panel");
function openPanel(name){
  panels.forEach(function(p){ p.classList.toggle("is-open", p.getAttribute("data-panel") === name); });
  var opened = panels.filter(function(p){ return p.getAttribute("data-panel") === name; })[0];
  if (opened){
    if (opened.hasAttribute("tabindex")) opened.focus({ preventScroll: true });
    var top = $("#booking");
    if (name !== "choice" && top){
      var y = top.getBoundingClientRect().top + window.pageYOffset - 12;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }
}
document.addEventListener("click", function(ev){
  var btn = ev.target.closest ? ev.target.closest("[data-open-panel]") : null;
  if (!btn) return;
  openPanel(btn.getAttribute("data-open-panel"));
});

/* ---------- Country datalist ---------- */
var COUNTRIES = ["Nigeria","Ghana","Kenya","South Africa","United States","United Kingdom","Canada","Australia","Ireland","Germany","France","Netherlands","Italy","Spain","Portugal","Sweden","Norway","Denmark","Switzerland","Belgium","Austria","United Arab Emirates","Saudi Arabia","Qatar","India","Pakistan","Bangladesh","Philippines","Indonesia","Malaysia","Singapore","China","Japan","South Korea","Brazil","Mexico","Argentina","Chile","Colombia","Egypt","Morocco","Tanzania","Uganda","Rwanda","Zambia","Zimbabwe","Botswana","Namibia","Cameroon","Ivory Coast","Senegal","Ethiopia","Jamaica","Trinidad and Tobago","New Zealand"];
(function(){
  var dl = $("#country-list");
  if (!dl) return;
  COUNTRIES.forEach(function(c){ var o = document.createElement("option"); o.value = c; dl.appendChild(o); });
})();

/* ---------- Event time: min = now, show time zone ---------- */
(function(){
  var t = $("#ef-time");
  if (t){
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    t.min = now.toISOString().slice(0, 16);
  }
  var hint = $("#ef-tz-hint");
  if (hint){
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) hint.textContent = "Times are in your local zone (" + tz + ").";
    } catch(e){}
  }
})();

/* ---------- Appointments: reason, type + Calendly ---------- */
var apReason = $("#ap-reason");
var apName   = $("#ap-name");
var apNotes  = $("#ap-notes");
var typeButtons = $$(".type-btn");
var calWrap  = $("#cal-wrap");
var calMount = $("#cal-mount");
var calNote  = $("#cal-note-text");
var calendlyLoading = null;

function loadCalendlyAssets(){
  if (window.Calendly) return Promise.resolve();
  if (calendlyLoading) return calendlyLoading;
  calendlyLoading = new Promise(function(resolve, reject){
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(css);
    var s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return calendlyLoading;
}

function calendlyUrlWithPrefill(base){
  var reason = apReason && apReason.value ? apReason.value : "";
  var notes = apNotes && apNotes.value ? apNotes.value.trim() : "";
  var name = apName && apName.value ? apName.value.trim() : "";
  var q = [];
  if (name) q.push("name=" + encodeURIComponent(name));
  var detail = reason ? reason : "";
  if (notes) detail += (detail ? " — " : "") + notes;
  if (detail) q.push("a1=" + encodeURIComponent(detail));
  if (!q.length) return base;
  return base + (base.indexOf("?") > -1 ? "&" : "?") + q.join("&");
}

function mountCalendly(url){
  calMount.innerHTML = "";
  var holder = document.createElement("div");
  holder.className = "calendly-inline-widget";
  holder.setAttribute("data-url", url);
  calMount.appendChild(holder);
  loadCalendlyAssets().then(function(){
    if (window.Calendly && window.Calendly.initInlineWidget){
      window.Calendly.initInlineWidget({ url: url, parentElement: holder });
    }
  }).catch(function(){ showFallback(url); });
}

function showFallback(url){
  calMount.innerHTML = "";
  var box = document.createElement("div");
  box.className = "cal-fallback";
  if (url){
    box.innerHTML = 'The scheduler could not load right now. ' +
      '<a href="' + esc(url) + '" target="_blank" rel="noopener" style="color:var(--gold-metal);font-weight:500">Open the booking page in a new tab</a>.';
  } else {
    box.innerHTML = 'Online and in-person booking is being set up. ' +
      'Kindly reach us at <a href="mailto:' + esc(ENGAGEMENT_EMAIL) + '" style="color:var(--g