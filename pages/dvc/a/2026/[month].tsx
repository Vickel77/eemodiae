import { GetStaticPaths, GetStaticProps } from "next";
import DVCExperimentalShell from "../../../../components/DVC/experimental/DVCExperimentalShell";
import DVCOptionAScroll from "../../../../components/DVC/experimental/DVCOptionAScroll";
import { loadOptionAMonth } from "../../../../lib/dvc/experimentalContent";
import {
  EXPERIMENTAL_DVC_MONTHS,
  getExperimentalMonth,
} from "../../../../lib/dvc/experimentalMonths";
import type { DVCMonthConfig } from "../../../../lib/dvc/months";

type Props = {
  month: DVCMonthConfig;
  styles: string;
  body: string;
};

export default function DVCOptionAMonthPage({ month, styles, body }: Props) {
  return (
    <DVCExperimentalShell
      option="A"
      title={`DVC ${month.name} 2026 — Option A`}
      description={month.theme}
      dark={false}
    >
      <DVCOptionAScroll month={month} styles={styles} body={body} />
    </DVCExperimentalShell>
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

  const { styles, body } = loadOptionAMonth(slug);
  return { props: { month, styles, body } };
};
