import { MarketingFonts } from "@/components/marketing/MarketingFonts";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { WhatsAppFloatingButton } from "@/components/marketing/WhatsAppFloatingButton";
import { MyBookingsPanel } from "@/components/marketing/booking/MyBookingsPanel";

export default function MyBookingsPage() {
  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <MarketingFonts />
      <MarketingNav variant="simple" simpleLabel="Back Home" />
      <main className="mx-auto max-w-xl px-4 pt-28 pb-24 sm:px-6">
        <MyBookingsPanel />
      </main>
      <WhatsAppFloatingButton />
    </div>
  );
}
