import { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import { useRouter } from "next/router";
import Footer from "../../../components/Footer";
import useContentful from "../../../hooks/useContentful";
import PodcastCard from "../../../components/MessageCard/PodcastCard";
import PageLoader from "../../../components/PageLoader";
import scrollToSearchInput from "../../../helpers/scrollToElementPosition";
import Pill from "../../../components/Pill";

export default function AllPodcasts() {
  const router = useRouter();
  const { getPodcasts, podcasts } = useContentful();
  const [domContentLoaded, setDomContentLoaded] = useState(false);
  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getPodcasts();
  }, []);

  useEffect(() => {
    setDomContentLoaded(true);
  }, []);

  const filteredPodcasts = podcasts?.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!domContentLoaded) {
    return <PageLoader />;
  }

  return (
    <div>
      <Navbar />
      <div className="pt-[5rem] w-[80%] m-auto mb-10">
        <div className="w-[200px] h-[300px] bg-primary blur-3xl fixed left-[50%] top-[5%] opacity-10 rounded-full z-0" />
        <div className="w-[200px] h-[300px] bg-danger blur-3xl fixed right-[50%] top-[15%] opacity-10 rounded-full z-0" />
        <header className="relative text-center mt-20 mb-10 text-secondary flex flex-col justify-center items-center">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ← Back
            </button>
            <h2 className="font-bold text-4xl">PODCASTS</h2>
          </div>
          <p>Browse all podcast series</p>
          <div className="search-bar-container w-full mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => scrollToSearchInput(searchInputRef)}
              ref={searchInputRef}
              onClick={() => scrollToSearchInput(searchInputRef)}
              placeholder="🔍 Search podcasts..."
              className="search-bar font-[1rem] bg-[#ffffff55] w-full rounded-md shadow-none focus:shadow-md px-4 py-2 border"
            />
          </div>
        </header>

        <div className="mb-5 relative z-10">
          <Pill label="All Podcasts" />
          <p className="text-sm text-gray-600 mt-2">
            Showing {filteredPodcasts?.length ?? 0} podcasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredPodcasts?.map((podcast, idx) => (
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
        {(!filteredPodcasts || filteredPodcasts.length === 0) && (
          <p className="text-gray-500 text-center py-8">No podcasts found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
