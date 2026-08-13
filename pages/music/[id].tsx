import { GetServerSideProps } from "next";
/* Legacy music player route (indexed by position). Redesigned Music
   opens the song in-place, so redirect /music/<index> to /music?i=<index>. */
export default function LegacyMusicRedirect() { return null; }
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id; const i = Array.isArray(id) ? id[0] : id ?? "";
  return { redirect: { destination: "/music?i=" + encodeURIComponent(i), permanent: false } };
};
