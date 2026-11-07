export default function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {children && <p className="section-heading__intro">{children}</p>}
    </div>
  );
}
