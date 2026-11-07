import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import bcrypt from "bcryptjs";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { validateEnvironment } from "../config/env.js";
import { User } from "../models/User.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertOwnerDoesNotExist(existingUser) {
  if (existingUser) {
    throw new Error(
      "An account with that email already exists. No changes were made.",
    );
  }
}

async function promptForOwner() {
  const readlineInterface = readline.createInterface({ input, output });
  try {
    const email = (await readlineInterface.question("Owner email: "))
      .trim()
      .toLowerCase();
    const displayName = (
      await readlineInterface.question("Owner display name: ")
    ).trim();
    const password = await readlineInterface.question("Owner password: ", {
      hideEchoBack: true,
    });
    const confirmation = await readlineInterface.question(
      "Confirm password: ",
      { hideEchoBack: true },
    );

    if (!emailPattern.test(email))
      throw new Error("A valid owner email is required.");
    if (!displayName) throw new Error("An owner display name is required.");
    if (password.length < 12)
      throw new Error("The owner password must be at least 12 characters.");
    if (password !== confirmation)
      throw new Error("The owner passwords do not match.");

    return { email, displayName, password };
  } finally {
    readlineInterface.close();
  }
}

export async function provisionOwner() {
  const config = validateEnvironment(process.env);
  if (!config.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to provision an owner account.");
  }

  const details = await promptForOwner();
  await connectDatabase(config.MONGODB_URI);

  try {
    const existingUser = await User.findOne({ email: details.email }).select(
      "_id email",
    );
    assertOwnerDoesNotExist(existingUser);

    const passwordHash = await bcrypt.hash(details.password, 12);
    await User.create({
      email: details.email,
      passwordHash,
      displayName: details.displayName,
      role: "owner",
      active: true,
    });
    console.log("Owner account provisioned successfully.");
  } finally {
    await disconnectDatabase();
  }
}

if (
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replaceAll("\\", "/"))
) {
  provisionOwner().catch((error) => {
    console.error(`Owner provisioning failed: ${error.message}`);
    process.exitCode = 1;
  });
}
