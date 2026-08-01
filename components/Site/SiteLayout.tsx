"use client";

import { ReactNode } from "react";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { useSiteChrome } from "../../hooks/useSiteChrome";

type SiteLayoutProps = {
  children: ReactNode;
  hero?: ReactNode;
  hideFooter?: boolean;
  className?: string;
};

export default function SiteLayout({ children, hero, hideFooter, className }: SiteLayoutProps) {
  useSiteChrome();

  return (
    <div className={className ? `el-site ${className}` : "el-site"}>
      <SiteNav />
      {hero}
      <main id="main">{children}</main>
      {!hideFooter && <SiteFooter />}
      <button type="button" className="el-top" id="elTop" aria-label="Back to top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
