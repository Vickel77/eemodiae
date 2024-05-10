import { useRouter } from "next/router";
import React, { Suspense, useEffect, useState } from "react";
import dp from "../../assets/DP.png";
import Head from "next/head";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import styled from "styled-components";
import { MdArrowLeft } from "react-icons/md";
import Footer from "../../components/Footer";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import useContentful from "../../hooks/useContentful";

const Blog = styled(({ className }) => {
  const router = useRouter();
  // const query =

  const id = router.query.id;
  // const query =
  const { getPoems, poems } = useContentful();

  console.log({ id: router.query.id });
  const poem: Poem = poems?.[+id!]!;

  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  // const [reRender, setReRender] = useState<boolean>(false);

  useEffect(() => {
    getPoems();
  }, []);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  // const poem = poems[Number(id)];
  if (!domContentLoaded || !poem) {
    return <>Loading...</>;
  }

  // const content = `<p> The protagonist is the most important character in a story, around whom the plot revolves.
  //     They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.
  //     Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him.
  //     ... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21).
  //     This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`;
  return (
    <Suspense fallback="">
      <Head>
        <title>{poem && poem.title}</title>
        <meta
          name="description"
          content={`MaterialsPro Blog - ${poem?.title}`}
        />
        <meta property="og:site_name" content="MaterialsPro" />
        <meta property="og:image" content={poem?.image} />

        <meta property="og:title" content={poem?.title} key="title" />
        <meta
          property="og:description"
          content="MaterialsPro Blog"
          key="description"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://materialspro.ng/blog/0${
            poem?.id
          }/${poem?.title?.replaceAll(" ", "_")}`}
        />
        <meta name="twitter:title" content={poem?.title} />
        <meta
          name="twitter:description"
          content="Access Bulk Building Materials on Time, as Scheduled, and at Great Value."
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@MaterialsProHQ" />
        {/* <meta property="twitter:image" content={poem?.image} /> */}
        <link
          rel="canonical"
          href={`https://materialspro.ng/blog/${
            poem?.id
          }/${poem?.title?.replaceAll(" ", "_")}`}
        />
      </Head>
      <Navbar />
      <main className={className}>
        <div className="w-[70%] m-auto text-primary pt-[5rem] ">
          <button
            onClick={() => router.back()}
            className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb-5"
          >
            <MdArrowLeft />
            Back
          </button>
          <h1 className="font-black">{poem.title}</h1>

          <div
            style={{
              background: ` -webkit-radial-gradient(#f5f5f5aa, #f5f5f5 70%) , url(${poem.image})`,
              backgroundSize: "cover",
            }}
            className={`poem-content text-primary bg-cover  bg-gradient-to-b from-[#00000099] to-[#00000033] min-h-[300px px-5] py-10 mb-5`}
          >
            <div
              className="text-primary text-lg"
              dangerouslySetInnerHTML={{
                __html: documentToHtmlString(poem?.content!),
              }}
            />
          </div>

          <section className="flex gap-5 w-full justify-between  mb-20">
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

// export const getServerSideProps = async ({ params }) => {
//   const blogNumber = params.view;

//   const {
//     data: { blogpoem },
//   } = await AxiosBlogConfig.get(
//     `blogpoem/getbyNumber?blogNumber=${blogNumber}`
//   );

//   return {
//     props: { blogpoem },
//   };
// };

export default Blog;
