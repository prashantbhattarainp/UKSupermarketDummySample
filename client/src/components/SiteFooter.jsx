import { Link } from "react-router-dom";
import { ApplePayIcon, ContactlessIcon, MasterCardIcon, VisaCardIcon } from "./PaymentIcons";
import { useStoreContent } from "../context/StoreContext";

export default function SiteFooter() {
  const { store } = useStoreContent();
  return (
    <footer className="site-footer">
      <div className="page-container site-footer__grid">
        <div>
          <p className="site-footer__brand">{store.name}</p>
          <p className="site-footer__descriptor">{store.descriptor}</p>
          <p className="site-footer__note">
            A reusable website template for an independent neighbourhood
            supermarket.
          </p>
        </div>
        <div>
          <h2 className="site-footer__heading">Store information</h2>
          <ul className="link-list">
            <li>
              <Link to="/visit">Visit the shop</Link>
            </li>
            <li>
              <Link to="/about">About the shop</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/feedback">Feedback & Suggestions</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="site-footer__heading">Useful links</h2>
          <ul className="link-list">
            <li>
              <Link to="/faqs">FAQs</Link>
            </li>
            <li>
              <Link to="/products">Catalogue</Link>
            </li>
            <li>
              <Link to="/offers">Offers</Link>
            </li>
            <li>
              <Link to="/reviews">Reviews</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="site-footer__heading">Legal</h2>
          <ul className="link-list">
            <li>
              <Link to="/privacy">Privacy draft</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-container site-footer__payments">
        <span className="site-footer__payments-label">
          In-store & planned checkout:
        </span>
        <div className="site-footer__badges">
          <span className="footer-badge" title="Visa debit and credit cards">
            <VisaCardIcon size="compact" />
            <span>Visa</span>
          </span>
          <span className="footer-badge" title="Mastercard debit and credit cards">
            <MasterCardIcon size="compact" />
            <span>Mastercard</span>
          </span>
          <span className="footer-badge" title="Apple Pay (integrating soon)">
            <ApplePayIcon size="compact" />
            <span>Apple Pay (Soon)</span>
          </span>
          <span className="footer-badge" title="Contactless payment accepted">
            <ContactlessIcon size={16} />
            <span>Contactless</span>
          </span>
        </div>
      </div>
      <div className="page-container site-footer__bottom">
        <span>
          Store details and prices are fictional demonstration information.
        </span>
        <span>
          © {new Date().getFullYear()} {store.name}
        </span>
      </div>
    </footer>
  );
}
