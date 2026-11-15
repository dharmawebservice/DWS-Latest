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

function Col({ title, items }) {
  return (
    <div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold-light">{title}</p>
      <ul className="mt-4 space-y-0.5">
        {items.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} prefetch={false} className="inline-block py-1.5 text-[0.9rem] text-[#faf7f0]/70 transition-colors hover:text-gold-light">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const linkCls = "inline-flex min-h-11 items-center text-[0.88rem] text-[#faf7f0]/70 transition-colors hover:text-gold-light";

export default function Footer() {
  return (
    <footer className="on-navy relative">
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="container-x pb-6 pt-12 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-center text-center lg:col-span-4">
            <Link href="/" className="inline-block" aria-label="Dharma Web Services — home">
              <Image src="/dws-footer-logo.png" alt="" width={711} height={480} sizes="300px" quality={95} className="h-auto w-[150px] sm:w-[190px]" />
            </Link>
            <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-gold-light sm:text-[0.74rem]">
              Build <span aria-hidden="true">·</span> Innovate <span aria-hidden="true">·</span> Elevate
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-5">
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className={linkCls}>WhatsApp</a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className={linkCls}>Instagram</a>
              <a href={SITE.x} target="_blank" rel="noopener noreferrer" className={linkCls}>X</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 lg:col-span-4 lg:pl-6">
            <Col title="Services" items={SERVICES.map((s) => ({ label: s.title, href: `/services/${s.slug}` }))} />
            <Col title="Company" items={COMPANY} />
          </div>

          <div className="lg:col-span-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold-light">Get in touch</p>
            <ul className="mt-3 space-y-0.5">
              <li><a href={`mailto:${SITE.email}`} className="inline-block break-all py-1.5 text-[0.9rem] text-[#faf7f0]/80 transition-colors hover:text-gold-light">{SITE.email}</a></li>
              <li><a href={`tel:${SITE.phoneTel}`} className="inline-block py-1.5 text-[0.9rem] text-[#faf7f0]/80 transition-colors hover:text-gold-light">{SITE.phoneDisplay}</a></li>
            </ul>
            <div className="mt-5">
              <p className="text-[0.8rem] text-[#faf7f0]/55">Offers and practical web tips. No spam.</p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-x-6 gap-y-1 border-t border-[#faf7f0]/10 pt-4 text-xs text-[#faf7f0]/50 md:flex-row">
          <p>© {new Date().getFullYear()} Dharma Web Services · Crafted in {SITE.city}</p>
          <ul className="flex flex-wrap justify-center gap-x-5">
            {LEGAL.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} prefetch={false} className="inline-flex min-h-10 items-center transition-colors hover:text-gold-light">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
