import fs from "fs";
import {
  optionAMonthFile,
  optionBMonthIndexFile,
  optionBDayFile,
} from "./experimentalPaths";
import {
  extractBodyInner,
  extractStyles,
  rewriteOptionAContent,
  rewriteOptionBDayContent,
} from "./experimentalHtml";

export type DayEntry = { day: number; theme: string; weekday: string };

export function loadOptionAMonth(slug: string) {
  const html = fs.readFileSync(optionAMonthFile(slug), "utf-8");
  return {
    styles: extractStyles(html),
    body: rewriteOptionAContent(extractBodyInner(html)),
  };
}

export function loadOptionBDay(month: string, day: number) {
  const html = fs.readFileSync(optionBDayFile(month, String(day)), "utf-8");
  const shareMatch = html.match(/var SHARE_TEXT = "([^"]+)"/);
  const body = rewriteOptionBDayContent(extractBodyInner(html), month, day, shareMatch?.[1]);
  return { styles: extractStyles(html), body };
}

export function loadOptionBDays(month: string, fallbackDays: number): DayEntry[] {
  const filePath = optionBMonthIndexFile(month);
  if (!fs.existsSync(filePath)) {
    return Array.from({ length: fallbackDays }, (_, i) => ({
      day: i + 1,
      theme: `Day ${i + 1}`,
      weekday: "",
    }));
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
    for (let d = 1; d <= fallbackDays; d++) {
      days.push({ day: d, theme: `Day ${d}`, weekday: "" });
    }
  }

  return days;
}
