import { categories as fallbackCategories } from "../data/catalogueData";

export default function CategoryNavigation({
  selectedCategory,
  onSelect,
  categories = fallbackCategories,
}) {
  return (
    <nav className="category-navigation" aria-label="Product categories">
      <button
        type="button"
        className={
          selectedCategory === ""
            ? "category-button category-button--selected"
            : "category-button"
        }
        aria-pressed={selectedCategory === ""}
        onClick={() => onSelect("")}
      >
        All products
      </button>
      {categories.map((category) => {
        const categoryId = category.slug || category.id;
        return (
          <button
            type="button"
            key={categoryId}
            className={
              selectedCategory === categoryId
                ? "category-button category-button--selected"
                : "category-button"
            }
            aria-pressed={selectedCategory === categoryId}
            onClick={() => onSelect(categoryId)}
          >
            {category.name}
          </button>
        );
      })}
    </nav>
  );
}
