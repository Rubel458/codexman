"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "body > main > header",
  "body > main > section",
  "body > main > footer",
  "main > section",
  "section",
  "footer",
  ".scroll-reveal",
].join(",");

export function ScrollRevealInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
      .filter((element) => !element.closest("[data-no-scroll-reveal]") && !element.dataset.revealBound);

    elements.forEach((element, index) => {
      element.dataset.revealBound = "true";
      element.classList.add("scroll-reveal-init");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 45}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
