import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import renderImage from "../../helpers/renderImage";
import { cleanString } from "../../util/normalizeAndCompare";
import type { ExperienceArticle, ExperiencePoem, ExperienceScripture } from "./experienceTypes";

const contentRendererOptions = { preserveWhitespace: true };

function contentfulImageUrl(imageUrl: unknown): string {
  const url = renderImage(imageUrl);
  if (!url || url === "undefined") return "";
  return url.startsWith("http") ? url : `https:${url}`;
}

function formatDate(createdAt?: string): string {
  if (!createdAt) return "";
  try {
    return new Date(createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function richTextToHtml(content: unknown): string {
  if (!content) return "";
  return documentToHtmlString(content as Parameters<typeof documentToHtmlString>[0], contentRendererOptions);
}

function htmlToPlain(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function richTextToPlain(content: unknown): string {
  return htmlToPlain(richTextToHtml(content));
}

function parseScripture(scripture: unknown): ExperienceScripture | null {
  if (!scripture) return null;
  const plain = richTextToPlain(scripture);
  if (!plain) return null;
  const parts = plain.split(/[—–-]\s+/);
  if (parts.length >= 2) {
    return { ref: parts[0].trim(), text: parts.slice(1).join(" - ").trim() };
  }
  const colonIdx = plain.indexOf(":");
  if (colonIdx > 0 && colonIdx < 40) {
    return { ref: plain.slice(0, colonIdx).trim(), text: plain.slice(colonIdx + 1).trim() };
  }
  return { ref: "", text: plain };
}

function richTextToPoemBody(content: unknown): string {
  const html = richTextToHtml(content);
  if (!html) return "";
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>\s*<div[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function mapArticle(article: Article): ExperienceArticle {
  const title = article.title || "";
  const body = richTextToHtml(article.content);
  const plain = htmlToPlain(body);

  return {
    slug: cleanString(title),
    title,
    subtitle: "",
    date: formatDate(article.createdAt),
    image: contentfulImageUrl(article.image_url),
    tags: plain ? ["Faith"] : [],
    body,
    scripture: null,
  };
}

export function mapArticles(articles: Article[]): ExperienceArticle[] {
  return articles.map(mapArticle);
}

export function mapPoem(poem: Poem): ExperiencePoem {
  const title = poem.title || "";
  const body = richTextToPoemBody(poem.content);

  return {
    slug: cleanString(title),
    title,
    subtitle: "",
    date: formatDate(poem.createdAt),
    image: contentfulImageUrl(poem.image_url),
    tags: body ? ["Faith"] : [],
    body,
    scripture: parseScripture(poem.scripture),
  };
}

export function mapPoems(poems: Poem[]): ExperiencePoem[] {
  return poems.map(mapPoem);
}

export function findBySlug<T extends { slug: string; title: string }>(
  items: T[],
  id: string
): T | undefined {
  const normalized = cleanString(id);
  return items.find(
    (item) => item.slug === normalized || cleanString(item.title) === normalized
  );
}
