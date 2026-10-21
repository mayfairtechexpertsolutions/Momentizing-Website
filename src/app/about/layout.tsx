import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us",
  alternates: { canonical: "./" },
  description:
    "Momentizing Holistic Center supports people living between cultures: our vision, mission and the journey from Taiwan to Indonesia and across the globe.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
