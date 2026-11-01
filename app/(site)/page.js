import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SITE, HERO_SLUG, STATS, SERVICES, REASONS, STEPS, FAQS } from "@/lib/content";
import { getWork, getPackages, getTestimonials } from "@/lib/data";
import { pageMeta, orgJsonLd } from "@/lib/seo";
import JsonLd from "../components/JsonLd";
import SectionHead from "../components/SectionHead";
import ServiceIcon from "../components/ServiceIcon";
import WorkCard from "../components/WorkCard";
import PackageCards from "../components/PackageCards";
import Testimonials from "../components/Testimonials";
import Faq from "../components/Faq";
import CtaBand from "../components/CtaBand";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "Dharma Web Services | Premium Website Development in Bangalore",
  description:
    "Fast, premium websites, online stores and web apps for growing businesses. Packages from ₹2,499, delivered in 7–14 days, built in Bangalore for clients worldwide.",
  path: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const [work, plans, testimonials] = await Promise.all([getWork(), getPackages(), getTestimonials()]);

  const withImage = work.filter((w) => w.image);
  const featured = [...withImage.filter((w) => w.featured), ...withImage.filter((w) => !w.featured)].slice(0, 4);
  // Project shown beside the headline. Change HERO_SLUG in lib/content.js to show another one.
  const heroShot = withImage.find((w) => w.slug === HERO_SLUG) || withImage[0];
  const logos = work.filter((w) => w.logo);

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.slice(0, 5).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero-glow relative overflow-hidden">
        <div className="container-x relative z-10 grid items-center gap-14 pb-16 pt-12 sm:pb-24 sm:pt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Web studio · Bangalore, India</p>
            <h1 className="display-xl mt-6">
              Websites that <em>earn their keep.</em>
            </h1>
            <p className="lede mt-8 max-w-xl">
              We design and build fast, beautiful websites, online stores and web apps for growing businesses —
              priced fairly, delivered in days, and owned entirely by you.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn btn-gold btn-lg">
                Start a project <ArrowRight size={17} className="arrow" aria-hidden="true" />
              </Link>
              <Link href="/work" className="btn btn-ghost btn-lg">See our work</Link>
            </div>
          </div>

          {heroShot && (
            <div className="hidden lg:col-span-5 lg:block">
              <Link
                href={heroShot.hasCase ? `/work/${heroShot.slug}` : "/work"}
                className="frame group block bg-paper"
                aria-label={`${heroShot.name} — featured project`}
              >
                <div className="relative aspect-[16/11] border border-line bg-sand">
                  <Image src={heroShot.image} alt="" fill sizes="(min-width:1024px) 480px, 0px" loading="lazy" className="object-cover object-top" />
                </div>
                <div className="flex items-center justify-between border border-t-0 border-line px-5 py-4">
                  <p className="font-display text-xl text-ink">{heroShot.name}</p>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-ink">Featured</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats band ─────────────────────────────────────── */}
      <section aria-label="At a glance" className="on-navy">
        <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className={`py-8 sm:py-10 ${i % 2 === 1 ? "border-l border-[#faf7f0]/15 pl-5 sm:pl-8" : ""} ${i > 1 ? "border-t border-[#faf7f0]/15 lg:border-t-0" : ""} ${i > 0 ? "lg:border-l lg:border-[#faf7f0]/15 lg:pl-8" : ""}`}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="num-serif text-[2.5rem] leading-none text-gold-light sm:text-[3rem]">{s.value}</dd>
              <dd className="mt-2 text-sm text-[#faf7f0]/75">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Services ───────────────────────────────────────── */}
      <section className="section" aria-labelledby="services-h">
        <div className="container-x">
          <SectionHead
            no="01"
            eyebrow="What we do"
            title={<span id="services-h">Everything your business needs <em>online</em></span>}
            lede="From a first landing page to a full custom platform — one studio, one point of contact."
          />
          <div className="mt-14 lg:ml-[248px]">
            {SERVICES.map((s, i) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="row-link group">
                <span className="num-serif text-2xl text-gold-ink">0{i + 1}</span>
                <h3 className="font-display text-[1.6rem] leading-tight sm:text-[1.9rem]">{s.title}</h3>
                <p className="col-span-2 col-start-2 text-[0.95rem] text-ink-2 md:col-span-1 md:col-start-auto">{s.short}</p>
                <ArrowUpRight size={22} className="row-start-1 col-start-3 text-ink transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:row-start-auto md:col-start-auto" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured work ──────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section surface border-y border-line" aria-labelledby="work-h">
          <div className="container-x">
            <SectionHead no="02" eyebrow="Selected work" title={<span id="work-h">Real projects, <em>real clients</em></span>} />
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {featured.map((w) => <WorkCard key={w.id} w={w} />)}
            </div>
            <div className="mt-10 flex justify-center">
              <Link href="/work" className="btn btn-ghost">
                View all work <ArrowRight size={16} className="arrow" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Why us ─────────────────────────────────────────── */}
      <section className="section" aria-labelledby="why-h">
        <div className="container-x">
          <SectionHead
            no="03"
            eyebrow="Why choose us"
            title={<span id="why-h">Premium quality, <em>honest</em> terms</span>}
            lede="A small studio that answers its own WhatsApp, ships quickly and hands over everything."
          />
          <ul className="mt-14 grid border-l border-t border-line-2 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((r) => (
              <li key={r.title} className="border-b border-r border-line-2 p-7 sm:p-9">
                <ServiceIcon name={r.icon} size={18} />
                <h3 className="mt-5 font-display text-[1.4rem] leading-tight">{r.title}</h3>
                <p className="mt-2 text-[0.93rem] text-ink-2">{r.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Process ────────────────────────────────────────── */}
      <section className="section surface border-y border-line" aria-labelledby="process-h">
        <div className="container-x">
          <SectionHead no="04" eyebrow="How it works" title={<span id="process-h">From first call to <em>launch</em></span>} lede="Six clear steps. You always know what happens next." />
          <ol className="mt-14 grid gap-x-12 md:grid-cols-2 lg:ml-[248px]">
            {STEPS.map((s) => (
              <li key={s.num} className="flex gap-6 border-t border-line-2 py-7">
                <span className="num-serif w-14 shrink-0 text-[2.6rem] leading-[0.9] text-gold-ink">{s.num}</span>
                <div>
                  <h3 className="font-display text-[1.45rem] leading-tight">{s.title}</h3>
                  <p className="mt-2 text-[0.94rem] text-ink-2">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 lg:ml-[248px]">
            <Link href="/process" className="btn btn-ghost">Full process <ArrowRight size={16} className="arrow" aria-hidden="true" /></Link>
          </p>
        </div>
      </section>

      <Testimonials items={testimonials} />

      {/* ── Pricing ────────────────────────────────────────── */}
      <section className="section" aria-labelledby="pricing-h">
        <div className="container-x">
          <SectionHead
            center
            eyebrow="Pricing"
            title={<span id="pricing-h">Simple, <em>transparent</em> pricing</span>}
            lede="One-time payment. No subscriptions. No hidden charges. You own everything."
          />
          <div className="mt-16"><PackageCards plans={plans} /></div>
          <p className="mt-12 text-center text-sm text-mute">
            Need something custom?{" "}
            <Link href="/contact" className="link-underline font-medium text-ink">Let&apos;s talk</Link>
            {" · "}
            <Link href="/pricing" className="link-underline font-medium text-ink">Pricing details</Link>
          </p>
        </div>
      </section>

      {/* ── Client logos ───────────────────────────────────── */}
      {logos.length > 0 && (
        <section className="section-tight border-y border-line bg-paper" aria-label="Clients">
          <div className="container-x">
            <p className="eyebrow center">Trusted by</p>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {logos.map((w) => (
                <li key={w.id}>
                  <a
                    href={w.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={w.name}
                    className="flex h-12 items-center transition hover:scale-105"
                  >
                    <Image src={w.logo} alt={w.name} width={120} height={48} sizes="120px" className="max-h-12 w-auto max-w-[8.5rem] object-contain" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="section" aria-labelledby="faq-h">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead eyebrow="FAQ" title={<span id="faq-h">Questions, <em>answered</em></span>} />
            <p className="mt-6 text-sm text-ink-2">
              Something else?{" "}
              <a href={SITE.whatsappHello} className="link-underline font-medium text-ink" target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a>.
            </p>
          </div>
          <div className="lg:col-span-8"><Faq items={FAQS.slice(0, 6)} /></div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
