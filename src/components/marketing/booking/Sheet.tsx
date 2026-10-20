"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Accessible modal built on the native <dialog>: showModal() gives a real focus trap, makes the page behind inert,
 * closes on Escape and restores focus to the opener. On phones it slides up from the bottom (a sheet); from the md
 * breakpoint up it is a centred dialog. Clicking the dimmed backdrop closes it. The page behind is scroll-locked.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  labelledBy = "sheet-title",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={() => {
        document.body.style.overflow = "";
        onClose();
      }}
      onClick={(e) => {
        // A click on the dialog element itself (not its content) is a click on the backdrop.
        if (e.target === ref.current) onClose();
      }}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-white p-0 text-momentizing-slate shadow-2xl backdrop:bg-momentizing-slate/50 backdrop:backdrop-blur-sm md:m-auto md:max-h-[88dvh] md:max-w-xl md:rounded-3xl"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-momentizing-slate/10 bg-white px-5 py-4 sm:px-7">
        <h2 id={labelledBy} className="font-marketing-serif text-xl">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full text-momentizing-slate hover:bg-momentizing-slate/5 focus-visible:outline-2 focus-visible:outline-momentizing-teal"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        </button>
      </div>
      <div className="px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-7">{open ? children : null}</div>
    </dialog>
  );
}
