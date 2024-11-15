import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ShopItme from "../../components/ShopItem";
import { books } from "../../lib/data";
import useContentful from "../../hooks/useContentful";
import Link from "next/link";
import scrollToSearchInput from "../../helpers/scrollToElementPosition";
import Pill from "../../components/Pill";
import musicBg from "../../assets/music-bg.png";

const Shop = styled(({ className }) => {
  const { getStore, store } = useContentful();

  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  console.log("music store ", store);
  useEffect(() => {
    getStore();
  }, []);

  return (
    <div className={className}>
      <Navbar />
      <main>
        <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[5%] top-[5%]  opacity-20 rounded-full z-0" />
        <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[5%] top-[15%] opacity-20 rounded-full z-0" />
        <img
          className="mix-blend-multiply absolute left-[50%] top-20 sm:top-0  translate-x-[-50%] opacity-10"
          src={musicBg.src}
          alt=""
          width="100%"
        />
        <header
          className={`relative text-center mt-20 mb-10 bg-cover text-secondary flex flex-col justify-center items-center`}
        >
          <h2 className="font-bold text-4xl">MUSIC</h2>
          <p>Explore soul lifting music</p>
        </header>

        <article className="relative">
          <section>
            <div className="flex flex-wrap sm:flex-nowrap   justify-center items-center sm:justify-between w-full m-auto my-4">
              <Pill label="RECENTLY ADDED" />
              <div className="search-bar-container w-full sm:w-1/3  mt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => scrollToSearchInput(searchInputRef)} // Scroll to top when search is focused
                  ref={searchInputRef} // Attach ref to the search input
                  onClick={() => scrollToSearchInput(searchInputRef)}
                  placeholder="🔍 Search music..."
                  className="search-bar   bg-[#ffffff] w-full sm:w-full rounded-md shadow-none focus:shadow-md px-4  border border-primary"
                />
              </div>
            </div>
            <div className="store-items mt-10">
              {store?.map((item, idx) => (
                <Link
                  key={idx}
                  href={{
                    pathname: `/shop/${+idx!}`,
                  }}
                >
                  <div data-aos="fade-up" data-aos-delay={100 * idx} key={idx}>
                    <ShopItme item={item} />
                  </div>
                </Link>
              ))}
              {/* {books.map((book, index) => (
                <div
                  data-aos="fade-up"
                  data-aos-delay={100 * index}
                  key={book.id}
                >
                  <ShopItme item={book} />
                </div>
              ))} */}
            </div>
          </section>
          {/* <section>
            <h4>MOST POPULAR</h4>
            <div className="store-items">
              {books.reverse().map((book, index) => (
                <div
                  data-aos="fade-up"
                  data-aos-delay={100 * index}
                  key={book.id}
                >
                  <ShopItme item={book} />
                </div>
              ))}
            </div>
          </section> */}
        </article>
      </main>
      <Footer />
    </div>
  );
})`
  main {
    width: 80%;
    margin: 0rem auto 4rem;
    padding-top: 5rem;
    color: ${({ theme }) => theme.colors.primary};

    .top-bar {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      margin-top: 1rem;
      border: 1px oslid red;

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
      grid-template-columns: repeat(auto-fit, minmax(300px, 0.9fr));
      gap: 1rem;
      // place-items: center;
      // place-content: center;
    }
  }
`;

export default Shop;
