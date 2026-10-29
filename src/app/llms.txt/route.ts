import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/site-url";
import { MOMENTIZING_WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export const dynamic = "force-static";

// llms.txt (https://llmstxt.org): a short, plain-language map of the site for AI assistants and answer engines.
export function GET() {
  const body = `# Momentizing Holistic Center

> ${SITE_DESCRIPTION} Sessions are held by secure video from anywhere in the world; no account is needed to book.

Momentizing is not an emergency or crisis service. People in danger should contact local emergency services; crisis resources are listed at ${absoluteUrl("/help/")}.

## Key pages

- [Home](${absoluteUrl("/")}): services, care packages, specialist highlights and frequently asked questions
- [Book a session](${absoluteUrl("/book/")}): pick a day, a specialist and a time, then confirm on WhatsApp
- [Find a specialist](${absoluteUrl("/associates/")}): directory of verified counselors, coaches and psychologists, with fees and reviews
- [Events](${absoluteUrl("/events/")}): upcoming workshops, talks and wellbeing circles, in person and online
- [About us](${absoluteUrl("/about/")}): vision, mission and the journey from Taiwan to Indonesia and beyond
- [Get help now](${absoluteUrl("/help/")}): crisis and emergency resources
- [Careers](${absoluteUrl("/careers/")}): join as an expert
- [Legal & support](${absoluteUrl("/legal/")}): terms and privacy policy

## Facts

- Services: counseling, coaching, psychological assessment, support group facilitation, intercultural relationship therapy, and corporate wellbeing (Mental Health First Aid training, EAP frameworks, burnout-prevention workshops)
- Who it is for: expatriates, international students, cross-cultural couples and the global diaspora
- Format: online video sessions; times are chosen in the client's own time zone
- Specialists: licence numbers and credentials are verified before a profile is published
- Contact: WhatsApp ${MOMENTIZING_WHATSAPP_DISPLAY}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
