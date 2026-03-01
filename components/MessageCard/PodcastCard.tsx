import Link from "next/link";
import { MdHeadphones } from "react-icons/md";

export type PodcastCardData = {
  title: string;
  imageUrl?: string | any;
  image?: string | any;
  episodeCount?: number;
};

interface PodcastCardProps {
  podcast: PodcastCardData;
}

function getImageUrl(podcast: PodcastCardData): string | null {
  const url = podcast.imageUrl?.fields?.file?.url ?? podcast.imageUrl?.url ?? podcast.image;
  return typeof url === "string" ? url : null;
}

export default function PodcastCard({ podcast }: PodcastCardProps) {
  const imageUrl = getImageUrl(podcast);
  const episodeCount = podcast.episodeCount ?? 0;
  const episodeLabel = episodeCount === 1 ? "1 episode" : `${episodeCount} episodes`;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link href={`/messages/podcasts/${encodeURIComponent(podcast.title)}`} className="block">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 sm:gap-4 p-0">
          {/* Square image */}
          <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 overflow-hidden bg-gray-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={podcast.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <MdHeadphones className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {podcast.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MdHeadphones className="w-4 h-4 flex-shrink-0 text-primary" />
              <span>Series</span>
              <span aria-hidden className="text-gray-400">·</span>
              <span>{episodeLabel}</span>
            </div>
          </div>
        </div>
      </Link>
      {/* Kebab menu - top right */}
      <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10">
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      </div>
    </div>
  );
}
