import Link from "next/link";
import styled from "styled-components";
import { DVC_MONTHS } from "../../lib/dvc/months";
import { monthReadHref, readOnlineLabel } from "../../lib/dvc/monthUtils";

const readyMonth = DVC_MONTHS.find((m) => m.ready);

const DVCHero = styled(({ className }: { className?: string }) => {
  const readHref = readyMonth
    ? monthReadHref(
        readyMonth.slug,
        readyMonth.monthNum,
        readyMonth.year,
        readyMonth.days
      )
    : "/dvc";
  const readLabel = readyMonth
    ? readOnlineLabel(readyMonth.monthNum, readyMonth.year)
    : "Read online";

  return (
    <section className={className} data-aos="fade-up">
      <div className="dvc-hero-inner">
        <div className="dvc-hero-copy">
          <span className="dvc-hero-badge">2026 Devotional</span>
          <h2>Daily Victory Confession</h2>
          <p className="dvc-hero-tagline">Decree it. See it established.</p>
          <p className="dvc-hero-verse">
            &ldquo;Thou shalt also decree a thing, and it shall be established
            unto thee.&rdquo; <cite>Job 22:28</cite>
          </p>
        </div>
        <div className="dvc-hero-actions">
          <Link href={readHref} className="dvc-hero-cta primary">
            {readLabel}
          </Link>
          <Link href="/dvc" className="dvc-hero-cta secondary">
            Explore DVC
          </Link>
        </div>
      </div>
    </section>
  );
})`
  width: min(92%, 1100px);
  margin: 0 auto 4rem;
  padding: 0 1rem;

  .dvc-hero-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 2rem 2.25rem;
    border-radius: 1.25rem;
    background: linear-gradient(135deg, #0c2748 0%, #1b4d86 55%, #3624a7 100%);
    color: #fff;
    box-shadow: 0 16px 48px rgba(54, 36, 167, 0.22);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        520px 240px at 100% 0%,
        rgba(198, 155, 58, 0.22),
        transparent 60%
      );
      pointer-events: none;
    }
  }

  .dvc-hero-copy {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .dvc-hero-badge {
    display: inline-block;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.1);
    margin-bottom: 0.75rem;
  }

  h2 {
    font-family: ${({ theme }) => theme.headerFont}, sans-serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin: 0 0 0.35rem;
    line-height: 1.15;
  }

  .dvc-hero-tagline {
    font-family: ${({ theme }) => theme.decorFont}, cursive;
    font-size: clamp(1.1rem, 2.5vw, 1.45rem);
    color: #e6cd8f;
    margin: 0 0 0.65rem;
  }

  .dvc-hero-verse {
    font-size: 0.9rem;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.88);
    margin: 0;
    max-width: 36rem;

    cite {
      font-style: normal;
      opacity: 0.85;
      margin-left: 0.25rem;
    }
  }

  .dvc-hero-actions {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    flex-shrink: 0;
  }

  .dvc-hero-cta {
    display: inline-block;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 0.75rem 1.35rem;
    border-radius: 999px;
    text-decoration: none;
    transition: transform 0.18s, background 0.18s, color 0.18s;
    white-space: nowrap;

    &:hover {
      transform: translateY(-1px);
    }

    &.primary {
      background: #fff;
      color: ${({ theme }) => theme.colors.primary};
    }

    &.secondary {
      border: 1px solid rgba(255, 255, 255, 0.45);
      color: #fff;
      background: rgba(255, 255, 255, 0.08);

      &:hover {
        background: rgba(255, 255, 255, 0.16);
      }
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 3rem;

    .dvc-hero-inner {
      flex-direction: column;
      align-items: flex-start;
      padding: 1.75rem 1.5rem;
    }

    .dvc-hero-actions {
      width: 100%;
    }

    .dvc-hero-cta {
      width: 100%;
    }
  }
`;

export default DVCHero;
