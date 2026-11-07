import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { categories, products } from "./data/catalogueData";
import { getPromotionStatus, promotions } from "./data/promotionsData";
import PromotionCard from "./components/PromotionCard";

const normalizeProduct = (product) => ({
  id: product.id,
  slug: product.id,
  name: product.name,
  description: product.description,
  image: product.image,
  unit: product.unit,
  priceMinor: Math.round(product.price * 100),
  category: {
    id: product.categoryId,
    slug: product.categoryId,
    name: categories.find((category) => category.id === product.categoryId)
      ?.name,
  },
});

beforeEach(() => {
  global.fetch = vi.fn(async (input) => {
    const url = typeof input === "string" ? input : input.url;

    if (url.includes("/api/v1/reviews")) {
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              id: "review-1",
              reviewerName: "A Customer",
              rating: 5,
              comment: "A useful fictional review.",
              createdAt: "2026-10-10T00:00:00.000Z",
            },
          ],
          meta: {},
          error: null,
        }),
      };
    }

    if (url.includes("/api/v1/promotions")) {
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              id: "promotion-1",
              title: "Seasonal fruit selection",
              description: "A fictional seasonal fruit example.",
              product: {
                id: "fresh-apples",
                slug: "fresh-apples",
                name: "Red Apples",
              },
              discountType: "percentage",
              discountValue: 10,
              startDate: "2026-09-01",
              endDate: "2026-12-31",
              active: true,
            },
          ],
          meta: {},
          error: null,
        }),
      };
    }

    if (url.includes("/api/v1/categories")) {
      return {
        ok: true,
        json: async () => ({
          data: categories,
          meta: { count: categories.length },
          error: null,
        }),
      };
      /* it("loads the owner product manager and saves a product", async () => {
        const user = userEvent.setup();
        const owner = {
          id: "owner-1",
          email: "owner@example.test",
          displayName: "Demo Owner",
          role: "owner",
        };
        global.fetch = vi.fn(async (input, options = {}) => {
          const url = typeof input === "string" ? input : input.url;
          if (url.includes("/auth/me"))
            return {
              ok: true,
              json: async () => ({
                data: { user: owner },
                meta: {},
                error: null,
              }),
            };
          if (url.includes("/auth/csrf"))
            return {
              ok: true,
              json: async () => ({
                data: { token: "csrf-test-token" },
                meta: {},
                error: null,
              }),
            };
          if (url.includes("/owner/categories"))
            return {
              ok: true,
              json: async () => ({
                data: [
                  {
                    id: "category-1",
                    name: "Fresh fruit",
                    slug: "fresh-fruit",
                    active: true,
                  },
                ],
                meta: {},
                error: null,
              }),
            };
          if (url.includes("/owner/products") && options.method === "POST")
            return {
              ok: true,
              json: async () => ({
                data: { id: "product-2", name: "Bananas" },
                meta: {},
                error: null,
              }),
            };
          if (url.includes("/owner/products"))
            return {
              ok: true,
              json: async () => ({
                data: [
                  {
                    id: "product-1",
                    name: "Apples",
                    slug: "apples",
                    description: "Fruit",
                    categoryId: "category-1",
                    category: { name: "Fresh fruit" },
                    price: 2,
                    unit: "per kg",
                    active: true,
                    featured: false,
                    displayOrder: 0,
                  },
                ],
                meta: {
                  pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
                },
                error: null,
              }),
            };
          return {
            ok: true,
            json: async () => ({ data: {}, meta: {}, error: null }),
          };
        });

        renderAt("/owner/products");
        expect(
          await screen.findByRole("heading", { name: "Products", level: 1 }),
        ).toBeInTheDocument();
        expect(
          await screen.findByRole("row", { name: /Apples/ }),
        ).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Add product" }));
        await user.type(screen.getByLabelText("Name"), "Bananas");
        await user.type(screen.getByLabelText("Slug"), "bananas");
        await user.selectOptions(
          screen.getByLabelText("Category"),
          "category-1",
        );
        await user.type(screen.getByLabelText("Price (£)"), "1.20");
        await user.type(screen.getByLabelText("Unit label"), "per kg");
        await user.type(screen.getByLabelText("Description"), "Fresh fruit");
        await user.click(screen.getByRole("button", { name: "Save product" }));
        expect(
          await screen.findByRole("status", { name: "" }),
        ).toHaveTextContent("Product created.");
      });

      it("loads the owner category manager and exposes category editing", async () => {
        global.fetch = vi.fn(async (input) => {
          const url = typeof input === "string" ? input : input.url;
          if (url.includes("/auth/me"))
            return {
              ok: true,
              json: async () => ({
                data: {
                  user: {
                    id: "owner-1",
                    displayName: "Demo Owner",
                    role: "owner",
                  },
                },
                meta: {},
                error: null,
              }),
            };
          if (url.includes("/owner/categories"))
            return {
              ok: true,
              json: async () => ({
                data: [
                  {
                    id: "category-1",
                    name: "Fresh fruit",
                    slug: "fresh-fruit",
                    description: "Fruit",
                    displayOrder: 1,
                    active: true,
                  },
                ],
                meta: {},
                error: null,
              }),
            };
          return {
            ok: true,
            json: async () => ({ data: {}, meta: {}, error: null }),
          };
        });

        renderAt("/owner/categories");
        expect(
          await screen.findByRole("heading", { name: "Categories", level: 1 }),
        ).toBeInTheDocument();
        expect(
          await screen.findByRole("row", { name: /Fresh fruit/ }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Add category" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Edit" }),
        ).toBeInTheDocument();
      }); */
    }

    if (url.includes("/api/v1/products")) {
      const productSlug = url.split("/api/v1/products/").at(-1)?.split("?")[0];
      if (productSlug && productSlug !== "") {
        const product = products.find((item) => item.id === productSlug);
        if (!product) {
          return {
            ok: false,
            status: 404,
            json: async () => ({
              data: null,
              meta: {},
              error: {
                code: "PRODUCT_NOT_FOUND",
                message: "Product not found.",
              },
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({
            data: normalizeProduct(product),
            meta: {},
            error: null,
          }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          data: {
            items: products.map(normalizeProduct),
            pagination: {
              page: 1,
              limit: 12,
              total: products.length,
              totalPages: 1,
            },
          },
          meta: {
            pagination: {
              page: 1,
              limit: 12,
              total: products.length,
              totalPages: 1,
            },
          },
          error: null,
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({ data: {}, meta: {}, error: null }),
    };
  });
});

function renderAt(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("public website foundation", () => {
  it("renders the home page and navigates to store information", async () => {
    const user = userEvent.setup();
    renderAt("/");

    expect(
      screen.getByRole("heading", {
        name: /welcoming place for the everyday grocery shop/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Deepak Supermarket home/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Demo Store — Sample Information/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Store information" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Store information" }),
    ).toBeInTheDocument();
  });

  it("presents fictional store details and avoids unverified directions", () => {
    renderAt("/visit");

    expect(screen.getByText(/Fictional sample address/i)).toBeInTheDocument();
    expect(screen.getByText("020 7946 0123")).toBeInTheDocument();
    expect(screen.getByText("Monday–Saturday")).toBeInTheDocument();
    expect(screen.getByText(/No verified directions/i)).toBeInTheDocument();
  });

  it("validates the contact form without reporting a sent enquiry", async () => {
    const user = userEvent.setup();
    renderAt("/contact");

    await user.click(
      screen.getByRole("button", { name: /check your message/i }),
    );
    expect(screen.getByText("Enter your name.")).toBeInTheDocument();
    expect(
      screen.getByText(/does not send or store messages/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/your enquiry has been sent/i),
    ).not.toBeInTheDocument();
  });

  it("opens and closes FAQ answers with disclosure state", async () => {
    const user = userEvent.setup();
    renderAt("/faqs");
    const question = screen.getByRole("button", {
      name: /are these store details real/i,
    });

    expect(question).toHaveAttribute("aria-expanded", "false");
    await user.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/fictional sample information/i)).toBeVisible();
  });

  it("shows a useful page for unknown routes", () => {
    renderAt("/not-a-real-page");

    expect(
      screen.getByRole("heading", { name: /that page could not be found/i }),
    ).toBeInTheDocument();
  });

  it("keeps the future catalogue dataset structurally consistent", () => {
    expect(categories).toHaveLength(8);
    expect(products.length).toBeGreaterThanOrEqual(24);
    expect(new Set(products.map((product) => product.id)).size).toBe(
      products.length,
    );
    products.forEach((product) => {
      expect(
        categories.some((category) => category.id === product.categoryId),
      ).toBe(true);
      expect(product.price).toBeGreaterThan(0);
      expect(product.demo).toBe(true);
    });
  });

  it("searches product names and descriptions", async () => {
    const user = userEvent.setup();
    renderAt("/products");
    const search = screen.getByRole("searchbox", { name: /search groceries/i });

    await user.type(search, "fruit bowl");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(
      screen.getByRole("heading", { name: "Bananas" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "White Bread" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("1", { selector: "strong" })).toBeInTheDocument();
  });

  it("filters by category, price, and sort order", async () => {
    const user = userEvent.setup();
    renderAt("/products");

    await user.click(screen.getByRole("button", { name: "Bakery" }));
    expect(
      screen.getByRole("heading", { name: "White Bread" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Plain Bagels" }),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Minimum price"));
    await user.type(screen.getByLabelText("Minimum price"), "1.6");
    await user.click(screen.getByRole("button", { name: "Apply prices" }));
    expect(
      screen.queryByRole("heading", { name: "White Bread" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Plain Bagels" }),
    ).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Sort products"),
      "price-desc",
    );
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings.indexOf("Plain Naan Breads")).toBeLessThan(
      headings.indexOf("Plain Bagels"),
    );
  });

  it("restores valid URL state and safely ignores invalid parameters", () => {
    renderAt(
      "/products?q=milk&category=not-a-category&minPrice=-4&sort=not-a-sort",
    );
    expect(
      screen.getByRole("heading", { name: "Whole Milk" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /no groceries match/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a clear empty result and can clear catalogue filters", async () => {
    const user = userEvent.setup();
    renderAt("/products?q=does-not-exist");
    expect(
      screen.getByRole("heading", { name: /no groceries match/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(
      screen.getByRole("heading", { name: "Bananas" }),
    ).toBeInTheDocument();
  });

  it("renders valid and unknown product detail routes", () => {
    renderAt("/products/fresh-bananas");
    expect(
      screen.getByRole("heading", { name: "Bananas" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/fictional demonstration product/i),
    ).toBeInTheDocument();

    cleanup();
    renderAt("/products/not-a-product");
    expect(
      screen.getByRole("heading", { name: "Product not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to all groceries" }),
    ).toBeInTheDocument();
  });

  it("renders date-valid promotions and does not show expired examples", async () => {
    renderAt("/offers");
    expect(
      await screen.findByRole("heading", { name: "Seasonal fruit selection" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Past example promotion" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/1 September 2026/)).toBeInTheDocument();
    expect(
      getPromotionStatus(
        promotions.find((promotion) => promotion.id === "expired-example"),
        new Date("2026-10-09"),
      ),
    ).toBe("expired");
  });

  it("does not crash when a promotion references an unknown product", () => {
    render(
      <MemoryRouter>
        <PromotionCard
          promotion={{
            id: "unknown",
            title: "Example",
            description: "Example",
            type: "Example",
            productId: "missing",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
          }}
          status="active"
        />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Example" }),
    ).toBeInTheDocument();
  });

  it("redirects protected owner pages to login and logs an owner in", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(async (input, options = {}) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/auth/me")) {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            data: null,
            meta: {},
            error: { message: "Authentication is required." },
          }),
        };
      }
      if (url.includes("/auth/login")) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                id: "owner-1",
                email: "owner@example.test",
                displayName: "Demo Owner",
                role: "owner",
              },
            },
            meta: {},
            error: null,
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ data: {}, meta: {}, error: null }),
      };
    });

    renderAt("/owner/products");
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Owner sign in" }),
      ).toBeInTheDocument(),
    );
    await user.type(
      screen.getByLabelText("Email address"),
      "owner@example.test",
    );
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /welcome, demo owner/i }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: "Products" })).toBeInTheDocument();
  });

  it("shows a generic login failure and keeps public pages available", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(async (input) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/auth/me")) {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            data: null,
            meta: {},
            error: { message: "Authentication is required." },
          }),
        };
      }
      if (url.includes("/auth/login")) {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            data: null,
            meta: {},
            error: { message: "Invalid email or password." },
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ data: {}, meta: {}, error: null }),
      };
    });

    renderAt("/owner/login");
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Owner sign in" }),
      ).toBeInTheDocument(),
    );
    await user.type(
      screen.getByLabelText("Email address"),
      "owner@example.test",
    );
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );

    cleanup();
    renderAt("/");
    expect(
      screen.getByRole("link", { name: /Deepak Supermarket home/i }),
    ).toBeInTheDocument();
  });

  it("loads the owner product manager and saves a product", async () => {
    const user = userEvent.setup();
    const owner = {
      id: "owner-1",
      email: "owner@example.test",
      displayName: "Demo Owner",
      role: "owner",
    };
    global.fetch = vi.fn(async (input, options = {}) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/auth/me"))
        return {
          ok: true,
          json: async () => ({ data: { user: owner }, meta: {}, error: null }),
        };
      if (url.includes("/auth/csrf"))
        return {
          ok: true,
          json: async () => ({
            data: { token: "csrf-test-token" },
            meta: {},
            error: null,
          }),
        };
      if (url.includes("/owner/categories"))
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "category-1",
                name: "Fresh fruit",
                slug: "fresh-fruit",
                active: true,
              },
            ],
            meta: {},
            error: null,
          }),
        };
      if (url.includes("/owner/products") && options.method === "POST")
        return {
          ok: true,
          json: async () => ({
            data: { id: "product-2", name: "Bananas" },
            meta: {},
            error: null,
          }),
        };
      if (url.includes("/owner/products"))
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "product-1",
                name: "Apples",
                slug: "apples",
                description: "Fruit",
                categoryId: "category-1",
                category: { name: "Fresh fruit" },
                price: 2,
                unit: "per kg",
                active: true,
                featured: false,
                displayOrder: 0,
              },
            ],
            meta: {
              pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
            },
            error: null,
          }),
        };
      return {
        ok: true,
        json: async () => ({ data: {}, meta: {}, error: null }),
      };
    });

    renderAt("/owner/products");
    expect(
      await screen.findByRole("heading", { name: "Products", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("row", { name: /Apples/ }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add product" }));
    await user.type(screen.getByLabelText("Name"), "Bananas");
    await user.type(screen.getByLabelText("Slug"), "bananas");
    await user.selectOptions(
      screen.getByLabelText("Category", { selector: "#product-category" }),
      "category-1",
    );
    await user.type(screen.getByLabelText("Price (£)"), "1.20");
    await user.type(screen.getByLabelText("Unit label"), "per kg");
    await user.type(screen.getByLabelText("Description"), "Fresh fruit");
    await user.click(screen.getByRole("button", { name: "Save product" }));
    expect(await screen.findByText("Product created.")).toBeInTheDocument();
  });

  it("loads the owner category manager and exposes category editing", async () => {
    global.fetch = vi.fn(async (input) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/auth/me"))
        return {
          ok: true,
          json: async () => ({
            data: {
              user: { id: "owner-1", displayName: "Demo Owner", role: "owner" },
            },
            meta: {},
            error: null,
          }),
        };
      if (url.includes("/owner/categories"))
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "category-1",
                name: "Fresh fruit",
                slug: "fresh-fruit",
                description: "Fruit",
                displayOrder: 1,
                active: true,
              },
            ],
            meta: {},
            error: null,
          }),
        };
      return {
        ok: true,
        json: async () => ({ data: {}, meta: {}, error: null }),
      };
    });

    renderAt("/owner/categories");
    expect(
      await screen.findByRole("heading", { name: "Categories", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("row", { name: /Fresh fruit/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add category" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("loads the owner promotions manager with scheduled status controls", async () => {
    global.fetch = vi.fn(async (input) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/auth/me"))
        return {
          ok: true,
          json: async () => ({
            data: {
              user: { id: "owner-1", displayName: "Demo Owner", role: "owner" },
            },
            meta: {},
            error: null,
          }),
        };
      if (url.includes("/owner/products"))
        return {
          ok: true,
          json: async () => ({
            data: [
              { id: "product-1", name: "Apples", slug: "apples", active: true },
            ],
            meta: {
              pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
            },
            error: null,
          }),
        };
      if (url.includes("/owner/promotions"))
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "promotion-1",
                title: "Autumn apples",
                slug: "autumn-apples",
                description: "Fictional offer",
                discountType: "percentage",
                discountValue: 10,
                startDate: "2026-12-01",
                endDate: "2026-12-31",
                active: true,
              },
            ],
            meta: {
              pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
            },
            error: null,
          }),
        };
      return {
        ok: true,
        json: async () => ({ data: {}, meta: {}, error: null }),
      };
    });

    renderAt("/owner/promotions");
    expect(
      await screen.findByRole("heading", { name: "Promotions", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("row", { name: /Autumn apples/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("scheduled")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add promotion" }),
    ).toBeInTheDocument();
  });

  it("renders approved reviews and explains moderation on submission", async () => {
    const user = userEvent.setup();
    renderAt("/reviews");
    expect(
      await screen.findByRole("heading", { name: "Approved reviews" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/a useful fictional review/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText("Your name"), "A Visitor");
    await user.type(
      screen.getByLabelText("Comment"),
      "A longer fictional comment.",
    );
    await user.click(screen.getByRole("button", { name: "Submit review" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/moderation/i);
  });

  it("includes Products in primary header navigation and routes to the catalogue", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    const productsLink = within(nav).getByRole("link", { name: "Products" });
    expect(productsLink).toBeInTheDocument();
    expect(productsLink).toHaveAttribute("href", "/products");

    await user.click(productsLink);
    expect(
      screen.getByRole("heading", { level: 1, name: "Our groceries" }),
    ).toBeInTheDocument();
  });

  it("renders Visa & Mastercard and Apple Pay payment options on product details with interactive previews", async () => {
    const user = userEvent.setup();
    renderAt("/products/fresh-bananas");

    expect(
      screen.getByRole("heading", { name: "Payment options" }),
    ).toBeInTheDocument();

    const cardsBtn = screen.getByRole("button", {
      name: /visa and mastercard/i,
    });
    const applePayBtn = screen.getByRole("button", {
      name: /apple pay/i,
    });

    expect(cardsBtn).toBeInTheDocument();
    expect(applePayBtn).toBeInTheDocument();
    expect(within(cardsBtn).getByText(/integrating soon/i)).toBeInTheDocument();
    expect(within(applePayBtn).getByText(/integrating soon/i)).toBeInTheDocument();

    // Click Visa & Mastercard option to view modal
    await user.click(cardsBtn);
    const cardsDialog = screen.getByRole("dialog", { name: /pay with visa & mastercard/i });
    expect(cardsDialog).toBeInTheDocument();
    expect(
      within(cardsDialog).getByText(/full express card integration for/i),
    ).toBeInTheDocument();
    expect(within(cardsDialog).getByText("Bananas")).toBeInTheDocument();

    // Close modal via close button
    await user.click(within(cardsDialog).getByRole("button", { name: /close payment modal/i }));
    expect(
      screen.queryByRole("dialog", { name: /pay with visa & mastercard/i }),
    ).not.toBeInTheDocument();

    // Click Apple Pay option to view modal
    await user.click(applePayBtn);
    const appleDialog = screen.getByRole("dialog", { name: /pay with apple pay/i });
    expect(appleDialog).toBeInTheDocument();
    expect(within(appleDialog).getByText(/seamless, private, and secure contactless/i)).toBeInTheDocument();

    // Close modal via button
    await user.click(
      within(appleDialog).getByRole("button", { name: /understood, return to product/i }),
    );
    expect(
      screen.queryByRole("dialog", { name: /pay with apple pay/i }),
    ).not.toBeInTheDocument();
  });

  it("displays accepted and upcoming payment methods on the store information page", () => {
    renderAt("/visit");

    expect(
      screen.getByRole("heading", { name: "Payment methods" }),
    ).toBeInTheDocument();
    expect(screen.getByText("In-store accepted")).toBeInTheDocument();
    expect(
      screen.getByText(/Cash, UK Debit & Credit cards, Contactless/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Visa & Mastercard/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Express mobile contactless — integrating soon/i),
    ).toBeInTheDocument();
  });
});
