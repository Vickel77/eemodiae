import { useEffect } from "react";

/* ============================================================
   useReveal — adds `is-in` to every .el-reveal element as it
   scrolls into view (IntersectionObserver), matching the
   redesign's reveal-on-scroll behavior. Respects reduced motion.
   ============================================================ */
export default function useReveal() {
  useEffect(() => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>(".el-reveal")
    );
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
