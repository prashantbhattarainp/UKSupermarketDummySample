import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import { formatPrice, getCategoryName } from "../utils/catalogue";

export default function ProductCard({ product }) {
  const productSlug = product.slug || product.id;

  return (
    <article className="product-card">
      <ProductImage product={product} />
      <div className="product-card__body">
        <p className="product-card__category">
          {product.category?.name || getCategoryName(product.categoryId)}
        </p>
        <h2>
          <Link to={`/products/${productSlug}`}>{product.name}</Link>
        </h2>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <strong>{formatPrice(product.price)}</strong>
          <span>{product.unit}</span>
        </div>
        <Link className="link-arrow" to={`/products/${productSlug}`}>
          View details
        </Link>
      </div>
    </article>
  );
}
