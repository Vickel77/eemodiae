import { useRouter } from "next/router";
import React, { Suspense } from "react";
import dp from "../../assets/DP.png";
import Head from "next/head";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import styled from "styled-components";
import { MdArrowLeft } from "react-icons/md";
import Footer from "../../components/Footer";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import renderImage from "../../helpers/renderImage";
import Share from "../../components/Share";
import PageLoader from "../../components/PageLoader";
import { createClient } from "contentful";
import { smallDescription } from "../../util/removeHtmlTags";

const client = createClient({
  space: "7rf3l1j0b9zd",
  accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
});

const Blog = styled(({ className, poem }: { className: any; poem: Poem }) => {
  const router = useRouter();
  const id = router.query.id;

  if (router.isFallback) {
    return <PageLoader />;
  }

  const shareUrl = `https://eemodiae.org/poems/${id}?${poem?.title?.replace(
    / /g,
    "_"
  )}`;

  const contentRendererOptions = {
    preserveWhitespace: true,
  };

  return (
    <Suspense fallback="">
      <Head>
        <title>{(poem && poem.title) || "Eemodiae Poems"}</title>

        <meta
          name="description"
          content={
            smallDescription(poem.content) ||
            "Explore inspiring poems on Eemodiae."
          }
        />
        <link rel="canonical" href={shareUrl} />

        {/* Open Graph Tags */}
        <meta property="og:site_name" content="Eemodiae" />
        <meta
          property="og:title"
          content={poem?.title || "Eemodiae Poems"}
          key="title"
        />
        <meta
          property="og:description"
          content={
            smallDescription(poem.content) ||
            "Explore inspiring poems on Eemodiae."
          }
          key="description"
        />
        <meta
          property="og:image"
          content={`https:${renderImage(poem?.image_url)}`}
        />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta
          property="og:image:alt"
          content={poem?.title || "Eemodiae Poem"}
        />

        {/* Twitter */}

        <meta name="twitter:title" content={poem?.title} />
        <meta
          name="twitter:description"
          content={smallDescription(poem.content)}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta
          property="twitter:image"
          content={`https:${renderImage(poem?.image_url)}`}
        />
        <meta
          name="twitter:image:alt"
          content={poem?.title || "Eemodiae Poem"}
        />
      </Head>
      <Navbar />
      <main className={className}>
        <div className="w-[80%] md:w-[70%] m-auto text-primary pt-[5rem] ">
          <button
            onClick={() => router.push("/poems")}
            className="text-sm flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb-5"
          >
            <MdArrowLeft />
            Back
          </button>
          <h1 className="font-black text-2xl md:text-3xl">{poem.title}</h1>
          <section>
            <div
              style={{
                background: `-webkit-radial-gradient(#f5f5f5aa, #f5f5f5 70%) , url(${renderImage(
                  poem.image_url
                )})`,
                backgroundSize: "cover",
              }}
              className={`poem-content w-full text-primary bg-cover  bg-gradient-to-b from-[#00000099] to-[#00000033] min-h-[300px px-5] py-10 `}
            >
              <div
                className="text-primary text-sm md:text-lg opacity-80 font-serif "
                dangerouslySetInnerHTML={{
                  __html: documentToHtmlString(
                    poem?.content!,
                    contentRendererOptions
                  ),
                }}
              />
            </div>
          </section>
          <section className="flex flex-wrap-reverse gap-5 w-full justify-center md:justify-between items-center   ">
            <aside className="flex gap-5 items-center">
              <div className="rounded-full">
                {/* <img src="../../assets/DP.png" alt="" width={200} /> */}
                <Image
                  className="cta"
                  width={100}
                  src={dp}
                  alt="Chat on whatsapp"
                />
              </div>
              <div className="text-sm">
                <em>Written by:</em>
                <br />
                <b> Pst Emmanuel I. Emodiae</b>
                <p>Prophet Preacher Poet</p>
                <p>@eemodiae</p>
              </div>
            </aside>
            <aside>
              <div className="min-w-[300px]  max-w-[400px] p-3 rounded-xl bg-primaryAccent ">
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: documentToHtmlString(poem?.scripture!),
                  }}
                />
              </div>
            </aside>
          </section>
          <div className="mb-10 mt-7">
            <Share text={poem.content} title={poem?.title} />
          </div>
        </div>
        <Footer />
      </main>
    </Suspense>
  );
})`
  .poem-content {
    // background: -webkit-linear-gradient(#00000055, #000000aa);
    background-size: cover;
  }
`;

export async function getServerSideProps(context: any) {
  const { id } = context.params;

  const entries = await client.getEntries({
    content_type: "eemodiae",
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
    props: {
      poem: sanitizedEntries[id], // Pass the post data to the component as props
    },
  };
}

export default Blog;
