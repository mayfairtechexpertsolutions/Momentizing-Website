"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "momentizing:favorite-specialists";

/** Used only while storage is blocked (private window, cleared site data): hearts still toggle for this page view. */
let memoryFavorites: number[] = [];

function readStored(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryFavorites;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "number") : [];
  } catch {
    return memoryFavorites;
  }
}

function writeStored(next: number[]) {
  memoryFavorites = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: the in-memory copy above keeps the heart working until the page is closed */
  }
}

const FAVORITES_EVENT = "momentizing:favorites-changed";

/** Device-local favorites (no account needed) — persisted in localStorage so the marketing site's
 * heart toggle survives reloads without requiring the visitor to register first. */
export function useFavorites() {
  // Starts empty so server- and client-rendered markup match on first paint; the real value loads
  // in the effect below (localStorage isn't available during SSR).
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    // localStorage isn't available during SSR, so the real value can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(readStored());
    function onChange() {
      setFavorites(readStored());
    }
    window.addEventListener(FAVORITES_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const current = readStored();
    const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
    writeStored(next);
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
