import path from "path";

const OPTION_A_ROOT = path.join(
  process.cwd(),
  "DVC-2026-OPTION-A-Jul-Dec",
  "dvc",
  "2026"
);
const OPTION_B_ROOT = path.join(
  process.cwd(),
  "DVC-2026-OPTION-B-Jul-Dec",
  "dvc",
  "2026"
);

export function optionAMonthFile(month: string): string {
  return path.join(OPTION_A_ROOT, `${month.toLowerCase()}.html`);
}

export function optionBMonthIndexFile(month: string): string {
  return path.join(OPTION_B_ROOT, month.toLowerCase(), "index.html");
}

export function optionBDayFile(month: string, day: string): string {
  const padded = day.padStart(2, "0");
  return path.join(OPTION_B_ROOT, month.toLowerCase(), `${padded}.html`);
}
