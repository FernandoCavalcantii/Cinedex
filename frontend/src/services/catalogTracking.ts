import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getApiBaseUrl } from "./api";

export type VisitSource =
  | "discover"
  | "top_rated"
  | "trending"
  | "all_movies"
  | "search"
  | "genre"
  | "activity"
  | "metrics";

type CatalogEventInput = {
  visitor_id: string;
  event_type: "detail_open" | "detail_dwell" | "catalog_dwell" | "search";
  movie_id?: string;
  source?: VisitSource;
  duration_seconds?: number;
  search_term?: string;
  result_count?: number;
};

const VISITOR_KEY = "cinedex-visitor";
const OPEN_DEDUPE_MS = 1500;
const SEARCH_TERM_MAX = 200;
const MIN_SECONDS = 1;
const MAX_SECONDS = 21600;
const SOURCES = new Set<VisitSource>([
  "discover",
  "top_rated",
  "trending",
  "all_movies",
  "search",
  "genre",
  "activity",
  "metrics",
]);

export function readVisitSource(state: unknown): VisitSource | undefined {
  if (!state || typeof state !== "object" || !("source" in state)) {
    return undefined;
  }
  const source = (state as { source: unknown }).source;
  return typeof source === "string" && SOURCES.has(source as VisitSource)
    ? (source as VisitSource)
    : undefined;
}

function visitorId(): string {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY, created);
  return created;
}

function postCatalogEvent(event: CatalogEventInput): Promise<boolean> {
  return fetch(`${getApiBaseUrl()}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  })
    .then((response) => response.ok)
    .catch(() => false);
}

function elapsedSeconds(startedAt: number): number {
  return Math.min(MAX_SECONDS, Math.round((Date.now() - startedAt) / 1000));
}

export function useCatalogDwell() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    const visitor = visitorId();

    function begin() {
      if (document.visibilityState === "visible" && startedAt.current == null) {
        startedAt.current = Date.now();
      }
    }

    function flush() {
      if (startedAt.current == null) {
        return;
      }
      const seconds = elapsedSeconds(startedAt.current);
      startedAt.current = null;
      if (seconds < MIN_SECONDS) {
        return;
      }
      void postCatalogEvent({
        visitor_id: visitor,
        event_type: "catalog_dwell",
        duration_seconds: seconds,
      }).then((ok) => {
        if (ok) {
          void queryClient.invalidateQueries({ queryKey: ["metrics"] });
        }
      });
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        flush();
        return;
      }
      begin();
    }

    begin();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [location.pathname, location.search, queryClient]);
}

export function useMovieVisit(movieId: string | undefined, enabled: boolean) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const source = readVisitSource(location.state);

  useEffect(() => {
    if (!movieId || !enabled) {
      return;
    }
    const visitor = visitorId();
    const stampKey = `cinedex-open:${movieId}`;
    const lastOpen = Number(sessionStorage.getItem(stampKey) || 0);
    if (Date.now() - lastOpen > OPEN_DEDUPE_MS) {
      sessionStorage.setItem(stampKey, String(Date.now()));
      void postCatalogEvent({
        visitor_id: visitor,
        event_type: "detail_open",
        movie_id: movieId,
        source,
      }).then((ok) => {
        if (ok) {
          void queryClient.invalidateQueries({ queryKey: ["metrics"] });
          void queryClient.invalidateQueries({ queryKey: ["movies"] });
        }
      });
    }

    let startedAt: number | null = document.visibilityState === "visible" ? Date.now() : null;

    function flush() {
      if (startedAt == null) {
        return;
      }
      const seconds = elapsedSeconds(startedAt);
      startedAt = null;
      if (seconds < MIN_SECONDS) {
        return;
      }
      void postCatalogEvent({
        visitor_id: visitor,
        event_type: "detail_dwell",
        movie_id: movieId,
        source,
        duration_seconds: seconds,
      }).then((ok) => {
        if (ok) {
          void queryClient.invalidateQueries({ queryKey: ["metrics"] });
        }
      });
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        flush();
        return;
      }
      if (startedAt == null) {
        startedAt = Date.now();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [movieId, enabled, source, queryClient]);
}

export function useRecordedSearch(term: string | undefined, resultCount: number | undefined) {
  const queryClient = useQueryClient();
  const posted = useRef<string | null>(null);

  useEffect(() => {
    const stored = term?.trim().slice(0, SEARCH_TERM_MAX);
    if (!stored || resultCount === undefined) {
      return;
    }
    if (posted.current === stored) {
      return;
    }
    const stampKey = `cinedex-search:${stored}`;
    const last = Number(sessionStorage.getItem(stampKey) || 0);
    if (Date.now() - last <= OPEN_DEDUPE_MS) {
      posted.current = stored;
      return;
    }
    posted.current = stored;
    sessionStorage.setItem(stampKey, String(Date.now()));
    void postCatalogEvent({
      visitor_id: visitorId(),
      event_type: "search",
      search_term: stored,
      result_count: resultCount,
    }).then((ok) => {
      if (ok) {
        void queryClient.invalidateQueries({ queryKey: ["metrics"] });
      }
    });
  }, [term, resultCount, queryClient]);
}
