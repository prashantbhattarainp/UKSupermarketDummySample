import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoryNavigation from "../components/CategoryNavigation";
import CatalogueFilters from "../components/CatalogueFilters";
import EmptyState from "../components/EmptyState";
import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import ProductGrid from "../components/ProductGrid";
import {
  categories as staticCategories,
  products as staticProducts,
} from "../data/catalogueData";
import { fetchCategories, fetchProducts } from "../services/catalogueApi";
import { getFilteredProducts, parseCatalogueState } from "../utils/catalogue";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseCatalogueState(searchParams);
  const [queryInput, setQueryInput] = useState(state.query);
  const [filterInput, setFilterInput] = useState({
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sort: state.sort,
  });
  const [categories, setCategories] = useState(staticCategories);
  const [products, setProducts] = useState(staticProducts);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalogue() {
      setError("");

      try {
        const [nextCategories, result] = await Promise.all([
          fetchCategories(),
          fetchProducts({
            search: state.query,
            category: state.category,
            minPrice: state.minPrice,
            maxPrice: state.maxPrice,
            sort: state.sort,
            page: Number(searchParams.get("page") ?? "1"),
            limit: Number(searchParams.get("limit") ?? "12"),
          }),
        ]);

        if (!isMounted) return;

        setCategories(
          nextCategories.length ? nextCategories : staticCategories,
        );
        setProducts(result.items.length ? result.items : staticProducts);
        setPagination(result.pagination);
      } catch (loadError) {
        if (!isMounted) return;
        setError("");
        setProducts(staticProducts);
      }
    }

    loadCatalogue();
    return () => {
      isMounted = false;
    };
  }, [
    retryKey,
    state.category,
    state.maxPrice,
    state.minPrice,
    state.query,
    state.sort,
    searchParams,
  ]);

  useEffect(() => {
    setQueryInput(state.query);
    setFilterInput({
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      sort: state.sort,
    });
  }, [state.query, state.minPrice, state.maxPrice, state.sort]);

  function updateUrl(changes, replace = false) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        next.delete(key);
        return;
      }

      next.set(key, String(value));
    });
    setSearchParams(next, { replace });
  }

  function submitSearch(event) {
    event.preventDefault();
    updateUrl({ q: queryInput.trim(), page: 1 });
  }

  function clearSearch() {
    setQueryInput("");
    updateUrl({ q: "", page: 1 });
  }

  function changeFilter(name, value) {
    setFilterInput((current) => ({ ...current, [name]: value }));

    if (name === "sort") {
      updateUrl({ sort: value === "featured" ? "" : value, page: 1 });
    }
  }

  function applyPrices() {
    const { minPrice, maxPrice } = filterInput;
    if (
      minPrice &&
      (!/^\d+(\.\d{1,2})?$/.test(minPrice) || Number(minPrice) < 0)
    ) {
      return setPriceError("Enter a minimum price of zero or more.");
    }
    if (
      maxPrice &&
      (!/^\d+(\.\d{1,2})?$/.test(maxPrice) || Number(maxPrice) < 0)
    ) {
      return setPriceError("Enter a maximum price of zero or more.");
    }
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      return setPriceError(
        "The minimum price cannot be higher than the maximum price.",
      );
    }

    setPriceError("");
    updateUrl({ minPrice, maxPrice, page: 1 });
  }

  function clearAll() {
    setQueryInput("");
    setFilterInput({ minPrice: "", maxPrice: "", sort: "featured" });
    setPriceError("");
    setSearchParams({});
  }

  const canGoBack = pagination.page > 1;
  const canGoForward = pagination.page < pagination.totalPages;
  const visibleProducts = getFilteredProducts(
    {
      query: state.query,
      category: state.category,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      sort: state.sort,
    },
    products,
  );

  return (
    <>
      <PageIntro eyebrow="Fictional catalogue" title="Our groceries">
        Explore example grocery categories and products for the Deepak
        Supermarket demonstration. Product information and prices are fictional.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <form
            className="catalogue-search"
            onSubmit={submitSearch}
            role="search"
          >
            <label htmlFor="product-search">Search groceries</label>
            <div className="catalogue-search__row">
              <input
                id="product-search"
                type="search"
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                placeholder="Search by product or description"
              />
              <button className="button button--primary" type="submit">
                Search
              </button>
              {state.query && (
                <button
                  className="button button--outline"
                  type="button"
                  onClick={clearSearch}
                >
                  Clear search
                </button>
              )}
            </div>
          </form>
          <div className="catalogue-layout">
            <aside className="catalogue-sidebar">
              <h2>Browse categories</h2>
              <CategoryNavigation
                categories={categories}
                selectedCategory={state.category}
                onSelect={(category) => updateUrl({ category, page: 1 })}
              />
              <CatalogueFilters
                filters={filterInput}
                onChange={changeFilter}
                onApplyPrices={applyPrices}
                onClear={clearAll}
                priceError={priceError}
              />
            </aside>
            <div className="catalogue-results">
              <div className="catalogue-results__heading">
                <p className="eyebrow">Example selection</p>
                <p>
                  <strong>{visibleProducts.length}</strong>{" "}
                  {visibleProducts.length === 1 ? "product" : "products"} shown
                </p>
              </div>

              {loading && (
                <div className="empty-state" aria-live="polite">
                  <h2>Loading groceries…</h2>
                  <p>Please wait while the product catalogue is refreshed.</p>
                </div>
              )}

              {!loading && error && (
                <div className="empty-state" role="alert">
                  <h2>We could not load the catalogue.</h2>
                  <p>{error}</p>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => setRetryKey((count) => count + 1)}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && visibleProducts.length === 0 && (
                <EmptyState
                  title="No groceries match those choices."
                  onClear={clearAll}
                >
                  Try a different search or remove one of the filters to see
                  more fictional products.
                </EmptyState>
              )}

              {!loading && !error && visibleProducts.length > 0 && (
                <>
                  <ProductGrid products={visibleProducts} />
                  {pagination.totalPages > 1 && (
                    <div
                      className="catalogue-pagination"
                      aria-label="Catalogue pagination"
                    >
                      <button
                        type="button"
                        className="button button--outline"
                        disabled={!canGoBack}
                        onClick={() =>
                          updateUrl({ page: Math.max(1, pagination.page - 1) })
                        }
                      >
                        Previous
                      </button>
                      <span>
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        type="button"
                        className="button button--outline"
                        disabled={!canGoForward}
                        onClick={() => updateUrl({ page: pagination.page + 1 })}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
