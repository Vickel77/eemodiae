import type { GetServerSideProps, NextPage } from "next";
import DVCHost from "../../components/dvc/DVCHost";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

type Props = { month: string };

const DVCMonthPage: NextPage<Props> = ({ month }) => <DVCHost monthSlug={month} />;

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const raw = String(ctx.params?.month || "").toLowerCase();
  const month = MONTHS.includes(raw as (typeof MONTHS)[number]) ? raw : "";
  if (!month || MONTHS.indexOf(month as (typeof MONTHS)[number]) < 6) {
    return { redirect: { destination: "/dvc", permanent: false } };
  }
  return { props: { month } };
};

export default DVCMonthPage;
