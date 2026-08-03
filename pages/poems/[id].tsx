import { createClient } from "contentful";
import PoemsPage from "../../components/Poems/PoemsPage";
import { mapPoems } from "../../lib/content/mapExperience";
import { cleanString } from "../../util/normalizeAndCompare";

const client = createClient({
  space: "7rf3l1j0b9zd",
  accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
});

export default function PoemDetail({
  poems,
  initialSlug,
}: {
  poems: ReturnType<typeof mapPoems>;
  initialSlug: string;
}) {
  return <PoemsPage poems={poems} initialSlug={initialSlug} />;
}

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;

  const entries = await client.getEntries({
    content_type: "eemodiae",
  });

  const sanitizedEntries: Poem[] =
    (entries?.items.map((item: any) => ({
      ...item.fields,
    })) as Poem[]) || [];

  if (!sanitizedEntries.length) {
    return { notFound: true };
  }

  const poems = mapPoems(sanitizedEntries);
  const initialSlug = cleanString(id);
  const found = poems.find((p) => p.slug === initialSlug);

  if (!found) {
    return { notFound: true };
  }

  return {
    props: {
      poems,
      initialSlug,
    },
  };
}
