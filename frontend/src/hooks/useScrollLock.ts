"use client";

import { useEffect } from "react";

/**
 * Blocks page scrolling while an overlay is open. The counter keeps nested overlays
 * (mobile sidebar + confirm dialog) from unlocking the page too early.
 */
let lockCount = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";

function applyLock() {
  previousHtmlOverflow = document.documentElement.style.overflow;
  previousBodyOverflow = document.body.style.overflow;
  // `html` is the scroll container here (globals.css sets overflow-y: scroll),
  // so locking only <body> would leave the page scrollable.
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function releaseLock() {
  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.overflow = previousBodyOverflow;
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    if (lockCount === 1) applyLock();

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) releaseLock();
    };
  }, [active]);
}