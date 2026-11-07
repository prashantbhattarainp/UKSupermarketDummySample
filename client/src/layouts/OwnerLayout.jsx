import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function OwnerLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      navigate("/owner/login", { replace: true });
    }
  }

  return (
    <div className="owner-shell">
      <a className="skip-link" href="#owner-content">
        Skip to main content
      </a>
      <header className="owner-header">
        <div className="page-container owner-header__inner">
          <Link className="owner-brand" to="/owner">
            Deepak Supermarket <span>Owner area</span>
          </Link>
          <nav className="owner-nav" aria-label="Owner navigation">
            <NavLink to="/owner" end>
              Overview
            </NavLink>
            <NavLink to="/owner/products">Products</NavLink>
            <NavLink to="/owner/categories">Categories</NavLink>
            <NavLink to="/owner/promotions">Promotions</NavLink>
            <NavLink to="/owner/store">Store</NavLink>
            <NavLink to="/owner/reviews">Reviews</NavLink>
            <Link to="/">Public website</Link>
            <button
              className="button button--light button--small"
              type="button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main id="owner-content" className="owner-main">
        <div className="page-container owner-userbar">
          Signed in as <strong>{user?.displayName}</strong>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
