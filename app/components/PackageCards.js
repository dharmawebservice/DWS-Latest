import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function PackageCards({ plans }) {
  const cols = plans.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : plans.length >= 3 ? "md:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2" : "";
  return (
    <div className={`mx-auto grid max-w-6xl xl:max-w-none items-stretch gap-6 ${cols}`}>
      {plans.map((p) => (
        <article
          key={p.id}
          className={`reveal relative flex flex-col p-8 sm:p-9 ${
            p.popular ? "on-navy shadow-lift md:-my-4 md:py-12" : "card"
          }`}
        >
          {p.badge && (
            <span
              className={`absolute left-8 top-0 -translate-y-1/2 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider sm:left-9 ${
                p.popular ? "bg-gold-light text-ink" : "border border-[#e6d3a3] bg-gold-soft text-gold-ink"
              }`}
            >
              {p.badge}
            </span>
          )}

          <h3 className="font-display text-[1.9rem] leading-none">{p.name}</h3>
          {p.desc && <p className={`mt-3 text-sm ${p.popular ? "text-[#faf7f0]/75" : "text-ink-2"}`}>{p.desc}</p>}

          <p className="mt-8 flex flex-wrap items-baseline gap-x-2">
            {p.original && <span className={`text-sm line-through ${p.popular ? "text-[#faf7f0]/70" : "text-mute"}`}>{inr(p.original)}</span>}
            <span className={`num-serif text-[3rem] leading-none ${p.popular ? "text-[#faf7f0]" : "text-ink"}`}>{inr(p.price)}</span>
            <span className={`text-sm ${p.popular ? "text-[#faf7f0]/75" : "text-mute"}`}>one-time</span>
          </p>

          <ul className="mt-8 flex-1 space-y-3.5">
            {p.features.map((f) => (
              <li key={f} className={`flex items-start gap-3 text-[0.92rem] ${p.popular ? "text-[#faf7f0]/90" : "text-ink-2"}`}>
                <Check size={16} strokeWidth={2.2} className={`mt-0.5 shrink-0 ${p.popular ? "text-gold-light" : "text-gold-ink"}`} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={`/contact?plan=${encodeURIComponent(p.name)}`}
            className={`btn btn-lg mt-10 w-full ${p.popular ? "btn-gold" : "btn-ghost"}`}
          >
            {p.cta} <ArrowRight size={16} className="arrow" aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
