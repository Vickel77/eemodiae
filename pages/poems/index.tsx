import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import PeomCard from "../../components/PeomCard";
import CreatePoem from "../../components/Modals/PoemModal";
import useAuth from "../../hooks/useAuth";
import useContentful from "../../hooks/useContentful";
import PageLoader from "../../components/PageLoader";

const Poems = styled(({ className }) => {
  const { isLoggedIn } = useAuth();
  const { getPoems, poems } = useContentful();

  const [domContentLoaded, setDomContentLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPoems, setFilteredPoems] = useState<any>([]);

  useEffect(() => {
    getPoems();
  }, []);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  useEffect(() => {
    // Filter poems based on the search query
    if (searchQuery) {
      setFilteredPoems(
        poems?.filter((poem) =>
          poem?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredPoems(poems);
    }
  }, [searchQuery, poems]);

  // Calculate indices for the items to show based on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPoems = filteredPoems?.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination controls
  const totalPages = Math.ceil(filteredPoems?.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (!domContentLoaded || !poems) {
    return <PageLoader />;
  }

  return (
    <div className={className}>
      <Navbar />
      <div className="content">
        <header>
          <div className="flex items-center justify-between">
            <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[80%] top-[5%]  opacity-10 rounded-full z-0" />
            <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[90%] top-[15%] opacity-10 rounded-full z-0" />
            <header className="text-center h-[30vh] w-full text-secondary mb-5 flex flex-col justify-center items-center relative">
              <h2 className="font-bold">POEMS</h2>
              <div className="search-bar-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search poems..."
                  className="search-bar  bg-transparent focus:bg-[#ffffff55] w-full shadow-none focus:shadow-md border-none"
                />
              </div>
            </header>

            {isLoggedIn && (
              <button
                onClick={() => setShowModal(true)}
                type="button"
                className="justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-50 sm:ml-3 sm:w-auto"
              >
                CREATE POEM
              </button>
            )}
          </div>
        </header>

        {/* Search Bar */}

        <CreatePoem
          handleSubmit={() => null}
          showModal={showModal}
          onCancel={() => setShowModal(false)}
        />
        <section className="main-section  relative">
          {currentPoems?.map((poem: any, idx: number) => (
            <PeomCard
              className={idx === 0 ? "first-item" : ""}
              key={poem.id || idx}
              id={idx}
              poem={poem}
              setShowModal={setShowModal}
            />
          ))}
        </section>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Prev
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
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

  .search-bar-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .search-bar {
    width: 100%;
    // max-width: 600px;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
    // border-radius: 8px;
    font-size: 1rem;
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

  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    gap: 1rem;
  }

  .pagination-btn {
    text-decoration: underline;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.primary};

    &:disabled {
      background-color: ${({ theme }) => theme.colors.gray};
      cursor: not-allowed;
    }
  }

  .page-info {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.primary};
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
