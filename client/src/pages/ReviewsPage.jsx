import { useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import { fetchReviews, submitReview } from "../services/reviewApi";

const emptyForm = { reviewerName: "", rating: 5, title: "", comment: "" };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await submitReview(form);
      setForm(emptyForm);
      setSuccess(
        "Thank you. Your review has been submitted for moderation before publication.",
      );
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <PageIntro eyebrow="Customer feedback" title="Reviews">
        Read approved customer feedback and share your own experience. New
        submissions are checked before publication.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="review-layout">
            <div>
              <h2>Approved reviews</h2>
              {loading ? (
                <p className="owner-placeholder" role="status">
                  Loading reviews…
                </p>
              ) : error ? (
                <p
                  className="owner-feedback owner-feedback--error"
                  role="alert"
                >
                  {error}
                </p>
              ) : reviews.length ? (
                reviews.map((review) => (
                  <article className="review-card" key={review.id}>
                    <div className="review-card__heading">
                      <h3>{review.title || "Customer review"}</h3>
                      <span aria-label={`${review.rating} out of 5 stars`}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p>{review.comment}</p>
                    <small>
                      By {review.reviewerName} ·{" "}
                      {new Date(review.createdAt).toLocaleDateString("en-GB")}
                    </small>
                  </article>
                ))
              ) : (
                <EmptyState title="No reviews are published yet.">
                  Be the first to share feedback once the store has confirmed
                  the review process.
                </EmptyState>
              )}
            </div>
            <form className="owner-form-panel review-form" onSubmit={submit}>
              <h2>Share your experience</h2>
              <p className="form__note">
                Your review will be pending until it has been checked by the
                owner.
              </p>
              <div className="field">
                <label htmlFor="reviewer-name">Your name</label>
                <input
                  id="reviewer-name"
                  required
                  maxLength="100"
                  value={form.reviewerName}
                  onChange={(event) =>
                    setForm({ ...form, reviewerName: event.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="review-rating">Rating</label>
                <select
                  id="review-rating"
                  value={form.rating}
                  onChange={(event) =>
                    setForm({ ...form, rating: Number(event.target.value) })
                  }
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value} out of 5
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="review-title">Title (optional)</label>
                <input
                  id="review-title"
                  maxLength="160"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="review-comment">Comment</label>
                <textarea
                  id="review-comment"
                  required
                  minLength="10"
                  maxLength="2000"
                  rows="6"
                  value={form.comment}
                  onChange={(event) =>
                    setForm({ ...form, comment: event.target.value })
                  }
                />
              </div>
              {error && (
                <p
                  className="owner-feedback owner-feedback--error"
                  role="alert"
                >
                  {error}
                </p>
              )}
              {success && (
                <p
                  className="owner-feedback owner-feedback--success"
                  role="status"
                >
                  {success}
                </p>
              )}
              <button className="button button--primary" disabled={saving}>
                {saving ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
