"use client";

import { useEffect } from "react";

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === "undefined" || !("performance" in window)) return;

    // Report Core Web Vitals to analytics if available
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            // LCP log
          } else if (entry.entryType === "first-input") {
            // FID log
          } else if (entry.entryType === "layout-shift") {
            // CLS log
          }
        }
      });

      observer.observe({ type: "largest-contentful-paint", buffered: true });
      observer.observe({ type: "layout-shift", buffered: true });
    } catch {
      // PerformanceObserver unsupported or restricted
    }
  }, []);

  return null;
}
