import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import Footer from "../../components/Footer";
import useContentful from "../../hooks/useContentful";
import MessageCard from "../../components/MessageCard";
import PageLoader from "../../components/PageLoader";
import scrollToSearchInput from "../../helpers/scrollToElementPosition";
import Pill from "../../components/Pill";

export default function AllMessages() {
  const router = useRouter();

  const { getMessages, messages } = useContentful();

  useEffect(() => {
    getMessages();
  }, []);

  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  // Search and Pagination state
  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 6;

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  // Filter messages based on search query (only non-series messages)
  const filteredMessages = messages?.filter((message) =>
    message.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
    message.category === undefined
  );

  // Calculate the messages to display for the current page
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages?.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );

  // Handle page change
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!domContentLoaded || !messages) {
    return <PageLoader />;
  }

  // Calculate total pages
  const totalPages = Math.ceil(
    (filteredMessages?.length || 0) / messagesPerPage
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
            <h2 className="font-bold text-4xl">ALL MESSAGES</h2>
          </div>
          <p>Browse and download all life-transforming messages</p>

          {/* Search Bar */}
          <div className="search-bar-container w-full mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => scrollToSearchInput(searchInputRef)}
              ref={searchInputRef}
              onClick={() => scrollToSearchInput(searchInputRef)}
              placeholder="🔍 Search messages..."
              className="search-bar font-[1rem] bg-[#ffffff55] w-full rounded-md shadow-none focus:shadow-md px-4 py-2 border"
            />
          </div>
        </header>

        {/* Display Filtered Messages */}
        <div className="mb-5">
          <Pill label="Messages" />
          <p className="text-sm text-gray-600 mt-2">
            Showing {currentMessages?.length || 0} of {filteredMessages?.length || 0} messages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMessages?.map((message, idx) => (
            <MessageCard message={message} key={idx} />
          ))}
        </div>

        {/* Pagination Controls */}
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
            [...Array(totalPages > 0 ? totalPages : 1)].map((_, page) => (
              <button
                key={page}
                onClick={() => paginate(page + 1)}
                className={`px-4 py-2 rounded transition-colors font-semibold ${
                  currentPage === page + 1 
                    ? "bg-primary text-white border border-primary" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                disabled={totalPages === 1}
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
                      className={`px-4 py-2 rounded transition-colors font-semibold ${
                        currentPage === page 
                          ? "bg-primary text-white border border-primary" 
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
                      className={`px-4 py-2 rounded transition-colors font-semibold ${
                        currentPage === page 
                          ? "bg-primary text-white border border-primary" 
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
                      className={`px-4 py-2 rounded transition-colors font-semibold ${
                        currentPage === page 
                          ? "bg-primary text-white border border-primary" 
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
      </div>
      <Footer />
    </div>
  );
} 