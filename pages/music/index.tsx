import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";
import useContentful from "../../hooks/useContentful";

/* ============================================================
   eemodiae.org — MUSIC  (redesign port)
   Gallery (artistes / albums / songs) + song, artist and album
   detail views, with a fixed bottom player. Ported 1:1 from the
   redesign and wired to the live Contentful sources (getMusic →
   eemodiaeMusic, getArtiste → eemodiaeArtiste). Albums, scripture
   and reflection render only when the data provides them. Playback
   uses react-h5-audio-player styled into the redesign player bar.
   Classes namespaced mx-.
   ============================================================ */

const MUSIC_HERO = "/redesign/music-hero.jpg";
const PER_PAGE = { artists: 8, songs: 8, albums: 8, artistSongs: 8 };
const DEFAULT_PALETTE: [string, string] = ["#37215c", "#553192"];

const isBrowser = () => typeof window !== "undefined";
const cleanSlug = (s: string) => (s || "").toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
const initialsOf = (name: string) => (name || "").split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join("").toUpperCase();
const fmtDur = (sec?: number) => (sec ? Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2, "0") : "");

type Song = {
  id: string; title: string; artistId: string; artistName: string;
  cover: string; audio: string; palette: [string, string];
  albumId: string; duration: number; release: string;
  scripture?: { ref: string; text: string } | null;
  reflection?: string; lyrics: string[][];
};
type Artist = { id: string; name: string; role: string; photo: string; bio: string };
type Album = { id: string; title: string; artistId: string; artistName: string; cover: string; palette: [string, string]; year?: number };

const assetUrl = (u: any): string => {
  const url = u?.fields?.file?.url || (typeof u === "string" ? u : "");
  if (!url) return "";
  return String(url).startsWith("http") ? String(url) : "https:" + url;
};

/* lyrics: Contentful may store a string (newline/blank-line separated) or array */
const toLyrics = (raw: any): string[][] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // already blocks of lines, or flat lines
    if (raw.length && Array.isArray(raw[0])) return raw as string[][];
    return [(raw as string[]).map((x) => String(x))];
  }
  const text = String(raw);
  return text.split(/\n\s*\n/).map((block) => block.split("\n").map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
};

const toArtist = (a: any): Artist => ({
  id: cleanSlug(a?.name || ""),
  name: a?.name || "Artiste",
  role: a?.role || "Minister",
  photo: assetUrl(a?.imageUrl?.fields ? a.imageUrl : a?.imageUrl) || (typeof a?.image === "string" ? (a.image.startsWith("http") ? a.image : "https:" + a.image) : ""),
  bio: typeof a?.bio === "string" ? a.bio : "",
});

const toSong = (a: any, i: number): Song => {
  const artistName = a?.artiste || a?.artist || "";
  const pal = Array.isArray(a?.palette) && a.palette.length >= 2 ? [a.palette[0], a.palette[1]] as [string, string] : DEFAULT_PALETTE;
  return {
    id: cleanSlug(a?.title || "song-" + i),
    title: a?.title || "Untitled",
    artistId: cleanSlug(artistName),
    artistName,
    cover: assetUrl(a?.imageUrl) || (typeof a?.image === "string" ? (a.image.startsWith("http") ? a.image : "https:" + a.image) : ""),
    audio: assetUrl(a?.audio),
    palette: pal,
    albumId: a?.albumId ? cleanSlug(a.albumId) : (a?.album ? cleanSlug(a.album) : ""),
    duration: Number(a?.duration) || 0,
    release: a?.release || a?.createdAt || "",
    scripture: a?.scripture && (a.scripture.ref || a.scripture.text) ? { ref: a.scripture.ref || "", text: a.scripture.text || "" } : null,
    reflection: a?.reflection || undefined,
    lyrics: toLyrics(a?.lyrics),
  };
};

const Wrap = styled.div`
  /* ===== design tokens (scoped) ===== */

  --ivory:#fdfcf8;
  --cream:#f6f0e2;
  --cream-deep:#efe6d2;
  --royal:#553192;
  --plum:#6e4d9e;
  --aubergine:#37215c;
  --gold:#c19a45;
  --gold-soft:#d8bc7d;
  --gold-pale:#f0e4c8;
  --taupe:#8a8074;
  --stone:#b8ae9e;
  --ink:#2c2338;
  --ink-soft:#5a5066;
  --card:#ffffff;
  --shadow-soft:0 6px 24px rgba(55,33,92,.08);
  --shadow-lift:0 14px 40px rgba(55,33,92,.14);
  --radius:18px;
  --page-pad:clamp(18px,5vw,64px);

  position:relative;
  font-family:'Crimson Pro',Georgia,serif;
  -webkit-font-smoothing:antialiased;

/* ============================================================
   EEMODIAE MUSIC EXPERIENCE
   Palette: warm ivory, rich cream, royal purple, muted plum,
   deep aubergine, champagne gold. Devotional, not commercial.
   ============================================================ */

& *{margin:0;padding:0;box-sizing:border-box}
  &{scroll-behavior:smooth} &{
  font-family:'EB Garamond',Georgia,serif;
  background:var(--ivory);
  color:var(--ink);
  font-size:18px;
  line-height:1.6;
  -webkit-font-smoothing:antialiased;
}
img{max-width:100%;display:block}
button{font-family:inherit;cursor:pointer;border:none;background:none}
a{color:var(--royal)}
:focus-visible{outline:3px solid var(--gold);outline-offset:3px;border-radius:4px}
::selection{background:var(--gold-pale)}

/* ---------- Full bleed hero, 768:305, never cropped ---------- */
.mx-hero{
  width:100%;
  aspect-ratio:768/305;
  overflow:hidden;
  background:var(--cream);
}
.mx-hero img{width:100%;height:100%;object-fit:cover}

/* ---------- Title block ---------- */
.mx-head{
  text-align:center;
  padding:clamp(34px,6vw,64px) var(--page-pad) clamp(10px,2vw,18px);
}
.mx-head h1{
  font-family:'Cinzel',serif;
  font-weight:600;
  font-size:clamp(2.1rem,6vw,3.4rem);
  letter-spacing:.28em;
  text-indent:.28em;
  color:var(--aubergine);
}
.mx-head .mx-rider{
  font-family:'Cormorant Garamond',serif;
  font-style:italic;
  font-size:clamp(1.15rem,2.6vw,1.5rem);
  color:var(--plum);
  margin-top:8px;
}

/* ---------- Signature: staff line divider ---------- */
.mx-staff{
  display:flex;align-items:center;justify-content:center;gap:14px;
  margin:clamp(18px,3vw,30px) auto;max-width:420px;padding:0 24px;
}
.mx-staff::before,.mx-staff::after{
  content:"";flex:1;height:1px;
  background:linear-gradient(90deg,transparent,var(--gold-soft));
}
.mx-staff::after{background:linear-gradient(90deg,var(--gold-soft),transparent)}
.mx-staff .dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}
.mx-staff .dot:nth-child(2){width:9px;height:9px;background:var(--royal)}

/* ---------- Search ---------- */
.mx-search-wrap{max-width:760px;margin:0 auto;padding:0 var(--page-pad)}
.mx-search{
  position:relative;width:100%;
}
.mx-search svg{
  position:absolute;left:20px;top:50%;transform:translateY(-50%);
  width:19px;height:19px;stroke:var(--taupe);fill:none;stroke-width:2;
}
.mx-search input{
  width:100%;padding:16px 22px 16px 52px;
  font-family:'EB Garamond',serif;font-size:1.05rem;color:var(--ink);
  background:var(--card);
  border:1px solid var(--cream-deep);
  border-radius:999px;
  box-shadow:var(--shadow-soft);
  transition:border-color .25s,box-shadow .25s;
}
.mx-search input::placeholder{color:var(--stone)}
.mx-search input:focus{outline:none;border-color:var(--gold-soft);box-shadow:0 0 0 4px rgba(193,154,69,.14),var(--shadow-soft)}

/* ---------- Sections ---------- */
.mx-section{max-width:1180px;margin:0 auto;padding:clamp(30px,5vw,54px) var(--page-pad) 0}
.mx-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:clamp(18px,3vw,28px)}
.mx-section-head h2{
  font-family:'Cinzel',serif;font-weight:600;
  font-size:clamp(1.3rem,3vw,1.7rem);
  letter-spacing:.14em;color:var(--royal);
}
.mx-section-head .mx-count{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  color:var(--taupe);font-size:1.05rem;white-space:nowrap;
}

/* ---------- Artist cards ---------- */
.mx-artists{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
  gap:16px;
}
.mx-artist{
  background:var(--card);
  border:1px solid var(--cream-deep);
  border-radius:14px;
  padding:16px 12px 14px;
  text-align:center;
  box-shadow:var(--shadow-soft);
  transition:transform .3s,box-shadow .3s;
}
.mx-artist:hover{transform:translateY(-3px);box-shadow:var(--shadow-lift)}
.mx-avatar{
  width:72px;height:72px;border-radius:50%;
  margin:0 auto 10px;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 30% 25%,var(--plum),var(--aubergine));
  box-shadow:inset 0 0 0 2px var(--card),0 0 0 1.5px var(--gold-soft);
}
.mx-avatar img{width:100%;height:100%;object-fit:cover}
.mx-avatar span{
  font-family:'Cinzel',serif;font-size:1.35rem;font-weight:600;
  color:var(--gold-pale);letter-spacing:.06em;
}
.mx-artist h3{
  font-family:'Cormorant Garamond',serif;font-weight:600;
  font-size:.98rem;color:var(--ink);line-height:1.25;
}
.mx-artist p{font-size:.8rem;color:var(--taupe);margin-top:3px}
.mx-artist .mx-artist-open{
  margin-top:10px;display:inline-block;
  font-family:'EB Garamond',serif;font-size:.85rem;
  color:var(--royal);border-bottom:1px solid var(--gold-soft);
  padding-bottom:2px;transition:color .2s,border-color .2s;
}
.mx-artist:hover .mx-artist-open{color:var(--aubergine);border-color:var(--gold)}

/* ---------- Song / album grids (flexible columns) ---------- */
.mx-grid,
.mx-songs{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
  gap:18px;
}
.mx-song{
  background:var(--card);
  border:1px solid var(--cream-deep);
  border-radius:12px;
  overflow:hidden;
  box-shadow:var(--shadow-soft);
  transition:transform .3s,box-shadow .3s;
  display:flex;flex-direction:column;
  width:100%;
  min-width:0;
}
.mx-song:hover{transform:translateY(-3px);box-shadow:var(--shadow-lift)}
.mx-cover{position:relative;aspect-ratio:1/1;overflow:hidden}
.mx-cover img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.mx-song:hover .mx-cover img{transform:scale(1.04)}
.mx-cover-gen{
  width:100%;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  padding:12px;text-align:center;
}
.mx-cover-gen .mx-cover-note{font-size:1.2rem;color:var(--gold-pale);line-height:1}
.mx-cover-gen .mx-cover-title{
  font-family:'Cinzel',serif;font-weight:600;color:#fff;
  font-size:.78rem;letter-spacing:.05em;line-height:1.3;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.mx-cover-gen .mx-cover-artist{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  color:var(--gold-pale);font-size:.75rem;letter-spacing:.06em;
}
.mx-play{
  position:absolute;right:8px;bottom:8px;
  width:34px;height:34px;border-radius:50%;
  background:rgba(253,252,248,.94);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(0,0,0,.22);
  transition:transform .25s,background .25s;
}
.mx-play:hover{transform:scale(1.08);background:#fff}
.mx-play svg{width:14px;height:14px;fill:var(--royal)}
.mx-song-meta{padding:10px 11px 12px}
.mx-song-meta h3{
  font-family:'Cormorant Garamond',serif;font-weight:600;
  font-size:.92rem;color:var(--royal);line-height:1.25;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.mx-song-meta p{font-size:.78rem;color:var(--ink-soft);margin-top:2px}

/* ---------- Empty state ---------- */
.mx-empty{
  text-align:center;padding:44px 20px;color:var(--taupe);
  font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem;
}

/* ---------- Pagination (reusable) ---------- */
.mx-pagination{
  display:flex;align-items:center;justify-content:center;gap:8px;
  margin-top:clamp(22px,4vw,34px);flex-wrap:wrap;
}
.mx-pagination[hidden]{display:none}
.mx-page-btn{
  min-width:42px;height:42px;padding:0 12px;border-radius:12px;
  font-family:'EB Garamond',serif;font-size:1rem;color:var(--ink-soft);
  background:var(--card);border:1px solid var(--cream-deep);
  transition:all .2s;
}
.mx-page-btn:hover:not(:disabled){border-color:var(--gold-soft);color:var(--royal)}
.mx-page-btn[aria-current="page"]{
  background:var(--royal);border-color:var(--royal);color:#fff;
}
.mx-page-btn:disabled{opacity:.4;cursor:default}
.mx-page-ellipsis{color:var(--stone);padding:0 2px}

/* ---------- Artist detail view ---------- */
.mx-view{display:none}
.mx-view.active{display:block}
.mx-back{
  display:inline-flex;align-items:center;gap:8px;
  font-family:'EB Garamond',serif;font-size:1rem;color:var(--royal);
  padding:8px 0;border-bottom:1px solid transparent;transition:border-color .2s;
}
.mx-back:hover{border-color:var(--gold-soft)}
.mx-back svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}
.mx-artist-hero{
  display:flex;align-items:center;gap:clamp(18px,4vw,34px);
  background:linear-gradient(120deg,var(--cream),var(--ivory));
  border:1px solid var(--cream-deep);border-radius:var(--radius);
  padding:clamp(22px,4vw,38px);margin-top:18px;
  flex-wrap:wrap;
}
.mx-artist-hero .mx-avatar{width:132px;height:132px;margin:0}
.mx-artist-hero h2{
  font-family:'Cinzel',serif;font-weight:600;letter-spacing:.06em;
  font-size:clamp(1.4rem,3.5vw,2rem);color:var(--aubergine);
}
.mx-artist-hero p{color:var(--ink-soft);max-width:560px;margin-top:6px;font-size:1.05rem}
.mx-artist-hero .mx-artist-songcount{
  font-family:'Cormorant Garamond',serif;font-style:italic;color:var(--gold);
  margin-top:8px;font-size:1rem;
}

/* ---------- Player bar ---------- */
.mx-player{
  position:fixed;left:0;right:0;bottom:0;z-index:60;
  background:rgba(43,32,68,.97);
  backdrop-filter:blur(10px);
  color:var(--gold-pale);
  transform:translateY(110%);
  transition:transform .4s cubic-bezier(.22,.9,.3,1);
  box-shadow:0 -8px 30px rgba(0,0,0,.25);
}
.mx-player.active{transform:translateY(0)}
.mx-player-inner{
  max-width:1180px;margin:0 auto;
  display:flex;align-items:center;gap:16px;
  padding:12px var(--page-pad);
}
.mx-player-titles{min-width:0;flex:1}
.mx-player-titles .t{
  font-family:'Cormorant Garamond',serif;font-weight:600;font-size:1.1rem;
  color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.mx-player-titles .a{font-size:.85rem;color:var(--gold-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mx-player-controls{display:flex;align-items:center;gap:10px}
.mx-pbtn{
  width:44px;height:44px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.08);transition:background .2s;
}
.mx-pbtn:hover{background:rgba(255,255,255,.18)}
.mx-pbtn svg{width:18px;height:18px;fill:var(--gold-pale)}
.mx-pbtn.main{width:52px;height:52px;background:var(--gold)}
.mx-pbtn.main svg{fill:var(--aubergine)}
.mx-player-progress{
  position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,.14);
  cursor:pointer;
}
.mx-player-progress .fill{height:100%;width:0;background:var(--gold);transition:width .2s linear}
.mx-player-time{font-size:.8rem;color:var(--gold-soft);font-variant-numeric:tabular-nums;white-space:nowrap}
.mx-player-close{margin-left:4px}
body.player-open{padding-bottom:88px}

/* ---------- Toast ---------- */
.mx-toast{
  position:fixed;left:50%;bottom:110px;transform:translateX(-50%) translateY(20px);
  background:var(--aubergine);color:var(--gold-pale);
  font-family:'EB Garamond',serif;font-size:.98rem;
  padding:12px 22px;border-radius:999px;box-shadow:var(--shadow-lift);
  opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;z-index:70;
  max-width:88vw;text-align:center;
}
.mx-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ---------- Footer note ---------- */
.mx-foot{
  text-align:center;
  padding:clamp(40px,7vw,70px) var(--page-pad) clamp(46px,7vw,80px);
}
.mx-foot p{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  color:var(--taupe);font-size:1.15rem;max-width:520px;margin:0 auto;
}

/* ---------- Card secondary actions (share/download) ---------- */
.mx-song-actions{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}
.mx-chip{
  display:inline-flex;align-items:center;gap:4px;
  font-family:'EB Garamond',serif;font-size:.72rem;color:var(--ink-soft);
  padding:4px 8px;border-radius:999px;
  background:var(--cream);border:1px solid var(--cream-deep);
  transition:all .2s;
}
.mx-chip:hover{border-color:var(--gold-soft);color:var(--royal);background:var(--gold-pale)}
.mx-chip svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}
.mx-song-meta .mx-duration{
  font-variant-numeric:tabular-nums;color:var(--taupe);font-size:.72rem;
  float:right;margin-top:2px;
}

/* ---------- Song detail ---------- */
.mx-sd-top{
  display:flex;gap:clamp(20px,4vw,40px);flex-wrap:wrap;align-items:flex-start;
  margin-top:18px;
}
.mx-sd-cover{
  width:clamp(200px,40vw,300px);aspect-ratio:1/1;border-radius:var(--radius);
  overflow:hidden;box-shadow:var(--shadow-lift);flex-shrink:0;
}
.mx-sd-cover img{width:100%;height:100%;object-fit:cover}
.mx-sd-info{flex:1;min-width:240px}
.mx-sd-eyebrow{
  font-family:'EB Garamond',serif;font-size:.85rem;letter-spacing:.22em;
  text-transform:uppercase;color:var(--gold);
}
.mx-sd-info h2{
  font-family:'Cinzel',serif;font-weight:600;letter-spacing:.04em;
  font-size:clamp(1.7rem,4.5vw,2.6rem);color:var(--aubergine);margin:8px 0 4px;line-height:1.15;
}
.mx-sd-artist{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--plum)}
.mx-sd-artist a{color:inherit;border-bottom:1px solid var(--gold-soft)}
.mx-sd-meta-row{
  display:flex;gap:16px;flex-wrap:wrap;color:var(--taupe);font-size:.95rem;
  margin-top:10px;font-variant-numeric:tabular-nums;
}
.mx-sd-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.mx-btn{
  display:inline-flex;align-items:center;gap:9px;
  font-family:'EB Garamond',serif;font-size:1rem;
  padding:12px 24px;border-radius:999px;transition:all .25s;
}
.mx-btn svg{width:18px;height:18px}
.mx-btn-primary{background:var(--royal);color:#fff;box-shadow:var(--shadow-soft)}
.mx-btn-primary:hover{background:var(--aubergine);transform:translateY(-2px)}
.mx-btn-primary svg{fill:#fff;stroke:none}
.mx-btn-ghost{background:var(--card);color:var(--royal);border:1px solid var(--cream-deep)}
.mx-btn-ghost:hover{border-color:var(--gold-soft);background:var(--gold-pale)}
.mx-btn-ghost svg{stroke:currentColor;fill:none;stroke-width:2}

.mx-scripture{
  margin:clamp(28px,5vw,44px) 0;
  padding:clamp(22px,4vw,34px);
  background:linear-gradient(120deg,var(--cream),var(--ivory));
  border-left:3px solid var(--gold);border-radius:0 var(--radius) var(--radius) 0;
}
.mx-scripture p{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1.2rem,2.6vw,1.5rem);color:var(--ink);line-height:1.5;
}
.mx-scripture cite{
  display:block;font-style:normal;font-family:'Cinzel',serif;
  font-size:.9rem;letter-spacing:.14em;color:var(--gold);margin-top:12px;
}
.mx-reflection{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  color:var(--plum);font-size:1.2rem;text-align:center;
  max-width:560px;margin:0 auto clamp(30px,5vw,44px);
}
.mx-lyrics-h{
  font-family:'Cinzel',serif;font-weight:600;letter-spacing:.14em;
  color:var(--royal);font-size:1.2rem;margin-bottom:20px;
  display:flex;align-items:center;gap:14px;
}
.mx-lyrics-h::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--gold-soft),transparent)}
.mx-lyrics{max-width:640px}
.mx-verse{margin-bottom:26px}
.mx-verse p{
  font-family:'EB Garamond',serif;font-size:1.15rem;line-height:1.9;color:var(--ink);
}
.mx-verse.chorus p{color:var(--royal);font-style:italic}

/* ---------- Album detail ---------- */
.mx-album-hero{
  display:flex;gap:clamp(20px,4vw,40px);flex-wrap:wrap;align-items:center;
  background:linear-gradient(120deg,var(--cream),var(--ivory));
  border:1px solid var(--cream-deep);border-radius:var(--radius);
  padding:clamp(22px,4vw,38px);margin-top:18px;
}
.mx-album-hero .mx-sd-cover{width:clamp(140px,26vw,190px)}
.mx-album-hero .mx-sd-eyebrow{color:var(--gold)}
.mx-album-hero h2{
  font-family:'Cinzel',serif;font-weight:600;letter-spacing:.04em;
  font-size:clamp(1.5rem,4vw,2.2rem);color:var(--aubergine);margin:8px 0 4px;
}
.mx-album-hero .mx-sd-artist{margin-bottom:6px}
.mx-tracklist{list-style:none;counter-reset:trk}
.mx-track{
  display:flex;align-items:center;gap:16px;
  padding:14px 16px;border-radius:14px;
  border:1px solid transparent;transition:background .2s,border-color .2s;
  cursor:pointer;
}
.mx-track:hover{background:var(--cream);border-color:var(--cream-deep)}
.mx-track-num{
  counter-increment:trk;
  font-family:'Cinzel',serif;color:var(--gold);width:28px;text-align:center;
  font-variant-numeric:tabular-nums;
}
.mx-track-num::before{content:counter(trk,decimal-leading-zero)}
.mx-track:hover .mx-track-num{color:transparent}
.mx-track:hover .mx-track-num::after{
  content:"\\\\25B6";color:var(--royal);position:absolute;transform:translateX(-14px);font-size:.8rem;
}
.mx-track-body{flex:1;min-width:0}
.mx-track-body .t{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:1.2rem;color:var(--ink)}
.mx-track-body .s{font-size:.9rem;color:var(--taupe)}
.mx-track-dur{font-variant-numeric:tabular-nums;color:var(--taupe);font-size:.9rem}

/* clickable album card cue */
.mx-song.is-album .mx-cover::after{
  content:"Album";position:absolute;top:12px;left:12px;
  font-family:'EB Garamond',serif;font-size:.72rem;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;background:rgba(55,33,92,.72);
  padding:4px 10px;border-radius:999px;backdrop-filter:blur(4px);
}

/* clickable song card cue */
.mx-song[data-open]{cursor:pointer}

/* ---------- Reveal on scroll ---------- */
.mx-reveal{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease}
.mx-reveal.in,.mx-reveal.is-in{opacity:1;transform:none}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  .mx-reveal{opacity:1;transform:none}
}
@media (max-width:560px){
  .mx-artists,
  .mx-grid,
  .mx-songs{grid-template-columns:1fr; gap:14px}
  .mx-play{width:32px;height:32px}
  .mx-play svg{width:13px;height:13px}
  .mx-player-time{display:none}
}

  /* ---- player bar glue (react-h5-audio-player restyled) ---- */
  .mx-player-inner{max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:14px;padding:10px 24px}
  .mx-player-cover{width:46px;height:46px;border-radius:8px;overflow:hidden;flex:0 0 auto;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center}
  .mx-player-cover img{width:100%;height:100%;object-fit:cover}
  .mx-player-note{font-size:1.3rem;color:var(--gold, #c9a24b)}
  .mx-player-titles{min-width:0;flex:0 0 auto;max-width:200px}
  .mx-player-title{font-family:'Cinzel',serif;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mx-player-artist{font-size:.78rem;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mx-player-audio{flex:1;min-width:0}
  .mx-player-close{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:transparent;color:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .mx-player-close svg{width:18px;height:18px}
  .mx-player .rhap_container{background:transparent;box-shadow:none;padding:0}
  .mx-player .rhap_time,.mx-player .rhap_main-controls-button,.mx-player .rhap_volume-button{color:inherit}
  .mx-player .rhap_progress-filled,.mx-player .rhap_progress-indicator{background:var(--gold-hi, #e4c169)}
  .mx-player .rhap_progress-bar{background:rgba(255,255,255,.18)}
  .mx-player .rhap_volume-bar{background:rgba(255,255,255,.18)}
  .mx-player .rhap_volume-indicator{background:var(--gold-hi, #e4c169)}
  @media (max-width:640px){ .mx-player-titles{max-width:120px} }

`;

const MusicPage: NextPage = () => {
  const router = useRouter();
  const { getMusic, music, getArtiste, artiste } = useContentful();

  const SONGS = useMemo<Song[]>(() => (music || []).map(toSong), [music]);
  const ARTISTS = useMemo<Artist[]>(() => {
    const listed = (artiste || []).map(toArtist);
    // ensure every song's artist exists (derive a stub from the song if missing)
    const byId = new Map(listed.map((a) => [a.id, a]));
    SONGS.forEach((s) => { if (s.artistId && !byId.has(s.artistId)) byId.set(s.artistId, { id: s.artistId, name: s.artistName, role: "Minister", photo: "", bio: "" }); });
    return Array.from(byId.values());
  }, [artiste, SONGS]);

  // albums derived from songs that carry an albumId
  const ALBUMS = useMemo<Album[]>(() => {
    const map = new Map<string, Album>();
    SONGS.forEach((s) => {
      if (!s.albumId) return;
      if (!map.has(s.albumId)) map.set(s.albumId, { id: s.albumId, title: s.albumId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), artistId: s.artistId, artistName: s.artistName, cover: s.cover, palette: s.palette, year: s.release ? new Date(s.release).getFullYear() : undefined });
    });
    return Array.from(map.values());
  }, [SONGS]);

  const artistById = useCallback((id: string) => ARTISTS.find((a) => a.id === id), [ARTISTS]);
  const albumById = useCallback((id: string) => ALBUMS.find((a) => a.id === id), [ALBUMS]);
  const songById = useCallback((id: string) => SONGS.find((s) => s.id === id), [SONGS]);
  const songsInAlbum = useCallback((id: string) => SONGS.filter((s) => s.albumId === id), [SONGS]);
  const songsByArtist = useCallback((id: string) => SONGS.filter((s) => s.artistId === id), [SONGS]);

  // state
  const [view, setView] = useState<"gallery" | "song" | "artist" | "album">("gallery");
  const [curId, setCurId] = useState<string>("");
  const [q, setQ] = useState("");
  const [artistPage, setArtistPage] = useState(1);
  const [albumPage, setAlbumPage] = useState(1);
  const [songPage, setSongPage] = useState(1);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ msg: string; on: boolean }>({ msg: "", on: false });
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => { getMusic(); getArtiste(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { setReady(true); }, []);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, on: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 2600);
  }, []);

  // search filters
  const matchArtist = (a: Artist) => !q || (a.name + " " + a.bio + " " + a.role).toLowerCase().includes(q.toLowerCase());
  const matchSong = (s: Song) => !q || (s.title + " " + s.artistName).toLowerCase().includes(q.toLowerCase());
  const matchAlbum = (a: Album) => !q || (a.title + " " + a.artistName).toLowerCase().includes(q.toLowerCase());

  const filteredArtists = useMemo(() => ARTISTS.filter(matchArtist), [ARTISTS, q]);
  const filteredAlbums = useMemo(() => ALBUMS.filter(matchAlbum), [ALBUMS, q]);
  const filteredSongs = useMemo(() => {
    const list = SONGS.filter(matchSong);
    return [...list].sort((a, b) => String(b.release || "").localeCompare(String(a.release || "")));
  }, [SONGS, q]);

  // pagination slices
  const artistSlice = filteredArtists.slice((artistPage - 1) * PER_PAGE.artists, artistPage * PER_PAGE.artists);
  const albumSlice = filteredAlbums.slice((albumPage - 1) * PER_PAGE.albums, albumPage * PER_PAGE.albums);
  const songSlice = filteredSongs.slice((songPage - 1) * PER_PAGE.songs, songPage * PER_PAGE.songs);
  const artistPages = Math.max(1, Math.ceil(filteredArtists.length / PER_PAGE.artists));
  const albumPages = Math.max(1, Math.ceil(filteredAlbums.length / PER_PAGE.albums));
  const songPages = Math.max(1, Math.ceil(filteredSongs.length / PER_PAGE.songs));

  useEffect(() => { setArtistPage(1); setAlbumPage(1); setSongPage(1); }, [q]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "auto" });
  const openSong = (id: string) => { setCurId(id); setView("song"); scrollTop(); };
  const openArtist = (id: string) => { setCurId(id); setView("artist"); scrollTop(); };
  const openAlbum = (id: string) => { setCurId(id); setView("album"); scrollTop(); };
  const goGallery = () => { setView("gallery"); scrollTop(); };

  // play
  const playSong = (id: string) => {
    const s = songById(id); if (!s) return;
    if (!s.audio) { showToast("This song will be available to play soon."); return; }
    setNowPlaying(s);
  };
  const playAlbum = (id: string) => { const list = songsInAlbum(id).filter((s) => s.audio); if (!list.length) { showToast("This album will be available to play soon."); return; } setNowPlaying(list[0]); };

  const shareSong = async (id: string) => {
    const s = songById(id); if (!s) return;
    const url = "https://eemodiae.org/music?song=" + s.id;
    const text = `"${s.title}" by ${s.artistName} — eemodiae.org`;
    try {
      if (isBrowser() && (navigator as any).share) { await (navigator as any).share({ title: s.title, text, url }); return; }
      if (isBrowser() && navigator.clipboard) { await navigator.clipboard.writeText(url); showToast("Link copied. Share it with a friend."); return; }
    } catch {}
    showToast("Copy this link: " + url);
  };
  const downloadSong = (id: string) => {
    const s = songById(id); if (!s) return;
    if (!s.audio) { showToast("This song will be available to download soon."); return; }
    const a = document.createElement("a"); a.href = s.audio; a.download = s.title + ".mp3"; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
  };

  // deep link ?song= / ?artist= / ?album=
  const [deepDone, setDeepDone] = useState(false);
  useEffect(() => {
    if (deepDone || !router.isReady || SONGS.length === 0) return;
    const one = (v: any) => (Array.isArray(v) ? v[0] : v);
    const sg = one(router.query.song), ar = one(router.query.artist), al = one(router.query.album), ix = one(router.query.i);
    if (sg && songById(cleanSlug(String(sg)))) openSong(cleanSlug(String(sg)));
    else if (ix != null && String(ix) !== "" && SONGS[Number(ix)]) openSong(SONGS[Number(ix)].id);
    else if (ar) { const hit = artistById(cleanSlug(String(ar))) || ARTISTS.find((x) => x.name.toLowerCase() === String(ar).toLowerCase()); if (hit) openArtist(hit.id); }
    else if (al && albumById(cleanSlug(String(al)))) openAlbum(cleanSlug(String(al)));
    setDeepDone(true);
    // eslint-disable-next-line
  }, [router.isReady, router.query, SONGS, deepDone]);

  // hardware back
  useEffect(() => {
    if (view === "gallery") return;
    history.pushState({ mxDetail: true }, "");
    const onPop = () => goGallery();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line
  }, [view]);

  // ---- cover (image or generated from palette) ----
  const Cover = ({ item, big }: { item: { cover: string; title: string; palette: [string, string]; artistName?: string }; big?: boolean }) => {
    if (item.cover) return <img src={item.cover} alt={item.title + " cover art"} loading="lazy" />;
    const [c1, c2] = item.palette || DEFAULT_PALETTE;
    return (
      <div className={"mx-cover-gen" + (big ? " mx-cover-gen--big" : "")} style={{ background: `radial-gradient(circle at 28% 22%,${c2},${c1})` }}>
        <span className="mx-cover-note" aria-hidden="true">&#9835;</span>
        <span className="mx-cover-title">{item.title}</span>
        {item.artistName ? <span className="mx-cover-artist">{item.artistName}</span> : null}
      </div>
    );
  };

  const Pager = ({ page, pages, onSet }: { page: number; pages: number; onSet: (n: number) => void }) => {
    if (pages <= 1) return null;
    return (
      <nav className="mx-pagination" aria-label="Pages">
        <button className="mx-pbtn" disabled={page <= 1} onClick={() => { onSet(page - 1); scrollTop(); }} aria-label="Previous">‹</button>
        <span className="mx-count">{page} / {pages}</span>
        <button className="mx-pbtn" disabled={page >= pages} onClick={() => { onSet(page + 1); scrollTop(); }} aria-label="Next">›</button>
      </nav>
    );
  };

  const ShareSave = ({ id }: { id: string }) => (
    <div className="mx-song-actions">
      <button className="mx-chip" aria-label="Share" onClick={(e) => { e.stopPropagation(); shareSong(id); }}>
        <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.5" y1="13.5" x2="15.5" y2="17.5" /><line x1="15.5" y1="6.5" x2="8.5" y2="10.5" /></svg>Share
      </button>
      <button className="mx-chip" aria-label="Download" onClick={(e) => { e.stopPropagation(); downloadSong(id); }}>
        <svg viewBox="0 0 24 24"><path d="M12 3v12" /><polyline points="7 11 12 16 17 11" /><line x1="5" y1="20" x2="19" y2="20" /></svg>Save
      </button>
    </div>
  );

  const SongCard = ({ s }: { s: Song }) => (
    <article className="mx-song mx-reveal is-in" role="button" tabIndex={0} aria-label={"Open " + s.title} onClick={() => openSong(s.id)} onKeyDown={(e) => { if (e.key === "Enter") openSong(s.id); }}>
      <div className="mx-cover">
        <Cover item={s} />
        <button className="mx-play" aria-label={"Play " + s.title} onClick={(e) => { e.stopPropagation(); playSong(s.id); }}>
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
      </div>
      <div className="mx-song-meta">
        {fmtDur(s.duration) && <span className="mx-duration">{fmtDur(s.duration)}</span>}
        <h3>{s.title}</h3>
        <p>{s.artistName}</p>
        <ShareSave id={s.id} />
      </div>
    </article>
  );

  const AlbumCard = ({ a }: { a: Album }) => {
    const n = songsInAlbum(a.id).length;
    return (
      <article className="mx-song is-album mx-reveal is-in" role="button" tabIndex={0} aria-label={"Open album " + a.title} onClick={() => openAlbum(a.id)} onKeyDown={(e) => { if (e.key === "Enter") openAlbum(a.id); }}>
        <div className="mx-cover">
          <Cover item={a} />
          <button className="mx-play" aria-label={"Play album " + a.title} onClick={(e) => { e.stopPropagation(); playAlbum(a.id); }}>
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
        </div>
        <div className="mx-song-meta"><h3>{a.title}</h3><p>{a.artistName} · {n === 1 ? "1 song" : n + " songs"}</p></div>
      </article>
    );
  };

  const ArtistCard = ({ a }: { a: Artist }) => (
    <article className="mx-artist mx-reveal is-in" role="button" tabIndex={0} aria-label={"Open " + a.name} onClick={() => openArtist(a.id)} onKeyDown={(e) => { if (e.key === "Enter") openArtist(a.id); }}>
      <div className="mx-avatar">{a.photo ? <img src={a.photo} alt={a.name} loading="lazy" /> : <span>{initialsOf(a.name)}</span>}</div>
      <h3>{a.name}</h3>
      <p>{a.role}</p>
    </article>
  );

  const cur = songById(curId);
  const curArtist = view === "artist" ? artistById(curId) : cur ? artistById(cur.artistId) : undefined;
  const curAlbum = view === "album" ? albumById(curId) : undefined;

  return (
    <Wrap className="eemodiae-page ee-base-18">
      <Head>
        <title>Music | eemodiae.org</title>
        <meta name="description" content="Experience soul lifting music. Worship and gospel songs from the ministry of Emmanuel I. Emodiae and friends." />
      </Head>
      <Nav />

      {/* ============ GALLERY ============ */}
      {view === "gallery" && (
        <div className="mx-view active">
          <header className="mx-hero" role="img" aria-label="Music. Experience soul lifting music.">
            <img src={MUSIC_HERO} alt="" />
          </header>
          <section className="mx-head">
            <h1>MUSIC</h1>
            <p className="mx-rider">Experience Soul Lifting Music</p>
            <div className="mx-staff" aria-hidden="true"><span className="dot" /><span className="dot" /><span className="dot" /></div>
          </section>

          <div className="mx-search-wrap">
            <div className="mx-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" /></svg>
              <input type="search" placeholder="Search music, artistes, albums..." aria-label="Search music" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          {/* Artistes */}
          {filteredArtists.length > 0 && (
            <section className="mx-section">
              <div className="mx-section-head"><h2>Artistes</h2><span className="mx-count">{filteredArtists.length === 1 ? "1 artiste" : filteredArtists.length + " artistes"}</span></div>
              <div className="mx-artists">{artistSlice.map((a) => <ArtistCard key={a.id} a={a} />)}</div>
              <Pager page={artistPage} pages={artistPages} onSet={setArtistPage} />
            </section>
          )}

          {/* Albums */}
          {filteredAlbums.length > 0 && (
            <section className="mx-section">
              <div className="mx-section-head"><h2>Albums</h2><span className="mx-count">{filteredAlbums.length === 1 ? "1 album" : filteredAlbums.length + " albums"}</span></div>
              <div className="mx-grid">{albumSlice.map((a) => <AlbumCard key={a.id} a={a} />)}</div>
              <Pager page={albumPage} pages={albumPages} onSet={setAlbumPage} />
            </section>
          )}

          {/* Songs */}
          <section className="mx-section">
            <div className="mx-section-head"><h2>Recently Added</h2><span className="mx-count">{filteredSongs.length === 1 ? "1 song" : filteredSongs.length + " songs"}</span></div>
            <div className="mx-grid">{songSlice.map((s) => <SongCard key={s.id} s={s} />)}</div>
            {ready && filteredSongs.length === 0 && <p className="mx-empty">No music matches that search. Try another word.</p>}
            <Pager page={songPage} pages={songPages} onSet={setSongPage} />
          </section>

          <div className="mx-foot" aria-hidden="true" />
        </div>
      )}

      {/* ============ SONG DETAIL ============ */}
      {view === "song" && cur && (
        <div className="mx-view active">
          <div className="mx-detailbar">
            <button className="mx-back" onClick={goGallery}><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg> Back to Music</button>
          </div>
          <div className="mx-song-detail" id="mx-song-detail">
            <div className="mx-sd-top">
              <div className="mx-sd-cover"><Cover item={cur} big /></div>
              <div className="mx-sd-info">
                <div className="mx-sd-eyebrow">Now Presenting</div>
                <h2>{cur.title}</h2>
                <div className="mx-sd-artist">by <a role="button" tabIndex={0} onClick={() => curArtist && openArtist(curArtist.id)} onKeyDown={(e) => { if (e.key === "Enter" && curArtist) openArtist(curArtist.id); }}>{cur.artistName}</a></div>
                <div className="mx-sd-meta-row">{[cur.artistName, curAlbum?.title || (cur.albumId ? albumById(cur.albumId)?.title : ""), fmtDur(cur.duration), cur.release ? new Date(cur.release).getFullYear() : ""].filter(Boolean).join(" · ")}</div>
                <div className="mx-sd-actions">
                  <button className="mx-btn mx-btn-primary" onClick={() => playSong(cur.id)}><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Play</button>
                  <button className="mx-btn mx-btn-ghost" onClick={() => shareSong(cur.id)}><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.5" y1="13.5" x2="15.5" y2="17.5" /><line x1="15.5" y1="6.5" x2="8.5" y2="10.5" /></svg>Share</button>
                  <button className="mx-btn mx-btn-ghost" onClick={() => downloadSong(cur.id)}><svg viewBox="0 0 24 24"><path d="M12 3v12" /><polyline points="7 11 12 16 17 11" /><line x1="5" y1="20" x2="19" y2="20" /></svg>Save</button>
                </div>
              </div>
            </div>
            {cur.scripture && <blockquote className="mx-scripture"><p>{cur.scripture.text}</p><cite>{cur.scripture.ref}</cite></blockquote>}
            {cur.reflection && <p className="mx-reflection">{cur.reflection}</p>}
            <h3 className="mx-lyrics-h">Lyrics</h3>
            <div className="mx-lyrics">
              {cur.lyrics.length ? cur.lyrics.map((block, i) => (
                <div className={"mx-verse" + (i === 1 ? " chorus" : "")} key={i}>{block.map((l, j) => <p key={j}>{l}</p>)}</div>
              )) : <p className="mx-empty">Lyrics will be added soon.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ============ ARTIST DETAIL ============ */}
      {view === "artist" && curArtist && (
        <div className="mx-view active">
          <div className="mx-detailbar"><button className="mx-back" onClick={goGallery}><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg> Back to Music</button></div>
          <section className="mx-artist-detail">
            <div className="mx-artist-hero">
              <div className="mx-avatar mx-avatar--big">{curArtist.photo ? <img src={curArtist.photo} alt={curArtist.name} /> : <span>{initialsOf(curArtist.name)}</span>}</div>
              <div><div className="mx-sd-eyebrow">{curArtist.role}</div><h2>{curArtist.name}</h2>{curArtist.bio && <p className="mx-artist-bio">{curArtist.bio}</p>}</div>
            </div>
            <div className="mx-section-head"><h2>Songs</h2></div>
            <div className="mx-grid">{songsByArtist(curArtist.id).map((s) => <SongCard key={s.id} s={s} />)}</div>
            {songsByArtist(curArtist.id).length === 0 && <p className="mx-empty">Songs from this artiste will appear here soon.</p>}
          </section>
        </div>
      )}

      {/* ============ ALBUM DETAIL ============ */}
      {view === "album" && curAlbum && (
        <div className="mx-view active">
          <div className="mx-detailbar"><button className="mx-back" onClick={goGallery}><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg> Back to Music</button></div>
          <section className="mx-album-detail">
            <div className="mx-sd-top">
              <div className="mx-sd-cover"><Cover item={curAlbum} big /></div>
              <div className="mx-sd-info">
                <div className="mx-sd-eyebrow">Album</div><h2>{curAlbum.title}</h2>
                <div className="mx-sd-meta-row">{[curAlbum.artistName, curAlbum.year, songsInAlbum(curAlbum.id).length + " songs"].filter(Boolean).join(" · ")}</div>
                <div className="mx-sd-actions"><button className="mx-btn mx-btn-primary" onClick={() => playAlbum(curAlbum.id)}><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Play Album</button></div>
              </div>
            </div>
            <div className="mx-grid">{songsInAlbum(curAlbum.id).map((s) => <SongCard key={s.id} s={s} />)}</div>
          </section>
        </div>
      )}

      <Footer />

      {/* ============ FIXED PLAYER BAR ============ */}
      <div className={"mx-player" + (nowPlaying ? " active" : "")}>
        {nowPlaying && (
          <div className="mx-player-inner">
            <div className="mx-player-cover">{nowPlaying.cover ? <img src={nowPlaying.cover} alt="" /> : <span className="mx-player-note">&#9835;</span>}</div>
            <div className="mx-player-titles"><div className="mx-player-title">{nowPlaying.title}</div><div className="mx-player-artist">{nowPlaying.artistName}</div></div>
            <div className="mx-player-audio">
              <AudioPlayer src={nowPlaying.audio} autoPlayAfterSrcChange showJumpControls={false} layout="horizontal-reverse" customAdditionalControls={[]} />
            </div>
            <button className="mx-player-close" aria-label="Close player" onClick={() => setNowPlaying(null)}>
              <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
          </div>
        )}
      </div>

      <div className={"mx-toast" + (toast.on ? " show" : "")} role="status" aria-live="polite">{toast.msg}</div>
    </Wrap>
  );
};

export default MusicPage;
