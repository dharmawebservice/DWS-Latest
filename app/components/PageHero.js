import Link from "next/link";

export default function PageHero({ eyebrow, title, intro, crumbs = [], children }) {
  return (
    <section className="hero-glow relative overflow-hidden border-b border-line">
      <div className="container-x relative z-10 pb-14 pt-10 sm:pb-20 sm:pt-16">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-7 text-sm text-mute">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-ink">Home</Link></li>
              {crumbs.map((c, i) => (
                <li key={c.href || c.label} className="flex items-center gap-2">
                  <span aria-hidden="true">/</span>
                  {c.href && i < crumbs.length - 1
                    ? <Link href={c.href} className="hover:text-ink">{c.label}</Link>
                    : <span className="text-ink" aria-current="page">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="display-xl mt-5 !text-[clamp(2.4rem,5.6vw,4.4rem)]">{title}</h1>
          {intro && <p className="lede mt-6 max-w-2xl">{intro}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
