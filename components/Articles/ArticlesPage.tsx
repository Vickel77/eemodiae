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
import { mapArticles, findBySlug } from "../../lib/content/mapExperience";
import type { ExperienceArticle } from "../../lib/content/experienceTypes";
import { cleanString } from "../../util/normalizeAndCompare";
import { listBackHref } from "../../helpers/listPagination";
import ArticlesExperience from "./ArticlesExperience";
import articlesBanner from "../../assets/articles.png";
import dp from "../../assets/DP.png";

function plainExcerpt(text: string, max = 160): string {
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max).trim()}...` : plain;
}

type ArticlesPageProps = {
  articles?: ExperienceArticle[];
  initialSlug?: string | null;
};

export default function ArticlesPage({
  articles: articlesProp,
  initialSlug = null,
}: ArticlesPageProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { getArticles, articles: rawArticles } = useContentful();
  const [showModal, setShowModal] = useState(false);
  const [ready, setReady] = useState(!!articlesProp);

  useDisableRightClick();

  useEffect(() => {
    if (!articlesProp) getArticles();
  }, [articlesProp]);

  useEffect(() => {
    if (articlesProp || rawArticles) setReady(true);
  }, [articlesProp, rawArticles]);

  const articles = useMemo(() => {
    if (articlesProp?.length) return articlesProp;
    if (rawArticles?.length) return mapArticles(rawArticles);
    return [];
  }, [articlesProp, rawArticles]);

  const activeArticle = useMemo(() => {
    if (!initialSlug) return undefined;
    return findBySlug(articles, initialSlug);
  }, [articles, initialSlug]);

  const onNavigate = (slug: string | null) => {
    if (slug) {
      router.push(`/articles/${slug}`, undefined, { shallow: false });
      return;
    }
    router.push(listBackHref("/articles", router.query));
  };

  if (!ready) return <PageLoader />;

  const shareUrl = activeArticle
    ? `https://eemodiae.org/articles/${activeArticle.slug}`
    : "https://eemodiae.org/articles";

  return (
    <>
      <Head>
        <title>
          {activeArticle ? activeArticle.title : "Articles | Eemodiae"}
        </title>
        <meta
          name="description"
          content={
            activeArticle
              ? activeArticle.excerpt || plainExcerpt(activeArticle.body)
              : "Explore faith-building articles from Emmanuel I. Emodiae."
          }
        />
        <link rel="canonical" href={shareUrl} />
        {activeArticle && (
          <>
            <meta property="og:site_name" content="Eemodiae" />
            <meta property="og:title" content={activeArticle.title} />
            <meta
              property="og:image"
              content={activeArticle.image || articlesBanner.src}
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
            CREATE ARTICLE
          </button>
        </div>
      )}
      <CreatePoem showModal={showModal} onCancel={() => setShowModal(false)} />
      <ArticlesExperience
        articles={articles}
        bannerImage={articlesBanner.src}
        authorPhoto={dp.src}
        initialSlug={initialSlug ? cleanString(initialSlug) : null}
        onNavigate={onNavigate}
      />
      </SiteLayout>
    </>
  );
}
