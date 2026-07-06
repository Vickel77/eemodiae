"use client";

import { useEffect, useRef } from "react";
import type { DVCMonthConfig } from "../../../lib/dvc/months";
import { attachShareHandlers } from "../../../lib/dvc/experimentalHtml";

type Props = {
  month: DVCMonthConfig;
  day: number;
  styles: string;
  body: string;
};

export default function DVCOptionBDayPage({ month, day, styles, body }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    attachShareHandlers(root, () => {
      if (typeof window !== "undefined") return window.location.href;
      return `/dvc/b/2026/${month.slug}/${day}`;
    });
  }, [month.slug, day]);

  return (
    <div className="dvc-exp-content-root">
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
