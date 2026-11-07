export default function EmptyState({ title, children, onClear }) {
  return (
    <div className="empty-state" role="status">
      <h2>{title}</h2>
      <p>{children}</p>
      {onClear && (
        <button
          className="button button--outline"
          type="button"
          onClick={onClear}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
