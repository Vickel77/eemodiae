import { GetServerSideProps } from "next";
import DVCGuideShell from "../../components/DVC/experimental/DVCGuideShell";
import DVCOptionAScroll from "../../components/DVC/experimental/DVCOptionAScroll";
import { loadCanonicalOptionAMonth } from "../../lib/dvc/experimentalContent";
import { DVCMonthConfig, getDVCMonth } from "../../lib/dvc/months";
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

/** Date checks run per request so new months unlock without a rebuild. */
export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = String(params?.month ?? "");
  const month = getDVCMonth(slug);
  if (!month?.ready || !isMonthNavigable(month.monthNum, month.year)) {
    return { notFound: true };
  }

  const { styles, body } = loadCanonicalOptionAMonth(slug);
  return { props: { month, styles, body } };
};
