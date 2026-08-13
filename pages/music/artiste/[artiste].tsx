import { GetServerSideProps } from "next";
/* Legacy artiste route. Redesigned Music opens the artiste in-place. */
export default function LegacyArtisteRedirect() { return null; }
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const a = params?.artiste; const name = Array.isArray(a) ? a[0] : a ?? "";
  return { redirect: { destination: "/music?artist=" + encodeURIComponent(name), permanent: false } };
};
