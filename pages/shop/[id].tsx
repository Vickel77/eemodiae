import { GetServerSideProps } from "next";

export default function ShopLegacyItemRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = String(params?.id ?? "");
  return {
    redirect: {
      destination: `/shop?open=${encodeURIComponent(id)}`,
      permanent: false,
    },
  };
};
