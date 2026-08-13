import { GetServerSideProps } from "next";
export default function LegacyPodcastEpisodeRedirect() { return null; }
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id; const slug = Array.isArray(id) ? id[0] : id ?? "";
  return { redirect: { destination: "/messages?ep=" + encodeURIComponent(slug), permanent: false } };
};
