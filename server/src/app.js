import crypto from "node:crypto";

import cors from "cors";
import MongoStore from "connect-mongo";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";

import { getDatabaseStatus } from "./config/database.js";
import { validateEnvironment } from "./config/env.js";
import {
  errorHandler,
  malformedJsonHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import { createAuthService } from "./services/authService.js";
import { createApiRouter } from "./routes/api.js";
import { createCatalogueService } from "./services/catalogueService.js";
import { createOwnerCatalogueService } from "./services/ownerCatalogueService.js";
import { createPromotionService } from "./services/promotionService.js";
import { createStoreService } from "./services/storeService.js";
import { createReviewService } from "./services/reviewService.js";
import { createHealthService } from "./services/healthService.js";

export function createApp(options = {}) {
  const config = validateEnvironment(process.env);
  const app = express();
  const authService = options.authService || createAuthService();

  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        const allowedOrigins = config.CLIENT_ORIGIN.split(",")
          .map((value) => value.trim())
          .filter(Boolean);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        if (
          config.NODE_ENV !== "production" &&
          /^http:\/\/localhost:\d+$/i.test(origin)
        ) {
          return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS."));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  if (config.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  const sessionStore =
    options.sessionStore !== undefined
      ? options.sessionStore
      : config.MONGODB_URI
        ? MongoStore.create({
            mongoUrl: config.MONGODB_URI,
            collectionName: "sessions",
            ttl: Math.floor(config.SESSION_TTL_MS / 1000),
          })
        : undefined;
  app.use(
    session({
      name: config.SESSION_COOKIE_NAME,
      secret: config.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: config.SESSION_TTL_MS,
      },
    }),
  );
  app.use((request, response, next) => {
    response.setHeader("X-Request-Id", crypto.randomUUID());
    next();
  });

  if (config.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  const healthService =
    options.healthService ||
    createHealthService({
      getStatus: getDatabaseStatus,
    });

  const catalogueService = options.catalogueService || createCatalogueService();
  const ownerCatalogueService =
    options.ownerCatalogueService || createOwnerCatalogueService();
  const promotionService = options.promotionService || createPromotionService();
  const storeService = options.storeService || createStoreService();
  const reviewService = options.reviewService || createReviewService();

  app.use(
    "/api/v1",
    createApiRouter({
      authService,
      healthService,
      catalogueService,
      ownerCatalogueService,
      promotionService,
      storeService,
      reviewService,
      cookieName: config.SESSION_COOKIE_NAME,
    }),
  );

  app.get("/", (request, response) => {
    response.json({
      data: {
        message: "Deepak Supermarket backend is running.",
      },
      meta: {},
      error: null,
    });
  });

  app.use(malformedJsonHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
