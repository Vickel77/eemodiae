import DVCExperimentalShell from "../../../components/DVC/experimental/DVCExperimentalShell";
import DVCExperimentalYear from "../../../components/DVC/experimental/DVCExperimentalYear";
import { EXPERIMENTAL_DVC_MONTHS } from "../../../lib/dvc/experimentalMonths";

export default function DVCOptionBYear() {
  return (
    <DVCExperimentalShell
      option="B"
      title="DVC 2026 — Option B"
      description="July–December 2026 — one page per day."
    >
      <DVCExperimentalYear
        option="B"
        months={EXPERIMENTAL_DVC_MONTHS}
        landingHref="/dvc/b"
        monthHref={(slug) => `/dvc/b/2026/${slug}`}
      />
    </DVCExperimentalShell>
  );
}
