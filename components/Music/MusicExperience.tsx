// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import type {
  ExperienceMusicAlbum,
  ExperienceMusicArtist,
  ExperienceMusicSong,
} from "../../lib/content/experienceTypes";
import { destroyMusicExperience, initMusicExperience } from "../../lib/music/musicExperienceEngine";

export type MusicExperienceProps = {
  bannerImage?: string;
  artists?: ExperienceMusicArtist[];
  songs?: ExperienceMusicSong[];
  albums?: ExperienceMusicAlbum[];
  initialView?: "gallery" | "artist" | "album" | "song";
  initialId?: string | null;
  onNavigate?: ((state: { view: string; id?: string | null }) => void) | null;
};

export default function MusicExperience({
  bannerImage = "",
  artists = [],
  songs = [],
  albums = [],
  initialView = "gallery",
  initialId = null,
  onNavigate = null,
}: MusicExperienceProps) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    initMusicExperience({
      rootEl: rootRef.current,
      artists,
      songs,
      albums,
      initialView,
      initialId,
      onNavigate,
    });
    return () => destroyMusicExperience();
  }, [artists, songs, albums, initialView, initialId, onNavigate]);

  return (
    <div className="music-exp-root" ref={rootRef}>
      <div id="view-gallery" className="mx-view active">
        <header
          className="mx-hero"
          role="img"
          aria-label="Music. Experience soul lifting music."
        >
          {bannerImage ? (
            <img src={bannerImage} alt="" width={1536} height={610} fetchPriority="high" />
          ) : null}
        </header>

        <section className="mx-head">
          <h1>MUSIC</h1>
          <p className="mx-rider">Experience Soul Lifting Music</p>
          <div className="mx-staff" aria-hidden="true">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </section>

        <div className="mx-search-wrap">
          <div className="mx-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              id="mx-search-input"
              type="search"
              placeholder="Search music..."
              aria-label="Search songs and artistes"
            />
          </div>
        </div>

        <section className="mx-section" aria-labelledby="mx-artistes-h">
          <div className="mx-section-head">
            <h2 id="mx-artistes-h">Artistes</h2>
            <span className="mx-count" id="mx-artistes-count" />
          </div>
          <div className="mx-artists" id="mx-artists-grid" />
          <nav
            className="mx-pagination"
            id="mx-artists-pagination"
            aria-label="Artistes pages"
            hidden
          />
        </section>

        <section className="mx-section" id="mx-albums-section" aria-labelledby="mx-albums-h">
          <div className="mx-section-head">
            <h2 id="mx-albums-h">Albums</h2>
            <span className="mx-count" id="mx-albums-count" />
          </div>
          <div className="mx-songs" id="mx-albums-grid" />
          <nav className="mx-pagination" id="mx-albums-pagination" aria-label="Albums pages" hidden />
        </section>

        <section className="mx-section" aria-labelledby="mx-recent-h">
          <div className="mx-section-head">
            <h2 id="mx-recent-h">Recently Added</h2>
            <span className="mx-count" id="mx-songs-count" />
          </div>
          <div className="mx-songs" id="mx-songs-grid" />
          <nav className="mx-pagination" id="mx-songs-pagination" aria-label="Songs pages" hidden />
        </section>

        <footer className="mx-foot">
          <div className="mx-staff" aria-hidden="true">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <p>
            Sing unto the LORD a new song, and his praise in the congregation of saints. Psalm 149:1
          </p>
        </footer>
      </div>

      <div id="view-artist" className="mx-view">
        <div className="mx-section" style={{ paddingTop: "clamp(22px,4vw,40px)" }}>
          <button type="button" className="mx-back" data-back>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="14 6 8 12 14 18" />
            </svg>
            Back to Music
          </button>
          <div className="mx-artist-hero" id="mx-artist-hero" />
        </div>
        <section className="mx-section" aria-labelledby="mx-artist-songs-h">
          <div className="mx-section-head">
            <h2 id="mx-artist-songs-h">Songs</h2>
            <span className="mx-count" id="mx-artist-songs-count" />
          </div>
          <div className="mx-songs" id="mx-artist-songs-grid" />
          <nav
            className="mx-pagination"
            id="mx-artist-songs-pagination"
            aria-label="Artist songs pages"
            hidden
          />
        </section>
        <div className="mx-section" style={{ paddingBottom: "clamp(40px,7vw,70px)" }}>
          <button type="button" className="mx-back" data-back>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="14 6 8 12 14 18" />
            </svg>
            Back to Music
          </button>
        </div>
      </div>

      <div id="view-song" className="mx-view">
        <div
          className="mx-section"
          style={{
            paddingTop: "clamp(22px,4vw,40px)",
            paddingBottom: "clamp(40px,7vw,70px)",
          }}
        >
          <button type="button" className="mx-back" data-back>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="14 6 8 12 14 18" />
            </svg>
            Back
          </button>
          <div id="mx-song-detail" />
        </div>
      </div>

      <div id="view-album" className="mx-view">
        <div className="mx-section" style={{ paddingTop: "clamp(22px,4vw,40px)" }}>
          <button type="button" className="mx-back" data-back>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="14 6 8 12 14 18" />
            </svg>
            Back to Music
          </button>
          <div className="mx-album-hero" id="mx-album-hero" />
        </div>
        <section
          className="mx-section"
          style={{ paddingBottom: "clamp(40px,7vw,70px)" }}
          aria-labelledby="mx-album-tracks-h"
        >
          <div className="mx-section-head">
            <h2 id="mx-album-tracks-h">Tracklist</h2>
            <span className="mx-count" id="mx-album-tracks-count" />
          </div>
          <ol className="mx-tracklist" id="mx-album-tracks" />
        </section>
      </div>

      <div className="mx-player" id="mx-player" aria-label="Now playing">
        <div
          className="mx-player-progress"
          id="mx-progress"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          tabIndex={0}
        >
          <div className="fill" id="mx-progress-fill" />
        </div>
        <div className="mx-player-inner">
          <div className="mx-player-titles">
            <div className="t" id="mx-now-title" />
            <div className="a" id="mx-now-artist" />
          </div>
          <span className="mx-player-time" id="mx-time">
            0:00 / 0:00
          </span>
          <div className="mx-player-controls">
            <button type="button" className="mx-pbtn" id="mx-prev" aria-label="Previous song">
              <svg viewBox="0 0 24 24">
                <path d="M6 5h2v14H6zM20 5v14L9.5 12z" />
              </svg>
            </button>
            <button type="button" className="mx-pbtn main" id="mx-toggle" aria-label="Play or pause">
              <svg id="mx-toggle-icon" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button type="button" className="mx-pbtn" id="mx-next" aria-label="Next song">
              <svg viewBox="0 0 24 24">
                <path d="M16 5h2v14h-2zM4 5v14l10.5-7z" />
              </svg>
            </button>
            <button type="button" className="mx-pbtn mx-player-close" id="mx-close" aria-label="Close player">
              <svg viewBox="0 0 24 24">
                <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-toast" id="mx-toast" role="status" aria-live="polite" />
    </div>
  );
}
