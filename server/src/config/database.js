import mongoose from "mongoose";

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus() {
  return isDatabaseConnected() ? "connected" : "disconnected";
}

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is required to connect to MongoDB.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.info("MongoDB connected successfully.");
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    return mongoose.connection;
  } catch (error) {
    throw new Error(
      "MongoDB connection failed. Check MONGODB_URI and database availability.",
    );
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
