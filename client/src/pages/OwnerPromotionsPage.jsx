import { useEffect, useState } from "react";

import { formatPromotionDate } from "../data/promotionsData";
import {
  createOwnerPromotion,
  deactivateOwnerPromotion,
  fetchOwnerProducts,
  fetchOwnerPromotions,
  updateOwnerPromotion,
} from "../services/ownerCatalogueApi";

const emptyPromotion = {
  title: "",
  slug: "",
  description: "",
  productId: "",
  discountType: "percentage",
  discountValue: "",
  promotionalPrice: "",
  startDate: "",
  endDate: "",
  image: "",
  active: true,
};

function getStatus(promotion) {
  const now = new Date();
  const start = new Date(`${promotion.startDate}T00:00:00`);
  const end = new Date(`${promotion.endDate}T23:59:59`);
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return promotion.active ? "current" : "inactive";
}

export default function OwnerPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ search: "", active: "", page: 1 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPromotions() {
    setLoading(true);
    try {
      const result = await fetchOwnerPromotions(filters);
      setPromotions(result.items);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOwnerProducts({ active: "true", limit: 50 })
      .then((result) => setProducts(result.items))
      .catch((loadError) => setError(loadError.message));
  }, []);
  useEffect(() => {
    loadPromotions();
  }, [filters]);

  async function savePromotion(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (payload.discountType === "percentage")
        payload.promotionalPrice = undefined;
      else payload.discountValue = undefined;
      if (form.id) await updateOwnerPromotion(form.id, payload);
      else await createOwnerPromotion(payload);
      setForm(null);
      setSuccess(form.id ? "Promotion updated." : "Promotion created.");
      await loadPromotions();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(promotion) {
    if (!window.confirm(`Deactivate ${promotion.title}?`)) return;
    try {
      await deactivateOwnerPromotion(promotion.id);
      setSuccess("Promotion deactivated.");
      await loadPromotions();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  return (
    <section className="owner-section owner-management">
      <div className="owner-section-heading">
        <div>
          <p className="eyebrow">Catalogue management</p>
          <h1>Promotions</h1>
          <p className="owner-lead">
            Manage fictional offers shown on the public offers page.
          </p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={() => setForm({ ...emptyPromotion })}
        >
          Add promotion
        </button>
      </div>
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
      <div className="owner-filters">
        <div className="field">
          <label htmlFor="promotion-search">Search promotions</label>
          <input
            id="promotion-search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
                page: 1,
              }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="promotion-status">Status</label>
          <select
            id="promotion-status"
            value={filters.active}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                active: event.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All promotions</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      {loading ? (
        <p className="owner-placeholder" role="status">
          Loading promotions…
        </p>
      ) : promotions.length === 0 ? (
        <p className="owner-placeholder" role="status">
          No promotions match these filters.
        </p>
      ) : (
        <div className="owner-table-wrap">
          <table className="owner-table">
            <caption className="visually-hidden">
              Owner promotion management
            </caption>
            <thead>
              <tr>
                <th scope="col">Promotion</th>
                <th scope="col">Dates</th>
                <th scope="col">Offer</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <th scope="row">
                    {promotion.title}
                    <small>{promotion.slug}</small>
                  </th>
                  <td>
                    {formatPromotionDate(promotion.startDate)} –{" "}
                    {formatPromotionDate(promotion.endDate)}
                  </td>
                  <td>
                    {promotion.discountType === "percentage"
                      ? `${promotion.discountValue}% off`
                      : `£${Number(promotion.promotionalPrice).toFixed(2)}`}
                  </td>
                  <td>
                    <span
                      className={`owner-status owner-status--${promotion.active ? "active" : "inactive"}`}
                    >
                      {promotion.active ? getStatus(promotion) : "Inactive"}
                    </span>
                  </td>
                  <td className="owner-table__actions">
                    <button
                      className="button button--outline button--small"
                      type="button"
                      onClick={() =>
                        setForm({
                          id: promotion.id,
                          title: promotion.title,
                          slug: promotion.slug,
                          description: promotion.description,
                          productId: promotion.productId || "",
                          discountType: promotion.discountType,
                          discountValue: promotion.discountValue ?? "",
                          promotionalPrice: promotion.promotionalPrice ?? "",
                          startDate: promotion.startDate,
                          endDate: promotion.endDate,
                          image: promotion.image || "",
                          active: promotion.active,
                        })
                      }
                    >
                      Edit
                    </button>
                    {promotion.active && (
                      <button
                        className="button button--outline button--small"
                        type="button"
                        onClick={() => deactivate(promotion)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination.totalPages > 1 && (
        <div className="owner-pagination">
          <button
            className="button button--outline"
            type="button"
            disabled={pagination.page <= 1}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page - 1 }))
            }
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="button button--outline"
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page + 1 }))
            }
          >
            Next
          </button>
        </div>
      )}
      {form && (
        <PromotionForm
          form={form}
          products={products}
          saving={saving}
          onChange={setForm}
          onCancel={() => setForm(null)}
          onSubmit={savePromotion}
        />
      )}
    </section>
  );
}

function PromotionForm({
  form,
  products,
  saving,
  onChange,
  onCancel,
  onSubmit,
}) {
  function change(name, value) {
    onChange((current) => ({ ...current, [name]: value }));
  }
  return (
    <div className="owner-form-panel">
      <p className="eyebrow">{form.id ? "Edit promotion" : "New promotion"}</p>
      <h2>{form.id ? "Update promotion" : "Add a promotion"}</h2>
      <form className="owner-form" onSubmit={onSubmit}>
        <div className="owner-form-grid">
          <div className="field">
            <label htmlFor="promotion-title">Title</label>
            <input
              id="promotion-title"
              required
              value={form.title}
              onChange={(event) => change("title", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="promotion-slug">Slug</label>
            <input
              id="promotion-slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={form.slug}
              onChange={(event) => change("slug", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="promotion-product">Product</label>
            <select
              id="promotion-product"
              value={form.productId || ""}
              onChange={(event) => change("productId", event.target.value)}
            >
              <option value="">No specific product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="promotion-discount-type">Discount type</label>
            <select
              id="promotion-discount-type"
              value={form.discountType}
              onChange={(event) => change("discountType", event.target.value)}
            >
              <option value="percentage">Percentage off</option>
              <option value="fixed_price">Fixed promotional price</option>
            </select>
          </div>
          <div className="field">
            {form.discountType === "percentage" ? (
              <>
                <label htmlFor="promotion-discount-value">
                  Discount percentage
                </label>
                <input
                  id="promotion-discount-value"
                  required
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(event) =>
                    change("discountValue", event.target.value)
                  }
                />
              </>
            ) : (
              <>
                <label htmlFor="promotion-price">Promotional price (£)</label>
                <input
                  id="promotion-price"
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.promotionalPrice}
                  onChange={(event) =>
                    change("promotionalPrice", event.target.value)
                  }
                />
              </>
            )}
          </div>
          <div className="field">
            <label htmlFor="promotion-image">Image URL or path</label>
            <input
              id="promotion-image"
              value={form.image || ""}
              onChange={(event) => change("image", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="promotion-start">Start date</label>
            <input
              id="promotion-start"
              required
              type="date"
              value={form.startDate}
              onChange={(event) => change("startDate", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="promotion-end">End date</label>
            <input
              id="promotion-end"
              required
              type="date"
              value={form.endDate}
              onChange={(event) => change("endDate", event.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="promotion-description">Description</label>
          <textarea
            id="promotion-description"
            required
            rows="4"
            value={form.description}
            onChange={(event) => change("description", event.target.value)}
          />
        </div>
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => change("active", event.target.checked)}
          />{" "}
          Active promotion
        </label>
        <div className="owner-form-actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save promotion"}
          </button>
          <button
            className="button button--outline"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
