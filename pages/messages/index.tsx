import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import styled, { createGlobalStyle } from "styled-components";
import Nav from "../../components/redesign/Nav";
import Footer from "../../components/redesign/Footer";
import useContentful from "../../hooks/useContentful";
// import messageHeader from "../../public/redesign/msg-hero-message.jpg"
import seriesHeader from "../../public/redesign/msg-hero-series.jpg"
import messageHeader from "../../public/redesign/msg-hero-message.jpg"
import { sendSiteMail } from "../../util/sendSiteMail";
import {
  ListenButton,
  usePlatformAudioOptional,
  type PlatformAudioTrack,
} from "../../components/audio";

/* ============================================================
   eemodiae.org — MSGS  (redesign port)
   Three-tab teaching library (series / messages / podcasts) with
   landing, series-detail, message-detail and episode-detail views,
   a full custom audio player (play/seek/speed/sleep-timer/media-
   session/queue), progress tracking, saved items and continue-
   listening rails. Ported 1:1 from the redesign and wired to the
   live Contentful sources (getMessages → eemodiaeMessages,
   getPodcasts → eemodiaePodcast).
   A message with a `category` is a Series; its sermons are the
   linked Assets in `audio_file[]`. Messages without a category
   are standalone. Up Next within a series is the other audio_file
   items (excluding the one currently playing).
   Classes namespaced ms-.
   ============================================================ */

const AUTHOR = "Pst Emmanuel I. Emodiae";
const AUTHOR_FULL = "Emmanuel I. Emodiae";
const POD_BANNER = "/redesign/msg-pod-banner.jpg";
const POD_SUBSCRIBE = {
  apple: "https://podcasts.apple.com/",
  spotify: "https://open.spotify.com/",
  rss: "https://anchor.fm/s/eemodiae/podcast/rss",
};
const HERO_LANDING = "/redesign/msg-hero-landing.jpg";
const HERO_SERIES = "/redesign/msg-hero-series.jpg";
const HERO_MESSAGE = "/redesign/msg-hero-message.jpg";
const ENCOURAGE_IMG = "/redesign/msg-encourage.jpg";
const MSG_EMAIL = "eemodiaemessages@gmail.com";
const MAIL_INBOX = "messages" as const;

const isBrowser = () => typeof window !== "undefined";
const cleanSlug = (s: string) =>
  (s || "").toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");

/* ---- view-model types ---- */
type Track = { slug: string; title: string; sub?: string; dur: string; audio: string; image: string; artist: string };
type Msg = {
  slug: string; title: string; image: string; dur: string; category: string;
  audio: string; preacher: string; year?: string; mainScripture?: string;
  overview?: string; transcript?: string;
  scriptures?: string[]; keyIdeas?: string[]; quotes?: string[];
  reflections?: string[]; prayer?: string; application?: string; reading?: string[];
};
type Series = {
  slug: string; title: string; image: string; category: string;
  summary?: string; overviewLong?: string; scripture?: string; year?: string;
  sermons: { title: string; sub: string; dur: string; audio: string; image: string; slug: string }[];
};
type Episode = {
  slug: string; title: string; image: string; dur: string; audio: string;
  seriesTitle?: string; date?: string; theme?: string; desc?: string;
};
type PodSeries = { slug: string; title: string; image: string; desc?: string; episodes: Episode[] };

/* ---- storage ---- */
const load = <T,>(k: string, fb: T): T => {
  try { const v = isBrowser() ? window.localStorage.getItem(k) : null; return v ? JSON.parse(v) as T : fb; }
  catch { return fb; }
};
const save = (k: string, v: any) => { try { if (isBrowser()) window.localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ---- image / audio extraction from a Contentful entry ---- */
const absUrl = (u?: string | null): string => {
  if (!u) return "";
  const s = String(u).trim();
  if (!s || s === "[object Object]") return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("//")) return "https:" + s;
  return "https:" + s;
};

/** Resolve Asset / Link / string URL from a message or podcast entry. */
const imgOf = (a: any): string => {
  if (!a) return "";
  if (typeof a.image === "string" && a.image.trim()) return absUrl(a.image);
  const candidates = [
    a?.imageUrl?.fields?.file?.url,
    a?.image_url?.fields?.file?.url,
    a?.image?.fields?.file?.url,
    a?.thumbnail?.fields?.file?.url,
    a?.cover?.fields?.file?.url,
    typeof a?.imageUrl === "string" ? a.imageUrl : null,
    typeof a?.image_url === "string" ? a.image_url : null,
  ];
  for (const c of candidates) {
    const url = absUrl(c);
    if (url) return url;
  }
  return "";
};

/** Resolve a Contentful Asset (or Link) to its file URL. */
const assetUrl = (asset: any): string =>
  absUrl(asset?.fields?.file?.url || (typeof asset === "string" ? asset : ""));

/** Single-message audio: prefer `audio`, else first `audio_file` Asset. */
const audioOf = (a: any): string => {
  if (typeof a?.audio === "string") return absUrl(a.audio);
  const fromAudio = assetUrl(a?.audio);
  if (fromAudio) return fromAudio;
  const files = Array.isArray(a?.audio_file) ? a.audio_file : a?.audio_file ? [a.audio_file] : [];
  return assetUrl(files[0]);
};

/** Strip preacher / ministry suffixes from Asset titles for cleaner sermon names. */
const cleanSermonTitle = (raw: string, fallback: string): string => {
  const t = (raw || "")
    .replace(/\s*Pst\.?\s*Emmanuel.*/i, "")
    .replace(/\s*PASTOR\s+EMMANUEL.*/i, "")
    .replace(/\s*PASTOR\s*$/i, "")
    .replace(/\s*HOUSE\s+OF\s+JOY.*/i, "")
    .replace(/\s*House\s+of\s+Joy.*/i, "")
    .trim();
  return t || fallback;
};

type Sermon = Series["sermons"][number];

/** Build ordered sermons from a series entry's `audio_file` Asset links. */
const sermonsFromAudioFiles = (a: any, seriesImage: string, seriesSlug: string): Sermon[] => {
  const files = Array.isArray(a?.audio_file) ? a.audio_file : [];
  const sermons: Sermon[] = [];
  files.forEach((asset: any, i: number) => {
    const audio = assetUrl(asset);
    if (!audio) return; // unresolved Link or missing file
    const title = cleanSermonTitle(asset?.fields?.title || "", "Sermon " + (i + 1));
    sermons.push({
      title,
      sub: "Sermon " + (i + 1),
      dur: "",
      audio,
      image: seriesImage,
      slug: cleanSlug(title) || seriesSlug + "__" + i,
    });
  });
  return sermons;
};

const toMsg = (a: any): Msg => ({
  slug: cleanSlug(a?.title || ""),
  title: a?.title || "Untitled",
  image: imgOf(a),
  dur: a?.duration || a?.dur || "",
  category: a?.category || "",
  audio: audioOf(a),
  preacher: a?.preacher || AUTHOR_FULL,
  year: a?.year || (a?.createdAt ? String(new Date(a.createdAt).getFullYear()) : undefined),
  mainScripture: a?.mainScripture || a?.scripture || undefined,
  overview: a?.overview || a?.summary || undefined,
  transcript: typeof a?.transcript === "string" ? a.transcript : undefined,
  scriptures: Array.isArray(a?.scriptures) ? a.scriptures : undefined,
  keyIdeas: Array.isArray(a?.keyIdeas) ? a.keyIdeas : undefined,
  quotes: Array.isArray(a?.quotes) ? a.quotes : undefined,
  reflections: Array.isArray(a?.reflections) ? a.reflections : undefined,
  prayer: a?.prayer || undefined,
  application: a?.application || undefined,
  reading: Array.isArray(a?.reading) ? a.reading : undefined,
});

/**
 * Series = Contentful messages that have a `category`.
 * Each series sermon is an Asset in that entry's `audio_file[]`.
 */
const buildSeries = (raw: any[]): Series[] =>
  (raw || [])
    .filter((a) => a?.category)
    .map((a) => {
      const image = imgOf(a);
      const category = String(a.category);
      const slug = cleanSlug(category || a?.title || "");
      let sermons = sermonsFromAudioFiles(a, image, slug);
      // fallback: single `audio` Asset if audio_file is empty
      if (!sermons.length) {
        const audio = audioOf(a);
        if (audio) {
          sermons = [{
            title: a?.title || category,
            sub: "Sermon 1",
            dur: a?.duration || a?.dur || "",
            audio,
            image,
            slug: cleanSlug(a?.title || category) || slug + "__0",
          }];
        }
      }
      return {
        slug,
        title: a?.title || category,
        image,
        category,
        summary: a?.overview || a?.summary || undefined,
        overviewLong: a?.overviewLong || a?.overview || a?.summary || undefined,
        scripture: a?.mainScripture || a?.scripture || undefined,
        year: a?.year || (a?.createdAt ? String(new Date(a.createdAt).getFullYear()) : undefined),
        sermons,
      } as Series;
    })
    .filter((s) => s.sermons.length > 0);

const toEpisode = (a: any, seriesTitle?: string): Episode => ({
  slug: cleanSlug(a?.title || ""),
  title: a?.title || "Episode",
  image: imgOf(a),
  dur: a?.duration || a?.dur || "",
  audio: audioOf(a),
  seriesTitle,
  date: a?.date || a?.releaseDate || undefined,
  theme: a?.theme || a?.category || undefined,
  desc: a?.description || a?.desc || undefined,
});

/* podcasts: a podcast entry may carry episodes[] or be a single episode */
const buildPodcasts = (pods: any[]): { series: PodSeries[]; episodes: Episode[] } => {
  const series: PodSeries[] = [];
  const episodes: Episode[] = [];
  (pods || []).forEach((p) => {
    const eps = Array.isArray(p?.episodes) ? p.episodes : null;
    if (eps && eps.length) {
      const ps: PodSeries = {
        slug: cleanSlug(p?.title || ""),
        title: p?.title || "Podcast",
        image: imgOf(p),
        desc: p?.description || p?.desc || undefined,
        episodes: eps.map((e: any) => toEpisode(e?.fields ? { ...e.fields } : e, p?.title)),
      };
      series.push(ps);
      episodes.push(...ps.episodes);
    } else {
      episodes.push(toEpisode(p));
    }
  });
  return { series, episodes };
};

const parseDur = (s?: string): number => {
  if (!s) return 30 * 60;
  const m = /(\d+)\s*min/.exec(s); if (m) return parseInt(m[1], 10) * 60;
  const hm = /(\d+):(\d+)/.exec(s); if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2], 10);
  const n = parseInt(s, 10); return isNaN(n) ? 30 * 60 : n * 60;
};
const fmtTime = (sec: number): string => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
};
const fmtDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(+d)) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

/* ============================================================
   AUDIO PLAYER HOOK
   Ports the mockup's player engine: real <audio> when a track has
   a URL, a timed simulation fallback when it doesn't, plus queue /
   up-next, media session, sleep timer and speed.
   ============================================================ */
type PlayerStatus = {
  playing: boolean; index: number; item: Track | null;
  cur: number; total: number; speed: number; sleepMin: number;
  queueLen: number;
};

type PlayerPlatformBridge = {
  getAudioElement: () => HTMLAudioElement | null;
  setActiveTrack: (track: PlatformAudioTrack | null) => void;
};

function trackToPlatform(t: Track | null): PlatformAudioTrack | null {
  if (!t?.audio) return null;
  return { id: t.slug, src: t.audio, title: t.title, subtitle: t.sub };
}

function usePlayer(
  onAudioPos?: (slug: string, sec: number, total: number) => void,
  platform?: PlayerPlatformBridge | null
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Track[]>([]);
  const idxRef = useRef(0);
  const loopRef = useRef(false);
  const speedRef = useRef(1);
  const sleepAtRef = useRef(0);
  const sleepMinRef = useRef(0);
  const simTimer = useRef<number | undefined>(undefined);
  const simSec = useRef(0);
  const simTotal = useRef(0);
  const simPlaying = useRef(false);
  const lastStatusAt = useRef(0);
  const lastPosAt = useRef(0);
  const statusTimer = useRef<number | undefined>(undefined);
  const platformRef = useRef(platform);
  platformRef.current = platform;

  const [status, setStatus] = useState<PlayerStatus>({
    playing: false, index: 0, item: null, cur: 0, total: 0, speed: 1, sleepMin: 0, queueLen: 0,
  });

  const getEl = () => platformRef.current?.getAudioElement() || audioRef.current;
  const cur = () => queueRef.current[idxRef.current] || null;
  const hasReal = () => { const c = cur(); return !!(c && c.audio); };

  const emit = useCallback((force = false) => {
    const c = cur();
    const el = getEl();
    let curT = 0, total = 0, playing = false;
    if (c && c.audio && el) {
      curT = el.currentTime || 0; total = el.duration || parseDur(c.dur); playing = !el.paused && !el.ended;
    } else if (c) {
      curT = simSec.current; total = simTotal.current; playing = simPlaying.current;
    }

    const now = Date.now();
    const s = c?.slug;
    if (s && total > 0 && curT > 0 && onAudioPos && (force || now - lastPosAt.current > 2000)) {
      lastPosAt.current = now;
      onAudioPos(s, curT, total);
    }

    if (!force && now - lastStatusAt.current < 400) {
      if (statusTimer.current == null) {
        statusTimer.current = window.setTimeout(() => {
          statusTimer.current = undefined;
          emit(true);
        }, 400);
      }
      return;
    }
    lastStatusAt.current = now;
    setStatus({ playing, index: idxRef.current, item: c, cur: curT, total, speed: speedRef.current, sleepMin: sleepMinRef.current, queueLen: queueRef.current.length });
  }, [onAudioPos]);

  const stopSim = () => { simPlaying.current = false; window.clearInterval(simTimer.current); };
  const startSim = useCallback(() => {
    simPlaying.current = true; window.clearInterval(simTimer.current);
    simTimer.current = window.setInterval(() => {
      simSec.current += speedRef.current;
      if (sleepAtRef.current && Date.now() >= sleepAtRef.current) { pause(); sleepAtRef.current = 0; sleepMinRef.current = 0; emit(true); return; }
      if (simSec.current >= simTotal.current) { simSec.current = simTotal.current; onEnded(); return; }
      emit();
    }, 1000);
    emit(true);
    // eslint-disable-next-line
  }, [emit]);

  const setMediaSession = () => {
    if (!isBrowser() || !("mediaSession" in navigator)) return;
    const c = cur(); if (!c) return;
    try {
      (navigator as any).mediaSession.metadata = new (window as any).MediaMetadata({
        title: c.title || "", artist: c.artist || AUTHOR_FULL, album: "eemodiae.org",
        artwork: c.image ? [{ src: c.image, sizes: "512x512", type: "image/jpeg" }] : [],
      });
      const ms = (navigator as any).mediaSession;
      ms.setActionHandler("play", play);
      ms.setActionHandler("pause", pause);
      ms.setActionHandler("previoustrack", prev);
      ms.setActionHandler("nexttrack", next);
      ms.setActionHandler("seekbackward", () => skip(-15));
      ms.setActionHandler("seekforward", () => skip(15));
    } catch {}
  };

  const syncPlatformTrack = (c: Track | null) => {
    const bridge = platformRef.current;
    if (!bridge) return;
    bridge.setActiveTrack(trackToPlatform(c));
  };

  const loadCurrent = useCallback((autoplay: boolean) => {
    const c = cur(); if (!c) return;
    stopSim();
    const el = getEl();
    if (c.audio && el) {
      const src = el.currentSrc || el.src || "";
      const sameSrc = !!src && (src === c.audio || src.endsWith(c.audio) || src.includes(c.audio));
      if (!sameSrc) {
        el.src = c.audio;
        el.load();
      }
      el.playbackRate = speedRef.current;
      if (autoplay) {
        syncPlatformTrack(c);
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    } else {
      if (autoplay) syncPlatformTrack(null);
      simTotal.current = parseDur(c.dur);
      if (autoplay) startSim();
    }
    setMediaSession(); emit(true);
    // eslint-disable-next-line
  }, [emit, startSim]);

  function play() { const c = cur(); if (!c) return; if (c.audio && getEl()) { syncPlatformTrack(c); getEl()!.play().catch(() => {}); } else startSim(); emit(true); }
  function pause() { const c = cur(); if (!c) return; if (c.audio && getEl()) getEl()!.pause(); else stopSim(); emit(true); }
  const toggle = () => { status.playing ? pause() : play(); };
  function skip(delta: number) { const c = cur(); if (!c) return; const el = getEl(); if (c.audio && el) el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta)); else simSec.current = Math.max(0, Math.min(simTotal.current, simSec.current + delta)); emit(true); }
  const seekTo = (frac: number) => { const total = status.total; const t = Math.max(0, Math.min(total, frac * total)); const c = cur(); const el = getEl(); if (c && c.audio && el) el.currentTime = t; else simSec.current = t; emit(true); };
  const setSpeed = (v: number) => { speedRef.current = v; if (hasReal() && getEl()) getEl()!.playbackRate = v; emit(true); };
  const setSleep = (min: number) => { sleepMinRef.current = min; sleepAtRef.current = min > 0 ? Date.now() + min * 60000 : 0; emit(true); };
  function onEnded() { stopSim(); if (idxRef.current < queueRef.current.length - 1) { idxRef.current++; loadCurrent(true); } else if (loopRef.current && queueRef.current.length) { idxRef.current = 0; loadCurrent(true); } else { syncPlatformTrack(null); emit(true); } }
  function next() { if (idxRef.current < queueRef.current.length - 1) { idxRef.current++; loadCurrent(true); } else if (loopRef.current && queueRef.current.length) { idxRef.current = 0; loadCurrent(true); } }
  function prev() { if (idxRef.current > 0) { idxRef.current--; loadCurrent(true); } else if (loopRef.current && queueRef.current.length) { idxRef.current = queueRef.current.length - 1; loadCurrent(true); } }
  const playIndex = (i: number) => { if (i >= 0 && i < queueRef.current.length) { idxRef.current = i; loadCurrent(true); } };
  const setQueue = (items: Track[], startIndex = 0, opts: { autoplay?: boolean; loop?: boolean; preserve?: boolean } = {}) => {
    loopRef.current = !!opts.loop;
    const wasItem = cur();
    queueRef.current = items.slice();
    idxRef.current = Math.max(0, Math.min(startIndex, queueRef.current.length - 1));
    if (opts.preserve && wasItem) {
      const found = queueRef.current.findIndex((x) => x.slug === wasItem.slug);
      if (found >= 0) { idxRef.current = found; setMediaSession(); emit(true); return; }
    }
    loadCurrent(!!opts.autoplay);
  };

  // wire <audio> events on whichever element is active
  useEffect(() => {
    const el = getEl(); if (!el) return;
    const onEnd = () => onEnded();
    const onTime = () => {
      if (!hasReal()) return;
      if (sleepAtRef.current && Date.now() >= sleepAtRef.current) {
        pause(); sleepAtRef.current = 0; sleepMinRef.current = 0; emit(true); return;
      }
      emit();
    };
    const onPlayPause = () => emit(true);
    el.addEventListener("ended", onEnd);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlayPause);
    el.addEventListener("pause", onPlayPause);
    el.addEventListener("loadedmetadata", onPlayPause);
    return () => {
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlayPause);
      el.removeEventListener("pause", onPlayPause);
      el.removeEventListener("loadedmetadata", onPlayPause);
    };
    // eslint-disable-next-line
  }, [emit, platform]);

  useEffect(() => () => {
    window.clearInterval(simTimer.current);
    window.clearTimeout(statusTimer.current);
  }, []);

  return { audioRef, status, play, pause, toggle, skip, seekTo, setSpeed, setSleep, next, prev, playIndex, setQueue };
}

const Wrap = styled.div`
  /* ===== design tokens (scoped) ===== */

  /* ---- Blend (V3): brief royal purple + warm articles gold ---- */
  --ms-ivory:#f8f2e6; --ms-champagne:#f1e3cf; --ms-linen:#f6f1e4; --ms-milk:#fffdf7;
  --ms-royal:#553192; --ms-lavender:#8258bf; --ms-gold:#c19a45; --ms-gold-rich:#d8b25a;
  --ms-gold-soft:#e6ce8e; --ms-cocoa:#7a5a46; --ms-espresso:#3d2e40; --ms-ink:#372c3a;
  --ms-ink-soft:#63566a; --ms-vellum:#e8ddc7; --ms-royal-deep:#3a2064;
  --ms-shadow:0 20px 50px -22px rgba(58,32,100,.30); --ms-shadow-sm:0 10px 26px -14px rgba(58,32,100,.24);
  --ms-glow-gold:0 0 30px -6px rgba(193,154,69,.34); --ms-ease:cubic-bezier(.22,.61,.36,1);

  position: relative;
  font-family: 'Crimson Pro', Georgia, serif;
  -webkit-font-smoothing: antialiased;

/* ============================================================
   MSGS  |  eemodiae.org
   Palette VERSION 3 \\u2014 blend of brief and existing systems.
   Warm editorial theological library. Three sections:
   Series, Messages, Podcasts. Reusable pagination throughout.
   ============================================================ */


& *{box-sizing:border-box}
  &{scroll-behavior:smooth; overflow-x:hidden;
  margin:0; color:var(--ms-ink);
  font-family:'Cormorant Garamond',serif;
  background:
    radial-gradient(1100px 520px at 50% -5%, rgba(255,255,255,.7), transparent 60%),
    radial-gradient(1200px 560px at 88% -4%, rgba(200,154,67,.12), transparent 60%),
    radial-gradient(1100px 640px at -12% 96%, rgba(91,53,122,.06), transparent 58%),
    linear-gradient(180deg, var(--ms-ivory) 0%, var(--ms-champagne) 100%);
  min-height:100vh;
}
img{max-width:100%; display:block}
button{font-family:inherit}

.ms-wrap{max-width:1240px; margin:0 auto; padding:0 clamp(18px,4vw,40px)}

/* ============ HERO ============ */
.ms-hero{position:relative; text-align:center; padding:clamp(48px,8vw,92px) 0 clamp(30px,4vw,44px)}
.ms-hero--banner{padding:0; margin-top:0}
.ms-hero--banner::before{display:none}
.ms-hero__bannerimg{
  width:100vw; max-width:none; margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw);
  height:auto; display:block; border-radius:0; box-shadow:none;
}
.ms-hero::before{
  content:""; position:absolute; left:50%; top:26px; transform:translateX(-50%);
  width:min(560px,80%); height:1px;
  background:linear-gradient(90deg,transparent,var(--ms-gold-soft),transparent);
}
.ms-hero__eyebrow{
  font-family:'Crimson Pro',serif; font-size:.78rem; letter-spacing:.34em;
  text-transform:uppercase; color:var(--ms-gold); margin-bottom:18px;
  display:flex; align-items:center; justify-content:center; gap:14px;
}
.ms-hero__eyebrow::before,.ms-hero__eyebrow::after{
  content:""; width:30px; height:1px; background:var(--ms-gold-soft);
}
.ms-hero h1{
  font-family:'Cinzel',serif; font-weight:700; margin:0;
  font-size:clamp(2.6rem,7vw,5rem); letter-spacing:.04em; line-height:1;
  color:var(--ms-royal);
  text-shadow:0 2px 30px rgba(91,53,122,.12);
}
.ms-hero__rider{
  font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:clamp(1.1rem,2.4vw,1.5rem); color:var(--ms-ink-soft);
  margin:16px auto 0; max-width:34em;
}
.ms-hero__flourish{ margin:22px auto 0; color:var(--ms-gold); font-size:1.3rem }

/* ============ SEARCH ============ */
.ms-search{position:relative; max-width:760px; margin:8px auto 0}
.ms-search input{
  width:100%; font-family:'Cormorant Garamond',serif; font-size:1.18rem;
  color:var(--ms-ink); background:var(--ms-milk);
  border:1px solid var(--ms-vellum); border-radius:16px;
  padding:16px 20px 16px 52px; outline:none;
  box-shadow:var(--ms-shadow-sm); transition:border-color .3s, box-shadow .3s;
}
.ms-search input::placeholder{color:#a9977f; font-style:italic}
.ms-search input:focus{border-color:var(--ms-royal); box-shadow:var(--ms-shadow-sm), var(--ms-glow-gold)}
.ms-search svg{position:absolute; left:20px; top:50%; transform:translateY(-50%); width:20px; height:20px; color:var(--ms-gold)}

/* ============ TAB SWITCHER ============ */
.ms-tabs{
  display:flex; justify-content:center; gap:6px; margin:26px auto 0;
  background:var(--ms-milk); border:1px solid var(--ms-vellum);
  border-radius:999px; padding:8px; max-width:560px;
  box-shadow:var(--ms-shadow-sm);
}
.ms-tab{
  flex:1; border:none; background:none; cursor:pointer;
  font-family:'Crimson Pro',serif; font-size:.9rem; letter-spacing:.12em;
  text-transform:uppercase; color:var(--ms-ink-soft);
  padding:12px 10px; border-radius:999px; transition:background .3s var(--ms-ease), color .3s var(--ms-ease), box-shadow .3s var(--ms-ease);
}
.ms-tab:hover{color:var(--ms-royal)}
.ms-tab.ms-tab--on,
.ms-tab.ms-tab--on:hover,
.ms-tab.ms-tab--on:focus{
  background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep));
  color:#fdf8ef !important;
  -webkit-text-fill-color:#fdf8ef;
  box-shadow:var(--ms-shadow-sm), inset 0 1px 0 rgba(228,201,138,.25);
}

/* ============ GATEWAY CARDS (Choose Your Journey) ============ */
.ms-gateways{
  display:grid; grid-template-columns:repeat(3,1fr); gap:22px; margin:40px auto 0;
}
@media (max-width:820px){ .ms-gateways{grid-template-columns:1fr} }
.ms-gateway{
  position:relative; text-align:left; cursor:pointer; font-family:inherit;
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:18px;
  padding:30px 28px 26px; box-shadow:var(--ms-shadow-sm); overflow:hidden;
  transition:transform .4s var(--ms-ease), box-shadow .4s var(--ms-ease), border-color .4s;
}
.ms-gateway::before{
  content:""; position:absolute; inset:0 0 auto 0; height:4px;
  background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-rich));
  opacity:0; transition:opacity .4s;
}
.ms-gateway:hover{transform:translateY(-6px); box-shadow:var(--ms-shadow), var(--ms-glow-gold); border-color:var(--ms-gold-soft)}
.ms-gateway:hover::before{opacity:1}
.ms-gateway__num{
  font-family:'Cinzel',serif; font-size:.8rem; letter-spacing:.2em;
  color:var(--ms-gold); margin-bottom:16px;
}
.ms-gateway__icon{
  width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(140deg,var(--ms-royal),var(--ms-royal-deep));
  color:var(--ms-gold-soft); margin-bottom:18px; box-shadow:var(--ms-shadow-sm);
}
.ms-gateway__icon svg{width:26px; height:26px}
.ms-gateway h3{
  font-family:'Cinzel',serif; font-weight:600; font-size:1.3rem;
  color:var(--ms-royal-deep); margin:0 0 10px;
}
.ms-gateway p{font-size:1.06rem; line-height:1.55; color:var(--ms-ink-soft); margin:0}
.ms-gateway__go{
  display:inline-flex; align-items:center; gap:8px; margin-top:18px;
  font-family:'Crimson Pro',serif; font-size:.74rem; letter-spacing:.2em;
  text-transform:uppercase; color:var(--ms-royal); transition:gap .3s var(--ms-ease);
}
.ms-gateway:hover .ms-gateway__go{gap:12px}
.ms-gateway__go svg{width:13px; height:13px}

/* ============ SECTION HEADINGS ============ */
.ms-sec{padding:clamp(30px,5vw,50px) 0 0}
.ms-sec__head{
  display:flex; align-items:center; gap:16px; margin-bottom:26px;
}
.ms-sec__head h2{
  font-family:'Cinzel',serif; font-weight:600; font-size:clamp(1.3rem,3vw,1.8rem);
  color:var(--ms-royal-deep); margin:0; white-space:nowrap;
}
.ms-sec__head::after{content:""; flex:1; height:1px; background:var(--ms-vellum)}

/* ============ SERIES GRID ============ */
.ms-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:18px}
.ms-grid--3{
  grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:16px;
}
/* Messages: roomy editorial cards — 2-up on desktop, 1-up on mobile (never tiny) */
.ms-grid--msgs{
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:24px;
}
@media (max-width:900px){
  .ms-grid--3{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:640px){
  .ms-grid--msgs{grid-template-columns:1fr; gap:16px}
  /* Keep art a touch under the featured lead (~220px) */
  .ms-grid--msgs .ms-msg-card__art{
    aspect-ratio:auto;
    min-height:168px;
  }
}
@media (max-width:560px){
  .ms-grid--3{grid-template-columns:1fr}
}
@media (max-width:480px){
  .ms-grid{grid-template-columns:1fr; gap:14px}
}

.ms-series-card{
  position:relative; cursor:pointer; text-align:left; font-family:inherit; padding:0;
  border-radius:18px; overflow:hidden; border:1px solid var(--ms-vellum);
  aspect-ratio:16/10; box-shadow:var(--ms-shadow-sm);
  background:linear-gradient(150deg,var(--ms-royal-deep),var(--ms-royal) 60%,var(--ms-lavender));
  transition:transform .4s var(--ms-ease), box-shadow .4s var(--ms-ease), border-color .4s;
}
.ms-series-card:hover{transform:translateY(-6px); box-shadow:var(--ms-shadow), var(--ms-glow-gold); border-color:var(--ms-gold-soft)}
.ms-series-card img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1}
.ms-series-card__veil{
  position:absolute; inset:0; z-index:2;
  background:linear-gradient(to top, rgba(43,26,52,.9) 0%, rgba(43,26,52,.35) 50%, rgba(43,26,52,.08) 100%);
  pointer-events:none;
}
.ms-series-card__badge{
  position:absolute; top:16px; right:16px; z-index:3;
  font-family:'Crimson Pro',serif; font-size:.64rem; font-weight:600; letter-spacing:.2em;
  text-transform:uppercase; color:#fdf8ef;
  background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep));
  border:1px solid rgba(228,201,138,.4); border-radius:999px; padding:6px 14px;
}
.ms-series-card__body{position:absolute; left:0; right:0; bottom:0; z-index:3; padding:22px 24px; color:#fdf8ef}
.ms-series-card__title{
  font-family:'Cinzel',serif; font-weight:600; font-size:1.16rem; line-height:1.25;
  text-shadow:0 2px 14px rgba(0,0,0,.4);
}
.ms-series-card__meta{
  display:flex; align-items:center; gap:14px; margin-top:10px;
  font-family:'Crimson Pro',serif; font-size:.74rem; letter-spacing:.08em; color:#e7dcc7;
}
.ms-series-card__meta span{display:inline-flex; align-items:center; gap:6px}
.ms-series-card__meta svg{width:13px; height:13px; opacity:.85}
.ms-series-card__go{
  position:absolute; bottom:20px; right:22px; z-index:3;
  width:36px; height:36px; border-radius:50%;
  background:linear-gradient(135deg,var(--ms-gold-rich),var(--ms-gold));
  display:flex; align-items:center; justify-content:center; color:var(--ms-royal-deep);
  box-shadow:0 4px 14px -6px rgba(200,154,67,.7);
}
.ms-series-card__go svg{width:15px; height:15px}

/* ============ MESSAGE CARDS (editorial) ============ */
.ms-msg-card{
  position:relative; display:flex; flex-direction:column; cursor:pointer; text-align:left;
  font-family:inherit; padding:0; border-radius:18px; overflow:hidden; width:100%;
  border:1px solid var(--ms-vellum); background:var(--ms-milk); box-shadow:var(--ms-shadow-sm);
  transition:transform .4s var(--ms-ease), box-shadow .4s var(--ms-ease), border-color .4s;
}
.ms-msg-card:hover{transform:translateY(-6px); box-shadow:var(--ms-shadow), var(--ms-glow-gold); border-color:var(--ms-gold-soft)}
.ms-msg-card__art{
  position:relative; aspect-ratio:1/1; overflow:hidden;
  background:linear-gradient(150deg,var(--ms-royal-deep),var(--ms-royal) 60%,var(--ms-lavender));
}
.ms-msg-card__art img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; transition:transform .8s var(--ms-ease)}
.ms-msg-card:hover .ms-msg-card__art img{transform:scale(1.05)}
.ms-msg-card__crest{position:absolute; inset:0; z-index:1; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:2.4rem; color:rgba(228,201,138,.2)}
.ms-msg-card__actions{position:absolute; top:12px; right:12px; z-index:3; display:flex; gap:8px}
.ms-msg-card__listen{
  position:absolute; left:12px; bottom:12px; z-index:3;
}
.ms-msg-card--playing{border-color:var(--ms-gold-soft); box-shadow:var(--ms-shadow), var(--ms-glow-gold)}
.ms-listen-btn{
  display:inline-flex; align-items:center; gap:8px;
  font-family:'Cinzel',serif; font-size:.72rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
  color:#241a08; background:linear-gradient(135deg,var(--ms-gold-soft),var(--ms-gold));
  border:1px solid rgba(255,255,255,.35); border-radius:999px; padding:.55rem 1rem; cursor:pointer;
  box-shadow:0 10px 24px -14px rgba(0,0,0,.45);
  transition:transform .25s var(--ms-ease), filter .25s;
}
.ms-listen-btn:hover{transform:translateY(-1px); filter:brightness(1.05)}
.ms-listen-btn[aria-pressed="true"]{background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:var(--ms-gold-soft)}
.ms-listen-btn svg{width:16px; height:16px}
.ms-detail-listen{margin:14px 0 0}
.ms-icon-btn{
  width:34px; height:34px; border-radius:50%; border:1px solid var(--ms-vellum);
  background:rgba(255,253,248,.9); display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--ms-royal); box-shadow:var(--ms-shadow-sm);
  transition:background .25s, transform .25s var(--ms-ease), border-color .25s;
}
.ms-icon-btn:hover{transform:scale(1.08); border-color:var(--ms-gold-soft); background:#fff}
.ms-icon-btn svg{width:15px; height:15px}
.ms-msg-card__body{padding:20px 22px 22px; display:flex; flex-direction:column; flex:1}
.ms-msg-card__title{
  font-family:'Cinzel',serif; font-weight:600; font-size:1.05rem; line-height:1.3;
  color:var(--ms-royal-deep);
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.ms-msg-card__author{
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1rem;
  color:var(--ms-ink-soft); margin-top:8px;
}
.ms-msg-card__foot{
  display:flex; align-items:center; justify-content:space-between; margin-top:14px;
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.08em; color:var(--ms-cocoa);
}
.ms-msg-card__foot .ms-dur{display:inline-flex; align-items:center; gap:6px}
.ms-msg-card__foot svg{width:13px; height:13px; color:var(--ms-gold)}

/* ============ PODCAST HERO + SUBTABS ============ */
.ms-pod-hero{
  position:relative; border-radius:20px; overflow:hidden; min-height:230px;
  display:flex; align-items:flex-end; box-shadow:var(--ms-shadow);
  border:1px solid var(--ms-vellum);
  background:linear-gradient(140deg,#1f3a52,#2a5a73 60%,var(--ms-royal));
}
.ms-pod-hero img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover}
.ms-pod-hero__veil{position:absolute; inset:0; background:linear-gradient(to top, rgba(25,20,45,.86), rgba(25,20,45,.2))}
.ms-pod-hero__body{position:relative; z-index:2; padding:28px 30px; color:#fdf8ef}
.ms-pod-hero__body h2{font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1.6rem,4vw,2.3rem); margin:0}
.ms-pod-hero__body p{font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.1rem; margin:6px 0 0; color:#e7dcc7}
/* Fresh from the Spirit banner hero \\u2014 responsive, shows the full banner cleanly */
.ms-pod-hero--banner{min-height:0; display:block; background:transparent; border:none; box-shadow:none; border-radius:18px; overflow:hidden; line-height:0}
.ms-pod-hero--banner .ms-pod-hero__img{position:static; width:100%; height:auto; display:block; border-radius:18px; object-fit:unset; inset:auto}
.ms-pod-sub{text-align:center; margin:18px auto 0; max-width:44rem}
.ms-pod-sub__tag{font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.16rem; color:var(--ms-ink-soft); margin:0}
/* visible follow-the-show buttons */
.ms-pod-follow{display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:16px}
.ms-follow-btn{
  display:inline-flex; align-items:center; gap:8px;
  font-family:'Crimson Pro',serif; font-size:.78rem; letter-spacing:.14em; text-transform:uppercase;
  color:var(--ms-royal); background:var(--ms-milk);
  border:1px solid var(--ms-gold-soft); border-radius:999px;
  padding:10px 18px; text-decoration:none;
  box-shadow:var(--ms-shadow-sm); transition:all .3s var(--ms-ease);
}
.ms-follow-btn svg{width:14px; height:14px; color:var(--ms-gold)}
.ms-follow-btn:hover{border-color:var(--ms-royal); color:var(--ms-royal-deep); transform:translateY(-1px)}
.ms-subscribe--light{justify-content:center}
.ms-sub-btn--dark{color:var(--ms-royal); background:var(--ms-milk); border:1px solid var(--ms-vellum)}
.ms-sub-btn--dark:hover{border-color:var(--ms-gold-soft); background:#fff; transform:translateY(-1px)}
.ms-subtabs{display:flex; gap:28px; border-bottom:1px solid var(--ms-vellum); margin:24px 0 0}
.ms-subtab{
  border:none; background:none; cursor:pointer; padding:0 2px 14px;
  font-family:'Crimson Pro',serif; font-size:.9rem; letter-spacing:.1em; text-transform:uppercase;
  color:var(--ms-ink-soft); position:relative; transition:color .3s;
}
.ms-subtab:hover{color:var(--ms-royal)}
.ms-subtab--on{color:var(--ms-royal-deep)}
.ms-subtab--on::after{content:""; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:var(--ms-gold); border-radius:2px}

/* ============ PODCAST EPISODE CARDS ============ */
.ms-eps{display:flex; flex-direction:column; gap:18px; margin-top:24px}
.ms-ep{
  display:grid; grid-template-columns:120px 1fr; gap:22px; align-items:center;
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:16px;
  padding:16px; box-shadow:var(--ms-shadow-sm);
  transition:transform .3s var(--ms-ease), box-shadow .3s var(--ms-ease), border-color .3s;
}
.ms-ep:hover{transform:translateY(-3px); box-shadow:var(--ms-shadow-sm), var(--ms-glow-gold); border-color:var(--ms-gold-soft)}
@media (max-width:560px){ .ms-ep{grid-template-columns:84px 1fr; gap:16px} }
.ms-ep__art{width:100%; aspect-ratio:1/1; border-radius:12px; overflow:hidden; background:var(--ms-champagne)}
.ms-ep__art img{width:100%; height:100%; object-fit:cover}
.ms-ep__kicker{font-family:'Crimson Pro',serif; font-size:.7rem; letter-spacing:.2em; text-transform:uppercase; color:var(--ms-gold)}
.ms-ep__title{font-family:'Cinzel',serif; font-weight:600; font-size:1.14rem; color:var(--ms-royal-deep); margin:4px 0 12px}
.ms-player{
  display:flex; align-items:center; gap:12px; background:var(--ms-linen);
  border:1px solid var(--ms-vellum); border-radius:999px; padding:8px 16px 8px 8px;
}
.ms-player__play{
  width:38px; height:38px; border-radius:50%; flex:none; border:none; cursor:pointer;
  background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep));
  color:var(--ms-gold-soft); display:flex; align-items:center; justify-content:center;
  box-shadow:var(--ms-shadow-sm); transition:filter .25s, transform .25s}
.ms-player__play:hover{filter:brightness(1.1); transform:scale(1.05)}
.ms-player__play svg{width:15px; height:15px; margin-left:2px}
.ms-player__track{flex:1; height:5px; border-radius:999px; background:var(--ms-vellum); position:relative; overflow:hidden}
.ms-player__fill{position:absolute; left:0; top:0; bottom:0; width:0%; background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-rich)); transition:width .2s linear}
.ms-player__time{font-family:'Crimson Pro',serif; font-size:.74rem; color:var(--ms-ink-soft); min-width:78px; text-align:right}

/* ============ PAGINATION ============ */
.ms-pager{display:flex; align-items:center; justify-content:center; gap:8px; margin:36px 0 0; flex-wrap:wrap}
.ms-pager button{
  font-family:'Crimson Pro',serif; font-size:.8rem; letter-spacing:.14em; text-transform:uppercase;
  color:var(--ms-royal); background:var(--ms-milk); border:1px solid var(--ms-vellum);
  border-radius:999px; padding:10px 18px; cursor:pointer; transition:all .25s var(--ms-ease);
}
.ms-bgtoggle.is-inband{opacity:1; visibility:visible; pointer-events:auto; transform:translateY(0)}
.ms-pager button:hover:not(:disabled):not(.ms-pager__num--on){border-color:var(--ms-gold-soft); color:var(--ms-royal-deep); box-shadow:var(--ms-shadow-sm)}
.ms-pager button:disabled{opacity:.4; cursor:default}
.ms-pager__num{min-width:44px; text-align:center; padding:10px 0}
.ms-pager__num--on{
  background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep));
  color:var(--ms-gold-soft); border-color:transparent; cursor:default;
}
.ms-pager__ellipsis{color:var(--ms-ink-soft); padding:0 4px}

/* ============ DETAIL VIEWS ============ */
.ms-back{
  display:inline-flex; align-items:center; gap:9px; margin:0 0 24px;
  font-family:'Crimson Pro',serif; font-size:.8rem; letter-spacing:.16em; text-transform:uppercase;
  color:var(--ms-royal); background:none; border:none; cursor:pointer; transition:color .25s;
}
.ms-back:hover{color:var(--ms-royal-deep)}
.ms-back svg{width:14px; height:14px}
/* top back link now sits UNDER the hero banner on every detail page,
   with clear breathing room below the header */
.ms-back--top{margin:30px 0 0}

.ms-detail-hero{
  position:relative; border-radius:20px; overflow:hidden; min-height:280px;
  display:flex; align-items:flex-end; box-shadow:var(--ms-shadow); border:1px solid var(--ms-vellum);
  background:linear-gradient(150deg,var(--ms-royal-deep),var(--ms-royal) 60%,var(--ms-lavender));
}
.ms-detail-hero img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover}
.ms-detail-hero__veil{position:absolute; inset:0; background:linear-gradient(to top, rgba(43,26,52,.9), rgba(43,26,52,.25))}
.ms-detail-hero__body{position:relative; z-index:2; padding:30px 34px; color:#fdf8ef}
.ms-detail-hero__kicker{font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.24em; text-transform:uppercase; color:var(--ms-gold-soft)}
.ms-detail-hero__title{font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1.7rem,4vw,2.6rem); margin:10px 0 0; text-shadow:0 2px 18px rgba(0,0,0,.4)}
.ms-detail-hero__meta{display:flex; flex-wrap:wrap; gap:10px 22px; margin-top:14px; font-family:'Crimson Pro',serif; font-size:.82rem; color:#e7dcc7}
.ms-detail-hero__meta span{display:inline-flex; align-items:center; gap:7px}
.ms-detail-hero__meta svg{width:14px; height:14px; opacity:.85}

.ms-detail-layout{display:grid; grid-template-columns:1fr 340px; gap:38px; margin-top:34px; align-items:start}
.ms-detailwrap{padding-bottom:8px}
@media(min-width:861px){.ms-detail-layout{align-items:start}.ms-detail-layout>.ms-detailmain{align-self:start}}
@media (max-width:980px){ .ms-detail-layout{grid-template-columns:1fr} }

.ms-overview{font-size:1.14rem; line-height:1.75; color:var(--ms-ink)}
.ms-overview p{margin:0 0 1.1em}

.ms-block{margin-top:36px}
.ms-block__head{
  font-family:'Cinzel',serif; font-weight:600; font-size:1.15rem; color:var(--ms-royal-deep);
  display:flex; align-items:center; gap:14px; margin-bottom:18px;
}
.ms-block__head::before{content:""; width:24px; height:2px; background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-soft))}

/* lesson cards */
.ms-lessons{display:flex; flex-direction:column; gap:14px}
.ms-lesson{
  display:grid; grid-template-columns:52px 1fr auto; gap:18px; align-items:center;
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:14px;
  padding:16px 20px; cursor:pointer; text-align:left; font-family:inherit; width:100%;
  transition:transform .3s var(--ms-ease), box-shadow .3s var(--ms-ease), border-color .3s;
}
.ms-lesson:hover{transform:translateX(4px); box-shadow:var(--ms-shadow-sm); border-color:var(--ms-gold-soft)}
.ms-lesson--on{border-color:var(--ms-gold); background:linear-gradient(135deg,rgba(200,154,67,.1),rgba(138,99,169,.05) 60%,var(--ms-milk))}
.ms-lesson__num{
  width:52px; height:52px; border-radius:12px; flex:none; display:flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-weight:600; font-size:1.1rem; color:var(--ms-gold-soft);
  background:linear-gradient(140deg,var(--ms-royal),var(--ms-royal-deep));
}
.ms-lesson__title{font-family:'Cinzel',serif; font-weight:600; font-size:1.02rem; color:var(--ms-royal-deep)}
.ms-lesson__sub{font-family:'Cormorant Garamond',serif; font-style:italic; font-size:.98rem; color:var(--ms-ink-soft); margin-top:3px}
.ms-lesson__play{width:34px; height:34px; border-radius:50%; background:var(--ms-linen); border:1px solid var(--ms-vellum); display:flex; align-items:center; justify-content:center; color:var(--ms-royal)}
.ms-lesson__play svg{width:14px; height:14px; margin-left:1px}

/* audio player bar (message detail) */
.ms-audiobar{
  display:flex; align-items:center; gap:16px; background:var(--ms-milk);
  border:1px solid var(--ms-vellum); border-radius:16px; padding:16px 20px;
  box-shadow:var(--ms-shadow-sm); margin-top:8px;
}
.ms-audiobar__play{
  width:52px; height:52px; border-radius:50%; flex:none; border:none; cursor:pointer;
  background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:var(--ms-gold-soft);
  display:flex; align-items:center; justify-content:center; box-shadow:var(--ms-shadow-sm);
  transition:filter .25s, transform .25s;
}
.ms-audiobar__play:hover{filter:brightness(1.1); transform:scale(1.05)}
.ms-audiobar__play svg{width:20px; height:20px; margin-left:2px}
.ms-audiobar__mid{flex:1}
.ms-audiobar__track{height:6px; border-radius:999px; background:var(--ms-vellum); position:relative; overflow:hidden; cursor:pointer}
.ms-audiobar__fill{position:absolute; left:0; top:0; bottom:0; width:0%; background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-rich))}
.ms-audiobar__time{display:flex; justify-content:space-between; margin-top:8px; font-family:'Crimson Pro',serif; font-size:.74rem; color:var(--ms-ink-soft)}

/* downloads */
.ms-downloads{display:flex; flex-wrap:wrap; gap:12px}
.ms-dl{
  display:inline-flex; align-items:center; gap:10px;
  font-family:'Crimson Pro',serif; font-size:.78rem; letter-spacing:.12em; text-transform:uppercase;
  color:var(--ms-royal); background:var(--ms-milk); border:1px solid var(--ms-vellum);
  border-radius:999px; padding:11px 20px; cursor:pointer; text-decoration:none;
  transition:all .25s var(--ms-ease);
}
.ms-dl:hover{border-color:var(--ms-gold-soft); color:var(--ms-royal-deep); box-shadow:var(--ms-shadow-sm), var(--ms-glow-gold); transform:translateY(-1px)}
.ms-dl svg{width:15px; height:15px}
@media (max-width:640px){
  .ms-downloads{gap:8px}
  .ms-dl{padding:8px 13px; font-size:.68rem; gap:6px; letter-spacing:.08em}
  .ms-dl svg{width:12px; height:12px}
}

/* transcript */
.ms-transcript{font-size:1.1rem; line-height:1.8; color:var(--ms-ink)}
.ms-transcript p{margin:0 0 1em}

/* scripture chips */
.ms-scriptures{display:flex; flex-wrap:wrap; gap:10px}
.ms-scripture{
  font-family:'Crimson Pro',serif; font-size:.82rem; letter-spacing:.04em;
  color:var(--ms-royal-deep); background:linear-gradient(135deg,rgba(200,154,67,.12),rgba(200,154,67,.04));
  border:1px solid var(--ms-gold-soft); border-radius:999px; padding:8px 16px;
}

/* reflection / prayer */
.ms-reflect{list-style:none; padding:0; margin:0; counter-reset:r}
.ms-reflect li{
  position:relative; padding:14px 0 14px 44px; border-bottom:1px solid var(--ms-vellum);
  font-size:1.08rem; line-height:1.55; color:var(--ms-ink);
}
.ms-reflect li:last-child{border-bottom:none}
.ms-reflect li::before{
  counter-increment:r; content:counter(r);
  position:absolute; left:0; top:12px; width:28px; height:28px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-size:.82rem; color:var(--ms-gold-soft);
  background:linear-gradient(140deg,var(--ms-royal),var(--ms-royal-deep));
}
.ms-prayer{
  padding:22px 26px; border-radius:14px; border-left:3px solid var(--ms-gold);
  background:linear-gradient(135deg,rgba(138,99,169,.07),rgba(200,154,67,.04));
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.14rem; line-height:1.6; color:var(--ms-ink);
}

/* sidebar */
.ms-side{position:sticky; top:24px; display:flex; flex-direction:column; gap:26px; max-height:calc(100vh - 48px); overflow:auto; scrollbar-width:none}
.ms-side::-webkit-scrollbar{display:none}
@media (max-width:980px){ .ms-side{position:static} }
.ms-side__head{
  font-family:'Cinzel',serif; font-weight:600; font-size:1.05rem; letter-spacing:.06em;
  color:var(--ms-royal-deep); display:flex; align-items:center; gap:12px; margin-bottom:16px;
}
.ms-side__head::after{content:""; flex:1; height:1px; background:var(--ms-vellum)}
.ms-side-card{
  display:grid; grid-template-columns:64px 1fr; gap:14px; align-items:center;
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:14px;
  padding:12px; cursor:pointer; text-align:left; font-family:inherit; width:100%; margin-bottom:12px;
  transition:transform .3s var(--ms-ease), box-shadow .3s var(--ms-ease), border-color .3s;
}
.ms-side-card:hover{transform:translateX(3px); box-shadow:var(--ms-shadow-sm); border-color:var(--ms-gold-soft)}
.ms-side-card__art{width:64px; height:64px; border-radius:10px; overflow:hidden; flex:none; background:linear-gradient(140deg,var(--ms-royal),var(--ms-royal-deep))}
.ms-side-card__art img{width:100%; height:100%; object-fit:cover}
.ms-side-card__title{font-family:'Cinzel',serif; font-weight:600; font-size:.92rem; color:var(--ms-royal-deep); line-height:1.25}
.ms-side-card__sub{font-family:'Cormorant Garamond',serif; font-style:italic; font-size:.9rem; color:var(--ms-ink-soft); margin-top:3px}

/* empty state */
.ms-empty{
  text-align:center; padding:60px 20px; background:var(--ms-milk);
  border:1px solid var(--ms-vellum); border-radius:16px;
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.2rem; color:var(--ms-ink-soft);
}

/* view switching */
.ms-view{display:none}
.ms-view--on{display:block; animation:msFade .5s var(--ms-ease)}
@keyframes msFade{from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)}}
.ms-anim{animation:msFadeUp .55s var(--ms-ease) both}
@media (prefers-reduced-motion:reduce){.ms-anim{animation:none}}
@keyframes msFadeUp{from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:translateY(0)}}

/* card progress bar */
.ms-cardprog{margin-top:12px; height:5px; border-radius:999px; background:rgba(255,255,255,.25); overflow:hidden}
.ms-cardprog__fill{height:100%; background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-rich)); border-radius:999px}

/* series detail progress panel */
.ms-progpanel{
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:16px;
  padding:22px 24px; box-shadow:var(--ms-shadow-sm); margin-top:8px;
}
.ms-progpanel__top{display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap}
.ms-progpanel__label{font-family:'Cinzel',serif; font-weight:600; font-size:1rem; color:var(--ms-royal-deep)}
.ms-progpanel__stat{font-family:'Crimson Pro',serif; font-size:.82rem; letter-spacing:.06em; color:var(--ms-ink-soft)}
.ms-progpanel__track{height:8px; border-radius:999px; background:var(--ms-vellum); overflow:hidden; margin:14px 0}
.ms-progpanel__fill{height:100%; background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-rich)); border-radius:999px; transition:width .5s var(--ms-ease)}
.ms-continue{
  display:inline-flex; align-items:center; gap:10px; margin-top:6px;
  font-family:'Crimson Pro',serif; font-size:.76rem; font-weight:600; letter-spacing:.16em; text-transform:uppercase;
  color:var(--ms-gold-soft); background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep));
  border:1px solid rgba(200,154,67,.4); border-radius:999px; padding:11px 22px; cursor:pointer;
  transition:filter .25s, transform .2s;
}
.ms-continue:hover{filter:brightness(1.08); transform:translateY(-1px)}
.ms-continue svg{width:14px; height:14px}
.ms-lesson__check{color:var(--ms-gold)}

/* study companion key ideas / quotes / application */
.ms-ideas{list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px}
.ms-ideas li{
  position:relative; padding:14px 18px 14px 46px; border-radius:12px;
  background:var(--ms-milk); border:1px solid var(--ms-vellum);
  font-size:1.06rem; line-height:1.5; color:var(--ms-ink);
}
.ms-ideas li::before{
  content:""; position:absolute; left:18px; top:20px; width:12px; height:12px; border-radius:50%;
  background:linear-gradient(135deg,var(--ms-gold),var(--ms-gold-rich));
}
.ms-quote{
  margin:0 0 14px; padding:18px 24px; border-left:3px solid var(--ms-gold);
  background:linear-gradient(135deg,rgba(138,99,169,.06),rgba(200,154,67,.04));
  font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.16rem; line-height:1.5; color:var(--ms-ink);
}
.ms-quote::before{content:"\\\\201C"; color:var(--ms-gold); font-family:'Cinzel',serif; font-size:1.4rem; margin-right:4px}
.ms-apply{
  padding:20px 24px; border-radius:14px;
  background:linear-gradient(135deg,rgba(200,154,67,.1),rgba(200,154,67,.03));
  border:1px solid var(--ms-gold-soft); font-size:1.08rem; line-height:1.6; color:var(--ms-ink);
}
.ms-reading{list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px}
.ms-reading li{display:flex; align-items:center; gap:10px; font-size:1.05rem; color:var(--ms-ink)}
.ms-reading li svg{width:15px; height:15px; color:var(--ms-gold); flex:none}

/* clickable scripture */
.ms-scripture{cursor:pointer; transition:background .25s, border-color .25s}
.ms-scripture:hover{border-color:var(--ms-gold); background:linear-gradient(135deg,rgba(200,154,67,.2),rgba(200,154,67,.08))}

/* Continue Your Journey rail */
.ms-journey{display:grid; grid-template-columns:repeat(3,1fr); gap:16px}
@media (max-width:760px){ .ms-journey{grid-template-columns:1fr} }
.ms-journey-card{
  display:block; text-align:left; text-decoration:none; cursor:pointer; font-family:inherit;
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:14px; padding:18px 20px;
  box-shadow:var(--ms-shadow-sm); transition:transform .3s var(--ms-ease), box-shadow .3s var(--ms-ease), border-color .3s;
}
.ms-journey-card:hover{transform:translateY(-4px); box-shadow:var(--ms-shadow-sm), var(--ms-glow-gold); border-color:var(--ms-gold-soft)}
.ms-journey-card__kind{font-family:'Crimson Pro',serif; font-size:.66rem; letter-spacing:.2em; text-transform:uppercase; color:var(--ms-gold)}
.ms-journey-card__title{font-family:'Cinzel',serif; font-weight:600; font-size:1rem; color:var(--ms-royal-deep); line-height:1.3; margin-top:8px}
.ms-journey-card__go{display:inline-flex; align-items:center; gap:7px; margin-top:12px; font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; color:var(--ms-royal)}
.ms-journey-card__go svg{width:12px; height:12px}

/* bookmark button (message detail) */
.ms-bookmark-btn.ms-dl.ms-on{background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:var(--ms-gold-soft); border-color:transparent}

/* audio advanced controls */
.ms-audio-adv{display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:14px}
.ms-chip-btn{
  font-family:'Crimson Pro',serif; font-size:.74rem; letter-spacing:.08em;
  color:var(--ms-royal); background:var(--ms-linen); border:1px solid var(--ms-vellum);
  border-radius:999px; padding:8px 14px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;
  transition:all .25s var(--ms-ease);
}
.ms-chip-btn:hover{border-color:var(--ms-gold-soft); color:var(--ms-royal-deep)}
.ms-chip-btn.ms-on{background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:var(--ms-gold-soft); border-color:transparent}
.ms-chip-btn svg{width:14px; height:14px}

/* recently viewed sidebar reuse ms-side-card */
.ms-side-empty{font-family:'Cormorant Garamond',serif; font-style:italic; color:var(--ms-ink-soft); font-size:.98rem; padding:6px 2px}

/* filter + sort + saved controls */
.ms-controls2{display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap; margin-bottom:26px}
.ms-chips{display:flex; flex-wrap:wrap; gap:8px}
.ms-chip{
  font-family:'Crimson Pro',serif; font-size:.76rem; letter-spacing:.1em; text-transform:uppercase;
  color:var(--ms-ink-soft); background:var(--ms-milk); border:1px solid var(--ms-vellum);
  border-radius:999px; padding:8px 16px; cursor:pointer; transition:all .25s var(--ms-ease);
}
.ms-chip:hover{border-color:var(--ms-gold-soft); color:var(--ms-royal)}
.ms-chip--on{background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:#fdf8ef; border-color:transparent}
.ms-controls2__right{display:flex; align-items:center; gap:14px}
.ms-saved-tab{
  display:inline-flex; align-items:center; gap:8px;
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase;
  color:var(--ms-royal); background:var(--ms-milk); border:1px solid var(--ms-vellum);
  border-radius:999px; padding:9px 16px; cursor:pointer; transition:all .25s var(--ms-ease);
}
.ms-saved-tab svg{width:14px; height:14px}
.ms-saved-tab:hover{border-color:var(--ms-gold-soft)}
.ms-saved-tab--on{background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:var(--ms-gold-soft); border-color:transparent}
.ms-sort{display:inline-flex; align-items:center; gap:8px; font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:var(--ms-ink-soft)}
.ms-sort select{
  font-family:'Cormorant Garamond',serif; font-size:1rem; color:var(--ms-ink);
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:10px;
  padding:8px 12px; cursor:pointer;
}
.ms-icon-btn--on{background:#fff; border-color:var(--ms-gold-soft)}
.ms-icon-btn--on svg{color:var(--ms-gold); fill:var(--ms-gold)}

/* featured lead card */
.ms-featured-card{
  display:grid; grid-template-columns:300px 1fr; gap:0; width:100%; text-align:left;
  border-radius:20px; overflow:hidden; cursor:pointer; font-family:inherit; padding:0;
  border:1px solid rgba(200,154,67,.34); background:var(--ms-milk); box-shadow:var(--ms-shadow);
  margin-bottom:28px; transition:transform .4s var(--ms-ease), box-shadow .4s var(--ms-ease), border-color .4s;
}
.ms-featured-card:hover{transform:translateY(-5px); box-shadow:var(--ms-shadow), var(--ms-glow-gold); border-color:var(--ms-gold-soft)}
@media (max-width:720px){ .ms-featured-card{grid-template-columns:1fr} }
.ms-featured-card__art{
  position:relative; min-height:220px;
  background:linear-gradient(150deg,var(--ms-royal-deep),var(--ms-royal) 60%,var(--ms-lavender));
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
}
.ms-featured-card__art img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; z-index:1}
.ms-featured-card__crest{font-family:'Cinzel',serif; font-size:3rem; letter-spacing:.2em; color:rgba(228,201,138,.22); position:relative; z-index:1}
.ms-featured-card__badge{
  position:absolute; top:18px; left:18px; z-index:2;
  font-family:'Crimson Pro',serif; font-size:.62rem; font-weight:600; letter-spacing:.2em; text-transform:uppercase;
  color:var(--ms-royal-deep); background:linear-gradient(135deg,var(--ms-gold-rich),var(--ms-gold-soft));
  border-radius:999px; padding:7px 15px; box-shadow:0 4px 14px -6px rgba(200,154,67,.7);
}
.ms-featured-card__body{padding:clamp(24px,3vw,38px); display:flex; flex-direction:column; justify-content:center}
.ms-featured-card__title{font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1.4rem,2.6vw,2rem); color:var(--ms-royal-deep); line-height:1.2}
.ms-featured-card__sub{font-family:'Cormorant Garamond',serif; font-size:1.14rem; line-height:1.5; color:var(--ms-ink-soft); margin-top:12px}
.ms-featured-card__meta{font-family:'Crimson Pro',serif; font-size:.78rem; letter-spacing:.06em; color:var(--ms-cocoa); margin-top:14px}
.ms-featured-card__go{display:inline-flex; align-items:center; gap:9px; margin-top:20px; font-family:'Crimson Pro',serif; font-size:.74rem; font-weight:600; letter-spacing:.2em; text-transform:uppercase; color:var(--ms-royal); transition:gap .3s var(--ms-ease)}
.ms-featured-card:hover .ms-featured-card__go{gap:13px}
.ms-featured-card__go svg{width:13px; height:13px}

/* continue listening rail */
.ms-continue-rail{margin:0 0 30px; padding:22px 24px; border-radius:18px; background:linear-gradient(135deg,rgba(91,53,122,.07),rgba(200,154,67,.04)); border:1px solid var(--ms-vellum)}
.ms-continue-rail__head{position:relative; display:flex; align-items:center; gap:10px; font-family:'Cinzel',serif; font-weight:600; font-size:1.05rem; color:var(--ms-royal-deep); margin-bottom:16px}
.ms-continue-rail__head svg{width:16px; height:16px; color:var(--ms-gold)}
.ms-continue-rail__close{
  position:absolute; top:50%; right:0; transform:translateY(-50%);
  width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center;
  background:var(--ms-milk); border:1px solid var(--ms-gold-soft); border-radius:50%;
  color:var(--ms-royal); cursor:pointer; padding:0; transition:all .25s var(--ms-ease);
}
.ms-continue-rail__close svg{width:16px !important; height:16px !important; color:var(--ms-royal)}
.ms-continue-rail__close:hover{border-color:var(--ms-royal); color:var(--ms-royal-deep); background:#fff}
.ms-continue-rail__row{display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px}
.ms-continue-chip{text-align:left; font-family:inherit; cursor:pointer; background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:14px; padding:16px 18px; transition:transform .3s var(--ms-ease), box-shadow .3s var(--ms-ease), border-color .3s}
.ms-continue-chip:hover{transform:translateY(-3px); box-shadow:var(--ms-shadow-sm); border-color:var(--ms-gold-soft)}
.ms-continue-chip__title{font-family:'Cinzel',serif; font-weight:600; font-size:.98rem; color:var(--ms-royal-deep); line-height:1.25}
.ms-continue-chip__bar{height:5px; border-radius:999px; background:var(--ms-vellum); overflow:hidden; margin:12px 0 8px}
.ms-continue-chip__bar div{height:100%; background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-rich)); border-radius:999px}
.ms-continue-chip__meta{font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.06em; color:var(--ms-ink-soft)}

/* reading zones: selection disabled */
.ms-overview, .ms-transcript, .ms-prayer, .ms-apply, .ms-quote, .ms-ideas, .ms-reflect, .ms-detail-hero__title{
  -webkit-user-select:none; -moz-user-select:none; user-select:none;
}

/* watch/listen toggle */
.ms-mediatoggle{display:inline-flex; gap:6px; background:var(--ms-linen); border:1px solid var(--ms-vellum); border-radius:999px; padding:6px; margin-bottom:16px}
.ms-mt-btn{border:none; background:none; cursor:pointer; font-family:'Crimson Pro',serif; font-size:.8rem; letter-spacing:.08em; text-transform:uppercase; color:var(--ms-ink-soft); padding:9px 18px; border-radius:999px; display:inline-flex; align-items:center; gap:8px; transition:all .25s var(--ms-ease)}
.ms-mt-btn svg{width:15px; height:15px}
.ms-mt-btn--on{background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:var(--ms-gold-soft)}
.ms-videowrap{border-radius:16px; overflow:hidden; border:1px solid var(--ms-vellum)}
.ms-video-embed{aspect-ratio:16/9; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; background:linear-gradient(150deg,var(--ms-royal-deep),var(--ms-royal)); color:var(--ms-gold-soft); font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.05rem; text-align:center; padding:20px}
.ms-video-embed svg{width:40px; height:40px}

/* transcript panel */
.ms-transcript-toggle{
  display:inline-flex; align-items:center; gap:10px; font-family:'Crimson Pro',serif; font-size:.78rem;
  letter-spacing:.12em; text-transform:uppercase; color:var(--ms-royal); background:var(--ms-milk);
  border:1px solid var(--ms-vellum); border-radius:999px; padding:11px 20px; cursor:pointer; transition:all .25s var(--ms-ease);
}
.ms-transcript-toggle:hover{border-color:var(--ms-gold-soft); color:var(--ms-royal-deep)}
.ms-transcript-toggle svg{width:14px; height:14px}
.ms-transcript{margin-top:16px; font-size:1.1rem; line-height:1.8; color:var(--ms-ink)}
.ms-transcript p{margin:0 0 1em}
.ms-cms-note{font-style:italic; color:var(--ms-ink-soft)}

/* personal notes */
.ms-notes textarea{
  width:100%; min-height:120px; resize:vertical; font-family:'Cormorant Garamond',serif; font-size:1.1rem;
  color:var(--ms-ink); background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:14px;
  padding:16px 18px; outline:none; transition:border-color .25s, box-shadow .25s;
}
.ms-notes textarea:focus{border-color:var(--ms-royal); box-shadow:var(--ms-glow-gold)}
.ms-notes__foot{display:flex; align-items:center; justify-content:space-between; gap:14px; margin-top:12px; flex-wrap:wrap}
.ms-notes__hint{font-family:'Crimson Pro',serif; font-size:.74rem; color:var(--ms-ink-soft)}

/* collapsible study blocks (dropdown) \\u2014 all collapsed by default */
.ms-collapse{border:1px solid var(--ms-vellum); border-radius:14px; background:var(--ms-milk); overflow:hidden; margin-bottom:14px}
.ms-collapse__head{
  width:100%; display:flex; align-items:center; justify-content:space-between; gap:14px;
  background:none; border:none; cursor:pointer; text-align:left; padding:18px 22px;
  font-family:'Cinzel',serif; font-weight:600; font-size:1.08rem; color:var(--ms-royal-deep);
  transition:background .25s;
}
.ms-collapse__head:hover{background:linear-gradient(135deg,rgba(91,53,122,.04),rgba(200,154,67,.03))}
.ms-collapse__chev{width:20px; height:20px; flex:none; color:var(--ms-gold); transition:transform .3s var(--ms-ease)}
.ms-collapse__head[aria-expanded="true"] .ms-collapse__chev{transform:rotate(90deg)}
.ms-collapse__body{max-height:0; overflow:hidden; transition:max-height .4s var(--ms-ease)}
.ms-collapse__body--open{max-height:6000px}
.ms-collapse__inner{padding:0 22px 22px}
.ms-collapse__inner > :first-child{margin-top:0}

/* response box */
.ms-respond__sub{font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.08rem; color:var(--ms-ink-soft); margin:0 0 16px}
.ms-respond__fields{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px}
@media (max-width:560px){ .ms-respond__fields{grid-template-columns:1fr} }
.ms-respond input, .ms-respond textarea{
  width:100%; font-family:'Cormorant Garamond',serif; font-size:1.05rem; color:var(--ms-ink);
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:12px; padding:13px 16px; outline:none;
  transition:border-color .25s, box-shadow .25s;
}
.ms-respond textarea{min-height:120px; resize:vertical}
.ms-respond input:focus, .ms-respond textarea:focus{border-color:var(--ms-royal); box-shadow:var(--ms-glow-gold)}
.ms-respond__meta{display:flex; align-items:center; justify-content:space-between; gap:14px; margin:10px 0 14px; flex-wrap:wrap}
.ms-respond__privacy{font-family:'Crimson Pro',serif; font-size:.74rem; color:var(--ms-ink-soft)}
.ms-respond__count{font-family:'Crimson Pro',serif; font-size:.74rem; color:var(--ms-ink-soft)}
.ms-respond__send{
  display:inline-flex; align-items:center; gap:10px; font-family:'Crimson Pro',serif; font-size:.8rem;
  letter-spacing:.16em; text-transform:uppercase; color:var(--ms-gold-soft);
  background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); border:1px solid rgba(200,154,67,.4);
  border-radius:999px; padding:13px 26px; cursor:pointer; transition:filter .25s, transform .2s;
}
.ms-respond__send svg{width:15px; height:15px}
.ms-respond__send:hover{filter:brightness(1.08); transform:translateY(-1px)}
.ms-respond__send:disabled{opacity:.6; cursor:default}
.ms-respond__done{display:none; align-items:center; gap:10px; margin-top:16px; font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.1rem; color:var(--ms-royal)}
.ms-respond__done svg{width:18px; height:18px; color:var(--ms-gold)}
.ms-respond__done--live{display:flex; animation:msFade .5s var(--ms-ease)}

/* prev/next message nav */
.ms-nav{display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:34px}
@media (max-width:560px){ .ms-nav{grid-template-columns:1fr} }
.ms-nav__btn{
  text-align:left; font-family:inherit; cursor:pointer; background:var(--ms-milk);
  border:1px solid var(--ms-vellum); border-radius:16px; padding:18px 22px;
  transition:transform .3s var(--ms-ease), box-shadow .3s var(--ms-ease), border-color .3s;
}
.ms-nav__btn:hover:not(:disabled){transform:translateY(-3px); box-shadow:var(--ms-shadow-sm); border-color:var(--ms-gold-soft)}
.ms-nav__btn:disabled{opacity:.5; cursor:default}
.ms-nav__btn--next{text-align:right}
.ms-nav__dir{display:flex; align-items:center; gap:8px; font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.16em; text-transform:uppercase; color:var(--ms-gold)}
.ms-nav__btn--next .ms-nav__dir{justify-content:flex-end}
.ms-nav__dir svg{width:13px; height:13px}
.ms-nav__title{display:block; font-family:'Cinzel',serif; font-weight:600; font-size:1.02rem; color:var(--ms-royal-deep); margin-top:8px; line-height:1.3}

/* podcast subscribe */
.ms-subscribe{display:flex; flex-wrap:wrap; gap:10px; margin-top:16px}
.ms-sub-btn{
  display:inline-flex; align-items:center; gap:8px; text-decoration:none;
  font-family:'Crimson Pro',serif; font-size:.74rem; letter-spacing:.1em; text-transform:uppercase;
  color:#fdf8ef; background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.28);
  border-radius:999px; padding:9px 16px; cursor:pointer; transition:background .25s, transform .2s;
}
.ms-sub-btn:hover{background:rgba(255,255,255,.24); transform:translateY(-1px)}
.ms-sub-btn svg{width:14px; height:14px}

/* podcast filter banner + episode title link */
.ms-filter-banner{display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin:24px 0 4px; padding:14px 18px; background:linear-gradient(135deg,rgba(91,53,122,.07),rgba(200,154,67,.04)); border:1px solid var(--ms-vellum); border-radius:12px; font-family:'Cormorant Garamond',serif; font-size:1.08rem; color:var(--ms-ink)}
.ms-ep__title--link{background:none; border:none; padding:0; cursor:pointer; text-align:left; transition:color .25s}
.ms-ep__title--link:hover{color:var(--ms-royal)}

/* ============================================================
   MILKY-WHITE DEFAULT + CREAM TOGGLE
   Default page is rich milky white; &.ms-cream switches to
   the warm cream palette. Toggle bar persists the choice.
   ============================================================ */
body{
  background:
    radial-gradient(1200px 620px at 50% -8%, #ffffff, transparent 60%),
    radial-gradient(1100px 560px at 88% 4%, rgba(200,154,67,.05), transparent 62%),
    linear-gradient(180deg, #fffdfa 0%, #fbf7f1 60%, #f7f1ea 100%);
}
&.ms-cream{
  background:
    radial-gradient(1100px 520px at 50% -5%, rgba(255,255,255,.7), transparent 60%),
    radial-gradient(1200px 560px at 88% -4%, rgba(200,154,67,.12), transparent 60%),
    radial-gradient(1100px 640px at -12% 96%, rgba(91,53,122,.06), transparent 58%),
    linear-gradient(180deg, var(--ms-ivory) 0%, var(--ms-champagne) 100%);
}
.ms-bgtoggle{
  position:fixed; right:16px; bottom:16px; z-index:150;
  opacity:0; visibility:hidden; pointer-events:none;
  transform:translateY(8px);
  display:inline-flex; align-items:center; gap:9px;
  font-family:'Crimson Pro',serif; font-size:.72rem; letter-spacing:.12em; text-transform:uppercase;
  color:var(--ms-royal); background:var(--ms-milk); border:1px solid var(--ms-vellum);
  border-radius:999px; padding:10px 16px; cursor:pointer; box-shadow:var(--ms-shadow-sm);
  transition:all .25s var(--ms-ease);
}
.ms-bgtoggle:hover{border-color:var(--ms-gold-soft); box-shadow:var(--ms-shadow-sm), var(--ms-glow-gold)}
.ms-bgtoggle svg{width:15px; height:15px; color:var(--ms-gold)}

/* ============================================================
   DETAIL: clean hero (no text on art) + head outside + player row
   ============================================================ */
.ms-detailwrap{margin-top:0}
.ms-detailmain{max-width:920px; margin:0 auto}
.ms-cleanhero{
  position:relative; width:100vw; margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw);
  height:auto; aspect-ratio:768/305; min-height:120px; border-radius:0; overflow:hidden;
  background:linear-gradient(150deg,var(--ms-royal-deep),var(--ms-royal) 60%,var(--ms-lavender));
  background-size:cover; background-position:center;
  box-shadow:none; border:none;
  display:flex; align-items:center; justify-content:center;
}
.ms-cleanhero--img{background-image:var(--x)}
.ms-cleanhero__crest{font-family:'Cinzel',serif; font-size:3.4rem; letter-spacing:.22em; color:rgba(228,201,138,.22)}
.ms-detailhead{text-align:center; margin:26px auto 0; max-width:44rem}
.ms-detailhead__kicker{font-family:'Crimson Pro',serif; font-size:.74rem; letter-spacing:.24em; text-transform:uppercase; color:var(--ms-gold)}
.ms-detailhead__title{font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1.7rem,4.5vw,2.7rem); color:var(--ms-royal-deep); margin:12px 0 0; line-height:1.15}
.ms-detailhead__meta{display:flex; flex-wrap:wrap; justify-content:center; gap:10px 22px; margin-top:16px; font-family:'Crimson Pro',serif; font-size:.84rem; color:var(--ms-ink-soft)}
.ms-detailhead__meta span{display:inline-flex; align-items:center; gap:7px}
.ms-detailhead__meta svg{width:14px; height:14px; color:var(--ms-gold)}

.ms-playerrow{
  display:grid; grid-template-columns:1fr 320px; gap:22px; margin-top:28px; align-items:start;
  grid-template-areas: "player upnext" "downloads upnext";
}
.ms-playerrow__player{grid-area:player}
.ms-playerrow__downloads{grid-area:downloads; margin:0}
.ms-playerrow__upnext{grid-area:upnext}
@media (max-width:860px){
  .ms-playerrow{grid-template-columns:1fr; grid-template-areas:"player" "downloads" "upnext"}
}

/* clean player */
.ms-cleanplayer{
  background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:20px;
  padding:22px; box-shadow:var(--ms-shadow-sm);
}
.ms-cp__art{
  width:100%; aspect-ratio:1/1; border-radius:16px; margin-bottom:20px;
  background:linear-gradient(150deg,var(--ms-royal-deep),var(--ms-royal) 60%,var(--ms-lavender));
  background-size:cover; background-position:center;
  display:flex; align-items:center; justify-content:center;
}
.ms-cp__crest{font-family:'Cinzel',serif; font-size:2.6rem; letter-spacing:.2em; color:rgba(228,201,138,.24)}
.ms-cp__controls{display:flex; align-items:center; justify-content:center; gap:26px; margin-bottom:18px}
.ms-cp__side{width:44px; height:44px; border-radius:50%; border:1px solid var(--ms-vellum); background:var(--ms-linen); color:var(--ms-royal); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .25s var(--ms-ease)}
.ms-cp__side:hover{border-color:var(--ms-gold-soft); transform:scale(1.06)}
.ms-cp__side svg{width:18px; height:18px}
.ms-cp__play{width:64px; height:64px; border-radius:50%; border:none; cursor:pointer; background:linear-gradient(135deg,var(--ms-royal),var(--ms-royal-deep)); color:var(--ms-gold-soft); display:flex; align-items:center; justify-content:center; box-shadow:var(--ms-shadow-sm); transition:filter .25s, transform .25s}
.ms-cp__play:hover{filter:brightness(1.1); transform:scale(1.05)}
.ms-cp__play svg{width:26px; height:26px; margin-left:2px}
.ms-cp__bar{display:flex; align-items:center; gap:12px}
.ms-cp__time{font-family:'Crimson Pro',serif; font-size:.74rem; color:var(--ms-ink-soft); min-width:42px}
.ms-cp__time:last-child{text-align:right}
.ms-cp__track{position:relative; flex:1; height:6px; border-radius:999px; background:var(--ms-vellum); cursor:pointer}
.ms-cp__fill{position:absolute; left:0; top:0; bottom:0; width:0%; border-radius:999px; background:linear-gradient(90deg,var(--ms-gold),var(--ms-gold-rich))}
.ms-cp__knob{position:absolute; top:50%; width:14px; height:14px; border-radius:50%; background:#fff; border:2px solid var(--ms-gold); transform:translate(-50%,-50%); box-shadow:0 2px 6px rgba(0,0,0,.2)}
.ms-cp__adv{display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:18px}
.ms-cp__adv .ms-chip-btn:disabled{opacity:.4; cursor:default}

/* up next rail */
.ms-playerrow__upnext{background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:20px; padding:18px; box-shadow:var(--ms-shadow-sm); max-height:520px; overflow-y:auto}
.ms-upnext__head{font-family:'Cinzel',serif; font-weight:600; font-size:.95rem; letter-spacing:.06em; color:var(--ms-royal-deep); padding:4px 4px 14px; border-bottom:1px solid var(--ms-vellum); margin-bottom:12px; position:sticky; top:0; background:var(--ms-milk)}
.ms-upnext__list{display:flex; flex-direction:column; gap:8px}
.ms-upnext__item{display:grid; grid-template-columns:52px 1fr; gap:12px; align-items:center; text-align:left; font-family:inherit; cursor:pointer; background:none; border:1px solid transparent; border-radius:12px; padding:8px; transition:all .25s var(--ms-ease)}
.ms-upnext__item:hover{background:var(--ms-linen); border-color:var(--ms-vellum)}
.ms-upnext__art{width:52px; height:52px; border-radius:10px; overflow:hidden; background:linear-gradient(140deg,var(--ms-royal),var(--ms-royal-deep)); display:flex; align-items:center; justify-content:center; flex:none}
.ms-upnext__art img{width:100%; height:100%; object-fit:cover}
.ms-upnext__art span{font-family:'Cinzel',serif; font-size:.7rem; color:rgba(228,201,138,.5)}
.ms-upnext__title{font-family:'Cinzel',serif; font-weight:600; font-size:.9rem; color:var(--ms-royal-deep); line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden}
.ms-upnext__sub{font-family:'Crimson Pro',serif; font-size:.72rem; color:var(--ms-ink-soft); margin-top:3px}
.ms-upnext__eq{display:none; gap:3px; margin-top:6px}
.ms-q--playing .ms-upnext__eq{display:flex}
.ms-q--playing{background:linear-gradient(135deg,rgba(200,154,67,.12),rgba(138,99,169,.05)); border-color:var(--ms-gold-soft) !important}
.ms-upnext__eq span{width:3px; height:12px; background:var(--ms-gold); border-radius:2px; animation:msEq 1s ease-in-out infinite}
.ms-upnext__eq span:nth-child(2){animation-delay:.2s} .ms-upnext__eq span:nth-child(3){animation-delay:.4s}
@keyframes msEq{0%,100%{height:5px}50%{height:14px}}

/* more collection grid */
.ms-collection{margin-top:34px}
.ms-coll-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px}
.ms-coll-card{display:grid; grid-template-columns:60px 1fr; gap:14px; align-items:center; text-align:left; font-family:inherit; cursor:pointer; background:var(--ms-milk); border:1px solid var(--ms-vellum); border-radius:14px; padding:12px; transition:transform .3s var(--ms-ease), box-shadow .3s var(--ms-ease), border-color .3s}
.ms-coll-card:hover{transform:translateY(-3px); box-shadow:var(--ms-shadow-sm); border-color:var(--ms-gold-soft)}
.ms-coll-card__art{width:60px; height:60px; border-radius:10px; overflow:hidden; background:linear-gradient(140deg,var(--ms-royal),var(--ms-royal-deep)); display:flex; align-items:center; justify-content:center; flex:none}
.ms-coll-card__art img{width:100%; height:100%; object-fit:cover}
.ms-coll-card__art span{font-family:'Cinzel',serif; font-size:.66rem; color:rgba(228,201,138,.5)}
.ms-coll-card__title{font-family:'Cinzel',serif; font-weight:600; font-size:.92rem; color:var(--ms-royal-deep); line-height:1.25}
.ms-coll-card__sub{font-family:'Crimson Pro',serif; font-size:.72rem; color:var(--ms-ink-soft); margin-top:3px}
.ms-downloads--player{justify-content:center; margin-top:22px}

/* encouragement band \\u2014 graphic image (replaces the earlier plain-text band) */
.ms-encourage{margin-top:56px; border-radius:20px; overflow:hidden; box-shadow:var(--ms-shadow-sm); line-height:0}
.ms-encourage__img{width:100%; height:auto; display:block}

/* bottom back-to link, mirrors the top one */
.ms-back--bottom{margin:44px auto 0; width:fit-content}

/* footer transition */
.ms-foot{height:56px; margin-top:10px; background:linear-gradient(180deg, rgba(247,241,232,0), rgba(242,228,211,.5) 40%, rgba(91,53,122,.32) 78%, var(--ms-royal-deep) 100%)}

/* toast */
.ms-toast{
  position:fixed; left:50%; bottom:30px; transform:translateX(-50%) translateY(20px);
  background:var(--ms-royal-deep); color:var(--ms-gold-soft);
  font-family:'Crimson Pro',serif; font-size:.86rem; letter-spacing:.04em;
  padding:13px 24px; border-radius:999px; box-shadow:var(--ms-shadow);
  border:1px solid rgba(228,201,138,.35); opacity:0; pointer-events:none;
  transition:opacity .3s, transform .3s var(--ms-ease); z-index:200;
}
.ms-toast--show{opacity:1; transform:translateX(-50%) translateY(0)}

.ms-hidden{display:none !important}

@media (prefers-reduced-motion: reduce){
  & *{transition:none !important; animation:none !important; scroll-behavior:auto !important}
}
`;

const CARDS_PER_PAGE = 6;

const MsgBase = createGlobalStyle`
  html.msg-redesign-root {
    font-size: 16px;
  }
`;

const MessagesPage: NextPage = () => {
  const router = useRouter();
  const { getMessages, getPodcasts, messages, podcasts } = useContentful();

  // Insulate this page from the site-wide root font-size so rem sizing
  // matches the redesign mockup's 16px base (see font-investigation).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("msg-redesign-root");
    return () => root.classList.remove("msg-redesign-root");
  }, []);

  // Series entries (have category) → sermons from audio_file[]; standalone = no category
  const SERIES = useMemo<Series[]>(() => buildSeries(messages || []), [messages]);
  const MSGS = useMemo<Msg[]>(
    () => (messages || []).filter((a: any) => !a?.category).map(toMsg),
    [messages]
  );
  const POD = useMemo(() => buildPodcasts(podcasts || []), [podcasts]);

  // view state
  const [tab, setTab] = useState<"series" | "messages" | "podcasts">("series");
  const [view, setView] = useState<"landing" | "seriesDetail" | "messageDetail" | "episodeDetail">("landing");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"featured" | "newest" | "az" | "za">("featured");
  const [savedOnly, setSavedOnly] = useState(false);
  const [podTab, setPodTab] = useState<"series" | "episodes">("series");
  const [podTheme, setPodTheme] = useState("All");
  const [podSort, setPodSort] = useState<"newest" | "oldest">("newest");

  const [curSeries, setCurSeries] = useState<Series | null>(null);
  const [curLesson, setCurLesson] = useState(0);
  const [curMessage, setCurMessage] = useState<Msg | null>(null);
  const [curEpisode, setCurEpisode] = useState<Episode | null>(null);

  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ msg: string; on: boolean }>({ msg: "", on: false });
  const [cream, setCream] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  // persisted
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [audioPos, setAudioPos] = useState<Record<string, { sec: number; total: number }>>({});
  const [continueDismissed, setContinueDismissed] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, on: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 2600);
  }, []);

  const onAudioPos = useCallback((slug: string, sec: number, total: number) => {
    setAudioPos((prev) => {
      const next = { ...prev, [slug]: { sec, total } };
      save("ms_audiopos", next);
      return next;
    });
  }, []);

  const platformAudio = usePlatformAudioOptional();
  const getPlatformEl = platformAudio?.getAudioElement;
  const setPlatformTrack = platformAudio?.setActiveTrack;
  const platformBridge = useMemo<PlayerPlatformBridge | null>(() => {
    if (!getPlatformEl || !setPlatformTrack) return null;
    return { getAudioElement: getPlatformEl, setActiveTrack: setPlatformTrack };
  }, [getPlatformEl, setPlatformTrack]);

  const player = usePlayer(onAudioPos, platformBridge);

  useEffect(() => { getMessages(); getPodcasts(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    setBookmarks(new Set(load<string[]>("ms_bookmarks", [])));
    setAudioPos(load("ms_audiopos", {}));
    setReady(true);
  }, []);

  // deep links from legacy routes: ?tab= / ?m= / ?ep= / ?series=
  const [deepDone, setDeepDone] = useState(false);
  useEffect(() => {
    if (deepDone || !router.isReady || MSGS.length === 0) return;
    const qy = router.query;
    const one = (v: any) => (Array.isArray(v) ? v[0] : v);
    const t = one(qy.tab); const m = one(qy.m); const epq = one(qy.ep); const ser = one(qy.series);
    if (m) { const hit = MSGS.find((x) => x.slug === cleanSlug(String(m))); if (hit) { openMessage(hit); setDeepDone(true); return; } }
    if (epq) { const hit = POD.episodes.find((x) => x.slug === cleanSlug(String(epq))); if (hit) { openEpisode(hit); setDeepDone(true); return; } }
    if (ser) { const hit = SERIES.find((x) => x.slug === cleanSlug(String(ser))); if (hit) { openSeries(hit); setDeepDone(true); return; } }
    if (t === "series" || t === "messages" || t === "podcasts") setTab(t);
    setDeepDone(true);
    // eslint-disable-next-line
  }, [router.isReady, router.query, MSGS, POD, SERIES, deepDone]);

  const persistBookmarks = (next: Set<string>) => { setBookmarks(new Set(next)); save("ms_bookmarks", [...next]); };
  const toggleBookmark = (slug: string) => {
    const next = new Set(bookmarks);
    if (next.has(slug)) { next.delete(slug); showToast("Removed from saved."); }
    else { next.add(slug); showToast("Saved for later."); }
    persistBookmarks(next);
  };

  // continue-listening (in-progress audio)
  const inProgress = useMemo(() => {
    return Object.keys(audioPos)
      .map((slug) => ({ slug, ...audioPos[slug] }))
      .filter((x) => x.sec >= 0.5 && x.total > 0 && x.sec < x.total * 0.97)
      .sort((a, b) => b.sec / b.total - a.sec / a.total)
      .map((x) => {
        const m = MSGS.find((mm) => mm.slug === x.slug);
        if (m) return { kind: "message" as const, item: m, pct: Math.max(1, Math.round((x.sec / x.total) * 100)) };
        const ep = POD.episodes.find((e) => e.slug === x.slug);
        if (ep) return { kind: "episode" as const, item: ep, pct: Math.max(1, Math.round((x.sec / x.total) * 100)) };
        return null;
      })
      .filter(Boolean)
      .slice(0, 4) as { kind: "message" | "episode"; item: any; pct: number }[];
  }, [audioPos, MSGS, POD]);

  // search
  const searchText = (x: any) => [x.title, x.summary, x.overview, x.desc, x.scripture, x.mainScripture, x.category, x.theme, x.year, AUTHOR].filter(Boolean).join(" ").toLowerCase();
  const matchQ = (x: any) => !q || searchText(x).includes(q.toLowerCase());

  // categories for chips
  const seriesCats = useMemo(() => ["All", ...Array.from(new Set(SERIES.map((s) => s.category).filter(Boolean)))], [SERIES]);
  // Standalone messages have no category; chips stay as All-only unless tags appear later
  const msgCats = useMemo(() => ["All"], []);

  // filtered + sorted current-tab list
  const filteredSeries = useMemo(() => {
    let list = SERIES.filter(matchQ).filter((s) => filter === "All" || s.category === filter);
    if (savedOnly) list = list.filter((s) => s.sermons.some((sm) => bookmarks.has(sm.slug)));
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "za") list = [...list].sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === "newest") list = [...list].sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
    return list;
    // eslint-disable-next-line
  }, [SERIES, q, filter, sort, savedOnly, bookmarks]);

  const filteredMsgs = useMemo(() => {
    let list = MSGS.filter(matchQ);
    if (savedOnly) list = list.filter((m) => bookmarks.has(m.slug));
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "za") list = [...list].sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === "newest") list = [...list].sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
    return list;
    // eslint-disable-next-line
  }, [MSGS, q, filter, sort, savedOnly, bookmarks]);

  const activeList = tab === "series" ? filteredSeries : tab === "messages" ? filteredMsgs : POD.series;
  const pages = Math.max(1, Math.ceil((activeList.length - (page === 1 ? 1 : 0)) / CARDS_PER_PAGE));
  const showFeatured = page === 1 && filter === "All" && !q && !savedOnly && activeList.length > 0;
  const working = showFeatured ? activeList.slice(1) : activeList;
  const pageClamped = Math.min(page, Math.max(1, Math.ceil(working.length / CARDS_PER_PAGE)));
  const pageSlice = working.slice((pageClamped - 1) * CARDS_PER_PAGE, pageClamped * CARDS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(working.length / CARDS_PER_PAGE));

  // ---- podcast-section derived data ----
  const podLatest = useMemo(() => {
    const eps = [...POD.episodes].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    return eps[0] || null;
  }, [POD.episodes]);
  const podThemes = useMemo(
    () => ["All", ...Array.from(new Set(POD.episodes.map((e) => e.theme).filter(Boolean) as string[])).sort()],
    [POD.episodes]
  );
  const podEpisodes = useMemo(() => {
    let items = POD.episodes.filter((e) => !q || searchText(e).includes(q.toLowerCase()));
    if (podTheme !== "All") items = items.filter((e) => e.theme === podTheme);
    return [...items].sort((a, b) =>
      podSort === "oldest"
        ? String(a.date || "").localeCompare(String(b.date || ""))
        : String(b.date || "").localeCompare(String(a.date || ""))
    );
  }, [POD.episodes, q, podTheme, podSort]);

  const resetListState = () => { setPage(1); };
  useEffect(() => { resetListState(); }, [tab, filter, sort, savedOnly, q]);

  // ---- track builders ----
  const seriesToTracks = (s: Series): Track[] => s.sermons.map((sm) => ({ slug: sm.slug || s.slug + "__" + sm.title, title: sm.title, sub: sm.sub, dur: sm.dur, audio: sm.audio, image: sm.image || s.image, artist: AUTHOR_FULL }));
  const msgToTrack = (m: Msg): Track => ({ slug: m.slug, title: m.title, sub: m.category, dur: m.dur, audio: m.audio, image: m.image, artist: m.preacher || AUTHOR_FULL });
  const epToTrack = (e: Episode): Track => ({ slug: e.slug, title: e.title, sub: e.seriesTitle, dur: e.dur, audio: e.audio, image: e.image, artist: AUTHOR_FULL });

  // ---- open views ----
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "auto" });
  const openSeries = (s: Series, lesson = 0) => { setCurSeries(s); setCurLesson(lesson); setView("seriesDetail"); player.setQueue(seriesToTracks(s), lesson, { autoplay: false, loop: true }); scrollTop(); };
  const openMessage = (m: Msg) => { setCurMessage(m); setView("messageDetail"); const q2 = filteredMsgs.map(msgToTrack); const i = Math.max(0, q2.findIndex((t) => t.slug === m.slug)); player.setQueue(q2, i, { autoplay: false }); scrollTop(); };
  const openEpisode = (e: Episode) => { setCurEpisode(e); setView("episodeDetail"); const q2 = POD.episodes.map(epToTrack); const i = Math.max(0, q2.findIndex((t) => t.slug === e.slug)); player.setQueue(q2, i, { autoplay: false, loop: true }); scrollTop(); };
  const saveCurrentProgress = useCallback(() => {
    const item = player.status.item;
    if (!item?.slug) return;
    const el = platformBridge?.getAudioElement() || null;
    const curT = (el && Number.isFinite(el.currentTime) ? el.currentTime : player.status.cur) || 0;
    const total =
      (player.status.total > 0 ? player.status.total : 0) ||
      (el && Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0) ||
      parseDur(item.dur);
    if (curT >= 0.5 && total > 0) onAudioPos(item.slug, curT, total);
  }, [player.status, platformBridge, onAudioPos]);

  const backToLanding = useCallback(() => {
    saveCurrentProgress();
    setContinueDismissed(false);
    setView("landing");
    scrollTop();
  }, [saveCurrentProgress]);

  const backToLandingRef = useRef(backToLanding);
  backToLandingRef.current = backToLanding;

  // hardware back
  useEffect(() => {
    if (view === "landing") return;
    history.pushState({ msDetail: true }, "");
    const onPop = () => backToLandingRef.current();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [view]);

  // ---- respond box relay ----
  const sendResponse = async (fields: { name: string; email: string; message: string }, ctx: { kind: string; title: string; seriesTitle?: string; lessonTitle?: string; url: string }): Promise<boolean> => {
    if (!fields.message.trim()) { showToast("Write a few words first, then send."); return false; }
    if (!fields.email.trim()) { showToast("Please add your email so we can receive your message."); return false; }
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) { showToast("That email doesn't look right. Please check it."); return false; }
    let source = ctx.kind + ": " + ctx.title;
    if (ctx.kind === "Series" && ctx.lessonTitle) source = "Series: " + ctx.title + " — " + ctx.lessonTitle;
    if (ctx.kind === "Podcast" && ctx.seriesTitle) source = "Podcast: " + ctx.seriesTitle + " — Episode: " + ctx.title;
    try {
      await sendSiteMail({
        inbox: MAIL_INBOX,
        subject: ctx.kind + " response — " + ctx.title,
        replyTo: fields.email.trim(),
        name: fields.name.trim() || "A listener",
        message: fields.message.trim(),
        fields: {
          Name: fields.name.trim() || "A listener",
          Email: fields.email.trim(),
          Message: fields.message.trim(),
          Source: source,
          Link: ctx.url,
        },
      });
      return true;
    } catch {
      const subj = encodeURIComponent(ctx.kind + " response — " + ctx.title);
      const body = encodeURIComponent(fields.message + "\n\n— — —\nSource: " + source + "\n" + (fields.name ? "From: " + fields.name + "\n" : "") + "Email: " + fields.email);
      showToast("Opening your email app to send your message.");
      window.setTimeout(() => { window.location.href = "mailto:" + MSG_EMAIL + "?subject=" + subj + "&body=" + body; }, 600);
      return true;
    }
  };

  const shareThing = async (title: string, url: string) => {
    try {
      if (isBrowser() && (navigator as any).share) { await (navigator as any).share({ title, url }); return; }
      if (isBrowser() && navigator.clipboard) { await navigator.clipboard.writeText(url); showToast("Link copied. Share it with friends."); return; }
    } catch {}
    showToast("Copy this link: " + url);
  };

  // ============ reusable sub-components ============
  const PlayerBar = () => {
    const st = player.status;
    const frac = st.total ? Math.min(1, st.cur / st.total) : 0;
    return (
      <div className="ms-cleanplayer">
        <div className={"ms-cp__art" + (st.item?.image ? " ms-cp__art--img" : "")} style={st.item?.image ? { backgroundImage: `url(${st.item.image})` } : undefined}>
          {!st.item?.image && <div className="ms-cp__crest">EIE</div>}
        </div>
        <div className="ms-cp__controls">
          <button className="ms-cp__side" aria-label="Rewind 15 seconds" onClick={() => player.skip(-15)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
          </button>
          <button className="ms-cp__play" aria-label={st.playing ? "Pause" : "Play"} onClick={() => player.toggle()}>
            {st.playing
              ? <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
          </button>
          <button className="ms-cp__side" aria-label="Forward 15 seconds" onClick={() => player.skip(15)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" /></svg>
          </button>
        </div>
        <div className="ms-cp__bar">
          <span className="ms-cp__time">{fmtTime(st.cur)}</span>
          <div className="ms-cp__track" onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); player.seekTo((e.clientX - r.left) / r.width); }}>
            <div className="ms-cp__fill" style={{ width: frac * 100 + "%" }} />
            <div className="ms-cp__knob" style={{ left: frac * 100 + "%" }} />
          </div>
          <span className="ms-cp__time">{fmtTime(st.total)}</span>
        </div>
        <div className="ms-cp__adv">
          <button className="ms-chip-btn" aria-label="Previous" disabled={st.index <= 0} onClick={() => player.prev()}>Prev</button>
          <button className="ms-chip-btn" aria-label="Playback speed" onClick={() => { const s = [1, 1.25, 1.5, 2, 0.75]; const nv = s[(s.indexOf(st.speed) + 1) % s.length]; player.setSpeed(nv); }}>{st.speed}x</button>
          <button className="ms-chip-btn" aria-label="Sleep timer" onClick={() => { const s = [0, 15, 30, 45]; const nv = s[(s.indexOf(st.sleepMin) + 1) % s.length]; player.setSleep(nv); showToast(nv > 0 ? "Sleep timer set for " + nv + " minutes." : "Sleep timer off."); }}>{st.sleepMin > 0 ? st.sleepMin + " min" : "Sleep"}</button>
          <button className="ms-chip-btn" aria-label="Next" disabled={st.index >= st.queueLen - 1} onClick={() => player.next()}>Next</button>
        </div>
      </div>
    );
  };

  const UpNextRail = ({ head, items, onPick }: { head: string; items: { slug: string; title: string; sub?: string; image?: string }[]; onPick: (i: number) => void }) => {
    if (!items.length) return null;
    return (
      <aside className="ms-playerrow__upnext">
        <div className="ms-upnext__head">{head}</div>
        <div className="ms-upnext__list">
          {items.map((it, i) => (
            <button key={it.slug + i} className={"ms-upnext__item" + (player.status.item && player.status.item.slug === it.slug ? " ms-q--playing" : "")} data-qslug={it.slug} onClick={() => onPick(i)}>
              <div className="ms-upnext__art">{it.image ? <img src={it.image} alt="" /> : <span>EIE</span>}</div>
              <div className="ms-upnext__meta">
                <div className="ms-upnext__title">{it.title}</div>
                {it.sub ? <div className="ms-upnext__sub">{it.sub}</div> : null}
                <div className="ms-upnext__eq"><span /><span /><span /></div>
              </div>
            </button>
          ))}
        </div>
      </aside>
    );
  };

  const CollectionGrid = ({ items, onPick }: { items: { slug: string; title: string; sub?: string; image?: string }[]; onPick: (i: number) => void }) => {
    if (!items.length) return null;
    return (
      <div className="ms-coll-grid">
        {items.map((it, i) => (
          <button key={it.slug + i} className="ms-coll-card" data-qslug={it.slug} onClick={() => onPick(i)}>
            <div className="ms-coll-card__art">{it.image ? <img src={it.image} alt="" /> : <span>EIE</span>}</div>
            <div className="ms-coll-card__body">
              <div className="ms-coll-card__title">{it.title}</div>
              {it.sub ? <div className="ms-coll-card__sub">{it.sub}</div> : null}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const CleanHero = ({ image, fallback }: { image?: string; fallback: string }) => (
    <div className={"ms-cleanhero" + ((image || fallback) ? " ms-cleanhero--img" : "")} style={{ backgroundImage: `url(${image || fallback})` }}>
      {!(image || fallback) && <div className="ms-cleanhero__crest">EIE</div>}
    </div>
  );

  const RespondBox = ({ ctx }: { ctx: { kind: string; title: string; seriesTitle?: string; lessonTitle?: string; url: string } }) => {
    const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
    return (
      <div className="ms-respond">
        <p className="ms-respond__sub">Your testimony is a blessing to this house.</p>
        <div className="ms-respond__fields">
          <input type="text" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Your email (required)" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <textarea maxLength={1000} placeholder="Share what this stirred in you..." value={msg} onChange={(e) => setMsg(e.target.value)} />
        <div className="ms-respond__meta">
          <span className="ms-respond__privacy">Your email is never published; it is used only to receive your message.</span>
          <span className="ms-respond__count">{msg.length} / 1000</span>
        </div>
        <button className="ms-respond__send" disabled={busy} onClick={async () => { setBusy(true); const ok = await sendResponse({ name, email, message: msg }, ctx); setBusy(false); if (ok) { setName(""); setEmail(""); setMsg(""); setDone(true); } }}>{busy ? "Sending..." : "Send"}</button>
        <div className={"ms-respond__done" + (done ? " ms-respond__done--live" : "")}>Thank you. Your words have been received with gratitude.</div>
      </div>
    );
  };

  const Chips = ({ cats }: { cats: string[] }) => (
    <div className="ms-controls2">
      <div className="ms-chips" role="group" aria-label="Filter by category">
        {cats.map((c) => (
          <button key={c} className={"ms-chip" + (c === filter ? " ms-chip--on" : "")} aria-pressed={c === filter} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <div className="ms-controls2__right">
        <button className={"ms-saved-tab" + (savedOnly ? " ms-saved-tab--on" : "")} aria-pressed={savedOnly}
          onClick={() => { if (!savedOnly && bookmarks.size === 0) { showToast("You have not saved anything yet."); return; } setSavedOnly((s) => !s); }}>
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          <span>{bookmarks.size ? `Saved (${bookmarks.size})` : "Saved"}</span>
        </button>
        <label className="ms-sort"><span>Sort</span>
          <select value={sort} aria-label="Sort" onChange={(e) => setSort(e.target.value as any)}>
            <option value="featured">Featured</option><option value="newest">Newest</option><option value="az">A to Z</option><option value="za">Z to A</option>
          </select>
        </label>
      </div>
    </div>
  );

  const Pager = () => (
    <div className="ms-pager" style={{ display: "flex" }}>
      <button disabled={pageClamped <= 1} onClick={() => { setPage(pageClamped - 1); scrollTop(); }}>Prev</button>
      <span className="ms-pager__count">{pageClamped} of {totalPages}</span>
      <button disabled={pageClamped >= totalPages} onClick={() => { setPage(pageClamped + 1); scrollTop(); }}>Next</button>
    </div>
  );

  /* ---- inline icons (match the mockup's IC set) ---- */
  const IcChevR = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M9 6l6 6-6 6" /></svg>;
  const IcClock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  const IcLayers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" /></svg>;
  const IcMic = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5" /></svg>;
  const IcPlay = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
  const IcBookmark = () => <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
  const IcShare = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>;
  const IcDownload = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>;
  const IcBook = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M18 3v16" /></svg>;

  const otherSeries = (cur: Series) => {
    const start = SERIES.findIndex((x) => x.slug === cur.slug);
    const out: Series[] = [];
    for (let k = 1; k < SERIES.length && out.length < 9; k++) out.push(SERIES[(start + k) % SERIES.length]);
    return out;
  };

  const seriesMinutes = (s: Series) => s.sermons.reduce((a, l) => a + (parseInt(l.dur) || 0), 0);

  // Intrinsic element (not a nested component) so player ticks cannot remount / flicker it.
  const renderFeaturedCard = (opts: { kind: string; title: string; sub?: string; meta?: string; image?: string; onOpen: () => void; key?: string }) => {
    const { kind, title, sub, meta, image, onOpen } = opts;
    return (
      <button key={opts.key || kind + title} type="button" className="ms-featured-card" aria-label={"Open " + title} onClick={onOpen}>
        <div className="ms-featured-card__art">
          {image ? <img src={image} alt="" /> : <div className="ms-featured-card__crest">EIE</div>}
          <span className="ms-featured-card__badge">{kind}</span>
        </div>
        <div className="ms-featured-card__body">
          <div className="ms-featured-card__title">{title}</div>
          {sub ? <div className="ms-featured-card__sub">{sub.slice(0, 180)}{sub.length > 180 ? "..." : ""}</div> : null}
          {meta ? <div className="ms-featured-card__meta">{meta}</div> : null}
          <span className="ms-featured-card__go">Open <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M9 6l6 6-6 6" /></svg></span>
        </div>
      </button>
    );
  };

  // Render helpers (not nested components) so player ticks don't remount cards / re-trigger ms-anim.
  const renderSeriesCard = (s: Series, idx: number) => {
    const mins = seriesMinutes(s);
    return (
      <button key={s.slug} className="ms-series-card ms-anim" style={{ animationDelay: idx * 0.05 + "s" }} aria-label={"Open series: " + s.title} onClick={() => openSeries(s)}>
        {s.image ? <img src={s.image} alt="" loading="lazy" /> : null}
        <div className="ms-series-card__veil" />
        <div className="ms-series-card__badge">Series</div>
        <div className="ms-series-card__body">
          <div className="ms-series-card__title">{s.title}</div>
          <div className="ms-series-card__meta">
            <span><IcLayers /> {s.sermons.length} sermon{s.sermons.length !== 1 ? "s" : ""}</span>
            {mins > 0 ? <span><IcClock /> {mins} min</span> : null}
          </div>
        </div>
        <div className="ms-series-card__go"><IcChevR /></div>
      </button>
    );
  };

  const playingSlug = platformAudio?.active ? platformAudio.track?.id : player.status.item?.slug;

  const renderMessageCard = (m: Msg, idx: number) => {
    const saved = bookmarks.has(m.slug);
    const isPlayingHere = Boolean(m.audio && playingSlug === m.slug);
    const listenTrack: PlatformAudioTrack | null = m.audio
      ? { id: m.slug, src: m.audio, title: m.title, subtitle: m.category || m.preacher || AUTHOR_FULL }
      : null;
    return (
      <button key={m.slug} className={"ms-msg-card ms-anim" + (isPlayingHere ? " ms-msg-card--playing" : "")} style={{ animationDelay: idx * 0.05 + "s" }} aria-label={"Open message: " + m.title} onClick={() => openMessage(m)}>
        <div className="ms-msg-card__art">
          {m.image ? <img src={m.image} alt="" loading="lazy" /> : <div className="ms-msg-card__crest">EIE</div>}
          <div className="ms-msg-card__actions">
            <span className={"ms-icon-btn" + (saved ? " ms-icon-btn--on" : "")} role="button" aria-label={saved ? "Saved" : "Save"} onClick={(e) => { e.stopPropagation(); toggleBookmark(m.slug); }}><IcBookmark /></span>
            <span className="ms-icon-btn" role="button" aria-label="Share" onClick={(e) => { e.stopPropagation(); shareThing(m.title, "https://eemodiae.org/messages?m=" + m.slug); }}><IcShare /></span>
            <span className="ms-icon-btn" role="button" aria-label="Download" onClick={(e) => { e.stopPropagation(); if (m.audio) { const a = document.createElement("a"); a.href = m.audio; a.download = m.title + ".mp3"; a.click(); } else showToast("This message will be available to download soon."); }}><IcDownload /></span>
          </div>
          {isPlayingHere && listenTrack ? (
            <div className="ms-msg-card__listen" onClick={(e) => e.stopPropagation()}>
              <ListenButton track={listenTrack} className="ms-listen-btn" idleLabel="Listen" playingLabel="Pause" pausedLabel="Resume" />
            </div>
          ) : null}
        </div>
        <div className="ms-msg-card__body">
          <div className="ms-msg-card__title">{m.title}</div>
          <div className="ms-msg-card__author">{m.preacher || AUTHOR_FULL}</div>
          <div className="ms-msg-card__foot">
            {m.dur ? <span className="ms-dur"><IcClock /> {m.dur}</span> : <span />}
            <span>{m.category || "Message"}{m.year ? " · " + m.year : ""}</span>
          </div>
        </div>
      </button>
    );
  };

  const renderPodSeriesCard = (ps: PodSeries, idx: number) => (
    <button
      key={ps.slug}
      className="ms-series-card ms-anim"
      style={{ animationDelay: idx * 0.05 + "s" }}
      aria-label={"Show episodes from " + ps.title}
      onClick={() => { setPodTab("episodes"); scrollTop(); }}
    >
      {ps.image ? <img src={ps.image} alt="" loading="lazy" /> : null}
      <div className="ms-series-card__veil" />
      <div className="ms-series-card__badge">Podcast</div>
      <div className="ms-series-card__body">
        <div className="ms-series-card__title">{ps.title}</div>
        <div className="ms-series-card__meta">
          <span><IcMic /> {ps.episodes.length} episode{ps.episodes.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="ms-series-card__go"><IcChevR /></div>
    </button>
  );

  const renderPodEpisodeRow = (e: Episode, idx: number) => {
    const st = player.status;
    const isCur = st.item?.slug === e.slug;
    const pct = isCur && st.total ? (st.cur / st.total) * 100 : 0;
    return (
      <div key={e.slug} className="ms-ep ms-anim" style={{ animationDelay: idx * 0.05 + "s" }}>
        <div className="ms-ep__art">{e.image ? <img src={e.image} alt="" loading="lazy" /> : null}</div>
        <div>
          <div className="ms-ep__kicker">{(e.seriesTitle || "Episode")}{e.date ? " · " + fmtDate(e.date) : ""}</div>
          <button className="ms-ep__title ms-ep__title--link" aria-label={"Open " + e.title} onClick={() => openEpisode(e)}>{e.title}</button>
          <div className="ms-player" data-ep={e.slug}>
            <button className="ms-player__play" aria-label={"Play " + e.title} onClick={() => openEpisode(e)}><IcPlay /></button>
            <div className="ms-player__track"><div className="ms-player__fill" style={{ width: pct + "%" }} /></div>
            <div className="ms-player__time">{e.dur}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderEpisodeCard = (e: Episode, idx: number) => (
    <button key={e.slug} className="ms-msg-card ms-anim" style={{ animationDelay: idx * 0.05 + "s" }} aria-label={"Open episode: " + e.title} onClick={() => openEpisode(e)}>
      <div className="ms-msg-card__art">
        {e.image ? <img src={e.image} alt="" loading="lazy" /> : <div className="ms-msg-card__crest">EIE</div>}
      </div>
      <div className="ms-msg-card__body">
        <div className="ms-msg-card__title">{e.title}</div>
        <div className="ms-msg-card__author">{AUTHOR_FULL}</div>
        <div className="ms-msg-card__foot">
          {e.dur ? <span className="ms-dur"><IcClock /> {e.dur}</span> : <span />}
          <span>{fmtDate(e.date) || "Episode"}</span>
        </div>
      </div>
    </button>
  );

  const Bookmark = ({ slug }: { slug: string }) => (
    <button className={"ms-bookmark" + (bookmarks.has(slug) ? " ms-bookmark--on" : "")} aria-label={bookmarks.has(slug) ? "Saved" : "Save for later"} onClick={(e) => { e.stopPropagation(); toggleBookmark(slug); }}>
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
    </button>
  );

  // Keep series lesson index in sync when the player advances (next / ended / up-next)
  useEffect(() => {
    if (view === "seriesDetail" && player.status.index !== curLesson) {
      setCurLesson(player.status.index);
    }
    // eslint-disable-next-line
  }, [player.status.index, view]);

  const p = curMessage;
  const s = curSeries;
  const ep = curEpisode;
  const lesson = s?.sermons[curLesson] || s?.sermons[player.status.index];

  return (
    <>
    <MsgBase />
    <Wrap className={`eemodiae-page ms-page${cream ? " ms-cream" : ""}`}>
      <Head>
        <title>Messages | eemodiae.org</title>
        <meta name="description" content="Christ-centered teachings, timeless truth, and messages that transform. Listen to sermons, series, and podcasts by Emmanuel I. Emodiae." />
      </Head>
      <Nav />
      {!platformAudio ? <audio ref={player.audioRef} preload="none" /> : null}

      <button className="ms-bgtoggle" aria-label="Switch background" onClick={() => setCream((c) => !c)}>{cream ? "☀ Warm mode" : "☾ Cream mode"}</button>

      <div id="msApp">
        {/* ============ LANDING ============ */}
        {view === "landing" && (
          <div className="ms-wrap">
            <div className="ms-hero ms-hero--banner">
              <img className="ms-hero__bannerimg" src={tab === "podcasts" ? POD_BANNER : HERO_LANDING}
                alt={tab === "podcasts" ? "Fresh from the Spirit — Podcast. Listen. Grow. Walk in truth." : "Messages — Christ-centered teachings, timeless truth, and messages that transform"} />
            </div>

            {tab !== "podcasts" && (
              <div className="ms-search" role="search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                <input type="search" placeholder="Search messages, series and podcasts..." aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            )}

            <div className="ms-tabs" role="tablist" aria-label="Sections">
              {(["series", "messages", "podcasts"] as const).map((t) => (
                <button key={t} className={"ms-tab" + (t === tab ? " ms-tab--on" : "")} role="tab" aria-selected={t === tab}
                  onClick={() => { setTab(t); setFilter("All"); setQ(""); if (t === "podcasts") setPodTab("series"); }}>
                  {t === "series" ? "Series" : t === "messages" ? "Messages" : "Podcasts"}
                </button>
              ))}
            </div>

            {/* continue listening */}
            {tab !== "podcasts" && !continueDismissed && inProgress.length > 0 && (
              <div className="ms-continue-rail">
                <div className="ms-continue-rail__head">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> Continue Listening
                  <button className="ms-continue-rail__close" aria-label="Close" onClick={() => setContinueDismissed(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="ms-continue-rail__row">
                  {inProgress.map(({ kind, item, pct }) => (
                    <button key={kind + item.slug} className="ms-continue-chip" onClick={() => kind === "episode" ? openEpisode(item) : openMessage(item)}>
                      <div className="ms-continue-chip__title">{item.title}</div>
                      <div className="ms-continue-chip__bar"><div style={{ width: pct + "%" }} /></div>
                      <div className="ms-continue-chip__meta">{pct}% · {item.dur}{kind === "episode" ? " · Podcast" : ""}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* section */}
            <div id="msSection" role="main" aria-label="Messages content">
              {/* {tab === "series" && <Chips cats={seriesCats} />}
              {tab === "messages" && <Chips cats={msgCats} />} */}

              {showFeatured && tab === "series" && (activeList[0] as Series) && renderFeaturedCard({
                key: "feat-series-" + (activeList[0] as Series).slug,
                kind: "Featured Series",
                title: (activeList[0] as Series).title,
                sub: (activeList[0] as Series).summary,
                image: (activeList[0] as Series).image,
                meta: `${(activeList[0] as Series).sermons.length} sermons${(activeList[0] as Series).scripture ? " · " + (activeList[0] as Series).scripture : ""}`,
                onOpen: () => openSeries(activeList[0] as Series),
              })}
              {showFeatured && tab === "messages" && (activeList[0] as Msg) && renderFeaturedCard({
                key: "feat-msg-" + (activeList[0] as Msg).slug,
                kind: "Featured Message",
                title: (activeList[0] as Msg).title,
                sub: (activeList[0] as Msg).overview,
                image: (activeList[0] as Msg).image,
                meta: `${(activeList[0] as Msg).preacher || AUTHOR_FULL} · ${(activeList[0] as Msg).dur}${(activeList[0] as Msg).mainScripture ? " · " + (activeList[0] as Msg).mainScripture : ""}`,
                onOpen: () => openMessage(activeList[0] as Msg),
              })}

              {tab !== "podcasts" && (
                <div className={"ms-grid" + (tab === "messages" ? " ms-grid--msgs" : "")}>
                  {tab === "series" && (pageSlice as Series[]).map((x, i) => renderSeriesCard(x, i))}
                  {tab === "messages" && (pageSlice as Msg[]).map((x, i) => renderMessageCard(x, i))}
                </div>
              )}

              {/* ===== PODCASTS SECTION ===== */}
              {tab === "podcasts" && (
                <>
                  {/* <div className="ms-pod-sub">
                    <p className="ms-pod-sub__tag">Explore series and latest episodes from the Fresh from the Spirit podcast.</p>
                    <div className="ms-pod-follow">
                      <a className="ms-follow-btn" href={POD_SUBSCRIBE.apple} target="_blank" rel="noopener"><IcMic /> Apple Podcasts</a>
                      <a className="ms-follow-btn" href={POD_SUBSCRIBE.spotify} target="_blank" rel="noopener"><IcPlay /> Spotify</a>
                      <a className="ms-follow-btn" href={POD_SUBSCRIBE.rss} target="_blank" rel="noopener"><IcLayers /> RSS Feed</a>
                    </div>
                  </div> */}

                  {podLatest && renderFeaturedCard({
                    key: "feat-ep-" + podLatest.slug,
                    kind: "Latest Episode",
                    title: podLatest.title,
                    sub: podLatest.desc,
                    image: podLatest.image,
                    meta: [podLatest.seriesTitle, fmtDate(podLatest.date), podLatest.dur].filter(Boolean).join(" · "),
                    onOpen: () => openEpisode(podLatest),
                  })}

                  <div className="ms-subtabs" role="tablist">
                    <button className={"ms-subtab" + (podTab === "series" ? " ms-subtab--on" : "")} role="tab" aria-selected={podTab === "series"} onClick={() => setPodTab("series")}>Series</button>
                    <button className={"ms-subtab" + (podTab === "episodes" ? " ms-subtab--on" : "")} role="tab" aria-selected={podTab === "episodes"} onClick={() => setPodTab("episodes")}>Episodes</button>
                  </div>

                  <div id="msPodBody">
                    {podTab === "series" ? (
                      POD.series.length ? (
                        <div className="ms-grid" style={{ marginTop: 24 }}>
                          {POD.series.map((x, i) => renderPodSeriesCard(x, i))}
                        </div>
                      ) : <div className="ms-empty">No podcast series found.</div>
                    ) : (
                      <>
                        <div className="ms-controls2">
                          <div className="ms-chips" role="group" aria-label="Filter episodes by topic">
                            {podThemes.map((c) => (
                              <button key={c} className={"ms-chip" + (c === podTheme ? " ms-chip--on" : "")} aria-pressed={c === podTheme} onClick={() => setPodTheme(c)}>{c}</button>
                            ))}
                          </div>
                          <div className="ms-controls2__right">
                            <label className="ms-sort"><span>Sort</span>
                              <select aria-label="Sort episodes" value={podSort} onChange={(e) => setPodSort(e.target.value as "newest" | "oldest")}>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                              </select>
                            </label>
                          </div>
                        </div>
                        {podEpisodes.length ? (
                          <div className="ms-eps">
                            {podEpisodes.map((e, i) => renderPodEpisodeRow(e, i))}
                          </div>
                        ) : <div className="ms-empty">No episodes found.</div>}
                      </>
                    )}
                  </div>
                </>
              )}

              {ready && tab !== "podcasts" && activeList.length === 0 && <div className="ms-empty">Nothing here yet. Try another search or check back soon.</div>}
              {tab !== "podcasts" && working.length > CARDS_PER_PAGE && <Pager />}
            </div>

            <div className="ms-encourage"><img className="ms-encourage__img" src={ENCOURAGE_IMG} alt="Continue Listening. Continue Learning. Continue Growing." /></div>
          </div>
        )}

        {/* ============ SERIES DETAIL ============ */}
        {view === "seriesDetail" && s && (
          <div className="ms-detailwrap">
            <div className="ms-detailmain">
              <CleanHero image={seriesHeader.src} fallback={HERO_SERIES} />
              <button className="ms-back ms-back--top" onClick={backToLanding}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg> Back to Series
              </button>
              <div className="ms-detailhead">
                <div className="ms-detailhead__kicker">Teaching Series{s.category ? " · " + s.category : ""}{s.year ? " · " + s.year : ""}</div>
                <h1 className="ms-detailhead__title">{s.title}</h1>
                <div className="ms-detailhead__meta">
                  <span><IcLayers /> {s.sermons.length} sermon{s.sermons.length !== 1 ? "s" : ""}</span>
                  <span><IcClock /> {seriesMinutes(s)} min</span>
                  {s.scripture && <span><IcBook /> {s.scripture}</span>}
                </div>
              </div>

              <div className="ms-playerrow">
                <div className="ms-playerrow__player"><PlayerBar /></div>
                <div className="ms-playerrow__downloads ms-downloads">
                  <button className="ms-dl" onClick={() => shareThing(s.title, "https://eemodiae.org/messages?series=" + s.slug)}><IcShare /> Share series</button>
                  <button className="ms-dl" onClick={() => shareThing(lesson?.title || s.title, "https://eemodiae.org/messages?series=" + s.slug)}><IcShare /> Share current sermon</button>
                  <a className="ms-dl" onClick={() => { if (lesson?.audio) { const a = document.createElement("a"); a.href = lesson.audio; a.download = (lesson.title || s.title) + ".mp3"; a.click(); } else showToast("This sermon will be available to download soon."); }}><IcDownload /> Download current sermon</a>
                </div>
                <UpNextRail head="Up Next"
                  items={s.sermons
                    .map((sm, i) => ({
                      slug: sm.slug || s.slug + "__" + i,
                      title: sm.title,
                      sub: (sm.sub ? sm.sub + " · " : "") + (sm.dur || ""),
                      image: sm.image || s.image,
                      i,
                    }))
                    .filter((it) => it.i !== player.status.index)
                    .map(({ i: _i, ...rest }) => rest)}
                  onPick={(pickIdx) => {
                    const upNextIdxs = s.sermons
                      .map((_, idx) => idx)
                      .filter((idx) => idx !== player.status.index);
                    const idx = upNextIdxs[pickIdx];
                    if (typeof idx === "number") { setCurLesson(idx); player.playIndex(idx); }
                  }} />
              </div>

              <div className="ms-block" data-collapse="Overview">
                <div className="ms-block__head">Overview</div>
                <div className="ms-overview"><p>{s.overviewLong || s.summary}</p></div>
              </div>

              <div className="ms-block">
                <div className="ms-block__head">Share What This Spoke to You</div>
                <RespondBox ctx={{ kind: "Series", title: s.title, lessonTitle: lesson?.title, url: "https://eemodiae.org/messages?series=" + s.slug }} />
              </div>

              {otherSeries(s).length > 0 && (
                <div className="ms-block ms-collection">
                  <div className="ms-block__head">More Series</div>
                  <CollectionGrid items={otherSeries(s).map((x) => ({ slug: x.slug, title: x.title, sub: x.sermons.length + " sermons", image: x.image }))} onPick={(i) => openSeries(otherSeries(s)[i])} />
                </div>
              )}

              <div className="ms-back ms-back--bottom"><button onClick={backToLanding}>Back to Series</button></div>
            </div>
          </div>
        )}

        {/* ============ MESSAGE DETAIL ============ */}
        {view === "messageDetail" && p && (
          <div className="ms-detailwrap">
            <div className="ms-detailmain">
              <CleanHero image={messageHeader.src} fallback={HERO_MESSAGE} />
              <button className="ms-back ms-back--top" onClick={backToLanding}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg> Back to Messages
              </button>
              <div className="ms-detailhead">
                <div className="ms-detailhead__kicker">Message{p.category ? " · " + p.category : ""}{p.year ? " · " + p.year : ""}</div>
                <h1 className="ms-detailhead__title">{p.title}</h1>
                <div className="ms-detailhead__meta">
                  <span>{p.preacher || AUTHOR_FULL}</span>
                  {p.dur && <span><IcClock /> {p.dur}</span>}
                  {p.mainScripture && <span><IcBook /> {p.mainScripture}</span>}
                </div>
                {p.audio ? (
                  <div className="ms-detail-listen">
                    <ListenButton
                      track={{ id: p.slug, src: p.audio, title: p.title, subtitle: p.category || p.preacher || AUTHOR_FULL }}
                      className="ms-listen-btn"
                      idleLabel="Listen"
                      playingLabel="Pause"
                      pausedLabel="Resume"
                    />
                  </div>
                ) : null}
              </div>

              <div className="ms-playerrow">
                <div className="ms-playerrow__player"><PlayerBar /></div>
                <div className="ms-playerrow__downloads ms-downloads">
                  <a className="ms-dl" onClick={() => { if (p.audio) { const a = document.createElement("a"); a.href = p.audio; a.download = p.title + ".mp3"; a.click(); } else showToast("This message will be available to download soon."); }}><IcDownload /> Download audio</a>
                  <button className="ms-dl" onClick={() => shareThing(p.title, "https://eemodiae.org/messages?m=" + p.slug)}><IcShare /> Share message</button>
                  <button className={"ms-dl ms-bookmark-btn" + (bookmarks.has(p.slug) ? " ms-on" : "")} onClick={() => toggleBookmark(p.slug)}><IcBookmark /> <span>{bookmarks.has(p.slug) ? "Saved" : "Save"}</span></button>
                </div>
                <UpNextRail head="Up Next"
                  items={MSGS.filter((x) => x.slug !== p.slug).slice(0, 8).map((x) => ({ slug: x.slug, title: x.title, sub: (x.category ? x.category + " · " : "") + (x.dur || ""), image: x.image }))}
                  onPick={(i) => openMessage(MSGS.filter((x) => x.slug !== p.slug)[i])} />
              </div>

              {p.overview && (
                <div className="ms-block" data-collapse="Overview">
                  <div className="ms-block__head">Overview</div>
                  <div className="ms-overview"><p>{p.overview}</p></div>
                </div>
              )}

              <div className="ms-block">
                <div className="ms-block__head">Share What This Spoke to You</div>
                <RespondBox ctx={{ kind: "Message", title: p.title, url: "https://eemodiae.org/messages?m=" + p.slug }} />
              </div>

              {MSGS.filter((x) => x.slug !== p.slug).length > 0 && (
                <div className="ms-block ms-collection">
                  <div className="ms-block__head">More Messages</div>
                  <CollectionGrid items={MSGS.filter((x) => x.slug !== p.slug).slice(0, 9).map((x) => ({ slug: x.slug, title: x.title, sub: (x.category ? x.category + " · " : "") + (x.dur || ""), image: x.image }))} onPick={(i) => openMessage(MSGS.filter((x) => x.slug !== p.slug)[i])} />
                </div>
              )}

              <div className="ms-back ms-back--bottom"><button onClick={backToLanding}>Back to Messages</button></div>
            </div>
          </div>
        )}

        {/* ============ EPISODE DETAIL ============ */}
        {view === "episodeDetail" && ep && (
          <div className="ms-detailwrap">
            <div className="ms-detailmain">
              <CleanHero image={POD_BANNER} fallback={POD_BANNER} />
              <button className="ms-back ms-back--top" onClick={backToLanding}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg> Back to Podcasts
              </button>
              <div className="ms-detailhead">
                <div className="ms-detailhead__kicker">Podcast{ep.seriesTitle ? " · " + ep.seriesTitle : ""}</div>
                  <h1 className="ms-detailhead__title">{ep.title}</h1>
                  <div className="ms-detailhead__meta">
                    {ep.dur && <span><IcClock /> {ep.dur}</span>}
                    {fmtDate(ep.date) && <span>{fmtDate(ep.date)}</span>}
                  </div>
                </div>

                <div className="ms-playerrow">
                  <div className="ms-playerrow__player"><PlayerBar /></div>
                  <div className="ms-playerrow__downloads ms-downloads">
                    <a className="ms-dl" onClick={() => { if (ep.audio) { const a = document.createElement("a"); a.href = ep.audio; a.download = ep.title + ".mp3"; a.click(); } else showToast("This episode will be available to download soon."); }}><IcDownload /> Download episode</a>
                    <button className="ms-dl" onClick={() => shareThing(ep.title, "https://eemodiae.org/messages?ep=" + ep.slug)}><IcShare /> Share episode</button>
                    <button className={"ms-dl ms-bookmark-btn" + (bookmarks.has(ep.slug) ? " ms-on" : "")} onClick={() => toggleBookmark(ep.slug)}><IcBookmark /> <span>{bookmarks.has(ep.slug) ? "Saved" : "Save"}</span></button>
                  </div>
                  <UpNextRail head="Up Next"
                    items={POD.episodes.filter((e) => e.slug !== ep.slug).slice(0, 8).map((e) => ({ slug: e.slug, title: e.title, sub: e.dur || fmtDate(e.date), image: e.image }))}
                    onPick={(i) => openEpisode(POD.episodes.filter((e) => e.slug !== ep.slug)[i])} />
                </div>

                {ep.desc && (
                  <div className="ms-block" data-collapse="Overview">
                    <div className="ms-block__head">Overview</div>
                    <div className="ms-overview"><p>{ep.desc}</p></div>
                  </div>
                )}

                <div className="ms-block">
                  <div className="ms-block__head">Share What This Spoke to You</div>
                  <RespondBox ctx={{ kind: "Podcast", title: ep.title, seriesTitle: ep.seriesTitle, url: "https://eemodiae.org/messages?ep=" + ep.slug }} />
                </div>

                {POD.episodes.filter((e) => e.slug !== ep.slug).length > 0 && (
                  <div className="ms-block ms-collection">
                    <div className="ms-block__head">More Episodes</div>
                    <CollectionGrid items={POD.episodes.filter((e) => e.slug !== ep.slug).slice(0, 9).map((e) => ({ slug: e.slug, title: e.title, sub: e.dur || fmtDate(e.date), image: e.image }))} onPick={(i) => openEpisode(POD.episodes.filter((e) => e.slug !== ep.slug)[i])} />
                  </div>
                )}

                <div className="ms-back ms-back--bottom"><button onClick={backToLanding}>Back to Podcasts</button></div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <div className={"ms-toast" + (toast.on ? " ms-toast--show" : "")} role="status" aria-live="polite">{toast.msg}</div>
    </Wrap>
    </>
  );
};

export default MessagesPage;
