"use client";

import { MyBookingsPanel } from "@/components/marketing/booking/MyBookingsPanel";
import { OfflineWhatsAppCard } from "@/components/marketing/OfflineWhatsAppCard";
import { OnlineOnly } from "@/components/marketing/OnlineOnly";
import { t } from "@/i18n";

export default function MyBookingsPage() {
  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <main id="main" className="mx-auto max-w-xl px-4 pt-28 pb-24 sm:px-6">
        <OnlineOnly
          offline={
            <OfflineWhatsAppCard
              title={t("site.offline.myBookingsTitle")}
              body={t("site.offline.myBookingsBody")}
              message={t("site.offline.myBookingsMessage")}
            />
          }
        >
          <MyBookingsPanel />
        </OnlineOnly>
      </main>
    </div>
  );
}
