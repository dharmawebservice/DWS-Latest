import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// One project. Links to the case-study page when there is one, otherwise to the live site.
export default function WorkCard({ w, priority = false, sizes = "(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw" }) {
  const internal = w.hasCase;
  const href = internal ? `/work/${w.slug}` : w.url || "#";
  const Wrapper = internal ? Link : "a";
  // Case-study pages load when clicked, not in the background while the home page is still loading.
  const extra = internal ? { prefetch: false } : { target: "_blank", rel: "noopener noreferrer" };

  return (
    <Wrapper
      href={href}
      {...extra}
      className="card card-hover reveal group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-sand">
        {w.image ? (
          <Image
            src={w.image}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : w.logo ? (
          <Image src={w.logo} alt="" width={160} height={80} sizes="160px" className="absolute inset-0 m-auto max-h-16 w-auto max-w-[60%] object-contain" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-display text-5xl text-gold-ink">
            {w.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            {w.category && <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold-ink">{w.category}</p>}
            <h3 className="mt-1.5 font-display text-[1.7rem] leading-tight">{w.name}</h3>
          </div>
          <ArrowUpRight size={18} className="mt-1 shrink-0 text-mute transition-colors group-hover:text-ink" aria-hidden="true" />
        </div>
        {w.summary && <p className="mt-3 text-[0.92rem] text-ink-2">{w.summary}</p>}
        {w.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {w.tags.slice(0, 4).map((t) => <li key={t} className="chip">{t}</li>)}
          </ul>
        )}
      </div>
    </Wrapper>
  );
}