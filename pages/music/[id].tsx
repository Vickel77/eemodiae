import React, { useRef } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import { MdArrowLeft, MdDownload } from "react-icons/md";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import Share from "../../components/Share";
import Head from "next/head";
import renderImage from "../../helpers/renderImage";
import PageLoader from "../../components/PageLoader";
import getEntries from "../../util/getEntries";
import { createClient } from "contentful";

export default function ItemDetails({ music }: { music: Music[] }) {
  const router = useRouter();
  const _id: any = router.query.id;
  const id = _id?.split("_")[_id?.split("_").length - 1];

  const shareRef = useRef<any>(null);

  const handleShareClick = () => {
    if (shareRef.current) {
      shareRef?.current?.click(); // Trigger the click event on the Share component
    }
  };

  const storeItem: Music = music?.[+id!]!;

  const { image, title, audio, lyrics, artiste, imageUrl } = storeItem || {};

  // console.log({ storeItem });

  const contentRendererOptions = {
    preserveWhitespace: true,
  };
  const shareUrl = `https://eemodiae.org/music/${id}?${title?.replace(
    / /g,
    "_"
  )}`;

  if (!storeItem) {
    return <PageLoader />;
  }
  return (
    <>
      <Head>
        <title>{`${title}` || "Eemodiae Music"}</title>

        <meta name="description" content={`by ${artiste}`} />
        <link rel="canonical" href={shareUrl} />

        {/* Open Graph Tags */}
        <meta property="og:site_name" content="Eemodiae" />
        <meta
          property="og:title"
          content={`${title}` || "Eemodiae Music"}
          key="title"
        />
        <meta
          property="og:description"
          content={`by ${artiste}`}
          key="description"
        />
        <meta property="og:image" content={`https:${renderImage(imageUrl)}`} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image:alt" content={title || "Eemodiae Music"} />

        {/* Twitter */}

        <meta name="twitter:title" content={title} />
        <meta
          name="twitter:description"
          content={"Explore great music on Eemodiae."}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta
          property="twitter:image"
          content={`https:${renderImage(imageUrl)}`}
        />
        <meta name="twitter:image:alt" content={title || "Eemodiae Music"} />
      </Head>
      <Navbar />
      <div
        style={{
          background: `-webkit-radial-gradient(#3624A7aa, #3624A7aa 70%), url(${image})`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          // height: "100vh",
          // overflow: "hidden",
          paddingTop: "50px",
        }}
        className="text-black w-full text-center pb-20 relative min-h-screen "
      >
        <button
          onClick={() => router.push("/music")}
          className="text-sm flex gap-2 items-center rounded-lg text-white  mb-5 pt-20 ml-32"
        >
          <MdArrowLeft />
          Back
        </button>
        <div className="relative text-sm text-left flex justify-center flex-wrap w-[100%] gap-20 px-10 mt-50  ">
          <header
            style={{ alignSelf: "start" }}
            className="my-30 text-white max-w-[300px] sticky top-20  "
          >
            <div className="rounded-lg overflow-hidden">
              <img src={renderImage(imageUrl)} alt="" />
            </div>
            <div className="bg-[#ffffffaa] text-primary">
              <div className="text-center">
                <p className="text-lg">{title}</p>
                <small>{artiste}</small>
              </div>

              <AudioPlayer
                src={audio?.fields?.file?.url}
                autoPlay={false}
                // showJumpControls={false}
                customAdditionalControls={[]}
                layout="stacked-reverse"
                customVolumeControls={[]}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                }}
                showDownloadProgress
              />
            </div>
            <div className="flex mt-3  gap-3 justify-between">
              <button
                onClick={handleShareClick}
                className="btn bg-white w-full text-primary flex gap-2 items-center"
              >
                <Share
                  ref={shareRef}
                  text={title}
                  title={title}
                  icon
                  iconText={"Share"}
                />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  fetch(audio?.fields?.file?.url)
                    .then((response) => response.blob())
                    .then((blob) => {
                      const blobURL = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = blobURL;
                      link.download = title || "download";
                      link.click();
                      window.URL.revokeObjectURL(blobURL); // Clean up
                    });
                }}
                className="btn bg-white w-[100%s] text-primary flex gap-2 items-center"
              >
                Download <MdDownload />
              </button>
            </div>
          </header>

          <div className="text-white  ">
            <div
              dangerouslySetInnerHTML={{
                __html: documentToHtmlString(lyrics, contentRendererOptions),
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export async function getServerSideProps(context: any) {
  const client = createClient({
    space: "7rf3l1j0b9zd",
    accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
  });

  const entries = await client.getEntries({
    content_type: "eemodiaeMusic",
  });

  const sanitizedEntries: any =
    entries &&
    entries.items.map((item: any) => {
      return {
        ...item.fields,
        image: entries?.includes?.Asset?.[0].fields?.file.url,
      };
    });

  // If the data does not exist, return a 404 page
  if (!sanitizedEntries) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      music: sanitizedEntries, // Pass the Music data to the component as props
    },
  };
}
