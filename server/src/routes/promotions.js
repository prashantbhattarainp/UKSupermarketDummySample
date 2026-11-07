import { Router } from "express";

import { csrfProtection, createAuthMiddleware } from "../middleware/auth.js";
import { createPromotionService } from "../services/promotionService.js";
import { buildSuccessResponse } from "../utils/response.js";

function asyncRoute(handler) {
  return (request, response, next) =>
    Promise.resolve(handler(request, response)).catch(next);
}

export function createPromotionRouter({ promotionService } = {}) {
  const router = Router();
  const service = promotionService || createPromotionService();

  router.get(
    "/promotions",
    asyncRoute(async (request, response) => {
      response.json(buildSuccessResponse(await service.listPublic(new Date())));
    }),
  );

  return router;
}

export function createOwnerPromotionRouter({
  authService,
  promotionService,
} = {}) {
  const router = Router();
  const service = promotionService || createPromotionService();
  const auth = createAuthMiddleware({ authService });

  router.use(auth.requireSession, auth.requireRole("owner"), csrfProtection);

  router.get(
    "/promotions",
    asyncRoute(async (request, response) => {
      const result = await service.listOwner({
        search:
          typeof request.query.search === "string" ? request.query.search : "",
        active:
          typeof request.query.active === "string"
            ? request.query.active
            : undefined,
        page: request.query.page ?? 1,
        limit: request.query.limit ?? 12,
      });
      response.json(
        buildSuccessResponse(result.items, { pagination: result.pagination }),
      );
    }),
  );
  router.get(
    "/promotions/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(await service.getOwner(request.params.id)),
      );
    }),
  );
  router.post(
    "/promotions",
    asyncRoute(async (request, response) => {
      response
        .status(201)
        .json(buildSuccessResponse(await service.create(request.body)));
    }),
  );
  router.patch(
    "/promotions/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(
          await service.update(request.params.id, request.body),
        ),
      );
    }),
  );
  router.delete(
    "/promotions/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(await service.deactivate(request.params.id)),
      );
    }),
  );

  return router;
}
