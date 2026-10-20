import { buildWhatsAppLink } from "@/lib/whatsapp";

/** Free, official WhatsApp "click to chat" widget (wa.me) — no third-party script, account, or API key
 * needed. Fixed bottom-right on every public page it's rendered on. Uses an inline SVG glyph (not the
 * Font Awesome `fab fa-whatsapp` class used elsewhere) so it renders correctly on pages that don't load
 * MarketingFonts' Font Awesome stylesheet (e.g. /login, /register, /help). */
export function WhatsAppFloatingButton() {
  return (
    <a
      href={buildWhatsAppLink("Hi Momentizing, I'd like to book a session.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[90] flex h-14 w-14 sm:right-6 sm:bottom-6 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.257.593 4.446 1.72 6.374L3.2 28.8l6.594-1.688a12.74 12.74 0 0 0 6.21 1.584h.005c7.07 0 12.8-5.73 12.8-12.8 0-3.42-1.332-6.635-3.75-9.05a12.71 12.71 0 0 0-9.055-3.646zm0 23.36a10.53 10.53 0 0 1-5.37-1.47l-.385-.228-3.914 1.002 1.045-3.815-.25-.392a10.55 10.55 0 0 1-1.616-5.657c0-5.838 4.752-10.59 10.594-10.59a10.52 10.52 0 0 1 7.49 3.104 10.52 10.52 0 0 1 3.1 7.492c0 5.838-4.752 10.554-10.694 10.554zm5.8-7.912c-.317-.16-1.874-.925-2.164-1.03-.29-.107-.502-.16-.714.16s-.818 1.03-1.003 1.24c-.185.213-.37.24-.687.08-.317-.16-1.338-.493-2.548-1.57-.942-.84-1.578-1.878-1.763-2.195-.185-.318-.02-.49.14-.648.143-.142.318-.37.476-.556.16-.185.212-.318.318-.53.106-.213.053-.4-.026-.558-.08-.16-.714-1.72-.978-2.355-.257-.618-.518-.534-.714-.544l-.608-.01a1.17 1.17 0 0 0-.847.398c-.29.318-1.11 1.086-1.11 2.647s1.137 3.07 1.296 3.283c.16.213 2.238 3.418 5.42 4.79.757.327 1.348.523 1.808.669.76.242 1.452.208 2 .126.61-.091 1.874-.766 2.138-1.505.265-.74.265-1.373.185-1.505-.08-.132-.29-.213-.606-.372z" />
      </svg>
    </a>
  );
}
