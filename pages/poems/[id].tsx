// import Comment from "../../components/Comment";
// import AddComment from "../../components/Comment/AddComment";
import Footer from "../../components/Footer";
// import Like from "../../components/Like";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import React, { Suspense, useEffect, useState } from "react";
import styles from "styles/post.module.css";

// import { parse } from "rss-to-json";
// import colors from "utils/colorlib";

import Head from "next/head";

const Blog = () => {
  const router = useRouter();

  let post: any;
  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingPost, setLoadingPost] = useState<boolean>(false);
  // const [reRender, setReRender] = useState<boolean>(false);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  const getPost = () => router.replace("/");
  // const post = posts[Number(postId)];
  if (!domContentLoaded) {
    return <></>;
  }

  // console.log("post ", props);
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
            post?.blogNumber
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
            post?.blogNumber
          }/${post?.title.replaceAll(" ", "_")}`}
        />
      </Head>
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
