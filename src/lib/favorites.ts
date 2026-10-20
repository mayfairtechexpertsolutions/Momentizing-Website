"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "momentizing:favorite-specialists";

function readStored(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "number") : [];
  } catch {
    return [];
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
