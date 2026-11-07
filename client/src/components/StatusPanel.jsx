export default function StatusPanel({
  title = "Details to be confirmed",
  children,
}) {
  return (
    <div className="status-panel" role="status">
      <span className="status-panel__mark" aria-hidden="true">
        i
      </span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
