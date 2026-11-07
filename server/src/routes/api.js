import { Router } from "express";

import { createAuthMiddleware } from "../middleware/auth.js";
import { createAuthRouter } from "./auth.js";
import { createCatalogueRouter } from "./catalogue.js";
import { createOwnerCatalogueRouter } from "./ownerCatalogue.js";
import {
  createOwnerPromotionRouter,
  createPromotionRouter,
} from "./promotions.js";
import { createOwnerStoreRouter, createPublicStoreRouter } from "./store.js";
import {
  createOwnerReviewRouter,
  createPublicReviewRouter,
} from "./reviews.js";
import { buildSuccessResponse } from "../utils/response.js";

export function createApiRouter({
  authService,
  healthService,
  catalogueService,
  ownerCatalogueService,
  promotionService,
  storeService,
  reviewService,
  cookieName,
} = {}) {
  const router = Router();

  router.get("/", (request, response) => {
    response.json(
      buildSuccessResponse(
        {
          name: "Deepak Supermarket API",
          version: "0.1.0",
        },
        {
          route: "/api/v1",
        },
      ),
    );
  });

  router.get("/health", async (request, response, next) => {
    try {
      const healthData =
        healthService && typeof healthService.getHealthStatus === "function"
          ? await healthService.getHealthStatus()
          : {
              data: {
                application: "running",
                database: "disconnected",
                environment: process.env.NODE_ENV ?? "development",
                timestamp: new Date().toISOString(),
              },
              meta: {},
              error: null,
            };

      const statusCode = healthData.data.database === "connected" ? 200 : 503;
      response.status(statusCode).json(healthData);
    } catch (error) {
      next(error);
    }
  });

  router.use("/auth", createAuthRouter({ authService, cookieName }));
  router.use(createPromotionRouter({ promotionService }));
  router.use(createPublicStoreRouter({ storeService }));
  router.use(createPublicReviewRouter({ reviewService }));

  const authMiddleware = createAuthMiddleware({ authService });
  router.get(
    "/owner/overview",
    authMiddleware.requireSession,
    authMiddleware.requireRole("owner"),
    (request, response) => {
      response.json(
        buildSuccessResponse({
          user: {
            id: request.user.id || request.user._id?.toString(),
            displayName: request.user.displayName,
            role: request.user.role,
          },
          message: "Owner catalogue management is available in this phase.",
        }),
      );
    },
  );

  router.use(
    "/owner",
    createOwnerCatalogueRouter({ authService, ownerCatalogueService }),
  );
  router.use(
    "/owner",
    createOwnerPromotionRouter({ authService, promotionService }),
  );
  router.use("/owner", createOwnerStoreRouter({ authService, storeService }));
  router.use("/owner", createOwnerReviewRouter({ authService, reviewService }));

  router.use(createCatalogueRouter({ catalogueService }));

  return router;
}
