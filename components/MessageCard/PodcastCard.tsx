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
  const href = podcast.href ?? "/messages/podcasts";

  if (variant === "episode") {
    return (
      <Link
        href={href}
        className="group block h-full w-full min-w-0 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 hover:shadow-md transition-all"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8">
          <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-primary/20 sm:aspect-auto sm:w-48 sm:min-h-[12rem] md:w-52 sm:self-stretch">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={podcast.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <MdHeadphones className="h-12 w-12 sm:h-11 sm:w-11" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
            <p className="text-sm font-medium text-gray-500">{getEpisodeMeta(podcast)}</p>
            <h3 className="text-xl font-bold leading-snug text-gray-800 line-clamp-3 group-hover:text-primary sm:text-2xl sm:leading-tight">
              {podcast.title}
            </h3>
            {podcast.description && (
              <p className="text-base leading-relaxed text-gray-600 line-clamp-3 sm:line-clamp-4">
                {podcast.description}
              </p>
            )}
            <div className="mt-1 inline-flex max-w-full items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
              <MdOutlinePlayCircleFilled className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="min-w-0 break-words">{podcast.duration ?? "Play episode"}</span>
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
