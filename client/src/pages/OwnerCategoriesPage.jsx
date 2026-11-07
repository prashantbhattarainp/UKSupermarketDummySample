import { useEffect, useState } from "react";

import {
  createOwnerCategory,
  deactivateOwnerCategory,
  fetchOwnerCategories,
  updateOwnerCategory,
} from "../services/ownerCatalogueApi";

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  displayOrder: 0,
  active: true,
};

export default function OwnerCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCategories() {
    setLoading(true);
    try {
      setCategories(await fetchOwnerCategories());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadCategories();
  }, []);

  async function saveCategory(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (form.id) await updateOwnerCategory(form.id, form);
      else await createOwnerCategory(form);
      setForm(null);
      setSuccess(form.id ? "Category updated." : "Category created.");
      await loadCategories();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(category) {
    if (!window.confirm(`Deactivate ${category.name}?`)) return;
    setError("");
    try {
      await deactivateOwnerCategory(category.id);
      setSuccess("Category deactivated.");
      await loadCategories();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  return (
    <section className="owner-section owner-management">
      <div className="owner-section-heading">
        <div>
          <p className="eyebrow">Catalogue management</p>
          <h1>Categories</h1>
          <p className="owner-lead">
            Manage the fictional categories available to the public catalogue.
          </p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={() => {
            setForm({ ...emptyCategory });
            setError("");
          }}
        >
          Add category
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
      {loading ? (
        <p className="owner-placeholder" role="status">
          Loading categories…
        </p>
      ) : (
        <div className="owner-table-wrap">
          <table className="owner-table">
            <caption className="visually-hidden">
              Owner category management
            </caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Display order</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <th scope="row">
                    {category.name}
                    <small>{category.slug}</small>
                  </th>
                  <td>{category.displayOrder}</td>
                  <td>
                    <span
                      className={`owner-status owner-status--${category.active ? "active" : "inactive"}`}
                    >
                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="owner-table__actions">
                    <button
                      className="button button--outline button--small"
                      type="button"
                      onClick={() => setForm({ ...category })}
                    >
                      Edit
                    </button>
                    {category.active && (
                      <button
                        className="button button--outline button--small"
                        type="button"
                        onClick={() => deactivate(category)}
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
      {form && (
        <CategoryForm
          form={form}
          saving={saving}
          onChange={setForm}
          onCancel={() => setForm(null)}
          onSubmit={saveCategory}
        />
      )}
    </section>
  );
}

function CategoryForm({ form, saving, onChange, onCancel, onSubmit }) {
  function change(name, value) {
    onChange((current) => ({ ...current, [name]: value }));
  }
  return (
    <div className="owner-form-panel">
      <p className="eyebrow">{form.id ? "Edit category" : "New category"}</p>
      <h2>{form.id ? "Update category" : "Add a category"}</h2>
      <form className="owner-form" onSubmit={onSubmit}>
        <div className="owner-form-grid">
          <div className="field">
            <label htmlFor="category-name">Name</label>
            <input
              id="category-name"
              required
              value={form.name}
              onChange={(event) => change("name", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="category-slug">Slug</label>
            <input
              id="category-slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={form.slug}
              onChange={(event) => change("slug", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="category-order">Display order</label>
            <input
              id="category-order"
              required
              type="number"
              min="0"
              step="1"
              value={form.displayOrder}
              onChange={(event) =>
                change("displayOrder", Number(event.target.value))
              }
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="category-description">Description</label>
          <textarea
            id="category-description"
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
          Active category
        </label>
        <div className="owner-form-actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save category"}
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
