import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import React, { Suspense, useEffect, useState } from "react";
import dp from "../../assets/DP.png";
import Head from "next/head";
import Image from "next/image";
import { MdArrowLeft } from "react-icons/md";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import renderImage from "../../helpers/renderImage";
import Share from "../../components/Share";
import { createClient } from "contentful";
import PageLoader from "../../components/PageLoader";
import { smallDescription } from "../../util/removeHtmlTags";

const client = createClient({
  space: "7rf3l1j0b9zd",
  accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
});

const Article = ({ article }: { article: Article }) => {
  const router = useRouter();
  const id = router.query.id;

  const shareUrl = `https://eemodiae.org/articles/${id}?${article?.title.replace(
    / /g,
    "_"
  )}`;

  const contentRendererOptions = {
    preserveWhitespace: true,
  };
  // const article = articles[Number(id)];
  if (!article) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback="">
      <Head>
        <title>{article && `${article.title}`}</title>
        <meta name="description" content={smallDescription(article?.content)} />
        <link rel="canonical" href={shareUrl} />

        {/* Open Graph / Facebook */}

        <meta property="og:site_name" content="Eemodiae" />
        <meta property="og:title" content={article?.title} />
        <meta
          property="og:description"
          content={smallDescription(article?.content)}
          key="description"
        />
        <meta property="og:image" content={renderImage(article.image_url)} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta
          property="og:image:alt"
          content={article?.title || "Eemodiae Article"}
        />

        {/* Twitter */}

        <meta name="twitter:title" content={article?.title} />
        <meta
          name="twitter:description"
          content={smallDescription(article?.content)}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta
          property="twitter:image"
          content={renderImage(article.image_url)}
        />
        <meta
          property="og:image:alt"
          content={article?.title || "Eemodiae Article"}
        />
      </Head>
      <div className="w-[100%] m-auto text-primary mt-[5rem]">
        <Navbar />
        <section className="w-[70%] m-auto">
          <button
            onClick={() => router.back()}
            className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb-5"
          >
            <MdArrowLeft />
            Back
          </button>
          <h1 className=" text-2xl md:text-3xl font-black">{article.title}</h1>
        </section>
        <aside className=" w-[70%] m-auto flex gap-5 items-center mt-5">
          <div className="rounded-full">
            <Image className="cta" src={dp} alt="Chat on whatsapp" />
          </div>
          <div className="text-sm">
            <em>Published by:</em>
            <br />
            <b> Pst Emmanuel I. Emodiae</b>
            <p>Prophet Preacher Poet</p>
            <p>@eemodiae</p>
          </div>
        </aside>
        <section className=" flex justify-center w-[100%] mt-5 m-auto text-center rounded-lg">
          <div className="w-full max-h-[600px] overflow-hidden flex justify-center items-center rounded-xl">
            <img
              className="cta rounded-xl"
              width={"100%"}
              height={400}
              src={renderImage(article.image_url)}
              alt={article.title}
            />
          </div>
        </section>
        <section className="w-[70%] m-auto py-10 mb-10">
          <div
            className="text-sm md:text-lg text-gray-600 font-serif "
            dangerouslySetInnerHTML={{
              __html: documentToHtmlString(
                article.content,
                contentRendererOptions
              ),
            }}
          />
          <div className="mt-7">
            <Share absolute text={article.content} title={article.title} />
          </div>
        </section>
        <Footer />
      </div>
    </Suspense>
  );
};

export async function getServerSideProps(context: any) {
  const { id } = context.params;

  const entries = await client.getEntries({
    content_type: "eemodiaeArticle",
  });

  const sanitizedEntries: any =
    entries &&
    entries.items.map((item: any) => {
      return {
        ...item.fields,
        image: entries?.includes?.Asset?.[0].fields?.file.url,
      };
    });

  // If the post does not exist, return a 404 page
  if (!sanitizedEntries) {
    return {
      notFound: true,
    };
  }

  return {
    props: { article: sanitizedEntries[id] }, // Pass the post data to the component as props,
  };
}

export default Article;
