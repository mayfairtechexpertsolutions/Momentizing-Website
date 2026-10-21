import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Legal & Support",
  description: "Momentizing's terms and conditions, privacy policy and answers about confidentiality and support.",
  alternates: { canonical: "./" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
