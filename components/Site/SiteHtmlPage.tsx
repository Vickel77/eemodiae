"use client";

import { ComponentProps, ReactNode, useEffect, useRef } from "react";
import SiteLayout from "./SiteLayout";
import SiteHero from "./SiteHero";

type SiteHtmlPageProps = {
  html: string;
  hero?: ComponentProps<typeof SiteHero> | false;
  initScript?: string;
  className?: string;
  children?: ReactNode;
};

export default function SiteHtmlPage({
  html,
  hero,
  initScript,
  className,
  children,
}: SiteHtmlPageProps) {
  useEffect(() => {
    document.dispatchEvent(new CustomEvent("eemodiae:page-ready"));
  }, [html]);

  // next/script's afterInteractive strategy has proven unreliable here (it
  // silently skips injecting the tag on some page loads); a plain manually
  // appended <script> loads consistently every time. No cleanup/removal:
  // React StrictMode's dev-only double-invoke would append then immediately
  // rip the tag out mid-fetch, which is what made afterInteractive flaky
  // in the first place. The ranRef guard makes the append run exactly once.
  const ranRef = useRef(false);
  useEffect(() => {
    if (!initScript || ranRef.current) return;
    ranRef.current = true;
    const script = document.createElement("script");
    script.src = initScript;
    script.async = false;
    document.body.appendChild(script);
  }, [initScript]);

  const heroNode =
    hero === false ? null : hero ? (
      <SiteHero {...hero} />
    ) : null;

  return (
    <SiteLayout hero={heroNode} className={className}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {children}
    </SiteLayout>
  );
}
