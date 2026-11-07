import { pathToFileURL } from "node:url";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { validateEnvironment } from "../config/env.js";
import { StoreSettings } from "../models/StoreSettings.js";
import { storeConfig } from "../../client/src/data/storeConfig.js";

export async function seedStore() {
  const config = validateEnvironment(process.env);
  if (!config.MONGODB_URI)
    throw new Error("MONGODB_URI is required to seed store settings.");
  await connectDatabase(config.MONGODB_URI);
  try {
    const openingHours = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]
      .map((day) => ({
        day,
        closed: false,
        openTime: "08:00",
        closeTime: "21:00",
      }))
      .concat([
        { day: "sunday", closed: false, openTime: "09:00", closeTime: "18:00" },
      ]);
    await StoreSettings.findOneAndUpdate(
      { key: "default" },
      {
        key: "default",
        name: storeConfig.name,
        descriptor: storeConfig.descriptor,
        strapline: storeConfig.strapline,
        about: storeConfig.about.paragraphs.join("\n\n"),
        addressLines: storeConfig.address.lines,
        postcode: storeConfig.address.postcode,
        phone: storeConfig.contact.phone,
        email: storeConfig.contact.email,
        directionsUrl: storeConfig.directionsUrl,
        accessibility: storeConfig.accessibility,
        published: true,
        openingHours,
        exceptions: [],
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );
    console.log("Seeded fictional store settings and opening hours.");
  } finally {
    await disconnectDatabase();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  seedStore().catch((error) => {
    console.error(`Store seeding failed: ${error.message}`);
    process.exitCode = 1;
  });
}
