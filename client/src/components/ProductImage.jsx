import { useState } from "react";

export default function ProductImage({ product, size = "card" }) {
  const [failed, setFailed] = useState(false);
  const initials = product.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  return (
    <div className={`product-image product-image--${size}`}>
      {!failed && (
        <img src={product.image} alt="" onError={() => setFailed(true)} />
      )}
      {failed && <span aria-hidden="true">{initials}</span>}
    </div>
  );
}
