import { GetStaticPaths, GetStaticProps } from "next";
import DVCExperimentalShell from "../../../../../components/DVC/experimental/DVCExperimentalShell";
import DVCOptionBDayGrid from "../../../../../components/DVC/experimental/DVCOptionBDayGrid";
import { loadOptionBDays } from "../../../../../lib/dvc/experimentalContent";
import type { DayEntry } from "../../../../../lib/dvc/experimentalContent";
import {
  EXPERIMENTAL_DVC_MONTHS,
  getExperimentalMonth,
} from "../../../../../lib/dvc/experimentalMonths";
import type { DVCMonthConfig } from "../../../../../lib/dvc/months";

type Props = {
  month: DVCMonthConfig;
  days: DayEntry[];
};

export default function DVCOptionBMonthIndex({ month, days }: Props) {
  return (
    <DVCExperimentalShell
      option="B"
      title={`DVC ${month.name} 2026 — Days`}
      description={month.theme}
      dark={false}
    >
      <DVCOptionBDayGrid month={month} days={days} yearHref="/dvc/b/2026" />
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

  const days = loadOptionBDays(slug, month.days);
  return { props: { month, days } };
};
