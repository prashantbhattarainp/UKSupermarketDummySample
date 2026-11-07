import { useEffect, useState } from "react";

import {
  fetchOwnerReviews,
  moderateOwnerReview,
} from "../services/ownerCatalogueApi";

export default function OwnerReviewsPage() {
  const [status, setStatus] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function load() {
    setLoading(true);
    try {
      setReviews(await fetchOwnerReviews(status));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [status]);
  async function moderate(review, nextStatus) {
    setError("");
    try {
      await moderateOwnerReview(review.id, nextStatus);
      setSuccess(`Review ${nextStatus}.`);
      await load();
    } catch (actionError) {
      setError(actionError.message);
    }
  }
  return (
    <section className="owner-section owner-management">
      <p className="eyebrow">Content moderation</p>
      <h1>Reviews</h1>
      <p className="owner-lead">
        Check customer submissions before they appear publicly. Reviews are
        fictional demonstration content.
      </p>
      {success && (
        <p className="owner-feedback owner-feedback--success" role="status">
          {success}
        </p>
      )}
      {error && (
        <p className="owner-feedback owner-feedback--error" role="alert">
          {error}
        </p>
      )}
      <div className="field review-status-filter">
        <label htmlFor="review-status">Filter reviews</label>
        <select
          id="review-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? (
        <p className="owner-placeholder" role="status">
          Loading reviews…
        </p>
      ) : reviews.length ? (
        reviews.map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-card__heading">
              <h2>{review.title || "Untitled review"}</h2>
              <span>{review.rating}/5</span>
            </div>
            <p>{review.comment}</p>
            <small>
              By {review.reviewerName} ·{" "}
              {review.product?.name || "Store review"}
            </small>
            {review.status === "pending" && (
              <div className="owner-form-actions">
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => moderate(review, "approved")}
                >
                  Approve
                </button>
                <button
                  className="button button--outline"
                  type="button"
                  onClick={() => moderate(review, "rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </article>
        ))
      ) : (
        <p className="owner-placeholder" role="status">
          No {status} reviews.
        </p>
      )}
    </section>
  );
}
