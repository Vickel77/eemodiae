"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import SiteLayout from "../Site/SiteLayout";
import CreatePoem from "../Modals/PoemModal";
import PageLoader from "../PageLoader";
import useAuth from "../../hooks/useAuth";
import useContentful from "../../hooks/useContentful";
import useDisableRightClick from "../../hooks/useDisableRightClick";
import { mapPoems, findBySlug } from "../../lib/content/mapExperience";
import type { ExperiencePoem } from "../../lib/content/experienceTypes";
import { cleanString } from "../../util/normalizeAndCompare";
import { listBackHref } from "../../helpers/listPagination";
import PoemsExperience from "./PoemsExperience";
import poemsBanner from "../../assets/poems.png";
import dp from "../../assets/DP.png";

function plainExcerpt(text: string, max = 160): string {
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max).trim()}...` : plain;
}

type PoemsPageProps = {
  poems?: ExperiencePoem[];
  initialSlug?: string | null;
};

export default function PoemsPage({
  poems: poemsProp,
  initialSlug = null,
}: PoemsPageProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { getPoems, poems: rawPoems } = useContentful();
  const [showModal, setShowModal] = useState(false);
  const [ready, setReady] = useState(!!poemsProp);

  useDisableRightClick();

  useEffect(() => {
    if (!poemsProp) getPoems();
  }, [poemsProp]);

  useEffect(() => {
    if (poemsProp || rawPoems) setReady(true);
  }, [poemsProp, rawPoems]);

  const poems = useMemo(() => {
    if (poemsProp?.length) return poemsProp;
    if (rawPoems?.length) return mapPoems(rawPoems);
    return [];
  }, [poemsProp, rawPoems]);

  const activePoem = useMemo(() => {
    if (!initialSlug) return undefined;
    return findBySlug(poems, initialSlug);
  }, [poems, initialSlug]);

  const onNavigate = (slug: string | null) => {
    if (slug) {
      router.push(`/poems/${slug}`, undefined, { shallow: false });
      return;
    }
    router.push(listBackHref("/poems", router.query));
  };

  if (!ready) return <PageLoader />;

  const shareUrl = activePoem
    ? `https://eemodiae.org/poems/${activePoem.slug}`
    : "https://eemodiae.org/poems";

  return (
    <>
      <Head>
        <title>{activePoem ? activePoem.title : "Poems | Eemodiae"}</title>
        <meta
          name="description"
          content={
            activePoem
              ? plainExcerpt(activePoem.body)
              : "Explore inspiring poems from Emmanuel I. Emodiae."
          }
        />
        <link rel="canonical" href={shareUrl} />
        {activePoem && (
          <>
            <meta property="og:site_name" content="Eemodiae" />
            <meta property="og:title" content={activePoem.title || ""} />
            <meta
              property="og:image"
              content={activePoem.image || poemsBanner.src}
            />
            <meta property="og:url" content={shareUrl} />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image" />
          </>
        )}
      </Head>
      <SiteLayout>
      {isLoggedIn && (
        <div className="fixed top-[5.5rem] right-4 z-50">
          <button
            onClick={() => setShowModal(true)}
            type="button"
            className="rounded-md bg-[#4c2d8f] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-80"
          >
            CREATE POEM
          </button>
        </div>
      )}
      <CreatePoem
        handleSubmit={() => null}
        showModal={showModal}
        onCancel={() => setShowModal(false)}
      />
      <PoemsExperience
        poems={poems}
        bannerImage={poemsBanner.src}
        authorPhoto={dp.src}
        initialSlug={initialSlug ? cleanString(initialSlug) : null}
        onNavigate={onNavigate}
      />
      </SiteLayout>
    </>
  );
}
