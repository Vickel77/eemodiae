import { GetStaticProps } from "next";
import DVCGuideShell from "../../../components/DVC/experimental/DVCGuideShell";
import DVCGuidePage from "../../../components/DVC/experimental/DVCGuidePage";
import { loadGuideYear } from "../../../lib/dvc/experimentalContent";

type Props = {
  styles: string;
  body: string;
};

export default function DVCOptionAYear({ styles, body }: Props) {
  return (
    <DVCGuideShell
      title="Daily Victory Confession 2026 | House of Joy Church Worldwide"
      description="July–December 2026 — Option A scrolling month pages."
    >
      <DVCGuidePage styles={styles} body={body} />
    </DVCGuideShell>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { styles, body } = loadGuideYear("a");
  return { props: { styles, body } };
};
