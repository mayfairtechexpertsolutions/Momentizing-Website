"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  fetchFormToken,
  friendlyError,
  refreshMyBookings,
  requestMyBookingsCode,
  verifyMyBookings,
  type MyBookings,
} from "@/lib/guest-booking";
import { formatSessionWhen } from "@/lib/local-date";
import { ApiError } from "@/lib/api";
import { appLink } from "@config";
import { BookButton, BookCard, Field, InlineNotice, inputClass } from "./ui";
import { TurnstileWidget, TURNSTILE_ENABLED } from "./TurnstileWidget";

const TOKEN_KEY = "momentizing.my-bookings";

type Stage = "phone" | "code" | "list";

function safeGet(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function safeSet(value: string | null) {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode: the page still works, it just asks for a new code after a reload */
  }
}

/**
 * Look up UPCOMING sessions by phone number. A number alone proves nothing, so we send a one-time code to that
 * number's WhatsApp first. We say the same thing whether or not the number is known, and never show past sessions,
 * notes or payment details here — that needs an account.
 */
export function MyBookingsPanel() {
  const [stage, setStage] = useState<Stage>("phone");
  const [whatsapp, setWhatsapp] = useState("");
  const [code, setCode] = useState("");
  const [data, setData] = useState<MyBookings | null>(null);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  // A reload inside the 15-minute window resumes the list instead of asking for a new code.
  useEffect(() => {
    let cancelled = false;
    const saved = safeGet();
    (saved ? refreshMyBookings(saved) : Promise.reject(new Error("none")))
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setStage("list");
        }
      })
      .catch((e) => {
        // Forget the token only when the server says it is no longer good; a network blip shouldn't log the visitor out.
        if (e instanceof ApiError) safeSet(null);
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });
    fetchFormToken()
      .then((t) => !cancelled && setFormToken(t.formToken))
      .catch(() => {
        /* the request below reports it if it is still missing */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formToken) {
      setError("The page isn't ready yet. Please wait a moment and try again.");
      return;
    }
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError("Please wait for the security check to finish, then try again.");
      return;
    }
    setBusy(true);
    try {
      await requestMyBookingsCode({ whatsapp: whatsapp.trim(), formToken, turnstileToken: turnstileToken || undefined, website: "" });
      setStage("code");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
      setResetSignal((n) => n + 1);
    }
  }

  async function check(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const d = await verifyMyBookings(whatsapp.trim(), code.trim());
      safeSet(d.viewToken);
      setData(d);
      setStage("list");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    safeSet(null);
    setData(null);
    setCode("");
    setStage("phone");
    setError(null);
  }

  if (restoring) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center" aria-busy="true">
        <p className="text-momentizing-muted">Getting things ready…</p>
      </div>
    );
  }

  return (
    <BookCard>
      <h1 className="font-marketing-serif text-3xl leading-tight">My upcoming sessions</h1>

      {stage === "phone" && (
        <form onSubmit={sendCode} className="mt-4 flex flex-col gap-5" noValidate>
          <p className="text-momentizing-muted">
            Enter the WhatsApp number you booked with. We&apos;ll send a short code to it so only you can see your sessions. No account needed.
          </p>
          <Field id="mb-whatsapp" label="Your WhatsApp number" hint="For example 0812 3456 7890">
            <input
              id="mb-whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          {TURNSTILE_ENABLED && <TurnstileWidget onToken={setTurnstileToken} onError={(m) => setError(m)} resetSignal={resetSignal} />}
          {error && <InlineNotice tone="error" role="alert">{error}</InlineNotice>}
          <BookButton type="submit" loading={busy} disabled={whatsapp.trim().length < 6}>
            Send me a code
          </BookButton>
        </form>
      )}

      {stage === "code" && (
        <form onSubmit={check} className="mt-4 flex flex-col gap-5" noValidate>
          <InlineNotice tone="info" role="status">
            If this number has upcoming sessions, we&apos;ve sent a 6-digit code to its WhatsApp. It&apos;s valid for 10 minutes.
          </InlineNotice>
          <Field id="mb-code" label="The 6-digit code" hint="Nothing arrived? Check you used the number you booked with.">
            <input
              id="mb-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} tracking-[0.4em]`}
              required
            />
          </Field>
          {error && <InlineNotice tone="error" role="alert">{error}</InlineNotice>}
          <div className="flex flex-wrap gap-3">
            <BookButton type="submit" loading={busy} disabled={code.trim().length < 6}>
              Show my sessions
            </BookButton>
            <BookButton variant="ghost" onClick={startOver}>
              Use a different number
            </BookButton>
          </div>
        </form>
      )}

      {stage === "list" && data && (
        <div className="mt-4 flex flex-col gap-5">
          {data.bookings.length === 0 ? (
            <InlineNotice tone="info" role="status">
              You have no upcoming sessions right now.
            </InlineNotice>
          ) : (
            <ul className="flex flex-col gap-3" aria-label="Your upcoming sessions">
              {data.bookings.map((b) => (
                <li key={b.referenceCode} className="rounded-2xl bg-momentizing-mint/60 p-4">
                  <p className="text-lg font-semibold">{formatSessionWhen(b.sessionDate, b.startTime)}</p>
                  <p className="text-momentizing-muted">
                    with {b.specialistName} · {b.durationMinutes} minutes · {b.sessionType === "ONLINE" ? "Online" : "In person"}
                  </p>
                  <p className="mt-1 text-xs text-momentizing-muted">Reference {b.referenceCode}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-momentizing-muted">
            Need to change a session? Message us on WhatsApp and our team will sort it out with you and your specialist.
          </p>

          {data.hasAccount ? (
            <InlineNotice tone="info">
              To see your past sessions too, <a className="font-semibold underline" href={appLink("/login")}>log in to your account</a>.
            </InlineNotice>
          ) : (
            data.claimToken && (
              <InlineNotice tone="info">
                Want to see your past sessions too?{" "}
                <a
                  className="font-semibold underline"
                  href={appLink(`/register?from=booking#${new URLSearchParams({ claim: data.claimToken, name: data.name ?? "" })}`)}
                >
                  Create a free account
                </a>{" "}
                — your sessions are linked to it automatically.
              </InlineNotice>
            )
          )}
          <div>
            <BookButton variant="ghost" onClick={startOver}>
              Not you? Start over
            </BookButton>
          </div>
        </div>
      )}
    </BookCard>
  );
}
