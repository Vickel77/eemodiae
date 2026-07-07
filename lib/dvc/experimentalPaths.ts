import path from "path";

const OPTION_A_DVC = path.join(process.cwd(), "DVC-2026-OPTION-A-Jul-Dec", "dvc");
const OPTION_B_DVC = path.join(process.cwd(), "DVC-2026-OPTION-B-Jul-Dec", "dvc");

const OPTION_A_2026 = path.join(OPTION_A_DVC, "2026");
const OPTION_B_2026 = path.join(OPTION_B_DVC, "2026");

export type GuideOption = "a" | "b";

export function optionIndexFile(option: GuideOption): string {
  return path.join(option === "a" ? OPTION_A_DVC : OPTION_B_DVC, "index.html");
}

export function optionYearFile(option: GuideOption): string {
  return path.join(option === "a" ? OPTION_A_DVC : OPTION_B_DVC, "2026.html");
}

export function optionAMonthFile(month: string): string {
  return path.join(OPTION_A_2026, `${month.toLowerCase()}.html`);
}

export function optionBMonthIndexFile(month: string): string {
  return path.join(OPTION_B_2026, month.toLowerCase(), "index.html");
}

export function optionBDayFile(month: string, day: string): string {
  const padded = day.padStart(2, "0");
  return path.join(OPTION_B_2026, month.toLowerCase(), `${padded}.html`);
}

export function guideBasePath(option: GuideOption): string {
  return option === "a" ? "/dvc/a" : "/dvc/b";
}
