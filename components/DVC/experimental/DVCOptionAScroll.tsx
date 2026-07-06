"use client";

import { useEffect, useRef } from "react";
import type { DVCMonthConfig } from "../../../lib/dvc/months";
import { attachShareHandlers } from "../../../lib/dvc/experimentalHtml";

type Props = {
  month: DVCMonthConfig;
  styles: string;
  body: string;
};

export default function DVCOptionAScroll({ month, styles, body }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    attachShareHandlers(root, (day) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}/dvc/a/2026/${month.slug}#day${day}`;
    });
  }, [month.slug]);

  return (
    <div className="dvc-exp-content-root">
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
