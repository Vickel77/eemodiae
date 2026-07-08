import { GetStaticPaths, GetStaticProps } from "next";
import DVCGuideShell from "../../../../../components/DVC/experimental/DVCGuideShell";
import DVCOptionBDayPage from "../../../../../components/DVC/experimental/DVCOptionBDayPage";
import {
  loadOptionBDay,
  loadOptionBDays,
} from "../../../../../lib/dvc/experimentalContent";
import {
  EXPERIMENTAL_DVC_MONTHS,
  getExperimentalMonth,
} from "../../../../../lib/dvc/experimentalMonths";
import type { DVCMonthConfig } from "../../../../../lib/dvc/months";

type Props = {
  month: DVCMonthConfig;
  day: number;
  styles: string;
  body: string;
  themes: Record<number, string>;
};

export default function DVCOptionBDayRoute({ month, day, styles, body, themes }: Props) {
  return (
    <DVCGuideShell
      title={`Daily Victory Confession — ${month.name} 2026, Day ${day}`}
      description={month.theme}
    >
      <DVCOptionBDayPage
        month={month}
        day={day}
        styles={styles}
        body={body}
        themes={themes}
      />
    </DVCGuideShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: { month: string; day: string } }[] = [];
  for (const m of EXPERIMENTAL_DVC_MONTHS.filter((x) => x.ready)) {
    for (let d = 1; d <= m.days; d++) {
      paths.push({ params: { month: m.slug, day: String(d) } });
    }
  }
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.month ?? "");
  const day = parseInt(String(params?.day ?? ""), 10);
  const month = getExperimentalMonth(slug);
  if (!month?.ready || !day || day < 1 || day > month.days) {
    return { notFound: true };
  }

  const { styles, body } = loadOptionBDay(slug, day);
  const themes: Record<number, string> = {};
  for (const entry of loadOptionBDays(slug, month.days)) {
    themes[entry.day] = entry.theme;
  }
  return { props: { month, day, styles, body, themes } };
};
