export type ExperienceScripture = { ref: string; text: string };

export type ExperienceArticle = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  image: string;
  tags: string[];
  excerpt?: string;
  keyInsight?: string;
  scripture: ExperienceScripture | null;
  body: string;
};

export type ExperiencePoem = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  image: string;
  tags: string[];
  scripture: ExperienceScripture | null;
  body: string;
};

export type ExperienceSermon = {
  title: string;
  sub: string;
  dur: string;
  audio?: string;
  slug?: string;
};

export type ExperienceMessageSeries = {
  slug: string;
  title: string;
  image: string;
  summary: string;
  overviewLong?: string;
  scripture?: string;
  category?: string;
  year?: string;
  sermons: ExperienceSermon[];
};

export type ExperienceMessage = {
  slug: string;
  title: string;
  image: string;
  dur: string;
  audio?: string;
  category?: string;
  year?: string;
  audience?: string;
  difficulty?: string;
  mainScripture?: string;
  overview?: string;
  transcript?: string;
  scriptures?: string[];
  keyIdeas?: string[];
  quotes?: string[];
  reflections?: string[];
  prayer?: string;
  application?: string;
  reading?: string[];
};

export type ExperiencePodSeries = {
  slug: string;
  title: string;
  image: string;
  summary: string;
  count?: number;
};

export type ExperiencePodEpisode = {
  slug: string;
  title: string;
  image: string;
  dur: string;
  audio?: string;
  seriesSlug: string;
  kicker: string;
  date?: string;
  theme?: string;
  desc?: string;
  notes?: string;
  guest?: string;
};

export type ExperienceMusicArtist = {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
};

export type ExperienceMusicSong = {
  id: string;
  title: string;
  artistId: string;
  cover: string;
  audio: string;
  palette: [string, string];
  albumId: string;
  duration: number;
  release: string;
  scripture: ExperienceScripture | null;
  reflection: string;
  lyrics: string[][];
  lyricsHtml: string;
};

export type ExperienceMusicAlbum = {
  id: string;
  title: string;
  artistId: string;
  cover: string;
  palette: [string, string];
  year: number;
};
