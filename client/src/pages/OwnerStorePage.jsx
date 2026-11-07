import { useEffect, useState } from "react";

import {
  createOwnerService,
  deactivateOwnerService,
  fetchOwnerHours,
  fetchOwnerServices,
  fetchOwnerStore,
  updateOwnerHours,
  updateOwnerService,
  updateOwnerStore,
} from "../services/ownerCatalogueApi";

const dayLabels = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const emptyService = {
  name: "",
  slug: "",
  description: "",
  image: "",
  displayOrder: 0,
  active: true,
};

export default function OwnerStorePage() {
  const [store, setStore] = useState(null);
  const [hours, setHours] = useState({ openingHours: [], exceptions: [] });
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [nextStore, nextHours, nextServices] = await Promise.all([
        fetchOwnerStore(),
        fetchOwnerHours(),
        fetchOwnerServices(),
      ]);
      setStore(nextStore);
      setHours(nextHours);
      setServices(nextServices);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function saveStore(event) {
    event.preventDefault();
    setSaving("store");
    setError("");
    try {
      await updateOwnerStore(store);
      setSuccess("Store details saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving("");
    }
  }
  async function saveHours(event) {
    event.preventDefault();
    setSaving("hours");
    setError("");
    try {
      await updateOwnerHours(hours);
      setSuccess("Opening hours saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving("");
    }
  }
  async function saveService(event) {
    event.preventDefault();
    setSaving("service");
    setError("");
    try {
      if (serviceForm.id) await updateOwnerService(serviceForm.id, serviceForm);
      else await createOwnerService(serviceForm);
      setServiceForm(null);
      setSuccess("Service saved.");
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving("");
    }
  }
  async function removeService(service) {
    if (!window.confirm(`Deactivate ${service.name}?`)) return;
    try {
      await deactivateOwnerService(service.id);
      setSuccess("Service deactivated.");
      await load();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  if (loading)
    return (
      <section className="owner-section">
        <p className="owner-placeholder" role="status">
          Loading store information…
        </p>
      </section>
    );
  if (!store)
    return (
      <section className="owner-section">
        <p className="owner-feedback owner-feedback--error" role="alert">
          {error || "Store information could not be loaded."}
        </p>
      </section>
    );

  return (
    <section className="owner-section owner-management">
      <p className="eyebrow">Store information</p>
      <h1>Store details</h1>
      <p className="owner-lead">
        Manage the fictional public information shown across the website.
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
      <section className="owner-form-panel">
        <h2>Public details</h2>
        <form className="owner-form" onSubmit={saveStore}>
          <div className="owner-form-grid">
            <Field
              label="Store name"
              value={store.name}
              onChange={(value) => setStore({ ...store, name: value })}
            />
            <Field
              label="Short descriptor"
              value={store.descriptor}
              onChange={(value) => setStore({ ...store, descriptor: value })}
            />
            <Field
              label="Telephone"
              value={store.phone}
              onChange={(value) => setStore({ ...store, phone: value })}
            />
            <Field
              label="Public email"
              type="email"
              value={store.email}
              onChange={(value) => setStore({ ...store, email: value })}
            />
            <Field
              label="Postcode"
              value={store.postcode}
              onChange={(value) => setStore({ ...store, postcode: value })}
            />
            <Field
              label="Directions URL"
              value={store.directionsUrl}
              onChange={(value) => setStore({ ...store, directionsUrl: value })}
            />
          </div>
          <div className="field">
            <label htmlFor="store-address">Address lines</label>
            <textarea
              id="store-address"
              rows="3"
              value={store.addressLines.join("\n")}
              onChange={(event) =>
                setStore({
                  ...store,
                  addressLines: event.target.value.split("\n"),
                })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="store-about">About text</label>
            <textarea
              id="store-about"
              rows="5"
              value={store.about}
              onChange={(event) =>
                setStore({ ...store, about: event.target.value })
              }
            />
          </div>
          <button
            className="button button--primary"
            disabled={saving === "store"}
          >
            {saving === "store" ? "Saving…" : "Save store details"}
          </button>
        </form>
      </section>
      <section className="owner-form-panel">
        <h2>Weekly opening hours</h2>
        <form className="owner-form" onSubmit={saveHours}>
          {hours.openingHours.map((item) => (
            <div className="owner-hours-row" key={item.day}>
              <strong>{item.day[0].toUpperCase() + item.day.slice(1)}</strong>
              <label>
                <input
                  type="checkbox"
                  checked={item.closed}
                  onChange={(event) =>
                    setHours({
                      ...hours,
                      openingHours: hours.openingHours.map((day) =>
                        day.day === item.day
                          ? { ...day, closed: event.target.checked }
                          : day,
                      ),
                    })
                  }
                />{" "}
                Closed
              </label>
              <input
                aria-label={`${item.day} opening time`}
                type="time"
                disabled={item.closed}
                value={item.openTime}
                onChange={(event) =>
                  setHours({
                    ...hours,
                    openingHours: hours.openingHours.map((day) =>
                      day.day === item.day
                        ? { ...day, openTime: event.target.value }
                        : day,
                    ),
                  })
                }
              />
              <input
                aria-label={`${item.day} closing time`}
                type="time"
                disabled={item.closed}
                value={item.closeTime}
                onChange={(event) =>
                  setHours({
                    ...hours,
                    openingHours: hours.openingHours.map((day) =>
                      day.day === item.day
                        ? { ...day, closeTime: event.target.value }
                        : day,
                    ),
                  })
                }
              />
            </div>
          ))}
          <h3>Exceptional dates</h3>
          {hours.exceptions.map((item, index) => (
            <div className="owner-hours-row" key={`${item.date}-${index}`}>
              <input
                aria-label="Exception date"
                type="date"
                value={item.date}
                onChange={(event) =>
                  setHours({
                    ...hours,
                    exceptions: hours.exceptions.map((exception, position) =>
                      position === index
                        ? { ...exception, date: event.target.value }
                        : exception,
                    ),
                  })
                }
              />
              <label>
                <input
                  type="checkbox"
                  checked={item.closed}
                  onChange={(event) =>
                    setHours({
                      ...hours,
                      exceptions: hours.exceptions.map((exception, position) =>
                        position === index
                          ? { ...exception, closed: event.target.checked }
                          : exception,
                      ),
                    })
                  }
                />{" "}
                Closed
              </label>
              <input
                aria-label="Exception note"
                placeholder="Public note"
                value={item.note || ""}
                onChange={(event) =>
                  setHours({
                    ...hours,
                    exceptions: hours.exceptions.map((exception, position) =>
                      position === index
                        ? { ...exception, note: event.target.value }
                        : exception,
                    ),
                  })
                }
              />
            </div>
          ))}
          <button
            className="button button--outline"
            type="button"
            onClick={() =>
              setHours({
                ...hours,
                exceptions: [
                  ...hours.exceptions,
                  {
                    date: "",
                    closed: true,
                    openTime: "",
                    closeTime: "",
                    note: "",
                  },
                ],
              })
            }
          >
            Add exceptional date
          </button>
          <button
            className="button button--primary"
            disabled={saving === "hours"}
          >
            {saving === "hours" ? "Saving…" : "Save opening hours"}
          </button>
        </form>
      </section>
      <section className="owner-form-panel">
        <div className="owner-section-heading">
          <h2>Services</h2>
          <button
            className="button button--primary"
            type="button"
            onClick={() => setServiceForm({ ...emptyService })}
          >
            Add service
          </button>
        </div>
        {services.map((service) => (
          <div className="owner-service-row" key={service.id}>
            <div>
              <strong>{service.name}</strong>
              <p>{service.description}</p>
            </div>
            <div className="owner-table__actions">
              <button
                className="button button--outline button--small"
                type="button"
                onClick={() =>
                  setServiceForm({
                    id: service.id,
                    name: service.name,
                    slug: service.slug,
                    description: service.description,
                    image: service.image || "",
                    displayOrder: service.displayOrder,
                    active: service.active,
                  })
                }
              >
                Edit
              </button>
              {service.active && (
                <button
                  className="button button--outline button--small"
                  type="button"
                  onClick={() => removeService(service)}
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
        {serviceForm && (
          <form className="owner-form" onSubmit={saveService}>
            <div className="owner-form-grid">
              <Field
                label="Service name"
                value={serviceForm.name}
                onChange={(value) =>
                  setServiceForm({ ...serviceForm, name: value })
                }
              />
              <Field
                label="Slug"
                value={serviceForm.slug}
                onChange={(value) =>
                  setServiceForm({ ...serviceForm, slug: value })
                }
              />
              <Field
                label="Display order"
                type="number"
                value={serviceForm.displayOrder}
                onChange={(value) =>
                  setServiceForm({
                    ...serviceForm,
                    displayOrder: Number(value),
                  })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="service-description">Description</label>
              <textarea
                id="service-description"
                required
                rows="3"
                value={serviceForm.description}
                onChange={(event) =>
                  setServiceForm({
                    ...serviceForm,
                    description: event.target.value,
                  })
                }
              />
            </div>
            <button
              className="button button--primary"
              disabled={saving === "service"}
            >
              {saving === "service" ? "Saving…" : "Save service"}
            </button>
            <button
              className="button button--outline"
              type="button"
              onClick={() => setServiceForm(null)}
            >
              Cancel
            </button>
          </form>
        )}
      </section>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
