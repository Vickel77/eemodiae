import { GetStaticProps } from "next";
import DVCGuideShell from "../../../components/DVC/experimental/DVCGuideShell";
import DVCGuidePage from "../../../components/DVC/experimental/DVCGuidePage";
import { loadGuideIndex } from "../../../lib/dvc/experimentalContent";

type Props = {
  styles: string;
  body: string;
};

export default function DVCOptionAIndex({ styles, body }: Props) {
  return (
    <DVCGuideShell
      title="Daily Victory Confession | House of Joy Church Worldwide"
      description="Daily Victory Confession 2026 — Option A (scrolling month pages)."
    >
      <DVCGuidePage styles={styles} body={body} />
    </DVCGuideShell>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { styles, body } = loadGuideIndex("a");
  return { props: { styles, body } };
};
