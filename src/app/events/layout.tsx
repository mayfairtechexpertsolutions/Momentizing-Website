import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Events",
  alternates: { canonical: "./" },
  description: "Workshops, talks and wellbeing circles from Momentizing — in person in Indonesia and online.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
