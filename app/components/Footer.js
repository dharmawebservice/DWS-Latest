import Image from "next/image";
import Link from "next/link";
import { SITE, SERVICES } from "@/lib/content";
import NewsletterForm from "./NewsletterForm";

const COMPANY = [
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Process", href: "/process" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
const LEGAL = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms & conditions", href: "/terms" },
  { label: "Cookie policy", href: "/cookies" },
];

function Col({ title, items, span = "lg:col-span-2" }) {
  return (
    <div className={span}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-light">{title}</p>
      <ul className="mt-4 space-y-1">
        {items.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className="link-underline inline-block py-2 text-[0.92rem] text-[#faf7f0]/80 transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="on-navy">
      <div className="container-x py-14 sm:py-18">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex" aria-label="Dharma Web Services — home">
              <span className="inline-flex bg-bg px-3 py-2"><Image src="/dws-mark.png" alt="" width={480} height={327} sizes="72px" className="h-9 w-auto" /></span>
            </Link>
            <p className="mt-6 max-w-xs font-display text-[1.9rem] leading-[1.12] text-[#faf7f0]">
              Built quietly, <em>launched loudly.</em>
            </p>
            <p className="mt-4 max-w-xs text-sm text-[#faf7f0]/70">
              Fast, premium websites and web apps for growing businesses — made in {SITE.city}.
            </p>
            <ul className="mt-6 space-y-1.5 text-sm">
              <li><a href={`mailto:${SITE.email}`} className="break-all text-[#faf7f0]/85 hover:text-white">{SITE.email}</a></li>
              <li><a href={`tel:${SITE.phoneTel}`} className="text-[#faf7f0]/85 hover:text-white">{SITE.phoneDisplay}</a></li>
              <li className="flex flex-wrap gap-x-6 pt-1">
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center py-2 pr-1 text-[#faf7f0]/85 hover:text-white">WhatsApp</a>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center py-2 pr-1 text-[#faf7f0]/85 hover:text-white">Instagram</a>
                <a href={SITE.x} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center py-2 pr-1 text-[#faf7f0]/85 hover:text-white">X</a>
              </li>
            </ul>
            <div className="mt-8 max-w-sm">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-light">Stay updated</p>
              <p className="mt-3 text-sm text-[#faf7f0]/75">Offers and practical web tips. No spam.</p>
              <NewsletterForm />
            </div>
          </div>

          <Col title="Services" span="lg:col-span-3" items={SERVICES.map((s) => ({ label: s.title, href: `/services/${s.slug}` }))} />
          <Col title="Company" items={COMPANY} />
          <Col title="Legal" items={LEGAL} />

        </div>
      </div>

      <div className="border-t border-[#faf7f0]/15">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-[#faf7f0]/65 sm:flex-row">
          <p>© {new Date().getFullYear()} Dharma Web Services. All rights reserved.</p>
          <p>Crafted in {SITE.city}</p>
        </div>
      </div>
    </footer>
  );
}
