import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import useContentful from "../../hooks/useContentful";
import MessageCard from "../../components/MessageCard";
import SeriesCard from "../../components/MessageCard/SeriesCard";
import PodcastCard from "../../components/MessageCard/PodcastCard";
import PageLoader from "../../components/PageLoader";
import scrollToSearchInput from "../../helpers/scrollToElementPosition";

const ITEMS_PER_PAGE = 6;
type TabId = "series" | "messages" | "podcasts";

export default function Messages() {
  const { getMessages, getPodcasts, messages, podcasts } = useContentful();
  const [activeTab, setActiveTab] = useState<TabId>("series");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [domContentLoaded, setDomContentLoaded] = useState<boolean>(false);
  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getMessages();
    getPodcasts();
  }, []);

  const initMessages = useCallback(() => {
    messages?.map((message) => {
      if (categories.includes(message.category)) return;
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

  // Reset to page 1 when switching tabs
  const setActiveTabAndResetPage = (tab: TabId) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const filteredMessages = messages?.filter((message) =>
    message.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const standaloneMessages = filteredMessages?.filter((m) => m?.category === undefined) ?? [];
  const filteredCategories = categories?.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];
  const filteredPodcasts = podcasts?.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const getPaginatedSlice = <T,>(list: T[]) => {
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return { items: list.slice(start, end), totalPages, total };
  };

  const seriesPage = getPaginatedSlice(filteredCategories);
  const messagesPage = getPaginatedSlice(standaloneMessages);
  const podcastsPage = getPaginatedSlice(filteredPodcasts);

  const totalPages =
    activeTab === "series"
      ? seriesPage.totalPages
      : activeTab === "messages"
        ? messagesPage.totalPages
        : podcastsPage.totalPages;

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!domContentLoaded || !messages) {
    return <PageLoader />;
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "series", label: "Series" },
    { id: "messages", label: "Messages" },
    { id: "podcasts", label: "Podcasts" },
  ];

  return (
    <div>
      <Navbar />
      <div className="pt-[5rem] w-[80%] m-auto mb-10">
        <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[50%] top-[5%] opacity-10 rounded-full z-0" />
        <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[50%] top-[15%] opacity-10 rounded-full z-0" />
        <header className="relative text-center mt-20 mb-10 text-secondary flex flex-col justify-center items-center">
          <h2 className="font-bold text-4xl">MESSAGES</h2>
          <p>Download and listen to life-transforming messages</p>
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

        {/* Tabs - segmented control style */}
        <div className="relative z-10 flex rounded-full bg-gray-200/80 p-1 mb-8 max-w-md mx-auto">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTabAndResetPage(id)}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-primary text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "series" &&
            seriesPage.items.map((category, idx) => {
              const categoryMessages = messages?.filter((m) => m.category === category);
              const firstMessage = categoryMessages?.[0];
              return (
                <SeriesCard
                  key={idx}
                  series={{
                    title: category,
                    image: firstMessage?.imageUrl?.fields?.file?.url ?? "",
                    messageCount: categoryMessages?.length,
                  }}
                  categoryMessage={{ ...firstMessage! }}
                />
              );
            })}

          {activeTab === "messages" &&
            messagesPage.items.map((message, idx) => (
              <MessageCard message={message} key={idx} />
            ))}

          {activeTab === "podcasts" &&
            podcastsPage.items.map((podcast, idx) => (
              <PodcastCard
                key={idx}
                podcast={{
                  title: podcast.title ?? "",
                  imageUrl: podcast.imageUrl ?? podcast.image,
                  episodeCount: podcast.episodeCount ?? podcast.episodes?.length ?? 0,
                }}
              />
            ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-primary underline rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {totalPages <= 7 ? (
            [...Array(totalPages > 0 ? totalPages : 1)].map((_, page) => (
              <button
                key={page}
                onClick={() => paginate(page + 1)}
                className={`px-4 py-2 rounded transition-colors font-semibold ${
                  currentPage === page + 1 ? "bg-primary text-white border border-primary" : "bg-gray-200 hover:bg-gray-300"
                }`}
                disabled={totalPages === 1}
              >
                {page + 1}
              </button>
            ))
          ) : (
            <>
              {currentPage <= 4 && (
                <>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 rounded transition-colors font-semibold ${
                        currentPage === page ? "bg-primary text-white border border-primary" : "bg-gray-200 hover:bg-gray-300"
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
                        currentPage === page ? "bg-primary text-white border border-primary" : "bg-gray-200 hover:bg-gray-300"
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
              {currentPage >= totalPages - 3 && (
                <>
                  <button
                    onClick={() => paginate(1)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    1
                  </button>
                  <span className="px-2 py-2">...</span>
                  {[totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
                    .filter((p) => p >= 1)
                    .map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 rounded transition-colors font-semibold ${
                        currentPage === page ? "bg-primary text-white border border-primary" : "bg-gray-200 hover:bg-gray-300"
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
