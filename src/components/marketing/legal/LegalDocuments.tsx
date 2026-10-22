import type { ReactNode } from "react";
import { withBase } from "@/lib/base-path";
import { MOMENTIZING_WHATSAPP_DISPLAY } from "@/lib/whatsapp";

/** Shown at the top of both documents. Bump when the wording changes in a way users should know about. */
export const LEGAL_EFFECTIVE_DATE = "22 October 2026";

export const LEGAL_EMAIL = "legal@momentizing.com";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-marketing-serif text-xl text-momentizing-slate">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

const linkClass = "font-semibold underline hover:text-momentizing-gold-deep";

function Contact() {
  return (
    <>
      <a href={`mailto:${LEGAL_EMAIL}`} className={linkClass}>
        {LEGAL_EMAIL}
      </a>{" "}
      or on WhatsApp at {MOMENTIZING_WHATSAPP_DISPLAY}
    </>
  );
}

export function TermsDocument() {
  return (
    <div className="space-y-8 text-base leading-relaxed text-momentizing-muted">
      <p className="text-xs font-bold tracking-widest uppercase">Effective {LEGAL_EFFECTIVE_DATE}</p>

      <p>
        These terms apply when you use the Momentizing website, book a session, ask us for help, or apply to join us.
        If you create an account in the Momentizing app, they apply there too. Please read them together with our{" "}
        <a href="#privacy" className={linkClass}>
          Privacy Policy
        </a>
        . By ticking the box when you book or send a request, or by using the service, you agree to them.
      </p>

      <Section title="1. Who we are">
        <p>
          Momentizing Holistic Center (&quot;Momentizing&quot;, &quot;we&quot;, &quot;us&quot;) offers mental health
          consulting, counselling and coaching for people living between cultures: diaspora communities, expatriates,
          international students and cross-cultural couples. We run a platform that connects you with independent
          specialists, and we look after booking, scheduling, payments and support around your sessions.
        </p>
      </Section>

      <Section title="2. What we do, and what we don't">
        <List
          items={[
            <>
              Our specialists are psychologists, therapists and counsellors, psychiatrists and coaches. They are
              independent professionals who join Momentizing after we review the credentials and licence details they
              give us. They remain responsible for the professional advice they give you.
            </>,
            <>
              Sessions are support, consultation and counselling. Nothing on this website is a diagnosis, a medical
              opinion or a treatment plan, and the website, app and articles are not a substitute for professional
              care.
            </>,
            <>
              We cannot promise a particular result. Progress depends on many things, including you.
            </>,
            <>
              We may suggest a different kind of service (for example a psychiatrist, a doctor or in-person care) if
              we or your specialist think it would suit you better.
            </>,
          ]}
        />
      </Section>

      <Section title="3. Not an emergency service">
        <p>
          <strong className="text-momentizing-slate">
            Momentizing is not equipped for emergencies or immediate crisis intervention.
          </strong>{" "}
          If you or someone near you is in danger, or you are thinking about harming yourself, contact your local
          emergency number now or use the helplines on our{" "}
          <a href={withBase("/help/")} className={linkClass}>
            Crisis Resources page
          </a>
          , which is available at any time without an account. Messages sent to us on WhatsApp, by email or through
          the app may not be read straight away and must not be relied on in an emergency.
        </p>
      </Section>

      <Section title="4. Who can use Momentizing">
        <List
          items={[
            "You must be 18 or older. The booking form asks you to confirm this, and we do not knowingly provide services to anyone under 18.",
            "You must give accurate details, including a WhatsApp number that belongs to you and that you can use.",
            "You may book for yourself, or for yourself and your partner in a couple session. Please do not book on behalf of another adult without their knowledge.",
            "You are responsible for keeping your account password and any booking or verification codes private.",
          ]}
        />
      </Section>

      <Section title="5. Booking a session">
        <List
          items={[
            "You can book without an account. You choose a day, answer a few short questions, choose a specialist and an open time, and we hold that time for you for 30 minutes.",
            <>
              <strong className="text-momentizing-slate">A booking is confirmed only after you prove the WhatsApp number is yours</strong>
              : you send the code shown on screen, from that number, to our business WhatsApp line (
              {MOMENTIZING_WHATSAPP_DISPLAY}). If we do not receive it in time, the hold expires and the time is released. Our team may also confirm a booking by hand.
            </>,
            "Times are shown on your own clock, with the time zone named. Please check the time zone before you confirm.",
            "Booking details, reminders and changes are sent to you on WhatsApp, and by email or app notification if you have an account. By booking you agree to be contacted this way about that booking.",
            "If we cannot find a time that suits you, you can ask for help. Our team will contact you on WhatsApp, usually within one business day.",
            "Recurring sessions are set up with our team after your first session. We will confirm every date with you.",
          ]}
        />
      </Section>

      <Section title="6. Fees and payment">
        <List
          items={[
            "Fees are shown in Indonesian rupiah (IDR) before you commit. A specialist may offer a free first session, a pay-what-you-can arrangement or session packages; the terms of any such offer are shown at the time.",
            "For bookings made on the website without an account, payment is arranged with our team on WhatsApp. Your booking is not charged online.",
            "Account holders pay from prepaid points in their Momentizing wallet. Points are bought through our payment provider and are deducted when a session is booked. The points price of a session is shown before you book.",
            "We will send you an invoice or receipt on request, and for completed sessions where one applies. A session billed on its actual length may be adjusted if it runs more than 15 minutes over or under the booked time.",
            "Prices, packages and the value of a point may change. A change never affects a session that is already confirmed.",
            "Taxes are included only where we say so.",
          ]}
        />
      </Section>

      <Section title="7. Changes, cancellations and missed sessions">
        <List
          items={[
            "To change or cancel a website booking, message us on WhatsApp. Account holders can also do this in the app. Please give as much notice as you can, so the time can be offered to someone else.",
            "If you cancel a session that was paid with points, the points are returned to your wallet, unless a late-change fee applies.",
            "Moving a session within 24 hours of its start time is treated as an emergency reschedule. A late-change fee may apply (our default is 5% of the session fee, and some specialists set their own). The fee is reviewed by your specialist or our team, who may waive it, and it is never taken without being applied and shown to you.",
            "If a specialist has to cancel or move a session, you will not be charged a fee, and we will help you find a new time or return any points.",
            "If you do not attend a session without notice, the session may be treated as completed and charged as usual. We may relax this where there is a good reason.",
            "Sessions that have started cannot be cancelled. If something went wrong with a session, tell us and we will look at it fairly.",
          ]}
        />
      </Section>

      <Section title="8. Confidentiality and its limits">
        <p>
          What you tell your specialist is confidential. Specialists and Momentizing will share information about you
          only:
        </p>
        <List
          items={[
            "with your clear consent (for example, the categories of information you choose to share with your specialist in the app, which you can change at any time);",
            "where the law requires or a court orders it; or",
            "where there is a serious and immediate risk of harm to you or to someone else, and sharing is needed to keep people safe.",
          ]}
        />
        <p>
          Our scheduling staff and assistants can see what they need to arrange your session (such as your name,
          contact details and times) but not your clinical information. Please see the Privacy Policy for the detail.
          Sessions must not be recorded by either side without the other&apos;s written agreement.
        </p>
      </Section>

      <Section title="9. Using the platform fairly">
        <p>You agree not to:</p>
        <List
          items={[
            "give false details, use someone else's number or identity, or make bookings you do not intend to attend;",
            "abuse, harass or threaten specialists, assistants or staff, or other users;",
            "use bots or automated tools, probe or interfere with the service, or try to get around our safety and anti-abuse checks (these include verification, rate limits and block lists);",
            "copy, resell or republish our content, specialist profiles or software without permission; or",
            "use the platform for anything unlawful.",
          ]}
        />
        <p>
          We may refuse or cancel a booking, block a phone number or network address, or suspend an account where we
          reasonably believe these terms have been broken or that the service is being misused. Where it is safe and
          lawful to do so, we will tell you why and how to reach us if you think we got it wrong.
        </p>
      </Section>

      <Section title="10. Accounts">
        <p>
          An account is free and optional. It is not needed to book. You can ask us to close your account at any time
          (see the Privacy Policy for what happens to your data). We may deactivate an account that is misused, or
          that has been inactive for a long time, after giving notice where practical.
        </p>
      </Section>

      <Section title="11. Specialists and applicants">
        <p>
          Specialists use Momentizing under a separate agreement with us. Applying through the Careers page does not
          create employment or any guarantee of work, and a specialist is not our employee unless a written contract
          says so. How we handle application data is described in the Privacy Policy.
        </p>
      </Section>

      <Section title="12. Our content">
        <p>
          The Momentizing name, logo, text, graphics, articles and software are ours or used with permission. You may
          read and use them for your own personal, non-commercial purposes. Journal entries and other material you
          write remain yours, and you give us only the permission needed to store and display them for you.
        </p>
      </Section>

      <Section title="13. Third-party services and links">
        <p>
          We rely on other providers to run the service, including WhatsApp (to confirm and manage bookings), our
          payment provider and cloud hosting. Their own terms apply to their services, and we are not responsible for
          outages or acts outside our reasonable control. Links to other sites are offered for convenience, and we do
          not control or endorse them.
        </p>
      </Section>

      <Section title="14. Availability">
        <p>
          We work to keep the website and app available, but they are provided &quot;as is&quot; and may sometimes be
          unavailable for maintenance or for reasons beyond our control. Crisis resources are kept reachable, but
          please always use your local emergency number in an emergency.
        </p>
      </Section>

      <Section title="15. Our responsibility">
        <p>
          We will carry out our services with reasonable care and skill. To the fullest extent the law allows, we are
          not liable for indirect or consequential loss, for the professional advice or opinions of independent
          specialists, or for events outside our control. Our total responsibility to you for any claim relating to the
          service is limited to the fees you paid for the session the claim concerns. Nothing in these terms limits
          liability that cannot lawfully be limited, or any right you have as a consumer under the law that applies to
          you.
        </p>
      </Section>

      <Section title="16. Changes to these terms">
        <p>
          We may update these terms. The effective date at the top shows the current version. If a change matters to
          you, we will tell you in advance on the website, by WhatsApp or by email. If you keep using Momentizing after
          a change takes effect, you accept it. Bookings already confirmed stay on the terms you agreed to, unless the
          law requires otherwise.
        </p>
      </Section>

      <Section title="17. Law and disputes">
        <p>
          These terms are governed by the laws of the Republic of Indonesia. If you have a concern, please contact us
          first. We will try in good faith to settle it directly and quickly. If we cannot, the courts of Jakarta,
          Indonesia, will have jurisdiction, but this does not take away any right you have to bring a claim where the
          law gives you that right. These terms are written in English. If a translation is provided, the English
          version applies where they differ.
        </p>
      </Section>

      <Section title="18. Contact">
        <p>
          Questions about these terms? Reach us at <Contact />.
        </p>
      </Section>
    </div>
  );
}

export function PrivacyDocument() {
  return (
    <div className="space-y-8 text-base leading-relaxed text-momentizing-muted">
      <p className="text-xs font-bold tracking-widest uppercase">Effective {LEGAL_EFFECTIVE_DATE}</p>

      <p>
        Mental health is personal, so we try to collect as little as we need and to be clear about what happens to it.
        This policy explains what Momentizing collects through this website and our app, why, who sees it, how long we
        keep it, and the choices you have. It follows Indonesia&apos;s Personal Data Protection Law (Law No. 27 of 2022)
        and, where it applies to you, similar laws such as the EU and UK GDPR.
      </p>

      <Section title="1. Who is responsible for your data">
        <p>
          Momentizing Holistic Center (&quot;Momentizing&quot;, &quot;we&quot;) decides how and why your personal data
          is used, so we are the data controller. You can reach us about any privacy question at <Contact />.
        </p>
      </Section>

      <Section title="2. What we collect, and why">
        <h4 className="font-bold text-momentizing-slate">When you book on the website (no account)</h4>
        <List
          items={[
            "Your name and WhatsApp number, to hold your time, prove the number is yours, and contact you about the session.",
            "Your answers to a few short questions: whether this is your first time in therapy, whether you prefer online sessions, whether it is a couple session, that you are 18 or older, and whether anything feels urgent or unsafe. We use them to suggest suitable specialists and to point you to crisis help when needed.",
            "Any optional concern you choose and any note you write. Please share only what you are comfortable with.",
            "The specialist, date, time and status of the booking, and how payment has been arranged.",
          ]}
        />
        <h4 className="font-bold text-momentizing-slate">When you ask for help or send an enquiry</h4>
        <List items={["The details you enter (such as name, WhatsApp number or email, and your message) so our team can reply."]} />
        <h4 className="font-bold text-momentizing-slate">When you create an account in the app</h4>
        <List
          items={[
            "Your name, email and password, and your date of birth to confirm you are an adult.",
            "Anything you choose to add: journal entries, mood logs, tasks, brain dumps, daily intentions and bookmarks. Journal entries are encrypted when stored.",
            "Messages with your specialist and our team, sessions, invoices and wallet and top-up history.",
            "Your settings and consents, including which categories of information you share with your specialist and when you agreed.",
          ]}
        />
        <h4 className="font-bold text-momentizing-slate">When you apply to join us</h4>
        <List
          items={[
            "Your name, email, WhatsApp number, profession, licence number (if you give one), years of experience, languages, short bio, any website or profile link, and your resume (PDF or Word, up to 5 MB). We use these only to assess your application and to contact you.",
          ]}
        />
        <h4 className="font-bold text-momentizing-slate">Technical and safety information</h4>
        <List
          items={[
            "Your network (IP) address and basic request details, used to keep the service secure and to limit abuse, bots and fraudulent bookings. Where we keep them as a record, the addresses are stored in hashed form.",
            "Messages on WhatsApp: when you send us the verification code, we receive your number and the content of the message. Your use of WhatsApp is also governed by WhatsApp\u2019s own terms and privacy notice.",
          ]}
        />
        <p>
          We do not use advertising trackers or third-party analytics on this website, and we do not sell your personal data.
        </p>
      </Section>

      <Section title="3. Our legal basis">
        <p>
          We use your data to carry out the service you ask for (your booking or account), because you have given
          consent (for example, for sensitive information such as health-related answers, and for sharing with your
          specialist), to meet our legal obligations (such as tax and accounting records, and safety duties), and for
          our legitimate interests in running a secure, reliable service and preventing misuse. You can withdraw
          consent at any time. This does not affect what we did before, and it may mean we cannot continue some services.
        </p>
      </Section>

      <Section title="4. What stays in your browser">
        <p>We do not use cookies on this website. We use your browser&apos;s own storage in two ways:</p>
        <List
          items={[
            <>
              <strong className="text-momentizing-slate">Saved favourites</strong> (specialists you have starred) are kept
              on your device only, until you clear them.
            </>,
            <>
              <strong className="text-momentizing-slate">Your booking in progress</strong> (your draft answers, including your
              name and WhatsApp number, and the booking you just made) is kept for the browser tab only, so it survives a refresh or
              the trip to WhatsApp and back. We clear your draft once the booking is created, and closing the tab removes
              the rest.
            </>,
          ]}
        />
        <p>The site also works if you block this storage.</p>
      </Section>

      <Section title="5. Who can see your information">
        <List
          items={[
            <>
              <strong className="text-momentizing-slate">Your specialist</strong> sees your name, contact details and booking
              details for sessions with them. In the app, they see health-related information (such as mood or journal entries) only
              for the categories you choose to share. Each category has its own switch, and you can turn it off at any time. Their access to your information is logged.
            </>,
            <>
              <strong className="text-momentizing-slate">Momentizing staff</strong> (administrators and scheduling assistants) see what they
              need to run your booking and support you: contact details, booking and payment status, your answers to the
              short booking questions, and notes about follow-ups. Assistants do not have access to clinical information.
              Journal text is encrypted, and staff cannot read it.
            </>,
            <>
              <strong className="text-momentizing-slate">Service providers</strong> who process data for us under agreements that limit
              their use: WhatsApp messaging through Twilio; cloud storage and delivery for documents such as resumes and
              invoices (Amazon Web Services); our payment provider for wallet top-ups and payouts (Xendit); email
              delivery; push notifications (Google Firebase); bot protection (Cloudflare Turnstile); and website and application hosting.
              They receive only what they need for their task.
            </>,
            <>
              <strong className="text-momentizing-slate">Authorities or others</strong> where the law requires it, or where there is a
              serious and immediate risk to someone&apos;s safety. We share only what is needed.
            </>,
          ]}
        />
        <p>
          We never sell your personal data, and we never use it for advertising.
        </p>
      </Section>

      <Section title="6. Where your data is processed">
        <p>
          Our providers may process data in Indonesia and in other countries. When your data leaves your country, we
          take steps to make sure it stays protected to a standard that is at least equal to this policy (for example,
          through contractual safeguards).
        </p>
      </Section>

      <Section title="7. How long we keep it">
        <List
          items={[
            "Unconfirmed booking holds expire after 30 minutes and the time is released. Basic records of the attempt may be kept for a short time for security.",
            "Booking, session, invoice and payment records are kept for as long as we need them to provide the service and to meet legal, tax and accounting duties.",
            "Job applications and resumes are kept for up to 12 months, then deleted. If you are hired, your details move to your specialist profile.",
            "When an account is deactivated or you ask us to delete it, we permanently erase your journals, mood logs, tasks, bookmarks and uploaded files after 30 days, and we anonymise your account record. Some records, such as invoices and audit logs, are kept for as long as the law requires.",
            "Security and audit logs are kept as long as needed to protect the service and to meet legal duties.",
          ]}
        />
      </Section>

      <Section title="8. How we protect it">
        <p>
          We use encryption in transit (HTTPS) and encrypt journal entries at rest. Passwords are stored only in hashed form.
          Access is limited by role, and specialist access to client information is logged. Bookings are protected against
          bots and impersonation, including by verifying your WhatsApp number. No system is perfectly secure. If a breach
          is likely to harm you, we will tell you, and the authorities where required, without undue delay.
        </p>
      </Section>

      <Section title="9. Your rights">
        <p>Subject to the law that applies to you, you can ask us to:</p>
        <List
          items={[
            "tell you what personal data we hold about you and give you a copy (account holders can also export their data in the app);",
            "correct anything that is wrong or out of date;",
            "delete your data, or restrict how we use it;",
            "stop using your data where we rely on your consent or on our legitimate interests, and withdraw any consent you gave;",
            "move your data to another service where this is possible; and",
            "tell us about a concern with how an automated process, such as specialist matching, treated you, and ask for a person to review it.",
          ]}
        />
        <p>
          To use any of these rights, contact <Contact />. We may need to confirm it is really you (for example, by
          sending a code to your WhatsApp number) and will answer within the time the law sets, which is usually within 30 days.
          If you are not satisfied, you may complain to the data protection authority in your country.
        </p>
      </Section>

      <Section title="10. Children">
        <p>
          Momentizing is for people aged 18 and over. If you tell us you are under 18, we cannot book you, and if we learn
          that we hold a child&apos;s data without a parent or guardian&apos;s consent, we will delete it. If you think this may
          have happened, please contact us.
        </p>
      </Section>

      <Section title="11. If you are in distress">
        <p>
          If a booking answer, a message or a journal entry suggests you may be unsafe, we show you crisis resources.
          This is automated and not a clinical judgement, and it does not share your information with anyone. If you need
          help now, visit our{" "}
          <a href={withBase("/help/")} className={linkClass}>
            Crisis Resources page
          </a>{" "}
          or call your local emergency number.
        </p>
      </Section>

      <Section title="12. Changes to this policy">
        <p>
          We will update this policy when our practices change. The effective date at the top shows the current version,
          and we will tell you about significant changes in advance on the website, by WhatsApp or by email.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          Questions, requests or concerns about your privacy? Write to us at <Contact />.
        </p>
      </Section>
    </div>
  );
}
