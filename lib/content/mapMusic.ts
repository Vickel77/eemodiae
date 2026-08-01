import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import renderImage from "../../helpers/renderImage";
import { cleanString } from "../../util/normalizeAndCompare";
import type {
  ExperienceMusicAlbum,
  ExperienceMusicArtist,
  ExperienceMusicSong,
} from "./experienceTypes";

const contentRendererOptions = { preserveWhitespace: true };

const PALETTES: [string, string][] = [
  ["#37215c", "#553192"],
  ["#1c1428", "#6e4d9e"],
  ["#4a2d20", "#c19a45"],
  ["#2b2044", "#8a5fc4"],
];

function contentfulImageUrl(imageUrl: unknown): string {
  const url = renderImage(imageUrl);
  if (!url || url === "undefined") return "";
  return url.startsWith("http") ? url : `https:${url}`;
}

function extractAudioUrl(item: Music): string {
  const url = item?.audio?.fields?.file?.url;
  if (!url) return "";
  return url.startsWith("http") ? url : `https:${url}`;
}

function richTextToPlain(content: unknown): string {
  if (!content) return "";
  const html = documentToHtmlString(
    content as Parameters<typeof documentToHtmlString>[0],
    contentRendererOptions
  );
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function richTextToHtml(content: unknown): string {
  if (!content) return "";
  return documentToHtmlString(
    content as Parameters<typeof documentToHtmlString>[0],
    contentRendererOptions
  );
}

function lyricsToBlocks(content: unknown): string[][] {
  const plain = richTextToHtml(content)
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (!plain) return [];
  return plain
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((l) => l.trim()).filter(Boolean))
    .filter((block) => block.length > 0);
}

function paletteFor(index: number): [string, string] {
  return PALETTES[index % PALETTES.length];
}

export function mapArtists(artistes: Artiste[]): ExperienceMusicArtist[] {
  return (artistes || []).map((artiste) => ({
    id: cleanString(artiste.name),
    name: artiste.name,
    role: "Minister",
    photo: contentfulImageUrl(artiste.imageUrl),
    bio: richTextToPlain(artiste.bio),
  }));
}

export function mapSongs(music: Music[], artistes: Artiste[]): ExperienceMusicSong[] {
  const artistIds = new Map(
    (artistes || []).map((a) => [a.name.toLowerCase().trim(), cleanString(a.name)])
  );

  return (music || []).map((track, index) => {
    const artistKey = (track.artiste || "").toLowerCase().trim();
    const artistId = artistIds.get(artistKey) || cleanString(track.artiste || "eemodiae");

    return {
      id: cleanString(track.title),
      title: track.title || "Untitled",
      artistId,
      cover: contentfulImageUrl(track.imageUrl),
      audio: extractAudioUrl(track),
      palette: paletteFor(index),
      albumId: "",
      duration: 0,
      release: "",
      scripture: null,
      reflection: "",
      lyrics: lyricsToBlocks(track.lyrics),
      lyricsHtml: richTextToHtml(track.lyrics),
    };
  });
}

export function mapAlbums(_music: Music[]): ExperienceMusicAlbum[] {
  return [];
}

export function findSongBySlug(songs: ExperienceMusicSong[], slug: string) {
  return songs.find((s) => s.id === slug);
}

export function findArtistBySlug(artists: ExperienceMusicArtist[], slug: string) {
  return artists.find((a) => a.id === slug);
}

export function findArtistByName(artists: ExperienceMusicArtist[], name: string) {
  const key = name.toLowerCase().trim();
  return artists.find((a) => a.name.toLowerCase().trim() === key);
}

export function mapMusicData(music: Music[], artistes: Artiste[]) {
  const artists = mapArtists(artistes);
  const songs = mapSongs(music, artistes);
  const albums = mapAlbums(music);
  return { artists, songs, albums };
}
