import { GetStaticProps } from "next";
import DVCGuideShell from "../../components/DVC/experimental/DVCGuideShell";
import DVCGuidePage from "../../components/DVC/experimental/DVCGuidePage";
import { loadCanonicalYear } from "../../lib/dvc/experimentalContent";

type Props = {
  styles: string;
  body: string;
};

export default function DVCIndexPage({ styles, body }: Props) {
  return (
    <DVCGuideShell
      title="Daily Victory Confession 2026 | House of Joy Church Worldwide"
      description="July–December 2026 — daily decrees, prophecy, and prayer."
    >
      <DVCGuidePage styles={styles} body={body} />
    </DVCGuideShell>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { styles, body } = loadCanonicalYear();
  return { props: { styles, body } };
};
