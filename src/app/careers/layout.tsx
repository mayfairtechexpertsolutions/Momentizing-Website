import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Careers",
  alternates: { canonical: "./" },
  description: "Join Momentizing as an expert. Tell us about your practice and send your resume.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
