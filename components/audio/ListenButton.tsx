"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { usePlatformAudio } from "./PlatformAudioContext";
import type { PlatformAudioTrack } from "./types";

type ListenButtonProps = {
  track: PlatformAudioTrack;
  /** Extra class names (e.g. page-specific button styles). */
  className?: string;
  /** Override default label when idle. */
  idleLabel?: ReactNode;
  /** Override default label while this track is playing. */
  playingLabel?: ReactNode;
  /** Override default label while this track is paused mid-session. */
  pausedLabel?: ReactNode;
  showIcon?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children" | "className">;

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      {playing ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a9 9 0 0 1 0 14" />
        </>
      ) : (
        <path d="M15.5 12h.01" />
      )}
    </svg>
  );
}

/**
 * Inline “Listen” control. Registers itself as the visibility anchor for the
 * floating mini-player — when this button leaves the viewport while audio is
 * active, FloatingAudioPlayer appears.
 */
export default function ListenButton({
  track,
  className = "",
  idleLabel = "Listen",
  playingLabel = "Pause",
  pausedLabel = "Resume",
  showIcon = true,
  ...rest
}: ListenButtonProps) {
  const { toggle, isCurrent, playing, active, setAnchorInView } =
    usePlatformAudio();
  const ref = useRef<HTMLButtonElement>(null);
  const current = isCurrent(track.id);
  const isPlaying = current && playing;
  const isPaused = current && active && !playing;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setAnchorInView(track.id, entry.isIntersecting && entry.intersectionRatio > 0);
      },
      { threshold: [0, 0.15, 0.5], rootMargin: "-8px 0px -8px 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      // Unmount = left the viewport; let FloatingAudioPlayer take over.
      setAnchorInView(track.id, false);
    };
  }, [setAnchorInView, track.id]);

  const label = isPlaying ? playingLabel : isPaused ? pausedLabel : idleLabel;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={`ea-listen ${className}`.trim()}
      aria-pressed={isPlaying}
      aria-label={
        typeof label === "string"
          ? label
          : isPlaying
            ? "Pause audio"
            : isPaused
              ? "Resume audio"
              : `Listen to ${track.title}`
      }
      onClick={() => toggle(track)}
    >
      {showIcon ? <SpeakerIcon playing={isPlaying} /> : null}
      <span>{label}</span>
    </button>
  );
}
