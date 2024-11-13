import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import Footer from "../../components/Footer";
import useContentful from "../../hooks/useContentful";
import MessageCard from "../../components/MessageCard";
import CategoryCard from "../../components/MessageCard/CategoryCard";
import PageLoader from "../../components/PageLoader";

export default function Messages() {
  const router = useRouter();

  const { getMessages, messages } = useContentful();

  useEffect(() => {
    getMessages();
  }, []);

  const [categories, setCategories] = useState<string[]>([]);
  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);

  // Search and Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 15;

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

  // Filter messages based on search query
  const filteredMessages = messages?.filter((message) =>
    message.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories?.filter((message) =>
    message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate the messages to display for the current page
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages?.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
      <div className="mt-[5rem] w-[80%] m-auto mb-10">
        <header className="text-center text-secondary mb-5 h-[50vh] flex flex-col justify-center items-center">
          <h2 className="font-bold text-4xl">MESSAGES</h2>
          <p>Download and listen to life-transforming messages</p>

          {/* Search Bar */}
          <div className="search-bar-container w-full mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search messages..."
              className="search-bar font-[1rem] bg-white w-full rounded-md shadow-none focus:shadow-md px-4 py-2 border"
            />
          </div>
        </header>

        {/* Categories */}
        <div className="flex overflow-x-auto w-full overflow-hidden gap-3">
          {filteredCategories.map((category, idx) => {
            const categoryMessages = messages?.find(
              (m) => m.category === category
            );
            return (
              <CategoryCard
                key={idx}
                category={{
                  title: category,
                  image: categoryMessages?.imageUrl?.fields?.file.url!,
                }}
                categoryMessage={{ ...categoryMessages! }}
              />
            );
          })}
        </div>

        <div className="bg-primary h-[1px] w-full opacity-50 my-5" />

        {/* Display Filtered Messages */}
        <div className="flex gap-5 flex-wrap justify-center md:justify-start">
          {currentMessages
            ?.filter((m) => m?.category === undefined)
            ?.map((message, idx) => (
              <MessageCard message={message} key={idx} />
            ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-primary underline rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, page) => (
            <button
              key={page}
              onClick={() => paginate(page + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === page + 1 ? "text-primary" : "bg-light"
              }`}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2  text-primary underline rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
