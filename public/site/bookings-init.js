
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
      'Kindly reach us at <a href="mailto:' + esc(ENGAGEMENT_EMAIL) + '" style="color:var(--gold-metal);font-weight:500">' + esc(ENGAGEMENT_EMAIL) + '</a> to arrange a time.';
  }
  calMount.appendChild(box);
}

function requireReason(){
  var ok = true;
  [apReason, apName].forEach(function(ctrl){
    if (!ctrl) return;
    var field = ctrl.closest(".field");
    if (!ctrl.value || !ctrl.value.trim()){ setFieldError(field); ok = false; }
    else clearFieldError(field);
  });
  return ok;
}

typeButtons.forEach(function(btn){
  btn.addEventListener("click", function(){
    if (!requireReason()){
      srAnnounce("Please tell us what the appointment is about and your name first.");
      (apReason.value ? apName : apReason).focus();
      return;
    }
    var type = btn.getAttribute("data-appt-type");
    typeButtons.forEach(function(b){
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    calWrap.classList.add("is-open");
    var base = CALENDLY_LINKS[type] || "";
    if (base){
      calNote.textContent = type === "online"
        ? "Pick a date and time for your online appointment."
        : "Pick a date and time for your in-person appointment.";
      mountCalendly(calendlyUrlWithPrefill(base));
      srAnnounce((type === "online" ? "Online" : "In person") + " scheduler ready. Choose a date and time.");
    } else {
      calNote.textContent = "Almost there.";
      showFallback("");
      srAnnounce("Booking for this option is being set up.");
    }
  });
});
[apReason, apName, apNotes].forEach(function(c){
  if (c) c.addEventListener("input", function(){ clearFieldError(c.closest(".field")); });
});

/* ---------- Speaking engagement form ---------- */
var form = $("#event-form");
var formMsg = $("#ef-msg");
var submitBtn = $("#ef-submit");
var errSummary = $("#ef-error-summary");
var errList = $("#ef-error-list");

function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function labelText(field){
  var lab = $("label", field);
  if (!lab) return "This field";
  return lab.textContent.replace("*", "").replace(/\(.*\)/, "").trim();
}

function validateForm(){
  var errors = [];
  $$(".field", form).forEach(function(field){
    var ctrl = $("input, select, textarea", field);
    if (!ctrl || !ctrl.required){ clearFieldError(field); return; }
    var v = (ctrl.value || "").trim();
    var bad = !v || (ctrl.type === "email" && !validEmail(v));
    if (ctrl.type === "datetime-local" && v && ctrl.min && v < ctrl.min) bad = true;
    if (bad){
      setFieldError(field);
      errors.push({ id: ctrl.id, label: labelText(field),
        msg: (ctrl.type === "email" && v) ? "enter a valid email"
           : (ctrl.type === "datetime-local" && v) ? "choose a future date"
           : "is required" });
    } else clearFieldError(field);
  });
  renderErrorSummary(errors);
  return errors.length === 0;
}

function renderErrorSummary(errors){
  if (!errSummary) return;
  if (!errors.length){ errSummary.classList.remove("is-open"); errList.innerHTML = ""; return; }
  errList.innerHTML = "";
  errors.forEach(function(e){
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + e.id;
    a.textContent = e.label + " " + e.msg;
    a.addEventListener("click", function(ev){ ev.preventDefault(); var t = document.getElementById(e.id); if (t) t.focus(); });
    li.appendChild(a);
    errList.appendChild(li);
  });
  errSummary.classList.add("is-open");
  errSummary.focus();
  srAnnounce(errors.length + (errors.length === 1 ? " field needs" : " fields need") + " your attention.");
}

function collect(){
  var data = {};
  Array.prototype.forEach.call(form.elements, function(el){
    if (el.name) data[el.name] = (el.value || "").trim();
  });
  return data;
}

function pad(n){ return (n < 10 ? "0" : "") + n; }
function toICSDate(dtLocal){
  /* dtLocal is "YYYY-MM-DDTHH:MM" in the user's local zone -> UTC stamp */
  var d = new Date(dtLocal);
  if (isNaN(d.getTime())) return null;
  return d.getUTCFullYear() + pad(d.getUTCMonth()+1) + pad(d.getUTCDate()) + "T" +
         pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
}
function icsEscape(s){ return String(s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); }

function buildICS(data){
  var start = toICSDate(data.eventTime);
  if (!start) return null;
  var end = toICSDate(new Date(new Date(data.eventTime).getTime() + 2*60*60*1000).toISOString().slice(0,16));
  var loc = [data.eventAddress, data.eventState, data.eventCountry].filter(Boolean).join(", ");
  var uid = "eemodiae-" + Date.now() + "@eemodiae.org";
  var lines = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//EEMODIAE//Bookings//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "BEGIN:VEVENT","UID:" + uid,
    "DTSTAMP:" + toICSDate(new Date().toISOString().slice(0,16)),
    "DTSTART:" + start, "DTEND:" + (end || start),
    "SUMMARY:" + icsEscape(data.eventTheme || "Speaking Engagement"),
    "DESCRIPTION:" + icsEscape("Speaking engagement invitation for " + (data.organisation || "") + ". Nature: " + (data.natureOfEvent || "") + "."),
    "LOCATION:" + icsEscape(loc),
    "END:VEVENT","END:VCALENDAR"
  ];
  return lines.join("\r\n");
}

function buildSummary(data){
  return [
    "New Speaking Engagement Invitation","",
    "Name: " + data.firstName + " " + data.lastName,
    "Organisation: " + data.organisation,
    "Email: " + data.email,
    "Phone: " + data.phone,
    "Website: " + (data.website || "—"),
    "Social Media: " + data.socialMedia,
    "Event Name / Theme: " + data.eventTheme,
    "Nature of Event: " + data.natureOfEvent,
    "Event Time: " + data.eventTime,
    "Location: " + data.eventAddress + ", " + data.eventState + ", " + data.eventCountry,
    "","Additional Information:", (data.additionalInfo || "—")
  ].join("\n");
}

function setBusy(on){
  if (!submitBtn) return;
  submitBtn.setAttribute("aria-busy", on ? "true" : "false");
  var label = $(".btn-label", submitBtn), icon = $(".btn-icon", submitBtn);
  if (on){
    if (label) label.textContent = "Sending...";
    if (icon){ icon.outerHTML = '<span class="spin btn-icon" role="presentation"></span>'; }
  } else {
    if (label) label.textContent = "Submit Invitation";
    var sp = $(".spin", submitBtn);
    if (sp) sp.outerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>';
  }
}

function showSuccess(data){
  $("#event-form-wrap").hidden = true;
  var s = $("#event-success");
  $("#event-success-detail").textContent =
    "Thank you" + (data.firstName ? ", " + data.firstName : "") +
    ". Your event details have been sent to our team, and you will hear back by email within 3 to 5 working days.";
  var ics = buildICS(data);
  var link = $("#event-ics");
  if (ics && link){
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    link.href = URL.createObjectURL(blob);
    link.hidden = false;
  } else if (link){ link.hidden = true; }
  s.hidden = false;
  s.focus({ preventScroll: true });
  srAnnounce("Invitation sent. Thank you.");
}

/* Build the payload the backends receive */
function buildPayload(data){
  var payload = {
    subject: "Speaking Engagement Invitation — " + data.eventTheme,
    from_name: data.firstName + " " + data.lastName,
    "Full Name": data.firstName + " " + data.lastName,
    Organisation: data.organisation,
    Email: data.email,
    Phone: data.phone,
    Website: data.website || "—",
    "Social Media": data.socialMedia,
    "Event Theme": data.eventTheme,
    "Nature of Event": data.natureOfEvent,
    "Event Time": data.eventTime,
    "Event Location": data.eventAddress + ", " + data.eventState + ", " + data.eventCountry,
    "Additional Information": data.additionalInfo || "—"
  };
  return payload;
}

function sendViaBackend(data){
  var payload = buildPayload(data);
  if (BACKEND.provider === "web3forms"){
    var body = Object.assign({
      access_key: BACKEND.web3formsKey,
      replyto: data.email
    }, payload);
    if (BACKEND.autoReply){
      body.autoresponse = "Thank you for inviting EEMODIAE. We have received your event details and will reply within 3 to 5 working days. Commit thy works unto the LORD, and thy thoughts shall be established. — Proverbs 16:3 KJV";
    }
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body)
    }).then(function(r){ return r.json(); }).then(function(j){ if (!j.success) throw new Error("web3forms"); });
  }
  if (BACKEND.provider === "formspree"){
    var fd = Object.assign({ _replyto: data.email, _subject: payload.subject }, payload);
    return fetch(BACKEND.formspreeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(fd)
    }).then(function(r){ if (!r.ok) throw new Error("formspree"); });
  }
  if (BACKEND.provider === "custom"){
    return fetch(BACKEND.customEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ raw: data }, payload))
    }).then(function(r){ if (!r.ok) throw new Error("custom"); });
  }
  return Promise.reject(new Error("no-backend"));
}

if (form){
  $$(".field input, .field select, .field textarea", form).forEach(function(ctrl){
    ctrl.addEventListener("input", function(){ clearFieldError(ctrl.closest(".field")); formMsg.textContent = ""; });
    ctrl.addEventListener("change", function(){ clearFieldError(ctrl.closest(".field")); });
  });

  form.addEventListener("submit", function(ev){
    ev.preventDefault();
    formMsg.classList.remove("ok");

    /* Honeypot: if filled, silently pretend success (bot trap) */
    var hp = $("#ef-company");
    if (hp && hp.value){ showSuccess(collect()); return; }

    if (!validateForm()){
      formMsg.textContent = "Kindly correct the highlighted fields to proceed.";
      return;
    }
    var data = collect();

    if (BACKEND.provider){
      setBusy(true);
      formMsg.classList.add("ok");
      formMsg.textContent = "Sending your invitation...";
      sendViaBackend(data).then(function(){
        setBusy(false); formMsg.textContent = ""; showSuccess(data);
      }).catch(function(){
        setBusy(false); formMsg.classList.remove("ok");
        formMsg.textContent = "We could not send it just now. Kindly try again, or email us at " + ENGAGEMENT_EMAIL + ".";
      });
      return;
    }

    /* Email fallback: open mail client prefilled */
    var href = "mailto:" + encodeURIComponent(ENGAGEMENT_EMAIL) +
      "?subject=" + encodeURIComponent("Speaking Engagement Invitation — " + data.eventTheme) +
      "&body=" + encodeURIComponent(buildSummary(data));
    window.location.href = href;
    showSuccess(data);
  });
}

var eventAgain = $("#event-again");
if (eventAgain){
  eventAgain.addEventListener("click", function(){
    $("#event-success").hidden = true;
    $("#event-form-wrap").hidden = false;
    if (form){ form.reset(); $$(".field", form).forEach(clearFieldError); }
    if (errSummary){ errSummary.classList.remove("is-open"); errList.innerHTML = ""; }
    var link = $("#event-ics");
    if (link && link.href && link.href.indexOf("blob:") === 0){ URL.revokeObjectURL(link.href); }
    formMsg.textContent = "";
    var first = $("#ef-first");
    if (first) first.focus();
  });
}

/* ---------- Hero particles (three-layer gold dust) ---------- */
(function heroParticles(){
  var host = $("#hero-particles");
  if (!host) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var rand = function(min, max){ return min + Math.random() * (max - min); };

  for (var i = 0; i < 26; i++){
    var rise = document.createElement("span");
    rise.className = "hp-rise";
    var left = rand(4, 98);
    if (Math.random() < 0.45) left = rand(58, 98);
    rise.style.left = left + "%";
    rise.style.setProperty("--h", rand(24, 52) + "vw");
    rise.style.setProperty("--o", rand(0.4, 0.9).toFixed(2));
    rise.style.animationDuration = rand(9, 18) + "s";
    rise.style.animationDelay = (-rand(0, 18)) + "s";
    var sway = document.createElement("span");
    sway.className = "hp-sway";
    sway.style.setProperty("--sw", rand(0.6, 2) + "vw");
    sway.style.animationDuration = rand(3, 6) + "s";
    var dust = document.createElement("span");
    dust.className = "hp-dust" + (Math.random() < 0.4 ? " hp-soft" : "");
    var size = rand(2, 5.5);
    dust.style.width = size + "px"; dust.style.height = size + "px";
    sway.appendChild(dust); rise.appendChild(sway); host.appendChild(rise);
  }
  for (var j = 0; j < 10; j++){
    var srise = document.createElement("span");
    srise.className = "hp-rise";
    var sleft = rand(6, 96);
    if (Math.random() < 0.5) sleft = rand(56, 96);
    srise.style.left = sleft + "%";
    srise.style.setProperty("--h", rand(28, 50) + "vw");
    srise.style.setProperty("--o", rand(0.5, 1).toFixed(2));
    srise.style.animationDuration = rand(10, 16) + "s";
    srise.style.animationDelay = (-rand(0, 16)) + "s";
    var ssway = document.createElement("span");
    ssway.className = "hp-sway";
    ssway.style.setProperty("--sw", rand(0.8, 2.2) + "vw");
    ssway.style.animationDuration = rand(3.5, 6.5) + "s";
    var spark = document.createElement("span");
    spark.className = "hp-spark";
    var ssize = rand(3, 6);
    spark.style.width = ssize + "px"; spark.style.height = ssize + "px";
    spark.style.animationDuration = rand(1.4, 2.6) + "s";
    ssway.appendChild(spark); srise.appendChild(ssway); host.appendChild(srise);
  }
  var spots = [[12,30],[20,62],[30,20],[40,72],[62,26],[72,58],[80,34],[88,66],[92,22],[8,55],[50,14],[68,78]];
  spots.forEach(function(pt){
    var glint = document.createElement("span");
    glint.className = "hp-glint";
    glint.style.left = pt[0] + "%"; glint.style.top = pt[1] + "%";
    glint.style.setProperty("--g", rand(14, 26) + "px");
    glint.style.setProperty("--o", rand(0.6, 1).toFixed(2));
    glint.style.animationDuration = rand(3, 6) + "s";
    glint.style.animationDelay = (-rand(0, 6)) + "s";
    glint.appendChild(document.createElement("i"));
    host.appendChild(glint);
  });
})();

})();
