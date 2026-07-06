import DVCExperimentalShell from "../../../components/DVC/experimental/DVCExperimentalShell";
import DVCExperimentalLanding from "../../../components/DVC/experimental/DVCExperimentalLanding";

export default function DVCOptionAIndex() {
  return (
    <DVCExperimentalShell
      option="A"
      title="DVC Demo — Option A"
      description="Experimental scrolling-month Daily Victory Confession demo."
    >
      <DVCExperimentalLanding option="A" yearHref="/dvc/a/2026" />
    </DVCExperimentalShell>
  );
}
