import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { validateEnvironment } from "../config/env.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendCataloguePath = path.resolve(
  __dirname,
  "../../../client/src/data/catalogueData.js",
);

let catalogueData;

try {
  catalogueData = await import(`file://${frontendCataloguePath}`);
} catch (error) {
  console.error("Unable to find the frontend catalogue data source.");
  console.error(error.message);
  process.exit(1);
}

const { categories, products } = catalogueData;

async function seedCatalogue() {
  const config = validateEnvironment(process.env);

  try {
    await connectDatabase(config.MONGODB_URI);

    for (const category of categories) {
      await Category.findOneAndUpdate(
        { slug: category.id },
        {
          name: category.name,
          slug: category.id,
          description: `${category.name} for the Deepak Supermarket demo catalogue.`,
          active: true,
          displayOrder: 0,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    for (const product of products) {
      const matchingCategory = await Category.findOne({
        slug: product.categoryId,
      });

      if (!matchingCategory) {
        throw new Error(
          `No category found for product ${product.name}: ${product.categoryId}`,
        );
      }

      const priceMinor = Math.round(Number(product.price) * 100);

      await Product.findOneAndUpdate(
        { slug: product.id },
        {
          name: product.name,
          slug: product.id,
          description: product.description,
          category: matchingCategory._id,
          priceMinor,
          unit: product.unit,
          image: product.image || "",
          active: true,
          displayOrder: 0,
          currency: "GBP",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    console.log(
      `Seeded ${categories.length} categories and ${products.length} products.`,
    );
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed.");
    console.error(error.message);
    await disconnectDatabase();
    process.exit(1);
  }
}

seedCatalogue();
