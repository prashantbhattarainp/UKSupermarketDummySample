import { sortOptions } from "../utils/catalogue";

export default function CatalogueFilters({
  filters,
  onChange,
  onApplyPrices,
  onClear,
  priceError,
}) {
  return (
    <div className="catalogue-filters">
      <div className="field">
        <label htmlFor="min-price">Minimum price</label>
        <input
          id="min-price"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={filters.minPrice}
          onChange={(event) => onChange("minPrice", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="max-price">Maximum price</label>
        <input
          id="max-price"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={filters.maxPrice}
          onChange={(event) => onChange("maxPrice", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="sort-products">Sort products</label>
        <select
          id="sort-products"
          value={filters.sort}
          onChange={(event) => onChange("sort", event.target.value)}
        >
          {sortOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="catalogue-filters__actions">
        <button
          className="button button--primary button--small"
          type="button"
          onClick={onApplyPrices}
        >
          Apply prices
        </button>
        <button
          className="button button--outline button--small"
          type="button"
          onClick={onClear}
        >
          Clear all
        </button>
      </div>
      {priceError && (
        <p className="field__error" role="alert">
          {priceError}
        </p>
      )}
    </div>
  );
}
