import { Link } from "react-router-dom";

function FilterSidebar({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="hidden md:block w-56 shrink-0">
      <h3 className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
        Categories
      </h3>
      <div className="flex flex-col gap-1">
        <Link
          to="/collections"
          onClick={() => onCategoryChange("all")}
          className={`text-left px-3 py-2 text-sm tracking-wider uppercase transition-colors ${
            selectedCategory === "all"
              ? "text-gold border-l-2 border-gold pl-3"
              : "text-white/50 hover:text-gold"
          }`}
        >
          All Products
        </Link>

        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/collections?category=${encodeURIComponent(category.slug)}`}
            onClick={() => onCategoryChange(category.slug)}
            className={`text-left px-3 py-2 text-sm tracking-wider uppercase transition-colors ${
              selectedCategory === category.slug
                ? "text-gold border-l-2 border-gold pl-3"
                : "text-white/50 hover:text-gold"
            }`}
          >
            <span>{category.name}</span>
            <span
              className="ml-2 text-[10px] text-white/25"
              aria-label={`${category.product_count} products`}
            >
              {category.product_count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default FilterSidebar;
