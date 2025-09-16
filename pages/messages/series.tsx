import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import Footer from "../../components/Footer";
import useContentful from "../../hooks/useContentful";
import PageLoader from "../../components/PageLoader";
import scrollToSearchInput from "../../helpers/scrollToElementPosition";
import Pill from "../../components/Pill";
import SeriesCard from "../../components/MessageCard/SeriesCard";

export default function SeriesPage() {
  const router = useRouter();

  const { getMessages, messages } = useContentful();

  useEffect(() => {
    getMessages();
  }, []);

  const [categories, setCategories] = useState<string[]>([]);
  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  // Search and Pagination state
  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const seriesPerPage = 6;

  const initMessages = useCallback(() => {
    messages?.map((message) => {
      if (categories.includes(message.category)) {
        return;
      }
      if (message.category) {
        setCategories((prev) => [...prev, message.category]);
      }
    });
  }, [messages]);

  useEffect(() => {
    initMessages();
  }, [messages]);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  // Filter categories based on search query
  const filteredCategories = categories?.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate the series to display for the current page
  const indexOfLastSeries = currentPage * seriesPerPage;
  const indexOfFirstSeries = indexOfLastSeries - seriesPerPage;
  const currentSeries = filteredCategories?.slice(
    indexOfFirstSeries,
    indexOfLastSeries
  );

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!domContentLoaded || !messages) {
    return <PageLoader />;
  }

  // Calculate total pages
  const totalPages = Math.ceil(
    (filteredCategories?.length || 0) / seriesPerPage
  );

  return (
    <div>
      <Navbar />
      <div className="pt-[5rem] w-[80%] m-auto mb-10">
        <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[50%] top-[5%]  opacity-10 rounded-full z-0" />
        <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[50%] top-[15%] opacity-10 rounded-full z-0" />
        <header
          className={`relative text-center mt-20 mb-10 text-secondary flex flex-col justify-center items-center`}
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ← Back
            </button>
            <h2 className="font-bold text-4xl">MESSAGE SERIES</h2>
          </div>
          <p>Explore complete message series and collections</p>

          {/* Search Bar */}
          <div className="search-bar-container w-full mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => scrollToSearchInput(searchInputRef)}
              ref={searchInputRef}
              onClick={() => scrollToSearchInput(searchInputRef)}
              placeholder="🔍 Search series..."
              className="search-bar font-[1rem] bg-[#ffffff55] w-full rounded-md shadow-none focus:shadow-md px-4 py-2 border"
            />
          </div>
        </header>

        {/* Display Series */}
        <div className="mb-5">
          <Pill label="Series" />
          <p className="text-sm text-gray-600 mt-2">
            Showing {currentSeries?.length || 0} of {filteredCategories?.length || 0} series
          </p>
        </div>

        <div key={currentPage} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSeries?.map((category, idx) => {
            const categoryMessages = messages?.filter(
              (m) => m.category === category
            );
            const firstMessage = categoryMessages?.[0];
            
            return (
              <SeriesCard
                key={idx}
                series={{
                  title: category,
                  image: firstMessage?.imageUrl?.fields?.file.url!,
                  messageCount: categoryMessages?.length,
                }}
                categoryMessage={{ ...firstMessage! }}
              />
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-primary underline rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Show page numbers with ellipsis for large numbers */}
            {totalPages <= 7 ? (
              [...Array(totalPages)].map((_, page) => (
                <button
                  key={page}
                  onClick={() => paginate(page + 1)}
                  className={`px-4 py-2 rounded transition-colors ${
                    currentPage === page + 1 
                      ? "bg-primary text-white" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {page + 1}
                </button>
              ))
            ) : (
              <>
                {/* First few pages */}
                {currentPage <= 4 && (
                  <>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-4 py-2 rounded transition-colors ${
                          currentPage === page 
                            ? "bg-primary text-white" 
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="px-2 py-2">...</span>
                    <button
                      onClick={() => paginate(totalPages)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                {/* Middle pages */}
                {currentPage > 4 && currentPage < totalPages - 3 && (
                  <>
                    <button
                      onClick={() => paginate(1)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      1
                    </button>
                    <span className="px-2 py-2">...</span>
                    {[currentPage - 1, currentPage, currentPage + 1].map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-4 py-2 rounded transition-colors ${
                          currentPage === page 
                            ? "bg-primary text-white" 
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="px-2 py-2">...</span>
                    <button
                      onClick={() => paginate(totalPages)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                {/* Last few pages */}
                {currentPage >= totalPages - 3 && (
                  <>
                    <button
                      onClick={() => paginate(1)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      1
                    </button>
                    <span className="px-2 py-2">...</span>
                    {[totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages].map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-4 py-2 rounded transition-colors ${
                          currentPage === page 
                            ? "bg-primary text-white" 
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-primary underline rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 