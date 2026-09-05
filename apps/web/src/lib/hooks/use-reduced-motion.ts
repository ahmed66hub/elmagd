"use client";

import { useSyncExternalStore } from "react";

/**
 * تفضيل النظام بتقليل الحركة — نظام خارجي عن React،
 * فنقرأه عبر useSyncExternalStore بدل setState داخل useEffect.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(listener: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
