import { GetServerSideProps } from "next";
export default function LegacyPodcastsRedirect() { return null; }
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/messages?tab=podcasts", permanent: false },
});
