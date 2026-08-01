"use client";

import { useEffect, useRef } from "react";
import { DVC_MONTHS } from "../../../lib/dvc/months";
import { gateFutureMonthCardsInDom } from "../../../lib/dvc/monthUtils";

type Props = {
  styles: string;
  body: string;
};

/** Renders guide HTML with scoped styles (landing, year, month index). */
export default function DVCGuidePage({ styles, body }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gateFutureMonthCardsInDom(root, DVC_MONTHS);
  }, [body]);

  return (
    <div className="dvc-guide-root" ref={rootRef}>
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
