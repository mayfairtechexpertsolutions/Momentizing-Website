import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--crms-shadow-card)] ${className}`}
      {...props}
    />
  );
}
