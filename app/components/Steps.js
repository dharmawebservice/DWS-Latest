// Numbered process list. `detailed` adds the "You / We" lines used on /process.
export default function Steps({ steps, detailed = false }) {
  return (
    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((s) => (
        <li key={s.num} className="card reveal flex flex-col p-7">
          <span className="num-serif text-[3rem] leading-none text-gold-ink">{s.num}</span>
          <h3 className="mt-4 font-display text-[1.5rem] leading-tight">{s.title}</h3>
          <p className="mt-3 text-[0.94rem] text-ink-2">{s.desc}</p>
          {detailed && (
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div><dt className="inline font-semibold text-ink">You: </dt><dd className="inline text-ink-2">{s.you}</dd></div>
              <div><dt className="inline font-semibold text-ink">We: </dt><dd className="inline text-ink-2">{s.we}</dd></div>
            </dl>
          )}
        </li>
      ))}
    </ol>
  );
}
