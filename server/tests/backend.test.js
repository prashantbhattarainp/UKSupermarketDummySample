import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

import { createApp } from "../src/app.js";
import { validateEnvironment } from "../src/config/env.js";
import { Category } from "../src/models/Category.js";
import { Product } from "../src/models/Product.js";
import { assertOwnerDoesNotExist } from "../src/scripts/provisionOwner.js";
import { createOwnerCatalogueService } from "../src/services/ownerCatalogueService.js";
import { createPromotionService } from "../src/services/promotionService.js";
import { Promotion } from "../src/models/Promotion.js";
import { StoreSettings } from "../src/models/StoreSettings.js";
import { createStoreService } from "../src/services/storeService.js";
import { createReviewService } from "../src/services/reviewService.js";

test("application can be imported without starting a listener", () => {
  assert.ok(createApp);
});

test("unknown API routes return the standard error envelope", async () => {
  const app = createApp();
  const response = await request(app).get("/api/v1/not-a-real-route");

  assert.equal(response.status, 404);
  assert.equal(response.body.data, null);
  assert.equal(response.body.error.code, "ROUTE_NOT_FOUND");
  assert.match(response.body.error.message, /not found/i);
});

test("malformed JSON produces a safe error response", async () => {
  const app = createApp();
  const response = await request(app)
    .post("/api/v1/health")
    .set("Content-Type", "application/json")
    .send('{"broken":');

  assert.equal(response.status, 400);
  assert.equal(response.body.data, null);
  assert.equal(response.body.error.code, "INVALID_JSON");
  assert.match(response.body.error.message, /valid JSON/i);
});

test("health endpoint returns the expected response shape", async () => {
  const app = createApp({
    healthService: {
      async getHealthStatus() {
        return {
          data: {
            application: "running",
            database: "connected",
            environment: "test",
            timestamp: "2026-10-10T00:00:00.000Z",
          },
          meta: {},
          error: null,
        };
      },
    },
  });

  const response = await request(app).get("/api/v1/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.data.application, "running");
  assert.equal(response.body.data.database, "connected");
  assert.equal(response.body.error, null);
  assert.ok(response.body.data.timestamp);
});

test("listing categories returns the expected shape", async () => {
  const app = createApp({
    catalogueService: {
      async listCategories() {
        return [
          {
            id: "cat-1",
            slug: "fresh-fruit",
            name: "Fresh Fruit",
            displayOrder: 1,
          },
          { id: "cat-2", slug: "bakery", name: "Bakery", displayOrder: 2 },
        ];
      },
      async getCategoryBySlug(slug) {
        if (slug === "fresh-fruit") {
          return { id: "cat-1", slug, name: "Fresh Fruit", displayOrder: 1 };
        }
        return null;
      },
      async listProducts() {
        return {
          items: [],
          pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
        };
      },
      async getProductBySlug() {
        return null;
      },
    },
  });

  const response = await request(app).get("/api/v1/categories");

  assert.equal(response.status, 200);
  assert.equal(response.body.error, null);
  assert.equal(response.body.data.length, 2);
  assert.equal(response.body.meta.count, 2);
});

test("looking up a category by slug returns a 404 for missing records", async () => {
  const app = createApp({
    catalogueService: {
      listCategories: async () => [],
      getCategoryBySlug: async () => null,
      listProducts: async () => ({
        items: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      }),
      getProductBySlug: async () => null,
    },
  });

  const response = await request(app).get(
    "/api/v1/categories/unknown-category",
  );

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "CATEGORY_NOT_FOUND");
});

test("listing products supports search, filters, sorting, and pagination metadata", async () => {
  const app = createApp({
    catalogueService: {
      async listCategories() {
        return [];
      },
      async getCategoryBySlug() {
        return null;
      },
      async listProducts() {
        return {
          items: [
            {
              id: "bananas",
              slug: "bananas",
              name: "Bananas",
              description: "Sweet yellow fruit.",
              priceMinor: 120,
              unit: "per kg",
              image: "/images/bananas.jpg",
              category: { slug: "fresh-fruit", name: "Fresh Fruit" },
            },
          ],
          pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
        };
      },
      async getProductBySlug() {
        return null;
      },
    },
  });

  const response = await request(app).get("/api/v1/products").query({
    search: "banana",
    category: "fresh-fruit",
    minPrice: "1.00",
    maxPrice: "2.00",
    sort: "price-asc",
    page: 1,
    limit: 12,
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.items[0].name, "Bananas");
  assert.equal(response.body.meta.pagination.page, 1);
  assert.equal(response.body.meta.pagination.total, 1);
});

test("database unavailable health behaviour is handled correctly", async () => {
  const app = createApp({
    healthService: {
      async getHealthStatus() {
        return {
          data: {
            application: "running",
            database: "disconnected",
            environment: "development",
            timestamp: "2026-10-10T00:00:00.000Z",
          },
          meta: {},
          error: null,
        };
      },
    },
  });

  const response = await request(app).get("/api/v1/health");

  assert.equal(response.status, 503);
  assert.equal(response.body.data.database, "disconnected");
  assert.equal(response.body.error, null);
});

test("missing required production configuration is rejected", () => {
  const env = {
    NODE_ENV: "production",
    PORT: "5000",
    CLIENT_ORIGIN: "http://localhost:5173",
  };

  assert.throws(() => validateEnvironment(env), /MONGODB_URI.*required/i);
});

test("invalid configuration is reported clearly", () => {
  const env = {
    NODE_ENV: "invalid-env",
    PORT: "abc",
    MONGODB_URI: "mongodb://localhost:27017/deepak-supermarket",
    CLIENT_ORIGIN: "http://localhost:5173",
  };

  assert.throws(() => validateEnvironment(env), /NODE_ENV|PORT/i);
});

test("secrets are not included in public error responses", async () => {
  const app = createApp();
  const response = await request(app)
    .get("/api/v1/health")
    .set("x-test-secret", "super-secret-password");

  assert.equal(response.status, 503);
  assert.doesNotMatch(JSON.stringify(response.body), /super-secret-password/i);
});

test("product prices must be valid non-negative integer minor units", async () => {
  const product = new Product({
    name: "Bananas",
    slug: "bananas",
    description: "Fresh fruit",
    category: "507f1f77bcf86cd799439011",
    priceMinor: -1,
    unit: "per 1 kg",
    image: "/images/bananas.jpg",
  });

  await assert.rejects(() => product.validate(), /priceMinor/i);

  const validProduct = new Product({
    name: "Bananas",
    slug: "bananas",
    description: "Fresh fruit",
    category: "507f1f77bcf86cd799439011",
    priceMinor: 120,
    unit: "per 1 kg",
    image: "/images/bananas.jpg",
  });

  await assert.doesNotReject(() => validProduct.validate());
});

test("product slugs and required fields are validated", async () => {
  const product = new Product({
    name: "Bananas",
    slug: "invalid slug",
    description: "Fresh fruit",
    category: "507f1f77bcf86cd799439011",
    priceMinor: 120,
    unit: "per 1 kg",
  });

  await assert.rejects(() => product.validate(), /slug/i);

  const missingName = new Product({
    slug: "bananas",
    description: "Fresh fruit",
    category: "507f1f77bcf86cd799439011",
    priceMinor: 120,
    unit: "per 1 kg",
  });

  await assert.rejects(() => missingName.validate(), /name/i);
});

test("category references and category slug rules are enforced", async () => {
  const category = new Category({
    name: "Fresh fruit",
    slug: "fresh-fruit",
    description: "Fruit",
  });

  await assert.doesNotReject(() => category.validate());

  const invalidCategory = new Category({
    name: "Fresh fruit",
    slug: "Invalid Slug",
    description: "Fruit",
  });

  await assert.rejects(() => invalidCategory.validate(), /slug/i);

  const product = new Product({
    name: "Bananas",
    slug: "bananas",
    description: "Fresh fruit",
    category: "507f1f77bcf86cd799439011",
    priceMinor: 120,
    unit: "per 1 kg",
  });

  await assert.doesNotReject(() => product.validate());
});

function createAuthTestApp({
  ownerCatalogueService,
  promotionService,
  storeService,
  reviewService,
} = {}) {
  const owner = {
    id: "owner-1",
    email: "owner@example.test",
    displayName: "Demo Owner",
    role: "owner",
    active: true,
  };
  const users = new Map([[owner.id, owner]]);
  const authService = {
    async authenticate(email, password) {
      if (email === owner.email && password === "correct-password")
        return owner;
      if (
        email === "disabled@example.test" &&
        password === "correct-password"
      ) {
        return { ...owner, id: "disabled-1", email, active: false };
      }
      if (email === "staff@example.test" && password === "correct-password") {
        return { ...owner, id: "staff-1", email, role: "staff" };
      }
      return null;
    },
    async findById(id) {
      return users.get(id) || null;
    },
  };
  return createApp({
    authService,
    ownerCatalogueService,
    promotionService,
    storeService,
    reviewService,
    catalogueService: {
      listCategories: async () => [],
      getCategoryBySlug: async () => null,
      listProducts: async () => ({
        items: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      }),
      getProductBySlug: async () => null,
    },
  });
}

test("owner login creates a persistent session and protects owner routes", async () => {
  const agent = request.agent(createAuthTestApp());
  const login = await agent
    .post("/api/v1/auth/login")
    .send({ email: " OWNER@EXAMPLE.TEST ", password: "correct-password" });

  assert.equal(login.status, 200);
  assert.deepEqual(login.body.data.user, {
    id: "owner-1",
    email: "owner@example.test",
    displayName: "Demo Owner",
    role: "owner",
  });
  assert.doesNotMatch(JSON.stringify(login.body), /passwordHash|session/i);

  const overview = await agent.get("/api/v1/owner/overview");
  assert.equal(overview.status, 200);
  assert.equal(overview.body.data.user.displayName, "Demo Owner");
  const me = await agent.get("/api/v1/auth/me");
  assert.equal(me.status, 200);
});

test("invalid and disabled credentials use the same generic authentication error", async () => {
  const app = createAuthTestApp();
  const invalid = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "missing@example.test", password: "wrong-password" });
  const disabled = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "disabled@example.test", password: "correct-password" });
  const staff = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "staff@example.test", password: "correct-password" });

  assert.equal(invalid.status, 401);
  assert.equal(disabled.status, 401);
  assert.equal(staff.status, 401);
  assert.equal(invalid.body.error.message, "Invalid email or password.");
  assert.equal(disabled.body.error.message, invalid.body.error.message);
});

test("owner provisioning refuses to overwrite an existing account", () => {
  assert.throws(
    () => assertOwnerDoesNotExist({ email: "owner@example.test" }),
    /already exists.*no changes/i,
  );
  assert.doesNotThrow(() => assertOwnerDoesNotExist(null));
});

test("owner routes reject unauthenticated requests while public catalogue stays public", async () => {
  const app = createAuthTestApp();
  const protectedResponse = await request(app).get("/api/v1/owner/products");
  const publicResponse = await request(app).get("/api/v1/products");

  assert.equal(protectedResponse.status, 401);
  assert.equal(publicResponse.status, 200);
});

test("logout requires CSRF protection and invalidates the server session", async () => {
  const agent = request.agent(createAuthTestApp());
  await agent
    .post("/api/v1/auth/login")
    .send({ email: "owner@example.test", password: "correct-password" });

  const csrf = await agent.get("/api/v1/auth/csrf");
  const rejectedLogout = await agent.post("/api/v1/auth/logout");
  assert.equal(rejectedLogout.status, 403);

  const logout = await agent
    .post("/api/v1/auth/logout")
    .set("X-CSRF-Token", csrf.body.data.token);
  assert.equal(logout.status, 200);
  assert.equal((await agent.get("/api/v1/owner/categories")).status, 401);
});

test("login rate limiting responds with a throttling error", async () => {
  const app = createAuthTestApp();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "wrong@example.test", password: "wrong-password" });
  }
  const limited = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "wrong@example.test", password: "wrong-password" });

  assert.equal(limited.status, 429);
  assert.equal(limited.body.error.code, "LOGIN_RATE_LIMITED");
});

test("owner catalogue mutations require authentication, role, and CSRF", async () => {
  const ownerCatalogueService = {
    async listProducts() {
      return {
        items: [{ id: "product-1", name: "Bananas", active: true }],
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
      };
    },
    async createProduct(body) {
      return { id: "product-2", ...body, active: true };
    },
    async listCategories() {
      return [{ id: "category-1", name: "Fresh fruit", active: true }];
    },
  };
  const app = createAuthTestApp({ ownerCatalogueService });
  assert.equal((await request(app).get("/api/v1/owner/products")).status, 401);

  const agent = request.agent(app);
  await agent
    .post("/api/v1/auth/login")
    .send({ email: "owner@example.test", password: "correct-password" });
  assert.equal(
    (await agent.post("/api/v1/owner/products").send({ name: "Bananas" }))
      .status,
    403,
  );

  const csrf = await agent.get("/api/v1/auth/csrf");
  const created = await agent
    .post("/api/v1/owner/products")
    .set("X-CSRF-Token", csrf.body.data.token)
    .send({ name: "Bananas" });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.name, "Bananas");
  assert.equal((await agent.get("/api/v1/owner/categories")).status, 200);
});

test("owner catalogue service rejects invalid prices and protects referenced categories", async () => {
  const categoryId = "507f1f77bcf86cd799439011";
  const service = createOwnerCatalogueService({
    CategoryModel: {
      findById: async () => ({
        _id: categoryId,
        name: "Fresh fruit",
        slug: "fresh-fruit",
        active: true,
      }),
    },
    ProductModel: {
      create: async (input) => ({ _id: "507f1f77bcf86cd799439012", ...input }),
      countDocuments: async () => 1,
    },
  });

  await assert.rejects(
    () =>
      service.createProduct({
        name: "Bananas",
        slug: "bananas",
        description: "Fruit",
        categoryId,
        price: "-1",
        unit: "per kg",
      }),
    (error) => error.code === "INVALID_PRICE",
  );
  await assert.rejects(
    () => service.deactivateCategory(categoryId),
    (error) => error.code === "CATEGORY_IN_USE" && error.statusCode === 409,
  );
});

test("promotion model validates discount modes and date order", async () => {
  const promotion = new Promotion({
    title: "Fruit offer",
    slug: "fruit-offer",
    description: "Fictional fruit offer",
    discountType: "percentage",
    discountValue: 10,
    startDate: new Date("2026-10-10T00:00:00.000Z"),
    endDate: new Date("2026-10-09T00:00:00.000Z"),
  });
  await assert.rejects(() => promotion.validate(), /end date/i);
});

test("promotion service rejects invalid discounts and inactive product activation", async () => {
  const productId = "507f1f77bcf86cd799439011";
  const inactiveProductQuery = {
    lean: async () => ({ _id: productId, active: false }),
  };
  const service = createPromotionService({
    ProductModel: { findById: () => inactiveProductQuery },
    CategoryModel: { findById: () => ({ lean: async () => null }) },
    PromotionModel: { create: async (input) => input },
  });

  await assert.rejects(
    () =>
      service.create({
        title: "Bad",
        slug: "bad",
        description: "Bad",
        productId,
        discountType: "percentage",
        discountValue: 101,
        startDate: "2026-10-10",
        endDate: "2026-10-11",
      }),
    (error) => error.code === "INVALID_DISCOUNT",
  );
  await assert.rejects(
    () =>
      service.create({
        title: "Inactive",
        slug: "inactive",
        description: "Inactive",
        productId,
        discountType: "fixed_price",
        promotionalPrice: "1.50",
        startDate: "2026-10-10",
        endDate: "2026-10-11",
      }),
    (error) => error.code === "PRODUCT_INACTIVE" && error.statusCode === 409,
  );
});

test("public promotions filter inactive products and owner promotion routes remain protected", async () => {
  const records = [
    {
      _id: "507f1f77bcf86cd799439012",
      title: "Visible",
      slug: "visible",
      description: "Visible",
      discountType: "percentage",
      discountValue: 10,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-31"),
      active: true,
      product: {
        _id: "p1",
        slug: "apples",
        name: "Apples",
        priceMinor: 200,
        unit: "per kg",
        active: true,
      },
    },
    {
      _id: "507f1f77bcf86cd799439013",
      title: "Hidden",
      slug: "hidden",
      description: "Hidden",
      discountType: "percentage",
      discountValue: 10,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-31"),
      active: true,
      product: {
        _id: "p2",
        slug: "milk",
        name: "Milk",
        priceMinor: 150,
        unit: "per litre",
        active: false,
      },
    },
  ];
  const query = {
    populate() {
      return this;
    },
    sort() {
      return this;
    },
    lean: async () => records,
  };
  const promotionService = {
    async listPublic() {
      return createPromotionService({
        PromotionModel: { find: () => query },
      }).listPublic(new Date("2026-10-10T12:00:00.000Z"));
    },
    async listOwner() {
      return {
        items: records,
        pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
      };
    },
  };
  const app = createAuthTestApp({ promotionService });
  const publicResponse = await request(app).get("/api/v1/promotions");
  const ownerResponse = await request(app).get("/api/v1/owner/promotions");

  assert.equal(publicResponse.status, 200);
  assert.equal(publicResponse.body.data.length, 1);
  assert.equal(publicResponse.body.data[0].slug, "visible");
  assert.equal(ownerResponse.status, 401);
});

test("public store endpoints expose safe content and owner mutations require CSRF", async () => {
  const storeService = {
    async getPublic() {
      return { name: "Deepak Supermarket", phone: "020 7946 0123" };
    },
    async getHours() {
      return {
        openingHours: [
          {
            day: "monday",
            closed: false,
            openTime: "08:00",
            closeTime: "18:00",
          },
        ],
        exceptions: [],
      };
    },
    async listServices() {
      return [{ id: "service-1", name: "Local delivery", active: true }];
    },
    async getOwner() {
      return { name: "Deepak Supermarket" };
    },
    async update(body) {
      return body;
    },
    async updateHours(body) {
      return body;
    },
  };
  const app = createAuthTestApp({ storeService });
  assert.equal((await request(app).get("/api/v1/store")).status, 200);
  assert.equal(
    (await request(app).get("/api/v1/store/hours")).body.data.openingHours[0]
      .day,
    "monday",
  );
  assert.equal(
    (await request(app).get("/api/v1/services")).body.data[0].name,
    "Local delivery",
  );
  const agent = request.agent(app);
  await agent
    .post("/api/v1/auth/login")
    .send({ email: "owner@example.test", password: "correct-password" });
  assert.equal(
    (await agent.patch("/api/v1/owner/store").send({ name: "Changed" })).status,
    403,
  );
  const csrf = await agent.get("/api/v1/auth/csrf");
  const updated = await agent
    .patch("/api/v1/owner/store")
    .set("X-CSRF-Token", csrf.body.data.token)
    .send({ name: "Changed" });
  assert.equal(updated.status, 200);
});

test("store settings and hours reject duplicate exceptions and invalid times", async () => {
  const service = createStoreService({ StoreModel: {} });
  await assert.rejects(
    () =>
      service.updateHours({
        openingHours: Array.from({ length: 7 }, (_, index) => ({
          day: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ][index],
          closed: false,
          openTime: "09:00",
          closeTime: "08:00",
        })),
        exceptions: [],
      }),
    (error) => error.code === "INVALID_HOURS",
  );
  const settings = new StoreSettings({
    name: "Demo",
    exceptions: [{ date: "2026-12-25" }, { date: "2026-12-25" }],
  });
  await assert.rejects(() => settings.validate(), /unique/i);
});

test("public reviews expose approved content and submissions default to pending", async () => {
  const reviewService = {
    async listPublic() {
      return {
        items: [
          {
            id: "review-1",
            reviewerName: "A Customer",
            rating: 5,
            comment: "A useful fictional review.",
          },
        ],
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
      };
    },
    async create(body) {
      return { id: "review-2", ...body, status: "pending" };
    },
  };
  const app = createAuthTestApp({ reviewService });
  const listed = await request(app).get("/api/v1/reviews");
  const submitted = await request(app).post("/api/v1/reviews").send({
    reviewerName: "A Customer",
    rating: 5,
    comment: "A useful fictional review.",
  });
  assert.equal(listed.status, 200);
  assert.equal(submitted.status, 201);
  assert.equal(submitted.body.data.status, "pending");
});

test("review moderation is owner-protected and CSRF-protected", async () => {
  const reviewService = {
    async listOwner() {
      return [
        { id: "review-1", status: "pending", reviewerName: "A Customer" },
      ];
    },
    async moderate(id, status) {
      return { id, status };
    },
  };
  const app = createAuthTestApp({ reviewService });
  assert.equal((await request(app).get("/api/v1/owner/reviews")).status, 401);
  const agent = request.agent(app);
  await agent
    .post("/api/v1/auth/login")
    .send({ email: "owner@example.test", password: "correct-password" });
  assert.equal(
    (
      await agent
        .patch("/api/v1/owner/reviews/review-1")
        .send({ status: "approved" })
    ).status,
    403,
  );
  const csrf = await agent.get("/api/v1/auth/csrf");
  const approved = await agent
    .patch("/api/v1/owner/reviews/review-1")
    .set("X-CSRF-Token", csrf.body.data.token)
    .send({ status: "approved" });
  assert.equal(approved.status, 200);
  assert.equal(approved.body.data.status, "approved");
});

test("review service rejects invalid ratings and unsupported moderation status", async () => {
  const service = createReviewService({
    ProductModel: { findById: () => ({ lean: async () => null }) },
    ReviewModel: {},
  });
  await assert.rejects(
    () =>
      service.create({
        reviewerName: "Name",
        rating: 6,
        comment: "Long enough fictional comment.",
      }),
    (error) => error.code === "INVALID_RATING",
  );
  await assert.rejects(
    () => service.moderate("507f1f77bcf86cd799439011", "pending"),
    (error) => error.code === "INVALID_STATUS",
  );
});
