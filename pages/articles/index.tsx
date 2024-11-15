import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CreatePoem from "../../components/Modals/PoemModal";
import ArticleCard from "../../components/ArticleCard";
import useAuth from "../../hooks/useAuth";
import useContentful from "../../hooks/useContentful";
import PageLoader from "../../components/PageLoader";
import scrollToSearchInput from "../../helpers/scrollToElementPosition";

const Articles = styled(({ className }) => {
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const { getArticles, articles } = useContentful();
  const [domContentLoaded, setDomContentLoaded] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArticles, setFilteredArticles] = useState<
    Article[] | undefined
  >([]);

  // Ref for the search input
  const searchInputRef = useRef<any>(null);

  useEffect(() => {
    getArticles();
  }, []);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  useEffect(() => {
    // Filter articles based on the search query
    if (searchQuery) {
      setFilteredArticles(
        articles?.filter((article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  // Calculate indices for items to show based on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculate total number of pages
  const totalPages = Math.ceil(filteredArticles?.length! / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Scroll to the search input field when it is focused
  // const scrollToSearchInput = () => {
  //   if (searchInputRef.current) {
  //     searchInputRef.current?.scrollIntoView({
  //       behavior: "smooth",
  //       // block: "top",
  //     });
  //   }
  // };

  if (!domContentLoaded || !articles) {
    return <PageLoader />;
  }
  return (
    <div className={className}>
      <Navbar />
      <div className="content">
        <header>
          <div className="flex items-center justify-between">
            <div className="w-[200px] h-[300px] bg-primary blur-3xl absolute left-[50%] top-[5%]  opacity-10 rounded-full z-0" />
            <div className="w-[200px] h-[300px] bg-danger blur-3xl absolute right-[50%] top-[15%] opacity-10 rounded-full z-0" />
            <header className="text-center w-full mt-20 sm:mb-10 mb-0 text-secondary  flex flex-col justify-center items-center bg-cover bg-[url('/assets/book1.png')] relative">
              <h2 className="font-bold text-center">ARTICLES</h2>
              {/* Search Bar */}
              <div className="search-bar-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => scrollToSearchInput(searchInputRef)} // Scroll to top when search is focused
                  ref={searchInputRef} // Attach ref to the search input
                  onClick={() => scrollToSearchInput(searchInputRef)}
                  placeholder="🔍 Search articles..."
                  className="search-bar bg-transparent focus:bg-[#ffffff55] w-full shadow-none focus:shadow-md "
                />
              </div>
            </header>
            {isLoggedIn && (
              <button
                onClick={() => setShowModal(true)}
                type="button"
                className="justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-50 sm:ml-3 sm:w-auto"
              >
                CREATE ARTICLE
              </button>
            )}
          </div>
        </header>

        <CreatePoem
          showModal={showModal}
          onCancel={() => setShowModal(false)}
        />
        <section className="main-section relative">
          {currentArticles?.map((article, idx) => (
            <ArticleCard
              id={idx}
              className={idx === 0 ? "first-item" : ""}
              key={idx}
              article={article}
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
          <span className="page-info text-sm">
            {currentPage} / {totalPages}
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
    padding: 0.5rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
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
    // font-size: 1rem;
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

export default Articles;
