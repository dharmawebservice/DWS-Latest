// Section heading. With `no` it renders the editorial number rail (01 / 02 …) beside the headline.
export default function SectionHead({ no, eyebrow, title, lede, center = false, as: Tag = "h2", className = "" }) {
  const body = (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      {eyebrow && !no && <p className={`eyebrow ${center ? "center" : ""}`}>{eyebrow}</p>}
      <Tag className={`display-lg ${eyebrow && !no ? "mt-5" : ""}`}>{title}</Tag>
      {lede && <p className="lede mt-5 max-w-2xl" style={center ? { marginInline: "auto" } : undefined}>{lede}</p>}
    </div>
  );
  if (!no) return <div className={className}>{body}</div>;
  return (
    <div className={`rail ${className}`}>
      <p className="rail-no" aria-hidden="true"><b>{no}</b>{eyebrow}</p>
      {body}
    </div>
  );
}
