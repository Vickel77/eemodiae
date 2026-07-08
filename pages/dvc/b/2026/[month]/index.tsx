import { GetStaticPaths, GetStaticProps } from "next";
import DVCGuideShell from "../../../../../components/DVC/experimental/DVCGuideShell";
import DVCOptionBMonthGrid from "../../../../../components/DVC/experimental/DVCOptionBMonthGrid";
import { loadOptionBMonthIndex } from "../../../../../lib/dvc/experimentalContent";
import {
  EXPERIMENTAL_DVC_MONTHS,
  getExperimentalMonth,
} from "../../../../../lib/dvc/experimentalMonths";
import type { DVCMonthConfig } from "../../../../../lib/dvc/months";

type Props = {
  month: DVCMonthConfig;
  styles: string;
  body: string;
};

export default function DVCOptionBMonthIndex({ month, styles, body }: Props) {
  return (
    <DVCGuideShell
      title={`Daily Victory Confession — ${month.name} 2026`}
      description={month.theme}
    >
      <DVCOptionBMonthGrid month={month} styles={styles} body={body} />
    </DVCGuideShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: EXPERIMENTAL_DVC_MONTHS.filter((m) => m.ready).map((m) => ({
    params: { month: m.slug },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.month ?? "");
  const month = getExperimentalMonth(slug);
  if (!month?.ready) return { notFound: true };

  const { styles, body } = loadOptionBMonthIndex(slug);
  return { props: { month, styles, body } };
};
