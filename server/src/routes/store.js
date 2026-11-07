import { Router } from "express";

import { csrfProtection, createAuthMiddleware } from "../middleware/auth.js";
import { createStoreService } from "../services/storeService.js";
import { buildSuccessResponse } from "../utils/response.js";

function asyncRoute(handler) {
  return (request, response, next) =>
    Promise.resolve(handler(request, response)).catch(next);
}

export function createPublicStoreRouter({ storeService } = {}) {
  const router = Router();
  const service = storeService || createStoreService();
  router.get(
    "/store",
    asyncRoute(async (request, response) => {
      const data = await service.getPublic();
      if (!data)
        return response
          .status(404)
          .json({
            data: null,
            meta: {},
            error: {
              code: "STORE_NOT_FOUND",
              message: "Store information is not available.",
            },
          });
      response.json(buildSuccessResponse(data));
    }),
  );
  router.get(
    "/store/hours",
    asyncRoute(async (request, response) =>
      response.json(buildSuccessResponse(await service.getHours())),
    ),
  );
  router.get(
    "/services",
    asyncRoute(async (request, response) =>
      response.json(buildSuccessResponse(await service.listServices(true))),
    ),
  );
  return router;
}

export function createOwnerStoreRouter({ authService, storeService } = {}) {
  const router = Router();
  const service = storeService || createStoreService();
  const auth = createAuthMiddleware({ authService });
  router.use(auth.requireSession, auth.requireRole("owner"), csrfProtection);
  router.get(
    "/store",
    asyncRoute(async (request, response) =>
      response.json(buildSuccessResponse(await service.getOwner())),
    ),
  );
  router.patch(
    "/store",
    asyncRoute(async (request, response) =>
      response.json(buildSuccessResponse(await service.update(request.body))),
    ),
  );
  router.get(
    "/store/hours",
    asyncRoute(async (request, response) =>
      response.json(buildSuccessResponse(await service.getHours())),
    ),
  );
  router.patch(
    "/store/hours",
    asyncRoute(async (request, response) =>
      response.json(
        buildSuccessResponse(await service.updateHours(request.body)),
      ),
    ),
  );
  router.get(
    "/services",
    asyncRoute(async (request, response) =>
      response.json(buildSuccessResponse(await service.listServices(false))),
    ),
  );
  router.get(
    "/services/:id",
    asyncRoute(async (request, response) =>
      response.json(
        buildSuccessResponse(await service.getService(request.params.id)),
      ),
    ),
  );
  router.post(
    "/services",
    asyncRoute(async (request, response) =>
      response
        .status(201)
        .json(buildSuccessResponse(await service.createService(request.body))),
    ),
  );
  router.patch(
    "/services/:id",
    asyncRoute(async (request, response) =>
      response.json(
        buildSuccessResponse(
          await service.updateService(request.params.id, request.body),
        ),
      ),
    ),
  );
  router.delete(
    "/services/:id",
    asyncRoute(async (request, response) =>
      response.json(
        buildSuccessResponse(
          await service.deactivateService(request.params.id),
        ),
      ),
    ),
  );
  return router;
}
