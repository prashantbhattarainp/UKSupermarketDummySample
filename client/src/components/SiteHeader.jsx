import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useStoreContent } from "../context/StoreContext";

const links = [
  ["Products", "/products"],
  ["About", "/about"],
  ["Visit the shop", "/visit"],
  ["FAQs", "/faqs"],
  ["Contact", "/contact"],
];

export default function SiteHeader() {
  const { store } = useStoreContent();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="page-container site-header__inner">
        <Link
          className="brand"
          to="/"
          onClick={closeMenu}
          aria-label={`${store.name} home`}
        >
          <span className="brand__name">{store.name}</span>
          <span className="brand__descriptor">{store.descriptor}</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-toggle__label">Menu</span>
          <span className="menu-toggle__icon" aria-hidden="true">
            {menuOpen ? "×" : "☰"}
          </span>
        </button>
        <nav
          id="primary-navigation"
          className={`site-nav ${menuOpen ? "site-nav--open" : ""}`}
          aria-label="Primary navigation"
        >
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive
                  ? "site-nav__link site-nav__link--active"
                  : "site-nav__link"
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            className="button button--small"
            to="/visit"
            onClick={closeMenu}
          >
            Store information
          </Link>
        </nav>
      </div>
    </header>
  );
}
