import { Link } from "react-router-dom";
import { formatPromotionDate } from "../data/promotionsData";

export default function PromotionCard({ promotion, status }) {
  const product = promotion.product || null;
  const category = promotion.category || null;
  const discount =
    promotion.discountType === "percentage"
      ? `${promotion.discountValue}% off`
      : promotion.promotionalPrice
        ? `Now £${Number(promotion.promotionalPrice).toFixed(2)}`
        : "Fictional offer";
  return (
    <article className="promotion-card">
      <span className="promotion-card__type">{promotion.type}</span>
      <h2>{promotion.title}</h2>
      <p>{promotion.description}</p>
      <p className="promotion-card__dates">
        <strong>{status === "active" ? "Example dates" : "Starts"}</strong>{" "}
        {formatPromotionDate(promotion.startDate)} –{" "}
        {formatPromotionDate(promotion.endDate)}
      </p>
      <p className="promotion-card__related">
        <strong>{discount}</strong>
      </p>
      {product && (
        <Link
          className="link-arrow"
          to={`/products/${product.slug || product.id}`}
        >
          View {product.name}
        </Link>
      )}
      {!product && category && (
        <p className="promotion-card__related">Category: {category.name}</p>
      )}
    </article>
  );
}
