// @ts-nocheck
"use client";
import { useEffect, useRef, useState, useCallback } from "react";



/* ============================================================
   DATA  (seeded from the current eemodiae.org/messages)
   Replace image/audio/download URLs with live CMS values.
   ============================================================ */
const AUTHOR = "Pst Emmanuel I. Emodiae";
let POD_BANNER = "";
let HERO_LANDING = "";
let HERO_SERIES = "";
let HERO_MESSAGE = "";
let ENCOURAGE_IMG = "";
const AUTHOR_FULL = "Emmanuel I. Emodiae";

let _onNavigate = null;
let _initialTab = "series";
let _initialPodcastView = "series";
let _initialSlug = null;
let _initialKind = null;


/* Cross-links reference real slugs in the Poems/Articles builds so the
   "Continue Your Journey" rail can deep-link across the site.
   Replace image/audio/download/transcript URLs with live CMS values. */

let SERIES = [];
let MESSAGES = [];
let POD_SERIES = [];
/* podcast subscribe destinations (replace with live show URLs) */
const POD_SUBSCRIBE = {
  apple:"https://podcasts.apple.com/",
  spotify:"https://open.spotify.com/",
  rss:"https://eemodiae.org/podcasts/feed.xml",
};

let POD_EPISODES = [];
/* Cross-resource links for the Continue Your Journey rail.
   Titles here are display-only; live URLs come from the CMS. */
const XLINKS = {
  poems:{
    "what-a-day-a-fathers-day-poem":"What a Day - A Father's Day Poem",
    "forge-your-own-path":"Forge Your Own Path",
    "the-first-line":"The First Line",
    "to-stay-in-nigeria":"To Stay in Nigeria Is...",
    "the-making-of-a-great-man":"The Making of a Great Man",
    "to-live-for-god-or-not":"To Live for God or Not",
  },
  articles:{
    "what-does-a-better-christian-actually-look-like":"What Does a Better Christian Actually Look Like?",
    "spiritual-maturity-doesnt-come-with-age":"Spiritual Maturity Doesn't Come With Age",
    "tired-of-falling-into-the-same-sin":"Tired of Falling Into the Same Sin?",
    "holiness-isnt-old-fashioned":"Holiness Isn't Old-Fashioned",
    "destiny-is-not-a-myth":"Destiny Is Not a Myth",
    "you-were-not-born-by-accident":"You Were Not Born by Accident",
  },
};
function xurl(kind, slug){ return "https://eemodiae.org/"+kind+"/"+slug; }

const PER_PAGE = 6;
const EP_PER_PAGE = 4;


/* ============================================================
   ICONS
   ============================================================ */
const IC = {
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  chevR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg>',
  chevL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 3v18"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></svg>',
  scroll:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3h11v14a3 3 0 0 1-3 3H7"/><path d="M8 3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2M8 7h7M8 11h7"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3-6.3-4.6-6.3 4.6L8 13.7 2 9.2h7.6z"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>',
  bookmark:'<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  speed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 12l5-3M21 3l-4 4"/></svg>',
  timer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4M9 1h6"/></svg>',
  skipf:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5l10 7-10 7zM18 5h2v14h-2z"/></svg>',
  skipb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5L10 12l10 7zM4 5h2v14H4z"/></svg>',
  compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 9l5-3v12l-5-3z"/></svg>',
  speaker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>',
};

const $ = id => (typeof document !== "undefined" ? document.getElementById(id) : null);
const app = () => $("msApp");
let toastT=null;
function toast(msg){ if(window.__msToast){ window.__msToast(msg); return; } const t=$("msToast"); if(!t) return; t.textContent=msg; t.classList.add("ms-toast--show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("ms-toast--show"),2400); }

/* ============================================================
   AUDIO ENGINE  (real <audio>, background playback, Media
   Session lock-screen controls, queue + auto-advance)
   ------------------------------------------------------------
   A single persistent <audio> element plays whichever track is
   current. Because it is a real media element, it keeps playing
   when the user switches apps or locks the phone, and the OS
   shows lock-screen controls via the Media Session API — all of
   this activates automatically once real audio URLs are present
   in the data (item.audio). With no URL yet, the engine falls
   back to a simulated timeline so the UI (progress, auto-advance
   to the next queued item, speed, sleep, skip) is fully wired
   and visible; drop in item.audio and it becomes real playback.
   ============================================================ */
let Audio_ = null;
function getAudioEngine() {
  if (Audio_) return Audio_;
  if (typeof document === "undefined") {
    return {
      sub: () => () => {},
      status: () => ({ item: null, index: -1, length: 0, playing: false, cur: 0, total: 0, speed: 1, sleepMin: 0, hasNext: false, hasPrev: false }),
      play: () => {}, pause: () => {}, toggle: () => {}, skip: () => {}, seekTo: () => {},
      setSpeed: () => {}, setSleep: () => {}, next: () => {}, prev: () => {}, playIndex: () => {},
      setQueue: () => {}, queue: [], index: -1,
    };
  }
  Audio_ = (function(){
  const el = document.createElement("audio");
  el.preload = "metadata";
  el.setAttribute("playsinline","");
  document.body.appendChild(el);

  let queue = [];          // [{slug,title,dur,audio,image,artist,onChange}]
  let idx = -1;
  let loopQueue = false;   // when true, advancing past the end wraps to index 0
  let simTimer = null, simSec = 0, simTotal = 0, simPlaying = false;
  let speed = 1;
  let sleepAt = 0, sleepMin = 0;
  const listeners = new Set();
  const sub = fn => { listeners.add(fn); return ()=>listeners.delete(fn); };
  // persist listening position per track (feeds Continue Listening for
  // messages AND podcast episodes); throttled to one write every few seconds
  let _lastPosSave = 0;
  function persistPos(){
    try{
      const c=cur(); if(!c || !c.slug) return;
      const t = hasReal()? el.currentTime : simSec;
      const total = hasReal()? (el.duration||0) : simTotal;
      if(!total || t<5) return;
      state.audioPos[c.slug]={ sec:Math.round(t), total:Math.round(total) };
      const now=Date.now();
      if(now-_lastPosSave>4000){ _lastPosSave=now; save("ms_audiopos", state.audioPos); }
    }catch(e){}
  }
  const emit = () => { persistPos(); listeners.forEach(fn=>{ try{ fn(status()); }catch(e){} }); };

  const cur = () => idx>=0 && idx<queue.length ? queue[idx] : null;
  const hasReal = () => { const c=cur(); return !!(c && c.audio); };
  const parseDur = txt => { if(typeof txt==="number") return txt; let s=0; const h=/(\d+)\s*hr/.exec(txt||""); const m=/(\d+)\s*min/.exec(txt||""); if(h)s+=parseInt(h[1])*3600; if(m)s+=parseInt(m[1])*60; return s||1800; };

  function status(){
    const c=cur();
    const real=hasReal();
    return {
      item:c, index:idx, length:queue.length,
      playing: real ? !el.paused : simPlaying,
      cur: real ? (el.currentTime||0) : simSec,
      total: real ? (el.duration||parseDur(c&&c.dur)) : simTotal,
      speed, sleepMin,
      hasNext: loopQueue ? queue.length>1 : idx < queue.length-1,
      hasPrev: loopQueue ? queue.length>1 : idx > 0,
    };
  }

  function setMediaSession(){
    if(!("mediaSession" in navigator)) return;
    const c=cur(); if(!c) return;
    try{
      navigator.mediaSession.metadata = new MediaMetadata({
        title: c.title||"", artist: c.artist||"Emmanuel I. Emodiae",
        album: "eemodiae.org", artwork: c.image?[{src:c.image, sizes:"512x512", type:"image/jpeg"}]:[]
      });
      navigator.mediaSession.setActionHandler("play", play);
      navigator.mediaSession.setActionHandler("pause", pause);
      navigator.mediaSession.setActionHandler("previoustrack", prev);
      navigator.mediaSession.setActionHandler("nexttrack", next);
      navigator.mediaSession.setActionHandler("seekbackward", ()=>skip(-15));
      navigator.mediaSession.setActionHandler("seekforward", ()=>skip(15));
    }catch(e){}
  }

  function loadCurrent(autoplay){
    const c=cur(); if(!c) return;
    stopSim();
    if(c.audio){ el.src=c.audio; el.playbackRate=speed; if(autoplay) el.play().catch(()=>{}); }
    else { simTotal=parseDur(c.dur); simSec=(c._resume||0); if(autoplay) startSim(); }
    setMediaSession();
    if(c.onChange) c.onChange(idx);
    emit();
  }
  function startSim(){ simPlaying=true; clearInterval(simTimer); simTimer=setInterval(()=>{ simSec+=speed; if(sleepAt&&Date.now()>=sleepAt){ pause(); sleepAt=0; sleepMin=0; toast("Sleep timer ended playback."); emit(); return; } if(simSec>=simTotal){ simSec=simTotal; onEnded(); return; } emit(); },1000); emit(); }
  function stopSim(){ simPlaying=false; clearInterval(simTimer); }

  function play(){ const c=cur(); if(!c) return; if(c.audio){ el.play().catch(()=>{}); } else { startSim(); } if("mediaSession" in navigator) navigator.mediaSession.playbackState="playing"; emit(); }
  function pause(){ const c=cur(); if(!c) return; if(c.audio){ el.pause(); } else { stopSim(); } if("mediaSession" in navigator) navigator.mediaSession.playbackState="paused"; emit(); }
  function toggle(){ status().playing ? pause() : play(); }
  function skip(delta){ const c=cur(); if(!c) return; if(c.audio){ el.currentTime=Math.max(0,Math.min((el.duration||0), el.currentTime+delta)); } else { simSec=Math.max(0,Math.min(simTotal, simSec+delta)); } emit(); }
  function seekTo(frac){ const st=status(); const t=Math.max(0,Math.min(st.total, frac*st.total)); const c=cur(); if(c&&c.audio){ el.currentTime=t; } else { simSec=t; } emit(); }
  function setSpeed(v){ speed=v; if(hasReal()) el.playbackRate=v; emit(); }
  function setSleep(min){ sleepMin=min; sleepAt = min>0 ? Date.now()+min*60000 : 0; emit(); }
  function onEnded(){ stopSim(); if(idx < queue.length-1){ idx++; loadCurrent(true); toast("Up next: "+(cur().title||"")); } else if(loopQueue && queue.length){ idx=0; loadCurrent(true); toast("Up next: "+(cur().title||"")); } else { if("mediaSession" in navigator) navigator.mediaSession.playbackState="paused"; emit(); } }
  function next(){ if(idx<queue.length-1){ idx++; loadCurrent(true); } else if(loopQueue && queue.length){ idx=0; loadCurrent(true); } }
  function prev(){ if(idx>0){ idx--; loadCurrent(true); } else if(loopQueue && queue.length){ idx=queue.length-1; loadCurrent(true); } }
  function playIndex(i){ if(i>=0&&i<queue.length){ idx=i; loadCurrent(true); } }

  el.addEventListener("ended", onEnded);
  el.addEventListener("timeupdate", ()=>{ if(hasReal()) { if(sleepAt&&Date.now()>=sleepAt){ pause(); sleepAt=0; sleepMin=0; toast("Sleep timer ended playback."); } emit(); } });
  el.addEventListener("play", emit); el.addEventListener("pause", emit); el.addEventListener("loadedmetadata", emit);

  /* set a fresh queue; keepPos lets a re-open resume the same track/time */
  function setQueue(items, startIndex, opts){
    opts=opts||{};
    loopQueue = !!opts.loop;
    // preserve current playback if same track is still in the new queue and opts.preserve
    const wasItem = cur();
    queue = items.slice();
    idx = Math.max(0, Math.min(startIndex||0, queue.length-1));
    if(opts.preserve && wasItem){
      const found = queue.findIndex(x=>x.slug===wasItem.slug);
      if(found>=0){ idx=found; setMediaSession(); if(cur().onChange) cur().onChange(idx); emit(); return; }
    }
    loadCurrent(!!opts.autoplay);
  }

  return { sub, status, play, pause, toggle, skip, seekTo, setSpeed, setSleep, next, prev, playIndex, setQueue,
           get index(){return idx;}, get queue(){return queue;} };
  })();
  return Audio_;
}

/* Session store. On the live site swap for window.localStorage to persist
   across visits; artifacts block browser storage so we use memory here. */
const memoryStore = {};
const store = {
  getItem(k) {
    if (typeof window !== "undefined") {
      try { return window.localStorage.getItem(k); } catch { /* ignore */ }
    }
    return k in memoryStore ? memoryStore[k] : null;
  },
  setItem(k, v) {
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem(k, String(v)); return; } catch { /* ignore */ }
    }
    memoryStore[k] = String(v);
  },
  removeItem(k) {
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(k); return; } catch { /* ignore */ }
    }
    delete memoryStore[k];
  },
};
const load = (k, d) => { try{ const v = store.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } };
const save = (k, v) => { try{ store.setItem(k, JSON.stringify(v)); }catch(e){} };

/* placeholder topics so the "More" block is always visible even before
   the CMS supplies overflow content. Marked placeholder:true (non-playing). */
function placeholderTopics(kind){
  const sets = {
    message: ["Success Covenant", "Speaking the Word", "Christ the Believer's Mantle"],
    series:  ["Foundations of Prayer", "The Names of God", "Journey Through Romans", "Spirit and Truth"],
    episode: ["Stillness Before God", "Faith in the Waiting", "The Grace That Carries", "Rooted and Grounded"],
  };
  const subs = { message: AUTHOR, series: "Coming soon", episode: "Coming soon" };
  return (sets[kind]||sets.message).map((t,i)=>({ slug:"placeholder-"+kind+"-"+i, title:t, sub:subs[kind]||"Coming soon", placeholder:true }));
}
/* convert a content record into an AudioEngine track.
   kind: 'message' | 'sermon' | 'episode'. audio URL comes from
   the CMS (item.audio); absent now, so the engine simulates. */
function toTrack(item, kind, extra){
  extra=extra||{};
  return {
    slug: item.slug || extra.slug,
    title: item.title,
    dur: item.dur || extra.dur || "30 min",
    audio: item.audio || "",           // <-- live MP3 URL from CMS goes here
    image: item.image || "",
    artist: AUTHOR_FULL || "Emmanuel I. Emodiae",
    _resume: 0,
  };
}


/* ============================================================
   STATE
   ============================================================ */
const state = {
  tab:"series",           // series | messages | podcasts
  view:"landing",         // landing | seriesDetail | messageDetail | episodeDetail
  q:"",
  pageSeries:1, pageMsg:1, pagePodSeries:1, pagePodEps:1,
  podTab:"series",        // series | episodes
  podSeriesFilter:null,   // slug of podcast series to filter episodes by
  podTheme:"All",         // episode topic chip filter
  podSort:"newest",       // newest | oldest (by release date)
  continueDismissed:false,   // user closed the Continue Listening box this session
  curSeries:null, curLesson:0, curMessage:null, curEpisode:null,
  sortMsg:"featured", sortSeries:"featured",
  filterMsg:"All", filterSeries:"All",
  savedOnly:false,
  progress: load("ms_progress", {}),   // { seriesSlug: {done:[idx], last:idx} }
  bookmarks: new Set(load("ms_bookmarks", [])),   // message slugs
  epBookmarks: new Set(load("ms_ep_bookmarks", [])),   // podcast episode slugs
  recent: load("ms_recent", []),       // [{kind,slug,title}]
  audioPos: load("ms_audiopos", {}),   // { messageSlug: {sec,total} } continue-listening
  notes: load("ms_notes", {}),         // { messageSlug: "personal note text" }
};

function persistBookmarks(){ save("ms_bookmarks", [...state.bookmarks]); }
function persistEpBookmarks(){ save("ms_ep_bookmarks", [...state.epBookmarks]); }
/* release date, elegantly formatted (e.g. June 19, 2026) */
function fmtDate(iso){
  if(!iso) return "";
  const d=new Date(iso+"T00:00:00");
  if(isNaN(d)) return iso;
  return d.toLocaleDateString("en-US",{ month:"long", day:"numeric", year:"numeric" });
}
function pushRecent(kind, slug, title){
  state.recent = state.recent.filter(r=>!(r.kind===kind && r.slug===slug));
  state.recent.unshift({ kind, slug, title });
  state.recent = state.recent.slice(0, 8);
  save("ms_recent", state.recent);
}
/* messages that are partly played (for Continue Listening) */
function inProgressMessages(){
  const seen=new Set();
  return Object.keys(state.audioPos)
    .map(slug=>({ slug, ...state.audioPos[slug] }))
    .filter(x=> x.sec>5 && x.total && x.sec < x.total*0.97)
    .sort((a,b)=> (b.sec/b.total) - (a.sec/a.total))
    .map(x=>{
      const m=MESSAGES.find(mm=>mm.slug===x.slug);
      if(m) return dedupe("message", m, x);
      const ep=POD_EPISODES.find(ee=>ee.slug===x.slug);
      if(ep) return dedupe("episode", ep, x);
      // series sermon composite key: "<seriesSlug>__<idx>__L<loop>"
      const cm=/^(.+)__(\d+)__L\d+$/.exec(x.slug);
      if(cm){
        const ser=SERIES.find(s=>s.slug===cm[1]);
        const sm=ser && ser.sermons && ser.sermons[parseInt(cm[2],10)];
        if(ser && sm) return dedupe("sermon", { title:sm.title, dur:sm.dur, seriesSlug:ser.slug, sermonIdx:parseInt(cm[2],10) }, x);
      }
      return null;
    })
    .filter(Boolean).slice(0,4);
  function dedupe(kind, item, x){
    const key=kind+":"+item.title;
    if(seen.has(key)) return null; seen.add(key);
    return { kind, item, pct:Math.round(x.sec/x.total*100) };
  }
}

/* Broadened search: title, summary/overview, scripture, category, year, speaker */
const searchText = item => [
  item.title, item.summary, item.overview, item.desc,
  item.scripture, item.mainScripture, (item.scriptures||[]).join(" "),
  item.category, item.theme, item.kicker, item.year, item.date, AUTHOR
].filter(Boolean).join(" ").toLowerCase();
const slugMatch = (item, q) => !q || searchText(item).includes(q.toLowerCase());

/* encouragement band (review's closing call) */
function encourageBand(){
  const el=document.createElement("div");
  el.className="ms-encourage";
  el.innerHTML=`<img class="ms-encourage__img" src="${ENCOURAGE_IMG}" alt="Continue Listening. Continue Learning. Continue Growing. Every message is a door, keep walking with Christ one teaching at a time.">`;
  return el;
}

/* bottom "Back to X" link — mirrors the top back button, placed at
   the base of the page after the main content, before the footer. */
function bottomBackButton(label, onClick){
  const el=document.createElement("button");
  el.className="ms-back ms-back--bottom";
  el.innerHTML=`${IC.chevL} ${label}`;
  el.addEventListener("click", onClick);
  return el;
}

/* series progress helpers */
function seriesProgress(s){
  const p = state.progress[s.slug] || { done:[], last:0 };
  const done = new Set(p.done||[]).size;
  const total = s.sermons.length;
  return { done, total, last:p.last||0, pct: total?Math.round(done/total*100):0, remaining: total-done };
}
function markLessonDone(slug, idx){
  const p = state.progress[slug] || { done:[], last:0 };
  const set = new Set(p.done||[]); set.add(idx);
  state.progress[slug] = { done:[...set], last:idx };
  save("ms_progress", state.progress);
}

/* ============================================================
   REUSABLE PAGINATION
   renders numbered pager with prev/next; no hard-coded limits
   ============================================================ */
function paginate(total, perPage, currentPage, onGo){
  const pages = Math.max(1, Math.ceil(total/perPage));
  const cur = Math.min(currentPage, pages);
  const el = document.createElement("div");
  el.className = "ms-pager";
  const mk = (label, page, opts={}) => {
    const b = document.createElement("button");
    b.innerHTML = label;
    if(opts.num) b.classList.add("ms-pager__num");
    if(opts.on){ b.classList.add("ms-pager__num--on"); b.setAttribute("aria-current","page"); }
    if(opts.disabled) b.disabled = true;
    if(!opts.disabled && !opts.on) b.addEventListener("click",()=>{ onGo(page); window.scrollTo({top:0,behavior:"smooth"}); });
    return b;
  };
  el.appendChild(mk("Prev", cur-1, { disabled: cur<=1 }));
  // windowed page numbers
  const win = [];
  const push = p => { if(!win.includes(p) && p>=1 && p<=pages) win.push(p); };
  push(1); push(2); push(pages); push(pages-1);
  for(let p=cur-1;p<=cur+1;p++) push(p);
  win.sort((a,b)=>a-b);
  let prev=0;
  win.forEach(p=>{
    if(p-prev>1){ const s=document.createElement("span"); s.className="ms-pager__ellipsis"; s.textContent="…"; el.appendChild(s); }
    el.appendChild(mk(String(p), p, { num:true, on:p===cur }));
    prev=p;
  });
  el.appendChild(mk("Next", cur+1, { disabled: cur>=pages }));
  return el;
}

/* ============================================================
   LANDING (hero + search + tabs + active section)
   ============================================================ */
function renderLanding(){
  state.view = "landing";
  const root = app();
  root.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "ms-wrap";

  // hero — the top banner follows the active tab: the Messages banner for
  // Series/Messages, and ONLY the podcast banner when Podcasts is selected
  const heroSrc = state.tab==="podcasts" ? POD_BANNER : HERO_LANDING;
  const heroAlt = state.tab==="podcasts"
    ? "Fresh from the Spirit — Podcast. Listen. Grow. Walk in truth."
    : "Messages — Christ-centered teachings, timeless truth, and messages that transform";
  wrap.innerHTML = `
    <div class="ms-hero ms-hero--banner">
      <img class="ms-hero__bannerimg" src="${heroSrc}" alt="${heroAlt}">
    </div>
    <div class="ms-search" role="search">
      ${IC.search}
      <input type="search" id="msSearch" placeholder="Search messages, series and podcasts..." aria-label="Search messages, series and podcasts" value="${state.q.replace(/"/g,'&quot;')}">
    </div>
    <div class="ms-tabs" role="tablist" aria-label="Sections">
      <button class="ms-tab ${state.tab==='series'?'ms-tab--on':''}" role="tab" aria-selected="${state.tab==='series'}" data-tab="series">Series</button>
      <button class="ms-tab ${state.tab==='messages'?'ms-tab--on':''}" role="tab" aria-selected="${state.tab==='messages'}" data-tab="messages">Messages</button>
      <button class="ms-tab ${state.tab==='podcasts'?'ms-tab--on':''}" role="tab" aria-selected="${state.tab==='podcasts'}" data-tab="podcasts">Podcasts</button>
    </div>
    <div id="msContinueRail"></div>
    <div id="msSection" role="main" aria-label="Messages content"></div>
  `;
  root.appendChild(wrap);

  // Continue Listening rail (in-progress messages)
  renderContinueRail();

  // wire search + tabs (absent on the podcasts view)
  const searchEl = $("msSearch");
  if(searchEl) searchEl.addEventListener("input", e=>{
    state.q = e.target.value.trim();
    state.pageSeries=1; state.pageMsg=1; state.pagePodEps=1; state.pagePodSeries=1;
    renderSection();
  });
  wrap.querySelectorAll(".ms-tab").forEach(t=>{
    t.addEventListener("click",()=>{
      state.tab=t.dataset.tab;
      if(state.tab!=="podcasts") state.podTab="series";
      renderLanding();
    });
  });

  renderSection();
  root.appendChild(encourageBand());
  const foot=document.createElement("div"); foot.className="ms-foot"; foot.setAttribute("aria-hidden","true");
  root.appendChild(foot);
}

function renderContinueRail(){
  const host=$("msContinueRail"); if(!host) return;
  host.innerHTML="";
  // Continue Listening never shows on the podcast page
  if(state.tab==="podcasts") return;
  if(state.continueDismissed) return;
  const items=inProgressMessages();
  if(!items.length) return;
  const sec=document.createElement("div"); sec.className="ms-continue-rail";
  sec.innerHTML=`<div class="ms-continue-rail__head">${IC.play} Continue Listening
    <button class="ms-continue-rail__close" id="msContinueClose" aria-label="Close Continue Listening">${IC.close}</button></div>`;
  const row=document.createElement("div"); row.className="ms-continue-rail__row";
  items.forEach(({kind,item,pct})=>{
    const c=document.createElement("button"); c.className="ms-continue-chip";
    const src = kind==="episode" ? " · Podcast" : (kind==="sermon" ? " · Series" : "");
    c.innerHTML=`<div class="ms-continue-chip__title">${item.title}</div>
      <div class="ms-continue-chip__bar"><div style="width:${pct}%"></div></div>
      <div class="ms-continue-chip__meta">${pct}% · ${item.dur}${src}</div>`;
    c.addEventListener("click",()=>{
      if(kind==="episode") openEpisode(item.slug);
      else if(kind==="sermon") openSeries(item.seriesSlug);
      else openMessage(item.slug);
    });
    row.appendChild(c);
  });
  sec.appendChild(row); host.appendChild(sec);
  const close=$("msContinueClose");
  if(close) close.addEventListener("click",()=>{ state.continueDismissed=true; host.innerHTML=""; });
}

function renderSection(){
  const host = $("msSection");
  host.innerHTML = "";
  if(state.tab==="series") renderSeriesSection(host);
  else if(state.tab==="messages") renderMessagesSection(host);
  else renderPodcastsSection(host);
}

/* featured lead card (series or message) */
function featuredCard({ kind, title, sub, meta, onOpen }){
  const btn=document.createElement("button");
  btn.className="ms-featured-card ms-anim";
  btn.setAttribute("aria-label","Open "+title);
  btn.innerHTML=`
    <div class="ms-featured-card__art"><div class="ms-featured-card__crest">EIE</div><span class="ms-featured-card__badge">${kind}</span></div>
    <div class="ms-featured-card__body">
      <div class="ms-featured-card__title">${title}</div>
      <div class="ms-featured-card__sub">${(sub||"").slice(0,180)}${(sub||"").length>180?"...":""}</div>
      <div class="ms-featured-card__meta">${meta||""}</div>
      <span class="ms-featured-card__go">Open ${IC.chevR}</span>
    </div>`;
  btn.addEventListener("click",onOpen);
  return btn;
}

/* ---- shared filter + sort + controls ---- */
function categoriesOf(list){
  const set = new Set();
  list.forEach(x=> (x.category?[x.category]:[]).forEach(c=>set.add(c)));
  return ["All", ...Array.from(set).sort()];
}
function applyFilterSort(list, filter, sort){
  let out = list.filter(x=> filter==="All" || x.category===filter);
  if(sort==="az") out=[...out].sort((a,b)=>a.title.localeCompare(b.title));
  else if(sort==="za") out=[...out].sort((a,b)=>b.title.localeCompare(a.title));
  else if(sort==="newest") out=[...out].sort((a,b)=>String(b.year||"").localeCompare(String(a.year||"")));
  return out;
}
function buildControls({ cats, activeFilter, onFilter, sortVal, onSort, savedActive, onSaved, savedCount }){
  const box=document.createElement("div"); box.className="ms-controls2";
  const chips=document.createElement("div"); chips.className="ms-chips"; chips.setAttribute("role","group"); chips.setAttribute("aria-label","Filter by category");
  cats.forEach(c=>{
    const b=document.createElement("button");
    b.className="ms-chip"+(c===activeFilter?" ms-chip--on":"");
    b.textContent=c; b.setAttribute("aria-pressed", c===activeFilter);
    b.addEventListener("click",()=>onFilter(c));
    chips.appendChild(b);
  });
  const right=document.createElement("div"); right.className="ms-controls2__right";
  if(onSaved){
    const sv=document.createElement("button");
    sv.className="ms-saved-tab"+(savedActive?" ms-saved-tab--on":"");
    sv.setAttribute("aria-pressed", savedActive);
    sv.innerHTML=`${IC.bookmark}<span>${savedCount?("Saved ("+savedCount+")"):"Saved"}</span>`;
    sv.addEventListener("click",onSaved);
    right.appendChild(sv);
  }
  const sortWrap=document.createElement("label"); sortWrap.className="ms-sort";
  sortWrap.innerHTML=`<span>Sort</span>`;
  const sel=document.createElement("select"); sel.setAttribute("aria-label","Sort");
  [["featured","Featured"],["newest","Newest"],["az","A to Z"],["za","Z to A"]].forEach(([v,l])=>{
    const o=document.createElement("option"); o.value=v; o.textContent=l; if(v===sortVal)o.selected=true; sel.appendChild(o);
  });
  sel.addEventListener("change",()=>onSort(sel.value));
  sortWrap.appendChild(sel); right.appendChild(sortWrap);
  box.appendChild(chips); box.appendChild(right);
  return box;
}

/* build a single series card */
function seriesCard(s, idx){
  const card=document.createElement("button");
  card.className="ms-series-card ms-anim"; card.style.animationDelay=(idx*0.05)+"s";
  card.setAttribute("aria-label","Open series: "+s.title);
  const time = s.sermons.reduce((a,l)=>a+parseInt(l.dur)||0,0);
  const prog = seriesProgress(s);
  card.innerHTML = `
    ${s.image?`<img src="${s.image}" alt="">`:''}
    <div class="ms-series-card__veil"></div>
    <div class="ms-series-card__badge">Series</div>
    <div class="ms-series-card__body">
      <div class="ms-series-card__title">${s.title}</div>
      <div class="ms-series-card__meta">
        <span>${IC.layers} ${s.sermons.length} sermons</span>
        <span>${IC.clock} ${time} min</span>
      </div>
      ${prog.done>0?`<div class="ms-cardprog" aria-label="${prog.done} of ${s.sermons.length} sermons completed"><div class="ms-cardprog__fill" style="width:${prog.pct}%"></div></div>`:''}
    </div>
    <div class="ms-series-card__go">${IC.chevR}</div>`;
  card.addEventListener("click",()=>openSeries(s.slug));
  return card;
}

/* ---- Series tab ---- */
function renderSeriesSection(host){
  const sec = document.createElement("div"); sec.className="ms-sec";
  const cats = categoriesOf(SERIES);
  sec.appendChild(buildControls({
    cats, activeFilter:state.filterSeries,
    onFilter:c=>{ state.filterSeries=c; state.pageSeries=1; renderSection(); },
    sortVal:state.sortSeries, onSort:v=>{ state.sortSeries=v; state.pageSeries=1; renderSection(); },
  }));

  let items = applyFilterSort(SERIES.filter(s=>slugMatch(s,state.q)), state.filterSeries, state.sortSeries);
  if(!items.length){ sec.innerHTML+=`<div class="ms-empty">No series match. Try another word or filter.</div>`; host.appendChild(sec); return; }

  // featured (page 1, no search/filter)
  const featured = state.pageSeries===1 && state.filterSeries==="All" && !state.q;
  let working = items;
  if(featured){
    const lead=items[0]; working=items.slice(1);
    sec.appendChild(featuredCard({ kind:"Featured Series", title:lead.title, sub:lead.summary,
      meta:`${lead.sermons.length} sermons · ${lead.scripture}`, onOpen:()=>openSeries(lead.slug) }));
  }
  const start=(state.pageSeries-1)*PER_PAGE;
  const slice=working.slice(start,start+PER_PAGE);
  const grid=document.createElement("div"); grid.className="ms-grid";
  slice.forEach((s,idx)=>grid.appendChild(seriesCard(s,idx)));
  sec.appendChild(grid);
  sec.appendChild(paginate(working.length, PER_PAGE, state.pageSeries, p=>{ state.pageSeries=p; renderSection(); }));
  host.appendChild(sec);
}

/* build a single message card */
function messageCard(m, idx){
  const card=document.createElement("button");
  card.className="ms-msg-card ms-anim"; card.style.animationDelay=(idx*0.05)+"s";
  card.setAttribute("aria-label","Open message: "+m.title);
  const saved=state.bookmarks.has(m.slug);
  card.innerHTML=`
    <div class="ms-msg-card__art">
      ${m.image?`<img src="${m.image}" alt="">`:`<div class="ms-msg-card__crest">EIE</div>`}
      <div class="ms-msg-card__actions">
        <span class="ms-icon-btn${saved?' ms-icon-btn--on':''}" role="button" aria-label="${saved?'Saved':'Save'}" data-act="save">${IC.bookmark}</span>
        <span class="ms-icon-btn" role="button" aria-label="Share" data-act="share">${IC.share}</span>
        <span class="ms-icon-btn" role="button" aria-label="Download" data-act="download">${IC.download}</span>
      </div>
    </div>
    <div class="ms-msg-card__body">
      <div class="ms-msg-card__title">${m.title}</div>
      <div class="ms-msg-card__author">${AUTHOR}</div>
      <div class="ms-msg-card__foot">
        <span class="ms-dur">${IC.clock} ${m.dur}</span>
        <span>${m.category||"Message"}${m.year?" · "+m.year:""}</span>
      </div>
    </div>`;
  card.querySelector('[data-act="save"]').addEventListener("click",e=>{
    e.stopPropagation();
    const el=e.currentTarget;
    if(state.bookmarks.has(m.slug)){ state.bookmarks.delete(m.slug); el.classList.remove("ms-icon-btn--on"); el.setAttribute("aria-label","Save"); toast("Removed from saved."); }
    else { state.bookmarks.add(m.slug); el.classList.add("ms-icon-btn--on"); el.setAttribute("aria-label","Saved"); toast("Saved for later."); }
    persistBookmarks();
    if(state.savedOnly) renderSection();
  });
  card.querySelector('[data-act="share"]').addEventListener("click",e=>{ e.stopPropagation(); shareMessage(m); });
  card.querySelector('[data-act="download"]').addEventListener("click",e=>{ e.stopPropagation(); toast("Preparing download for \u201C"+m.title+"\u201D."); });
  card.addEventListener("click",e=>{ if(!e.target.closest(".ms-icon-btn")) openMessage(m.slug); });
  return card;
}

/* ---- Messages tab ---- */
function renderMessagesSection(host){
  const sec=document.createElement("div"); sec.className="ms-sec";
  const cats = categoriesOf(MESSAGES);
  sec.appendChild(buildControls({
    cats, activeFilter:state.filterMsg,
    onFilter:c=>{ state.filterMsg=c; state.pageMsg=1; renderSection(); },
    sortVal:state.sortMsg, onSort:v=>{ state.sortMsg=v; state.pageMsg=1; renderSection(); },
    savedActive:state.savedOnly, savedCount:state.bookmarks.size,
    onSaved:()=>{ if(!state.savedOnly && state.bookmarks.size===0){ toast("You have not saved any messages yet."); return; } state.savedOnly=!state.savedOnly; state.pageMsg=1; renderSection(); },
  }));

  let base = MESSAGES.filter(m=>slugMatch(m,state.q));
  if(state.savedOnly) base = base.filter(m=>state.bookmarks.has(m.slug));
  let items = applyFilterSort(base, state.filterMsg, state.sortMsg);
  if(!items.length){ sec.appendChild(emptyEl(state.savedOnly?"No saved messages yet. Tap the ribbon on any message to save it.":"No messages match. Try another word or filter.")); host.appendChild(sec); return; }

  const featured = state.pageMsg===1 && state.filterMsg==="All" && !state.q && !state.savedOnly;
  let working=items;
  if(featured){
    const lead=items[0]; working=items.slice(1);
    sec.appendChild(featuredCard({ kind:"Featured Message", title:lead.title, sub:lead.overview,
      meta:`${AUTHOR} · ${lead.dur}${lead.mainScripture?" · "+lead.mainScripture:""}`, onOpen:()=>openMessage(lead.slug) }));
  }
  const start=(state.pageMsg-1)*PER_PAGE;
  const slice=working.slice(start,start+PER_PAGE);
  const grid=document.createElement("div"); grid.className="ms-grid ms-grid--3";
  slice.forEach((m,idx)=>grid.appendChild(messageCard(m,idx)));
  sec.appendChild(grid);
  sec.appendChild(paginate(working.length, PER_PAGE, state.pageMsg, p=>{ state.pageMsg=p; renderSection(); }));
  host.appendChild(sec);
}
function emptyEl(txt){ const d=document.createElement("div"); d.className="ms-empty"; d.textContent=txt; return d; }

/* ---- Podcasts tab (own hero + Series/Episodes subtabs) ---- */
function renderPodcastsSection(host){
  const sec=document.createElement("div"); sec.className="ms-sec";
  sec.innerHTML=`
    <div class="ms-pod-sub">
      <p class="ms-pod-sub__tag">Explore series and latest episodes from the Fresh from the Spirit podcast.</p>
      <div class="ms-pod-follow">
        <a class="ms-follow-btn" id="msSubApple" target="_blank" rel="noopener">${IC.mic} Apple Podcasts</a>
        <a class="ms-follow-btn" id="msSubSpotify" target="_blank" rel="noopener">${IC.play} Spotify</a>
        <a class="ms-follow-btn" id="msSubRss" target="_blank" rel="noopener">${IC.layers} RSS Feed</a>
      </div>
    </div>
    <div id="msPodLatest"></div>
    <div class="ms-subtabs" role="tablist">
      <button class="ms-subtab ${state.podTab==='series'?'ms-subtab--on':''}" role="tab" aria-selected="${state.podTab==='series'}" data-pod="series">Series</button>
      <button class="ms-subtab ${state.podTab==='episodes'?'ms-subtab--on':''}" role="tab" aria-selected="${state.podTab==='episodes'}" data-pod="episodes">Episodes</button>
    </div>
    <div id="msPodBody"></div>`;
  host.appendChild(sec);
  sec.querySelector("#msSubApple").href=POD_SUBSCRIBE.apple;
  sec.querySelector("#msSubSpotify").href=POD_SUBSCRIBE.spotify;
  sec.querySelector("#msSubRss").href=POD_SUBSCRIBE.rss;
  // Latest Episode spotlight: the newest release, front and center
  const latest=[...POD_EPISODES].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0];
  if(latest){
    const series=POD_SERIES.find(s=>s.slug===latest.seriesSlug);
    sec.querySelector("#msPodLatest").appendChild(featuredCard({
      kind:"Latest Episode",
      title:latest.title,
      sub:latest.desc,
      meta:[latest.kicker, series&&series.title, fmtDate(latest.date), latest.dur].filter(Boolean).join(" · "),
      onOpen:()=>openEpisode(latest.slug)
    }));
  }
  sec.querySelectorAll(".ms-subtab").forEach(t=>t.addEventListener("click",()=>{ state.podTab=t.dataset.pod; state.podSeriesFilter=null; state.pagePodEps=1; state.pagePodSeries=1; renderSection(); }));
  renderPodBody();
}

function renderPodBody(){
  const body=$("msPodBody"); if(!body) return;
  body.innerHTML="";
  if(state.podTab==="series"){
    const items=POD_SERIES.filter(s=>slugMatch(s,state.q));
    if(!items.length){ body.appendChild(emptyEl("No podcast series found.")); return; }
    const start=(state.pagePodSeries-1)*PER_PAGE;
    const slice=items.slice(start,start+PER_PAGE);
    const grid=document.createElement("div"); grid.className="ms-grid"; grid.style.marginTop="24px";
    slice.forEach((s,idx)=>{
      const card=document.createElement("button");
      card.className="ms-series-card ms-anim"; card.style.animationDelay=(idx*0.05)+"s";
      card.setAttribute("aria-label","Show episodes from "+s.title);
      const epCount=POD_EPISODES.filter(e=>e.seriesSlug===s.slug).length||s.count;
      card.innerHTML=`
        ${s.image?`<img src="${s.image}" alt="">`:''}
        <div class="ms-series-card__veil"></div>
        <div class="ms-series-card__badge">Podcast</div>
        <div class="ms-series-card__body">
          <div class="ms-series-card__title">${s.title}</div>
          <div class="ms-series-card__meta"><span>${IC.mic} ${epCount} episodes</span></div>
        </div>
        <div class="ms-series-card__go">${IC.chevR}</div>`;
      card.addEventListener("click",()=>{ openPodSeries(s.slug); });
      grid.appendChild(card);
    });
    body.appendChild(grid);
    body.appendChild(paginate(items.length, PER_PAGE, state.pagePodSeries, p=>{ state.pagePodSeries=p; renderPodBody(); }));
  } else {
    let items=POD_EPISODES.filter(e=>slugMatch(e,state.q));
    if(state.podSeriesFilter) items=items.filter(e=>e.seriesSlug===state.podSeriesFilter);
    // topic chips + sort (Newest/Oldest by release date)
    const themes=["All", ...Array.from(new Set(POD_EPISODES.map(e=>e.theme).filter(Boolean))).sort()];
    const bar=document.createElement("div"); bar.className="ms-controls2";
    const chips=document.createElement("div"); chips.className="ms-chips"; chips.setAttribute("role","group"); chips.setAttribute("aria-label","Filter episodes by topic");
    themes.forEach(c=>{
      const b=document.createElement("button");
      b.className="ms-chip"+(c===state.podTheme?" ms-chip--on":"");
      b.textContent=c; b.setAttribute("aria-pressed", c===state.podTheme);
      b.addEventListener("click",()=>{ state.podTheme=c; state.pagePodEps=1; renderPodBody(); });
      chips.appendChild(b);
    });
    const right=document.createElement("div"); right.className="ms-controls2__right";
    const sortWrap=document.createElement("label"); sortWrap.className="ms-sort";
    sortWrap.innerHTML=`<span>Sort</span>`;
    const sel=document.createElement("select"); sel.setAttribute("aria-label","Sort episodes");
    [["newest","Newest"],["oldest","Oldest"]].forEach(([v,l])=>{
      const o=document.createElement("option"); o.value=v; o.textContent=l; if(v===state.podSort)o.selected=true; sel.appendChild(o);
    });
    sel.addEventListener("change",()=>{ state.podSort=sel.value; state.pagePodEps=1; renderPodBody(); });
    sortWrap.appendChild(sel); right.appendChild(sortWrap);
    bar.appendChild(chips); bar.appendChild(right);
    body.appendChild(bar);
    // apply topic filter + date sort
    if(state.podTheme!=="All") items=items.filter(e=>e.theme===state.podTheme);
    items=[...items].sort((a,b)=> state.podSort==="oldest"
      ? String(a.date||"").localeCompare(String(b.date||""))
      : String(b.date||"").localeCompare(String(a.date||"")));
    // filter banner
    if(state.podSeriesFilter){
      const sName=(POD_SERIES.find(s=>s.slug===state.podSeriesFilter)||{}).title||"series";
      const banner=document.createElement("div"); banner.className="ms-filter-banner";
      banner.innerHTML=`<span>Episodes from <b>${sName}</b></span><button class="ms-chip-btn" id="msClearPod">Show all episodes</button>`;
      banner.querySelector("#msClearPod").addEventListener("click",()=>{ state.podSeriesFilter=null; state.pagePodEps=1; renderPodBody(); });
      body.appendChild(banner);
    }
    if(!items.length){ body.appendChild(emptyEl("No episodes found.")); return; }
    const start=(state.pagePodEps-1)*EP_PER_PAGE;
    const slice=items.slice(start,start+EP_PER_PAGE);
    const list=document.createElement("div"); list.className="ms-eps";
    slice.forEach((ep,idx)=>{
      const row=document.createElement("div"); row.className="ms-ep ms-anim"; row.style.animationDelay=(idx*0.05)+"s";
      row.innerHTML=`
        <div class="ms-ep__art">${ep.image?`<img src="${ep.image}" alt="">`:''}</div>
        <div>
          <div class="ms-ep__kicker">${ep.kicker}${ep.date?" · "+fmtDate(ep.date):""}</div>
          <button class="ms-ep__title ms-ep__title--link" aria-label="Open ${ep.title}">${ep.title}</button>
          <div class="ms-player" data-ep="${ep.slug}">
            <button class="ms-player__play" aria-label="Play ${ep.title}">${IC.play}</button>
            <div class="ms-player__track"><div class="ms-player__fill"></div></div>
            <div class="ms-player__time">${ep.dur}</div>
          </div>
        </div>`;
      row.querySelector(".ms-ep__title--link").addEventListener("click",()=>openEpisode(ep.slug));
      wirePlayer(row.querySelector(".ms-player"), ep.dur);
      list.appendChild(row);
    });
    body.appendChild(list);
    body.appendChild(paginate(items.length, EP_PER_PAGE, state.pagePodEps, p=>{ state.pagePodEps=p; renderPodBody(); }));
  }
}

/* podcast series detail view — its own page with its own hero,
   mirroring how series and messages open, with Back to Podcasts
   under the hero and again at the bottom */
function openPodSeries(slug){
  const s=POD_SERIES.find(x=>x.slug===slug); if(!s) return;
  state.curPodSeries=s; state.view="podSeriesDetail"; Nav.openDetail();
  pushRecent("podseries", s.slug, s.title);
  window.scrollTo({top:0,behavior:"auto"});
  const root=app(); root.innerHTML="";
  const wrap=document.createElement("div"); wrap.className="ms-wrap"; wrap.style.paddingTop="0";

  const eps = POD_EPISODES.filter(e=>e.seriesSlug===s.slug);
  const totalMin = eps.reduce((a,e)=>a+(parseInt(e.dur,10)||0),0);

  // queue = this series' episodes, looping endlessly (series behavior)
  const queueItems = eps.map(e=>{ const t=toTrack(e,"episode"); t.sub=e.kicker+" · "+e.dur; return t; });

  wrap.innerHTML=`
    <div class="ms-detailwrap">
      <div class="ms-detailmain">
        <div class="ms-cleanhero" id="msHero"><div class="ms-cleanhero__crest">EIE</div></div>
        <button class="ms-back ms-back--top" id="msBack">${IC.chevL} Back to Podcasts</button>
        <div class="ms-detailhead">
          <div class="ms-detailhead__kicker">Podcast Series</div>
          <h1 class="ms-detailhead__title">${s.title}</h1>
          <div class="ms-detailhead__meta">
            <span>${IC.mic} ${eps.length||s.count} episodes</span>
            ${totalMin?`<span>${IC.clock} ${totalMin} min</span>`:""}
          </div>
        </div>
        <div class="ms-playerrow">
          <div class="ms-playerrow__player" id="msPlayerHost"></div>
          <div class="ms-playerrow__downloads ms-downloads" id="msDownloads">
            <button class="ms-dl" id="msPodSeriesShare">${IC.share} Share series</button>
            <button class="ms-dl" id="msPodEpShare">${IC.share} Share current episode</button>
            <a class="ms-dl" id="msPodEpDl">${IC.download} Download current episode</a>
          </div>
          <aside class="ms-playerrow__upnext" id="msUpNextHost"></aside>
        </div>

        <div class="ms-block" data-collapse="Overview">
          <div class="ms-overview"><p>${s.summary||""}</p></div>
        </div>

        <div class="ms-block">
          <div class="ms-block__head">Share What This Spoke to You</div>
          <div class="ms-respond" id="msRespond"></div>
        </div>

        <div class="ms-block ms-collection">
          <div class="ms-block__head">Episodes in this Series</div>
          <div class="ms-coll-grid" id="msEpColl"></div>
        </div>
      </div>
    </div>`;
  root.appendChild(wrap);
  wrap.appendChild(bottomBackButton("Back to Podcasts", ()=>{ Nav.toLandingFromButton("podcasts"); }));
  root.appendChild(encourageBand());
  const foot=document.createElement("div"); foot.className="ms-foot"; root.appendChild(foot);

  // hero: the series' own art, falling back to the podcast banner
  const hero=$("msHero");
  hero.style.backgroundImage=`url(${s.image || POD_BANNER})`; hero.classList.add("ms-cleanhero--img"); hero.innerHTML="";

  $("msBack").addEventListener("click",()=>{ Nav.toLandingFromButton("podcasts"); });

  // player + endlessly looping Up Next within this series
  if(queueItems.length){
    getAudioEngine().setQueue(queueItems, 0, { autoplay:false, loop:true });
    mountPlayer("msPlayerHost");
    wireLiveQueue({ upNextHostId:"msUpNextHost", headLabel:"Up Next", railCap:5 });
  }

  const curEp = ()=> (getAudioEngine().status().item || queueItems[0] || { title:s.title, slug:s.slug });

  $("msPodSeriesShare").addEventListener("click",async()=>{
    const text='"'+s.title+'" podcast series from eemodiae.org.\n'+shareUrl("podcast-series",s.slug);
    try{ if(navigator.share){ await navigator.share({ title:s.title, text }); return; } throw 0; }
    catch(e){ try{ await navigator.clipboard.writeText(text); }catch(_){}; toast("Series link copied."); }
  });
  $("msPodEpShare").addEventListener("click",async()=>{
    const ep=curEp();
    const text='"'+ep.title+'" podcast episode from eemodiae.org.\n'+shareUrl("podcast",ep.slug);
    try{ if(navigator.share){ await navigator.share({ title:ep.title, text }); return; } throw 0; }
    catch(e){ try{ await navigator.clipboard.writeText(text); }catch(_){}; toast("Episode link copied."); }
  });
  $("msPodEpDl").addEventListener("click",e=>{ e.preventDefault(); toast("Preparing episode download."); });

  // response box — stamped with the series and whichever episode is playing
  buildRespondBox($("msRespond"), {
    uid:"msPSR", kind:"Podcast",
    seriesTitle:s.title,
    get title(){ return curEp().title; },
    get url(){ return shareUrl("podcast",curEp().slug); },
    placeholder:"Share what this series stirred in you..."
  });

  // episode list (opens the episode's own page)
  renderCollection("msEpColl", eps.map(e=>({ slug:e.slug, title:e.title, sub:e.kicker+" · "+e.dur, image:e.image })),
    i=>{ openEpisode(eps[i].slug); });

  wireCollapsibles(wrap);
}

/* episode detail view */
function openEpisode(slug){
  const ep=POD_EPISODES.find(e=>e.slug===slug); if(!ep) return;
  state.curEpisode=ep; state.view="episodeDetail"; Nav.openDetail();
  if(_onNavigate) _onNavigate(ep.slug, "episode");
  pushRecent("episode", ep.slug, ep.title);
  window.scrollTo({top:0,behavior:"auto"});
  const root=app(); root.innerHTML="";
  const wrap=document.createElement("div"); wrap.className="ms-wrap"; wrap.style.paddingTop="0";
  const series=POD_SERIES.find(s=>s.slug===ep.seriesSlug);

  // queue = OPTION 2: this series' episodes first (in order), then every other
  // episode in the catalogue, looping endlessly so the chain never runs dry
  const family = POD_EPISODES.filter(e=>e.seriesSlug===ep.seriesSlug);
  const others = POD_EPISODES.filter(e=>e.seriesSlug!==ep.seriesSlug);
  const ordered = [...family, ...others];
  const startIdx = Math.max(0, ordered.findIndex(e=>e.slug===ep.slug));
  const queueItems = ordered.map(e=>{ const t=toTrack(e,"episode"); t.sub=e.kicker+" · "+e.dur; return t; });

  wrap.innerHTML=`
    <div class="ms-detailwrap">
      <div class="ms-detailmain">
        <div class="ms-cleanhero" id="msHero"><div class="ms-cleanhero__crest">EIE</div></div>
        <button class="ms-back ms-back--top" id="msBack">${IC.chevL} Back to Podcasts</button>
        <div class="ms-detailhead">
          <div class="ms-detailhead__kicker">Podcast${series?" · "+series.title:""}</div>
          <h1 class="ms-detailhead__title">${ep.title}</h1>
          <div class="ms-detailhead__meta">
            <span>${ep.guest ? "Guest: "+ep.guest : AUTHOR}</span>
            <span>${IC.mic} ${ep.kicker}</span>
            ${ep.date?`<span>${IC.scroll} ${fmtDate(ep.date)}</span>`:""}
            <span>${IC.clock} ${ep.dur}</span>
          </div>
        </div>
        <div class="ms-playerrow">
          <div class="ms-playerrow__player" id="msPlayerHost"></div>
          <div class="ms-playerrow__downloads ms-downloads" id="msDownloads">
            <a class="ms-dl" id="msEpDl">${IC.download} Download episode</a>
            <button class="ms-dl" id="msEpShare">${IC.share} Share episode</button>
            <button class="ms-dl ms-bookmark-btn${state.epBookmarks.has(ep.slug)?' ms-on':''}" id="msEpSave">${IC.bookmark} <span id="msEpSaveLabel">${state.epBookmarks.has(ep.slug)?'Saved':'Save'}</span></button>
          </div>
          <aside class="ms-playerrow__upnext" id="msUpNextHost"></aside>
        </div>

        <div class="ms-block" data-collapse="Overview">
          <div class="ms-overview"><p>${ep.desc}</p>${ep.notes?`<p>${ep.notes}</p>`:""}</div>
        </div>

        <div class="ms-block">
          <div class="ms-block__head">Share What This Spoke to You</div>
          <div class="ms-respond" id="msRespond"></div>
        </div>

        <div class="ms-block ms-collection">
          <div class="ms-block__head">More Episodes</div>
          <div class="ms-coll-grid" id="msMoreColl"></div>
        </div>
      </div>
    </div>`;
  root.appendChild(wrap);
  wrap.appendChild(bottomBackButton("Back to Podcasts", ()=>{ Nav.toLandingFromButton("podcasts"); }));
  root.appendChild(encourageBand());
  const foot=document.createElement("div"); foot.className="ms-foot"; root.appendChild(foot);

  const hero=$("msHero");
  hero.style.backgroundImage=`url(${ep.image || POD_BANNER})`; hero.classList.add("ms-cleanhero--img"); hero.innerHTML="";

  // whichever episode is CURRENTLY playing (header/share/save/respond follow it)
  let curEp = ep;
  function syncEpisodeDisplay(nep){
    curEp = nep;
    const nseries=POD_SERIES.find(s=>s.slug===nep.seriesSlug);
    const titleEl=wrap.querySelector(".ms-detailhead__title"); if(titleEl) titleEl.textContent=nep.title;
    const kickEl=wrap.querySelector(".ms-detailhead__kicker"); if(kickEl) kickEl.textContent="Podcast"+(nseries?" · "+nseries.title:"");
    const metaEl=wrap.querySelector(".ms-detailhead__meta");
    if(metaEl) metaEl.innerHTML=`<span>${nep.guest?"Guest: "+nep.guest:AUTHOR}</span><span>${IC.mic} ${nep.kicker}</span>${nep.date?`<span>${IC.scroll} ${fmtDate(nep.date)}</span>`:""}<span>${IC.clock} ${nep.dur}</span>`;
    const nheroImg=nep.image||POD_BANNER; hero.style.backgroundImage=`url(${nheroImg})`;
    syncEpSaveUI();
  }
  function syncEpSaveUI(){
    const btn=$("msEpSave"); if(!btn) return;
    const on=state.epBookmarks.has(curEp.slug);
    btn.classList.toggle("ms-on", on);
    const lbl=$("msEpSaveLabel"); if(lbl) lbl.textContent=on?"Saved":"Save";
  }

  $("msBack").addEventListener("click",()=>{ Nav.toLandingFromButton("podcasts"); });
  $("msEpDl").addEventListener("click",e=>{ e.preventDefault(); toast("Preparing download for \u201C"+curEp.title+"\u201D."); });
  $("msEpSave").addEventListener("click",()=>{
    if(state.epBookmarks.has(curEp.slug)){ state.epBookmarks.delete(curEp.slug); toast("Removed from saved."); }
    else { state.epBookmarks.add(curEp.slug); toast("Episode saved for later."); }
    persistEpBookmarks(); syncEpSaveUI();
  });
  $("msEpShare").addEventListener("click",async()=>{
    const text='"'+curEp.title+'" podcast episode from eemodiae.org.\n'+shareUrl("podcast",curEp.slug);
    try{ if(navigator.share){ await navigator.share({ title:curEp.title, text }); return; } throw 0; }
    catch(e){ try{ await navigator.clipboard.writeText(text); }catch(_){}; toast("Episode link copied."); }
  });

  // player + queue (auto-advance through the whole catalogue, series first, looping)
  getAudioEngine().setQueue(queueItems, startIdx, { autoplay:false, loop:true });
  mountPlayer("msPlayerHost");

  // Up Next + More Episodes form ONE combined loop: Up Next shows the next few,
  // More Episodes shows the rest of the chain, and the whole set rotates as one
  // circle as playback advances. It never runs dry.
  wireLiveQueue({
    upNextHostId:"msUpNextHost", moreHostId:"msMoreColl", headLabel:"Up Next", railCap:2, moreCap:12,
    onIndexChange:(idx,item)=>{
      if(!item) return;
      const nep=POD_EPISODES.find(x=>x.slug===item.slug);
      if(nep && nep.slug!==curEp.slug) syncEpisodeDisplay(nep);
    },
  });

  // response box (stamped as whichever episode is CURRENTLY playing)
  buildRespondBox($("msRespond"), {
    uid:"msER", kind:"Podcast",
    get title(){ return curEp.title; },
    get seriesTitle(){ const s=POD_SERIES.find(x=>x.slug===curEp.seriesSlug); return (s&&s.title)||""; },
    get url(){ return shareUrl("podcast",curEp.slug); },
    placeholder:"Share what this episode stirred in you..."
  });

  wireCollapsibles(wrap);
}

/* simulated player (no real audio URLs in this build) */
function wirePlayer(el, durLabel){
  if(!el) return;
  const btn=el.querySelector(".ms-player__play, .ms-audiobar__play");
  const fill=el.querySelector(".ms-player__fill, .ms-audiobar__fill");
  const timeEl=el.querySelector(".ms-player__time");
  let playing=false, pct=0, timer=null;
  btn.addEventListener("click",()=>{
    playing=!playing;
    btn.innerHTML = playing ? IC.pause : IC.play;
    if(playing){
      timer=setInterval(()=>{
        pct=Math.min(100,pct+0.6); fill.style.width=pct+"%";
        if(pct>=100){ playing=false; btn.innerHTML=IC.play; clearInterval(timer); }
      },200);
    } else clearInterval(timer);
  });
}

/* ============================================================
   SHARE / DOWNLOAD
   ============================================================ */
function shareUrl(kind, slug){
  if(kind==="message") return "https://eemodiae.org/messages/"+encodeURIComponent(slug);
  if(kind==="podcast"||kind==="episode") return "https://eemodiae.org/messages/podcasts/"+encodeURIComponent(slug);
  if(kind==="series"||kind==="podcast-series") return "https://eemodiae.org/messages?tab=series";
  return "https://eemodiae.org/messages";
}

/* response box: hybrid delivery (relay + mailto fallback) to the messages inbox */
const MSG_COMMENTS_EMAIL = "eemodiaemessages@gmail.com";
const MSG_RELAY = "https://formsubmit.co/ajax/" + MSG_COMMENTS_EMAIL;
const validEmail = v => /^\S+@\S+\.\S+$/.test(v);

/* Build the response box into a container, wired to a context that
   stamps identifiers (type, title, series/lesson/episode) into the
   email so one shared inbox can tell exactly where it came from. */
/* ============================================================
   SHARED PLAYER  (clean art, controls outside; queue-aware)
   Renders into #msPlayerHost and #msUpNextHost. Subscribes to
   the AudioEngine and reflects live state. Queue items are
   clickable (play in place); the words "Up Next" are not.
   ============================================================ */
let _playerUnsub = null;
function fmtTime(s){ s=Math.max(0,Math.floor(s||0)); const m=Math.floor(s/60), ss=s%60; return m+":"+(ss<10?"0":"")+ss; }

function mountPlayer(hostId){
  const host=$(hostId); if(!host) return;
  host.innerHTML=`
    <div class="ms-cleanplayer">
      <div class="ms-cp__art" id="msCpArt"><div class="ms-cp__crest">EIE</div></div>
      <div class="ms-cp__controls">
        <button class="ms-cp__side" id="msCpBack" aria-label="Rewind 15 seconds">${IC.skipb}</button>
        <button class="ms-cp__play" id="msCpPlay" aria-label="Play">${IC.play}</button>
        <button class="ms-cp__side" id="msCpFwd" aria-label="Forward 15 seconds">${IC.skipf}</button>
      </div>
      <div class="ms-cp__bar">
        <span class="ms-cp__time" id="msCpCur">0:00</span>
        <div class="ms-cp__track" id="msCpTrack"><div class="ms-cp__fill" id="msCpFill"></div><div class="ms-cp__knob" id="msCpKnob"></div></div>
        <span class="ms-cp__time" id="msCpTot">0:00</span>
      </div>
      <div class="ms-cp__adv">
        <button class="ms-chip-btn" id="msCpPrev" aria-label="Previous">${IC.skipb} Prev</button>
        <button class="ms-chip-btn" id="msCpSpeed" aria-label="Playback speed">${IC.speed} <span id="msCpSpeedV">1x</span></button>
        <button class="ms-chip-btn" id="msCpSleep" aria-label="Sleep timer">${IC.timer} <span id="msCpSleepV">Sleep</span></button>
        <button class="ms-chip-btn" id="msCpNext" aria-label="Next">Next ${IC.skipf}</button>
      </div>
    </div>`;
  // wire controls
  $("msCpPlay").addEventListener("click",()=>getAudioEngine().toggle());
  $("msCpBack").addEventListener("click",()=>getAudioEngine().skip(-15));
  $("msCpFwd").addEventListener("click",()=>getAudioEngine().skip(15));
  $("msCpPrev").addEventListener("click",()=>getAudioEngine().prev());
  $("msCpNext").addEventListener("click",()=>getAudioEngine().next());
  $("msCpSpeed").addEventListener("click",()=>{ const s=[1,1.25,1.5,2,0.75]; const st=getAudioEngine().status(); const nv=s[(s.indexOf(st.speed)+1)%s.length]; getAudioEngine().setSpeed(nv); });
  $("msCpSleep").addEventListener("click",()=>{ const s=[0,15,30,45]; const st=getAudioEngine().status(); const nv=s[(s.indexOf(st.sleepMin)+1)%s.length]; getAudioEngine().setSleep(nv); toast(nv>0?("Sleep timer set for "+nv+" minutes."):"Sleep timer off."); });
  const track=$("msCpTrack");
  track.addEventListener("click",e=>{ const r=track.getBoundingClientRect(); getAudioEngine().seekTo((e.clientX-r.left)/r.width); });

  if(_playerUnsub) _playerUnsub();
  _playerUnsub = getAudioEngine().sub(paintPlayer);
  paintPlayer(getAudioEngine().status());
}

function paintPlayer(st){
  if(!$("msCpPlay")) return;
  $("msCpPlay").innerHTML = st.playing ? IC.pause : IC.play;
  $("msCpPlay").setAttribute("aria-label", st.playing?"Pause":"Play");
  const frac = st.total ? Math.min(1, st.cur/st.total) : 0;
  $("msCpFill").style.width = (frac*100)+"%";
  $("msCpKnob").style.left = (frac*100)+"%";
  $("msCpCur").textContent = fmtTime(st.cur);
  $("msCpTot").textContent = fmtTime(st.total);
  $("msCpSpeedV").textContent = st.speed+"x";
  $("msCpSleepV").textContent = st.sleepMin>0 ? (st.sleepMin+" min") : "Sleep";
  $("msCpPrev").disabled = !st.hasPrev;
  $("msCpNext").disabled = !st.hasNext;
  const art=$("msCpArt");
  if(art){
    const c=st.item;
    if(c && c.image){ art.style.backgroundImage=`url(${c.image})`; art.classList.add("ms-cp__art--img"); art.innerHTML=""; }
    else { art.style.backgroundImage=""; art.classList.remove("ms-cp__art--img"); if(!art.querySelector(".ms-cp__crest")) art.innerHTML='<div class="ms-cp__crest">EIE</div>'; }
  }
  // reflect active item in the up-next / collection lists
  document.querySelectorAll("[data-qslug]").forEach(elm=>{
    elm.classList.toggle("ms-q--playing", st.item && elm.getAttribute("data-qslug")===st.item.slug);
  });
}

/* Up Next rail — clickable items (play in place); label not clickable.
   items: [{slug,title,sub}], onPick(index) */
function renderUpNext(hostId, items, onPick, opts){
  const host=$(hostId); if(!host) return;
  opts=opts||{};
  if(!items.length){ host.innerHTML=""; return; }
  host.innerHTML=`<div class="ms-upnext__head">${opts.head||"Up Next"}</div><div class="ms-upnext__list" id="${hostId}List"></div>`;
  const list=$(hostId+"List");
  items.forEach((it,i)=>{
    const b=document.createElement("button");
    b.className="ms-upnext__item"; b.setAttribute("data-qslug", it.slug);
    b.innerHTML=`<div class="ms-upnext__art">${it.image?`<img src="${it.image}" alt="">`:'<span>EIE</span>'}</div>
      <div class="ms-upnext__meta"><div class="ms-upnext__title">${it.title}</div>${it.sub?`<div class="ms-upnext__sub">${it.sub}</div>`:""}<div class="ms-upnext__eq"><span></span><span></span><span></span></div></div>`;
    b.addEventListener("click",()=>onPick(i));
    list.appendChild(b);
  });
}

/* "More from this collection" grid — clickable, plays in place or opens */
function renderCollection(hostId, items, onPick){
  const host=$(hostId); if(!host) return;
  if(!items.length){ host.innerHTML=""; return; }
  host.innerHTML="";
  items.forEach((it,i)=>{
    const b=document.createElement("button");
    b.className="ms-coll-card"; b.setAttribute("data-qslug", it.slug||"");
    b.innerHTML=`<div class="ms-coll-card__art">${it.image?`<img src="${it.image}" alt="">`:'<span>EIE</span>'}</div>
      <div class="ms-coll-card__body"><div class="ms-coll-card__title">${it.title}</div>${it.sub?`<div class="ms-coll-card__sub">${it.sub}</div>`:""}</div>`;
    b.addEventListener("click",()=>onPick(i));
    host.appendChild(b);
  });
}

/* ============================================================
   LIVE QUEUE  (self-updating Up Next, drives header sync)
   mode 'drain' — items fall off the top as they play; the
   library keeps receding into "More X" (message pages: a
   broad library, so once played a title is behind you).
   mode 'loop'  — items rotate endlessly through the same closed
   set (a series is its own bounded playlist, so it never runs
   out; it just keeps cycling starting from whatever plays next).
   Re-renders only when the playing track actually changes, not
   on every progress tick. Returns nothing; call again to rewire
   for a freshly opened page (it clears its own prior subscription).
   ============================================================ */
let _queueUnsub = null;
function wireLiveQueue(opts){
  const { railCap, moreCap, upNextHostId, moreHostId, headLabel, onIndexChange, dedupe } = opts;

  if(_queueUnsub){ _queueUnsub(); _queueUnsub=null; }

  function buildChain(idx){
    // the full upcoming order, wrapping around the looped queue, deduped by title
    const q = getAudioEngine().queue, n = q.length;
    const chain = [];
    const seen = new Set();
    for(let i=1;i<n;i++){
      const it = q[(idx+i)%n];
      const key = dedupe ? it.title : it.slug;
      if(seen.has(key)) continue;
      seen.add(key);
      chain.push({ item:it, qi:(idx+i)%n });
    }
    return chain;
  }

  function render(idx){
    const chain = buildChain(idx);
    const cap = railCap || 5;
    const railPart = chain.slice(0, cap);
    let morePart = moreHostId ? chain.slice(cap) : [];
    if(moreCap && morePart.length>moreCap) morePart = morePart.slice(0, moreCap);

    // Up Next = the next few in the chain
    renderUpNext(upNextHostId, railPart.map(r=>({ slug:r.item.slug, title:r.item.title, sub:r.item.sub||r.item.dur, image:r.item.image })),
      i=>{ getAudioEngine().playIndex(railPart[i].qi); },
      { head:headLabel||"Up Next" });

    // More block = the rest of the chain (one continuous loop with Up Next).
    // As playback advances, an item leaves the top of Up Next, everything shifts
    // up, the first More tile rises into Up Next, and the just-played item rejoins
    // at the tail of More — the whole set rotating as a single circle.
    if(moreHostId){
      renderCollection(moreHostId, morePart.map(r=>({ slug:r.item.slug, title:r.item.title, sub:r.item.sub||r.item.dur, image:r.item.image })),
        i=>{ getAudioEngine().playIndex(morePart[i].qi); window.scrollTo({top:0,behavior:"smooth"}); });
    }
  }

  let lastIndex=null, first=true;
  function tick(){
    const st=getAudioEngine().status();
    if(st.index===lastIndex) return;
    lastIndex=st.index;
    render(st.index);
    if(onIndexChange && !first) onIndexChange(st.index, st.item);
    first=false;
  }
  tick();
  _queueUnsub = getAudioEngine().sub(tick);
}

function buildRespondBox(container, ctx){
  if(!container) return;
  const uid = ctx.uid || "R";
  container.innerHTML = `
    <p class="ms-respond__sub">Your testimony is a blessing to this house.</p>
    <div class="ms-respond__fields">
      <input type="text" id="${uid}Name" placeholder="Your name (optional)" aria-label="Your name">
      <input type="email" id="${uid}Email" placeholder="Your email (required)" aria-label="Your email">
    </div>
    <textarea id="${uid}Msg" maxlength="1000" placeholder="${ctx.placeholder||'Share what this stirred in you...'}" aria-label="Your response"></textarea>
    <div class="ms-respond__meta">
      <span class="ms-respond__privacy">Your email is never published; it is used only to receive your message.</span>
      <span class="ms-respond__count" id="${uid}Count">0 / 1000</span>
    </div>
    <button class="ms-respond__send" id="${uid}Send">${IC.share} Send</button>
    <div class="ms-respond__done" id="${uid}Done">${IC.check} Thank you. Your words have been received with gratitude.</div>`;
  const msg=$(uid+"Msg"), count=$(uid+"Count");
  msg.addEventListener("input",()=>{ count.textContent=msg.value.length+" / 1000"; });
  $(uid+"Send").addEventListener("click",()=>sendResponse(ctx));
}

/* ctx: { uid, kind:'Message'|'Series'|'Podcast', title, seriesTitle?, lessonTitle?, url } */
async function sendResponse(ctx){
  const uid=ctx.uid;
  const name=$(uid+"Name").value.trim(), email=$(uid+"Email").value.trim(), message=$(uid+"Msg").value.trim();
  if(!message){ toast("Write a few words first, then send."); return; }
  if(!email){ toast("Please add your email so we can receive your message."); return; }
  if(!validEmail(email)){ toast("That email doesn't look right. Please check it."); return; }

  /* build the identifier stamp */
  let source = ctx.kind + ": " + ctx.title;
  if(ctx.kind==="Series" && ctx.lessonTitle) source = "Series: " + ctx.title + " — " + ctx.lessonTitle;
  if(ctx.kind==="Podcast" && ctx.seriesTitle) source = "Podcast: " + ctx.seriesTitle + " — Episode: " + ctx.title;
  const subject = ctx.kind + " response — " + (ctx.kind==="Series" && ctx.lessonTitle ? ctx.title+" · "+ctx.lessonTitle : (ctx.kind==="Podcast" ? ctx.title : ctx.title));

  const btn=$(uid+"Send"); btn.disabled=true;
  try{
    const resp=await fetch(MSG_RELAY,{ method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" },
      body:JSON.stringify({
        name:name||"A listener", email, message,
        source_type:ctx.kind, source_title:ctx.title,
        series_title:ctx.seriesTitle||"", lesson:ctx.lessonTitle||"",
        source, link:ctx.url,
        _subject:subject, _replyto:email, _template:"table"
      }) });
    if(!resp.ok) throw new Error("relay");
    $(uid+"Name").value=""; $(uid+"Email").value=""; $(uid+"Msg").value=""; $(uid+"Count").textContent="0 / 1000";
    $(uid+"Done").classList.add("ms-respond__done--live");
  }catch(e){
    const subj=encodeURIComponent(subject);
    const body=encodeURIComponent(
      message+"\n\n"+
      "— — —\n"+
      "Source: "+source+"\n"+
      (name?"From: "+name+"\n":"")+
      "Email: "+email+"\n"+
      "Link: "+ctx.url
    );
    toast("Opening your email app to send your message.");
    setTimeout(()=>{ window.location.href="mailto:"+MSG_COMMENTS_EMAIL+"?subject="+subj+"&body="+body; }, 600);
  }finally{ btn.disabled=false; }
}

async function shareMessage(m){
  const text = '"'+m.title+'" by Emmanuel I. Emodiae, Prophet | Preacher | Poet.\n'+shareUrl("message",m.slug);
  try{ if(navigator.share){ await navigator.share({ title:m.title, text }); return; } throw 0; }
  catch(e){ try{ await navigator.clipboard.writeText(text); }catch(_){}; toast("Message link copied. Share it."); }
}
async function shareSeries(s){
  const text = '"'+s.title+'" teaching series by Emmanuel I. Emodiae.\n'+shareUrl("series",s.slug);
  try{ if(navigator.share){ await navigator.share({ title:s.title, text }); return; } throw 0; }
  catch(e){ try{ await navigator.clipboard.writeText(text); }catch(_){}; toast("Series link copied. Share it."); }
}
async function shareCurrentSermon(s, sermonTitle){
  const text = '"'+sermonTitle+'" from the series "'+s.title+'" by Emmanuel I. Emodiae.\n'+shareUrl("series",s.slug);
  try{ if(navigator.share){ await navigator.share({ title:sermonTitle, text }); return; } throw 0; }
  catch(e){ try{ await navigator.clipboard.writeText(text); }catch(_){}; toast("Sermon link copied. Share it."); }
}

/* ============================================================
   SERIES DETAIL
   ============================================================ */
function openSeries(slug){
  const s = SERIES.find(x=>x.slug===slug); if(!s) return;
  const prog = seriesProgress(s);
  state.curSeries=s; state.curLesson=prog.last||0; state.view="seriesDetail"; Nav.openDetail();
  pushRecent("series", s.slug, s.title);
  window.scrollTo({top:0,behavior:"auto"});
  const root=app(); root.innerHTML="";
  const wrap=document.createElement("div"); wrap.className="ms-wrap"; wrap.style.paddingTop="0";
  const time=s.sermons.reduce((a,l)=>a+parseInt(l.dur)||0,0);

  // Build one long queue: starting from THIS series, each series' sermons play
  // through TWICE, then it moves on to the next series, and so on through every
  // series, wrapping back to the first — an endless loop. Each track remembers
  // its parent series so the header/overview/share can follow across boundaries.
  const SERIES_LOOPS = 2;
  const startPos = SERIES.findIndex(x=>x.slug===s.slug);
  const chainOrder = []; // series in play order starting at the opened one
  for(let k=0;k<SERIES.length;k++){ chainOrder.push(SERIES[(startPos+k)%SERIES.length]); }
  const queueItems = [];
  chainOrder.forEach(ser=>{
    for(let loop=0; loop<SERIES_LOOPS; loop++){
      ser.sermons.forEach((sm,i)=>{
        const t=toTrack({ title:sm.title, dur:sm.dur, image:ser.image, audio:sm.audio }, "sermon", { slug:ser.slug+"__"+i+"__L"+loop });
        t.sub=sm.sub+" · "+sm.dur;
        t.seriesSlug=ser.slug; t.sermonIdx=i;
        queueItems.push(t);
      });
    }
  });

  wrap.innerHTML=`
    <div class="ms-detailwrap">
      <div class="ms-detailmain">
        <div class="ms-cleanhero" id="msHero"><div class="ms-cleanhero__crest">EIE</div></div>
        <button class="ms-back ms-back--top" id="msBack">${IC.chevL} Back to Series</button>
        <div class="ms-detailhead">
          <div class="ms-detailhead__kicker" id="msDetailKicker">Teaching Series${s.category?" · "+s.category:""}${s.year?" · "+s.year:""}</div>
          <h1 class="ms-detailhead__title" id="msDetailTitle">${s.title}</h1>
          <div class="ms-detailhead__meta" id="msDetailMeta">
            <span>${IC.layers} ${s.sermons.length} sermons</span>
            <span>${IC.clock} ${time} min</span>
            ${s.scripture?`<span>${IC.book} ${s.scripture}</span>`:""}
          </div>
        </div>
        <div class="ms-playerrow">
          <div class="ms-playerrow__player" id="msPlayerHost"></div>
          <div class="ms-playerrow__downloads ms-downloads" id="msDownloads">
            <button class="ms-dl" id="msSeriesShare">${IC.share} Share series</button>
            <button class="ms-dl" id="msSermonShare">${IC.share} Share current sermon</button>
            <a class="ms-dl" id="msSermonDl">${IC.download} Download current sermon</a>
          </div>
          <aside class="ms-playerrow__upnext" id="msUpNextHost"></aside>
        </div>

        <div class="ms-block" data-collapse="Overview">
          <div class="ms-overview"><p id="msOverviewText">${s.overviewLong||s.summary}</p></div>
        </div>

        <div class="ms-block">
          <div class="ms-block__head">Share What This Spoke to You</div>
          <div class="ms-respond" id="msRespond"></div>
        </div>

        <div class="ms-block ms-collection" id="msMoreBlock">
          <div class="ms-block__head" id="msMoreHead">More Series</div>
          <div class="ms-coll-grid" id="msMoreColl"></div>
        </div>
      </div>
    </div>`;
  root.appendChild(wrap);
  wrap.appendChild(bottomBackButton("Back to Series", ()=>{ Nav.toLandingFromButton("series"); }));
  root.appendChild(encourageBand());
  const foot=document.createElement("div"); foot.className="ms-foot"; root.appendChild(foot);

  const hero=$("msHero");
  hero.style.backgroundImage=`url(${HERO_SERIES})`; hero.classList.add("ms-cleanhero--img"); hero.innerHTML="";

  // curSeries/curSermon follow whatever is playing — including after the queue
  // crosses from one series into the next. Everything user-facing reads these.
  let curSeriesObj = s;
  let curSermonTitle = (s.sermons[0]||{}).title || "";

  function syncSeriesDisplay(item){
    const ser = SERIES.find(x=>x.slug===item.seriesSlug) || curSeriesObj;
    curSeriesObj = ser;
    curSermonTitle = item.title;
    state.curSeries = ser;
    if(item.sermonIdx!=null){ state.curLesson=item.sermonIdx; markLessonDone(ser.slug, item.sermonIdx); }
    const t = ser.sermons.reduce((a,l)=>a+parseInt(l.dur)||0,0);
    $("msDetailKicker").textContent = "Teaching Series"+(ser.category?" · "+ser.category:"")+(ser.year?" · "+ser.year:"");
    $("msDetailTitle").textContent = ser.title;
    $("msDetailMeta").innerHTML = `<span>${IC.layers} ${ser.sermons.length} sermons</span><span>${IC.clock} ${t} min</span>${ser.scripture?`<span>${IC.book} ${ser.scripture}</span>`:""}`;
    hero.style.backgroundImage=`url(${HERO_SERIES})`;
    const ov=$("msOverviewText"); if(ov) ov.textContent = ser.overviewLong||ser.summary;
  }

  $("msBack").addEventListener("click",()=>{ Nav.toLandingFromButton("series"); });
  $("msSeriesShare").addEventListener("click",()=>shareSeries(curSeriesObj));
  $("msSermonShare").addEventListener("click",()=>{ shareCurrentSermon(curSeriesObj, curSermonTitle); });
  $("msSermonDl").addEventListener("click",e=>{ e.preventDefault(); toast("Preparing download for \u201C"+curSermonTitle+"\u201D."); });

  // player + queue (chained series, x2 each, looping through the whole library)
  getAudioEngine().setQueue(queueItems, 0, { autoplay:false, loop:true });
  mountPlayer("msPlayerHost");

  // Up Next holds the sermons of the CURRENTLY playing series (the closed set that
  // loops twice). More Series holds whole-series tiles — the series waiting their
  // turn — capped at nine, showing all available others and refilling from the
  // library as each series is promoted into Up Next. When the current series ends
  // its second loop, the chain advances to the next series, its sermons load into
  // Up Next, its tile leaves More Series, and the header/overview/share follow.
  function renderSeriesQueue(){
    const ser = curSeriesObj;
    const st = getAudioEngine().status();
    const curIdx = (st.item && st.item.sermonIdx!=null) ? st.item.sermonIdx : state.curLesson;
    // Up Next = this series' sermons after the current one, wrapping within the series
    const n = ser.sermons.length;
    const rail = [];
    for(let i=1;i<n;i++){
      const si = (curIdx+i)%n;
      const sm = ser.sermons[si];
      // resolve the queue index of this sermon in the current series' first upcoming loop
      const qi = getAudioEngine().queue.findIndex(x=>x.seriesSlug===ser.slug && x.sermonIdx===si);
      rail.push({ slug:ser.slug+"__"+si, title:sm.title, sub:sm.sub+" · "+sm.dur, image:ser.image, qi });
    }
    renderUpNext("msUpNextHost", rail.map(r=>({ slug:r.slug, title:r.title, sub:r.sub, image:r.image })),
      i=>{ if(rail[i].qi>=0) getAudioEngine().playIndex(rail[i].qi); }, { head:"Up Next" });

    // More Series = the OTHER series as whole tiles, capped at 9, current one excluded
    const startPos = SERIES.findIndex(x=>x.slug===ser.slug);
    const others = [];
    for(let k=1;k<SERIES.length && others.length<9;k++){
      others.push(SERIES[(startPos+k)%SERIES.length]);
    }
    renderCollection("msMoreColl", others.map(x=>({ slug:x.slug, title:x.title, sub:x.sermons.length+" sermons", image:x.image })),
      i=>openSeries(others[i].slug));
  }

  let lastSeriesSlug = curSeriesObj.slug, lastSermonIdx = null, firstQ = true;
  function seriesTick(){
    const st = getAudioEngine().status();
    const it = st.item; if(!it) return;
    const changedSermon = it.sermonIdx!==lastSermonIdx;
    const changedSeries = it.seriesSlug!==lastSeriesSlug;
    if(!changedSermon && !changedSeries) return;
    lastSermonIdx = it.sermonIdx; lastSeriesSlug = it.seriesSlug;
    if(!firstQ) syncSeriesDisplay(it);
    renderSeriesQueue();
    firstQ = false;
  }
  seriesTick();
  if(_queueUnsub){ _queueUnsub(); }
  _queueUnsub = getAudioEngine().sub(seriesTick);

  // response box (Series; follows the currently playing series + sermon live)
  window._msSeriesCtx = {
    uid:"msSR", kind:"Series",
    get title(){ return curSeriesObj.title; },
    get lessonTitle(){ return curSermonTitle; },
    get url(){ return shareUrl("series",curSeriesObj.slug); },
    placeholder:"Share what this series stirred in you..."
  };
  buildRespondBox($("msRespond"), window._msSeriesCtx);

  wireCollapsibles(wrap);
}

function renderProgPanel(){
  const s=state.curSeries; const el=$("msProgPanel"); if(!el) return;
  const prog=seriesProgress(s);
  const remainMin = s.sermons.filter((l,i)=>!(state.progress[s.slug]?.done||[]).includes(i)).reduce((a,l)=>a+parseInt(l.dur)||0,0);
  if(prog.done===0){
    el.innerHTML=`
      <div class="ms-progpanel__top">
        <div class="ms-progpanel__label">Begin this series</div>
        <div class="ms-progpanel__stat">${s.sermons.length} sermons · about ${remainMin} min</div>
      </div>
      <div class="ms-progpanel__track"><div class="ms-progpanel__fill" style="width:0%"></div></div>
      <button class="ms-continue" id="msContinue">${IC.play} Start Lesson 1</button>`;
  } else if(prog.done>=prog.total){
    el.innerHTML=`
      <div class="ms-progpanel__top">
        <div class="ms-progpanel__label">Series complete</div>
        <div class="ms-progpanel__stat">All ${s.sermons.length} sermons finished. Well done.</div>
      </div>
      <div class="ms-progpanel__track"><div class="ms-progpanel__fill" style="width:100%"></div></div>
      <button class="ms-continue" id="msContinue">${IC.play} Revisit Lesson 1</button>`;
  } else {
    el.innerHTML=`
      <div class="ms-progpanel__top">
        <div class="ms-progpanel__label">Your progress</div>
        <div class="ms-progpanel__stat">${prog.done} of ${prog.total} done · ${prog.remaining} to go · about ${remainMin} min left</div>
      </div>
      <div class="ms-progpanel__track"><div class="ms-progpanel__fill" style="width:${prog.pct}%"></div></div>
      <button class="ms-continue" id="msContinue">${IC.play} Continue where you stopped</button>`;
  }
  $("msContinue").addEventListener("click",()=>{
    const p=state.progress[s.slug];
    let idx=0;
    if(p && prog.done>0 && prog.done<prog.total){
      idx = s.sermons.findIndex((l,i)=>!(p.done||[]).includes(i)); if(idx<0) idx=p.last||0;
    }
    playLesson(idx);
  });
}

function playLesson(i){
  const s=state.curSeries;
  state.curLesson=i;
  markLessonDone(s.slug, i);
  renderLessons(); renderProgPanel();
  toast("Now playing: "+s.sermons[i].title);
}

function renderLessons(){
  const s=state.curSeries; const host=$("msLessons"); host.innerHTML="";
  const done = new Set(state.progress[s.slug]?.done||[]);
  s.sermons.forEach((l,i)=>{
    const b=document.createElement("button");
    b.className="ms-lesson"+(i===state.curLesson?" ms-lesson--on":"");
    const isDone=done.has(i);
    b.innerHTML=`
      <div class="ms-lesson__num">${isDone?`<span class="ms-lesson__check">${IC.check}</span>`:i+1}</div>
      <div><div class="ms-lesson__title">${l.title}</div><div class="ms-lesson__sub">${l.sub} · ${l.dur}${isDone?" · completed":""}</div></div>
      <div class="ms-lesson__play">${IC.play}</div>`;
    b.addEventListener("click",()=>playLesson(i));
    host.appendChild(b);
  });
}

/* recently viewed sidebar block (shared) */
function renderRecent(host, excludeSlug){
  if(!host) return;
  const items = state.recent.filter(r=>r.slug!==excludeSlug).slice(0,5);
  if(!items.length) return;
  const head=document.createElement("div"); head.className="ms-side__head"; head.textContent="Recently Viewed"; head.style.marginTop="26px";
  host.appendChild(head);
  items.forEach(r=>{
    const c=document.createElement("button"); c.className="ms-side-card";
    c.innerHTML=`<div class="ms-side-card__art"></div><div><div class="ms-side-card__title">${r.title}</div><div class="ms-side-card__sub">${r.kind==='series'?'Series':'Message'}</div></div>`;
    c.addEventListener("click",()=> r.kind==='series'?openSeries(r.slug):openMessage(r.slug));
    host.appendChild(c);
  });
}

/* ============================================================
   MESSAGE DETAIL
   ============================================================ */
function openMessage(slug){
  const m=MESSAGES.find(x=>x.slug===slug); if(!m) return;
  state.curMessage=m; state.view="messageDetail"; Nav.openDetail();
  if(_onNavigate) _onNavigate(m.slug);
  pushRecent("message", m.slug, m.title);
  window.scrollTo({top:0,behavior:"auto"});
  const root=app(); root.innerHTML="";
  const wrap=document.createElement("div"); wrap.className="ms-wrap"; wrap.style.paddingTop="0";
  const isSaved=state.bookmarks.has(m.slug);

  // queue = this message first, then all other messages; loops endlessly.
  const others = MESSAGES.filter(x=>x.slug!==m.slug);
  const ordered = [m, ...others];
  const queueItems = ordered.map(x=>{ const t=toTrack(x,"message"); t.sub=(x.category?x.category+" · ":"")+x.dur; return t; });

  wrap.innerHTML=`
    <div class="ms-detailwrap">
      <div class="ms-detailmain">
        <div class="ms-cleanhero" id="msHero"><div class="ms-cleanhero__crest">EIE</div></div>
        <button class="ms-back ms-back--top" id="msBack">${IC.chevL} Back to Messages</button>
        <div class="ms-detailhead">
          <div class="ms-detailhead__kicker" id="msDetailKicker">Message${m.category?" · "+m.category:""}${m.year?" · "+m.year:""}</div>
          <h1 class="ms-detailhead__title" id="msDetailTitle">${m.title}</h1>
          <div class="ms-detailhead__meta" id="msDetailMeta">
            <span>${AUTHOR}</span>
            <span>${IC.clock} ${m.dur}</span>
            ${m.mainScripture?`<span>${IC.book} ${m.mainScripture}</span>`:""}
            ${m.audience?`<span>${IC.heart} ${m.audience}</span>`:""}
          </div>
        </div>
        <div class="ms-playerrow">
          <div class="ms-playerrow__player" id="msPlayerHost"></div>
          <div class="ms-playerrow__downloads ms-downloads" id="msDownloads">
            <a class="ms-dl" id="msDlAudio">${IC.download} Download audio</a>
            <button class="ms-dl" id="msMsgShare">${IC.share} Share message</button>
            <button class="ms-dl ms-bookmark-btn${isSaved?' ms-on':''}" id="msBookmark">${IC.bookmark} <span id="msBmLabel">${isSaved?'Saved':'Save'}</span></button>
          </div>
          <aside class="ms-playerrow__upnext" id="msUpNextHost"></aside>
        </div>

        <div class="ms-block" data-collapse="Overview">
          <div class="ms-overview"><p id="msOverviewText">${m.overview}</p></div>
        </div>

        <div class="ms-block">
          <div class="ms-block__head">Share What This Spoke to You</div>
          <div class="ms-respond" id="msRespond"></div>
        </div>

        <div class="ms-block ms-collection" id="msMoreBlock">
          <div class="ms-block__head">More Messages</div>
          <div class="ms-coll-grid" id="msMoreColl"></div>
        </div>
      </div>
    </div>`;
  root.appendChild(wrap);
  wrap.appendChild(bottomBackButton("Back to Messages", ()=>{ Nav.toLandingFromButton("messages"); }));
  root.appendChild(encourageBand());
  const foot=document.createElement("div"); foot.className="ms-foot"; root.appendChild(foot);

  // curPlayingMsg tracks whichever message is CURRENTLY sounding — starts as the
  // one opened, but Share/Download/Save/Overview/header all follow it live as the
  // queue advances (via Up Next, Prev/Next, or auto-advance at the end of a track).
  let curPlayingMsg = m;

  const hero=$("msHero");
  hero.style.backgroundImage=`url(${HERO_MESSAGE})`; hero.classList.add("ms-cleanhero--img"); hero.innerHTML="";

  function syncBookmarkUI(){
    const saved=state.bookmarks.has(curPlayingMsg.slug);
    const btn=$("msBookmark"); if(!btn) return;
    btn.classList.toggle("ms-on", saved);
    $("msBmLabel").textContent = saved?"Saved":"Save";
  }
  function syncMessageDisplay(newMsg){
    curPlayingMsg = newMsg;
    $("msDetailKicker").textContent = "Message"+(newMsg.category?" · "+newMsg.category:"")+(newMsg.year?" · "+newMsg.year:"");
    $("msDetailTitle").textContent = newMsg.title;
    $("msDetailMeta").innerHTML = `<span>${AUTHOR}</span><span>${IC.clock} ${newMsg.dur}</span>${newMsg.mainScripture?`<span>${IC.book} ${newMsg.mainScripture}</span>`:""}${newMsg.audience?`<span>${IC.heart} ${newMsg.audience}</span>`:""}`;
    hero.style.backgroundImage=`url(${HERO_MESSAGE})`;
    const ovEl=$("msOverviewText"); if(ovEl) ovEl.textContent = newMsg.overview;
    syncBookmarkUI();
  }

  $("msBack").addEventListener("click",()=>{ Nav.toLandingFromButton("messages"); });
  $("msMsgShare").addEventListener("click",()=>shareMessage(curPlayingMsg));
  $("msDlAudio").addEventListener("click",e=>{ e.preventDefault(); toast("Preparing audio download for \u201C"+curPlayingMsg.title+"\u201D."); });
  $("msBookmark").addEventListener("click",()=>{
    if(state.bookmarks.has(curPlayingMsg.slug)){ state.bookmarks.delete(curPlayingMsg.slug); toast("Removed from saved."); }
    else { state.bookmarks.add(curPlayingMsg.slug); toast("Saved for later."); }
    persistBookmarks();
    syncBookmarkUI();
  });

  // player + queue (auto-advance through all messages)
  getAudioEngine().setQueue(queueItems, 0, { autoplay:false, loop:true });
  mountPlayer("msPlayerHost");

  // Up Next + More Messages form ONE combined loop: Up Next shows the next few,
  // More Messages shows the rest of the chain, and the whole set rotates as one
  // circle as playback advances. It never runs dry.
  wireLiveQueue({
    upNextHostId:"msUpNextHost", moreHostId:"msMoreColl", headLabel:"Up Next", railCap:5, moreCap:9,
    onIndexChange:(idx,item)=>{
      if(!item) return;
      const nm=MESSAGES.find(x=>x.slug===item.slug);
      if(nm && nm.slug!==curPlayingMsg.slug) syncMessageDisplay(nm);
    },
  });

  // response box (stamped as whichever message is CURRENTLY playing)
  buildRespondBox($("msRespond"), {
    uid:"msR", kind:"Message",
    get title(){ return curPlayingMsg.title; },
    get url(){ return shareUrl("message",curPlayingMsg.slug); },
    placeholder:"Share what this message stirred in you..."
  });

  wireCollapsibles(document.querySelector(".ms-wrap"));
}

/* Continue Your Journey: cross-links to series, poem, article, podcast */
function renderJourney(m){
  const host=$("msJourney"); if(!host) return;
  const r=m.related||{};
  const cards=[];
  if(r.series){ const s=SERIES.find(x=>x.slug===r.series); if(s) cards.push({ kind:"Series", title:s.title, onClick:()=>openSeries(s.slug) }); }
  if(r.podcast){ const e=POD_EPISODES.find(x=>x.slug===r.podcast); if(e) cards.push({ kind:"Podcast", title:e.title, onClick:()=>{ state.tab="podcasts"; state.podTab="episodes"; renderLanding(); toast("Opening podcasts."); } }); }
  if(r.poem && XLINKS.poems[r.poem]){ cards.push({ kind:"Poem", title:XLINKS.poems[r.poem], href:xurl("poems",r.poem) }); }
  if(r.article && XLINKS.articles[r.article]){ cards.push({ kind:"Article", title:XLINKS.articles[r.article], href:xurl("articles",r.article) }); }
  if(!cards.length){ $("msJourneyBlock").style.display="none"; return; }
  cards.slice(0,3).forEach(c=>{
    const el=document.createElement(c.href?"a":"button");
    el.className="ms-journey-card";
    if(c.href){ el.href=c.href; el.target="_blank"; el.rel="noopener"; }
    el.innerHTML=`<div class="ms-journey-card__kind">${c.kind}</div>
      <div class="ms-journey-card__title">${c.title}</div>
      <div class="ms-journey-card__go">${c.href?"Visit":"Open"} ${IC.chevR}</div>`;
    if(c.onClick) el.addEventListener("click",c.onClick);
    host.appendChild(el);
  });
}

/* advanced audio: simulated, with speed / sleep / skip / remember-position */
function wireAdvancedPlayer(el, m){
  if(!el) return;
  const btn=el.querySelector(".ms-audiobar__play");
  const fill=el.querySelector(".ms-audiobar__fill");
  const curEl=$("msCur");
  const totalSec = parseDur(m.dur);
  let playing=false, sec=(state.audioPos[m.slug]&&state.audioPos[m.slug].sec)||0, speed=1, timer=null, sleepMin=0, sleepAt=0;
  const speeds=[1,1.25,1.5,2,0.75];
  const sleeps=[0,15,30,45];
  const fmt=s=>{ s=Math.max(0,Math.floor(s)); const m2=Math.floor(s/60), ss=s%60; return m2+":"+(ss<10?"0":"")+ss; };
  const paint=()=>{ fill.style.width=(totalSec?Math.min(100,sec/totalSec*100):0)+"%"; if(curEl) curEl.textContent=fmt(sec); };
  paint();
  const stop=()=>{ playing=false; btn.innerHTML=IC.play; clearInterval(timer); state.audioPos[m.slug]={sec,total:totalSec}; save("ms_audiopos", state.audioPos); };
  btn.addEventListener("click",()=>{
    playing=!playing; btn.innerHTML=playing?IC.pause:IC.play;
    if(playing){
      if(sec>0 && sec<totalSec) toast("Resuming where you stopped.");
      timer=setInterval(()=>{
        sec+=speed; if(sec>=totalSec){ sec=totalSec; paint(); stop(); toast("Message finished."); return; }
        if(sleepAt && Date.now()>=sleepAt){ stop(); toast("Sleep timer ended playback."); sleepAt=0; $("msSleepV").textContent="Sleep"; $("msSleep").classList.remove("ms-on"); return; }
        state.audioPos[m.slug]={sec,total:totalSec}; save("ms_audiopos", state.audioPos);
        paint();
      },1000);
    } else stop();
  });
  $("msSkipF").addEventListener("click",()=>{ sec=Math.min(totalSec,sec+15); paint(); });
  $("msSkipB").addEventListener("click",()=>{ sec=Math.max(0,sec-15); paint(); });
  $("msSpeed").addEventListener("click",()=>{ speed=speeds[(speeds.indexOf(speed)+1)%speeds.length]; $("msSpeedV").textContent=speed+"x"; });
  $("msSleep").addEventListener("click",()=>{
    sleepMin=sleeps[(sleeps.indexOf(sleepMin)+1)%sleeps.length];
    if(sleepMin>0){ sleepAt=Date.now()+sleepMin*60000; $("msSleepV").textContent=sleepMin+" min"; $("msSleep").classList.add("ms-on"); toast("Sleep timer set for "+sleepMin+" minutes."); }
    else { sleepAt=0; $("msSleepV").textContent="Sleep"; $("msSleep").classList.remove("ms-on"); toast("Sleep timer off."); }
  });
}
function parseDur(txt){
  let sec=0; const h=/(\d+)\s*hr/.exec(txt); const m=/(\d+)\s*min/.exec(txt);
  if(h) sec+=parseInt(h[1])*3600; if(m) sec+=parseInt(m[1])*60;
  return sec||1800;
}

/* ============================================================
   COLLAPSIBLE BLOCKS
   Wraps any <div class="ms-block" data-collapse="Heading">...</div>
   into a collapsed dropdown. Runs after each detail render.
   The block's own .ms-block__head (if present) is removed and
   replaced by the collapse header using data-collapse text.
   ============================================================ */
function wireCollapsibles(scope){
  (scope||document).querySelectorAll('.ms-block[data-collapse]').forEach(block=>{
    if(block.dataset.collapsed==="done") return;
    block.dataset.collapsed="done";
    const heading = block.getAttribute("data-collapse");
    // remove any existing inline head; its content becomes the body
    const oldHead = block.querySelector(":scope > .ms-block__head");
    if(oldHead) oldHead.remove();
    const bodyNodes = Array.from(block.childNodes);
    const wrap=document.createElement("div"); wrap.className="ms-collapse";
    const btn=document.createElement("button");
    btn.type="button"; btn.className="ms-collapse__head"; btn.setAttribute("aria-expanded","false");
    btn.innerHTML=`<span>${heading}</span><span class="ms-collapse__chev">${IC.chevR}</span>`;
    const body=document.createElement("div"); body.className="ms-collapse__body";
    const inner=document.createElement("div"); inner.className="ms-collapse__inner";
    bodyNodes.forEach(n=>inner.appendChild(n));
    body.appendChild(inner);
    wrap.appendChild(btn); wrap.appendChild(body);
    block.innerHTML=""; block.appendChild(wrap);
    btn.addEventListener("click",()=>{
      const open = body.classList.toggle("ms-collapse__body--open");
      btn.setAttribute("aria-expanded", open);
    });
  });
}

/* Content protection — initialized on client in initMessagesExperience */
function wireContentProtection() {
  if (typeof document === "undefined") return;
  const zone = e => e.target.closest(".ms-overview, .ms-transcript, .ms-prayer, .ms-apply, .ms-quote, .ms-ideas, .ms-reflect, .ms-detail-hero__title, img");
  let last=0;
  const nudge=()=>{ const n=Date.now(); if(n-last>1500){ last=n; toast("Please use the Share button to spread this."); } };
  document.addEventListener("copy", e=>{ if(zone(e)){ e.preventDefault(); nudge(); } });
  document.addEventListener("cut",  e=>{ if(zone(e)){ e.preventDefault(); nudge(); } });
  document.addEventListener("contextmenu", e=>{ if(zone(e)){ e.preventDefault(); nudge(); } });
  document.addEventListener("dragstart", e=>{ if(zone(e)) e.preventDefault(); });
  document.addEventListener("selectstart", e=>{ if(zone(e)) e.preventDefault(); });
  new MutationObserver(()=>{ document.querySelectorAll("img:not([draggable])").forEach(im=>im.setAttribute("draggable","false")); })
    .observe(document.body, { childList:true, subtree:true });
}

/* INIT — background toggle handled by React component */

/* ------------------------------------------------------------
   Phone / browser BACK button support.
   Opening a detail page pushes a history entry; pressing the
   device back button (or the browser's) pops it and returns to
   the landing view — same as the on-screen "Back to X" links.
   ------------------------------------------------------------ */
const Nav = (function(){
  let depth = 0;
  let lastMainTab = "series";
  try{ lastMainTab = sessionStorage.getItem("ms_lastMainTab") || "series"; }catch(e){}
  function openDetail(){ depth++; }
  function openPodcasts(fromTab){
    if(fromTab && fromTab!=="podcasts"){
      lastMainTab=fromTab;
      try{ sessionStorage.setItem("ms_lastMainTab", fromTab); }catch(e){}
    }
    depth++;
  }
  function backFromPodcasts(){
    state.view="landing"; state.tab=lastMainTab;
    if(_onNavigate && state.curEpisode) _onNavigate(null);
    else renderLanding();
  }
  function toLandingFromButton(tab){
    if(tab) state.tab=tab;
    state.view="landing";
    if(_onNavigate && (state.curMessage || state.curEpisode)) _onNavigate(null);
    else renderLanding();
  }
  return { openDetail, openPodcasts, backFromPodcasts, toLandingFromButton };
})();

function initMessagesExperience(opts) {
  if (typeof window !== "undefined") {
    getAudioEngine();
    wireContentProtection();
  }
  SERIES = opts.series || [];
  MESSAGES = opts.messages || [];
  POD_SERIES = opts.podSeries || [];
  POD_EPISODES = opts.podEpisodes || [];
  HERO_LANDING = opts.heroLanding || "";
  HERO_SERIES = opts.heroSeries || opts.heroLanding || "";
  HERO_MESSAGE = opts.heroMessage || opts.heroLanding || "";
  POD_BANNER = opts.podBanner || opts.heroLanding || "";
  ENCOURAGE_IMG = opts.encourageImage || opts.heroLanding || "";
  _onNavigate = opts.onNavigate || null;
  _initialTab = opts.initialTab || "series";
  _initialPodcastView = opts.initialPodcastView || "series";
  _initialSlug = opts.initialSlug || null;
  _initialKind = opts.initialKind || null;
  state.tab = _initialTab;
  state.podTab = _initialPodcastView === "episodes" ? "episodes" : "series";
  state.view = "landing";
  if (_initialSlug) {
    const msg = MESSAGES.find(x => x.slug === _initialSlug);
    if (msg) { openMessage(_initialSlug); return; }
    const ep = POD_EPISODES.find(x => x.slug === _initialSlug);
    if (ep) { state.tab = "podcasts"; openEpisode(_initialSlug); return; }
    const ser = SERIES.find(x => x.slug === _initialSlug);
    if (ser) { openSeries(_initialSlug); return; }
  }
  renderLanding();
}

function destroyMessagesExperience() {
  if (_playerUnsub) { _playerUnsub(); _playerUnsub = null; }
  if (_queueUnsub) { _queueUnsub(); _queueUnsub = null; }
}


export type MessagesExperienceProps = {
  series?: any[];
  messages?: any[];
  podSeries?: any[];
  podEpisodes?: any[];
  heroLanding?: string;
  heroSeries?: string;
  heroMessage?: string;
  podBanner?: string;
  encourageImage?: string;
  initialTab?: string;
  initialPodcastView?: string;
  initialSlug?: string | null;
  initialKind?: string | null;
  onNavigate?: ((slug: string | null, kind?: string) => void) | null;
};

export default function MessagesExperience({
  series = [],
  messages = [],
  podSeries = [],
  podEpisodes = [],
  heroLanding = "",
  heroSeries = "",
  heroMessage = "",
  podBanner = "",
  encourageImage = "",
  initialTab = "series",
  initialPodcastView = "series",
  initialSlug = null,
  initialKind = null,
  onNavigate = null,
}: MessagesExperienceProps) {
  const [cream, setCream] = useState(() => store.getItem("ms_bg") === "cream");
  const [bgToggleInBand, setBgToggleInBand] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef(null);
  const bgToggleRef = useRef(null);

  const toggleCream = useCallback(() => {
    setCream((c) => {
      const next = !c;
      store.setItem("ms_bg", next ? "cream" : "milk");
      return next;
    });
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2400);
  }, []);

  useEffect(() => {
    window.__msToast = showToast;
    initMessagesExperience({
      series, messages, podSeries, podEpisodes,
      heroLanding, heroSeries, heroMessage, podBanner, encourageImage,
      initialTab, initialPodcastView, initialSlug, initialKind,
      onNavigate,
    });
    return () => destroyMessagesExperience();
  }, [series, messages, podSeries, podEpisodes, heroLanding, heroSeries, heroMessage, podBanner, encourageImage, initialTab, initialPodcastView, initialSlug, initialKind, onNavigate, showToast]);

  // The background toggle only floats into view once the hero has scrolled
  // out of the way, and steps clear of the encourage band / pager below it.
  useEffect(() => {
    const bandUpdate = () => {
      const hero = document.querySelector(".ms-hero");
      const btn = bgToggleRef.current;
      if (!hero || !btn) return;
      const vh = window.innerHeight;
      const heroBottomOnScreen = hero.getBoundingClientRect().bottom;
      let show = heroBottomOnScreen <= 88;
      const enc = document.querySelector(".ms-encourage");
      if (show && enc && enc.getBoundingClientRect().top <= vh) show = false;
      setBgToggleInBand(show);
      let bottom = 16;
      const pager = document.querySelector(".ms-pager");
      if (show && pager) {
        const pagerRect = pager.getBoundingClientRect();
        if (pagerRect.top < vh && pagerRect.bottom > vh - 96) {
          bottom = Math.max(16, vh - pagerRect.top + 16);
        }
      }
      btn.style.bottom = bottom + "px";
    };
    bandUpdate();
    window.addEventListener("scroll", bandUpdate, { passive: true });
    window.addEventListener("resize", bandUpdate, { passive: true });
    const mo = new MutationObserver(() => bandUpdate());
    const app = document.getElementById("msApp");
    if (app) mo.observe(app, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", bandUpdate);
      window.removeEventListener("resize", bandUpdate);
      mo.disconnect();
    };
  }, []);

  return (
    <div className={"messages-exp-root" + (cream ? " ms-cream" : "")}>
      <div id="msApp" />
      <button
        ref={bgToggleRef}
        type="button"
        className={"ms-bgtoggle" + (bgToggleInBand ? " is-inband" : "")}
        aria-label="Switch background"
        onClick={toggleCream}
      >
        {cream ? "☀ Milky mode" : "☾ Cream mode"}
      </button>
      <div className={"ms-toast" + (toastShow ? " ms-toast--show" : "")} id="msToast">
        {toastMsg}
      </div>
    </div>
  );
}
