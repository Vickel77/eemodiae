import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DVCMonthViewer from "../../components/DVC/DVCMonthViewer";
import { DVC_MONTHS, DVCMonthConfig, getDVCMonth } from "../../lib/dvc/months";

type Props = {
  month: DVCMonthConfig;
};

export default function DVCMonthPage({ month }: Props) {
  return (
    <>
      <Head>
        <title>
          Daily Victory Confession — {month.name} {month.year} | Eemodiae
        </title>
        <meta
          name="description"
          content={`${month.theme} — Daily Victory Confession ${month.year}`}
        />
      </Head>
      <Navbar />
      <main className="pt-[5rem] min-h-screen bg-[#FBFBFF]">
        <DVCMonthViewer month={month} />
      </main>
      <Footer />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: DVC_MONTHS.filter((m) => m.ready).map((m) => ({
    params: { month: m.slug },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.month ?? "");
  const month = getDVCMonth(slug);
  if (!month?.ready) {
    return { notFound: true };
  }
  return { props: { month } };
};
