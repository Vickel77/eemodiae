"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import SiteLayout from "../Site/SiteLayout";
import PageLoader from "../PageLoader";
import useContentful from "../../hooks/useContentful";
import {
  findArtistByName,
  findArtistBySlug,
  findSongBySlug,
  mapMusicData,
} from "../../lib/content/mapMusic";
import type {
  ExperienceMusicAlbum,
  ExperienceMusicArtist,
  ExperienceMusicSong,
} from "../../lib/content/experienceTypes";
import { cleanString } from "../../util/normalizeAndCompare";
import MusicExperience from "./MusicExperience";
import musicBanner from "../../assets/music.png";

type MusicPageProps = {
  artists?: ExperienceMusicArtist[];
  songs?: ExperienceMusicSong[];
  albums?: ExperienceMusicAlbum[];
  initialView?: "gallery" | "artist" | "album" | "song";
  initialId?: string | null;
  artistName?: string | null;
};

export default function MusicPage({
  artists: artistsProp,
  songs: songsProp,
  albums: albumsProp,
  initialView = "gallery",
  initialId = null,
  artistName = null,
}: MusicPageProps) {
  const router = useRouter();
  const { getMusic, getArtiste, music: rawMusic, artiste: rawArtiste } = useContentful();
  const [ready, setReady] = useState(!!(artistsProp && songsProp));

  useEffect(() => {
    if (!artistsProp || !songsProp) {
      getMusic();
      getArtiste();
    }
  }, [artistsProp, songsProp]);

  useEffect(() => {
    if (artistsProp && songsProp) setReady(true);
    else if (rawMusic && rawArtiste) setReady(true);
  }, [artistsProp, songsProp, rawMusic, rawArtiste]);

  const mapped = useMemo(() => {
    if (artistsProp && songsProp) {
      return {
        artists: artistsProp,
        songs: songsProp,
        albums: albumsProp || [],
      };
    }
    if (rawMusic && rawArtiste) return mapMusicData(rawMusic, rawArtiste);
    return { artists: [], songs: [], albums: [] as ExperienceMusicAlbum[] };
  }, [artistsProp, songsProp, albumsProp, rawMusic, rawArtiste]);

  const resolvedView = useMemo(() => {
    if (artistName) {
      const artist = findArtistByName(mapped.artists, artistName);
      if (artist) return { view: "artist" as const, id: artist.id };
    }
    if (initialView !== "gallery" && initialId) {
      if (initialView === "song" && findSongBySlug(mapped.songs, initialId)) {
        return { view: "song" as const, id: initialId };
      }
      if (initialView === "artist" && findArtistBySlug(mapped.artists, initialId)) {
        return { view: "artist" as const, id: initialId };
      }
      if (initialView === "album" && mapped.albums.some((a) => a.id === initialId)) {
        return { view: "album" as const, id: initialId };
      }
    }
    return { view: "gallery" as const, id: null };
  }, [artistName, initialView, initialId, mapped]);

  const activeSong = useMemo(() => {
    if (resolvedView.view !== "song" || !resolvedView.id) return undefined;
    return findSongBySlug(mapped.songs, resolvedView.id);
  }, [resolvedView, mapped.songs]);

  const activeAlbum = useMemo(() => {
    if (resolvedView.view !== "album" || !resolvedView.id) return undefined;
    return mapped.albums.find((a) => a.id === resolvedView.id);
  }, [resolvedView, mapped.albums]);

  const onNavigate = useCallback(
    (state: { view: string; id?: string | null }) => {
      if (state.view === "gallery") {
        router.push("/music");
        return;
      }
      if (state.view === "song" && state.id) {
        router.push(`/music/${encodeURIComponent(state.id)}`);
        return;
      }
      if (state.view === "artist" && state.id) {
        const artist = findArtistBySlug(mapped.artists, state.id);
        router.push(`/music/artiste/${encodeURIComponent(artist?.name || state.id)}`);
        return;
      }
      if (state.view === "album" && state.id) {
        router.push(`/music?album=${encodeURIComponent(state.id)}`);
      }
    },
    [mapped.artists, router]
  );

  if (!ready) return <PageLoader />;

  const shareUrl = activeSong
    ? `https://eemodiae.org/music/${activeSong.id}`
    : activeAlbum
      ? `https://eemodiae.org/music?album=${activeAlbum.id}`
      : "https://eemodiae.org/music";

  const pageTitle = activeSong
    ? activeSong.title
    : activeAlbum
      ? `${activeAlbum.title} | Eemodiae`
      : "Music | Eemodiae";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Experience soul lifting music from the EEMODIAE music ministry."
        />
        <link rel="canonical" href={shareUrl} />
        {(activeSong || activeAlbum) && (
          <>
            <meta property="og:site_name" content="Eemodiae" />
            <meta property="og:title" content={pageTitle} />
            <meta
              property="og:image"
              content={activeSong?.cover || activeAlbum?.cover || musicBanner.src}
            />
            <meta property="og:url" content={shareUrl} />
            <meta property="og:type" content={activeSong ? "music.song" : "music.album"} />
            <meta name="twitter:card" content="summary_large_image" />
          </>
        )}
      </Head>
      <SiteLayout>
      <MusicExperience
        bannerImage={musicBanner.src}
        artists={mapped.artists}
        songs={mapped.songs}
        albums={mapped.albums}
        initialView={resolvedView.view}
        initialId={resolvedView.id}
        onNavigate={onNavigate}
      />
      </SiteLayout>
    </>
  );
}
