import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import Footer from "../../components/Footer";
import useContentful from "../../hooks/useContentful";
import MessageCard from "../../components/MessageCard";
import SeriesCard from "../../components/MessageCard/SeriesCard";
import PageLoader from "../../components/PageLoader";

import scrollToSearchInput from "../../helpers/scrollToElementPosition";
import Pill from "../../components/Pill";

export default function Messages() {
  const router = useRouter();

  const { getMessages, messages } = useContentful();

  useEffect(() => {
    getMessages();
  }, []);

  const [categories, setCategories] = useState<string[]>([]);
  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  // Search state
  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Show only first 3 messages and 3 series
  const displayedMessages = filteredMessages?.filter((m) => m?.category === undefined).slice(0, 3);
  const displayedCategories = filteredCategories?.slice(0, 3);

  if (!domContentLoaded || !messages) {
    return <PageLoader />;
  }

  return (
    <div>
      <Navbar />
      <div className="pt-[5rem] w-[80%] m-auto mb-10">
        <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[50%] top-[5%]  opacity-10 rounded-full z-0" />
        <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[50%] top-[15%] opacity-10 rounded-full z-0" />
        <header
          className={`relative text-center mt-20 mb-10 text-secondary flex flex-col justify-center items-center`}
        >
          <h2 className="font-bold text-4xl">MESSAGES</h2>
          <p>Download and listen to life-transforming messages</p>

          {/* Search Bar */}
          <div className="search-bar-container w-full mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => scrollToSearchInput(searchInputRef)} // Scroll to top when search is focused
              ref={searchInputRef} // Attach ref to the search input
              onClick={() => scrollToSearchInput(searchInputRef)}
              placeholder="🔍 Search messages..."
              className="search-bar font-[1rem] bg-[#ffffff55] w-full rounded-md shadow-none focus:shadow-md px-4 py-2 border"
            />
          </div>
        </header>

        {/* Categories */}
        <div className="mb-5">
          <Pill label="Message Series" />
        </div>
        <div className=" relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCategories?.map((category, idx) => {
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
          
            {filteredCategories.length > 3 && (
              <button
                onClick={() => router.push('/messages/series')}
                className="text-sm text-primary underline hover:text-primary/80 transition-colors"
              >
                See more series →
              </button>
            )}
          
        </div>

        <div className="bg-primary h-[1px] w-full opacity-50 my-5" />

        {/* Display Filtered Messages */}
        <div className="mb-5">
          <Pill label="Featured Messages" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMessages?.map((message, idx) => (
            <MessageCard message={message} key={idx} />
          ))}
        </div>

        {/* See more messages button */}
        {(filteredMessages?.filter((m) => m?.category === undefined)?.length || 0) > 3 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.push('/messages/all')}
              className="text-sm text-primary underline hover:text-primary/80 transition-colors"
            >
              See more messages →
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
