import { GetServerSideProps } from "next";

/* Legacy per-article route.
   The redesigned Articles page renders the reader in-place, so we redirect
   deep links (/articles/<title>) into /articles?read=<slug>, where the
   gallery opens straight to that article. */
export default function LegacyArticleRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;
  const slug = Array.isArray(id) ? id[0] : id ?? "";
  return {
    redirect: {
      destination: "/articles?read=" + encodeURIComponent(slug),
      permanent: false,
    },
  };
};
