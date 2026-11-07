export const promotions = [
  {
    id: "seasonal-fruit-example",
    title: "Seasonal fruit selection",
    description:
      "A fictional seasonal fruit example for the catalogue demonstration.",
    type: "Seasonal example",
    productId: "fresh-apples",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    demo: true,
  },
  {
    id: "bakery-example",
    title: "Bakery favourites",
    description:
      "A fictional bakery promotion example, ready for future store content.",
    type: "Bakery example",
    categoryId: "bakery",
    startDate: "2026-10-01",
    endDate: "2026-11-30",
    demo: true,
  },
  {
    id: "household-upcoming-example",
    title: "Household essentials feature",
    description: "A fictional upcoming household promotion example.",
    type: "Household example",
    categoryId: "household-essentials",
    startDate: "2026-11-01",
    endDate: "2026-12-15",
    demo: true,
  },
  {
    id: "expired-example",
    title: "Past example promotion",
    description:
      "This fictional promotion is retained as test data but is no longer active.",
    type: "Past example",
    productId: "drinks-tea",
    startDate: "2025-01-01",
    endDate: "2025-02-28",
    demo: true,
  },
];

export function getPromotionStatus(promotion, now = new Date()) {
  const start = new Date(`${promotion.startDate}T00:00:00`);
  const end = new Date(`${promotion.endDate}T23:59:59`);
  if (now < start) return "upcoming";
  if (now > end) return "expired";
  return "active";
}

export function formatPromotionDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
