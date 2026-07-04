import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getDVCMonth } from "../../../../lib/dvc/months";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const monthSlug = String(req.query.month ?? "");
  const config = getDVCMonth(monthSlug);

  if (!config?.ready) {
    res.status(404).json({ error: "Month not found" });
    return;
  }

  const filePath = path.join(process.cwd(), "content", "dvc", `${config.slug}.html`);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Content not available" });
    return;
  }

  const html = fs.readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(html);
}
