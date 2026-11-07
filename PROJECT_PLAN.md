# Borough Basket Website - Project Plan

## 1. Repository inspection

Inspected on 2026-10-09:

- The workspace contains one directory, `DummySample`.
- `DummySample` is empty: no source files, package manifests, lockfiles, configuration, tests, or documentation were found.
- The directory is not currently a Git repository.
- There are no existing dependencies, scripts, environment files, or implementation decisions to preserve.

This plan is therefore for a greenfield JavaScript MERN application. Implementation is intentionally not included in this phase.

## 2. Product boundaries and assumptions

The temporary business name is **Borough Basket - Local Supermarket & Groceries**. It is a reusable demonstration template for independent London neighbourhood supermarkets.

Initial release goals:

- Publish trustworthy store, catalogue, availability, offers, services, opening-hours, FAQ, and contact information.
- Let customers search and browse products without creating accounts or paying online.
- Let customers submit reviews, report reviews, and send enquiries.
- Give authenticated owners a server-protected dashboard for managing published content and moderating submissions.
- Keep product, stock, pricing, and store data structured so ordering and payments can be added later without replacing the public catalogue or authentication foundations.

Explicit non-goals for the initial release:

- No checkout, basket persistence, product ordering, stock reservation, payment processing, refunds, delivery scheduling, or card-data collection.
- No invented address, opening times, service claims, customer reviews, ratings, or operational policies. Seed/demo content must be clearly marked as configurable or supplied by the owner.
- No customer account system unless a later requirement makes it necessary.

## 3. Proposed repository structure

Use a single repository with logically separated applications and shared documentation. The frontend and backend remain independently runnable and deployable.

```text
DummySample/
|- client/
|  |- src/
|  |  |- app/                 # Router, providers, app-level error/loading states
|  |  |- components/          # Reusable accessible UI components
|  |  |- features/            # Catalogue, reviews, enquiries, owner dashboard
|  |  |- layouts/             # Public and owner layouts
|  |  |- pages/               # Route-level page components
|  |  |- services/             # Axios client and API modules
|  |  |- styles/               # Tailwind entry point and design tokens
|  |  |- test/                 # Vitest and Testing Library setup
|  |  |- main.jsx
|  |  |- App.jsx
|  |- public/
|  |- package.json
|  |- vite.config.js
|  |- tailwind.config.js
|  |- .env.example
|- server/
|  |- src/
|  |  |- config/               # Environment parsing and database setup
|  |  |- middleware/           # Auth, validation, rate limits, errors, request IDs
|  |  |- models/               # Mongoose schemas and indexes
|  |  |- routes/               # Versioned route declarations only
|  |  |- controllers/          # HTTP translation and status codes
|  |  |- services/             # Business rules and persistence orchestration
|  |  |- validators/            # Zod request/query/param schemas
|  |  |- utils/                 # Logger, pagination, response helpers
|  |  |- app.js                 # Express app factory, testable without listening
|  |  |- server.js              # Runtime entry point
|  |- tests/
|  |  |- unit/
|  |  |- integration/
|  |- package.json
|  |- .env.example
|- e2e/                         # Playwright browser journeys
|- docs/                        # Optional API and content-model notes
|- .gitignore
|- package.json                 # Workspace scripts only after setup
|- PROJECT_PLAN.md
|- README.md
```

The root package should use npm workspaces only if that reduces command duplication; otherwise, simple root scripts that delegate to `client` and `server` are sufficient. Avoid adding a shared package until duplicated contracts genuinely appear.

## 4. Database design

MongoDB is the system of record. Mongoose schemas should define validation, indexes, timestamps, and publication/moderation state. Store image URLs and metadata rather than binary uploads in the first version; an object-storage decision can be made before adding media management.

### Collections

#### `users`

Owner and future staff identities. Fields: email, password hash, display name, role, active flag, last login, failed-login metadata, and timestamps. Never store plaintext passwords or session secrets.

#### `categories`

Catalogue taxonomy. Fields: name, slug, description, display order, active flag, and timestamps. A product references one category by ObjectId; the slug is unique among active categories.

#### `products`

Public catalogue records. Fields: name, slug, description, brand, category reference, unit label, price in integer minor units plus currency, availability status, optional stock note, image metadata, featured flag, active flag, and timestamps. Do not expose internal stock quantities publicly. Index active products by category, name, slug, and search fields.

#### `promotions`

Offers displayed on the public site. Fields: title, description, product/category references where applicable, offer type and display text, start/end dates, active flag, priority, and timestamps. The initial version displays promotions only and does not calculate a basket price.

#### `storeSettings`

One logical current store profile per tenant/template instance. Fields: store name, address, postcode, map link, phone, email, description, social links, holiday-hours notice, and timestamps. Keep this as a document that can later gain a `storeId` or tenant key.

#### `openingHours`

Weekly hours and dated exceptions. Fields: day or date, open/closed flag, opening and closing times, label, and timestamps. Enforce one record per weekday and unique dates for exceptions. The API resolves exceptions before weekly hours.

#### `services`

Store services shown publicly. Fields: title, description, availability note, icon key, display order, active flag, and timestamps. Do not publish a service until the owner confirms it exists.

#### `reviews`

Customer-submitted reviews awaiting moderation or published. Fields: display name, rating, review text, optional contact email for moderation follow-up, status (`pending`, `published`, `rejected`, `hidden`), moderation reason, moderated by, moderated at, and timestamps. Contact email must not be public.

#### `reviewReports`

Reports associated with a review. Fields: review reference, reason, details, reporter contact where supplied, status, resolution note, resolved by, resolved at, and timestamps. Restrict report visibility to owners.

#### `enquiries`

Contact submissions. Fields: name, email, subject, message, status (`new`, `in_progress`, `resolved`, `spam`), internal notes, assigned user, resolved at, and timestamps. Apply retention and deletion rules before production use.

#### `auditEvents`

Owner activity history. Fields: actor user reference, action, entity type and ID, sanitized change summary, request ID, IP hash or privacy-approved request metadata, and timestamp. Never record passwords, tokens, or full sensitive request bodies.

### Relationships and invariants

- `products.categoryId` references `categories`; deleting a category should be blocked or require reassignment.
- `promotions` may reference products or categories but cannot imply payment or inventory reservation.
- `reviews` own many `reviewReports`; reports cannot publish or alter a review directly.
- `auditEvents` reference the actor and target entity loosely so historical events survive entity deactivation.
- Public queries return only active/published records and use explicit response DTOs rather than raw Mongoose documents.
- Prefer soft deactivation for products, categories, services, promotions, and reviews so links and audit history remain meaningful.

## 5. API design

Base path: `/api/v1`. Return a consistent envelope:

```json
{ "data": {}, "meta": {}, "error": null }
```

Errors should use `{ "data": null, "meta": {}, "error": { "code": "...", "message": "...", "fieldErrors": {} } }` without leaking stack traces or database details. Use standard status codes: `200/201`, `204` where appropriate, `400` validation, `401` unauthenticated, `403` unauthorized, `404` missing, `409` conflict, `429` rate limited, and `500` unexpected failure.

### Public endpoint groups

- `GET /health` - service health, with no sensitive diagnostics.
- `GET /catalogue/products` - paginated product list with search, category, availability, featured, and sort filters.
- `GET /catalogue/products/:slug` - public product detail.
- `GET /catalogue/categories` - active categories.
- `GET /promotions` - currently active and scheduled displayable offers.
- `GET /store` - public store profile, contact details, and location.
- `GET /store/hours` - resolved weekly and holiday hours.
- `GET /services` - active store services.
- `GET /reviews` - published reviews with pagination and aggregate rating metadata.
- `POST /reviews` - submit a review; validate, rate-limit, and queue for moderation.
- `POST /reviews/:reviewId/reports` - submit a review report; validate and rate-limit.
- `GET /faqs` - FAQ content, initially configuration-backed or represented as a managed content collection in a later phase.
- `POST /enquiries` - contact enquiry submission with honeypot/spam controls and rate limiting.

### Owner authentication endpoint groups

- `POST /auth/login` - email/password authentication with generic failure messages.
- `POST /auth/logout` - revoke/clear the authenticated session.
- `GET /auth/me` - current owner identity and role.
- `POST /auth/refresh` only if a refresh-token design is selected; do not add it without a rotation and revocation strategy.

Use an HttpOnly, Secure, SameSite cookie-backed short-lived session for the first version, with server-side session records or a carefully designed rotating token strategy. Avoid storing authentication tokens in `localStorage`.

### Owner endpoint groups

All owner routes require authentication, role authorization, validation, audit logging, and ownership of the relevant tenant/store context.

- `GET /owner/overview` - counts, pending moderation, new enquiries, and configuration warnings.
- `GET|POST|PATCH|DELETE /owner/products` - product CRUD and availability/pricing updates.
- `GET|POST|PATCH|DELETE /owner/categories` - category management.
- `GET|POST|PATCH|DELETE /owner/promotions` - promotion management.
- `GET|PATCH /owner/store` - store profile management.
- `GET|PUT /owner/hours` - weekly and holiday-hours management.
- `GET|POST|PATCH|DELETE /owner/services` - service management.
- `GET|PATCH /owner/reviews` - moderation actions and publication state.
- `GET|PATCH /owner/review-reports` - review report workflow.
- `GET|PATCH /owner/enquiries` - enquiry status, assignment, and private notes.
- `GET /owner/audit-events` - filtered, paginated audit history.
- `GET /owner/exports/:type` - authorization-checked CSV exports for appropriate business data, with no passwords, tokens, or unnecessary personal data.

Do not expose raw MongoDB update operators, arbitrary collection names, or unrestricted query objects through the API.

## 6. Authentication and security requirements

- Hash passwords with Argon2id or bcrypt using an appropriate work factor; never log credentials.
- Normalize and validate owner emails; use generic login errors to avoid account enumeration.
- Use secure cookies, CSRF protection for cookie-authenticated state changes, strict CORS allowlists, Helmet, body-size limits, request timeouts, and production-safe error handling.
- Apply route-specific rate limits to login, review submission, review reports, and enquiries. Add spam protection such as a honeypot and server-side timing/volume checks; choose CAPTCHA only if needed.
- Validate all body, query, and path input with Zod (or an equivalent schema library) before services run. Sanitize displayed user content and escape output by default.
- Enforce authorization in Express middleware and service methods; frontend route guards are only a usability feature.
- Use least-privilege MongoDB credentials, TLS in deployed environments, encrypted environment-variable storage, and separate development/test databases.
- Maintain `.env.example` only; ignore real `.env` files. Required configuration includes MongoDB URI, session/auth secrets, allowed origins, port, and logging settings.
- Avoid collecting customer data beyond what is needed. Publish a privacy notice, define retention/deletion rules for enquiries and reports, and provide a process for data access/deletion requests.
- Add dependency auditing, security headers, structured redacted logs, request IDs, and audit events for owner mutations.
- Set explicit upload/content policies before adding images. Do not accept arbitrary file uploads in the initial release.

## 7. Frontend page and route structure

### Public routes

- `/` - homepage with configurable welcome content, current offers, store snapshot, hours, services, and clear catalogue/contact actions.
- `/products` - searchable, filterable, paginated catalogue.
- `/products/:slug` - product detail, price/unit, availability note, category, and related offers.
- `/offers` - promotions.
- `/about` - owner-provided supermarket story and local positioning.
- `/services` - confirmed store services.
- `/visit` - address, map link, phone, opening hours, and holiday-hours notice.
- `/contact` - accessible enquiry form and contact details.
- `/reviews` - published customer reviews, submission form, and report flow.
- `/faqs` - accessible FAQ disclosure sections.
- `/privacy` - privacy information and contact route for privacy requests.

### Owner routes

- `/owner/login` - login form.
- `/owner` - overview dashboard.
- `/owner/products`, `/owner/categories`, `/owner/promotions` - catalogue and offer management.
- `/owner/store`, `/owner/hours`, `/owner/services` - store configuration.
- `/owner/reviews`, `/owner/reports`, `/owner/enquiries` - moderation and enquiry workflows.
- `/owner/exports`, `/owner/audit` - exports and audit history.

The public and owner areas should use separate layouts and navigation. Every form needs labels, keyboard support, visible focus states, useful validation, loading/success/error states, and screen-reader-friendly status messaging. Catalogue filters should remain usable on mobile and preserve URL query state for sharing and back-button behavior.

## 8. Visual design system

Direction: established British neighbourhood supermarket, practical and welcoming rather than luxury or startup-like.

- Forest green: primary navigation, buttons, links, and strong accents.
- Warm cream: page background and editorial surfaces.
- Tomato red: restrained alerts, selected promotional emphasis, and destructive actions.
- Golden yellow: offer highlights and small attention accents.
- White: content surfaces and form controls.
- Charcoal: body text and borders.
- Typography: a classic serif for page titles and major headings; a highly legible sans-serif for body copy, controls, and data tables. Load selected fonts deliberately and provide local/system fallbacks.
- Layout: constrained readable content width, clear horizontal rules, modest 4-8px radii, practical spacing, and strong alignment. Avoid card nesting, oversized hero sections, glass effects, excessive gradients, and decorative motion.
- Components: header/navigation, skip link, footer, breadcrumbs, product list/grid, filter controls, price/availability display, promotion banner, hours table, forms, status badges, review moderation table, modal/dialog, toast/status region, pagination, and empty/error states.
- Accessibility: target WCAG 2.2 AA contrast and keyboard behavior, semantic landmarks, reduced-motion support, responsive type that does not rely on viewport scaling, and no color-only status communication.
- Responsive behavior: mobile-first layouts, touch-sized controls, no horizontal scrolling for core flows, stable product media dimensions, and owner tables that become structured stacked rows on narrow screens.

## 9. Future ordering and payment boundary

The initial API is read-heavy and catalogue-focused. To allow future ordering without pretending it exists now:

- Keep product identity, unit, price currency/minor units, availability, and publication status structured and versionable.
- Keep public catalogue DTOs separate from a future order snapshot model; future orders must copy product name, SKU/ID, unit, and price at purchase time.
- Reserve future modules for `carts`, `orders`, `payments`, `refunds`, and stock reservations rather than adding fields to reviews or enquiries.
- Put future payment provider integration behind a service boundary and webhook verification layer. Never accept card details directly.

## 10. Phase 5 implementation note: owner authentication foundation

The owner area uses server-managed Express sessions. Session identifiers are stored in an HTTP-only, SameSite cookie; session data uses `connect-mongo` when MongoDB is configured, and production rejects a missing `MONGODB_URI` or `SESSION_SECRET`. Development and automated tests may use the Express session store only when no MongoDB URI is supplied.

Owner passwords are bcrypt hashes in the `users` collection. Emails are normalized and unique, accounts have an `owner` or `staff` role and an active flag, and public registration is not exposed. The initial owner is created by the interactive `server/src/scripts/provisionOwner.js` command, which refuses an existing email and never accepts a password as a command-line argument.

The authentication API is mounted under `/api/v1/auth`: login, session restoration, CSRF token retrieval, and logout. Login regenerates the session identifier, login attempts are rate-limited, errors are generic, and logout requires the session CSRF token. `/api/v1/owner/overview`, `/api/v1/owner/products`, and `/api/v1/owner/categories` are protected by reusable session and role middleware. These routes only provide the Phase 5 dashboard foundation; catalogue mutation belongs to a later phase.

The React owner area uses an application auth context for session restoration and usability redirects. Frontend guards do not replace Express authorization. Owner routes are `/owner/login`, `/owner`, `/owner/products`, and `/owner/categories`; public routes remain unauthenticated.

## 11. Phase 6 implementation note: owner product and category management

Phase 6 uses the existing `Product` and `Category` models through a dedicated owner catalogue service. Management routes are protected by the existing session and owner-role middleware, and all POST/PATCH/DELETE operations pass through the existing CSRF middleware. The service whitelists editable fields rather than passing request bodies to Mongoose, validates ObjectIds and category references, converts GBP prices to integer minor units, and translates duplicate-key conflicts into safe `409` responses.

Product deletion is a soft deactivation (`active: false`), preserving future references and automatically excluding the record from public active-only catalogue queries. Category deletion is also a deactivation, but it is refused with `CATEGORY_IN_USE` while any product, active or inactive, still references the category. No arbitrary reassignment is performed.

The owner UI now provides product search, category/status filtering, pagination, create/edit forms, status feedback, and deactivation actions at `/owner/products`. `/owner/categories` provides category listing, creation, editing, display order, and safe deactivation feedback. Product and category management remains limited to this phase; promotions, moderation, inventory quantities, orders, and payments are not included.

## 13. Phase 8 implementation note: store information management

Phase 8 adds one canonical `StoreSettings` document keyed as `default`. It contains public store identity, contact/address fields, publication status, weekly hours, and unique exceptional dates. Weekly and exception times use 24-hour `HH:mm` values on the server; the public UI formats them for display. Exceptions are either closed or have a validated opening/closing range.

Basic store services use a separate `Service` collection because they are repeatable ordered records. Services have unique slugs, active status, descriptions, and display order. Public queries return active services only; owner mutations reuse the existing session, owner-role, CSRF, validation, and response conventions.

Public routes are `/api/v1/store`, `/api/v1/store/hours`, and `/api/v1/services`. Protected routes are `/api/v1/owner/store`, `/api/v1/owner/store/hours`, and `/api/v1/owner/services` with standard item mutations. The owner UI is `/owner/store`; public pages consume a shared store context. The existing fictional `storeConfig` remains an explicit demo fallback when the API is unavailable, and the seed command can create the canonical demo record.

## 14. Phase 9 implementation note: customer reviews and moderation

Reviews use the `Review` model with reviewer name, optional product reference, rating, optional title, comment, timestamps, and explicit `pending`, `approved`, or `rejected` status. Public submissions cannot set status and are rate-limited. Public reads query approved records only. Owner moderation can approve or reject reviews through CSRF-protected owner routes; reviewer identity and submission timestamps are not editable.

The public `/reviews` page displays approved reviews and explains the moderation step for submissions. The protected `/owner/reviews` page filters pending, approved, and rejected records and provides approve/reject actions. Customer accounts, email notifications, AI moderation, and review audit history are intentionally outside Phase 9.

## 12. Phase 7 implementation note: promotions management

Promotions use the new `Promotion` model and a dedicated service. The accepted discount types are `percentage` and `fixed_price`; percentage values are strictly greater than zero and no greater than 100, while fixed promotional prices use integer GBP minor units. A promotion may reference a product or category, and active promotions must reference active records.

Public `GET /api/v1/promotions` applies the server's current date and returns only active, date-valid records with active referenced products/categories. The boundary is inclusive on both dates. Owner routes support list/search/status filtering, retrieval, creation, updates, and soft deactivation. They reuse the existing session, owner-role, CSRF, response-envelope, and error middleware.

The public `/offers` page now consumes the API and handles loading, error, and empty states. The protected `/owner/promotions` page supports search, active filtering, scheduled/current/expired status display, creation, editing, and deactivation. Promotion management does not include orders, payments, inventory, reviews, enquiries, or notifications.

- Do not add basket, checkout, payment buttons, or order language to the initial UI.

## 10. Incremental implementation phases

Each phase should end with a working, testable slice and a short review of the resulting API/UI contract.

### Phase 0 - Decisions and project foundation

- Confirm store data/content ownership, initial tenant strategy, supported Node version, deployment targets, and whether the app is one store or multi-tenant.
- Initialize npm workspace, JavaScript tooling, Vite client, Express server, lint/format rules, environment examples, and CI basics.
- Add app factory, health endpoint, React shell, and test commands.
- Tests: server health integration test, client render smoke test, and a basic Playwright launch check.

### Phase 1 - Public store information

- Add store settings, opening hours/holiday exceptions, services, and FAQ content model or configuration decision.
- Build public layout, homepage, about, services, visit, FAQs, privacy, and contact form.
- Add enquiry persistence, validation, rate limiting, and owner-visible status.
- Tests: API validation/integration tests, accessible form tests, and an end-to-end contact journey.

### Phase 2 - Catalogue and promotions

- Add categories, products, availability, search/filter/pagination, product details, and promotions.
- Build public catalogue routes and owner CRUD screens for products/categories/promotions.
- Tests: service/unit tests, API authorization tests, query behavior tests, and browser search/filter/detail journey.

### Phase 3 - Authentication and owner shell

- Add owner bootstrap/admin provisioning outside public signup, password hashing, sessions/cookies, login/logout/me, role checks, CSRF and security middleware.
- Add owner overview, protected routing, error boundaries, and audit event foundation.
- Tests: login failure/success, cookie attributes, unauthorized access, role checks, and session invalidation.

### Phase 4 - Moderation and exports

- Add review submission/publication, review reporting, enquiry workflow, audit history, and privacy-aware CSV exports.
- Build owner moderation/report/enquiry/audit screens.
- Tests: moderation transitions, report authorization, export redaction, rate limits, and end-to-end review/report workflow.

### Phase 5 - Hardening and release readiness

- Add production configuration validation, indexes, observability, dependency/security checks, backup/restore procedure, retention policy, deployment documentation, and content entry checklist.
- Run accessibility checks, responsive browser tests, API contract tests, and a manual security review.
- Validate that no payment or card collection path exists and that all demo content is clearly configurable.

## 11. Risks and decisions requiring review

- **Single store versus multi-tenant template:** start with one logical store but keep a future `storeId` boundary; decide before production data modeling.
- **Content editing scope:** FAQs and longer about/privacy content need a clear source of truth. Decide whether they are code/configuration initially or require a managed content collection.
- **Image hosting:** decide on an approved object-storage/CDN provider before uploads; URL-only records are safer for the initial slice.
- **Availability semantics:** agree whether availability is informational (`in stock`, `limited`, `unavailable`, `ask in store`) rather than a precise live quantity. The plan assumes informational status.
- **Price semantics:** confirm whether prices are per item, weight, or pack; store a display unit and integer minor-unit price, and avoid misleading calculations for variable-weight goods.
- **Authentication operations:** owner invitation, password reset, MFA, session revocation, and account recovery need an operational owner before production. The demo starts with provisioned owner accounts and no public signup.
- **Moderation/privacy:** decide review retention, contact-email retention, response workflow, and who may export personal data.
- **Email delivery:** contact/review notifications need a transactional email provider and failure policy; the initial plan persists submissions even if notifications are deferred.
- **Location/map provider:** use a configurable external map link or approved provider; do not embed a guessed address.
- **Deployment:** select hosting for client, server, MongoDB, secrets, TLS, logs, backups, and allowed origins before release hardening.
- **Testing data:** all fixtures must be clearly synthetic and must not imply real customer endorsements or services.

### 15. Phase 10 implementation note: security, integration and release readiness audit

Phase 10 conducts a full-stack security and integration audit before release:

1. **Security & Session Invariants**:
   - Session cookies use `httpOnly: true`, `sameSite: "lax"`, and enforce `secure: true` in production.
   - CSRF tokens are generated using cryptographically random bytes and enforced on all state-changing owner mutations and logout.
   - Session identifiers are regenerated upon login, mitigating session fixation.
   - Password hashes use bcrypt with salt rounds; credentials are never printed or logged.
   - Rate limiting protects `/api/v1/auth/login` (5 per 15 min) and `/api/v1/reviews` POST (5 per 15 min).
   - Environment variables are strictly validated: production requires `MONGODB_URI`, HTTPS `CLIENT_ORIGIN`, and a `SESSION_SECRET` of >= 32 characters.
   - Helmet provides HTTP security headers, Express `x-powered-by` is disabled, request body limits are set to 1MB, and standard error envelopes prevent leakage of stack traces or internals.

2. **Route Alignment & Verification**:
   - Owner service endpoints verified as `GET|POST /api/v1/owner/services` and `GET|PATCH|DELETE /api/v1/owner/services/:id`, matching both backend router declarations and client API calls.
   - Fixed JSX semantic structure in `client/src/pages/ReviewsPage.jsx` where `<p>` was redundantly nested within `PageIntro`.

3. **Persistence Verification Status**:
   - Automated test suite results:
     - Backend tests: 30/30 passed.
     - Frontend tests: 19/19 passed.
     - Production build: succeeded with zero errors.
   - Live MongoDB persistence was **not verified** due to the absence of a running MongoDB instance in the development environment. Live persistence must be verified prior to production deployment.

