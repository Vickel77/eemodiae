"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import SiteLayout from "../Site/SiteLayout";
import PageLoader from "../PageLoader";
import useContentful from "../../hooks/useContentful";
import {
  mapMessagesData,
  findMessageBySlug,
  findEpisodeBySlug,
} from "../../lib/content/mapMessages";
import { cleanString } from "../../util/normalizeAndCompare";
import { listBackHref } from "../../helpers/listPagination";
import MessagesExperience from "./MessagesExperience";
import messagesBanner from "../../assets/messages.png";
import messagesInnerBanner from "../../assets/messages-inner.png";
import messagesDetailBanner from "../../assets/messages-a.png";
import ffsPodcastBanner from "../../assets/ffs-podcast.png";

type TabId = "series" | "messages" | "podcasts";
type PodcastViewId = "series" | "episodes";

type MessagesPageProps = {
  initialSlug?: string | null;
  initialKind?: "message" | "episode" | null;
  forcePodcastTab?: boolean;
};

function parseTab(raw: unknown): TabId {
  if (raw === "series" || raw === "messages" || raw === "podcasts") return raw;
  return "series";
}

function parsePodcastView(raw: unknown): PodcastViewId {
  if (raw === "series" || raw === "episodes") return raw;
  return "series";
}

export default function MessagesPage({
  initialSlug = null,
  initialKind = null,
  forcePodcastTab = false,
}: MessagesPageProps) {
  const router = useRouter();
  const { getMessages, getPodcasts, messages: rawMessages, podcasts: rawPodcasts } =
    useContentful();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getMessages();
    getPodcasts();
  }, []);

  useEffect(() => {
    if (rawMessages && rawPodcasts) setReady(true);
  }, [rawMessages, rawPodcasts]);

  const mapped = useMemo(() => {
    if (!rawMessages || !rawPodcasts) {
      return { series: [], messages: [], podSeries: [], podEpisodes: [] };
    }
    return mapMessagesData(rawMessages, rawPodcasts);
  }, [rawMessages, rawPodcasts]);

  const activeMessage = useMemo(() => {
    if (!initialSlug || initialKind === "episode") return undefined;
    return findMessageBySlug(mapped.messages, initialSlug);
  }, [mapped.messages, initialSlug, initialKind]);

  const activeEpisode = useMemo(() => {
    if (!initialSlug || initialKind !== "episode") return undefined;
    return findEpisodeBySlug(mapped.podEpisodes, initialSlug);
  }, [mapped.podEpisodes, initialSlug, initialKind]);

  const initialTab = useMemo(() => {
    if (forcePodcastTab || initialKind === "episode") return "podcasts" as TabId;
    if (!router.isReady) return "series" as TabId;
    return parseTab(router.query.tab);
  }, [forcePodcastTab, initialKind, router.isReady, router.query.tab]);

  const initialPodcastView = useMemo(() => {
    if (forcePodcastTab || initialKind === "episode") return "episodes" as PodcastViewId;
    if (!router.isReady) return "series" as PodcastViewId;
    return parsePodcastView(router.query.podcastView);
  }, [forcePodcastTab, initialKind, router.isReady, router.query.podcastView]);

  const onNavigate = useCallback(
    (slug: string | null, kind?: string) => {
      if (!slug) {
        router.push(listBackHref("/messages", router.query));
        return;
      }
      // Already on this exact message/episode (e.g. the engine re-announcing
      // the route it was initialized with) — pushing again would re-trigger
      // Next's default scroll-to-top mid-read, so skip the no-op navigation.
      const alreadyHere =
        slug === initialSlug && (kind === "episode") === (initialKind === "episode");
      if (alreadyHere) return;
      if (kind === "episode") {
        const qs = router.asPath.includes("?")
          ? router.asPath.split("?")[1]
          : "tab=podcasts&podcastView=episodes";
        router.push(`/messages/podcasts/${encodeURIComponent(slug)}?${qs}`);
        return;
      }
      const qs = router.asPath.includes("?") ? `?${router.asPath.split("?")[1]}` : "";
      router.push(`/messages/${encodeURIComponent(slug)}${qs}`);
    },
    [router, initialSlug, initialKind]
  );

  if (!ready) return <PageLoader />;

  const shareUrl = activeEpisode
    ? `https://eemodiae.org/messages/podcasts/${cleanString(initialSlug || "")}`
    : activeMessage
      ? `https://eemodiae.org/messages/${cleanString(initialSlug || "")}`
      : "https://eemodiae.org/messages";

  const pageTitle = activeEpisode
    ? activeEpisode.title
    : activeMessage
      ? activeMessage.title
      : "Messages | Eemodiae";

  const landingHero = messagesBanner.src;
  const seriesDetailHero = messagesInnerBanner.src;
  const messageDetailHero = messagesDetailBanner.src;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Download and listen to life-transforming messages from Emmanuel I. Emodiae."
        />
        <link rel="canonical" href={shareUrl} />
        {(activeMessage || activeEpisode) && (
          <>
            <meta property="og:site_name" content="Eemodiae" />
            <meta property="og:title" content={pageTitle} />
            <meta
              property="og:image"
              content={activeMessage?.image || activeEpisode?.image || landingHero}
            />
            <meta property="og:url" content={shareUrl} />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image" />
          </>
        )}
      </Head>
      <SiteLayout>
      <MessagesExperience
        series={mapped.series}
        messages={mapped.messages}
        podSeries={mapped.podSeries}
        podEpisodes={mapped.podEpisodes}
        heroLanding={landingHero}
        heroSeries={seriesDetailHero}
        heroMessage={messageDetailHero}
        podBanner={ffsPodcastBanner.src}
        encourageImage={landingHero}
        initialTab={initialTab}
        initialPodcastView={initialPodcastView}
        initialSlug={initialSlug ? cleanString(initialSlug) : null}
        initialKind={initialKind}
        onNavigate={onNavigate}
      />
      </SiteLayout>
    </>
  );
}
