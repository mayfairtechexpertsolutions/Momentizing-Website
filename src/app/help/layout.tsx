import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Get Help Now",
  description: "Crisis and emergency resources if you or someone near you needs urgent support. Momentizing is not an emergency service.",
  alternates: { canonical: "./" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
