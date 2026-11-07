import { Router } from "express";
import rateLimit from "express-rate-limit";

import { csrfProtection, createAuthMiddleware } from "../middleware/auth.js";
import { createReviewService } from "../services/reviewService.js";
import { buildErrorResponse, buildSuccessResponse } from "../utils/response.js";

function asyncRoute(handler) {
  return (request, response, next) =>
    Promise.resolve(handler(request, response)).catch(next);
}
function reviewPage(request) {
  const page = Number(request.query.page || 1);
  const limit = Number(request.query.limit || 12);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    const error = new Error("Page and limit must be valid positive integers.");
    error.statusCode = 400;
    error.code = "INVALID_QUERY";
    throw error;
  }
  return { page, limit };
}

export function createPublicReviewRouter({ reviewService } = {}) {
  const router = Router();
  const service = reviewService || createReviewService();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: buildErrorResponse(
      "REVIEW_RATE_LIMITED",
      "Too many review submissions. Try again later.",
    ),
  });
  router.get(
    "/reviews",
    asyncRoute(async (request, response) => {
      const result = await service.listPublic({
        ...reviewPage(request),
        productId: request.query.productId,
      });
      response.json(
        buildSuccessResponse(result.items, { pagination: result.pagination }),
      );
    }),
  );
  router.post(
    "/reviews",
    limiter,
    asyncRoute(async (request, response) =>
      response
        .status(201)
        .json(
          buildSuccessResponse(await service.create(request.body), {
            message: "Your review was submitted for moderation.",
          }),
        ),
    ),
  );
  return router;
}

export function createOwnerReviewRouter({ authService, reviewService } = {}) {
  const router = Router();
  const service = reviewService || createReviewService();
  const auth = createAuthMiddleware({ authService });
  router.use(auth.requireSession, auth.requireRole("owner"), csrfProtection);
  router.get(
    "/reviews",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(
          await service.listOwner({ status: request.query.status }),
        ),
      );
    }),
  );
  router.get(
    "/reviews/:id",
    asyncRoute(async (request, response) =>
      response.json(
        buildSuccessResponse(await service.getOwner(request.params.id)),
      ),
    ),
  );
  router.patch(
    "/reviews/:id",
    asyncRoute(async (request, response) =>
      response.json(
        buildSuccessResponse(
          await service.moderate(request.params.id, request.body.status),
        ),
      ),
    ),
  );
  router.delete(
    "/reviews/:id",
    asyncRoute(async (request, response) =>
      response.json(
        buildSuccessResponse(
          await service.moderate(request.params.id, "rejected"),
        ),
      ),
    ),
  );
  return router;
}
