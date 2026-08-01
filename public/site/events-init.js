
window.EVENTS_DATA = {

  /* the ministry's WhatsApp number, digits only, country code first,
     no plus sign and no spaces. Leave empty and the WhatsApp button
     politely sends people to the email form instead. */
  whatsapp: "",

  /* where the Messages page lives, used for the archive links */
  messagesUrl: "https://www.eemodiae.org/messages",

  types: [
    { id:"conference", name:"Conference" },
    { id:"crusade",    name:"Crusade" },
    { id:"service",    name:"Service" },
    { id:"workshop",   name:"Workshop" },
    { id:"prayer",     name:"Prayer" },
    { id:"online",     name:"Online" }
  ],

  events: [
    /* ---- PLACEHOLDERS - replace with real gatherings ---- */
    {
      id:"ev-placeholder-1",
      title:"Add Your First Event Here",
      type:"conference",
      start:"2026-09-18T16:00:00",
      end:"2026-09-20T20:00:00",
      venue:"Venue name, city",
      address:"",
      speaker:"Pastor Emmanuel Emodiae",
      blurb:"Replace this entry with a real gathering. Fill in the title, dates, venue and a sentence on what to expect, and the card, countdown, calendar file and registration list all update themselves.",
      image:"",
      capacity:400,
      taken:0,
      featured:true
    },
    {
      id:"ev-placeholder-2",
      title:"A Second Upcoming Gathering",
      type:"service",
      start:"2026-10-04T09:00:00",
      end:"2026-10-04T12:00:00",
      venue:"Venue name, city",
      address:"",
      speaker:"",
      blurb:"Events sort themselves by date, so add them in any order. Anything still ahead appears here; anything past moves to the archive on its own.",
      image:"",
      capacity:0,
      taken:0
    },
    {
      id:"ev-placeholder-past",
      title:"A Gathering Already Held",
      type:"crusade",
      start:"2026-05-22T17:00:00",
      end:"2026-05-24T21:00:00",
      venue:"Venue name, city",
      speaker:"Pastor Emmanuel Emodiae",
      blurb:"Past gatherings move here automatically once their date passes.",
      image:"",
      /* point this at the sermon on the Messages page and the
         Listen button takes people straight to it */
      message:"https://www.eemodiae.org/messages"
    }
  ]
};



(function(){
  "use strict";

  var DATA   = window.EVENTS_DATA || {};
  var TYPES  = DATA.types || [];
  var EVENTS = (DATA.events || []).slice();
  var WA     = String(DATA.whatsapp || "").replace(/[^0-9]/g,"");
  var MSGURL = DATA.messagesUrl || "";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var typeById = {};
  TYPES.forEach(function(t){ typeById[t.id] = t; });

  /* ---------- helpers ---------- */
  function esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function parseDate(s){
    if(!s) return null;
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  function fmtTime(d){
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? "pm" : "am";
    h = h % 12; if(h === 0) h = 12;
    return h + (m ? ":" + (m<10?"0":"") + m : "") + ap;
  }
  function fmtLongDate(d){
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS_FULL[d.getMonth()] + " " + d.getFullYear();
  }
  /* "Fri 18 Sep, 4pm" or a range across days */
  function fmtWhen(ev){
    var s = parseDate(ev.start), e = parseDate(ev.end);
    if(!s) return "";
    var out = DAYS[s.getDay()].slice(0,3) + " " + s.getDate() + " " + MONTHS[s.getMonth()];
    if(e && (e.getDate()!==s.getDate() || e.getMonth()!==s.getMonth())){
      out += " - " + e.getDate() + " " + MONTHS[e.getMonth()];
    }
    out += ", " + fmtTime(s);
    return out;
  }

  /* status is derived, never typed */
  function statusOf(ev){
    var now = new Date();
    var s = parseDate(ev.start);
    var e = parseDate(ev.end) || (s ? new Date(s.getTime() + 3*60*60*1000) : null);
    if(!s) return "upcoming";
    if(now < s) return "upcoming";
    if(e && now <= e) return "live";
    return "past";
  }

  EVENTS.forEach(function(ev){ ev._status = statusOf(ev); });
  EVENTS.sort(function(a,b){
    var da = parseDate(a.start), db = parseDate(b.start);
    return (da?da.getTime():0) - (db?db.getTime():0);
  });

  var upcoming = EVENTS.filter(function(e){ return e._status !== "past"; });
  var past     = EVENTS.filter(function(e){ return e._status === "past"; })
                       .sort(function(a,b){ return parseDate(b.start) - parseDate(a.start); });

  /* ---------- icons ---------- */
  var ICON = {
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>',
    cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.6l1.3-6.8-5-4.7 6.8-.8z"/></svg>',
    live:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>'
  };

  /* ---------- date medallion ---------- */
  function medallion(ev){
    var d = parseDate(ev.start);
    if(!d) return "";
    return '<div class="el-date">'
      + '<span class="el-date__day">'+ d.getDate() +'</span>'
      + '<span class="el-date__mon">'+ MONTHS[d.getMonth()] +'</span>'
      + '<span class="el-date__yr">'+ d.getFullYear() +'</span>'
      + '</div>';
  }
  function statusBadge(ev){
    if(ev._status === "live") return '<span class="el-status el-status--live">Happening Now</span>';
    if(ev._status === "past") return '<span class="el-status el-status--past">Held</span>';
    var d = parseDate(ev.start);
    var days = d ? Math.ceil((d - new Date()) / 86400000) : null;
    var label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : (days!=null && days <= 30 ? days + " days away" : "Upcoming");
    return '<span class="el-status el-status--soon">'+ esc(label) +'</span>';
  }

  /* ---------- the facts row ---------- */
  function factsHTML(ev){
    var out = "";
    var s = parseDate(ev.start), e = parseDate(ev.end);
    if(s){
      var t = fmtLongDate(s) + ", " + fmtTime(s);
      if(e && e.getDate()===s.getDate() && e.getMonth()===s.getMonth()) t += " - " + fmtTime(e);
      else if(e) t += " - " + fmtLongDate(e);
      out += '<div class="el-fact">'+ ICON.clock +'<span>'+ esc(t) +'</span></div>';
    }
    if(ev.venue){
      var place = ev.address
        ? '<a href="https://www.google.com/maps/search/?api=1&query='+ encodeURIComponent(ev.address) +'" target="_blank" rel="noopener">'+ esc(ev.venue) +'</a>'
        : esc(ev.venue);
      out += '<div class="el-fact">'+ ICON.pin +'<span>'+ place +'</span></div>';
    }
    if(ev.speaker) out += '<div class="el-fact">'+ ICON.mic +'<span>'+ esc(ev.speaker) +'</span></div>';
    return out ? '<div class="el-facts">'+ out +'</div>' : "";
  }

  /* ---------- seats ---------- */
  function seatsHTML(ev){
    var cap = Number(ev.capacity)||0;
    if(!cap) return "";
    var taken = Math.min(Number(ev.taken)||0, cap);
    var left = cap - taken;
    var pct = Math.round((taken/cap)*100);
    var full = left <= 0;
    return '<div class="el-seats'+ (full?" el-seats--full":"") +'">'
      + '<div class="el-seats__bar"><div class="el-seats__fill" style="width:'+ pct +'%"></div></div>'
      + '<div class="el-seats__text"><span><b>'+ taken +'</b> registered</span>'
      + '<span>'+ (full ? "Full - join the waiting list" : "<b>"+ left +"</b> seats left") +'</span></div>'
      + '</div>';
  }

  /* ---------- actions ---------- */
  function actionsHTML(ev){
    var out = '<div class="el-card__actions">';
    if(ev._status === "live" && ev.stream){
      out += '<a class="el-btn el-btn--gold" href="'+ esc(ev.stream) +'" target="_blank" rel="noopener">'+ ICON.live +'Watch Live</a>';
    } else if(ev._status !== "past"){
      out += '<button type="button" class="el-btn el-btn--gold" data-register="'+ esc(ev.id) +'">Register</button>';
    }
    if(ev._status === "past" && ev.message){
      out += '<a class="el-btn el-btn--quiet" href="'+ esc(ev.message) +'">'+ ICON.play +'Listen</a>';
    }
    out += '</div>';

    var mini = "";
    if(ev._status !== "past"){
      mini += '<button type="button" data-ics="'+ esc(ev.id) +'">'+ ICON.cal +'Add to calendar</button>';
    }
    mini += '<button type="button" data-share="'+ esc(ev.id) +'">'+ ICON.share +'Share</button>';
    if(mini) out += '<div class="el-mini">'+ mini +'</div>';
    return out;
  }

  /* ---------- upcoming card ---------- */
  function cardHTML(ev){
    var t = typeById[ev.type];
    var media = ev.image
      ? '<div class="el-card__media"><img src="'+ esc(ev.image) +'" alt="'+ esc(ev.title) +'" loading="lazy" /></div>'
      : '<div class="el-card__media el-card__media--empty"><span>Cover image space</span></div>';
    return '<article class="el-card el-reveal" data-type="'+ esc(ev.type) +'">'
      + media + medallion(ev) + statusBadge(ev)
      + '<div class="el-card__body">'
      +   (t ? '<p class="el-card__type">'+ esc(t.name) +'</p>' : '')
      +   '<h3 class="el-card__title">'+ esc(ev.title) +'</h3>'
      +   (ev.blurb ? '<p class="el-card__blurb">'+ esc(ev.blurb) +'</p>' : '')
      +   factsHTML(ev)
      +   seatsHTML(ev)
      +   actionsHTML(ev)
      + '</div>'
      + '</article>';
  }

  /* ---------- featured spotlight ---------- */
  function spotHTML(ev){
    var t = typeById[ev.type];
    var media = ev.image
      ? '<div class="el-spot__media"><img src="'+ esc(ev.image) +'" alt="'+ esc(ev.title) +'" loading="lazy" /></div>'
      : '<div class="el-spot__media el-spot__media--empty"><span>Cover image space</span></div>';
    var tag = ev._status === "live"
      ? '<span class="el-spot__tag">'+ ICON.live +'Happening Now</span>'
      : '<span class="el-spot__tag">'+ ICON.star +'Next Gathering</span>';
    return '<div class="el-spot el-reveal">'
      + media
      + '<div class="el-spot__body">'
      +   tag
      +   (t ? '<p class="el-card__type">'+ esc(t.name) +'</p>' : '')
      +   '<h3 class="el-spot__title">'+ esc(ev.title) +'</h3>'
      +   (ev.blurb ? '<p class="el-spot__blurb">'+ esc(ev.blurb) +'</p>' : '')
      +   factsHTML(ev)
      +   seatsHTML(ev)
      +   actionsHTML(ev)
      + '</div>'
      + '</div>';
  }

  /* ---------- past row ---------- */
  function rowHTML(ev){
    var d = parseDate(ev.start);
    var t = typeById[ev.type];
    var meta = "";
    if(t) meta += '<span>'+ esc(t.name) +'</span>';
    if(ev.venue) meta += '<span>'+ ICON.pin + esc(ev.venue) +'</span>';
    if(ev.speaker) meta += '<span>'+ ICON.mic + esc(ev.speaker) +'</span>';
    var go = ev.message
      ? '<a class="el-row__go" href="'+ esc(ev.message) +'">'+ ICON.play +'Listen</a>'
      : '<span class="el-row__none">Message coming</span>';
    return '<div class="el-row el-reveal">'
      + '<div class="el-row__date">'
      +   (d ? '<span class="el-row__day">'+ d.getDate() +'</span><span class="el-row__mon">'+ MONTHS[d.getMonth()] +'</span><span class="el-row__yr">'+ d.getFullYear() +'</span>' : '')
      + '</div>'
      + '<div>'
      +   '<p class="el-row__title">'+ esc(ev.title) +'</p>'
      +   (meta ? '<div class="el-row__meta">'+ meta +'</div>' : '')
      + '</div>'
      + go
      + '</div>';
  }

  /* ============================================================
     RENDER
     ============================================================ */
  var spotEl    = document.getElementById("elSpot");
  var filtersEl = document.getElementById("elFilters");
  var upEl      = document.getElementById("elUpcoming");
  var pastEl    = document.getElementById("elPast");
  var activeType = "all";

  /* filters only earn their place once there is enough to sift */
  var FILTER_AT = 5;
  var showFilters = upcoming.length >= FILTER_AT;

  var featured = upcoming.filter(function(e){ return e.featured; })[0] || upcoming[0] || null;

  function renderSpot(){
    if(!spotEl) return;
    spotEl.innerHTML = featured ? spotHTML(featured) : "";
  }

  function renderFilters(){
    if(!filtersEl) return;
    if(!showFilters){ filtersEl.style.display = "none"; return; }
    var used = {};
    upcoming.forEach(function(e){ used[e.type] = (used[e.type]||0) + 1; });
    var html = '<button class="el-chip is-active" data-type="all" role="tab" aria-selected="true">All'
             + '<span class="el-chip__count">'+ upcoming.length +'</span></button>';
    TYPES.forEach(function(t){
      if(!used[t.id]) return;
      html += '<button class="el-chip" data-type="'+ t.id +'" role="tab" aria-selected="false">'
            + esc(t.name) +'<span class="el-chip__count">'+ used[t.id] +'</span></button>';
    });
    filtersEl.innerHTML = html;
    filtersEl.querySelectorAll(".el-chip").forEach(function(chip){
      chip.addEventListener("click", function(){
        activeType = chip.getAttribute("data-type");
        filtersEl.querySelectorAll(".el-chip").forEach(function(x){
          var on = x === chip;
          x.classList.toggle("is-active", on);
          x.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderUpcoming();
      });
    });
  }

  function renderUpcoming(){
    if(!upEl) return;
    var list = upcoming.filter(function(e){
      if(featured && e.id === featured.id) return false;   // already in the spotlight
      return activeType === "all" || e.type === activeType;
    });
    if(!list.length && !featured){
      upEl.innerHTML = '<div class="el-empty el-reveal">'
        + '<h3>No events scheduled yet</h3>'
        + '<p>The next gathering will appear here as soon as it is announced.</p>'
        + '</div>';
    } else if(!list.length){
      upEl.innerHTML = activeType === "all" ? "" :
        '<div class="el-empty el-reveal"><h3>Nothing of that kind ahead</h3><p>Try another filter to see what else is coming.</p></div>';
    } else {
      upEl.innerHTML = '<div class="el-grid">' + list.map(cardHTML).join("") + '</div>';
    }
    wire();
    revealObserve(upEl.querySelectorAll(".el-reveal"));
  }

  function renderPast(){
    if(!pastEl) return;
    if(!past.length){
      pastEl.innerHTML = '<div class="el-empty el-reveal">'
        + '<h3>The record starts soon</h3>'
        + '<p>Once a gathering has been held it moves here, with the message attached.</p>'
        + '</div>';
    } else {
      pastEl.innerHTML = '<div class="el-past">' + past.map(rowHTML).join("") + '</div>';
    }
    revealObserve(pastEl.querySelectorAll(".el-reveal"));
  }

  /* ============================================================
     COUNTDOWN - the page's signature
     ============================================================ */
  var nextEl   = document.getElementById("elNext");
  var clockEl  = document.getElementById("elClock");
  var nTitleEl = document.getElementById("elNextTitle");
  var nWhenEl  = document.getElementById("elNextWhen");
  var countdownTarget = upcoming.filter(function(e){ return e._status === "upcoming"; })[0] || null;
  var liveNow = upcoming.filter(function(e){ return e._status === "live"; })[0] || null;

  function unit(n, word){
    return '<div class="el-clock__unit"><span class="el-clock__num">'+ (n<10?"0":"") + n +'</span>'
         + '<span class="el-clock__word">'+ word +'</span></div>';
  }

  function tick(){
    if(!nextEl) return;

    if(liveNow){
      nextEl.hidden = false;
      nTitleEl.textContent = liveNow.title;
      nWhenEl.textContent = "Happening now" + (liveNow.venue ? " at " + liveNow.venue : "");
      clockEl.innerHTML = '<div class="el-clock__unit" style="min-width:auto">'
        + '<span class="el-status el-status--live" style="position:static">Live</span></div>';
      return;
    }
    if(!countdownTarget){ nextEl.hidden = true; return; }

    var d = parseDate(countdownTarget.start);
    if(!d){ nextEl.hidden = true; return; }
    var diff = d - new Date();
    if(diff <= 0){ window.location.reload(); return; }

    nextEl.hidden = false;
    nTitleEl.textContent = countdownTarget.title;
    nWhenEl.textContent = fmtLongDate(d) + " at " + fmtTime(d)
      + (countdownTarget.venue ? " \u00b7 " + countdownTarget.venue : "");

    var days = Math.floor(diff / 86400000);
    var hrs  = Math.floor(diff / 3600000) % 24;
    var mins = Math.floor(diff / 60000) % 60;
    var secs = Math.floor(diff / 1000) % 60;
    var sep  = '<span class="el-clock__sep">:</span>';
    clockEl.innerHTML = unit(days,"Days") + sep + unit(hrs,"Hours") + sep + unit(mins,"Minutes") + sep + unit(secs,"Seconds");
  }

  /* ============================================================
     ADD TO CALENDAR - builds a real .ics file in the browser
     ============================================================ */
  function icsStamp(d){
    function p(n){ return (n<10?"0":"") + n; }
    return d.getUTCFullYear() + p(d.getUTCMonth()+1) + p(d.getUTCDate())
         + "T" + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + "Z";
  }
  function icsEscape(s){
    return String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
  }
  function downloadICS(ev){
    var s = parseDate(ev.start);
    if(!s){ toast("That event has no date yet"); return; }
    var e = parseDate(ev.end) || new Date(s.getTime() + 2*60*60*1000);
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//eemodiae.org//Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + ev.id + "@eemodiae.org",
      "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(s),
      "DTEND:" + icsStamp(e),
      "SUMMARY:" + icsEscape(ev.title),
      "DESCRIPTION:" + icsEscape((ev.blurb||"") + (ev.speaker ? "\n\nMinistering: " + ev.speaker : "")),
      "LOCATION:" + icsEscape(ev.address || ev.venue || ""),
      "BEGIN:VALARM",
      "TRIGGER:-PT1H",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + icsEscape(ev.title + " begins in an hour"),
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    var blob = new Blob([lines.join("\r\n")], { type:"text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = ev.title.replace(/[^a-z0-9]+/gi,"-").toLowerCase().replace(/^-|-$/g,"") + ".ics";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    toast("Saved to your calendar");
  }

  /* ---------- share ---------- */
  function shareEvent(ev){
    var when = fmtWhen(ev);
    var text = ev.title + (when ? " - " + when : "") + (ev.venue ? " at " + ev.venue : "");
    var url = window.location.href.split("#")[0] + "#upcoming";
    if(navigator.share){
      navigator.share({ title:ev.title, text:text, url:url }).catch(function(){});
    } else if(navigator.clipboard){
      navigator.clipboard.writeText(text + " " + url).then(function(){ toast("Link copied"); });
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank", "noopener");
    }
  }

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("elToast");
  var toastTimer;
  function toast(msg){
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("is-shown"); }, 2600);
  }

  /* ---------- wire card buttons ---------- */
  function findEvent(id){
    return EVENTS.filter(function(e){ return e.id === id; })[0];
  }
  function wire(){
    document.querySelectorAll("[data-ics]").forEach(function(b){
      if(b.__w) return; b.__w = 1;
      b.addEventListener("click", function(){
        var ev = findEvent(b.getAttribute("data-ics"));
        if(ev) downloadICS(ev);
      });
    });
    document.querySelectorAll("[data-share]").forEach(function(b){
      if(b.__w) return; b.__w = 1;
      b.addEventListener("click", function(){
        var ev = findEvent(b.getAttribute("data-share"));
        if(ev) shareEvent(ev);
      });
    });
    document.querySelectorAll("[data-register]").forEach(function(b){
      if(b.__w) return; b.__w = 1;
      b.addEventListener("click", function(){
        var ev = findEvent(b.getAttribute("data-register"));
        if(ev){
          var waSel = document.getElementById("waEvent");
          var rgSel = document.getElementById("rgEvent");
          if(waSel) waSel.value = ev.title;
          if(rgSel) rgSel.value = ev.title;
        }
        var target = document.getElementById("register");
        if(target){
          var y = target.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top:y, behavior: reduce ? "auto" : "smooth" });
        }
      });
    });
  }

  /* ============================================================
     REGISTRATION
     ============================================================ */
  function fillEventSelect(sel){
    if(!sel) return;
    upcoming.forEach(function(e){
      var o = document.createElement("option");
      o.value = e.title; o.textContent = e.title + " \u00b7 " + fmtWhen(e);
      sel.appendChild(o);
    });
    if(!upcoming.length){
      var none = document.createElement("option");
      none.value = "General enquiry"; none.textContent = "General enquiry";
      sel.appendChild(none);
    }
  }
  fillEventSelect(document.getElementById("waEvent"));
  fillEventSelect(document.getElementById("rgEvent"));

  var waPane  = document.getElementById("elWaPane");
  var regForm = document.getElementById("elRegForm");
  document.querySelectorAll(".el-channel__btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var ch = btn.getAttribute("data-channel");
      document.querySelectorAll(".el-channel__btn").forEach(function(x){
        var on = x === btn;
        x.classList.toggle("is-active", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      var wa = ch === "whatsapp";
      if(waPane)  waPane.hidden  = !wa;
      if(regForm) regForm.hidden = wa;
    });
  });

  /* ---------- WhatsApp handoff ---------- */
  var waSubmit = document.getElementById("waSubmit");
  var waMsg    = document.getElementById("waFormMsg");
  if(waSubmit) waSubmit.addEventListener("click", function(){
    waMsg.textContent = ""; waMsg.className = "el-form__msg";
    var name  = document.getElementById("waName").value.trim();
    var phone = document.getElementById("waPhone").value.trim();
    var event = document.getElementById("waEvent").value;
    var seats = document.getElementById("waSeats").value;
    var note  = document.getElementById("waNote").value.trim();

    if(!name || !phone || !event){
      waMsg.textContent = "Please fill in your name, phone and which event.";
      waMsg.className = "el-form__msg err"; return;
    }
    if(!WA){
      waMsg.textContent = "The WhatsApp line is being set up. Please use the Email option for now.";
      waMsg.className = "el-form__msg err"; return;
    }
    var msg = "Event Registration - eemodiae.org\n\n"
      + "Name: " + name + "\n"
      + "Phone: " + phone + "\n"
      + "Event: " + event + "\n"
      + "Seats: " + seats + "\n"
      + (note ? "\nNote: " + note + "\n" : "")
      + "\nPlease confirm my place.";
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    waMsg.textContent = "Opening WhatsApp with your details ready.";
    waMsg.className = "el-form__msg ok";
  });

  /* ---------- email form ---------- */
  var rgMsg = document.getElementById("rgFormMsg");
  if(regForm) regForm.addEventListener("submit", function(e){
    rgMsg.textContent = ""; rgMsg.className = "el-form__msg";
    var honey = regForm.querySelector('input[name="_honey"]');
    if(honey && honey.value){ e.preventDefault(); return; }
    if(!regForm.checkValidity()) return;
    rgMsg.textContent = "Sending your registration.";
    rgMsg.className = "el-form__msg ok";
  });

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  var io;
  function revealObserve(nodes){
    if(reduce){ nodes.forEach(function(n){ n.classList.add("is-in"); }); return; }
    if(!("IntersectionObserver" in window)){
      nodes.forEach(function(n){ n.classList.add("is-in"); }); return;
    }
    if(!io){
      io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { rootMargin:"0px 0px -8% 0px", threshold:0.06 });
    }
    nodes.forEach(function(n){ io.observe(n); });
  }

  /* ============================================================
     GO
     ============================================================ */
  renderSpot();
  renderFilters();
  renderUpcoming();
  renderPast();
  wire();
  revealObserve(document.querySelectorAll(".el-reveal"));

  tick();
  if(!reduce) setInterval(tick, 1000);

})();
