import { createClient } from "contentful";

type ContentType =
  | "eemodiaeArticle"
  | "eemodiae"
  | "eemodiaeMessages"
  | "eemodiaeMusic"
  | "eemodiaeArtiste"
  | "store";

export default async function getEntries(contentType: ContentType) {
  const client = createClient({
    space: "7rf3l1j0b9zd",
    accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
  });

  const entries = await client.getEntries({
    content_type: contentType,
  });

  const sanitizedEntries: any =
    entries &&
    entries.items.map((item: any) => {
      return {
        ...item.fields,
        image: entries?.includes?.Asset?.[0].fields?.file.url,
      };
    });

  return sanitizedEntries;
}
