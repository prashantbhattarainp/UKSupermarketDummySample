import { Router } from "express";

import { csrfProtection, createAuthMiddleware } from "../middleware/auth.js";
import { createOwnerCatalogueService } from "../services/ownerCatalogueService.js";
import { buildSuccessResponse } from "../utils/response.js";

function asyncRoute(handler) {
  return (request, response, next) =>
    Promise.resolve(handler(request, response)).catch(next);
}

export function createOwnerCatalogueRouter({
  authService,
  ownerCatalogueService,
} = {}) {
  const router = Router();
  const service = ownerCatalogueService || createOwnerCatalogueService();
  const auth = createAuthMiddleware({ authService });

  router.use(auth.requireSession, auth.requireRole("owner"));
  router.use(csrfProtection);

  router.get(
    "/products",
    asyncRoute(async (request, response) => {
      const result = await service.listProducts({
        search:
          typeof request.query.search === "string" ? request.query.search : "",
        categoryId:
          typeof request.query.categoryId === "string"
            ? request.query.categoryId
            : "",
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
    "/products/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(await service.getProduct(request.params.id)),
      );
    }),
  );

  router.post(
    "/products",
    asyncRoute(async (request, response) => {
      response
        .status(201)
        .json(buildSuccessResponse(await service.createProduct(request.body)));
    }),
  );

  router.patch(
    "/products/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(
          await service.updateProduct(request.params.id, request.body),
        ),
      );
    }),
  );

  router.delete(
    "/products/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(
          await service.deactivateProduct(request.params.id),
        ),
      );
    }),
  );

  router.get(
    "/categories",
    asyncRoute(async (request, response) => {
      const categories = await service.listCategories();
      response.json(
        buildSuccessResponse(categories, { count: categories.length }),
      );
    }),
  );

  router.get(
    "/categories/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(await service.getCategory(request.params.id)),
      );
    }),
  );

  router.post(
    "/categories",
    asyncRoute(async (request, response) => {
      response
        .status(201)
        .json(buildSuccessResponse(await service.createCategory(request.body)));
    }),
  );

  router.patch(
    "/categories/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(
          await service.updateCategory(request.params.id, request.body),
        ),
      );
    }),
  );

  router.delete(
    "/categories/:id",
    asyncRoute(async (request, response) => {
      response.json(
        buildSuccessResponse(
          await service.deactivateCategory(request.params.id),
        ),
      );
    }),
  );

  return router;
}
