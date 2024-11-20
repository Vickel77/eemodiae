import React, { useEffect } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import useContentful from "../../hooks/useContentful";
import { useRouter } from "next/router";
import { MdDownload, MdShare } from "react-icons/md";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import AudioPlayer from "react-h5-audio-player";

export default function ItemDetails() {
  const router = useRouter();
  const _id: any = router.query.id;
  const id = _id?.split("_")[_id?.split("_").length - 1];

  const { getStore, store } = useContentful();

  const storeItem: StoreItem = store?.[+id!]!;

  const { image, title, media, lyrics } = storeItem || {};

  console.log({ storeItem });

  useEffect(() => {
    getStore();
  }, []);

  const contentRendererOptions = {
    preserveWhitespace: true,
  };

  return (
    <div>
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
        className="text-black w-full text-center pb-20"
      >
        <div className="text-sm text-left inline-flex justify-center flex-wrap w-[100%] gap-20 px-10 mt-50">
          <header className="my-30 text-white max-w-[300px] mt-20  ">
            <div className="rounded-lg overflow-hidden">
              <img src={image} alt="" />
            </div>

            <div className="text-center">
              <p className="text-lg">{title}</p>
              <small>Samuel Emodiae</small>
            </div>
            <div className="flex gap-3 mt-3 justify-center">
              <a href={media?.fields?.file?.url} download={title}>
                <button className="btn bg-white text-primary flex gap-2 items-center">
                  Download <MdDownload />
                </button>
              </a>
              <button className="btn bg-white text-primary flex gap-2 items-center">
                Share <MdShare />
              </button>
            </div>
          </header>
          <div className="bg-white text-md">
            <AudioPlayer
              src={media?.fields?.file?.url}
              autoPlay={false}
              // showJumpControls={false}
              customAdditionalControls={[]}
              layout="stacked-reverse"
              customVolumeControls={[]}
              style={{
                width: "100%",
                // backgroundColor: "transparent",
              }}
              showDownloadProgress
            />
          </div>
          <div className="text-white ">
            <div
              dangerouslySetInnerHTML={{
                __html: documentToHtmlString(lyrics, contentRendererOptions),
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
