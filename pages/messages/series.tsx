import { GetServerSideProps } from "next";
export default function LegacySeriesRedirect() { return null; }
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/messages?tab=series", permanent: false },
});
