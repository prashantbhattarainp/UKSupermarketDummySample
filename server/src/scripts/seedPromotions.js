import { pathToFileURL } from "node:url";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { validateEnvironment } from "../config/env.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Promotion } from "../models/Promotion.js";
import { promotions } from "../../client/src/data/promotionsData.js";

function dateValue(value, endOfDay = false) {
  return new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
}

export async function seedPromotions() {
  const config = validateEnvironment(process.env);
  if (!config.MONGODB_URI)
    throw new Error("MONGODB_URI is required to seed promotions.");
  await connectDatabase(config.MONGODB_URI);

  try {
    for (const [index, promotion] of promotions.entries()) {
      const product = promotion.productId
        ? await Product.findOne({ slug: promotion.productId }).select("_id")
        : null;
      const category = promotion.categoryId
        ? await Category.findOne({ slug: promotion.categoryId }).select("_id")
        : null;
      await Promotion.findOneAndUpdate(
        { slug: promotion.id },
        {
          title: promotion.title,
          slug: promotion.id,
          description: promotion.description,
          product: product?._id || null,
          category: category?._id || null,
          discountType: index % 2 === 0 ? "percentage" : "fixed_price",
          discountValue: index % 2 === 0 ? 10 : null,
          promotionalPriceMinor: index % 2 === 0 ? null : 150,
          startDate: dateValue(promotion.startDate),
          endDate: dateValue(promotion.endDate, true),
          active: true,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        },
      );
    }
    console.log(`Seeded ${promotions.length} fictional promotions.`);
  } finally {
    await disconnectDatabase();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  seedPromotions().catch((error) => {
    console.error(`Promotion seeding failed: ${error.message}`);
    process.exitCode = 1;
  });
}
