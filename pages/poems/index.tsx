import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import PeomCard from "../../components/PeomCard";
import _poems from "../../lib/data";
import CreatePoem from "../../components/Modals/PoemModal";
import useAuth from "../../hooks/useAuth";
import handleRequestUrl from "../../util/handleRequestUrl";
import useContentful from "../../hooks/useContentful";

const API_URL = process.env.API_URL_LOCAL;

// const getPoems = async()=> {
//   const res = fetch(`${API_URL}`);
//   return res.json();
// }

// export const getStaticProps = async (context: any) => {
//   const res = await fetch(handleRequestUrl());
//   const {
//     data: { poems },
//   } = await res.json();

//   return { props: { poems } };
// };

const Poems = styled(({ className }) => {
  const { isLoggedIn } = useAuth();

  const { getPoems, poems } = useContentful();

  useEffect(() => {
    getPoems();
  }, []);

  const [showModal, setShowModal] = useState(false);
  return (
    <div className={className}>
      <Navbar />
      <div className="content">
        <header>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">POEMS</h2>
            {isLoggedIn && (
              <div>
                <button
                  onClick={() => setShowModal(true)}
                  type="button"
                  className="justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-50 sm:ml-3 sm:w-auto"
                >
                  CREATE POEM
                </button>
              </div>
            )}
          </div>
        </header>
        <CreatePoem
          handleSubmit={() => null}
          showModal={showModal}
          onCancel={() => setShowModal(false)}
        />
        <section className="main-section">
          {poems?.map((poem: Poem, idx: number) => (
            <PeomCard
              className={idx === 0 ? "first-item" : ""}
              key={idx}
              id={idx}
              poem={poem}
              setShowModal={setShowModal}
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
