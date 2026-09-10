import { Link } from "react-router-dom";
import getImageUrl, { getOptimizedImageUrl } from "../utils/getImageUrl";
import { productPath } from "../config/seo";

function ProductCard({ product, priority = false }) {
  const originalImage = getImageUrl(product.images?.[0]);
  const cardImage = getOptimizedImageUrl(product.images?.[0], {
    width: 700,
    height: 700,
  });

  return (
    <Link
      to={productPath(product)}
      className="border border-gold/20 hover:border-gold group transition-colors bg-darkbg"
    >
      <div
        className="bg-white flex items-center justify-center overflow-hidden"
        style={{ height: "280px" }}
      >
        {product.images && product.images[0] ? (
          <img
            src={cardImage}
            alt={product.image_alt || product.name}
            width="700"
            height="700"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={(event) => {
              if (originalImage && event.currentTarget.src !== originalImage) {
                event.currentTarget.src = originalImage;
              }
            }}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <p className="text-darkbg/30 text-sm">No Image</p>
        )}
      </div>

      <div className="p-4 border-t border-gold/20">
        <p className="text-gold/70 text-xs tracking-wider uppercase mb-1">
          {product.category_name}
        </p>
        <h3 className="text-white group-hover:text-gold text-sm font-medium transition-colors">
          {product.name}
        </h3>
        <p className="text-gold text-xs mt-3 tracking-widest uppercase">
          Enquire Now →
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;
