import { createClient } from "contentful";
import { useState } from "react";

/** Turn a Contentful Asset, Link, or raw URL into an absolute https URL. */
const resolveAssetUrl = (
  value: any,
  assetsById?: Map<string, any>
): string | undefined => {
  if (!value) return undefined;

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return undefined;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("//")) return "https:" + s;
    // bare CDN path
    if (s.includes("ctfassets.net") || s.startsWith("/")) {
      return s.startsWith("/") ? "https:" + s : "https://" + s;
    }
    return undefined;
  }

  // Resolved Asset
  const fromFields = value?.fields?.file?.url;
  if (typeof fromFields === "string") {
    return resolveAssetUrl(fromFields, assetsById);
  }

  // Unresolved Link → look up in includes.Asset
  const id = value?.sys?.id;
  if (id && value?.sys?.linkType === "Asset" && assetsById?.has(id)) {
    return resolveAssetUrl(assetsById.get(id), assetsById);
  }

  return undefined;
};

const imageFromFields = (fields: any, assetsById?: Map<string, any>) =>
  resolveAssetUrl(fields?.imageUrl, assetsById) ||
  resolveAssetUrl(fields?.image_url, assetsById) ||
  resolveAssetUrl(fields?.image, assetsById) ||
  resolveAssetUrl(fields?.thumbnail, assetsById) ||
  resolveAssetUrl(fields?.cover, assetsById) ||
  resolveAssetUrl(fields?.coverImage, assetsById);

const useContentful = () => {
  const client = createClient({
    space: "7rf3l1j0b9zd",
    accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
  });

  const [articles, setArticles] = useState<Article[]>();
  const [poems, setPoems] = useState<Poem[]>();
  const [messages, setMessages] = useState<Message[]>();
  const [podcasts, setPodcasts] = useState<Podcast[]>();
  const [store, setStore] = useState<StoreItem[]>();
  const [music, setMusic] = useState<Music[]>();
  const [artiste, setArtiste] = useState<Artiste[]>();

  const handleEntry = async (content_type: string, setEntity: any) => {
    try {
      const entries = await client.getEntries({
        content_type,
        include: 2,
        // newest first so homepage Latest + listings stay current
        order: "-sys.updatedAt" as any,
      });

      const assetsById = new Map<string, any>(
        ((entries as any)?.includes?.Asset || []).map((a: any) => [a.sys.id, a])
      );

      const sanitizedEntries: any =
        entries &&
        entries.items.map((item: any) => {
          const fields = item.fields || {};
          const image = imageFromFields(fields, assetsById);
          return {
            ...fields,
            // keep resolved linked Assets (audio_file[], audio, imageUrl, …)
            image,
            updatedAt: item?.sys?.updatedAt,
            createdAt: item?.sys?.createdAt,
          };
        });

      setEntity(sanitizedEntries);

      return entries;
    } catch (error) {}
  };

  const getArticles = async () => {
    handleEntry("eemodiaeArticle", setArticles);
  };

  const getPoems = async () => {
    handleEntry("eemodiae", setPoems);
  };

  const getMessages = async () => {
    handleEntry("eemodiaeMessages", setMessages);
  };

  const getPodcasts = async () => {
    handleEntry("eemodiaePodcast", setPodcasts);
  };

  const getMusic = async () => {
    handleEntry("eemodiaeMusic", setMusic);
  };

  const getArtiste = async () => {
    handleEntry("eemodiaeArtiste", setArtiste);
  };

  const getStore = async () => {
    handleEntry("store", setStore);
  };

  return {
    getArticles,
    getPoems,
    getMessages,
    getStore,
    getMusic,
    getArtiste,
    getPodcasts,
    articles,
    messages,
    podcasts,
    poems,
    store,
    music,
    artiste,
  };
};

export default useContentful;
