import { Link } from "react-router-dom";

function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  useButtons = false,
}) {
  const CategoryItem = useButtons ? "button" : Link;

  return (
    <div className="hidden md:block w-56 shrink-0">
      <h3 className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
        Categories
      </h3>
      <div className="flex flex-col gap-1">
        <CategoryItem
          to={useButtons ? undefined : "/collections"}
          type={useButtons ? "button" : undefined}
          onClick={() => onCategoryChange("all")}
          className={`text-left px-3 py-2 text-sm tracking-wider uppercase transition-colors ${
            selectedCategory === "all"
              ? "text-gold border-l-2 border-gold pl-3"
              : "text-white/50 hover:text-gold"
          }`}
        >
          All Products
        </CategoryItem>

        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            to={
              useButtons
                ? undefined
                : `/collections?category=${encodeURIComponent(category.slug)}`
            }
            type={useButtons ? "button" : undefined}
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
          </CategoryItem>
        ))}
      </div>
    </div>
  );
}

export default FilterSidebar;
