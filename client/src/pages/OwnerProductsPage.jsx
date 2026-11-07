import { useEffect, useState } from "react";

import {
  createOwnerProduct,
  deactivateOwnerProduct,
  fetchOwnerCategories,
  fetchOwnerProducts,
  updateOwnerProduct,
} from "../services/ownerCatalogueApi";

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  price: "",
  unit: "",
  image: "",
  featured: false,
  active: true,
  displayOrder: 0,
};

export default function OwnerProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    active: "",
    page: 1,
  });
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

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchOwnerProducts(filters);
      setProducts(result.items);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOwnerCategories()
      .then(setCategories)
      .catch((loadError) => setError(loadError.message));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  }

  function openCreate() {
    setSuccess("");
    setError("");
    setForm({ ...emptyProduct });
  }

  function openEdit(product) {
    setSuccess("");
    setError("");
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      unit: product.unit,
      image: product.image || "",
      featured: product.featured,
      active: product.active,
      displayOrder: product.displayOrder,
    });
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, price: String(form.price) };
      if (form.id) await updateOwnerProduct(form.id, payload);
      else await createOwnerProduct(payload);
      setForm(null);
      setSuccess(form.id ? "Product updated." : "Product created.");
      await loadProducts();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(product) {
    if (!window.confirm(`Deactivate ${product.name}?`)) return;
    setError("");
    try {
      await deactivateOwnerProduct(product.id);
      setSuccess("Product deactivated.");
      await loadProducts();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  return (
    <section className="owner-section owner-management">
      <div className="owner-section-heading">
        <div>
          <p className="eyebrow">Catalogue management</p>
          <h1>Products</h1>
          <p className="owner-lead">
            Manage the fictional products shown in the public catalogue.
          </p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={openCreate}
        >
          Add product
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
          <label htmlFor="owner-product-search">Search products</label>
          <input
            id="owner-product-search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="owner-product-category">Category</label>
          <select
            id="owner-product-category"
            value={filters.categoryId}
            onChange={(event) => updateFilter("categoryId", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="owner-product-status">Status</label>
          <select
            id="owner-product-status"
            value={filters.active}
            onChange={(event) => updateFilter("active", event.target.value)}
          >
            <option value="">All products</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      {loading ? (
        <p className="owner-placeholder" role="status">
          Loading products…
        </p>
      ) : products.length === 0 ? (
        <p className="owner-placeholder" role="status">
          No products match these filters.
        </p>
      ) : (
        <div className="owner-table-wrap">
          <table className="owner-table">
            <caption className="visually-hidden">
              Owner product management
            </caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">
                    {product.name}
                    <small>{product.slug}</small>
                  </th>
                  <td>{product.category?.name || "Unassigned"}</td>
                  <td>
                    £{Number(product.price).toFixed(2)}
                    <small>{product.unit}</small>
                  </td>
                  <td>
                    <span
                      className={`owner-status owner-status--${product.active ? "active" : "inactive"}`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="owner-table__actions">
                    <button
                      className="button button--outline button--small"
                      type="button"
                      onClick={() => openEdit(product)}
                    >
                      Edit
                    </button>
                    {product.active && (
                      <button
                        className="button button--outline button--small"
                        type="button"
                        onClick={() => deactivate(product)}
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
        <ProductForm
          form={form}
          categories={categories}
          saving={saving}
          onChange={setForm}
          onCancel={() => setForm(null)}
          onSubmit={saveProduct}
        />
      )}
    </section>
  );
}

function ProductForm({
  form,
  categories,
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
      <div className="owner-section-heading">
        <div>
          <p className="eyebrow">{form.id ? "Edit product" : "New product"}</p>
          <h2>{form.id ? "Update product" : "Add a product"}</h2>
        </div>
      </div>
      <form className="owner-form" onSubmit={onSubmit}>
        <div className="owner-form-grid">
          <div className="field">
            <label htmlFor="product-name">Name</label>
            <input
              id="product-name"
              required
              value={form.name}
              onChange={(event) => change("name", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="product-slug">Slug</label>
            <input
              id="product-slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={form.slug}
              onChange={(event) => change("slug", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="product-category">Category</label>
            <select
              id="product-category"
              required
              value={form.categoryId}
              onChange={(event) => change("categoryId", event.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="product-price">Price (£)</label>
            <input
              id="product-price"
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => change("price", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="product-unit">Unit label</label>
            <input
              id="product-unit"
              required
              value={form.unit}
              onChange={(event) => change("unit", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="product-image">Image URL or path</label>
            <input
              id="product-image"
              value={form.image}
              onChange={(event) => change("image", event.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="product-description">Description</label>
          <textarea
            id="product-description"
            required
            rows="4"
            value={form.description}
            onChange={(event) => change("description", event.target.value)}
          />
        </div>
        <div className="owner-checkboxes">
          <label>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => change("featured", event.target.checked)}
            />{" "}
            Featured product
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => change("active", event.target.checked)}
            />{" "}
            Active product
          </label>
        </div>
        <div className="owner-form-actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save product"}
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
