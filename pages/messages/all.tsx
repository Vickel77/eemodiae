import { GetServerSideProps } from "next";
export default function LegacyAllRedirect() { return null; }
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/messages?tab=messages", permanent: false },
});
