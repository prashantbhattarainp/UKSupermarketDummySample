import { useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import StatusPanel from "../components/StatusPanel";
import { useStoreContent } from "../context/StoreContext";

const initialForm = {
  name: "",
  email: "",
  type: "suggestion",
  rating: 5,
  message: "",
};

export default function FeedbackPage() {
  const { store } = useStoreContent();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.message.trim()) {
      errs.message = "Please share your suggestion, comment, or feedback.";
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    // Simulate pleasant network delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  }

  function handleReset() {
    setForm(initialForm);
    setSubmitted(false);
    setErrors({});
  }

  return (
    <>
      <PageIntro
        eyebrow="Customer Voice & Suggestions"
        title="Share your suggestions & feedback"
      >
        Help us make {store.name} even better. Whether you have an idea for a new product, feedback on your shopping visit, or a general comment, we are always eager to hear from you.
      </PageIntro>

      <section className="page-section page-section--white">
        <PageContainer>
          <div className="two-column">
            <div>
              <h2>Send suggestions or comments</h2>
              <p className="section-lead">
                Your thoughts guide our shelves and customer experience. Fill out the quick form below.
              </p>

              {submitted ? (
                <div className="feedback-success-card" role="status">
                  <div className="feedback-success-card__icon" aria-hidden="true">✓</div>
                  <h3>Thank you for your feedback!</h3>
                  <p>
                    Your feedback and suggestions have been received by the {store.name} management team. We review every response to improve our neighbourhood grocery service.
                  </p>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={handleReset}
                  >
                    Submit another response
                  </button>
                </div>
              ) : (
                <form className="form" onSubmit={handleSubmit} noValidate>
                  <div className="field">
                    <label htmlFor="feedback-type">Category</label>
                    <select
                      id="feedback-type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="suggestion">💡 Store suggestion / idea</option>
                      <option value="product-request">🛒 Product / brand request</option>
                      <option value="compliment">⭐ Staff or service compliment</option>
                      <option value="shopping-experience">🏬 Shopping experience feedback</option>
                      <option value="general">📝 General comment</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="feedback-rating">Overall store experience</label>
                    <div className="rating-select-group">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <label key={star} className="rating-star-option">
                          <input
                            type="radio"
                            name="rating"
                            value={star}
                            checked={Number(form.rating) === star}
                            onChange={() => setForm((prev) => ({ ...prev, rating: star }))}
                          />
                          <span>{"★".repeat(star)}{"☆".repeat(5 - star)} ({star} Star{star > 1 ? "s" : ""})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="feedback-name">
                      Your name <span className="field-hint">(optional)</span>
                    </label>
                    <input
                      id="feedback-name"
                      name="name"
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="feedback-email">
                      Email address <span className="field-hint">(optional, for replies)</span>
                    </label>
                    <input
                      id="feedback-email"
                      name="email"
                      type="email"
                      placeholder="e.g. jane@example.com"
                      value={form.email}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && (
                      <p className="field-error" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="feedback-message">
                      Suggestions, comments, or details <span className="required">*</span>
                    </label>
                    <textarea
                      id="feedback-message"
                      name="message"
                      rows={5}
                      placeholder="Tell us what you'd love to see in Deepak Supermarket, products we should stock, or how your last visit went…"
                      value={form.message}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.message)}
                      required
                    />
                    {errors.message && (
                      <p className="field-error" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="button button--primary"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Send feedback & suggestions"}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar with QR code preview & instructions */}
            <div>
              <div className="info-card qr-spotlight-card">
                <span className="eyebrow">Quick Mobile Access</span>
                <h3>Scan QR code in store</h3>
                <p>
                  Visitors can scan this QR code with any smartphone camera to instantly open this suggestions and feedback form.
                </p>

                <div className="qr-preview-wrapper">
                  <img
                    src="/feedback-qr-code.png"
                    alt="QR code to access Deepak Supermarket feedback and suggestion form"
                    className="qr-preview-img"
                    width="220"
                    height="220"
                  />
                  <p className="qr-preview-caption">
                    Direct link: <code>/feedback</code>
                  </p>
                </div>

                <div className="qr-actions">
                  <a
                    href="/feedback-qr-code.png"
                    download="deepak-supermarket-feedback-qr.png"
                    className="button button--outline button--small"
                  >
                    📥 Download QR code image
                  </a>
                </div>

                <StatusPanel title="Community-focused supermarket">
                  Every suggestion is reviewed directly by Deepak and the team to tailor our groceries to neighborhood needs.
                </StatusPanel>
              </div>

              <div className="info-card" style={{ marginTop: "1.5rem" }}>
                <h3>Browse customer reviews</h3>
                <p>
                  Curious what fellow shoppers are saying about Deepak Supermarket? Read approved reviews or share a published rating.
                </p>
                <Link to="/reviews" className="link-arrow">
                  View customer reviews
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
