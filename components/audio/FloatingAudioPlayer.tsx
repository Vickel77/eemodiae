"use client";

import { useCallback, useRef } from "react";
import { createGlobalStyle } from "styled-components";
import { usePlatformAudioOptional } from "./PlatformAudioContext";

const FloatingStyles = createGlobalStyle`
  .ea-float {
    position: fixed;
    left: max(16px, env(safe-area-inset-left, 0px));
    bottom: max(20px, env(safe-area-inset-bottom, 0px));
    z-index: 1200;
    width: min(320px, calc(100vw - 32px));
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(44, 32, 19, 0.94);
    border: 1px solid rgba(201, 162, 75, 0.28);
    box-shadow: 0 18px 48px -20px rgba(0, 0, 0, 0.55);
    color: #f5f0e6;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    font-family: "Crimson Pro", "EB Garamond", Georgia, serif;
    transform: translateY(12px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.28s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .ea-float.is-on {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
  .ea-float__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .ea-float__meta { min-width: 0; flex: 1; }
  .ea-float__title {
    font-family: "Cinzel", serif;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #e4c169;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ea-float__sub {
    margin-top: 2px;
    font-size: 0.92rem;
    color: rgba(245, 240, 230, 0.78);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ea-float__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ea-float__btn {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(201, 162, 75, 0.35);
    background: rgba(201, 162, 75, 0.14);
    color: #e4c169;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .ea-float__btn:hover { background: rgba(201, 162, 75, 0.28); transform: translateY(-1px); }
  .ea-float__btn:focus-visible { outline: 2px solid #e4c169; outline-offset: 2px; }
  .ea-float__btn--stop {
    background: transparent;
    border-color: rgba(245, 240, 230, 0.2);
    color: rgba(245, 240, 230, 0.85);
  }
  .ea-float__btn svg { width: 16px; height: 16px; display: block; }
  .ea-float__seek {
    flex: 1;
    min-width: 0;
  }
  .ea-float__track {
    position: relative;
    height: 6px;
    border-radius: 999px;
    background: rgba(245, 240, 230, 0.16);
    cursor: pointer;
    touch-action: none;
  }
  .ea-float__fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, #c9a24b, #e4c169);
    pointer-events: none;
  }
  .ea-float__time {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 0.72rem;
    letter-spacing: 0.02em;
    color: rgba(245, 240, 230, 0.62);
    font-variant-numeric: tabular-nums;
  }
  @media (prefers-reduced-motion: reduce) {
    .ea-float { transition: none; }
  }
`;

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Global floating mini-player (bottom-left). Renders once under
 * PlatformAudioProvider. Visible when audio is active and the ListenButton
 * for the current track has scrolled out of view.
 */
export default function FloatingAudioPlayer() {
  const audio = usePlatformAudioOptional();
  const trackRef = useRef<HTMLDivElement>(null);

  const onSeekPointer = useCallback(
    (clientX: number) => {
      if (!audio || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (!rect.width) return;
      const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      audio.seekFraction(frac);
    },
    [audio]
  );

  if (!audio) return null;

  const { track, active, playing, currentTime, duration, anchorInView, toggle, pause, stop } =
    audio;
  const visible = Boolean(active && track && !anchorInView);
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <FloatingStyles />
      <div
        className={"ea-float" + (visible ? " is-on" : "")}
        role="region"
        aria-label="Audio player"
        aria-hidden={!visible}
      >
        {track ? (
          <>
            <div className="ea-float__top">
              <div className="ea-float__meta">
                <div className="ea-float__title">{track.title}</div>
                {track.subtitle ? (
                  <div className="ea-float__sub">{track.subtitle}</div>
                ) : null}
              </div>
              <button
                type="button"
                className="ea-float__btn ea-float__btn--stop"
                aria-label="Stop audio"
                title="Stop"
                onClick={stop}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </svg>
              </button>
            </div>

            <div className="ea-float__row">
              <button
                type="button"
                className="ea-float__btn"
                aria-label={playing ? "Pause" : "Play"}
                title={playing ? "Pause" : "Play"}
                onClick={() => (playing ? pause() : toggle())}
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5-11-6.5z" />
                  </svg>
                )}
              </button>

              <div className="ea-float__seek">
                <div
                  ref={trackRef}
                  className="ea-float__track"
                  role="slider"
                  tabIndex={visible ? 0 : -1}
                  aria-label="Seek"
                  aria-valuemin={0}
                  aria-valuemax={Math.floor(duration) || 0}
                  aria-valuenow={Math.floor(currentTime) || 0}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    onSeekPointer(e.clientX);
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons === 0) return;
                    onSeekPointer(e.clientX);
                  }}
                  onKeyDown={(e) => {
                    if (!duration) return;
                    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                      e.preventDefault();
                      audio.seek(Math.min(duration, currentTime + 5));
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                      e.preventDefault();
                      audio.seek(Math.max(0, currentTime - 5));
                    }
                  }}
                >
                  <div className="ea-float__fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="ea-float__time">
                  <span>{fmt(currentTime)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
