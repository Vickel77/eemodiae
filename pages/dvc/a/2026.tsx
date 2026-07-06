import DVCExperimentalShell from "../../../components/DVC/experimental/DVCExperimentalShell";
import DVCExperimentalYear from "../../../components/DVC/experimental/DVCExperimentalYear";
import { EXPERIMENTAL_DVC_MONTHS } from "../../../lib/dvc/experimentalMonths";

export default function DVCOptionAYear() {
  return (
    <DVCExperimentalShell
      option="A"
      title="DVC 2026 — Option A"
      description="July–December 2026 — scrolling month pages."
    >
      <DVCExperimentalYear
        option="A"
        months={EXPERIMENTAL_DVC_MONTHS}
        landingHref="/dvc/a"
        monthHref={(slug) => `/dvc/a/2026/${slug}`}
      />
    </DVCExperimentalShell>
  );
}
