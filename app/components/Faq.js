// Native <details>: accessible, keyboard friendly and needs no JavaScript.
export default function Faq({ items }) {
  return (
    <div className="faq">
      {items.map(({ q, a }) => (
        <details key={q}>
          <summary>{q}</summary>
          <p className="faq-a">{a}</p>
        </details>
      ))}
    </div>
  );
}
