import DVCExperimentalShell from "../../../components/DVC/experimental/DVCExperimentalShell";
import DVCExperimentalLanding from "../../../components/DVC/experimental/DVCExperimentalLanding";

export default function DVCOptionBIndex() {
  return (
    <DVCExperimentalShell
      option="B"
      title="DVC Demo — Option B"
      description="Experimental per-day Daily Victory Confession demo."
    >
      <DVCExperimentalLanding option="B" yearHref="/dvc/b/2026" />
    </DVCExperimentalShell>
  );
}
