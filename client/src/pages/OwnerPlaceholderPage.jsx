export default function OwnerPlaceholderPage({ title, description }) {
  return (
    <section className="owner-section">
      <p className="eyebrow">Owner area</p>
      <h1>{title}</h1>
      <div className="owner-placeholder" role="status">
        <p>{description}</p>
        <p>There are no management actions available in this phase.</p>
      </div>
    </section>
  );
}
