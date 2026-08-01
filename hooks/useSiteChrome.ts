"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

const MEGA_PATHS = ["/shop", "/testimonies", "/bookings", "/events"];

function pathMatches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function useSiteChrome() {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add("el-site-active");
    return () => {
      document.body.classList.remove("el-site-active");
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nav = document.getElementById("elNav");
    const top = document.getElementById("elTop");

    const onScroll = () => {
      const s = window.pageYOffset || document.documentElement.scrollTop;
      nav?.classList.toggle("is-scrolled", s > 20);
      top?.classList.toggle("is-visible", s > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const onTopClick = () => {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    };
    top?.addEventListener("click", onTopClick);

    const toggle = document.getElementById("elToggle");
    const mobile = document.getElementById("elMobile");

    const closeMenu = () => {
      if (!toggle || !mobile) return;
      toggle.classList.remove("is-open");
      mobile.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };

    const onToggle = () => {
      if (!toggle || !mobile) return;
      const open = mobile.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle?.addEventListener("click", onToggle);
    mobile?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

    const onMobileKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onMobileKey);

    const mega = document.getElementById("elMega");
    const megaBtn = document.getElementById("elMegaBtn");
    const megaPanel = document.getElementById("elMegaPanel");
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;

    const openMega = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      mega?.classList.add("is-open");
      megaBtn?.setAttribute("aria-expanded", "true");
    };

    const closeMega = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      mega?.classList.remove("is-open");
      megaBtn?.setAttribute("aria-expanded", "false");
    };

    const toggleMega = () => {
      if (mega?.classList.contains("is-open")) closeMega();
      else openMega();
    };

    const onMegaClick = (e: Event) => {
      e.stopPropagation();
      toggleMega();
    };

    const onMegaPanelClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest("a")) closeMega();
    };

    const onDocClick = (e: MouseEvent) => {
      if (!mega?.contains(e.target as Node)) closeMega();
    };

    const onMegaKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mega?.classList.contains("is-open")) {
        closeMega();
        megaBtn?.focus();
      }
    };

    const onMegaBtnKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" || !megaPanel) return;
      e.preventDefault();
      openMega();
      const first = megaPanel.querySelector("a") as HTMLElement | null;
      first?.focus();
    };

    const onMegaPanelKey = (e: KeyboardEvent) => {
      if (!megaPanel) return;
      const items = Array.from(megaPanel.querySelectorAll("a"));
      const idx = items.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items[idx + 1]) (items[idx + 1] as HTMLElement).focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx <= 0) megaBtn?.focus();
        else (items[idx - 1] as HTMLElement).focus();
      }
    };

    const onResize = () => {
      if (window.innerWidth <= 920) closeMega();
    };

    const onMegaEnter = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      openMega();
    };

    const onMegaLeave = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = setTimeout(closeMega, 180);
    };

    megaBtn?.addEventListener("click", onMegaClick);
    megaPanel?.addEventListener("click", onMegaPanelClick);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onMegaKey);
    megaBtn?.addEventListener("keydown", onMegaBtnKey);
    megaPanel?.addEventListener("keydown", onMegaPanelKey);
    window.addEventListener("resize", onResize);

    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      mega?.addEventListener("mouseenter", onMegaEnter);
      mega?.addEventListener("mouseleave", onMegaLeave);
    }

    const reveals = Array.from(document.querySelectorAll(".el-reveal"));
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
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
    }

    let counted = false;
    const runCount = () => {
      if (counted) return;
      counted = true;
      document.querySelectorAll(".el-trust__num[data-count]").forEach((el) => {
        const target = parseInt(el.getAttribute("data-count") || "0", 10);
        const suffix = /\+/.test(el.textContent || "") ? "+" : "";
        if (reduce) {
          el.textContent = `${target}${suffix}`;
          return;
        }
        let t0: number | null = null;
        const dur = 1400;
        const step = (ts: number) => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(eased * target)}${suffix}`;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    const trust = document.querySelector(".el-trust");
    if (trust && "IntersectionObserver" in window && !reduce) {
      const to = new IntersectionObserver(
        (e) => {
          if (e[0]?.isIntersecting) {
            runCount();
            to.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      to.observe(trust);
    } else {
      runCount();
    }

    const year = document.getElementById("elYear");
    if (year) year.textContent = String(new Date().getFullYear());

    const cMsg = document.getElementById("elCMsg") as HTMLTextAreaElement | null;
    const cCount = document.getElementById("elCCount");
    const onMsgInput = () => {
      if (!cCount || !cMsg) return;
      cCount.textContent = `${cMsg.value.length}/1000`;
      cCount.classList.remove("is-near", "is-max");
      if (cMsg.value.length > 950) cCount.classList.add("is-max");
      else if (cMsg.value.length > 900) cCount.classList.add("is-near");
    };
    cMsg?.addEventListener("input", onMsgInput);

    const cf = document.getElementById("elContactForm") as HTMLFormElement | null;
    const cm = document.getElementById("elContactMsg");
    const onContact = (e: Event) => {
      e.preventDefault();
      const name = (document.getElementById("elCName") as HTMLInputElement)?.value.trim();
      const em = (document.getElementById("elCEmail") as HTMLInputElement)?.value.trim();
      const msg = (document.getElementById("elCMsg") as HTMLTextAreaElement)?.value.trim();
      const okEm = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
      if (!name || !okEm || !msg) {
        if (cm) {
          cm.textContent = "Please fill every field with a valid email.";
          cm.className = "el-footer__msg err";
        }
        return;
      }
      const cbtn = cf?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (cbtn) cbtn.disabled = true;
      if (cm) {
        cm.textContent = "Sending...";
        cm.className = "el-footer__msg";
      }
      fetch("https://formsubmit.co/ajax/eemodiaeweb@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email: em,
          message: msg,
          _subject: "New message from eemodiae.org",
          _template: "table",
          _captcha: "false",
          source: "site contact form",
        }),
      })
        .then((r) => r.json())
        .then(() => {
          if (cm) {
            cm.textContent = "Message sent. Grace and peace.";
            cm.className = "el-footer__msg ok";
          }
          cf?.reset();
          if (cCount) {
            cCount.textContent = "0/1000";
            cCount.className = "el-footer__count";
          }
        })
        .catch(() => {
          if (cm) {
            cm.textContent = "Could not send. Please try again.";
            cm.className = "el-footer__msg err";
          }
        })
        .finally(() => {
          if (cbtn) cbtn.disabled = false;
        });
    };
    cf?.addEventListener("submit", onContact);

    return () => {
      window.removeEventListener("scroll", onScroll);
      top?.removeEventListener("click", onTopClick);
      toggle?.removeEventListener("click", onToggle);
      document.removeEventListener("keydown", onMobileKey);
      megaBtn?.removeEventListener("click", onMegaClick);
      megaPanel?.removeEventListener("click", onMegaPanelClick);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onMegaKey);
      megaBtn?.removeEventListener("keydown", onMegaBtnKey);
      megaPanel?.removeEventListener("keydown", onMegaPanelKey);
      window.removeEventListener("resize", onResize);
      mega?.removeEventListener("mouseenter", onMegaEnter);
      mega?.removeEventListener("mouseleave", onMegaLeave);
      cMsg?.removeEventListener("input", onMsgInput);
      cf?.removeEventListener("submit", onContact);
      if (hoverTimer) clearTimeout(hoverTimer);
    };
  }, []);

  useEffect(() => {
    const pathname = router.pathname;
    const mega = document.getElementById("elMega");
    const megaActive = MEGA_PATHS.some((p) => pathMatches(pathname, p));
    mega?.classList.toggle("is-active", megaActive);

    document.querySelectorAll(".el-nav__links a, .el-mobile a").forEach((node) => {
      const a = node as HTMLAnchorElement;
      a.classList.remove("is-active");
      if (a.classList.contains("el-nav__give") || a.classList.contains("el-mobile__give")) return;
      const href = a.getAttribute("href") || "";
      if (href && pathMatches(pathname, href.split("?")[0])) {
        a.classList.add("is-active");
      }
    });
  }, [router.pathname]);
}
