import { createClient } from "contentful";
import { useState } from "react";

const useContentful = () => {
  const client = createClient({
    space: "7rf3l1j0b9zd",
    accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
  });

  const [articles, setArticles] = useState<Article[]>();
  const [poems, setPoems] = useState<Poem[]>();
  const [messages, setMessages] = useState<Message[]>();
  const [store, setStore] = useState<StoreItem[]>();

  const handleEntry = async (content_type: string, setEntity: any) => {
    try {
      const entries = await client.getEntries({
        content_type,
      });

      const sanitizedEntries: any =
        entries &&
        entries.items.map((item) => {
          return {
            ...item.fields,
            image: entries?.includes?.Asset?.[0].fields?.file.url,
          };
        });

      setEntity(sanitizedEntries);

      console.log("getEntity ", sanitizedEntries);
      return entries;
    } catch (error) {
      console.log(`Error fetching Entity ${error}`);
    }
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

  const getStore = async () => {
    handleEntry("store", setStore);
  };

  return {
    getArticles,
    getPoems,
    getMessages,
    getStore,
    articles,
    messages,
    poems,
    store,
  };
};

export default useContentful;
