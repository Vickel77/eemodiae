import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { getExperimentalMonth } from "../../../../../../lib/dvc/experimentalMonths";
import { optionBMonthIndexFile } from "../../../../../../lib/dvc/experimentalPaths";

type DayEntry = { day: number; theme: string; weekday: string };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const monthSlug = String(req.query.month ?? "");
  const config = getExperimentalMonth(monthSlug);

  if (!config?.ready) {
    res.status(404).json({ error: "Month not found" });
    return;
  }

  const filePath = optionBMonthIndexFile(config.slug);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Day index not available" });
    return;
  }

  const html = fs.readFileSync(filePath, "utf-8");
  const days: DayEntry[] = [];
  const cardRe =
    /href="\.\/(\d+)\.html"[\s\S]*?<span class="d-num">(\d+)<\/span>[\s\S]*?<span class="d-theme">([^<]+)<\/span>[\s\S]*?<span class="d-wd">([^<]+)<\/span>/g;

  let match: RegExpExecArray | null;
  while ((match = cardRe.exec(html)) !== null) {
    days.push({
      day: parseInt(match[2], 10),
      theme: match[3].trim(),
      weekday: match[4].trim(),
    });
  }

  if (!days.length) {
    for (let d = 1; d <= config.days; d++) {
      days.push({ day: d, theme: `Day ${d}`, weekday: "" });
    }
  }

  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).json({ month: config.slug, days });
}
