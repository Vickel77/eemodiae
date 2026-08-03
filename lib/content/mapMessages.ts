import renderImage from "../../helpers/renderImage";
import { cleanString } from "../../util/normalizeAndCompare";
import type {
  ExperienceMessage,
  ExperienceMessageSeries,
  ExperiencePodEpisode,
  ExperiencePodSeries,
  ExperienceSermon,
} from "./experienceTypes";

function contentfulImageUrl(imageUrl: unknown): string {
  const url = renderImage(imageUrl);
  if (!url || url === "undefined") return "";
  return url.startsWith("http") ? url : `https:${url}`;
}

function extractAudioUrl(item: unknown): string {
  const any = item as Record<string, unknown>;
  const candidates = [
    (any?.audio as { fields?: { file?: { url?: string } } })?.fields?.file?.url,
    (any?.audio as { file?: { url?: string } })?.file?.url,
    any?.audioUrl,
    (any?.fields as { audio?: { fields?: { file?: { url?: string } } } })?.audio?.fields?.file?.url,
    (any?.fields as { file?: { url?: string } })?.file?.url,
  ];
  const value = candidates.find((v) => typeof v === "string" && v.length > 0) as string | undefined;
  if (!value) return "";
  return value.startsWith("http") ? value : `https:${value}`;
}

function parseDurationLabel(raw?: string | number): string {
  if (typeof raw === "number" && raw > 0) return `${Math.round(raw)} min`;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return "30 min";
}

function hasCategory(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function sermonFromAudioFile(
  file: AudioFile,
  index: number,
  seriesImage: string
): ExperienceSermon {
  const title = file?.fields?.title || `Sermon ${index + 1}`;
  const audio = file?.fields?.file?.url
    ? file.fields.file.url.startsWith("http")
      ? file.fields.file.url
      : `https:${file.fields.file.url}`
    : "";
  return {
    title,
    sub: `Sermon ${index + 1}`,
    dur: "30 min",
    audio,
    slug: cleanString(title),
  };
}

function collectSeriesSermons(categoryMessages: Message[]): ExperienceSermon[] {
  const sermons: ExperienceSermon[] = [];
  const image = contentfulImageUrl(categoryMessages[0]?.imageUrl);

  categoryMessages.forEach((msg) => {
    if (Array.isArray(msg.audio_file) && msg.audio_file.length > 0) {
      msg.audio_file.forEach((file, idx) => {
        sermons.push(sermonFromAudioFile(file, idx, image));
      });
    } else if (msg.audio) {
      sermons.push({
        title: msg.title || "Message",
        sub: "Sermon",
        dur: "30 min",
        audio: extractAudioUrl(msg),
        slug: cleanString(msg.title || ""),
      });
    } else if (msg.title) {
      sermons.push({
        title: msg.title,
        sub: "Sermon",
        dur: "30 min",
        audio: "",
        slug: cleanString(msg.title),
      });
    }
  });

  return sermons;
}

export function mapMessageSeries(messages: Message[]): ExperienceMessageSeries[] {
  const categories = new Map<string, Message[]>();

  messages.forEach((msg) => {
    if (!hasCategory(msg.category)) return;
    const cat = String(msg.category).trim();
    const list = categories.get(cat) || [];
    list.push(msg);
    categories.set(cat, list);
  });

  return Array.from(categories.entries()).map(([category, categoryMessages]) => {
    const first = categoryMessages[0];
    const image = contentfulImageUrl(first?.imageUrl);
    const sermons = collectSeriesSermons(categoryMessages);

    return {
      slug: cleanString(category),
      title: category,
      image,
      summary: `A teaching series with ${sermons.length} message${sermons.length === 1 ? "" : "s"}.`,
      overviewLong: `Explore the complete "${category}" series — ${sermons.length} sermons to strengthen your walk with Christ.`,
      scripture: "",
      category,
      year: "",
      sermons,
    };
  });
}

export function mapStandaloneMessages(messages: Message[]): ExperienceMessage[] {
  const standalone = messages.filter((m) => !hasCategory(m.category));
  const mapped: ExperienceMessage[] = [];

  standalone.forEach((msg) => {
    const image = contentfulImageUrl(msg.imageUrl);
    const preacher = msg.preacher || "Emmanuel I. Emodiae";

    if (Array.isArray(msg.audio_file) && msg.audio_file.length > 0) {
      msg.audio_file.forEach((file) => {
        const title = file?.fields?.title || msg.title || "Message";
        mapped.push({
          slug: cleanString(title),
          title,
          image,
          dur: "30 min",
          audio: file?.fields?.file?.url
            ? file.fields.file.url.startsWith("http")
              ? file.fields.file.url
              : `https:${file.fields.file.url}`
            : "",
          category: msg.category,
          overview: `A life-transforming message from ${preacher}.`,
        });
      });
      return;
    }

    mapped.push({
      slug: cleanString(msg.title || ""),
      title: msg.title || "",
      image,
      dur: "30 min",
      audio: extractAudioUrl(msg),
      category: msg.category,
      overview: `A life-transforming message from ${preacher}.`,
    });
  });

  return mapped;
}

export function mapPodcastSeries(podcasts: Podcast[]): ExperiencePodSeries[] {
  return podcasts
    .filter((p) => hasCategory(p.category))
    .map((podcast) => {
      const title = podcast.title || "";
      const slug = cleanString(title);
      const nestedCount = Array.isArray(podcast.episodes) ? podcast.episodes.length : 0;
      const count = podcast.episodeCount ?? nestedCount ?? (extractAudioUrl(podcast) ? 1 : 0);

      return {
        slug,
        title,
        image: contentfulImageUrl(podcast.imageUrl ?? podcast.image),
        summary: (podcast as { description?: string }).description || `Podcast series: ${title}`,
        count,
      };
    });
}

export function mapPodcastEpisodes(podcasts: Podcast[]): ExperiencePodEpisode[] {
  const episodes: ExperiencePodEpisode[] = [];

  podcasts.forEach((podcast) => {
    const seriesSlug = hasCategory(podcast.category)
      ? cleanString(String(podcast.category))
      : cleanString(podcast.title || "podcast");
    const seriesImage = contentfulImageUrl(podcast.imageUrl ?? podcast.image);
    const nested = Array.isArray(podcast.episodes) ? podcast.episodes : [];

    nested.forEach((episode: unknown, index: number) => {
      const ep = episode as Record<string, unknown>;
      const fields = (ep?.fields as Record<string, unknown>) || {};
      const title =
        (ep?.title as string) ||
        (ep?.name as string) ||
        (fields?.title as string) ||
        `${podcast.title ?? "Episode"} ${index + 1}`;

      episodes.push({
        slug: cleanString(title),
        title,
        image: contentfulImageUrl(ep?.imageUrl ?? fields?.imageUrl ?? podcast.imageUrl),
        dur: parseDurationLabel(
          (ep?.duration as string) || (ep?.length as string) || (fields?.duration as string)
        ),
        audio: extractAudioUrl(ep) || extractAudioUrl(podcast),
        seriesSlug,
        kicker: `Episode ${index + 1}`,
        date: String(ep?.date || ep?.publishedAt || fields?.date || ""),
        theme: String(ep?.theme || fields?.theme || podcast.category || ""),
        desc: String(
          ep?.description || ep?.summary || fields?.description || (podcast as { description?: string }).description || ""
        ),
      });
    });

    if (extractAudioUrl(podcast) && !hasCategory(podcast.category)) {
      episodes.push({
        slug: cleanString(podcast.title || ""),
        title: podcast.title || "",
        image: seriesImage,
        dur: parseDurationLabel((podcast as { duration?: string }).duration),
        audio: extractAudioUrl(podcast),
        seriesSlug,
        kicker: "Episode",
        date: String((podcast as { date?: string }).date || ""),
        theme: String(podcast.category || ""),
        desc: String((podcast as { description?: string }).description || ""),
      });
    }
  });

  return episodes;
}

export function findMessageBySlug(
  messages: ExperienceMessage[],
  slug: string
): ExperienceMessage | undefined {
  const normalized = cleanString(slug);
  return messages.find(
    (m) => m.slug === normalized || cleanString(m.title) === normalized
  );
}

export function findEpisodeBySlug(
  episodes: ExperiencePodEpisode[],
  slug: string
): ExperiencePodEpisode | undefined {
  const normalized = cleanString(slug);
  return episodes.find(
    (e) => e.slug === normalized || cleanString(e.title) === normalized
  );
}

export function mapMessagesData(messages: Message[], podcasts: Podcast[]) {
  return {
    series: mapMessageSeries(messages),
    messages: mapStandaloneMessages(messages),
    podSeries: mapPodcastSeries(podcasts),
    podEpisodes: mapPodcastEpisodes(podcasts),
  };
}
