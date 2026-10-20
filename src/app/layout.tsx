import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";

// Marketing pair: Fraunces is a soft, warm serif close to the rounded bold headlines on the brand's Instagram
// slides; Nunito matches the friendly rounded labels there ("Counseling", "Our service") and stays legible small.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Momentizing — Healing Without Borders", template: "%s | Momentizing" },
  description: "A safe space for your mind to feel and grow.",
};

export const viewport: Viewport = {
  themeColor: "#3B6B58", // matches --momentizing-teal
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="marketing-root min-h-full flex flex-col bg-momentizing-cream text-momentizing-slate">
        {children}
      </body>
    </html>
  );
}
