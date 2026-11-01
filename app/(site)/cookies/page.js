import LegalShell from "../../components/LegalShell";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/content";

export const metadata = pageMeta({
  title: "Cookie Policy",
  description: "Which cookies Dharma Web Services uses — and the ones we deliberately do not.",
  path: "/cookies",
});

export default function Cookies() {
  return (
    <LegalShell
      eyebrow="Legal"
      title={<>Cookie <em>policy</em></>}
      intro="Short version: our public website does not use tracking or advertising cookies. Last updated 24 October 2026."
    >
      <div className="prose-dws">
        <h2>What are cookies?</h2>
        <p>Cookies are small text files a website stores in your browser. They are often used for logins, preferences and analytics.</p>

        <h2>What we use</h2>
        <ul>
          <li><strong>Public pages:</strong> no advertising, social-media or cross-site tracking cookies are set when you browse this website.</li>
          <li><strong>Visit counting:</strong> we count page views on our server using basic request information. This does not place a cookie in your browser.</li>
          <li><strong>Private areas:</strong> a single, strictly necessary session cookie is used only for our team&apos;s private admin area. Visitors never receive it.</li>
        </ul>

        <h2>Third-party content</h2>
        <p>
          If you follow a link to WhatsApp, Instagram or X, or to a client&apos;s website, those services operate under their own
          cookie and privacy policies.
        </p>

        <h2>Your choices</h2>
        <p>You can block or delete cookies in your browser settings at any time. Because we do not use non-essential cookies, you will not see a cookie banner here.</p>

        <h2>Contact</h2>
        <p>Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </LegalShell>
  );
}
