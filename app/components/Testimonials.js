import SectionHead from "./SectionHead";

// Renders only when real testimonials exist (added in the Dharma Vault).
export default function Testimonials({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="section surface border-y border-line" aria-labelledby="testimonials-h">
      <div className="container-x">
        <SectionHead center eyebrow="Kind words" title={<span id="testimonials-h">What clients <em>say</em></span>} />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure key={t.id} className="card reveal flex flex-col p-8">
              <blockquote className="flex-1 font-display text-[1.35rem] leading-snug text-ink">“{t.text}”</blockquote>
              <figcaption className="mt-6 border-t border-line pt-4 text-sm">
                <span className="font-semibold text-ink">{t.name}</span>
                {t.role && <span className="block text-mute">{t.role}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
