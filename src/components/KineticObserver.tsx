"use client";

import { useEffect } from "react";

export default function KineticObserver() {
  useEffect(() => {
    // 1. Scroll animations for cards
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("kinetic-scroll-reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // Initial observation
    const observeElements = () => {
      document.querySelectorAll(".kinetic-card:not(.kinetic-scroll-reveal)").forEach((el) => {
        observer.observe(el);
      });
    };

    observeElements();

    // Re-observe on DOM mutations (for client-side routing)
    const mutationObserver = new MutationObserver(() => observeElements());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // 2. Setup Progress Bars & Rings
    const progressObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // If it's a progress bar, we animate its width
            const bar = entry.target.querySelector('.progress-fill, [class*="bg-blue-"], [class*="bg-emerald-"], [class*="bg-indigo-"]') as HTMLElement;
            if (bar && bar.style.width) {
              const targetWidth = bar.style.width;
              bar.style.transition = 'none';
              bar.style.width = '0%';
              // Force reflow
              void bar.offsetWidth;
              bar.style.transition = 'width 1000ms cubic-bezier(0.2, 0.8, 0.2, 1)';
              bar.style.width = targetWidth;
            }
            progressObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const observeProgress = () => {
      document.querySelectorAll('.kinetic-card').forEach((el) => {
        // If it has a progress bar inside
        if (el.innerHTML.includes('progress-fill') || el.innerHTML.includes('w-[')) {
           progressObserver.observe(el);
        }
      });
    };

    observeProgress();

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      progressObserver.disconnect();
    };
  }, []);

  return null;
}
