"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PlatformAudioStatus, PlatformAudioTrack } from "./types";

type PlatformAudioContextValue = PlatformAudioStatus & {
  play: (track: PlatformAudioTrack) => void;
  pause: () => void;
  toggle: (track?: PlatformAudioTrack) => void;
  stop: () => void;
  seek: (time: number) => void;
  seekFraction: (fraction: number) => void;
  /** Called by ListenButton via IntersectionObserver. */
  setAnchorInView: (trackId: string, inView: boolean) => void;
  isCurrent: (trackId: string) => boolean;
  /** Shared media element — pages with a custom player should drive this. */
  getAudioElement: () => HTMLAudioElement | null;
  /** Update track metadata without restarting playback (external player owns play/pause). */
  setActiveTrack: (track: PlatformAudioTrack | null) => void;
};

const PlatformAudioContext = createContext<PlatformAudioContextValue | null>(
  null
);

function formatSafe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export function PlatformAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackIdRef = useRef<string | null>(null);
  const [track, setTrack] = useState<PlatformAudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [anchorInView, setAnchorInViewState] = useState(true);
  const anchorMap = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    const el = new Audio();
    el.preload = "metadata";
    audioRef.current = el;

    const onTime = () => setCurrentTime(formatSafe(el.currentTime));
    const onMeta = () => setDuration(formatSafe(el.duration));
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setActive(false);
      setCurrentTime(0);
      el.currentTime = 0;
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.pause();
      el.removeAttribute("src");
      el.load();
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, []);

  const play = useCallback((next: PlatformAudioTrack) => {
    const el = audioRef.current;
    if (!el) return;

    const same = trackIdRef.current === next.id && !!el.src;
    if (!same) {
      el.src = next.src;
      el.load();
      setCurrentTime(0);
      setDuration(0);
    }
    setTrack(next);
    trackIdRef.current = next.id;
    setActive(true);
    const known = anchorMap.current.get(next.id);
    setAnchorInViewState(known ?? true);
    el.play().catch(() => {
      /* autoplay blocked or aborted */
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
    setActive(false);
    setCurrentTime(0);
    setTrack(null);
    trackIdRef.current = null;
  }, []);

  const toggle = useCallback(
    (next?: PlatformAudioTrack) => {
      const el = audioRef.current;
      if (!el) return;
      if (next) {
        const isSame =
          track?.id === next.id &&
          (el.src === next.src || el.src.endsWith(next.src));
        if (isSame && !el.paused) {
          pause();
          return;
        }
        play(next);
        return;
      }
      if (!track) return;
      if (el.paused) play(track);
      else pause();
    },
    [pause, play, track]
  );

  const seek = useCallback((time: number) => {
    const el = audioRef.current;
    if (!el) return;
    const total = formatSafe(el.duration);
    const t = Math.max(0, Math.min(total || time, time));
    el.currentTime = t;
    setCurrentTime(t);
  }, []);

  const seekFraction = useCallback(
    (fraction: number) => {
      const el = audioRef.current;
      const total = formatSafe(el?.duration ?? duration);
      if (!total) return;
      seek(Math.max(0, Math.min(1, fraction)) * total);
    },
    [duration, seek]
  );

  const setAnchorInView = useCallback((trackId: string, inView: boolean) => {
    anchorMap.current.set(trackId, inView);
    if (trackIdRef.current === trackId) {
      setAnchorInViewState(inView);
    }
  }, []);

  const isCurrent = useCallback(
    (trackId: string) => track?.id === trackId,
    [track]
  );

  const getAudioElement = useCallback(() => audioRef.current, []);

  const setActiveTrack = useCallback((next: PlatformAudioTrack | null) => {
    if (!next) {
      setTrack(null);
      trackIdRef.current = null;
      setActive(false);
      setPlaying(false);
      setCurrentTime(0);
      return;
    }
    const el = audioRef.current;
    const same = trackIdRef.current === next.id;
    if (el && !same) {
      el.src = next.src;
      el.load();
      setCurrentTime(0);
      setDuration(0);
    }
    trackIdRef.current = next.id;
    setTrack(next);
    setActive(true);
    setAnchorInViewState(anchorMap.current.get(next.id) ?? true);
  }, []);

  const value = useMemo<PlatformAudioContextValue>(
    () => ({
      track,
      playing,
      active,
      currentTime,
      duration,
      anchorInView,
      play,
      pause,
      toggle,
      stop,
      seek,
      seekFraction,
      setAnchorInView,
      isCurrent,
      getAudioElement,
      setActiveTrack,
    }),
    [
      track,
      playing,
      active,
      currentTime,
      duration,
      anchorInView,
      play,
      pause,
      toggle,
      stop,
      seek,
      seekFraction,
      setAnchorInView,
      isCurrent,
      getAudioElement,
      setActiveTrack,
    ]
  );

  return (
    <PlatformAudioContext.Provider value={value}>
      {children}
    </PlatformAudioContext.Provider>
  );
}

export function usePlatformAudio() {
  const ctx = useContext(PlatformAudioContext);
  if (!ctx) {
    throw new Error("usePlatformAudio must be used within PlatformAudioProvider");
  }
  return ctx;
}

/** Optional hook for places that may render outside the provider. */
export function usePlatformAudioOptional() {
  return useContext(PlatformAudioContext);
}
