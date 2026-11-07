import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  return (
    <section className="owner-section">
      <p className="eyebrow">Private owner area</p>
      <h1>Welcome, {user?.displayName}</h1>
      <p className="owner-lead">
        This dashboard is the secure foundation for future catalogue management.
        No live sales, stock, or order statistics are displayed.
      </p>
      <div className="owner-link-grid">
        <Link className="owner-link-panel" to="/owner/products">
          <strong>Products</strong>
          <span>Catalogue management will be added in a later phase.</span>
        </Link>
        <Link className="owner-link-panel" to="/owner/categories">
          <strong>Categories</strong>
          <span>Category management will be added in a later phase.</span>
        </Link>
      </div>
    </section>
  );
}
