import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";
import useContentful from "../../hooks/useContentful";
import { sendSiteMail } from "../../util/sendSiteMail";

/* ============================================================
   eemodiae.org — ARTICLES  (redesign port)
   Two-view reading experience (gallery + in-place reader),
   ported 1:1 from the redesign and wired to the live
   Contentful source used across the site (eemodiaeArticle).
   All classes are namespaced pr- to avoid collision with the
   el- redesign system.
   ============================================================ */

const BANNER_SRC = "/redesign/articles-banner.jpg";
const AUTHOR_PHOTO = "/redesign/author-photo.jpg";
const PER_PAGE = 6;
const COMMENTS_EMAIL = "eemodiaearticles@gmail.com";
const MAIL_INBOX = "articles" as const;

/* ---- article view-model derived from the Contentful entry ---- */
type PR = {
  slug: string;
  title: string;
  body: string; // rich-text rendered to HTML (or plain text)
  image: string;
  tags: string[];
  scripture?: { ref: string; text: string } | null;
};

const CAT_ACCENT: Record<string, string> = {
  "Christian Living": "var(--cat-christian-living)",
  "Spiritual Growth": "var(--cat-spiritual-growth)",
  Freedom: "var(--cat-freedom)",
  Destiny: "var(--cat-destiny)",
  Holiness: "var(--cat-holiness)",
  Purpose: "var(--cat-purpose)",
};

const cleanSlug = (s: string) =>
  (s || "")
    .replace(/[^\w\s]/gi, "")
    .trim()
    .replace(/\s+/g, "_");

const stripHtml = (html: string) => {
  if (typeof document === "undefined") return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
};
const excerptOf = (p: PR) => {
  const text = stripHtml(p.body);
  if (!text || text.startsWith("(")) return "Tap to read this article";
  return text.length > 140 ? text.slice(0, 140).trim() + "..." : text;
};
const readTimeOf = (p: PR) => {
  const words = stripHtml(p.body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + " min read";
};
const accentOf = (p: PR) => CAT_ACCENT[(p.tags && p.tags[0]) || ""] || "var(--pr-royal)";

const decodeBasicEntities = (s: string) =>
  String(s || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lsqb;|&#91;/gi, "[")
    .replace(/&rsqb;|&#93;/gi, "]")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Pull-quote text if the whole string is wrapped in [] (ASCII or fullwidth). */
const pullQuoteFrom = (text: string): string | null => {
  let t = decodeBasicEntities(text);
  // Allow a wrapping quote layer around the brackets
  t = t.replace(/^["'“”‘’]\s*/, "").replace(/\s*["'“”‘’]$/, "");
  // Allow trailing punctuation after the closing bracket
  const m = t.match(/^[\[［【]\s*([\s\S]{3,800}?)\s*[\]］】][.:!?…]*$/);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
};

/** Format article HTML: headings, [pull quotes], scripture blockquotes. */
const enhanceArticleHtml = (raw: string): string => {
  let html = raw || "";

  // 1) Block whose visible text is entirely [pull quote]
  //    (works even when Contentful wraps marks: <p><b>[…]</b></p>)
  html = html.replace(
    /<(p|div|li|h[1-6])(\b[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (full, _tag, attrs = "", inner) => {
      if (/\bpr-keyinsight\b/i.test(String(attrs)) || /\bpr-keyinsight\b/i.test(full)) {
        return full;
      }
      const quote = pullQuoteFrom(inner);
      if (!quote) return full;
      return `<p class="pr-keyinsight">${quote}</p>`;
    }
  );

  // 2) [pull quote] sitting on its own line inside a paragraph (via <br>)
  html = html.replace(/<p(\b[^>]*)?>([\s\S]*?)<\/p>/gi, (full, attrs = "", inner) => {
    if (/\bpr-keyinsight\b/i.test(String(attrs))) return full;
    if (!/\[[\s\S]*?\]/.test(inner) && !/[［【][\s\S]*?[］】]/.test(inner)) return full;
    const parts = String(inner).split(/<br\s*\/?>/gi);
    if (parts.length < 2) return full;
    let changed = false;
    const out = parts.map((part) => {
      const quote = pullQuoteFrom(part);
      if (!quote) return part;
      changed = true;
      return `</p><p class="pr-keyinsight">${quote}</p><p>`;
    });
    if (!changed) return full;
    return `<p${attrs || ""}>${out.join("<br/>")}</p>`
      .replace(/<p[^>]*>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, "")
      .replace(/(?:<br\s*\/?>\s*)+(?=<\/p>)/gi, "")
      .replace(/(<p[^>]*>)\s*(?:<br\s*\/?>)+/gi, "$1");
  });

  // 3) Inline [pull quote] as its own sentence/block inside a paragraph —
  //    split the paragraph so the callout becomes a block element.
  html = html.replace(/<p(\b[^>]*)?>([\s\S]*?)<\/p>/gi, (full, attrs = "", inner) => {
    if (/\bpr-keyinsight\b/i.test(String(attrs))) return full;
    // Only rewrite when brackets wrap a substantial standalone phrase
    if (!/[\[［【][^\]］】]{8,}[\]］】]/.test(inner)) return full;
    const pieces: string[] = [];
    const re = /[\[［【]\s*([^\]］】]{8,800}?)\s*[\]］】]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let found = false;
    while ((m = re.exec(inner))) {
      const before = inner.slice(last, m.index);
      const beforeText = decodeBasicEntities(before);
      if (beforeText) pieces.push(`<p${attrs || ""}>${before}</p>`);
      pieces.push(`<p class="pr-keyinsight">${m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()}</p>`);
      last = m.index + m[0].length;
      found = true;
    }
    if (!found) return full;
    const after = inner.slice(last);
    if (decodeBasicEntities(after)) pieces.push(`<p${attrs || ""}>${after}</p>`);
    return pieces.join("");
  });

  // Normalize body headings to h2 (Contentful may emit h1–h4)
  html = html.replace(/<h[14](\b[^>]*)?>/gi, "<h2$1>").replace(/<\/h[14]>/gi, "</h2>");

  // Scripture-style blockquotes: promote trailing ref into <cite>
  html = html.replace(/<blockquote(\b[^>]*)?>([\s\S]*?)<\/blockquote>/gi, (_m, attrs = "", inner) => {
    let body = String(inner).trim();
    // Drop empty trailing paragraphs Contentful often adds
    body = body.replace(/(?:<p[^>]*>\s*<\/p>\s*)+$/gi, "").trim();
    if (/<cite[\s>]/i.test(body)) {
      return `<blockquote class="pr-verse"${attrs || ""}>${body}</blockquote>`;
    }
    const refPat =
      "((?:[1-3]\\s*)?[A-Z][A-Za-z]+(?:\\s+[A-Za-z]+)?\\s+\\d{1,3}:\\d{1,3}(?:\\s*[-–—]\\s*\\d{1,3})?)";
    const twoP = body.match(
      new RegExp(`^([\\s\\S]*)<\\/p>\\s*<p[^>]*>\\s*${refPat}\\s*<\\/p>\\s*$`, "i")
    );
    if (twoP) {
      body = `${twoP[1]}</p><cite>${twoP[2].trim()}</cite>`;
    } else {
      const brRef = body.match(new RegExp(`^([\\s\\S]*?)(?:<br\\s*\\/?>|\\n)\\s*${refPat}\\s*$`, "i"));
      if (brRef) {
        body = `${brRef[1].trim()}<cite>${brRef[2].trim()}</cite>`;
      } else {
        const plain = decodeBasicEntities(body);
        const endRef = plain.match(new RegExp(`^(.*?)\\s+${refPat}$`));
        if (endRef && endRef[1].length > 12) {
          body = `${endRef[1].trim()}<cite>${endRef[2].trim()}</cite>`;
        }
      }
    }
    return `<blockquote class="pr-verse"${attrs || ""}>${body}</blockquote>`;
  });

  // Clean empty leftovers from splits
  html = html.replace(/<p[^>]*>\s*<\/p>/gi, "");
  return html;
};

/* map a Contentful entry (spread from item.fields by useContentful) to PR */
const toPR = (a: any): PR => {
  const image =
    a?.image_url?.fields?.file?.url
      ? "https:" + a.image_url.fields.file.url
      : a?.image
      ? (String(a.image).startsWith("http") ? a.image : "https:" + a.image)
      : "";
  let body = "";
  try {
    body = a?.content ? documentToHtmlString(a.content, { preserveWhitespace: true } as any) : "";
  } catch {
    body = typeof a?.content === "string" ? a.content : "";
  }
  const tags: string[] = Array.isArray(a?.tags)
    ? a.tags
    : a?.category
    ? [a.category]
    : a?.theme
    ? [a.theme]
    : [];
  const scripture =
    a?.scripture && (a.scripture.ref || a.scripture.text)
      ? { ref: a.scripture.ref || "", text: a.scripture.text || "" }
      : null;
  return { slug: cleanSlug(a?.title || ""), title: a?.title || "Untitled", body, image, tags, scripture };
};

const isBrowser = () => typeof window !== "undefined";
const safeStore = {
  get(k: string) { try { return isBrowser() ? window.localStorage.getItem(k) : null; } catch { return null; } },
  set(k: string, v: string) { try { if (isBrowser()) window.localStorage.setItem(k, v); } catch {} },
  remove(k: string) { try { if (isBrowser()) window.localStorage.removeItem(k); } catch {} },
};

const Wrap = styled.div`
  /* ===== design tokens (scoped) ===== */

  /* category signature accents (subtle tints over the shared palette) */
  --cat-christian-living:#6d3fb0;
  --cat-spiritual-growth:#3f7bb0;
  --cat-freedom:#b06d3f;
  --cat-destiny:#8a5fd0;
  --cat-holiness:#3fa08a;
  --cat-purpose:#b03f6d;
  /* warm foundation */
  --pr-ivory:#f9f6ee;          /* warm ivory foundation */
  --pr-champagne:#f4ecdb;      /* champagne tint */
  --pr-milk:#fffdf8;           /* rich milky white surfaces */
  --pr-parchment:#fffdf8;
  --pr-vellum:#e9dfc9;         /* warm vellum rule */
  --pr-taupe:#b8a789;          /* warm taupe / soft stone */
  /* text + fine detail */
  --pr-ink:#332b47;            /* soft charcoal-violet ink */
  --pr-ink-soft:#5b5273;
  /* antique gold */
  --pr-gold:#b8923e; --pr-gold-soft:#d8bc7a; --pr-gold-bright:#e7cf94;
  /* royal purple signature : the velvet ribbon */
  --pr-royal:#4c2d8f;          /* royal indigo-purple */
  --pr-royal-deep:#34206a;     /* deep indigo */
  --pr-imperial:#6d3fb0;       /* soft imperial purple */
  --pr-plum:#5a2f7a;           /* rich plum */
  --pr-violet-soft:#8a5fd0;    /* soft violet for glows */
  /* legacy aliases kept so existing rules still resolve */
  --pr-indigo:var(--pr-royal);
  --pr-indigo-deep:var(--pr-royal-deep);
  --pr-shadow:0 18px 45px -18px rgba(52,32,106,.26);
  --pr-shadow-sm:0 8px 24px -12px rgba(52,32,106,.2);
  --pr-glow-gold:0 0 30px -6px rgba(184,146,62,.32);
  --pr-ease:cubic-bezier(.22,.61,.36,1);
  --pr-measure:calc(34 * clamp(1.22rem, 2.4vw, 1.44rem));

  position: relative;
  font-family: 'Crimson Pro', Georgia, serif;
  color: var(--pr-ink);
  -webkit-font-smoothing: antialiased;

/* ============================================================
   DESIGN TOKENS
   ============================================================ */

& *{margin:0;padding:0;box-sizing:border-box}
  &{
  background:
    radial-gradient(1000px 480px at 50% -4%, rgba(255,255,255,.7), transparent 62%),
    radial-gradient(1200px 520px at 85% -5%, rgba(184,146,62,.12), transparent 60%),
    radial-gradient(1100px 620px at -12% 96%, rgba(108,63,176,.06), transparent 58%),
    linear-gradient(180deg, var(--pr-ivory) 0%, var(--pr-champagne) 100%);
  color:var(--pr-ink);
  font-family:'Crimson Pro', Georgia, serif;
  -webkit-font-smoothing:antialiased;
}
&::before{
  content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url%28%23n%29' opacity='0.028'/%3E%3C/svg%3E");
}
.pr-view{position:relative; z-index:1; opacity:1; transform:translateY(0);
  transition:opacity .45s var(--pr-ease), transform .45s var(--pr-ease)}
.pr-view.pr-leaving{opacity:0; transform:translateY(14px)}
.pr-hidden{display:none !important}

/* ============================================================
   VIEW 1 : GALLERY LANDING PAGE
   ============================================================ */
.pr-gallery{max-width:1240px; margin:0 auto; padding:56px 20px 90px}
@media (max-width:640px){.pr-gallery{padding:40px 16px 70px}}

/* banner header image : true full-bleed across the viewport */
.pr-banner{
  overflow:hidden;
  background:var(--pr-milk);
  position:relative;
  width:100vw;
  max-width:100vw;
  margin:-56px 0 0;
  margin-left:calc(50% - 50vw);
  margin-right:calc(50% - 50vw);
}
@media (max-width:640px){.pr-banner{margin-top:-40px}}
.pr-banner img{width:100%; display:block}
.pr-banner::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  box-shadow:inset 0 0 46px rgba(43,36,64,.12);
}

/* search */
.pr-search{max-width:560px; margin:44px auto 0; position:relative}
.pr-search svg{
  position:absolute; left:4px; top:50%; transform:translateY(-50%);
  width:17px; height:17px; color:var(--pr-gold); pointer-events:none;
}
.pr-search input{
  width:100%; background:transparent; border:none;
  border-bottom:1px solid var(--pr-vellum);
  font-family:'Cormorant Garamond',serif; font-size:1.15rem; font-style:italic;
  color:var(--pr-ink); padding:12px 8px 12px 32px; outline:none;
  transition:border-color .3s;
}
.pr-search input::placeholder{color:#9c94b8}
.pr-search input:focus{
  border-bottom-color:var(--pr-royal);
  box-shadow:0 3px 0 -1px rgba(76,45,143,.25), 0 8px 22px -12px rgba(184,146,62,.5);
}

/* sort + theme filter */
.pr-controls{
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:16px 24px; max-width:1240px; margin:26px auto 0;
}
.pr-chips{display:flex; flex-wrap:wrap; gap:10px}
.pr-chip{
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.16em;
  text-transform:uppercase; color:var(--pr-ink-soft);
  background:var(--pr-milk); border:1px solid var(--pr-vellum);
  border-radius:999px; padding:8px 16px; cursor:pointer;
  transition:all .25s var(--pr-ease);
}
.pr-chip:hover{border-color:var(--pr-royal); color:var(--pr-royal)}
.pr-chip--on{
  background:linear-gradient(135deg, var(--pr-royal), var(--pr-royal-deep));
  color:var(--pr-gold-bright);
  border-color:rgba(184,146,62,.55);
  box-shadow:var(--pr-shadow-sm), inset 0 1px 0 rgba(231,207,148,.25);
}
.pr-sort{
  display:inline-flex; align-items:center; gap:10px;
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.16em;
  text-transform:uppercase; color:var(--pr-ink-soft);
}
.pr-sort select{
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1rem;
  color:var(--pr-indigo-deep); background:var(--pr-milk);
  border:1px solid var(--pr-vellum); border-radius:10px;
  padding:8px 30px 8px 14px; cursor:pointer; outline:none;
  appearance:none; -webkit-appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23b8923e' stroke-width='2.4'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 12px center;
  transition:border-color .3s;
}
.pr-sort select:focus{border-color:var(--pr-royal); box-shadow:0 0 0 3px rgba(76,45,143,.12)}

/* ===== FEATURED LEAD STORY (magazine cover) ===== */
.pr-featured{ margin-top:38px }
.pr-featured:empty{ display:none }
.pr-lead-card{
  display:grid; grid-template-columns:1.15fr 1fr; gap:0;
  border-radius:20px; overflow:hidden; cursor:pointer;
  border:1px solid var(--pr-vellum); background:var(--pr-milk);
  box-shadow:var(--pr-shadow); text-align:left; font-family:inherit; padding:0;
  transition:transform .4s var(--pr-ease), box-shadow .4s var(--pr-ease), border-color .4s;
}
.pr-lead-card:hover{ transform:translateY(-5px); box-shadow:var(--pr-shadow), var(--pr-glow-gold); border-color:var(--pr-gold-soft) }
.pr-lead-card:focus-visible{ outline:2px solid var(--pr-gold); outline-offset:3px }
@media (max-width:760px){ .pr-lead-card{ grid-template-columns:1fr } }
.pr-lead-card__thumb{
  position:relative; min-height:320px; overflow:hidden;
  background:linear-gradient(150deg,var(--pr-royal-deep),var(--pr-royal) 60%,var(--pr-imperial));
}
@media (max-width:760px){ .pr-lead-card__thumb{ min-height:220px; aspect-ratio:16/9 } }
.pr-lead-card__thumb img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .8s var(--pr-ease) }
.pr-lead-card:hover .pr-lead-card__thumb img{ transform:scale(1.05) }
.pr-lead-card__crest{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-size:3.4rem; letter-spacing:.2em; color:rgba(231,207,148,.18) }
.pr-lead-card__badge{
  position:absolute; top:18px; left:18px; z-index:2;
  font-family:'Crimson Pro',serif; font-size:.64rem; font-weight:600; letter-spacing:.24em;
  text-transform:uppercase; color:var(--pr-royal-deep);
  background:linear-gradient(135deg,var(--pr-gold-bright),var(--pr-gold-soft));
  border-radius:999px; padding:7px 16px; box-shadow:0 4px 14px -6px rgba(184,146,62,.7);
}
.pr-lead-card__body{ padding:clamp(26px,3.5vw,46px); display:flex; flex-direction:column; justify-content:center }
.pr-lead-card__cat{
  align-self:flex-start; margin-bottom:14px;
  font-family:'Crimson Pro',serif; font-size:.66rem; letter-spacing:.22em; text-transform:uppercase;
  color:#fff; border-radius:999px; padding:5px 14px;
  background:var(--cat, var(--pr-royal));
}
.pr-lead-card__title{
  font-family:'Cinzel',serif; font-weight:700; line-height:1.2;
  font-size:clamp(1.5rem,2.8vw,2.15rem); color:var(--pr-royal-deep);
}
.pr-lead-card__excerpt{
  font-family:'Cormorant Garamond',serif; font-size:clamp(1.1rem,1.6vw,1.25rem);
  line-height:1.6; color:var(--pr-ink-soft); margin-top:14px;
  display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
}
.pr-lead-card__meta{
  display:flex; align-items:center; gap:14px; margin-top:20px;
  font-family:'Crimson Pro',serif; font-size:.8rem; letter-spacing:.06em; color:var(--pr-ink-soft);
}
.pr-lead-card__read{
  display:inline-flex; align-items:center; gap:9px; margin-top:24px;
  font-family:'Crimson Pro',serif; font-size:.74rem; font-weight:600; letter-spacing:.22em;
  text-transform:uppercase; color:var(--pr-royal); transition:gap .3s var(--pr-ease) }
.pr-lead-card:hover .pr-lead-card__read{ gap:13px }
.pr-lead-card__read svg{ width:13px; height:13px }

/* ===== BOOKMARK ribbon on cards ===== */
.pr-bookmark{
  position:absolute; top:12px; right:12px; z-index:4;
  width:34px; height:34px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,253,248,.9); border:1px solid var(--pr-vellum);
  cursor:pointer; box-shadow:var(--pr-shadow-sm);
  transition:background .25s, transform .25s var(--pr-ease), border-color .25s;
}
.pr-bookmark:hover{ transform:scale(1.08); border-color:var(--pr-gold-soft) }
.pr-bookmark svg{ width:16px; height:16px; color:var(--pr-royal); fill:none; transition:fill .25s, color .25s }
.pr-bookmark--on svg{ fill:var(--pr-gold); color:var(--pr-gold) }
.pr-bookmark--on{ background:#fff; border-color:var(--pr-gold-soft) }

/* category spine + accent on standard cards */
.pr-tile{ --cat:var(--pr-royal) }
.pr-tile__cat{ color:#fff !important; background:var(--cat); border-color:transparent !important }

/* entrance animation (staggered fade-up) */
@keyframes prFadeUp{ from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:translateY(0)} }
.pr-anim{ opacity:0; animation:prFadeUp .55s var(--pr-ease) forwards }

/* ===== READING DATELINE (reader) ===== */
.pr-dateline{
  display:flex; align-items:center; flex-wrap:wrap; gap:8px 14px; margin-top:16px;
  font-family:'Crimson Pro',serif; font-size:.9rem; letter-spacing:.04em; color:#e6e0d0;
}
.pr-dateline .pr-dot{ width:4px; height:4px; border-radius:50%; background:var(--pr-gold-soft); opacity:.8 }
.pr-dateline .pr-dl-cat{ color:var(--pr-gold-soft); text-transform:uppercase; letter-spacing:.16em; font-size:.78rem }

/* ===== KEY INSIGHT callout ([bracketed] text) ===== */
.pr-poem .pr-keyinsight, .pr-keyinsight{
  margin:2.2em auto; padding:28px 22px 26px; max-width:var(--pr-measure);
  border-top:1.5px solid var(--pr-gold-soft); border-bottom:1.5px solid var(--pr-gold-soft);
  font-family:'Cinzel',serif; font-weight:500; font-size:clamp(1.05rem,1.9vw,1.35rem);
  line-height:1.45; color:var(--pr-royal-deep); text-align:center;
  text-transform:uppercase; letter-spacing:.06em;
  position:relative; background:transparent;
}
.pr-keyinsight::before{
  content:"\\201C"; display:block; font-family:'Cinzel',serif; font-size:2.2rem;
  color:var(--pr-gold); line-height:.55; margin-bottom:10px; font-weight:600;
}

/* ===== TABLE OF CONTENTS (sidebar) ===== */
.pr-toc{ margin-bottom:30px }
.pr-toc:empty{ display:none }
.pr-toc__head{
  font-family:'Cinzel',serif; font-size:.92rem; font-weight:600; letter-spacing:.14em;
  text-transform:uppercase; color:var(--pr-royal-deep);
  display:flex; align-items:center; gap:12px; margin-bottom:14px;
}
.pr-toc__head::after{ content:""; flex:1; height:1px; background:var(--pr-vellum) }
.pr-toc a{
  display:block; padding:8px 0 8px 16px; border-left:2px solid var(--pr-vellum);
  font-family:'Cormorant Garamond',serif; font-size:1.02rem; line-height:1.35;
  color:var(--pr-ink-soft); text-decoration:none; cursor:pointer;
  transition:color .25s, border-color .25s;
}
.pr-toc a:hover{ color:var(--pr-royal) }
.pr-toc a.pr-toc--active{ color:var(--pr-royal-deep); border-left-color:var(--pr-gold); font-weight:600 }

/* ===== RELATED BY CATEGORY (reader foot) ===== */
.pr-related{ margin-top:40px }
.pr-related:empty{ display:none }
.pr-related__head{
  font-family:'Cinzel',serif; font-size:1.05rem; font-weight:600; letter-spacing:.1em;
  color:var(--pr-royal-deep); display:flex; align-items:center; gap:14px; margin-bottom:20px;
}
.pr-related__head::after{ content:""; flex:1; height:1px; background:var(--pr-vellum) }
.pr-related__grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px }
@media (max-width:760px){ .pr-related__grid{ grid-template-columns:1fr } }

/* editorial article-card grid : image on top, ivory body */
.pr-grid{
  display:grid; grid-template-columns:repeat(3,1fr);
  gap:26px; margin-top:30px;
}
@media (max-width:900px){ .pr-grid{grid-template-columns:repeat(2,1fr); gap:22px} }
@media (max-width:560px){ .pr-grid{grid-template-columns:1fr; gap:22px} }

.pr-tile{
  position:relative; display:flex; flex-direction:column;
  border-radius:16px; overflow:hidden; cursor:pointer;
  border:1px solid var(--pr-vellum);
  background:var(--pr-milk);
  box-shadow:var(--pr-shadow-sm);
  padding:0; text-align:left; font-family:inherit;
  transition:transform .35s var(--pr-ease), box-shadow .35s var(--pr-ease), border-color .35s;
}
.pr-tile:hover{transform:translateY(-6px); box-shadow:var(--pr-shadow), var(--pr-glow-gold);
  border-color:var(--pr-gold-soft)}
.pr-tile:focus-visible{outline:2px solid var(--pr-gold); outline-offset:3px}

/* thumbnail */
.pr-tile__thumb{
  position:relative; aspect-ratio:16/10; overflow:hidden;
  background:linear-gradient(150deg, var(--pr-royal-deep), var(--pr-royal) 60%, var(--pr-imperial));
}
.pr-tile__img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  filter:saturate(.95) contrast(1.03);
  transition:transform .8s var(--pr-ease);
}
.pr-tile:hover .pr-tile__img{transform:scale(1.06)}
.pr-tile__crest{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-size:2.6rem; letter-spacing:.2em;
  color:rgba(231,207,148,.18); user-select:none;
}
.pr-tile__thumb::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  box-shadow:inset 0 -30px 40px -20px rgba(38,22,74,.35);
}

/* body */
.pr-tile__body{ padding:20px 22px 22px; display:flex; flex-direction:column; flex:1 }
.pr-tile__cat{
  align-self:flex-start; margin-bottom:10px;
  font-family:'Crimson Pro',serif; font-size:.62rem; letter-spacing:.22em;
  text-transform:uppercase; color:var(--pr-gold);
  border:1px solid var(--pr-vellum); border-radius:999px; padding:4px 11px;
}
.pr-tile__title{
  font-family:'Cinzel',serif; font-weight:600; line-height:1.3;
  font-size:1.08rem; color:var(--pr-royal-deep);
  display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
}
.pr-tile__excerpt{
  font-family:'Cormorant Garamond',serif; font-size:1.02rem; line-height:1.5;
  color:var(--pr-ink-soft); margin-top:9px;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.pr-tile__read{
  display:inline-flex; align-items:center; gap:8px; margin-top:16px;
  font-family:'Crimson Pro',serif; font-size:.72rem; font-weight:600;
  letter-spacing:.22em; text-transform:uppercase; color:var(--pr-royal);
  transition:gap .3s var(--pr-ease), color .3s;
}
.pr-tile__meta{
  display:inline-flex; align-items:center; gap:7px; margin-top:12px;
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.08em;
  text-transform:uppercase; color:var(--pr-ink-soft);
}
.pr-tile__meta svg{ width:13px; height:13px; color:var(--pr-gold) }
.pr-tile:hover .pr-tile__read{gap:12px; color:var(--pr-royal-deep)}
.pr-tile__read svg{width:12px;height:12px}

/* pagination */
.pr-pager{
  display:flex; align-items:center; justify-content:center; gap:26px;
  margin-top:48px;
}
.pr-pager button{
  background:var(--pr-milk); border:1px solid var(--pr-vellum); border-radius:999px;
  font-family:'Crimson Pro',serif; font-size:.82rem; letter-spacing:.2em;
  text-transform:uppercase; color:var(--pr-royal); padding:11px 26px;
  cursor:pointer; transition:all .25s var(--pr-ease);
}
.pr-pager button:hover:not(:disabled){
  border-color:var(--pr-gold-soft); color:var(--pr-royal-deep);
  box-shadow:var(--pr-shadow-sm), var(--pr-glow-gold); transform:translateY(-1px);
}
.pr-pager button:disabled{opacity:.35; cursor:default}
.pr-pager__count{
  font-family:'Crimson Pro',serif; font-size:.8rem; letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--pr-gold-bright);
  background:linear-gradient(135deg, var(--pr-royal), var(--pr-royal-deep));
  border:1px solid rgba(184,146,62,.55); border-radius:999px;
  padding:9px 20px;
  box-shadow:var(--pr-shadow-sm), inset 0 1px 0 rgba(231,207,148,.22);
}
.pr-empty{
  text-align:center; margin-top:60px;
  font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:1.2rem; color:var(--pr-ink-soft);
}

/* ============================================================
   VIEW 2 : READER (the sanctuary)
   ============================================================ */
.pr-progress{
  position:fixed; top:0; left:0; right:0; height:3px; z-index:60;
  background:rgba(184,146,62,.14); opacity:0; transition:opacity .4s;
}
.pr-progress.pr-progress--on{opacity:1}
.pr-progress__bar{
  height:100%; width:0%;
  background:linear-gradient(90deg,var(--pr-gold),var(--pr-gold-soft));
  box-shadow:0 0 8px rgba(184,146,62,.5); transition:width .12s linear;
}

.pr-shell{
  max-width:1240px; margin:0 auto; padding:32px 20px 28px;
  display:grid; grid-template-columns:minmax(0,1fr) 330px;
  gap:48px; align-items:start;
}
@media (max-width:980px){
  .pr-shell{grid-template-columns:1fr; gap:56px; padding:24px 16px 72px}
}

.pr-back{
  display:inline-flex; align-items:center; gap:8px;
  font-family:'Crimson Pro',serif; font-size:.95rem; letter-spacing:.08em;
  text-transform:uppercase; color:var(--pr-indigo); background:none; border:none;
  cursor:pointer; margin-bottom:20px;
}
.pr-back:hover{color:var(--pr-royal-deep)}
.pr-back svg{width:14px;height:14px}

/* ===== controls right cluster ===== */
.pr-controls__right{ display:flex; align-items:center; gap:18px }
.pr-saved-tab{
  display:inline-flex; align-items:center; gap:8px;
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.16em;
  text-transform:uppercase; color:var(--pr-royal);
  background:var(--pr-milk); border:1px solid var(--pr-vellum); border-radius:999px;
  padding:8px 16px; cursor:pointer; transition:all .25s var(--pr-ease);
}
.pr-saved-tab svg{ width:14px; height:14px; fill:none; transition:fill .25s }
.pr-saved-tab:hover{ border-color:var(--pr-gold-soft) }
.pr-saved-tab--on{
  background:linear-gradient(135deg,var(--pr-royal),var(--pr-royal-deep));
  color:var(--pr-gold-bright); border-color:rgba(184,146,62,.5);
}
.pr-saved-tab--on svg{ fill:var(--pr-gold-bright) }

/* reading counter */
.pr-readcount{
  text-align:center; margin-top:16px;
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1rem;
  color:var(--pr-ink-soft);
}
.pr-readcount:empty, .pr-readcount[hidden]{ display:none }
.pr-readcount b{ color:var(--pr-royal); font-style:normal; font-weight:600 }

/* ===== reader toolbar ===== */
.pr-readerbar{ display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; flex-wrap:wrap }
.pr-readtools{ display:flex; align-items:center; gap:10px }
.pr-rt{
  display:inline-flex; align-items:center; gap:6px;
  font-family:'Crimson Pro',serif; font-size:.78rem; letter-spacing:.06em;
  color:var(--pr-royal); background:var(--pr-milk);
  border:1px solid var(--pr-vellum); border-radius:999px;
  padding:8px 14px; cursor:pointer; transition:all .25s var(--pr-ease);
}
.pr-rt:hover{ border-color:var(--pr-gold-soft); color:var(--pr-royal-deep) }
.pr-rt svg{ width:15px; height:15px }
.pr-rt-minus{ font-size:.7em; vertical-align:sub } .pr-rt-plus{ font-size:.7em; vertical-align:super }
.pr-rt-font{ display:inline-flex; align-items:center; gap:6px }
.pr-rt-fontlabel{
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.12em;
  text-transform:uppercase; color:var(--pr-ink-soft); margin-right:2px;
}
@media (max-width:520px){ .pr-rt-fontlabel{ display:none } }

/* hover tooltip */
.pr-tip{ position:relative }
.pr-tip::after{
  content:attr(data-tip);
  position:absolute; bottom:calc(100% + 9px); left:50%; transform:translateX(-50%) translateY(4px);
  white-space:nowrap;
  font-family:'Crimson Pro',serif; font-size:.72rem; font-weight:500; letter-spacing:.05em;
  text-transform:none;
  color:var(--pr-gold-bright); background:var(--pr-royal-deep);
  border:1px solid rgba(184,146,62,.4);
  padding:6px 12px; border-radius:8px;
  box-shadow:var(--pr-shadow-sm);
  opacity:0; pointer-events:none;
  transition:opacity .2s var(--pr-ease), transform .2s var(--pr-ease);
  z-index:20;
}
.pr-tip::before{
  content:""; position:absolute; bottom:calc(100% + 3px); left:50%; transform:translateX(-50%);
  border-left:5px solid transparent; border-right:5px solid transparent;
  border-top:6px solid var(--pr-royal-deep);
  opacity:0; pointer-events:none; transition:opacity .2s var(--pr-ease); z-index:20;
}
.pr-tip:hover::after{ opacity:1; transform:translateX(-50%) translateY(0) }
.pr-tip:hover::before{ opacity:1 }
@media (hover:none){ .pr-tip::after, .pr-tip::before{ display:none } }
.pr-rt--active{ background:linear-gradient(135deg,var(--pr-royal),var(--pr-royal-deep)); color:var(--pr-gold-bright); border-color:transparent }
.pr-rt--active svg{ color:var(--pr-gold-bright) }
/* the currently-spoken paragraph */
.pr-speaking{ background:linear-gradient(90deg, rgba(184,146,62,.14), transparent 80%); border-radius:6px; box-shadow:-10px 0 0 rgba(184,146,62,.14) }

/* ===== resume banner ===== */
.pr-resume{
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
  margin-bottom:20px; padding:14px 20px; border-radius:14px;
  background:linear-gradient(135deg, rgba(108,63,176,.08), rgba(184,146,62,.05));
  border:1px solid var(--pr-gold-soft);
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.05rem; color:var(--pr-ink);
}
.pr-resume[hidden]{ display:none }
.pr-resume button#prResumeBtn{
  font-family:'Crimson Pro',serif; font-style:normal; font-size:.74rem; font-weight:600;
  letter-spacing:.16em; text-transform:uppercase; color:var(--pr-gold-bright);
  background:linear-gradient(135deg,var(--pr-royal),var(--pr-royal-deep));
  border:1px solid rgba(184,146,62,.5); border-radius:999px; padding:9px 20px; cursor:pointer;
  transition:filter .25s;
}
.pr-resume button#prResumeBtn:hover{ filter:brightness(1.08) }
.pr-resume__x{ margin-left:auto; background:none; border:none; font-size:1.4rem; line-height:1;
  color:var(--pr-ink-soft); cursor:pointer; padding:0 4px }

/* reading zones: selection disabled (share-a-line removed) */
.pr-poem, .pr-hero, .pr-tile__img{
  -webkit-user-select:none; -moz-user-select:none; user-select:none;
}

.pr-paper{
  background:var(--pr-parchment); border:1px solid var(--pr-vellum);
  border-radius:18px; box-shadow:var(--pr-shadow); overflow:hidden;
}
.pr-hero{
  position:relative; height:auto; aspect-ratio:768/305; min-height:120px;
  overflow:hidden;
  background:linear-gradient(150deg,var(--pr-royal-deep) 0%,var(--pr-royal) 52%,var(--pr-imperial) 100%);
}
.pr-hero__img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  filter:saturate(.92) contrast(1.04) brightness(.9);
}
.pr-hero__veil{
  position:absolute; inset:0;
  background:linear-gradient(to top, rgba(38,22,74,.8) 0%, rgba(52,32,106,.3) 45%, rgba(90,47,122,.14) 100%);
}
.pr-hero__crest{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-size:5rem; color:rgba(231,207,148,.16);
  letter-spacing:.2em; user-select:none;
}
/* article header sits below the clean hero image */
.pr-articlehead{
  padding:clamp(28px,5vw,48px) clamp(22px,7vw,84px) 0;
  text-align:center;
}
.pr-title{
  font-family:'Cinzel',serif; font-weight:600; color:var(--pr-royal-deep);
  font-size:clamp(1.7rem,4.4vw,2.7rem); line-height:1.18;
  max-width:20em; margin:0 auto;
}
.pr-readmeta{
  display:inline-flex; align-items:center; gap:8px; margin-top:16px;
  font-family:'Crimson Pro',serif; font-size:.86rem; letter-spacing:.08em;
  text-transform:uppercase; color:var(--pr-ink-soft);
}
.pr-readmeta svg{ width:15px; height:15px; color:var(--pr-gold) }

.pr-bodywrap{padding:clamp(28px,5vw,52px) clamp(22px,7vw,84px) clamp(26px,5vw,52px)}
.pr-ornament{
  display:flex; align-items:center; justify-content:center; gap:16px;
  margin:0 auto 38px; color:var(--pr-gold);
}
.pr-ornament::before,.pr-ornament::after{
  content:""; height:1px; width:min(120px,26vw);
  background:linear-gradient(90deg,transparent,rgba(76,45,143,.35) 55%,var(--pr-gold-soft));
}
.pr-ornament::after{background:linear-gradient(90deg,var(--pr-gold-soft),rgba(76,45,143,.35) 45%,transparent)}
.pr-ornament svg{width:16px;height:16px}

/* long-form article body */
.pr-poem{
  font-family:'Cormorant Garamond',serif;
  font-size:clamp(1.18rem,2.1vw,1.34rem); line-height:1.8;
  color:var(--pr-ink); max-width:var(--pr-measure); margin:0 auto;
}
.pr-poem > p{margin:0 0 1.3em}
.pr-poem > p:last-child{margin-bottom:0}
/* drop cap on the opening paragraph */
.pr-poem > p.pr-lead:first-letter{
  font-family:'Cinzel',serif; font-size:3.2em; line-height:.8;
  float:left; color:var(--pr-royal); font-weight:600;
  padding:6px 12px 0 0; margin-top:4px;
}
/* section headings — uppercase Cinzel */
.pr-poem h2, .pr-poem h3{
  font-family:'Cinzel',serif; font-weight:600;
  font-size:clamp(1.15rem,2.2vw,1.45rem); line-height:1.3;
  color:var(--pr-royal-deep); margin:2em 0 .85em;
  text-transform:uppercase; letter-spacing:.08em;
}
.pr-poem h3{
  font-size:clamp(1.02rem,1.9vw,1.22rem); letter-spacing:.07em;
}
/* emphasis + links inside prose */
.pr-poem strong{color:var(--pr-royal-deep); font-weight:600}
.pr-poem em{font-style:italic}
.pr-poem a{color:var(--pr-royal); text-decoration:underline; text-underline-offset:3px;
  text-decoration-color:var(--pr-gold-soft)}
/* in-body images */
.pr-poem figure{margin:2.2em 0; text-align:center}
.pr-poem figure img{
  width:100%; border-radius:14px; border:1px solid var(--pr-vellum);
  box-shadow:var(--pr-shadow-sm);
}
.pr-poem figure figcaption{
  font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:.95rem; color:var(--pr-ink-soft); margin-top:10px;
}
/* scripture blockquotes — warm blush panel, tight vertical rhythm */
.pr-poem blockquote,
.pr-poem blockquote.pr-verse{
  margin:.7em 0; padding:10px 16px 10px 18px;
  background:#f6ebe0;
  border:none;
  border-left:4px solid var(--pr-gold); border-radius:0 8px 8px 0;
  font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:1.12rem; line-height:1.5; color:var(--pr-ink);
  quotes:none;
}
.pr-poem blockquote p{
  margin:0 !important; padding:0; font-style:inherit; color:inherit; line-height:inherit;
}
.pr-poem blockquote p + p{margin-top:.3em !important}
.pr-poem blockquote cite{
  display:block; margin-top:5px; font-style:normal; font-size:.92rem;
  letter-spacing:.03em; color:var(--pr-royal-deep); font-family:'Crimson Pro',serif;
  font-weight:500;
}

/* standalone scripture block (optional, below the body) */
.pr-scripture{
  max-width:var(--pr-measure); margin:52px auto 0; padding:22px 26px;
  background:linear-gradient(135deg, rgba(184,146,62,.08), rgba(184,146,62,.03));
  border-left:3px solid var(--pr-gold); border-radius:0 12px 12px 0;
  font-family:'Cormorant Garamond',serif; font-size:1.12rem; line-height:1.6;
}
.pr-scripture b{
  font-family:'Crimson Pro',serif; font-style:italic; font-weight:600;
  color:var(--pr-royal); letter-spacing:.02em; margin-right:8px;
}

.pr-author{
  max-width:var(--pr-measure); margin:44px auto 0; display:flex; align-items:center; gap:18px;
  padding-top:34px; border-top:1px solid var(--pr-vellum);
}
.pr-author__photo{
  width:64px; height:64px; border-radius:50%; flex:none;
  background:linear-gradient(140deg,var(--pr-royal),var(--pr-royal-deep));
  border:2px solid var(--pr-gold-soft);
  box-shadow:0 0 0 1px rgba(184,146,62,.25), var(--pr-glow-gold);
  display:flex; align-items:center; justify-content:center;
  color:#fdfcf8; font-family:'Cinzel',serif; font-size:1.2rem; overflow:hidden;
}
.pr-author__photo img{width:100%;height:100%;object-fit:cover}
.pr-author__label{font-style:italic; font-size:.85rem; color:var(--pr-ink-soft)}
.pr-author__name{
  font-family:'Cinzel',serif; font-size:1rem; font-weight:600;
  color:var(--pr-indigo-deep); margin:2px 0;
}
.pr-author__byline{font-size:.88rem; letter-spacing:.05em; color:var(--pr-gold)}
.pr-author__handle{font-size:.85rem; color:var(--pr-ink-soft)}

.pr-share{display:flex; justify-content:flex-start; max-width:var(--pr-measure); margin:38px auto 0}
.pr-share button{
  display:inline-flex; align-items:center; gap:10px;
  font-family:'Crimson Pro',serif; font-size:.92rem; letter-spacing:.14em;
  text-transform:uppercase; color:var(--pr-royal);
  background:var(--pr-milk); border:1px solid rgba(76,45,143,.3); border-radius:999px;
  padding:12px 26px; cursor:pointer; transition:all .25s var(--pr-ease);
}
.pr-share button:hover{
  border-color:var(--pr-gold-soft); color:var(--pr-royal-deep);
  box-shadow:var(--pr-shadow-sm), var(--pr-glow-gold); transform:translateY(-1px);
}
.pr-share svg{width:15px;height:15px}

/* engagement : share your thoughts */
.pr-thoughts{
  max-width:var(--pr-measure); margin:44px auto 0;
  padding-top:34px; border-top:1px solid var(--pr-vellum);
}
.pr-thoughts__head{
  font-family:'Cinzel',serif; font-size:1rem; font-weight:600;
  letter-spacing:.08em; color:var(--pr-indigo-deep);
  display:flex; align-items:center; gap:12px;
}
.pr-thoughts__head svg{width:16px;height:16px; flex:none; color:var(--pr-gold)}
.pr-thoughts__sub{
  font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:1rem; color:var(--pr-ink-soft); margin-top:6px;
}
.pr-thoughts__fields{
  display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px;
}
@media (max-width:560px){.pr-thoughts__fields{grid-template-columns:1fr}}
.pr-thoughts__fields input{
  width:100%; background:var(--pr-milk);
  border:1px solid var(--pr-vellum); border-radius:12px;
  color:var(--pr-ink); font-family:'Cormorant Garamond',serif;
  font-size:1.05rem; padding:13px 16px; outline:none;
  box-shadow:inset 0 2px 8px rgba(43,36,64,.05);
  transition:border-color .3s, box-shadow .3s;
}
.pr-thoughts__fields input::placeholder{color:#9c94b8; font-style:italic}
.pr-thoughts__fields input:focus{
  border-color:var(--pr-gold-soft);
  box-shadow:inset 0 2px 8px rgba(43,36,64,.05), 0 0 0 3px rgba(184,146,62,.12);
}
.pr-hp{
  position:absolute !important; left:-9999px !important;
  width:1px; height:1px; opacity:0; pointer-events:none;
}
.pr-thoughts__meta{
  display:flex; align-items:baseline; justify-content:space-between;
  gap:16px; margin-top:10px; flex-wrap:wrap;
}
.pr-thoughts__privacy{
  font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:.92rem; color:var(--pr-ink-soft);
}
.pr-thoughts__count{
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.1em;
  color:#a49cbb; white-space:nowrap;
}
.pr-thoughts__count--warn{color:var(--pr-gold)}
/* faded resting state : a quiet promise */
.pr-thoughts__done{
  display:flex; align-items:flex-start; gap:10px; margin-top:18px;
  padding:16px 20px; border-radius:12px;
  background:transparent;
  border:1px solid var(--pr-vellum);
  font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:1.05rem; line-height:1.5; color:var(--pr-ink-soft);
  opacity:.5;
  transition:opacity .5s var(--pr-ease), background .5s var(--pr-ease),
             border-color .5s var(--pr-ease), color .5s var(--pr-ease),
             box-shadow .5s var(--pr-ease), transform .5s var(--pr-ease);
}
.pr-thoughts__done svg{
  width:17px;height:17px; flex:none; color:var(--pr-ink-soft); margin-top:2px;
  transition:color .5s var(--pr-ease);
}
/* alive state : blooms when the email goes through */
.pr-thoughts__done.pr-thoughts__done--live{
  opacity:1;
  background:linear-gradient(135deg, rgba(184,146,62,.12), rgba(184,146,62,.04));
  border-color:var(--pr-gold-soft);
  color:var(--pr-ink);
  box-shadow:0 8px 24px -14px rgba(184,146,62,.5);
  transform:translateY(-1px);
}
.pr-thoughts__done.pr-thoughts__done--live svg{color:var(--pr-gold)}
.pr-thoughts__send:disabled{opacity:.55; cursor:default; transform:none}
.pr-thoughts textarea{
  width:100%; min-height:120px; resize:vertical; margin-top:12px;
  background:var(--pr-milk);
  border:1px solid var(--pr-vellum); border-radius:14px;
  color:var(--pr-ink); font-family:'Cormorant Garamond',serif;
  font-size:1.08rem; line-height:1.6; padding:16px 18px; outline:none;
  box-shadow:inset 0 2px 8px rgba(43,36,64,.05);
  transition:border-color .3s, box-shadow .3s;
}
.pr-thoughts textarea::placeholder{color:#9c94b8; font-style:italic}
.pr-thoughts textarea:focus{
  border-color:var(--pr-gold-soft);
  box-shadow:inset 0 2px 8px rgba(43,36,64,.05), 0 0 0 3px rgba(184,146,62,.12);
}
.pr-thoughts__send{
  display:inline-flex; align-items:center; gap:10px; margin-top:14px;
  font-family:'Crimson Pro',serif; font-size:.82rem; font-weight:600;
  letter-spacing:.22em; text-transform:uppercase;
  color:var(--pr-gold-bright);
  background:linear-gradient(135deg, var(--pr-royal), var(--pr-royal-deep));
  border:1px solid rgba(184,146,62,.5); border-radius:999px;
  padding:12px 28px; cursor:pointer;
  box-shadow:inset 0 1px 0 rgba(231,207,148,.2);
  transition:filter .3s, border-color .3s, transform .25s var(--pr-ease), box-shadow .25s;
}
.pr-thoughts__send:hover{
  filter:brightness(1.08); border-color:var(--pr-gold-soft);
  transform:translateY(-1px); box-shadow:var(--pr-shadow-sm), var(--pr-glow-gold);
}
.pr-thoughts__send svg{width:13px;height:13px}

.pr-nav{display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:26px}
@media (max-width:560px){.pr-nav{grid-template-columns:1fr}}
.pr-nav button{
  display:flex; align-items:center; gap:14px;
  text-align:left; background:var(--pr-parchment);
  border:1px solid var(--pr-vellum); border-radius:14px;
  padding:12px 14px; cursor:pointer; box-shadow:var(--pr-shadow-sm);
  font-family:inherit;
  transition:transform .3s var(--pr-ease), box-shadow .3s var(--pr-ease), border-color .3s;
}
.pr-nav button:hover:not(:disabled){transform:translateY(-3px); box-shadow:var(--pr-shadow); border-color:var(--pr-gold-soft)}
.pr-nav button:disabled{opacity:.4; cursor:default}
.pr-nav__thumb{
  flex:0 0 64px; width:64px; height:64px; border-radius:10px; overflow:hidden;
  background:linear-gradient(150deg,var(--pr-royal-deep),var(--pr-royal));
  display:flex; align-items:center; justify-content:center;
}
.pr-nav__thumb img{width:100%; height:100%; object-fit:cover; display:block}
.pr-nav__crest{font-family:'Cinzel',serif; font-size:.85rem; letter-spacing:.14em; color:rgba(228,201,138,.45)}
.pr-nav__copy{min-width:0; flex:1}
.pr-nav__dir{
  font-size:.72rem; letter-spacing:.26em; text-transform:uppercase;
  color:var(--pr-gold); display:block; margin-bottom:6px;
}
.pr-nav__title{
  font-family:'Cinzel',serif; font-size:.95rem;
  color:var(--pr-indigo-deep); line-height:1.3;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.pr-nav--next{flex-direction:row-reverse; text-align:right !important}
.pr-nav--next .pr-nav__copy{text-align:right}

.pr-backvault{
  display:inline-flex; align-items:center; gap:8px;
  font-family:'Crimson Pro',serif; font-size:.82rem; letter-spacing:.16em; text-transform:uppercase;
  color:var(--pr-royal); background:none; border:none; cursor:pointer; padding:0 0 18px;
  transition:color .25s;
}
.pr-backvault:hover{color:var(--pr-royal-deep)}
.pr-backvault svg{width:15px; height:15px}
.pr-library{position:sticky; top:26px; max-height:calc(100vh - 52px); overflow:auto; scrollbar-width:none}
.pr-library::-webkit-scrollbar{display:none}
@media (max-width:980px){.pr-library{position:static}}
.pr-library__head{
  font-family:'Cinzel',serif; font-size:1.02rem; font-weight:600;
  letter-spacing:.14em; text-transform:uppercase; color:var(--pr-indigo-deep);
  display:flex; align-items:center; gap:14px; margin-bottom:6px;
}
.pr-library__head::after{content:""; flex:1; height:1px; background:var(--pr-vellum)}
.pr-library__sub{
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1rem;
  color:var(--pr-ink-soft); margin-bottom:20px;
}
.pr-cards{display:flex; flex-direction:column; gap:16px}
@media (max-width:980px){
  .pr-cards{display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
}
.pr-card{
  display:grid; grid-template-columns:96px 1fr;
  background:var(--pr-parchment); border:1px solid var(--pr-vellum);
  border-radius:14px; overflow:hidden; cursor:pointer; text-align:left; padding:0;
  box-shadow:var(--pr-shadow-sm); font-family:inherit;
  transition:transform .32s var(--pr-ease), box-shadow .32s var(--pr-ease), border-color .32s;
}
.pr-card:hover{transform:translateY(-4px); box-shadow:var(--pr-shadow); border-color:var(--pr-gold-soft)}
.pr-card:focus-visible{outline:2px solid var(--pr-gold); outline-offset:3px}
.pr-card--active{
  border-color:var(--pr-gold); cursor:default;
  background:linear-gradient(135deg, rgba(184,146,62,.1), var(--pr-parchment) 60%);
}
.pr-card--active:hover{transform:none; box-shadow:var(--pr-shadow-sm)}
.pr-card__img{
  position:relative; min-height:96px;
  background:linear-gradient(150deg,var(--pr-royal-deep),var(--pr-royal) 60%,var(--pr-imperial));
}
.pr-card__img img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:saturate(.9)}
.pr-card__body{padding:14px 16px; display:flex; flex-direction:column; justify-content:center}
.pr-card__title{
  font-family:'Cinzel',serif; font-size:.86rem; font-weight:600;
  color:var(--pr-indigo-deep); line-height:1.35;
}
.pr-card__excerpt{
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:.92rem;
  color:var(--pr-ink-soft); margin-top:6px; line-height:1.4;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.pr-card__now{
  align-self:flex-start;
  font-size:.62rem; letter-spacing:.22em; text-transform:uppercase;
  color:var(--pr-gold-bright);
  background:linear-gradient(135deg, var(--pr-royal), var(--pr-royal-deep));
  border:1px solid rgba(184,146,62,.4);
  border-radius:999px; padding:4px 11px; margin-top:8px;
}

.pr-toast{
  position:fixed; bottom:26px; left:50%;
  transform:translateX(-50%) translateY(80px);
  background:var(--pr-indigo-deep); color:#fdfcf8;
  font-size:.9rem; letter-spacing:.06em;
  padding:12px 26px; border-radius:999px; box-shadow:var(--pr-shadow);
  opacity:0; transition:all .4s var(--pr-ease); z-index:70; pointer-events:none;
}
.pr-toast--show{opacity:1; transform:translateX(-50%) translateY(0)}

/* footer transition strip */
.pr-footer-transition{
  position:relative; z-index:1; height:46px; margin-top:-1px;
  background:linear-gradient(180deg,
    rgba(249,246,238,0) 0%,
    rgba(244,236,219,.6) 30%,
    rgba(108,63,176,.35) 72%,
    var(--pr-royal-deep) 100%);
}

@media (prefers-reduced-motion: reduce){
  *{transition:none !important; animation:none !important}
}
`;

const ArticlesPage: NextPage = () => {
  const router = useRouter();
  const { getArticles, articles } = useContentful();

  // view-model list
  const POEMS = useMemo<PR[]>(() => (articles || []).map(toPR), [articles]);

  // deep-link: /articles?read=<slug> (also target of legacy /articles/[id] redirect)
  const [deepLinkDone, setDeepLinkDone] = useState(false);
  useEffect(() => {
    if (deepLinkDone || !router.isReady || POEMS.length === 0) return;
    const raw = router.query.read;
    const want = Array.isArray(raw) ? raw[0] : raw;
    if (want) {
      const idx = POEMS.findIndex(
        (pp) => pp.slug.toLowerCase() === cleanSlug(String(want)).toLowerCase()
      );
      if (idx >= 0) openPoem(idx);
    }
    setDeepLinkDone(true);
    // eslint-disable-next-line
  }, [router.isReady, router.query.read, POEMS, deepLinkDone]);

  // state
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"gallery" | "reader">("gallery");
  const [current, setCurrent] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"featured" | "az" | "za">("featured");
  const [activeTag, setActiveTag] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [fontStep, setFontStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [resume, setResume] = useState<{ slug: string; y: number } | null>(null);
  const [toast, setToast] = useState<{ msg: string; on: boolean }>({ msg: "", on: false });
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  // comments
  const [thoughts, setThoughts] = useState("");
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const galleryScroll = useRef(0);
  const poemRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => { getArticles(); /* eslint-disable-next-line */ }, []);

  // hydrate persisted sets after mount (avoids SSR mismatch)
  useEffect(() => {
    try { setBookmarks(new Set(JSON.parse(safeStore.get("ee_saved") || "[]"))); } catch {}
    try { setReadSet(new Set(JSON.parse(safeStore.get("ee_read") || "[]"))); } catch {}
    setReady(true);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, on: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 2600);
  }, []);

  // ---- bookmarks ----
  const persistBookmarks = (next: Set<string>) => {
    setBookmarks(new Set(next));
    safeStore.set("ee_saved", JSON.stringify([...next]));
  };
  const toggleBookmark = (slug: string) => {
    const next = new Set(bookmarks);
    if (next.has(slug)) { next.delete(slug); showToast("Removed from saved."); }
    else { next.add(slug); showToast("Saved for later."); }
    persistBookmarks(next);
  };

  // ---- derived list ----
  const allTags = useMemo(() => {
    const set = new Set<string>();
    POEMS.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [POEMS]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = POEMS.map((p, i) => ({ p, i })).filter(({ p }) => {
      const matchTag = activeTag === "All" || (p.tags || []).includes(activeTag);
      const matchSaved = !savedOnly || bookmarks.has(p.slug);
      const matchText =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchTag && matchSaved && matchText;
    });
    if (sortMode === "az") list.sort((a, b) => a.p.title.localeCompare(b.p.title));
    else if (sortMode === "za") list.sort((a, b) => b.p.title.localeCompare(a.p.title));
    return list;
  }, [POEMS, query, activeTag, savedOnly, bookmarks, sortMode]);

  const showFeatured = page === 1 && activeTag === "All" && !query && !savedOnly && filtered.length > 0;
  const workingList = showFeatured ? filtered.slice(1) : filtered;
  const pages = Math.max(1, Math.ceil(workingList.length / PER_PAGE));
  const pageClamped = Math.min(page, pages);
  const slice = workingList.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE);
  const lead = showFeatured ? filtered[0] : null;

  useEffect(() => { if (page > pages) setPage(pages); }, [pages, page]);

  // ---- reader open/close ----
  const countRead = (slug: string) => {
    setReadSet((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev); next.add(slug);
      safeStore.set("ee_read", JSON.stringify([...next]));
      return next;
    });
  };

  const openPoem = (i: number) => {
    galleryScroll.current = window.scrollY;
    setCurrent(i);
    setFontStep(0);
    setView("reader");
    stopListening();
    window.scrollTo({ top: 0, behavior: "auto" });
    const slug = POEMS[i].slug;
    countRead(slug);
    // resume
    const y = safeStore.get("ee_pos_" + slug);
    if (y && +y > 200) setResume({ slug, y: +y });
    else setResume(null);
  };

  const returnToGallery = useCallback(() => {
    stopListening();
    setView("gallery");
    setResume(null);
    requestAnimationFrame(() => window.scrollTo({ top: galleryScroll.current, behavior: "auto" }));
  }, []);

  const goTo = (i: number) => {
    if (i === current || i < 0 || i >= POEMS.length) return;
    setLeaving(true);
    window.setTimeout(() => {
      setCurrent(i);
      setFontStep(0);
      stopListening();
      window.scrollTo({ top: 0, behavior: "auto" });
      setLeaving(false);
      const slug = POEMS[i].slug;
      countRead(slug);
    }, 300);
  };

  // ---- reading progress (reader only) ----
  useEffect(() => {
    if (view !== "reader") return;
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      setProgress(pct * 100);
      // save read position
      const slug = POEMS[current]?.slug;
      if (slug) {
        if (pct > 0.08 && pct < 0.9) safeStore.set("ee_pos_" + slug, String(Math.round(window.scrollY)));
        else if (pct >= 0.9) safeStore.remove("ee_pos_" + slug);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [view, current, POEMS]);

  // hardware back button returns to gallery
  useEffect(() => {
    if (view !== "reader") return;
    history.pushState({ prReader: true }, "");
    const onPop = () => returnToGallery();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [view, returnToGallery]);

  // ---- font ----
  const poemFontSize = `calc(clamp(1.18rem,2.1vw,1.34rem) + ${fontStep * 0.08}rem)`;

  // ---- text to speech ----
  const pickHumanVoice = () => {
    const voices = isBrowser() && window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;
    const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
    const pool = en.length ? en : voices;
    const ranked = [/Google US English/i, /Google UK English Female/i, /Google UK English/i, /Natural/i, /Neural/i, /Samantha/i, /Ava/i, /Serena/i, /Aaron/i, /Siri/i, /Microsoft (Aria|Jenny|Guy|Libby|Sonia)/i, /Female/i];
    for (const re of ranked) { const hit = pool.find((v) => re.test(v.name)); if (hit) return hit; }
    return pool.find((v) => v.localService) || pool[0];
  };
  const stopListening = () => {
    if (isBrowser()) {
      const halt = (window as any).__prStop;
      if (typeof halt === "function") {
        try { halt(); } catch { /* ignore */ }
      }
      (window as any).__prStop = null;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      document.querySelectorAll(".pr-speaking").forEach((el) => el.classList.remove("pr-speaking"));
    }
    setSpeaking(false);
  };
  const toSentences = (text: string) =>
    text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')\]]*|\S[^.!?]*$/g) || [text];
  const listen = () => {
    if (!isBrowser() || !("speechSynthesis" in window)) { showToast("Listening is not supported on this browser."); return; }
    if (speaking) { stopListening(); return; }
    const poem = poemRef.current;
    if (!poem) return;
    const blocks = [...poem.querySelectorAll("p, h2, h3, blockquote, .pr-keyinsight")] as HTMLElement[];
    if (!blocks.length) return;
    const voice = pickHumanVoice();
    setSpeaking(true);
    const queue: { el: HTMLElement; text: string; heading: boolean; last: boolean }[] = [];
    blocks.forEach((el) => {
      const isHeading = /^H[23]$/.test(el.tagName);
      const sents = toSentences(el.textContent || "");
      sents.forEach((s, si) => queue.push({ el, text: s.trim(), heading: isHeading, last: si === sents.length - 1 }));
    });
    let qi = 0;
    let stopped = false;
    const clearHl = () => document.querySelectorAll(".pr-speaking").forEach((x) => x.classList.remove("pr-speaking"));
    const speakNext = () => {
      clearHl();
      if (stopped || qi >= queue.length) { stopListening(); return; }
      const item = queue[qi];
      item.el.classList.add("pr-speaking");
      const u = new SpeechSynthesisUtterance(item.text);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      u.rate = item.heading ? 0.9 : 0.94;
      u.pitch = item.heading ? 0.96 : 1.0;
      u.volume = 1;
      u.onend = () => { qi++; const gap = item.heading ? 480 : item.last ? 360 : 140; window.setTimeout(speakNext, gap); };
      u.onerror = () => { qi++; speakNext(); };
      window.speechSynthesis.speak(u);
    };
    // allow stopListening to halt loop
    (window as any).__prStop = () => { stopped = true; };
    speakNext();
  };
  useEffect(() => () => stopListening(), []);

  // ---- comments (Nodemailer API) ----
  const validEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);
  const sendThoughts = async () => {
    if (honeypotRef.current?.value) { setThoughts(""); return; }
    const message = thoughts.trim();
    const email = cEmail.trim();
    const p = POEMS[current];
    if (!message) { showToast("Write a few words first, then send."); return; }
    if (!email) { showToast("Please add your email so we can receive your thoughts."); return; }
    if (!validEmail(email)) { showToast("That email doesn't look right. Please check it."); return; }
    setSending(true); setSent(false);
    try {
      await sendSiteMail({
        inbox: MAIL_INBOX,
        subject: "Thoughts on " + p.title,
        replyTo: email,
        name: cName.trim() || "A reader",
        message,
        fields: {
          Name: cName.trim() || "A reader",
          Email: email,
          Message: message,
          Article: p.title,
          Link: "https://eemodiae.org/articles/" + p.slug,
        },
        honeypot: honeypotRef.current?.value || "",
      });
      setThoughts(""); setSent(true);
    } catch {
      const subject = encodeURIComponent("Thoughts on " + p.title);
      const bodyTxt = encodeURIComponent(
        message + "\n\n" + (cName ? "From: " + cName + "\n" : "") + "Email: " + email + "\n" + "Article: " + p.title + "\nhttps://eemodiae.org/articles/" + p.slug
      );
      showToast("We couldn't send that just now. Opening your email app so you can send it directly.");
      window.setTimeout(() => { window.location.href = "mailto:" + COMMENTS_EMAIL + "?subject=" + subject + "&body=" + bodyTxt; }, 900);
    } finally {
      setSending(false);
    }
  };

  // ---- share ----
  const shareArticle = async (p: PR) => {
    const url = "https://eemodiae.org/articles/" + p.slug;
    const text = `"${p.title}" — from the article vault of Emmanuel I. Emodiae`;
    try {
      if (isBrowser() && (navigator as any).share) { await (navigator as any).share({ title: p.title, text, url }); return; }
      if (isBrowser() && navigator.clipboard) { await navigator.clipboard.writeText(url); showToast("Link copied. Share it with a friend."); return; }
    } catch {}
    showToast("Copy this link: " + url);
  };

  // ---- content protection (reading zones) ----
  useEffect(() => {
    const inZone = (t: EventTarget | null) => (t as HTMLElement)?.closest?.(".pr-poem, .pr-paper, .pr-hero__img, .pr-tile__img, img");
    let nudgeAt = 0;
    const nudge = () => { const now = Date.now(); if (now - nudgeAt > 1500) { nudgeAt = now; showToast("Please use the Share button to spread this."); } };
    const onCopy = (e: Event) => { if (inZone(e.target)) { e.preventDefault(); nudge(); } };
    const onCtx = (e: Event) => { if (inZone(e.target)) { e.preventDefault(); nudge(); } };
    const onDrag = (e: Event) => { if (inZone(e.target)) e.preventDefault(); };
    const onSel = (e: Event) => { if (inZone(e.target)) e.preventDefault(); };
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

  const p = POEMS[current];
  const relatedCat = (p?.tags || [])[0] || "";
  const related = relatedCat
    ? POEMS.map((pp, idx) => ({ pp, idx })).filter(({ pp, idx }) => idx !== current && (pp.tags || [])[0] === relatedCat).slice(0, 3)
    : [];

  const [activeHeading, setActiveHeading] = useState<string>("");

  // body HTML: rich HTML as-is, else paragraphize plain text.
  // Format [brackets] / headings / blockquotes, then inject heading ids for TOC.
  const { bodyHtml, toc } = useMemo(() => {
    if (!p) return { bodyHtml: "", toc: [] as { id: string; text: string }[] };
    let html: string;
    if (/<\/?[a-z][\s\S]*>/i.test(p.body)) html = p.body;
    else {
      html = p.body
        .split(/\n\s*\n/)
        .map((para, idx) => {
          const t = para.replace(/\n/g, " ").trim();
          const bracket = t.match(/^\[([\s\S]*)\]$/);
          if (bracket) return `<p class="pr-keyinsight">${bracket[1].trim()}</p>`;
          return `<p class="${idx === 0 ? "pr-lead" : ""}">${t}</p>`;
        })
        .join("");
    }
    html = enhanceArticleHtml(html);
    const heads: { id: string; text: string }[] = [];
    let n = 0;
    html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const id = "sec-" + (++n) + "-" + text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
      const cleanAttrs = String(attrs || "").replace(/\s*id=(["']).*?\1/i, "");
      heads.push({ id, text });
      return `<h2${cleanAttrs} id="${id}">${inner}</h2>`;
    });
    // First body paragraph drop-cap (if not already classed)
    html = html.replace(/<p(?![^>]*class=)([^>]*)>/i, '<p class="pr-lead"$1>');
    return { bodyHtml: html, toc: heads };
  }, [p]);

  // highlight the active heading as the reader scrolls
  useEffect(() => {
    if (view !== "reader" || toc.length === 0 || !isBrowser()) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveHeading((e.target as HTMLElement).id); });
    }, { rootMargin: "-10% 0px -70% 0px" });
    toc.forEach((h) => { const el = document.getElementById(h.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [view, toc, bodyHtml]);

  const Bookmark = ({ p }: { p: PR }) => (
    <button
      type="button"
      className={"pr-bookmark" + (bookmarks.has(p.slug) ? " pr-bookmark--on" : "")}
      aria-label={bookmarks.has(p.slug) ? "Saved" : "Save for later"}
      onClick={(e) => { e.stopPropagation(); toggleBookmark(p.slug); }}
    >
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );

  const Tile = ({ p, i, idx }: { p: PR; i: number; idx: number }) => (
    <button
      type="button"
      className="pr-tile pr-anim"
      style={{ animationDelay: idx * 0.06 + "s", ["--cat" as any]: accentOf(p) }}
      aria-label={"Read " + p.title}
      onClick={() => openPoem(i)}
    >
      <div className="pr-tile__thumb">
        {p.image ? <img className="pr-tile__img" src={p.image} alt="" loading="lazy" decoding="async" /> : <div className="pr-tile__crest">EIE</div>}
        <Bookmark p={p} />
      </div>
      <div className="pr-tile__body">
        {p.tags[0] && <span className="pr-tile__cat">{p.tags[0]}</span>}
        <div className="pr-tile__title">{p.title}</div>
        <div className="pr-tile__excerpt">{excerptOf(p)}</div>
        <div className="pr-tile__meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> {readTimeOf(p)}
        </div>
        <span className="pr-tile__read">Read More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 6l6 6-6 6" /></svg></span>
      </div>
    </button>
  );

  return (
    <Wrap className="eemodiae-page pr-page">
      <Head>
        <title>Articles | eemodiae.org</title>
        <meta name="description" content="The article vault of eemodiae.org, where timeless ideas find their voice. Read teaching on Christ the Blessing, spiritual growth, freedom, destiny, holiness, and purpose." />
      </Head>

      <Nav />

      {/* reading progress */}
      <div className={"pr-progress" + (view === "reader" ? " pr-progress--on" : "")} aria-hidden="true">
        <div className="pr-progress__bar" style={{ width: progress + "%" }} />
      </div>

      {/* ================= GALLERY ================= */}
      <section className={"pr-view pr-gallery" + (view === "reader" ? " pr-hidden" : "")}>
        <div className="pr-banner">
          <img src={BANNER_SRC} alt="Articles. Welcome to the article vault of eemodiae.org, where timeless ideas find their voice" />
        </div>

        <div className="pr-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input type="search" value={query} placeholder="Search articles..." aria-label="Search articles" onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </div>

        <div className="pr-controls">
          <div className="pr-chips" role="group" aria-label="Filter by theme">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={"pr-chip" + (tag === activeTag ? " pr-chip--on" : "")}
                aria-pressed={tag === activeTag}
                onClick={() => { setActiveTag(tag); setPage(1); }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="pr-controls__right">
            <button
              type="button"
              className={"pr-saved-tab" + (savedOnly ? " pr-saved-tab--on" : "")}
              aria-pressed={savedOnly}
              onClick={() => {
                if (!savedOnly && bookmarks.size === 0) { showToast("You have not saved any articles yet."); return; }
                setSavedOnly((s) => !s); setPage(1); window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
              <span>{bookmarks.size ? `Saved (${bookmarks.size})` : "Saved"}</span>
            </button>
            <label className="pr-sort">
              <span>Sort</span>
              <select value={sortMode} aria-label="Sort articles" onChange={(e) => { setSortMode(e.target.value as any); setPage(1); }}>
                <option value="featured">Featured</option>
                <option value="az">A to Z</option>
                <option value="za">Z to A</option>
              </select>
            </label>
          </div>
        </div>

        {readSet.size > 0 && (
          <div className="pr-readcount">
            Congratulations, you have read <b>{readSet.size}</b> of <b>{POEMS.length}</b> articles in the vault.
          </div>
        )}

        {/* featured lead */}
        <div className="pr-featured">
          {lead && (
            <button type="button" className="pr-lead-card pr-anim" style={{ ["--cat" as any]: accentOf(lead.p) }} aria-label={"Read " + lead.p.title} onClick={() => openPoem(lead.i)}>
              <div className="pr-lead-card__thumb">
                <span className="pr-lead-card__badge">Featured</span>
                {lead.p.image ? <img src={lead.p.image} alt="" loading="lazy" decoding="async" /> : <div className="pr-lead-card__crest">EIE</div>}
                <Bookmark p={lead.p} />
              </div>
              <div className="pr-lead-card__body">
                {lead.p.tags[0] && <span className="pr-lead-card__cat">{lead.p.tags[0]}</span>}
                <div className="pr-lead-card__title">{lead.p.title}</div>
                <div className="pr-lead-card__excerpt">{excerptOf(lead.p)}</div>
                <div className="pr-lead-card__meta">
                  <span>Emmanuel I. Emodiae</span>
                  <span className="pr-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--pr-gold-soft)", display: "inline-block" }} />
                  <span>{readTimeOf(lead.p)}</span>
                </div>
                <span className="pr-lead-card__read">Read the story <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 6l6 6-6 6" /></svg></span>
              </div>
            </button>
          )}
        </div>

        <div className="pr-grid">
          {slice.map(({ p, i }, idx) => <Tile key={p.slug + i} p={p} i={i} idx={idx} />)}
        </div>

        {ready && filtered.length === 0 && <div className="pr-empty">No articles match that search. Try another word.</div>}

        <div className="pr-pager" style={{ display: "flex" }}>
          <button type="button" disabled={pageClamped <= 1} onClick={() => { if (pageClamped > 1) { setPage(pageClamped - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>Prev</button>
          <span className="pr-pager__count">{pageClamped} of {pages}</span>
          <button type="button" disabled={pageClamped >= pages} onClick={() => { if (pageClamped < pages) { setPage(pageClamped + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>Next</button>
        </div>
      </section>

      {/* ================= READER ================= */}
      <section className={"pr-view pr-shell" + (view === "gallery" ? " pr-hidden" : "") + (leaving ? " pr-leaving" : "")}>
        <main>
          <div className="pr-readerbar">
            <button type="button" className="pr-back" onClick={returnToGallery}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              Back to Articles
            </button>
            <div className="pr-readtools">
              <button type="button" className={"pr-rt pr-tip" + (speaking ? " pr-rt--active" : "")} aria-label="Listen to this article" data-tip="Hear this article read aloud" onClick={listen}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
                <span>{speaking ? "Stop" : "Listen"}</span>
              </button>
              <div className="pr-rt-font" role="group" aria-label="Text size">
                <span className="pr-rt-fontlabel">Text size</span>
                <button type="button" className="pr-rt pr-tip" aria-label="Smaller text" data-tip="Smaller text" disabled={fontStep <= -2} onClick={() => setFontStep((f) => Math.max(-2, f - 1))}>A<span className="pr-rt-minus">-</span></button>
                <button type="button" className="pr-rt pr-tip" aria-label="Larger text" data-tip="Larger text" disabled={fontStep >= 3} onClick={() => setFontStep((f) => Math.min(3, f + 1))}>A<span className="pr-rt-plus">+</span></button>
              </div>
            </div>
          </div>

          {resume && (
            <div className="pr-resume">
              <span>You were reading this article.</span>
              <button type="button" onClick={() => { window.scrollTo({ top: resume.y, behavior: "smooth" }); setResume(null); }}>Resume where you left off</button>
              <button type="button" className="pr-resume__x" aria-label="Dismiss" onClick={() => setResume(null)}>&times;</button>
            </div>
          )}

          {p && (
            <article className="pr-paper" aria-live="polite">
              <header className="pr-hero">
                {p.image ? <img className="pr-hero__img" src={p.image} alt="" /> : <div className="pr-hero__crest">EIE</div>}
                {/* <div className="pr-hero__veil" /> */}
              </header>

              <div className="pr-articlehead">
                <h1 className="pr-title">{p.title}</h1>
                <div className="pr-readmeta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> {readTimeOf(p)}
                </div>
              </div>

              <div className="pr-bodywrap">
                <div className="pr-ornament" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3-6.3-4.6-6.3 4.6L8 13.7 2 9.2h7.6z" /></svg>
                </div>

                <div className="pr-poem" ref={poemRef} style={{ fontSize: poemFontSize }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />

                {p.scripture && (
                  <div className="pr-scripture"><b>{p.scripture.ref}</b>{p.scripture.text}</div>
                )}

                <div className="pr-author">
                  <div className="pr-author__photo"><img src={AUTHOR_PHOTO} alt="Emmanuel I. Emodiae" /></div>
                  <div>
                    <div className="pr-author__label">Published by:</div>
                    <div className="pr-author__name">Emmanuel I. Emodiae</div>
                    <div className="pr-author__byline">Prophet | Preacher | Poet</div>
                    <div className="pr-author__handle">@eemodiae</div>
                  </div>
                </div>

                <div className="pr-share">
                  <button type="button" onClick={() => shareArticle(p)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
                    Share with friends
                  </button>
                </div>

                {/* thoughts */}
                <div className="pr-thoughts">
                  <div className="pr-thoughts__head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.9-.95L3 20l1-4.5A8.4 8.4 0 0 1 3.5 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z" /></svg>
                    Share your thoughts on this article
                  </div>
                  <p className="pr-thoughts__sub">Your reflections are a blessing to this house.</p>
                  <div className="pr-thoughts__fields">
                    <input type="text" placeholder="Your name (optional)" aria-label="Your name" value={cName} onChange={(e) => setCName(e.target.value)} />
                    <input type="email" placeholder="Your email (required)" aria-label="Your email" required value={cEmail} onChange={(e) => setCEmail(e.target.value)} />
                  </div>
                  <input ref={honeypotRef} type="text" className="pr-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <textarea maxLength={1000} placeholder="Write your thoughts here..." aria-label="Share your thoughts on this article" value={thoughts} onChange={(e) => setThoughts(e.target.value)} />
                  <div className="pr-thoughts__meta">
                    <span className="pr-thoughts__privacy">Your email is never published; it is used only to receive your reflections.</span>
                    <span className={"pr-thoughts__count" + (thoughts.length > 900 ? " pr-thoughts__count--warn" : "")}>{thoughts.length} / 1000</span>
                  </div>
                  <button type="button" className="pr-thoughts__send" disabled={sending} onClick={sendThoughts}>{sending ? "Sending..." : "Send"}</button>
                  <p className={"pr-thoughts__done" + (sent ? " pr-thoughts__done--live" : "")}>Thank you. Your thoughts have reached Emmanuel.</p>
                </div>

                {/* related */}
                {related.length > 0 && (
                  <div className="pr-related">
                    <div className="pr-related__head">More on {relatedCat}</div>
                    <div className="pr-related__grid">
                      {related.map(({ pp, idx }) => (
                        <button key={pp.slug} type="button" className="pr-tile" style={{ ["--cat" as any]: accentOf(pp) }} onClick={() => goTo(idx)}>
                          <div className="pr-tile__thumb">{pp.image ? <img className="pr-tile__img" src={pp.image} alt="" loading="lazy" /> : <div className="pr-tile__crest">EIE</div>}</div>
                          <div className="pr-tile__body"><div className="pr-tile__title">{pp.title}</div></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* prev / next */}
                <nav className="pr-nav" aria-label="Article navigation">
                  <button type="button" disabled={current === 0} onClick={() => { if (current > 0) goTo(current - 1); }}>
                    <span className="pr-nav__thumb" aria-hidden="true">
                      {current > 0 && POEMS[current - 1].image
                        ? <img src={POEMS[current - 1].image} alt="" loading="lazy" />
                        : <span className="pr-nav__crest">EIE</span>}
                    </span>
                    <span className="pr-nav__copy">
                      <span className="pr-nav__dir">Previous Article</span>
                      <span className="pr-nav__title">{current > 0 ? POEMS[current - 1].title : ""}</span>
                    </span>
                  </button>
                  <button type="button" className="pr-nav--next" disabled={current === POEMS.length - 1} onClick={() => { if (current < POEMS.length - 1) goTo(current + 1); }}>
                    <span className="pr-nav__thumb" aria-hidden="true">
                      {current < POEMS.length - 1 && POEMS[current + 1].image
                        ? <img src={POEMS[current + 1].image} alt="" loading="lazy" />
                        : <span className="pr-nav__crest">EIE</span>}
                    </span>
                    <span className="pr-nav__copy">
                      <span className="pr-nav__dir">Next Article</span>
                      <span className="pr-nav__title">{current < POEMS.length - 1 ? POEMS[current + 1].title : ""}</span>
                    </span>
                  </button>
                </nav>

                <div className="pr-backvault">
                  <button type="button" onClick={returnToGallery}>Back to the vault</button>
                </div>
              </div>
            </article>
          )}
        </main>

        <aside className="pr-library" aria-label="Article tools">
          {toc.length > 0 && (
            <nav className="pr-toc" aria-label="In this article">
              {toc.map((h, i) => (
                <a key={i} href={"#" + h.id} className={activeHeading === h.id ? "pr-toc--active" : ""} onClick={(e) => { e.preventDefault(); const el = document.getElementById(h.id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{h.text}</a>
              ))}
            </nav>
          )}

          <button type="button" className="pr-backvault" onClick={returnToGallery}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            Back to Articles
          </button>

          <h2 className="pr-library__head">Continue Reading</h2>
          <p className="pr-library__sub">More from the article vault</p>
          <div className="pr-cards">
            {POEMS.map((a, i) => ({ a, i }))
              .filter(({ i }) => i !== current)
              .slice(0, 6)
              .map(({ a, i }) => (
              <button key={a.slug + i} type="button"
                className="pr-card"
                onClick={() => goTo(i)}>
                <div className="pr-card__img">{a.image ? <img src={a.image} alt="" loading="lazy" decoding="async" /> : null}</div>
                <div className="pr-card__body">
                  <div className="pr-card__title">{a.title}</div>
                  <div className="pr-card__excerpt">{excerptOf(a)}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <div className="pr-footer-transition" aria-hidden="true" />

      <div className={"pr-toast" + (toast.on ? " pr-toast--show" : "")} role="status" aria-live="polite">{toast.msg}</div>

      <Footer />
    </Wrap>
  );
};

export default ArticlesPage;
