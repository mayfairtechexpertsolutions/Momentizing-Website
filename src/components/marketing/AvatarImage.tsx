"use client";

import { useState, type ImgHTMLAttributes } from "react";

/**
 * A specialist photo that swaps to `fallbackSrc` if the file can't be loaded (a missing or misspelt photo name).
 * Without a fallback it behaves like a plain <img>, which is what live backend photos get.
 */
export function AvatarImage({ src, fallbackSrc, alt, ...rest }: { src: string; fallbackSrc?: string; alt: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showFallback = !!fallbackSrc && failedSrc === src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...rest} src={showFallback ? fallbackSrc : src} alt={alt} onError={() => !showFallback && fallbackSrc && setFailedSrc(src)} />
  );
}
