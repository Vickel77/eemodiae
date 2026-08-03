// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useCallback, type ComponentType, type CSSProperties } from "react";
import type { ExperiencePoem } from "../../lib/content/experienceTypes";
import { cleanString } from "../../util/normalizeAndCompare";

/* ============================================================
   POEMS EXPERIENCE  |  eemodiae.org  (React)
   Faithful port of the poems-experience single-file build.
   Gallery (featured verse, search, theme chips, sort, saved) and
   reader (clean hero, title below, read-time, focus mode, font
   controls, bookmarks, share, comment box with hybrid delivery).
   Content protection blocks copy/right-click/drag/selection in
   the reading zones; only the main Share button distributes.

   USAGE:
     <PoemsExperience
        bannerImage="/images/poems-header.jpg"
        authorPhoto="/images/pastor.jpg"
        poems={cmsPoems}
        onNavigate={(slug|null)=>{}}
        onComment={({slug,name,email,message})=>{}}
     />
   Poem shape: { slug, title, subtitle, date, image,
                 tags:[...], scripture:{ref,text}|null, body }
   body: one string; blank lines separate stanzas.
   ============================================================ */

const COMMENTS_EMAIL = "eemodiaepoems@gmail.com";
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
  "Fatherhood":"var(--cat-fatherhood)","Faith":"var(--cat-faith)",
  "Nation":"var(--cat-nation)","Purpose":"var(--cat-purpose)",
  "Praise":"var(--cat-praise)","Wisdom":"var(--cat-wisdom)",
  "Creativity":"var(--cat-creativity)","Grief":"var(--cat-grief)"
};

/* session store; swap for window.localStorage to persist on the live site */
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
const excerptOf = (p: ExperiencePoem) => {
  const line = p.body.split("\n").map(s=>s.trim()).find(s=>s && !s.startsWith("("));
  return line || "Tap to read this poem";
};
const firstLineOf = excerptOf;
const readTimeOf = (p: ExperiencePoem) => {
  const words = p.body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words/180)) + " min read";
};
const splitStanzas = (body: string) => body.split(/\n\s*\n/).map(s=>s.split("\n"));
const validEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

/* ---------- small inline icons ---------- */
const IChevL = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>);
const IChevR = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 6l6 6-6 6"/></svg>);
const ISearch = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
const IStar = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3-6.3-4.6-6.3 4.6L8 13.7 2 9.2h7.6z"/></svg>);
const IShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>);
const IClock = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
const IBookmark = () => (<svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>);
const IFocus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg>);
const ISend = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>);
const IChat = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.9-.95L3 20l1-4.5A8.4 8.4 0 0 1 3.5 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z"/></svg>);
const ICheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>);
const IX = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>);

export type PoemsExperienceProps = {
  poems: ExperiencePoem[];
  bannerImage?: string;
  authorPhoto?: string;
  initialSlug?: string | null;
  onNavigate?: ((slug: string | null) => void) | null;
  onComment?: ((payload: { slug: string; name: string; email: string; message: string }) => void) | null;
};

export default function PoemsExperience({
  poems,
  bannerImage = "poems-header.jpg",
  authorPhoto = "",
  onNavigate = null,
  onComment = null,
  initialSlug = null,
}: PoemsExperienceProps) {
  const [view, setView] = useState("gallery");
  const [current, setCurrent] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("featured");
  const [activeTag, setActiveTag] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState(() => new Set());
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ show:false, msg:"" });
  const [fontStep, setFontStep] = useState(0);
  const [focusOpen, setFocusOpen] = useState(false);
  const [thoughts, setThoughts] = useState({ name:"", email:"", msg:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [count, setCount] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const galleryScroll = useRef(0);
  const poemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialSlug || !poems?.length) return;
    const idx = poems.findIndex(
      (item) => item.slug === initialSlug || cleanString(item.title) === cleanString(initialSlug)
    );
    if (idx < 0) return;
    setCurrent(idx);
    setView("reader");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [initialSlug, poems]);

  /* inject styles + fonts once */

  const showToast = useCallback((msg: string) => {
    setToast({ show:true, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show:false })), 2600);
  }, []);

  /* reading progress */
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY/total)*100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  /* content protection: block copy/cut/context/drag/selection in reading zones */
  useEffect(() => {
    const zone = e => e.target.closest(".pr-poem, .pr-paper, .pr-focus, .pr-hero__img, .pr-tile__img, img");
    let last = 0;
    const nudge = () => { const n = Date.now(); if (n-last>1500){ last=n; showToast("Please use the Share button to spread this."); } };
    const onCopy = e => { if (zone(e)){ e.preventDefault(); nudge(); } };
    const onCtx  = e => { if (zone(e)){ e.preventDefault(); nudge(); } };
    const onDrag = e => { if (zone(e)) e.preventDefault(); };
    const onSelStart = e => { if (zone(e)) e.preventDefault(); };
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("selectstart", onSelStart);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("selectstart", onSelStart);
    };
  }, [showToast]);


  const persistSaved = (next) => { try { store.setItem("ee_poems_saved", JSON.stringify([...next])); } catch(e){} };
  const toggleSave = (slug) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(slug)) { next.delete(slug); showToast("Removed from saved."); }
      else { next.add(slug); showToast("Saved for later."); }
      persistSaved(next);
      return next;
    });
  };

  /* derived gallery list */
  const q = query.trim().toLowerCase();
  let list = poems.map((p,i)=>({p,i})).filter(({p}) => {
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

  const allTags = ["All", ...Array.from(new Set(poems.flatMap(tagsOf)))];

  const transition = (fn) => { setLeaving(true); setTimeout(() => { fn(); setLeaving(false); }, 300); };

  const openPoem = (i) => {
    galleryScroll.current = window.scrollY;
    transition(() => {
      setCurrent(i); setView("reader"); setFontStep(0); setSent(false);
      setThoughts({ name:"", email:"", msg:"" });
      window.scrollTo({ top:0, behavior:"auto" });
      if (onNavigate) onNavigate(poems[i].slug);
    });
  };
  const backToGallery = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    transition(() => {
      setView("gallery"); setFocusOpen(false);
      window.scrollTo({ top:galleryScroll.current, behavior:"auto" });
      if (onNavigate) onNavigate(null);
    });
  };
  const goTo = (i) => {
    if (i===current || i<0 || i>=poems.length) return;
    transition(() => {
      setCurrent(i); setFontStep(0); setSent(false); setThoughts({ name:"", email:"", msg:"" });
      window.scrollTo({ top:0, behavior:"auto" });
      if (onNavigate) onNavigate(poems[i].slug);
    });
  };

  const shareUrlOf = (p) => "https://eemodiae.org/poems/" + p.slug;
  const shareTextOf = (p) => '"' + p.title + '" by Emmanuel I. Emodiae, Prophet | Preacher | Poet.\n' + shareUrlOf(p);

  const doShare = async () => {
    const p = poems[current];
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


  const sendThoughts = async () => {
    const p = poems[current];
    const message = thoughts.msg.trim(), name = thoughts.name.trim(), email = thoughts.email.trim();
    if (!message) { showToast("Write a few words first, then send."); return; }
    if (!email) { showToast("Please add your email so we can receive your thoughts."); return; }
    if (!validEmail(email)) { showToast("That email doesn't look right. Please check it."); return; }
    if (onComment) { onComment({ slug:p.slug, name, email, message }); setThoughts({ name:"", email:"", msg:"" }); setSent(true); return; }
    setSending(true); setSent(false);
    try {
      const resp = await fetch(RELAY_ENDPOINT, {
        method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({ name: name||"A reader", email, message, poem:p.title, link:shareUrlOf(p),
          _subject:"Thoughts on "+p.title, _replyto:email, _template:"table" }),
      });
      if (!resp.ok) throw new Error("relay");
      setThoughts({ name:"", email:"", msg:"" }); setSent(true);
    } catch(e) {
      const subject = encodeURIComponent("Thoughts on "+p.title);
      const body = encodeURIComponent(message+"\n\n"+(name?"From: "+name+"\n":"")+"Email: "+email+"\nPoem: "+p.title+"\n"+shareUrlOf(p));
      showToast("Opening your email app to send your thoughts.");
      setTimeout(()=>{ window.location.href = "mailto:"+COMMENTS_EMAIL+"?subject="+subject+"&body="+body; }, 600);
    } finally { setSending(false); }
  };

  useEffect(() => { setCount(poems.length); }, [poems]);

  const poem = poems[current];
  const poemFontSize = "calc(clamp(1.22rem,2.4vw,1.44rem) + " + (fontStep*0.08) + "rem)";

  const Bookmark = ({ slug }) => (
    <span
      className={"pr-bookmark" + (saved.has(slug) ? " pr-bookmark--on" : "")}
      role="button" aria-label={saved.has(slug) ? "Saved" : "Save for later"}
      onClick={(e)=>{ e.stopPropagation(); toggleSave(slug); }}
    ><IBookmark/></span>
  );

  return (
    <div className="poems-exp-root pr-root">
      <div className="pr-grain" aria-hidden="true" />
      {view==="reader" && (
        <div className="pr-progress pr-progress--on" aria-hidden="true">
          <div className="pr-progress__bar" style={{ width: progress + "%" }} />
        </div>
      )}

      {/* ===================== GALLERY ===================== */}
      {view==="gallery" && (
        <section className={"pr-view pr-gallery" + (leaving ? " pr-leaving" : "")}>
          <div className="pr-banner"><img src={bannerImage} alt="Poems. Welcome to the poetry gallery of eemodiae.org." /></div>

          <div className="pr-search">
            <ISearch/>
            <input type="search" placeholder="Search poems..." aria-label="Search poems"
              value={query} onChange={e=>{ setQuery(e.target.value); setPage(1); }} />
          </div>

          <div className="pr-controls">
            <div className="pr-chips" role="group" aria-label="Filter by theme">
              {allTags.map(tag => (
                <button key={tag} type="button"
                  className={"pr-chip" + (tag===activeTag ? " pr-chip--on" : "")}
                  aria-pressed={tag===activeTag}
                  onClick={()=>{ setActiveTag(tag); setPage(1); }}>{tag}</button>
              ))}
            </div>
            <div className="pr-controls__right">
              <button type="button" className={"pr-saved-tab" + (savedOnly ? " pr-saved-tab--on" : "")}
                aria-pressed={savedOnly}
                onClick={()=>{ if(!savedOnly && saved.size===0){ showToast("You have not saved any poems yet."); return; } setSavedOnly(s=>!s); setPage(1); window.scrollTo({top:0,behavior:"smooth"}); }}>
                <IBookmark/><span>{saved.size ? `Saved (${saved.size})` : "Saved"}</span>
              </button>
              <label className="pr-sort">
                <span>Sort</span>
                <select value={sortMode} onChange={e=>{ setSortMode(e.target.value); setPage(1); }} aria-label="Sort poems">
                  <option value="featured">Featured</option>
                  <option value="az">A to Z</option>
                  <option value="za">Z to A</option>
                </select>
              </label>
            </div>
          </div>

          {showFeatured && (
            <div className="pr-featured">
              <VerseCard p={list[0].p} onOpen={()=>openPoem(list[0].i)} Bookmark={Bookmark} />
            </div>
          )}

          {list.length > 0 ? (
            <div className="pr-grid">
              {slice.map(({p,i}, idx) => (
                <button key={p.slug} type="button" className="pr-tile pr-anim"
                  style={{ animationDelay:(idx*0.06)+"s", ["--cat" as string]: accentOf(p) }}
                  aria-label={"Read " + p.title}
                  onClick={(e)=>{ if(!e.target.closest(".pr-bookmark")) openPoem(i); }}>
                  {p.image ? <img className="pr-tile__img" src={p.image} alt="" loading="lazy" decoding="async" draggable="false"/> : <div className="pr-tile__crest">EIE</div>}
                  <div className="pr-tile__veil" />
                  <Bookmark slug={p.slug} />
                  <div className="pr-tile__body">
                    <div className="pr-tile__title">{p.title}</div>
                    <div className="pr-tile__excerpt">{excerptOf(p)}</div>
                    <span className="pr-tile__read">Read <IChevR/></span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="pr-empty">No poems match that search. Try another word.</div>
          )}

          <div className="pr-pager" style={{ display:"flex" }}>
            <button type="button" disabled={safePage<=1} onClick={()=>{ setPage(safePage-1); window.scrollTo({top:0,behavior:"smooth"}); }}>Prev</button>
            <span className="pr-pager__count">{safePage} of {pages}</span>
            <button type="button" disabled={safePage>=pages} onClick={()=>{ setPage(safePage+1); window.scrollTo({top:0,behavior:"smooth"}); }}>Next</button>
          </div>
        </section>
      )}

      {/* ===================== READER ===================== */}
      {view==="reader" && (
        <section className={"pr-view pr-shell" + (leaving ? " pr-leaving" : "")}>
          <main>
            <div className="pr-readerbar">
              <button type="button" className="pr-back" onClick={backToGallery}><IChevL/> Back to Poems</button>
              <div className="pr-readtools">
                <button type="button" className="pr-rt pr-tip" data-tip="Read without distractions" aria-label="Focus mode" onClick={()=>setFocusOpen(true)}><IFocus/><span>Focus</span></button>
                <div className="pr-rt-font" role="group" aria-label="Text size">
                  <span className="pr-rt-fontlabel">Text size</span>
                  <button type="button" className="pr-rt pr-tip" data-tip="Smaller text" aria-label="Smaller text" disabled={fontStep<=-2} onClick={()=>setFontStep(s=>Math.max(-2,s-1))}>A<span className="pr-rt-minus">-</span></button>
                  <button type="button" className="pr-rt pr-tip" data-tip="Larger text" aria-label="Larger text" disabled={fontStep>=3} onClick={()=>setFontStep(s=>Math.min(3,s+1))}>A<span className="pr-rt-plus">+</span></button>
                </div>
              </div>
            </div>

            <article className="pr-paper" aria-live="polite">
              <header className="pr-hero">
                {poem.image ? <img className="pr-hero__img" src={poem.image} alt="" draggable="false"/> : <div className="pr-hero__crest">EIE</div>}
                <div className="pr-hero__veil" />
              </header>

              <div className="pr-articlehead">
                <h1 className="pr-title">{poem.title}</h1>
                <div className="pr-readmeta"><IClock/> {readTimeOf(poem)}</div>
              </div>

              <div className="pr-bodywrap">
                <div className="pr-ornament" aria-hidden="true"><IStar/></div>
                <div className="pr-poem" ref={poemRef} style={{ fontSize: poemFontSize }}>
                  {splitStanzas(poem.body).map((lines, si) => (
                    <div className="pr-stanza" key={si}>{lines.map((l,li)=><p key={li}>{l}</p>)}</div>
                  ))}
                </div>

                {poem.scripture && (
                  <div className="pr-scripture"><b>{poem.scripture.ref}</b>{poem.scripture.text}</div>
                )}

                <div className="pr-author">
                  <div className="pr-author__photo">{authorPhoto ? <img src={authorPhoto} alt="Emmanuel I. Emodiae" draggable="false"/> : "E"}</div>
                  <div>
                    <div className="pr-author__label">Written by:</div>
                    <div className="pr-author__name">Emmanuel I. Emodiae</div>
                    <div className="pr-author__byline">Prophet | Preacher | Poet</div>
                    <div className="pr-author__handle">@eemodiae</div>
                  </div>
                </div>

                <div className="pr-share">
                  <button type="button" onClick={doShare}><IShare/> Share with friends</button>
                </div>

                <div className="pr-thoughts">
                  <div className="pr-thoughts__head"><IChat/> Share your thoughts on this poem</div>
                  <p className="pr-thoughts__sub">Your reflections are a blessing to this house.</p>
                  <div className="pr-thoughts__fields">
                    <input type="text" placeholder="Your name (optional)" aria-label="Your name" value={thoughts.name} onChange={e=>setThoughts(t=>({...t,name:e.target.value}))}/>
                    <input type="email" placeholder="Your email (required)" aria-label="Your email" value={thoughts.email} onChange={e=>setThoughts(t=>({...t,email:e.target.value}))}/>
                  </div>
                  <input type="text" className="pr-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <textarea maxLength={1000} placeholder="Write your thoughts here..." aria-label="Share your thoughts on this poem"
                    value={thoughts.msg} onChange={e=>setThoughts(t=>({...t,msg:e.target.value}))}/>
                  <div className="pr-thoughts__meta">
                    <span className="pr-thoughts__privacy">Your email is never published; it is used only to receive your reflections.</span>
                    <span className={"pr-thoughts__count" + (thoughts.msg.length>900 ? " pr-thoughts__count--warn" : "")}>{thoughts.msg.length} / 1000</span>
                  </div>
                  <button type="button" className="pr-thoughts__send" disabled={sending} onClick={sendThoughts}>
                    <span>{sending ? "Sending..." : "Send"}</span><ISend/>
                  </button>
                  <div className={"pr-thoughts__done" + (sent ? " pr-thoughts__done--live" : "")}>
                    <ICheck/> Thank you for sharing your thoughts. Your voice adds meaning to this poem.
                  </div>
                </div>
              </div>
            </article>

            <nav className="pr-nav" aria-label="Poem navigation">
              <button type="button" disabled={current===0} onClick={()=>goTo(current-1)}>
                <span className="pr-nav__dir">Previous Poem</span>
                <span className="pr-nav__title">{current>0 ? poems[current-1].title : "Beginning of the gallery"}</span>
              </button>
              <button type="button" className="pr-nav--next" disabled={current===poems.length-1} onClick={()=>goTo(current+1)}>
                <span className="pr-nav__dir">Next Poem</span>
                <span className="pr-nav__title">{current<poems.length-1 ? poems[current+1].title : "End of the gallery"}</span>
              </button>
            </nav>
          </main>

          <aside className="pr-library" aria-label="Continue reading">
            <button type="button" className="pr-backvault" onClick={backToGallery}>
              <IChevL/> Back to Poems
            </button>
            <h2 className="pr-library__head">Continue Reading</h2>
            <p className="pr-library__sub">More from the poetry gallery</p>
            <div className="pr-cards">
              {continueReadingIndices(poems.length, current).map((i) => {
                const p = poems[i];
                return (
                <button key={p.slug} type="button" className={"pr-card" + (i===current ? " pr-card--active" : "")}
                  aria-current={i===current} onClick={()=>goTo(i)}>
                  <div className="pr-card__img">{p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" draggable="false"/> : null}</div>
                  <div className="pr-card__body">
                    <div className="pr-card__title">{p.title}</div>
                    {i===current ? <div className="pr-card__now">Now Reading</div> : <div className="pr-card__excerpt">{excerptOf(p)}</div>}
                  </div>
                </button>
              );})}
            </div>
          </aside>
        </section>
      )}

      {/* ===================== FOCUS MODE ===================== */}
      {focusOpen && (
        <div className="pr-focus">
          <button type="button" className="pr-focus__exit" onClick={()=>setFocusOpen(false)}><IX/><span>Exit</span></button>
          <div className="pr-focus__scroll"><div className="pr-focus__inner">
            <div className="pr-focus-title">{poem.title}</div>
            <div className="pr-focus-orn">&#10087;</div>
            {splitStanzas(poem.body).map((lines, si) => (
              <div className="pr-focus-stanza" key={si} style={{ animationDelay:(0.15+si*0.12)+"s" }}>
                {lines.map((l,li)=><p key={li}>{l}</p>)}
              </div>
            ))}
          </div></div>
        </div>
      )}

      <div className="pr-footer-transition" aria-hidden="true" />
      <div className={"pr-toast" + (toast.show ? " pr-toast--show" : "")}>{toast.msg}</div>
    </div>
  );
}

/* featured verse card */
function VerseCard({ p, onOpen, Bookmark }: { p: ExperiencePoem; onOpen: () => void; Bookmark: ComponentType<{ slug: string }> }) {
  return (
    <button type="button" className="pr-verse-card pr-anim" style={{ ["--cat" as string]: accentOf(p) }}
      aria-label={"Read " + p.title} onClick={(e)=>{ if(!e.target.closest(".pr-bookmark")) onOpen(); }}>
      <div className="pr-verse-card__art">
        <span className="pr-verse-card__badge">Featured Verse</span>
        {p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" draggable="false"/> : <div className="pr-verse-card__crest">EIE</div>}
        <Bookmark slug={p.slug} />
      </div>
      <div className="pr-verse-card__body">
        {tagsOf(p).length ? <span className="pr-verse-card__cat">{tagsOf(p)[0]}</span> : null}
        <div className="pr-verse-card__title">{p.title}</div>
        <div className="pr-verse-card__line">{firstLineOf(p)}</div>
        <span className="pr-verse-card__read">Read the poem <IChevR/></span>
      </div>
    </button>
  );
}
