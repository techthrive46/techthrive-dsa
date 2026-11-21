"use client";

import { useEffect, useRef } from "react";

/** Keeps commas and spaces readable: `?arr=8,3,11&ops=push+5,pop`. */
function buildQuery(params: Record<string, string | null>): string {
  return Object.entries(params)
    .filter((entry): entry is [string, string] => entry[1] !== null && entry[1] !== "")
    .map(
      ([key, value]) =>
        `${key}=${encodeURIComponent(value).replace(/%2C/gi, ",").replace(/%20/g, "+")}`,
    )
    .join("&");
}

/**
 * Mirrors the visualizer's input into the query string so the current run can be
 * shared as a link. The values present on mount are not written, so a fresh visit
 * keeps a clean URL until the student changes something.
 */
export function useUrlSync(params: Record<string, string | null>) {
  const query = buildQuery(params);
  const lastWritten = useRef(query);

  useEffect(() => {
    if (query === lastWritten.current) return;
    lastWritten.current = query;
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query]);
}
