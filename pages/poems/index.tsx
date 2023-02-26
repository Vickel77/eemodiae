import React from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import PeomCard from "../../components/PeomCard";
import poems from "../../lib/data";

const Poems = styled(({ className }) => {
  return (
    <div className={className}>
      <Navbar />
      <div className="content">
        <header>
          <h2>PEOMS</h2>
        </header>
        <section className="main-section">
          {poems.map((poem, idx) => (
            <PeomCard
              className={idx === 0 ? "first-item" : ""}
              key={poem.id}
              poem={poem}
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

export default Poems;
