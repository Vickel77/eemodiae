import { CSSProperties, ReactNode } from "react";
import Image, { StaticImageData } from "next/image";

type SiteHeroProps = {
  eyebrow?: string;
  title?: ReactNode;
  titleStyle?: CSSProperties;
  lead?: string;
  tagline?: string;
  taglineHref?: string;
  id?: string;
  portrait?: { src: string | StaticImageData; alt: string };
  /** Finished banner artwork (title/verse baked into the image) — hides the
   * text overlay and keeps the image's own aspect ratio uncropped. */
  banner?: { src: string | StaticImageData; alt: string; ratio?: string };
};

export default function SiteHero({
  eyebrow = "PROPHET | PREACHER | POET",
  title = "Emmanuel I. Emodiae",
  titleStyle,
  lead = "A prophetic voice calling believers to deepen their faith, discover their purpose, and walk boldly in the destiny God has written for them.",
  tagline = "Preaching Christ...Changing Lives!",
  taglineHref,
  id = "top",
  portrait,
  banner,
}: SiteHeroProps) {
  if (banner) {
    const src = typeof banner.src === "string" ? banner.src : banner.src.src;
    return (
      <section
        className="el-hero has-image is-banner"
        id={id}
        aria-label={banner.alt}
        style={{
          ["--hero-img" as string]: `url(${src})`,
          ["--hero-ratio" as string]: banner.ratio || "1536/610",
        }}
      >
        <div className="el-hero__frame">
          <div className="el-hero__bg" aria-hidden="true" />
          <div className="el-hero__scrim" aria-hidden="true" />
          <div className="el-hero__grain" aria-hidden="true" />
        </div>
      </section>
    );
  }

  return (
    <section className="el-hero" id={id}>
      <div className="el-hero__bg" aria-hidden="true" />
      <div className="el-hero__scrim" aria-hidden="true" />
      <div className="el-hero__grain" aria-hidden="true" />
      <div className={portrait ? "el-hero__inner el-abhero" : "el-hero__inner"}>
        <div className="el-hero__copy">
          <p className="el-eyebrow el-hero__eyebrow">{eyebrow}</p>
          <h1 className="el-hero__title" style={titleStyle}>
            {title}
          </h1>
          <p className="el-hero__lead">{lead}</p>
          {taglineHref ? (
            <p className="el-hero__tagline" style={{ whiteSpace: "normal" }}>
              <a href={taglineHref} style={{ borderBottom: "1px solid var(--line)" }}>
                {tagline}
              </a>
            </p>
          ) : (
            <p className="el-hero__tagline">{tagline}</p>
          )}
        </div>
        {portrait && (
          <div className="el-abhero__media">
            <div className="el-abhero__frame">
              <Image src={portrait.src} alt={portrait.alt} priority />
            </div>
          </div>
        )}
      </div>
      <div className="el-hero__scroll" aria-hidden="true">
        Scroll<span />
      </div>
    </section>
  );
}
