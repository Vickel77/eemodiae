import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import useContentful from "../../hooks/useContentful";
import MessageCard from "../../components/MessageCard";
import SeriesCard from "../../components/MessageCard/SeriesCard";
import PodcastCard from "../../components/MessageCard/PodcastCard";
import PageLoader from "../../components/PageLoader";
import scrollToSearchInput from "../../helpers/scrollToElementPosition";
import ffsHeader from "../../assets/ffs.jpeg";

const ITEMS_PER_PAGE = 6;
type TabId = "series" | "messages" | "podcasts";
type PodcastViewId = "series" | "episodes";

type PodcastEpisode = {
  title: string;
  description?: string;
  date?: string;
  duration?: string;
  imageUrl?: string | any;
  image?: string | any;
  href: string;
  episodeNumber?: string | number;
};

export default function Messages() {
  const { getMessages, getPodcasts, messages, podcasts } = useContentful();
  const [activeTab, setActiveTab] = useState<TabId>("series");
  const [podcastView, setPodcastView] = useState<PodcastViewId>("series");
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

  const setPodcastViewAndResetPage = (view: PodcastViewId) => {
    setPodcastView(view);
    setCurrentPage(1);
  };

  const filteredMessages = messages?.filter((message) =>
    message.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const standaloneMessages = filteredMessages?.filter((m) => m?.category === undefined) ?? [];
  const filteredCategories = categories?.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];
  const hasCategory = (value: unknown) =>
    typeof value === "string" ? value.trim().length > 0 : Boolean(value);

  const seriesPodcasts = (podcasts ?? []).filter((podcast) => hasCategory(podcast.category));
  const standalonePodcasts = (podcasts ?? []).filter((podcast) => !hasCategory(podcast.category));

  const filteredPodcasts = seriesPodcasts.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const podcastEpisodes: PodcastEpisode[] = standalonePodcasts.flatMap((podcast) => {
    const item: any = podcast;
    const baseSlug = encodeURIComponent(item?.title ?? "");
    const nestedEpisodes = Array.isArray(item?.episodes) ? item.episodes : [];

    const baseEpisode: PodcastEpisode[] = item?.audio
      ? [
          {
            title: item?.title ?? "",
            description: item?.description ?? item?.summary ?? "",
            date: item?.date ?? item?.publishedAt ?? item?.createdAt ?? "",
            duration: item?.duration ?? item?.length ?? "",
            imageUrl: item?.imageUrl,
            image: item?.image,
            href: "/messages/podcasts",
            episodeNumber: item?.episodeNumber,
          },
        ]
      : [];

    const normalizedNested = nestedEpisodes.map((episode: any, index: number) => {
      const nestedTitle =
        episode?.title ??
        episode?.name ??
        episode?.fields?.title ??
        `${item?.title ?? "Episode"} ${index + 1}`;
      return {
        title: nestedTitle,
        description:
          episode?.description ??
          episode?.summary ??
          episode?.fields?.description ??
          "",
        date:
          episode?.date ??
          episode?.publishedAt ??
          episode?.fields?.date ??
          "",
        duration:
          episode?.duration ??
          episode?.length ??
          episode?.fields?.duration ??
          "",
        imageUrl: episode?.imageUrl ?? episode?.fields?.imageUrl ?? item?.imageUrl,
        image: episode?.image ?? item?.image,
        href: "/messages/podcasts",
        episodeNumber: episode?.episodeNumber ?? episode?.number ?? index + 1,
      };
    });

    return [...baseEpisode, ...normalizedNested];
  });

  const filteredPodcastEpisodes = podcastEpisodes.filter((episode) =>
    (episode.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  const podcastEpisodesPage = getPaginatedSlice(filteredPodcastEpisodes);

  const totalPages =
    activeTab === "series"
      ? seriesPage.totalPages
      : activeTab === "messages"
        ? messagesPage.totalPages
        : podcastView === "series"
          ? podcastsPage.totalPages
          : podcastEpisodesPage.totalPages;

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

        {/* Tabs - sticky, scroll with page then stick below navbar */}
        <div className="sticky top-[5rem] z-20 py-3 mb-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
          <div className="flex rounded-full bg-gray-200/80 p-1 max-w-md mx-auto">
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
        </div>

        {/* Tab content */}
        <div
          className={`relative z-10 grid gap-6 ${
            activeTab === "podcasts" && podcastView === "episodes"
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
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

          {activeTab === "podcasts" && (
            <>
              <div className="md:col-span-2 lg:col-span-3 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                <div className="relative h-52 md:h-64">
                  <img
                    src={ffsHeader.src}
                    alt="Podcast header"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-2xl md:text-3xl font-bold">Podcasts</h3>
                    <p className="text-white/85 text-sm md:text-base">
                      Explore series and latest episodes
                    </p>
                  </div>
                </div>
                <div className="px-4 pt-2 pb-0 border-t border-gray-100 bg-white">
                  <div className="flex gap-6 border-b border-gray-200">
                    {(["series", "episodes"] as PodcastViewId[]).map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setPodcastViewAndResetPage(view)}
                        className={`-mb-px border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                          podcastView === view
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                        }`}
                      >
                        {view === "series" ? "Series" : "Episodes"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {podcastView === "series" &&
                podcastsPage.items.map((podcast, idx) => (
                  <PodcastCard
                    key={idx}
                    variant="series"
                    podcast={{
                      title: podcast.title ?? "",
                      imageUrl: podcast.imageUrl ?? podcast.image,
                      episodeCount: podcast.episodeCount ?? podcast.episodes?.length ?? 0,
                      href: "/messages/podcasts",
                    }}
                  />
                ))}

              {podcastView === "episodes" &&
                podcastEpisodesPage.items.map((episode, idx) => (
                  <PodcastCard
                    key={`${episode.title}-${idx}`}
                    variant="episode"
                    podcast={{
                      title: episode.title,
                      description: episode.description,
                      date: episode.date,
                      duration: episode.duration,
                      imageUrl: episode.imageUrl,
                      image: episode.image,
                      href: episode.href,
                      episodeNumber: episode.episodeNumber,
                    }}
                  />
                ))}
            </>
          )}
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
