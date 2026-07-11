import { GetStaticPaths, GetStaticProps } from "next";
import DVCGuideShell from "../../components/DVC/experimental/DVCGuideShell";
import DVCOptionAScroll from "../../components/DVC/experimental/DVCOptionAScroll";
import { loadCanonicalOptionAMonth } from "../../lib/dvc/experimentalContent";
import { DVC_MONTHS, DVCMonthConfig, getDVCMonth } from "../../lib/dvc/months";
import { isMonthNavigable } from "../../lib/dvc/monthUtils";

type Props = {
  month: DVCMonthConfig;
  styles: string;
  body: string;
};

export default function DVCMonthPage({ month, styles, body }: Props) {
  return (
    <DVCGuideShell
      title={`Daily Victory Confession — ${month.name} ${month.year}`}
      description={month.theme}
    >
      <DVCOptionAScroll month={month} styles={styles} body={body} />
    </DVCGuideShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: DVC_MONTHS.filter((m) => isMonthNavigable(m.monthNum, m.year)).map(
    (m) => ({ params: { month: m.slug } })
  ),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.month ?? "");
  const month = getDVCMonth(slug);
  if (!month || !isMonthNavigable(month.monthNum, month.year)) {
    return { notFound: true };
  }

  const { styles, body } = loadCanonicalOptionAMonth(slug);
  return { props: { month, styles, body } };
};
