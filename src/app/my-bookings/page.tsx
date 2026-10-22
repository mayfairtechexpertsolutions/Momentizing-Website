import { MyBookingsPanel } from "@/components/marketing/booking/MyBookingsPanel";

export default function MyBookingsPage() {
  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <main id="main" className="mx-auto max-w-xl px-4 pt-28 pb-24 sm:px-6">
        <MyBookingsPanel />
      </main>
    </div>
  );
}
