import { createClient } from "contentful";
import ArticlesPage from "../../components/Articles/ArticlesPage";
import { mapArticles } from "../../lib/content/mapExperience";
import { cleanString } from "../../util/normalizeAndCompare";

const client = createClient({
  space: "7rf3l1j0b9zd",
  accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
});

export default function ArticleDetail({
  articles,
  initialSlug,
}: {
  articles: ReturnType<typeof mapArticles>;
  initialSlug: string;
}) {
  return <ArticlesPage articles={articles} initialSlug={initialSlug} />;
}

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;

  const entries = await client.getEntries({
    content_type: "eemodiaeArticle",
  });

  const sanitizedEntries: Article[] =
    (entries?.items.map((item: any) => ({
      ...item.fields,
    })) as Article[]) || [];

  if (!sanitizedEntries.length) {
    return { notFound: true };
  }

  const articles = mapArticles(sanitizedEntries);
  const initialSlug = cleanString(id);
  const found = articles.find((a) => a.slug === initialSlug);

  if (!found) {
    return { notFound: true };
  }

  return {
    props: {
      articles,
      initialSlug,
    },
  };
}
