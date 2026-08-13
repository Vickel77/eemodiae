import { GetServerSideProps } from "next";
/* Legacy message route. Redesigned Messages renders the reader in-place. */
export default function LegacyMessageRedirect() { return null; }
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id; const slug = Array.isArray(id) ? id[0] : id ?? "";
  return { redirect: { destination: "/messages?m=" + encodeURIComponent(slug), permanent: false } };
};
