// import Comment from "../../components/Comment";
// import AddComment from "../../components/Comment/AddComment";
import Footer from "../../components/Footer";
// import Like from "../../components/Like";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import React, { Suspense, useEffect, useState } from "react";
import dp from "../../assets/DP.png";

// import { parse } from "rss-to-json";
// import colors from "utils/colorlib";

import Head from "next/head";
import poems, { articles } from "../../lib/data";
import Image from "next/image";
import { MdArrowLeft } from "react-icons/md";
// import image from "..//../assets/p1.png";

const Blog = () => {
  const router = useRouter();
  // const query =
  const id = router.query.id;

  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingPost, setLoadingPost] = useState<boolean>(false);
  // const [reRender, setReRender] = useState<boolean>(false);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  const getPost = () => router.replace("/");
  const post = articles[Number(id)];
  if (!domContentLoaded || !post) {
    return <></>;
  }
  // const router = useRouter()

  return (
    <Suspense fallback="">
      <Head>
        <title>{post && post.title}</title>
        <meta
          name="description"
          content={`MaterialsPro Blog - ${post?.title}`}
        />
        <meta property="og:site_name" content="MaterialsPro" />
        <meta property="og:image" content={post?.image} />

        <meta property="og:title" content={post?.title} key="title" />
        <meta
          property="og:description"
          content="MaterialsPro Blog"
          key="description"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://materialspro.ng/blog/0${
            post?.id
          }/${post?.title.replaceAll(" ", "_")}`}
        />
        <meta name="twitter:title" content={post?.title} />
        <meta
          name="twitter:description"
          content="Access Bulk Building Materials on Time, as Scheduled, and at Great Value."
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@MaterialsProHQ" />
        <meta property="twitter:image" content={post?.image} />
        <link
          rel="canonical"
          href={`https://materialspro.ng/blog/${
            post?.id
          }/${post?.title.replaceAll(" ", "_")}`}
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
          <h1 className="font-black">{post.title}</h1>
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
          <img
            className="cta rounded-xl"
            // width={"100%"}
            height={400}
            src={post.image}
            alt="Chat on whatsapp"
          />
        </section>
        <section className="w-[70%] m-auto py-5 mb-10">
          <div
            // className="text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </section>

        <Footer />
      </div>
    </Suspense>
  );
};

// export const getServerSideProps = async ({ params }) => {
//   const blogNumber = params.view;

//   const {
//     data: { blogPost },
//   } = await AxiosBlogConfig.get(
//     `blogpost/getbyNumber?blogNumber=${blogNumber}`
//   );

//   return {
//     props: { blogPost },
//   };
// };

export default Blog;
