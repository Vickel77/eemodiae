import React, { useEffect } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import useContentful from "../../hooks/useContentful";
import { useRouter } from "next/router";
import { MdDownload, MdShare } from "react-icons/md";

export default function ItemDetails() {
  const router = useRouter();
  const _id: any = router.query.id;
  const id = _id?.split("_")[_id?.split("_").length - 1];

  const { getStore, store } = useContentful();

  const storeItem: StoreItem = store?.[+id!]!;

  const { image, title, media } = storeItem || {};

  useEffect(() => {
    getStore();
  }, []);

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
          height: "100vh",
          overflow: "hidden",
          paddingTop: "50px",
        }}
        className="text-black w-full text-center pb-20"
      >
        <div className="text-sm text-left inline-flex justify-center flex-wrap w-[100%] gap-20 px-10 mt-50">
          <header className="my-30 text-white max-w-[300px]   ">
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
          <div className="text-white overflow-scroll h-[90vh]">
            Chorus
            <br />
            Secret tears we shed
            <br />
            Secret burden we bare
            <br />
            Baba take dem all away
            <br />
            Make dem disappear <br />
            (×2)
            <br />
            <br />
            Verse 1<br />
            So many faces smiling
            <br />
            Beautiful people sparkling
            <br />
            Underneath, so many insects eating the leaving
            <br />
            Underneath, even the rich also cry
            <br />
            <br />
            You know my name o<br />
            You see my face o baba
            <br />
            You feel the pain
            <br />
            Am feeling deep inside <br />
            <br />
            Chorus <br />
            Secret tears we shed
            <br />
            Secret burden we bear
            <br />
            Take dem all away
            <br />
            Make dem disappear <br />
            <br />
            Verse 2<br />
            If money nor dey I worry
            <br />
            I borrow from person to person.
            <br />
            Nothing is ever enough
            <br />
            Nothing can make me happy enough <br />
            <br />
            I laugh and I play in the light
            <br />
            To keep it together, I smile
            <br />
            I just dey pretend, only to save face, I just dey display everything
            fake
            <br />
            <br />
            You know my name o<br />
            You see my face o baba! <br />
            You feel the pain
            <br />
            Am feeling deep inside. <br />
            <br />
            Chorus <br />
            Secret tears we shed
            <br />
            Secret burden we bear
            <br />
            <br />
            Baba take dem all away
            <br />
            Make dem disappear.
            <br />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
