// import Comment from "../../components/Comment";
// import AddComment from "../../components/Comment/AddComment";
import Footer from "../../components/Footer";
// import Like from "../../components/Like";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import dp from "../../assets/DP.png";

// import { parse } from "rss-to-json";
// import colors from "utils/colorlib";

import Head from "next/head";
import poems, { articles } from "../../lib/data";
import Image from "next/image";
import { MdArrowLeft } from "react-icons/md";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import useContentful from "../../hooks/useContentful";
import renderImage from "../../helpers/renderImage";
import Share from "../../components/Share";
import PageLoader from "../../components/PageLoader";
// import image from "..//../assets/p1.png";

const Blog = () => {
  const router = useRouter();
  const id = router.query.id;
  // const query =
  const { getArticles, articles } = useContentful();

  console.log({ id: router.query.id });
  const article: Article = articles?.[+id!]!;
  // const article: Article = JSON.parse(
  //   JSON.parse(JSON.stringify(router.query.article!))
  // );
  // // next-line @ts-ignore
  // console.log({ article });

  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingarticle, setLoadingarticle] = useState<boolean>(false);
  // const [reRender, setReRender] = useState<boolean>(false);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  useEffect(() => {
    getArticles();
    articles?.[+id!];
  }, []);

  // const article = articles[Number(id)];
  if (!domContentLoaded || !article) {
    return <PageLoader />;
  }
  // const router = useRouter()
  console.log({ article });

  const shareUrl = `https://eemodiae.org/articles/${id}?${article?.title.replace(
    / /g,
    "_"
  )}`;

  const contentRendererOptions = {
    preserveWhitespace: true,
  };

  return (
    <Suspense fallback="">
      <Head>
        <title>{article && article.title}</title>
        <meta name="description" content={`${article?.title}`} />
        <meta property="og:site_name" content="Eemodiae" />
        <meta property="og:image" content={article?.image} />

        <meta property="og:title" content={article?.title} key="title" />
        <meta
          property="og:description"
          content={`${article?.title}`}
          key="description"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://eemodiae.org/articles/${id}`}
        />
        <meta name="twitter:title" content={article?.title} />
        <meta name="twitter:description" content="" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta property="twitter:image" content={article?.image} />
        <link rel="canonical" href={shareUrl} />
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
            {/* <img src="../../assets/DP.png" alt="" width={200} /> */}
            <Image
              className="cta"
              // width={100}
              // width={

              src={dp}
              alt="Chat on whatsapp"
            />
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
          {/* <div
            style={{
              backgroundImage: `url(${article.image})`,
              backgroundSize: "cove",
              filter: "blur(100px",
            }}
            className="h-[inherit] w-full"
          /> */}
          <div className="w-full max-h-[600px] overflow-hidden flex justify-center items-center rounded-xl">
            <img
              className="cta rounded-xl"
              // width={"100%"}
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
        {/* <section className="w-[70%] m-auto py-5 mb-10 rounded-md border-1 border-primary">
          <h3>Add Comment</h3>
        </section> */}

        <Footer />
      </div>
    </Suspense>
  );
};

// export const getServerSideProps = async ({ params }) => {
//   const blogNumber = params.view;

//   const {
//     data: { blogarticle },
//   } = await AxiosBlogConfig.get(
//     `blogarticle/getbyNumber?blogNumber=${blogNumber}`
//   );

//   return {
//     props: { blogarticle },
//   };
// };

export default Blog;
