import http from "node:http";
import { pathToFileURL } from "node:url";

import { createApp } from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
} from "./config/database.js";
import { validateEnvironment } from "./config/env.js";
import { createHealthService } from "./services/healthService.js";

const config = validateEnvironment(process.env);
const app = createApp({
  healthService: createHealthService({ getStatus: getDatabaseStatus }),
});
const server = http.createServer(app);

server.setTimeout(15000);

async function startServer() {
  try {
    await connectDatabase(config.MONGODB_URI || process.env.MONGODB_URI);
    server.listen(config.PORT, () => {
      console.log(`Deepak Supermarket API listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the Deepak Supermarket API.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down the server...`);

  if (server.listening) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    return;
  }

  await disconnectDatabase();
  process.exit(0);
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  startServer();
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

export { app, server, startServer };
