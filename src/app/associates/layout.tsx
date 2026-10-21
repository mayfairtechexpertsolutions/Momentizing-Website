import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Find a Specialist",
  description: "Browse verified Momentizing counselors, coaches and psychologists. See their experience, languages, fees and client reviews, then request a time.",
  alternates: { canonical: "./" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
