import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "My upcoming sessions",
  description: "See your upcoming Momentizing sessions with a code sent to your WhatsApp. No account needed.",
  robots: { index: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
