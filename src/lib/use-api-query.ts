"use client";

import { errorMessage, isBackendUnavailable } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiFetchOptions } from "./api";

interface QueryState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  /** The last failure was the backend being unreachable or broken (not a 4xx answer) — callers may show static fallback content. */
  unavailable: boolean;
  refetch: () => void;
}

/** Fetches `path` on mount (and whenever `deps` change), skipping the call while any dep is null/undefined. */
export function useApiQuery<T>(path: string | null, options?: ApiFetchOptions, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(path !== null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  // Reset loading/error during render whenever the request identity changes (React's
  // "adjust state on prop change" pattern) so the effect below only sets state from callbacks.
  const requestKey = [path, nonce, ...deps];
  const [prevKey, setPrevKey] = useState(requestKey);
  if (prevKey.length !== requestKey.length || prevKey.some((v, i) => !Object.is(v, requestKey[i]))) {
    setPrevKey(requestKey);
    setIsLoading(path !== null);
    setError(null);
    setUnavailable(false);
  }

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    apiFetch<T>(path, options)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err));
        setUnavailable(isBackendUnavailable(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce, ...deps]);

  return { data, error, isLoading, unavailable, refetch };
}
