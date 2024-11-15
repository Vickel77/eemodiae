import React, { useEffect } from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ShopItme from "../../components/ShopItem";
import { books } from "../../lib/data";
import useContentful from "../../hooks/useContentful";
import Link from "next/link";

const Shop = styled(({ className }) => {
  const { getStore, store } = useContentful();

  useEffect(() => {
    getStore();
  }, []);

  return (
    <div className={className}>
      <Navbar />
      <main>
        <h4>Shop from our best collection of books worldwide.</h4>

        <div className="top-bar">
          <input placeholder="Search" className="search-input" type="text" />
          <button className="btn">SEARCH</button>
        </div>

        <article>
          <section>
            <h4>RECENTLY ADDED</h4>
            <div className="store-items">
              {store
                ?.filter((item) => item.category !== "song")
                .map((item, idx) => (
                  <Link
                    key={idx}
                    href={{
                      pathname: `/shop/${+idx!}`,
                    }}
                  >
                    <div
                      data-aos="fade-up"
                      data-aos-delay={100 * idx}
                      key={idx}
                    >
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
      padding: 1rem;
      font-size: 1.1rem;
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 0.9fr));
      gap: 1rem;
      place-items: center;
      place-content: center;
    }
  }
`;

export default Shop;
