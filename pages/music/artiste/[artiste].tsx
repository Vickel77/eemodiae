import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import useContentful from "../../../hooks/useContentful";
import Link from "next/link";
import scrollToSearchInput from "../../../helpers/scrollToElementPosition";
import Pill from "../../../components/Pill";
import { Loader } from "../../../components/PageLoader";
import MusicCard from "../../../components/MusicCard";
import { useRouter } from "next/router";
import renderImage from "../../../helpers/renderImage";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import ArtisteCard from "../../../components/ArtisteCard";
import { MdArrowLeft } from "react-icons/md";

const Artiste = styled(({ className }) => {
  const router = useRouter();
  const artisteName: any = router.query.artiste;

  const {
    getMusic,
    music: _music,
    getArtiste,
    artiste: _artiste,
  } = useContentful();

  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const artiste = _artiste?.find(
    (v) => v.name.toLowerCase() === artisteName.toLowerCase()
  );
  const music = _music?.filter(
    (v) => v.artiste?.toLowerCase().trim() === artisteName?.toLowerCase().trim()
  );
  useEffect(() => {
    getMusic();
    getArtiste();
  }, []);

  const contentRendererOptions = {
    preserveWhitespace: true,
  };

  return (
    <div className={className}>
      <Navbar />

      <main>
        <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[5%] top-[5%]  opacity-20 rounded-full z-0" />
        <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[5%] top-[15%] opacity-20 rounded-full z-0" />
        <div className="relative"></div>

        <header
          className={`backdrop-blur-lg relative text-center p-10 mt-0 mb-10 bg-cover text-secondary flex flex-col justify-center items-center`}
        >
          <button
            onClick={() => router.push("/music")}
            className="z-20 self-start text-sm flex gap-2 items-center rounded-lg text-primary  pt-20 "
          >
            <MdArrowLeft />
            Back
          </button>
          <div
            style={{
              backgroundImage: `url(${renderImage(artiste?.imageUrl)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(10px)",
            }}
            className="absolute inset-0 rounded-lg opacity-20"
          ></div>
          <div className="grid place-items-center  px-10 w-full ">
            <p className="text-xl font-bold mb-0 text-primary">{artisteName}</p>

            <div
              className="text-primary text-sm opacity-80 font-serif w-[100%] md:w-1/2 mb-3"
              dangerouslySetInnerHTML={{
                __html: documentToHtmlString(
                  artiste?.bio!,
                  contentRendererOptions
                ),
              }}
            />
          </div>
          <div>
            {artiste && (
              <ArtisteCard hideName key={artiste?.name} item={artiste!} />
            )}
          </div>
        </header>

        <article className="relative px-10">
          <section>
            <div className=" ">
              <div className=" grid place-items-center md:place-items-start ">
                <div className="mb-5 ">
                  <Pill label={`Songs by ${artisteName}`} />
                </div>
                <div className="store-items w-full">
                  {music ? (
                    music?.map((item, idx) => (
                      <Link
                        key={idx}
                        href={{
                          pathname: `/music/${+idx!}`,
                        }}
                        className="max-w-[200px]"
                      >
                        <div
                          data-aos="fade-up"
                          data-aos-delay={100 * idx}
                          key={idx}
                          // className="max-w-[200px]"
                        >
                          <MusicCard item={item} />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <Loader />
                  )}
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
})`
  main {
    // width: 80%;
    margin: 0rem auto 4rem;
    // padding-top: 5rem;
    color: ${({ theme }) => theme.colors.primary};

    .top-bar {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      margin-top: 1rem;
      border: 1px solid red;

      @media (max-width: 767px) {
        width: 80%;
      }
    }
    .search-input {
      flex: 1;
      background: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
    }
    input,
    .btn {
      // padding: rem;
      font-size: 1rem;
    }
    button.btn {
      background: ${({ theme }) => theme.colors.primary};
      color: #fff;
    }
    section {
      margin: 2rem 0;
      h4 {
        padding-bottom: 0.5rem;
      }
      color: black;
    }

    .store-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      place-items: center;
      // place-content: center;
    }
  }
`;

export default Artiste;
