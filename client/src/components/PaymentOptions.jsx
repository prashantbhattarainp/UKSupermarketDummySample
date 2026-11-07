import { useEffect, useRef, useState } from "react";
import { ApplePayIcon, ContactlessIcon, MasterCardIcon, VisaCardIcon } from "./PaymentIcons";
import { formatPrice } from "../utils/catalogue";

export default function PaymentOptions({ product = null }) {
  const [activeModal, setActiveModal] = useState(null); // 'cards' | 'applepay' | null
  const closeButtonRef = useRef(null);

  // Close modal on Escape key press
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    }
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      // Auto focus close button for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  return (
    <div className="payment-options-block">
      <div className="payment-options-block__header">
        <div>
          <h2 className="payment-options-block__title">Payment options</h2>
          <p className="payment-options-block__subtitle">
            Supported in store and upcoming express checkout integration
          </p>
        </div>
        <span className="payment-options-block__badge">Future checkout</span>
      </div>

      <div className="payment-options-grid">
        {/* Visa & Mastercard Option */}
        <button
          type="button"
          className="payment-option-btn payment-option-btn--cards"
          onClick={() => setActiveModal("cards")}
          aria-haspopup="dialog"
          aria-label="View Visa and Mastercard payment details (integrating soon)"
        >
          <div className="payment-option-btn__icon payment-option-btn__icon--double">
            <VisaCardIcon size="default" />
            <MasterCardIcon size="default" />
          </div>
          <div className="payment-option-btn__info">
            <div className="payment-option-btn__top">
              <span className="payment-option-btn__name">Visa & Mastercard</span>
              <span className="tag-soon">Integrating soon</span>
            </div>
            <span className="payment-option-btn__desc">
              UK debit & credit cards with chip & contactless
            </span>
          </div>
          <span className="payment-option-btn__arrow" aria-hidden="true">
            →
          </span>
        </button>

        {/* Apple Pay Option */}
        <button
          type="button"
          className="payment-option-btn payment-option-btn--applepay"
          onClick={() => setActiveModal("applepay")}
          aria-haspopup="dialog"
          aria-label="View Apple Pay details (integrating soon)"
        >
          <div className="payment-option-btn__icon">
            <ApplePayIcon size="default" />
          </div>
          <div className="payment-option-btn__info">
            <div className="payment-option-btn__top">
              <span className="payment-option-btn__name">Apple Pay</span>
              <span className="tag-soon">Integrating soon</span>
            </div>
            <span className="payment-option-btn__desc">
              Instant one-touch Face ID / Touch ID
            </span>
          </div>
          <span className="payment-option-btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      <p className="payment-options-block__footnote">
        <ContactlessIcon size={14} className="inline-contactless-icon" />
        <span>
          Cash and standard UK debit/credit cards (Visa & Mastercard) are accepted in store. Express online card checkout and Apple Pay will be integrated in an upcoming release.
        </span>
      </p>

      {/* Future Integration Modal Dialog */}
      {activeModal && (
        <div
          className="payment-modal-backdrop"
          onClick={() => setActiveModal(null)}
          role="presentation"
        >
          <div
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            aria-describedby="payment-modal-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="payment-modal__close"
              onClick={() => setActiveModal(null)}
              aria-label="Close payment modal"
            >
              ×
            </button>

            <div className="payment-modal__badge">
              <span className="tag-future">Upcoming Integration</span>
            </div>

            {activeModal === "cards" ? (
              <div className="payment-modal__body">
                <div className="payment-modal__card-visual payment-modal__card-visual--double">
                  <VisaCardIcon size="card" />
                  <MasterCardIcon size="card" />
                </div>
                <h3 id="payment-modal-title" className="payment-modal__title">
                  Pay with Visa & Mastercard
                </h3>
                <p id="payment-modal-desc" className="payment-modal__text">
                  We are preparing full express card integration for <strong>Visa</strong> and <strong>Mastercard</strong> debit and credit cards. Customers will enjoy fast, 3D-Secure protected online grocery checkout as well as in-store tap &amp; chip payments.
                </p>

                {product && (
                  <div className="payment-modal__product-preview">
                    <span className="preview-label">Sample Checkout Item</span>
                    <div className="preview-row">
                      <strong>{product.name}</strong>
                      <span className="preview-price">
                        {formatPrice(product.price)} {product.unit}
                      </span>
                    </div>
                  </div>
                )}

                <div className="payment-modal__feature-list">
                  <div className="feature-item">
                    <span className="feature-bullet">✓</span>
                    <span>All UK and International Visa &amp; Mastercard debit and credit cards</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-bullet">✓</span>
                    <span>Direct contactless &amp; Chip &amp; PIN in store; 3D Secure 2.0 online</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-bullet">✓</span>
                    <span>Encrypted transactions with zero storage of sensitive card details</span>
                  </div>
                </div>

                <div className="payment-modal__status-box">
                  <strong>Integration Status:</strong> Express card checkout will be activated when online ordering and payment services are launched in Phase 9.
                </div>
              </div>
            ) : (
              <div className="payment-modal__body">
                <div className="payment-modal__card-visual">
                  <ApplePayIcon size="card" />
                </div>
                <h3 id="payment-modal-title" className="payment-modal__title">
                  Pay with Apple Pay
                </h3>
                <p id="payment-modal-desc" className="payment-modal__text">
                  Checkout will soon support <strong>Apple Pay</strong> for
                  seamless, private, and secure contactless payments using Face ID,
                  Touch ID, or passcode across iOS, iPadOS, and macOS devices.
                </p>

                {product && (
                  <div className="payment-modal__product-preview">
                    <span className="preview-label">Sample Checkout Item</span>
                    <div className="preview-row">
                      <strong>{product.name}</strong>
                      <span className="preview-price">
                        {formatPrice(product.price)} {product.unit}
                      </span>
                    </div>
                  </div>
                )}

                <div className="payment-modal__feature-list">
                  <div className="feature-item">
                    <span className="feature-bullet">✓</span>
                    <span>One-touch biometric authorization</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-bullet">✓</span>
                    <span>Fast checkout without manually typing card numbers</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-bullet">✓</span>
                    <span>Card numbers are never stored or shared with merchants</span>
                  </div>
                </div>

                <div className="payment-modal__status-box">
                  <strong>Integration Status:</strong> This payment option will
                  be activated when online ordering and payment services are
                  launched in Phase 9.
                </div>
              </div>
            )}

            <div className="payment-modal__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => setActiveModal(null)}
              >
                Understood, return to product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
