import { GetServerSideProps } from "next";

/* Legacy per-poem route. The redesigned Poems page renders the reader
   in-place, so deep links (/poems/<title>) redirect to /poems?read=<slug>,
   where the gallery opens straight to that poem. */
export default function LegacyPoemRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;
  const slug = Array.isArray(id) ? id[0] : id ?? "";
  return {
    redirect: { destination: "/poems?read=" + encodeURIComponent(slug), permanent: false },
  };
};
