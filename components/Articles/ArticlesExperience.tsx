// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useCallback, type ComponentType, type CSSProperties } from "react";
import type { ExperienceArticle } from "../../lib/content/experienceTypes";
import { cleanString } from "../../util/normalizeAndCompare";

/* ============================================================
   ARTICLES EXPERIENCE  |  eemodiae.org  (React)
   Faithful port of the articles-experience single-file build.
   Gallery: featured lead story, search, category chips (colour
   accents), sort, saved view, reading counter, entrance anim,
   read-time on cards. Reader: clean hero, title below with
   read-time, auto table-of-contents (scroll-spy), key-insight
   callout, related-by-category, Listen (human-tuned TTS), font
   controls, resume reading, bookmarks, share, comment box
   (hybrid delivery). Content protection blocks copy/right-click/
   drag/selection; only the main Share button distributes.

   USAGE:
     <ArticlesExperience
        bannerImage="/images/articles-header.jpg"
        authorPhoto="/images/pastor.jpg"
        articles={cmsArticles}
        onNavigate={(slug|null)=>{}}
        onComment={({slug,name,email,message})=>{}}
     />
   Article shape: { slug, title, subtitle, date, image, tags:[...],
     excerpt?, keyInsight?, scripture:{ref,text}|null, body }
   body is rich HTML (<p>,<h2>,<h3>,<blockquote>,<figure>); with no
   tags, blank lines become paragraphs. TOC builds from H2 headings.
   ============================================================ */

const COMMENTS_EMAIL = "eemodiaearticles@gmail.com";
const RELAY_ENDPOINT = "https://formsubmit.co/ajax/" + COMMENTS_EMAIL;
const PER_PAGE = 6;
const CONTINUE_MAX = 5;

function continueReadingIndices(total, currentIndex, max = CONTINUE_MAX) {
  const indices = [currentIndex];
  for (let i = 0; i < total && indices.length < max; i++) {
    if (i !== currentIndex) indices.push(i);
  }
  return indices.slice(0, max);
}

const CAT_ACCENT: Record<string, string> = {
  "Christian Living":"var(--cat-christian-living)",
  "Spiritual Growth":"var(--cat-spiritual-growth)",
  "Freedom":"var(--cat-freedom)","Destiny":"var(--cat-destiny)",
  "Holiness":"var(--cat-holiness)","Purpose":"var(--cat-purpose)"
};

const memoryStore: Record<string, string> = {};
const store = {
  getItem: (k: string) => {
    if (typeof window !== "undefined") {
      try { return window.localStorage.getItem(k); } catch { /* ignore */ }
    }
    return k in memoryStore ? memoryStore[k] : null;
  },
  setItem: (k: string, v: string) => {
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem(k, v); return; } catch { /* ignore */ }
    }
    memoryStore[k] = String(v);
  },
  removeItem: (k: string) => {
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(k); return; } catch { /* ignore */ }
    }
    delete memoryStore[k];
  },
};

const tagsOf = (p: { tags?: string[] }) => Array.isArray(p.tags) ? p.tags : [];
const accentOf = (p: { tags?: string[] }) => CAT_ACCENT[(tagsOf(p)[0])||""] || "var(--pr-royal)";
const stripHtml = (html: string) => {
  if (typeof document === "undefined") return String(html).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const t = document.createElement("div"); t.innerHTML = html;
  return (t.textContent || t.innerText || "").replace(/\s+/g," ").trim();
};
const excerptOf = (p: ExperienceArticle) => {
  if (p.excerpt) return p.excerpt;
  const text = stripHtml(p.body);
  if (!text || text.startsWith("(")) return "Tap to read this article";
  return text.length > 140 ? text.slice(0,140).trim() + "..." : text;
};
const readTimeOf = (p: ExperienceArticle) => {
  const words = stripHtml(p.body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words/200)) + " min read";
};
const hasHtml = (body: string) => /<\/?[a-z][\s\S]*>/i.test(body);
const validEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

/* ---------- inline icons ---------- */
const IChevL = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>);
const IChevR = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 6l6 6-6 6"/></svg>);
const ISearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
const IStar = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3-6.3-4.6-6.3 4.6L8 13.7 2 9.2h7.6z"/></svg>);
const IShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>);
const IClock = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
const IBookmark = () => (<svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>);
const ISend = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>);
const IChat = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.9-.95L3 20l1-4.5A8.4 8.4 0 0 1 3.5 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z"/></svg>);
const ICheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>);
const ISpeaker = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>);

const splitParas = (body: string) => body.split(/\n\s*\n/).map(s => s.replace(/\n/g," ").trim()).filter(Boolean);
export type ArticlesExperienceProps = {
  articles: ExperienceArticle[];
  bannerImage?: string;
  authorPhoto?: string;
  initialSlug?: string | null;
  onNavigate?: ((slug: string | null) => void) | null;
  onComment?: ((payload: { slug: string; name: string; email: string; message: string }) => void) | null;
};

export default function ArticlesExperience({
  articles,
  bannerImage = "articles-header.jpg",
  authorPhoto = "",
  onNavigate = null,
  onComment = null,
  initialSlug = null,
}: ArticlesExperienceProps) {
  const [view, setView] = useState("gallery");
  const [current, setCurrent] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("featured");
  const [activeTag, setActiveTag] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState(() => new Set());
  const [readSet, setReadSet] = useState(() => new Set());
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ show:false, msg:"" });
  const [fontStep, setFontStep] = useState(0);
  const [thoughts, setThoughts] = useState({ name:"", email:"", msg:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toc, setToc] = useState([]);
  const [activeToc, setActiveToc] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [resume, setResume] = useState({ show:false, y:0 });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const galleryScroll = useRef(0);
  const poemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialSlug || !articles?.length) return;
    const idx = articles.findIndex(
      (item) => item.slug === initialSlug || cleanString(item.title) === cleanString(initialSlug)
    );
    if (idx < 0) return;
    setCurrent(idx);
    setView("reader");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [initialSlug, articles]);
  const resumeArmed = useRef(true);
  const preferredVoice = useRef(null);

  const showToast = useCallback((msg: string) => {
    setToast({ show:true, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show:false })), 2600);
  }, []);

  /* reading progress + resume-position save */
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY/total)*100) : 0);
      if (view === "reader" && resumeArmed.current) {
        const pct = total > 0 ? window.scrollY/total : 0;
        const slug = articles[current]?.slug;
        if (slug) {
          if (pct > 0.08 && pct < 0.9) { try { store.setItem("ee_pos_"+slug, String(Math.round(window.scrollY))); } catch(e){} }
          else if (pct >= 0.9) { try { store.removeItem("ee_pos_"+slug); } catch(e){} }
        }
      }
      if (toc.length >= 2 && poemRef.current) {
        const heads = [...poemRef.current.querySelectorAll("h2")];
        let idx = 0; heads.forEach((h,i)=>{ if (h.getBoundingClientRect().top < 120) idx = i; });
        setActiveToc(idx);
      }
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [view, current, articles, toc]);

  /* content protection */
  useEffect(() => {
    const zone = e => e.target.closest(".pr-poem, .pr-paper, .pr-hero__img, .pr-tile__img, img");
    let last = 0;
    const nudge = () => { const n = Date.now(); if (n-last>1500){ last=n; showToast("Please use the Share button to spread this."); } };
    const onCopy = e => { if (zone(e)){ e.preventDefault(); nudge(); } };
    const onCtx  = e => { if (zone(e)){ e.preventDefault(); nudge(); } };
    const onDrag = e => { if (zone(e)) e.preventDefault(); };
    const onSel  = e => { if (zone(e)) e.preventDefault(); };
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("selectstart", onSel);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("selectstart", onSel);
    };
  }, [showToast]);

  /* pick a natural TTS voice */
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const en = voices.filter(v => /^en(-|_|$)/i.test(v.lang));
      const pool = en.length ? en : voices;
      const ranked = [/Google US English/i,/Google UK English Female/i,/Google UK English/i,/Natural/i,/Neural/i,/Samantha/i,/Ava/i,/Serena/i,/Siri/i,/Microsoft (Aria|Jenny|Guy|Libby|Sonia)/i,/Female/i];
      for (const re of ranked) { const hit = pool.find(v => re.test(v.name)); if (hit) { preferredVoice.current = hit; return; } }
      preferredVoice.current = pool.find(v => v.localService) || pool[0];
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
  }, []);

  const stopListening = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    document.querySelectorAll(".pr-speaking").forEach(el => el.classList.remove("pr-speaking"));
  }, []);

  const persistSaved = (next) => { try { store.setItem("ee_arts_saved", JSON.stringify([...next])); } catch(e){} };
  const toggleSave = (slug) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(slug)) { next.delete(slug); showToast("Removed from saved."); }
      else { next.add(slug); showToast("Saved for later."); }
      persistSaved(next);
      return next;
    });
  };

  const q = query.trim().toLowerCase();
  let list = articles.map((p,i)=>({p,i})).filter(({p}) => {
    const mTag = activeTag==="All" || tagsOf(p).includes(activeTag);
    const mSaved = !savedOnly || saved.has(p.slug);
    const mText = !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q) || tagsOf(p).some(t=>t.toLowerCase().includes(q));
    return mTag && mSaved && mText;
  });
  if (sortMode==="az") list = [...list].sort((a,b)=>a.p.title.localeCompare(b.p.title));
  else if (sortMode==="za") list = [...list].sort((a,b)=>b.p.title.localeCompare(a.p.title));

  const showFeatured = page===1 && activeTag==="All" && !savedOnly && !q && list.length>0;
  const workingList = showFeatured ? list.slice(1) : list;
  const pages = Math.max(1, Math.ceil(workingList.length/PER_PAGE));
  const safePage = Math.min(page, pages);
  const slice = workingList.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE);
  const allTags = ["All", ...Array.from(new Set(articles.flatMap(tagsOf)))];

  const transition = (fn) => { setLeaving(true); setTimeout(() => { fn(); setLeaving(false); }, 300); };

  const buildToc = (slug) => {
    setTimeout(() => {
      if (!poemRef.current) { setToc([]); return; }
      const heads = [...poemRef.current.querySelectorAll("h2")];
      if (heads.length < 2) { setToc([]); return; }
      heads.forEach((h,i)=>{ h.id = "sec-"+i; });
      setToc(heads.map((h,i)=>({ id:"sec-"+i, text:h.textContent })));
      setActiveToc(0);
    }, 0);
  };

  const countRead = (slug) => setReadSet(prev => { const n = new Set(prev); n.add(slug); try{ store.setItem("ee_read", JSON.stringify([...n])); }catch(e){} return n; });

  const maybeResume = (slug) => {
    let y = null; try { y = store.getItem("ee_pos_"+slug); } catch(e){}
    if (y && +y > 200) {
      resumeArmed.current = false;
      setResume({ show:true, y:+y });
      setTimeout(()=>{ resumeArmed.current = true; }, 1200);
    } else { setResume({ show:false, y:0 }); resumeArmed.current = true; }
  };

  const openArticle = (i) => {
    galleryScroll.current = window.scrollY;
    resumeArmed.current = false;
    transition(() => {
      setCurrent(i); setView("reader"); setFontStep(0); setSent(false);
      setThoughts({ name:"", email:"", msg:"" });
      window.scrollTo({ top:0, behavior:"auto" });
      buildToc(articles[i].slug);
      maybeResume(articles[i].slug);
      countRead(articles[i].slug);
      if (onNavigate) onNavigate(articles[i].slug);
    });
  };
  const backToGallery = () => {
    stopListening();
    resumeArmed.current = false;
    transition(() => {
      setView("gallery");
      window.scrollTo({ top:galleryScroll.current, behavior:"auto" });
      if (onNavigate) onNavigate(null);
    });
  };
  const goTo = (i) => {
    if (i===current || i<0 || i>=articles.length) return;
    stopListening();
    resumeArmed.current = false;
    transition(() => {
      setCurrent(i); setFontStep(0); setSent(false); setThoughts({ name:"", email:"", msg:"" });
      window.scrollTo({ top:0, behavior:"auto" });
      buildToc(articles[i].slug);
      maybeResume(articles[i].slug);
      countRead(articles[i].slug);
      if (onNavigate) onNavigate(articles[i].slug);
    });
  };

  const shareUrlOf = (p) => "https://eemodiae.org/articles/" + p.slug;
  const shareTextOf = (p) => '"' + p.title + '" by Emmanuel I. Emodiae, Prophet | Preacher | Poet.\n' + shareUrlOf(p);

  const doShare = async () => {
    const p = articles[current];
    const text = shareTextOf(p);
    if (p.image && navigator.canShare) {
      try {
        const resp = await fetch(p.image); const blob = await resp.blob();
        const file = new File([blob], p.slug + ".jpg", { type: blob.type||"image/jpeg" });
        if (navigator.canShare({ files:[file] })) { await navigator.share({ files:[file], title:p.title, text }); return; }
      } catch(e){}
    }
    try {
      if (navigator.share) { await navigator.share({ title:p.title, text }); return; }
      throw new Error("no-share");
    } catch(e) {
      try { await navigator.clipboard.writeText(text); } catch(_){}
      showToast("Message copied. Share it with friends.");
    }
  };

  const toSentences = (text) => text.replace(/\s+/g," ").trim().match(/[^.!?]+[.!?]+["')\]]*|\S[^.!?]*$/g) || [text];
  const listen = () => {
    if (!("speechSynthesis" in window)) { showToast("Listening is not supported on this browser."); return; }
    if (speaking) { stopListening(); return; }
    const poem = poemRef.current; if (!poem) return;
    const blocks = [...poem.querySelectorAll("p, h2, h3, blockquote, .pr-keyinsight")];
    if (!blocks.length) return;
    setSpeaking(true);
    const queue = [];
    blocks.forEach(el => {
      const isHeading = /^H[23]$/.test(el.tagName);
      toSentences(el.textContent).forEach((s,si,arr)=> queue.push({ el, text:s.trim(), heading:isHeading, last:si===arr.length-1 }));
    });
    let qi = 0; let stopped = false;
    const speakNext = () => {
      document.querySelectorAll(".pr-speaking").forEach(x=>x.classList.remove("pr-speaking"));
      if (stopped || qi >= queue.length) { stopListening(); return; }
      const item = queue[qi];
      item.el.classList.add("pr-speaking");
      const u = new SpeechSynthesisUtterance(item.text);
      if (preferredVoice.current) { u.voice = preferredVoice.current; u.lang = preferredVoice.current.lang; }
      u.rate = item.heading ? 0.9 : 0.94; u.pitch = item.heading ? 0.96 : 1.0;
      u.onend = () => { qi++; const gap = item.heading ? 480 : (item.last ? 360 : 140); setTimeout(speakNext, gap); };
      u.onerror = () => { qi++; speakNext(); };
      window.speechSynthesis.speak(u);
    };
    speakNext();
  };

  const sendThoughts = async () => {
    const p = articles[current];
    const message = thoughts.msg.trim(), name = thoughts.name.trim(), email = thoughts.email.trim();
    if (!message) { showToast("Write a few words first, then send."); return; }
    if (!email) { showToast("Please add your email so we can receive your thoughts."); return; }
    if (!validEmail(email)) { showToast("That email doesn't look right. Please check it."); return; }
    if (onComment) { onComment({ slug:p.slug, name, email, message }); setThoughts({ name:"", email:"", msg:"" }); setSent(true); return; }
    setSending(true); setSent(false);
    try {
      const resp = await fetch(RELAY_ENDPOINT, {
        method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({ name: name||"A reader", email, message, article:p.title, link:shareUrlOf(p),
          _subject:"Thoughts on "+p.title, _replyto:email, _template:"table" }),
      });
      if (!resp.ok) throw new Error("relay");
      setThoughts({ name:"", email:"", msg:"" }); setSent(true);
    } catch(e) {
      const subject = encodeURIComponent("Thoughts on "+p.title);
      const body = encodeURIComponent(message+"\n\n"+(name?"From: "+name+"\n":"")+"Email: "+email+"\nArticle: "+p.title+"\n"+shareUrlOf(p));
      showToast("Opening your email app to send your thoughts.");
      setTimeout(()=>{ window.location.href = "mailto:"+COMMENTS_EMAIL+"?subject="+subject+"&body="+body; }, 600);
    } finally { setSending(false); }
  };

  const p = articles[current];
  const poemFontSize = "calc(clamp(1.18rem,2.1vw,1.34rem) + " + (fontStep*0.08) + "rem)";
  const cat = p ? (tagsOf(p)[0]||"") : "";
  const related = p ? articles.map((a,idx)=>({a,idx})).filter(({a,idx})=> idx!==current && tagsOf(a)[0]===cat).slice(0,3) : [];

  const Bookmark = ({ slug }) => (
    <span className={"pr-bookmark" + (saved.has(slug) ? " pr-bookmark--on" : "")}
      role="button" aria-label={saved.has(slug) ? "Saved" : "Save for later"}
      onClick={(e)=>{ e.stopPropagation(); toggleSave(slug); }}><IBookmark/></span>
  );

  const renderBody = () => {
    if (!p) return null;
    if (hasHtml(p.body)) {
      let html = p.body;
      return <div className="pr-poem" ref={poemRef} style={{ fontSize:poemFontSize }} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    const paras = splitParas(p.body);
    return (
      <div className="pr-poem" ref={poemRef} style={{ fontSize:poemFontSize }}>
        {paras.map((para,idx)=><p key={idx} className={idx===0 ? "pr-lead" : undefined}>{para}</p>)}
      </div>
    );
  };

  /* insert key-insight + lead class after HTML render */
  useEffect(() => {
    if (view !== "reader" || !poemRef.current) return;
    const el = poemRef.current;
    const firstP = el.querySelector("p");
    if (firstP && !firstP.classList.contains("pr-lead")) firstP.classList.add("pr-lead");
    if (p && p.keyInsight && !el.querySelector(".pr-keyinsight")) {
      const ki = document.createElement("div");
      ki.className = "pr-keyinsight"; ki.textContent = p.keyInsight;
      const lead = el.querySelector("p.pr-lead");
      if (lead && lead.nextSibling) el.insertBefore(ki, lead.nextSibling); else el.appendChild(ki);
    }
  }, [current, view, fontStep, p]);

  return (
    <div className="articles-exp-root pr-root">
      <div className="pr-grain" aria-hidden="true" />
      {view==="reader" && (
        <div className="pr-progress pr-progress--on" aria-hidden="true">
          <div className="pr-progress__bar" style={{ width: progress + "%" }} />
        </div>
      )}

      {/* ===================== GALLERY ===================== */}
      {view==="gallery" && (
        <section className={"pr-view pr-gallery" + (leaving ? " pr-leaving" : "")}>
          <div className="pr-banner"><img src={bannerImage} alt="Articles. Welcome to the article vault of eemodiae.org." /></div>

          <div className="pr-search">
            <ISearch/>
            <input type="search" placeholder="Search articles..." aria-label="Search articles"
              value={query} onChange={e=>{ setQuery(e.target.value); setPage(1); }} />
          </div>

          <div className="pr-controls">
            <div className="pr-chips" role="group" aria-label="Filter by theme">
              {allTags.map(tag => (
                <button key={tag} type="button" className={"pr-chip" + (tag===activeTag ? " pr-chip--on" : "")}
                  aria-pressed={tag===activeTag} onClick={()=>{ setActiveTag(tag); setPage(1); }}>{tag}</button>
              ))}
            </div>
            <div className="pr-controls__right">
              <button type="button" className={"pr-saved-tab" + (savedOnly ? " pr-saved-tab--on" : "")}
                aria-pressed={savedOnly}
                onClick={()=>{ if(!savedOnly && saved.size===0){ showToast("You have not saved any articles yet."); return; } setSavedOnly(s=>!s); setPage(1); window.scrollTo({top:0,behavior:"smooth"}); }}>
                <IBookmark/><span>{saved.size ? `Saved (${saved.size})` : "Saved"}</span>
              </button>
              <label className="pr-sort">
                <span>Sort</span>
                <select value={sortMode} onChange={e=>{ setSortMode(e.target.value); setPage(1); }} aria-label="Sort articles">
                  <option value="featured">Featured</option>
                  <option value="az">A to Z</option>
                  <option value="za">Z to A</option>
                </select>
              </label>
            </div>
          </div>

          {showFeatured && (
            <div className="pr-featured">
              <LeadCard p={list[0].p} onOpen={()=>openArticle(list[0].i)} Bookmark={Bookmark} />
            </div>
          )}

          {list.length > 0 ? (
            <div className="pr-grid">
              {slice.map(({p:a,i}, idx) => (
                <button key={a.slug} type="button" className="pr-tile pr-anim"
                  style={{ animationDelay:(idx*0.06)+"s", ["--cat" as string]: accentOf(a) }}
                  aria-label={"Read " + a.title}
                  onClick={(e)=>{ if(!e.target.closest(".pr-bookmark")) openArticle(i); }}>
                  <div className="pr-tile__thumb">
                    {a.image ? <img className="pr-tile__img" src={a.image} alt="" loading="lazy" decoding="async" draggable="false"/> : <div className="pr-tile__crest">EIE</div>}
                    <div className="pr-tile__veil" aria-hidden="true" />
                    <div className="pr-tile__body">
                      {tagsOf(a).length ? <span className="pr-tile__cat">{tagsOf(a)[0]}</span> : null}
                      <div className="pr-tile__title">{a.title}</div>
                      <div className="pr-tile__excerpt">{excerptOf(a)}</div>
                      <div className="pr-tile__meta"><IClock/> {readTimeOf(a)}</div>
                      <span className="pr-tile__read">Read More <IChevR/></span>
                    </div>
                    <Bookmark slug={a.slug} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="pr-empty">No articles match that search. Try another word.</div>
          )}

          {readSet.size > 0 && (
            <div className="pr-readcount">Congratulations, you have read <b>{readSet.size}</b> of <b>{articles.length}</b> articles in the vault.</div>
          )}

          <div className="pr-pager" style={{ display:"flex" }}>
            <button type="button" disabled={safePage<=1} onClick={()=>{ setPage(safePage-1); window.scrollTo({top:0,behavior:"smooth"}); }}>Prev</button>
            <span className="pr-pager__count">{safePage} of {pages}</span>
            <button type="button" disabled={safePage>=pages} onClick={()=>{ setPage(safePage+1); window.scrollTo({top:0,behavior:"smooth"}); }}>Next</button>
          </div>
        </section>
      )}

      {/* ===================== READER ===================== */}
      {view==="reader" && p && (
        <section className={"pr-view pr-shell" + (leaving ? " pr-leaving" : "")}>
          <main>
            <div className="pr-readerbar">
              <button type="button" className="pr-back" onClick={backToGallery}><IChevL/> Back to Articles</button>
              <div className="pr-readtools">
                <button type="button" className={"pr-rt pr-tip" + (speaking ? " pr-rt--active" : "")} data-tip="Hear this article read aloud" aria-label="Listen to this article" onClick={listen}><ISpeaker/><span>{speaking ? "Stop" : "Listen"}</span></button>
                <div className="pr-rt-font" role="group" aria-label="Text size">
                  <span className="pr-rt-fontlabel">Text size</span>
                  <button type="button" className="pr-rt pr-tip" data-tip="Smaller text" aria-label="Smaller text" disabled={fontStep<=-2} onClick={()=>setFontStep(s=>Math.max(-2,s-1))}>A<span className="pr-rt-minus">-</span></button>
                  <button type="button" className="pr-rt pr-tip" data-tip="Larger text" aria-label="Larger text" disabled={fontStep>=3} onClick={()=>setFontStep(s=>Math.min(3,s+1))}>A<span className="pr-rt-plus">+</span></button>
                </div>
              </div>
            </div>

            {resume.show && (
              <div className="pr-resume">
                <span>You were reading this article.</span>
                <button type="button" onClick={()=>{ window.scrollTo({ top:resume.y, behavior:"smooth" }); setResume({show:false,y:0}); resumeArmed.current = true; }}>Resume where you left off</button>
                <button type="button" className="pr-resume__x" aria-label="Dismiss" onClick={()=>setResume({show:false,y:0})}>&times;</button>
              </div>
            )}

            <article className="pr-paper" aria-live="polite">
              <header className="pr-hero">
                {p.image ? <img className="pr-hero__img" src={p.image} alt="" draggable="false"/> : <div className="pr-hero__crest">EIE</div>}
                <div className="pr-hero__veil" />
              </header>

              <div className="pr-articlehead">
                <h1 className="pr-title">{p.title}</h1>
                <div className="pr-readmeta"><IClock/> {readTimeOf(p)}</div>
              </div>

              <div className="pr-bodywrap">
                <div className="pr-ornament" aria-hidden="true"><IStar/></div>
                {renderBody()}
                {p.scripture && (<div className="pr-scripture"><b>{p.scripture.ref}</b>{p.scripture.text}</div>)}

                <div className="pr-author">
                  <div className="pr-author__photo">{authorPhoto ? <img src={authorPhoto} alt="Emmanuel I. Emodiae" draggable="false"/> : "E"}</div>
                  <div>
                    <div className="pr-author__label">Published by:</div>
                    <div className="pr-author__name">Emmanuel I. Emodiae</div>
                    <div className="pr-author__byline">Prophet | Preacher | Poet</div>
                    <div className="pr-author__handle">@eemodiae</div>
                  </div>
                </div>

                <div className="pr-share"><button type="button" onClick={doShare}><IShare/> Share with friends</button></div>

                <div className="pr-thoughts">
                  <div className="pr-thoughts__head"><IChat/> Share your thoughts on this article</div>
                  <p className="pr-thoughts__sub">Your reflections are a blessing to this house.</p>
                  <div className="pr-thoughts__fields">
                    <input type="text" placeholder="Your name (optional)" aria-label="Your name" value={thoughts.name} onChange={e=>setThoughts(t=>({...t,name:e.target.value}))}/>
                    <input type="email" placeholder="Your email (required)" aria-label="Your email" value={thoughts.email} onChange={e=>setThoughts(t=>({...t,email:e.target.value}))}/>
                  </div>
                  <input type="text" className="pr-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <textarea maxLength={1000} placeholder="Write your thoughts here..." aria-label="Share your thoughts on this article"
                    value={thoughts.msg} onChange={e=>setThoughts(t=>({...t,msg:e.target.value}))}/>
                  <div className="pr-thoughts__meta">
                    <span className="pr-thoughts__privacy">Your email is never published; it is used only to receive your reflections.</span>
                    <span className={"pr-thoughts__count" + (thoughts.msg.length>900 ? " pr-thoughts__count--warn" : "")}>{thoughts.msg.length} / 1000</span>
                  </div>
                  <button type="button" className="pr-thoughts__send" disabled={sending} onClick={sendThoughts}>
                    <span>{sending ? "Sending..." : "Send"}</span><ISend/>
                  </button>
                  <div className={"pr-thoughts__done" + (sent ? " pr-thoughts__done--live" : "")}>
                    <ICheck/> Thank you for sharing your thoughts. Your voice adds meaning to this article.
                  </div>
                </div>
              </div>
            </article>

            <nav className="pr-nav" aria-label="Article navigation">
              <button type="button" disabled={current===0} onClick={()=>goTo(current-1)}>
                <span className="pr-nav__dir">Previous Article</span>
                <span className="pr-nav__title">{current>0 ? articles[current-1].title : "Beginning of the vault"}</span>
              </button>
              <button type="button" className="pr-nav--next" disabled={current===articles.length-1} onClick={()=>goTo(current+1)}>
                <span className="pr-nav__dir">Next Article</span>
                <span className="pr-nav__title">{current<articles.length-1 ? articles[current+1].title : "End of the vault"}</span>
              </button>
            </nav>

            {related.length > 0 && (
              <section className="pr-related" aria-label="Related articles">
                <div className="pr-related__head">More on {cat}</div>
                <div className="pr-related__grid">
                  {related.map(({a,idx}) => (
                    <button key={a.slug} type="button" className="pr-tile" style={{ ["--cat" as string]: accentOf(a) }} onClick={()=>goTo(idx)}>
                      <div className="pr-tile__thumb">{a.image ? <img className="pr-tile__img" src={a.image} alt="" loading="lazy" decoding="async" draggable="false"/> : <div className="pr-tile__crest">EIE</div>}</div>
                      <div className="pr-tile__body"><div className="pr-tile__title">{a.title}</div></div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="pr-library" aria-label="Article tools">
            {toc.length >= 2 && (
              <nav className="pr-toc" aria-label="In this article">
                <div className="pr-toc__head">In this article</div>
                {toc.map((t,i)=>(
                  <a key={t.id} className={i===activeToc ? "pr-toc--active" : undefined}
                    onClick={()=>{ const h = document.getElementById(t.id); if(h){ const y = h.getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({top:y,behavior:"smooth"}); } }}>{t.text}</a>
                ))}
              </nav>
            )}
            <button type="button" className="pr-backvault" onClick={backToGallery}>
              <IChevL/> Back to Articles
            </button>
            <h2 className="pr-library__head">Continue Reading</h2>
            <p className="pr-library__sub">More from the article vault</p>
            <div className="pr-cards">
              {continueReadingIndices(articles.length, current).map((i) => {
                const a = articles[i];
                return (
                <button key={a.slug} type="button" className={"pr-card" + (i===current ? " pr-card--active" : "")}
                  aria-current={i===current} onClick={()=>goTo(i)}>
                  <div className="pr-card__img">{a.image ? <img src={a.image} alt="" loading="lazy" decoding="async" draggable="false"/> : null}</div>
                  <div className="pr-card__body">
                    <div className="pr-card__title">{a.title}</div>
                    {i===current ? <div className="pr-card__now">Now Reading</div> : <div className="pr-card__excerpt">{excerptOf(a)}</div>}
                  </div>
                </button>
              );})}
            </div>
          </aside>
        </section>
      )}

      <div className="pr-footer-transition" aria-hidden="true" />
      <div className={"pr-toast" + (toast.show ? " pr-toast--show" : "")}>{toast.msg}</div>
    </div>
  );
}

/* featured lead story */
function LeadCard({ p, onOpen, Bookmark }: { p: ExperienceArticle; onOpen: () => void; Bookmark: ComponentType<{ slug: string }> }) {
  return (
    <button type="button" className="pr-lead-card pr-anim" style={{ ["--cat" as string]: accentOf(p) }}
      aria-label={"Read " + p.title} onClick={(e)=>{ if(!e.target.closest(".pr-bookmark")) onOpen(); }}>
      <div className="pr-lead-card__thumb">
        <span className="pr-lead-card__badge">Featured</span>
        {p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" draggable="false"/> : <div className="pr-lead-card__crest">EIE</div>}
        <Bookmark slug={p.slug} />
      </div>
      <div className="pr-lead-card__body">
        {tagsOf(p).length ? <span className="pr-lead-card__cat">{tagsOf(p)[0]}</span> : null}
        <div className="pr-lead-card__title">{p.title}</div>
        <div className="pr-lead-card__excerpt">{excerptOf(p)}</div>
        <div className="pr-lead-card__meta"><span>Emmanuel I. Emodiae</span><span className="pr-dot" style={{width:4,height:4,borderRadius:"50%",background:"var(--pr-gold-soft)",display:"inline-block"}}/><span>{readTimeOf(p)}</span></div>
        <span className="pr-lead-card__read">Read the story <IChevR/></span>
      </div>
    </button>
  );
}
