import { GetStaticProps } from "next";
import DVCGuideShell from "../../../components/DVC/experimental/DVCGuideShell";
import DVCGuidePage from "../../../components/DVC/experimental/DVCGuidePage";
import { loadGuideIndex } from "../../../lib/dvc/experimentalContent";

type Props = {
  styles: string;
  body: string;
};

export default function DVCOptionBIndex({ styles, body }: Props) {
  return (
    <DVCGuideShell
      title="Daily Victory Confession | House of Joy Church Worldwide"
      description="Daily Victory Confession 2026 — Option B (one page per day)."
    >
      <DVCGuidePage styles={styles} body={body} />
    </DVCGuideShell>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { styles, body } = loadGuideIndex("b");
  return { props: { styles, body } };
};
