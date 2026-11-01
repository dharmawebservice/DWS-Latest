import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE, STACK, REASONS } from "@/lib/content";
import { pageMeta, breadcrumbLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import PageHero from "../../components/PageHero";
import SectionHead from "../../components/SectionHead";
import ServiceIcon from "../../components/ServiceIcon";
import CtaBand from "../../components/CtaBand";

export const metadata = pageMeta({
  title: "About Dharma Web Services",
  description:
    "Dharma Web Services is a Bangalore web studio building fast, premium websites and web apps for clients in India, the UK, UAE and US.",
  path: "/about",
});

const VALUES = [
  { t: "Speed, everywhere", d: "Fast to build, fast to load. Performance is a feature we measure, not a promise we make." },
  { t: "You own it all", d: "Code, content, domain and hosting access are yours once the project is complete." },
  { t: "Plain, honest pricing", d: "One-time packages with no subscriptions or surprises. We tell you the price before we begin." },
  { t: "Small studio, direct access", d: "You talk to the person building your site — on WhatsApp, with real answers." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <PageHero
        eyebrow="About"
        title={<>A small studio with <em>big standards.</em></>}
        intro={`Dharma Web Services is a web studio based in ${SITE.city}. We build fast, premium websites, online stores and web apps for businesses in India, the UK, UAE and the US.`}
        crumbs={[{ label: "About" }]}
      />

      <section className="section" aria-labelledby="story-h">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5"><SectionHead eyebrow="Our story" title={<span id="story-h">Why we <em>build</em></span>} /></div>
          <div className="prose-dws blog lg:col-span-7">
            <p>
              Too many small businesses are told they must choose between a cheap template that looks like everyone
              else&apos;s and an expensive agency build that takes months. We started Dharma Web Services to offer a third
              option: premium, custom work at a fair price, delivered in days.
            </p>
            <p>
              Every project is designed from scratch, built with modern tools such as Next.js and React, tuned for
              speed and search, and handed over completely. We keep the team small on purpose, so the person you talk
              to is the person doing the work.
            </p>
          </div>
        </div>
      </section>

      <section className="section border-y border-line bg-sand" aria-labelledby="values-h">
        <div className="container-x">
          <SectionHead center eyebrow="Principles" title={<span id="values-h">How we <em>work</em></span>} />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <li key={v.t} className="card reveal p-8">
                <h3 className="font-display text-[1.6rem] leading-tight">{v.t}</h3>
                <p className="mt-3 text-[0.95rem] text-ink-2">{v.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="stack-h">
        <div className="container-x">
          <SectionHead eyebrow="Toolbox" title={<span id="stack-h">Tools we <em>trust</em></span>} lede="We choose the right tool for each project, not the trendiest one." />
          <ul className="mt-10 flex flex-wrap gap-2.5">
            {STACK.map((t) => <li key={t} className="chip !px-4 !py-2 !text-sm">{t}</li>)}
          </ul>
          <ul className="mt-16 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((r) => (
              <li key={r.title} className="reveal flex gap-4">
                <ServiceIcon name={r.icon} size={18} />
                <div>
                  <h3 className="text-[1.02rem] font-semibold text-ink">{r.title}</h3>
                  <p className="mt-1.5 text-[0.93rem] text-ink-2">{r.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="btn btn-primary btn-lg mt-14">Work with us <ArrowRight size={17} className="arrow" aria-hidden="true" /></Link>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
