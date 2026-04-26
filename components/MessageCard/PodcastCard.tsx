import Link from "next/link";
import { MdHeadphones, MdOutlinePlayCircleFilled } from "react-icons/md";

export type PodcastCardData = {
  title: string;
  imageUrl?: string | any;
  image?: string | any;
  episodeCount?: number;
  description?: string;
  date?: string;
  duration?: string;
  href?: string;
  seriesLabel?: string;
  episodeNumber?: string | number;
};

interface PodcastCardProps {
  podcast: PodcastCardData;
  variant?: "series" | "episode";
}

function getImageUrl(podcast: PodcastCardData): string | null {
  const url = podcast.imageUrl?.fields?.file?.url ?? podcast.imageUrl?.url ?? podcast.image;
  return typeof url === "string" ? url : null;
}

function getEpisodeMeta(podcast: PodcastCardData) {
  if (podcast.episodeNumber === undefined || podcast.episodeNumber === null) {
    return podcast.date ? podcast.date : "Episode";
  }
  return podcast.date
    ? `Episode ${podcast.episodeNumber}  •  ${podcast.date}`
    : `Episode ${podcast.episodeNumber}`;
}

export default function PodcastCard({
  podcast,
  variant = "series",
}: PodcastCardProps) {
  const imageUrl = getImageUrl(podcast);
  const episodeCount = podcast.episodeCount ?? 0;
  const episodeLabel = episodeCount === 1 ? "1 episode" : `${episodeCount} episodes`;
  const href = podcast.href ?? `/messages/podcasts/${encodeURIComponent(podcast.title)}`;

  if (variant === "episode") {
    return (
      <Link
        href={href}
        className="group block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-all"
      >
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-primary/20 flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary">
                <MdHeadphones className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm text-gray-500 line-clamp-1">{getEpisodeMeta(podcast)}</p>
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                aria-label="More"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="6" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="18" r="1.5" />
                </svg>
              </button>
            </div>
            <h3 className="text-2xl/none sm:text-xl font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {podcast.title}
            </h3>
            {podcast.description && (
              <p className="text-gray-600 line-clamp-2 mb-3">{podcast.description}</p>
            )}
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
              <MdOutlinePlayCircleFilled className="w-4 h-4 text-gray-500" />
              <span>{podcast.duration ?? "Play episode"}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#121520] text-white border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link href={href} className="block">
        <div className="relative p-5 min-h-[240px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#15294f] via-[#21153b] to-[#2b0c0c]" />
          <div className="absolute inset-0 opacity-20">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex justify-between items-start gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MdHeadphones className="w-10 h-10 text-white/80" />
                )}
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/85 hover:bg-white/10"
                aria-label="More"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="6" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="18" r="1.5" />
                </svg>
              </button>
            </div>
            <div>
              <h3 className="text-3xl/none sm:text-2xl font-extrabold line-clamp-2 mb-2">
                {podcast.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <MdHeadphones className="w-4 h-4" />
                <span>{podcast.seriesLabel ?? "Series"}</span>
                <span aria-hidden>•</span>
                <span>{episodeLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
