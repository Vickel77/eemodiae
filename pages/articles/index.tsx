import React, { useState } from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import poems, { articles } from "../../lib/data";
import CreatePoem from "../../components/Modals/CreatePoem";
import ArticleCard from "../../components/ArticleCard";
import {} from "react-icons";
import useAuth from "../../hooks/useAuth";

const Articles = styled(({ className }) => {
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={className}>
      <Navbar />
      <div className="content">
        <header>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">ARTICLES</h2>
            {isLoggedIn && (
              <div>
                <button
                  onClick={() => setShowModal(true)}
                  type="button"
                  className="justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-50 sm:ml-3 sm:w-auto"
                >
                  CREATE ARTICLE
                </button>
              </div>
            )}
          </div>
        </header>
        <CreatePoem
          showModal={showModal}
          onCancel={() => setShowModal(false)}
        />
        <section className="main-section">
          {articles.map((poem, idx) => (
            <ArticleCard
              className={idx === 0 ? "first-item" : ""}
              key={poem.id}
              article={poem}
            />
          ))}
        </section>
      </div>
      <Footer />
    </div>
  );
})`
  color: ${({ theme }) => theme.colors.white};
  .content {
    padding-top: 5rem;
    width: 80%;
    margin: 0 auto 4rem;
    color: ${({ theme }) => theme.colors.secondary};
  }
  .main-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 2rem;
    gap: 1rem;
  }
  .first-item {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }

  @media (max-width: 767px) {
    .main-section {
      grid-template-columns: 1fr;
    }
    .first-item {
      grid-column: 1 / 2;
      grid-row: 1 / 2;
    }
  }
`;

export default Articles;
