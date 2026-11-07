import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import PageContainer from "../components/PageContainer";
import PaymentOptions from "../components/PaymentOptions";
import ProductImage from "../components/ProductImage";
import StatusPanel from "../components/StatusPanel";
import { fetchProductBySlug } from "../services/catalogueApi";
import {
  formatPrice,
  getCategoryName,
  getProductBySlug,
} from "../utils/catalogue";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(() => getProductBySlug(slug));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setError("");

      try {
        const result = await fetchProductBySlug(slug);
        if (!isMounted) return;

        setProduct(result);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "The product could not be loaded.");
        setProduct(null);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="empty-state" aria-live="polite">
            <h1>Loading product…</h1>
            <p>Please wait while we fetch the item details.</p>
          </div>
        </PageContainer>
      </section>
    );
  }

  if (error || !product) {
    return (
      <ProductNotFound
        message={
          error ||
          "That grocery item is not part of the current fictional catalogue."
        }
      />
    );
  }

  return (
    <section className="page-section page-section--white">
      <PageContainer>
        <Breadcrumbs current={product.name} />
        <div className="product-detail">
          <ProductImage product={product} size="detail" />
          <div className="product-detail__content">
            <p className="eyebrow">{getCategoryName(product.categoryId)}</p>
            <h1>{product.name}</h1>
            <p className="product-detail__description">{product.description}</p>
            <div className="product-detail__price">
              <strong>{formatPrice(product.price)}</strong>
              <span>{product.unit}</span>
            </div>
            <StatusPanel title="Fictional demonstration product">
              This product, its description, unit, and price are sample
              information. It is not a live stock or pricing record.
            </StatusPanel>
            <PaymentOptions product={product} />
            <Link className="button button--outline" to="/products">
              Back to all groceries
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function ProductNotFound({
  message = "That grocery item is not part of the current fictional catalogue.",
}) {
  return (
    <section className="page-section page-section--white">
      <PageContainer>
        <Breadcrumbs current="Not found" />
        <div className="empty-state">
          <h1>Product not found</h1>
          <p>{message}</p>
          <Link className="button button--primary" to="/products">
            Back to all groceries
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
