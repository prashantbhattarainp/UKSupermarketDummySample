# Deepak Supermarket - Your Neighbourhood Grocery Store

Fictional demonstration supermarket using a reusable MERN-style structure for a London neighbourhood grocery business.

## Project structure

- `client/`: the public React + Vite frontend that is already working independently.
- `server/`: the Express + MongoDB backend foundation for future catalogue and service APIs.
- `PROJECT_PLAN.md`: the approved architecture, API design, and product boundaries.
- `client/src/data/storeConfig.js`: central Deepak Supermarket identity and public-facing sample content.
- `client/src/data/catalogueData.js`: demo catalogue categories and products used by the frontend.
- `client/src/data/promotionsData.js`: demo promotions for the public offers page.

## Frontend scope

The public frontend uses the backend for the catalogue when available and keeps fictional sample data as a graceful fallback. Phase 5 adds a separate protected owner area without public registration or catalogue mutation.

## Phase 4 update: Mongo-backed catalogue

Phase 4 adds the database-backed catalogue layer while keeping the frontend and backend independently runnable:

- read-only category and product endpoints under `/api/v1`
- MongoDB-backed category and product queries with validation and pagination
- consistent response envelope and error handling
- seed script for importing the existing fictional product catalogue
- React frontend layer updated to fetch catalogue data from the Express API
- loading, empty, error, and retry states in the public catalogue flow

The existing public site does not implement checkout or customer accounts. Owner authentication is isolated to the `/owner` route group.

## Phase 5 update: owner authentication

Phase 5 adds:

- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `GET /api/v1/auth/csrf`, and `POST /api/v1/auth/logout`
- HTTP-only, SameSite session cookies with server-side session data
- MongoDB-backed sessions when `MONGODB_URI` is configured; the in-memory store is only available outside production
- bcrypt password hashes, active-account checks, and the `owner` role
- CSRF token enforcement for logout and login rate limiting
- one-time owner provisioning through `npm run provision:owner`
- protected `/owner`, `/owner/products`, and `/owner/categories` frontend routes

There is no public registration, password reset, product CRUD, or category CRUD in this phase.

## Phase 6 update: owner catalogue management

Phase 6 makes the protected owner catalogue screens functional:

- product list, search, category/status filters, pagination, create, edit, and soft deactivation
- category list, create, edit, display ordering, and safe deactivation
- strict server-side field whitelisting and validation for names, slugs, prices, image paths, booleans, identifiers, and category references
- duplicate slug conflicts returned as `409` responses with field feedback
- product prices accepted as GBP values and stored as integer `priceMinor` units
- inactive products excluded by the existing public catalogue queries
- category deactivation blocked while any product still references the category

Protected management endpoints:

```text
GET|POST /api/v1/owner/products
GET|PATCH|DELETE /api/v1/owner/products/:id
GET|POST /api/v1/owner/categories
GET|PATCH|DELETE /api/v1/owner/categories/:id
```

All state-changing owner requests require the Phase 5 CSRF token. Product deletion is deliberately a soft deactivation; category deletion is also deactivation and returns `409 CATEGORY_IN_USE` until all product references are moved or removed in a future workflow.

## Phase 7 update: promotions management

Promotions are now stored in MongoDB through the `Promotion` model. Supported discount modes are:

- `percentage`: a positive percentage from greater than `0` through `100`
- `fixed_price`: a positive GBP promotional price stored as integer `promotionalPriceMinor`

Only one discount mode is accepted per promotion. Dates use `YYYY-MM-DD`, are stored as UTC dates, and public visibility uses an inclusive window: `startDate <= current time <= endDate`. Public promotions must also be active and may not reference inactive products or categories.

Public endpoint:

```text
GET /api/v1/promotions
```

Owner endpoints:

```text
GET|POST /api/v1/owner/promotions
GET|PATCH|DELETE /api/v1/owner/promotions/:id
```

Owner mutations use the existing authenticated session and CSRF token. Promotion deletion is a soft deactivation. The public `/offers` page now uses the API and shows loading, error, and empty states; scheduled and expired promotions remain available only in the owner view.

## Required software

- Node.js 18+
- npm
- MongoDB locally or a valid MongoDB instance for database-backed runs

## Frontend setup

Create a local frontend env file if needed:

```powershell
cd client
copy .env.example .env
```

Then run the public frontend in isolation:

```powershell
cd client
npm install
npm run dev
```

Useful frontend checks:

```powershell
cd client
npm test
npm run build
```

The frontend expects the backend at `VITE_API_BASE_URL` and defaults to `http://localhost:5000/api/v1`.

## Backend setup

Create a local environment file from the example file:

```powershell
cd server
copy .env.example .env
```

Then update `.env` with a valid MongoDB URI and local origin settings. For local development, the default values are:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/deepak-supermarket-demo
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace-with-at-least-32-random-characters
SESSION_COOKIE_NAME=deepak.sid
SESSION_TTL_MS=28800000
```

`SESSION_SECRET` must be a unique random value of at least 32 characters. Production also requires an HTTPS `CLIENT_ORIGIN`, `MONGODB_URI`, and the session secret. Never place secrets in Vite variables or commit a populated `.env` file.

Start the backend:

```powershell
cd server
npm install
npm run dev
```

For production-style startup:

```powershell
cd server
npm start
```

## Health check

The API health endpoint is:

```text
GET http://localhost:5000/api/v1/health
```

Expected response shape:

```json
{
  "data": {
    "application": "running",
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-10-10T00:00:00.000Z"
  },
  "meta": {},
  "error": null
}
```

If MongoDB is unavailable, the endpoint returns a `503` response with the database state set to `disconnected`.

## Catalogue API

Available read-only catalogue routes:

```text
GET /api/v1/categories
GET /api/v1/categories/:slug
GET /api/v1/products?search=milk&category=fresh-fruit&minPrice=1.00&maxPrice=3.00&sort=price-asc&page=1&limit=12
GET /api/v1/products/:slug
```

Supported product query parameters:

- `search`: product name or description lookup
- `category`: category slug
- `minPrice`: minimum GBP price, converted to minor units internally
- `maxPrice`: maximum GBP price, converted to minor units internally
- `sort`: `featured`, `name-asc`, `price-asc`, `price-desc`
- `page`: positive integer page index
- `limit`: positive integer with a maximum of 50

API responses use the standard envelope:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

## Seed the MongoDB catalogue

From the server folder:

```powershell
cd server
copy .env.example .env
npm install
npm run seed:catalogue
```

The script reuses the existing frontend catalogue contents from `client/src/data/catalogueData.js` and upserts category and product records by slug. It does not delete unrelated data.

To seed the fictional promotion examples after the catalogue seed:

```powershell
cd server
npm run seed:promotions
```

The promotion seed uses the existing `client/src/data/promotionsData.js` records and supplies clearly fictional percentage/fixed-price values. It upserts by slug and does not delete unrelated records.

To seed the fictional store details and weekly hours:

```powershell
cd server
npm run seed:store
```

The command imports the clearly labelled demo values from `client/src/data/storeConfig.js`. It creates one canonical `default` settings record and does not claim the address or contact details are verified.

## Phase 8 update: store information management

Store settings, weekly hours, exceptional dates, and services are now API-backed. Public routes are `GET /api/v1/store`, `GET /api/v1/store/hours`, and `GET /api/v1/services`. Owner routes are under `/api/v1/owner/store` and require the existing owner session and CSRF token for mutations. Services are soft-deactivated and only active services are public. Exceptional dates are unique `YYYY-MM-DD` values with either a closure or validated opening and closing times.

## Phase 9 update: customer reviews and moderation

Reviews are stored in MongoDB with `pending`, `approved`, and `rejected` moderation statuses. Public submissions are validated, rate-limited, and always created as pending. Public reads return approved reviews only. Owner moderation is available at `/owner/reviews` and uses the existing owner session, role authorization, and CSRF protection.

Review endpoints:

```text
GET|POST /api/v1/reviews
GET /api/v1/owner/reviews
GET /api/v1/owner/reviews/:id
PATCH|DELETE /api/v1/owner/reviews/:id
```

Reviewers do not need customer accounts. Reviewer name and comment are required, ratings must be integers from 1 to 5, and optional product references must resolve to existing products. Rejected and pending reviews never appear publicly.

## Provision the initial owner

After configuring the server environment and starting MongoDB, run:

```powershell
cd server
npm run provision:owner
```

The command prompts for the email, display name, and password without accepting passwords in command-line arguments. Passwords must be at least 12 characters, are hashed with bcrypt before storage, and are never printed. Existing email addresses are rejected without changing the account, so rerunning the command is non-destructive.

The browser obtains a CSRF token from `GET /api/v1/auth/csrf` and sends it as `X-CSRF-Token` for logout. Session identifiers remain in HTTP-only cookies and are never stored in localStorage.

## Testing

Run backend tests:

```powershell
cd server
npm test
```

Run frontend tests:

```powershell
cd client
npm test
```

The backend test suite is designed to work without a cloud database. It validates app startup wiring, route errors, malformed JSON, config validation, catalogue behavior, session persistence, generic authentication failures, disabled-account rejection, CSRF enforcement, logout invalidation, login rate limiting, protected owner management routing, price validation, and category reference safety.

## Phase 10 update: security, integration and release readiness audit

Phase 10 provides a comprehensive audit, verification, and targeted fix for security, integration, and release readiness:

- **Security & Session Hardening**:
  - Validated HTTP-only, SameSite (`lax`), and production HTTPS-enforced session cookies (`deepak.sid`).
  - Validated CSRF token issuance (`GET /api/v1/auth/csrf`) and enforcement on all state-changing owner mutations and logout.
  - Confirmed session regeneration upon successful login to prevent session fixation attacks.
  - Rate limiting enforced on login attempts (5 per 15 minutes) and public review submissions (5 per 15 minutes).
  - Passwords hashed using bcrypt; credentials are never printed or logged.
  - Production environment variable enforcement rejects missing `MONGODB_URI`, non-HTTPS `CLIENT_ORIGIN`, or `SESSION_SECRET` shorter than 32 characters.
  - Helmet enabled for secure HTTP headers, `x-powered-by` disabled, CORS allowlist enforced, body parsing restricted to 1MB, and generic error envelopes avoid leaking internal stack traces or database details.
- **Service & Store Content Route Audit**:
  - Inspected and confirmed that owner service endpoints follow the canonical REST design:
    - `GET /api/v1/owner/services`
    - `POST /api/v1/owner/services`
    - `GET /api/v1/owner/services/:id`
    - `PATCH /api/v1/owner/services/:id`
    - `DELETE /api/v1/owner/services/:id`
  - Verified client `ownerCatalogueApi.js` aligns with these endpoints.
- **Review Submission & Moderation**:
  - Reviews default to `pending` upon public submission; status cannot be mass-assigned.
  - Public `/reviews` queries return only approved reviews; pending/rejected reviews remain private.
  - Fixed HTML hierarchy defect in `client/src/pages/ReviewsPage.jsx` where `<p>` was redundantly nested inside `PageIntro`.
- **Database & Persistence Verification**:
  - Local environment check: MongoDB is **not installed or running** in this execution environment (`mongod` command not available).
  - Automated backend tests (30/30 passed) and frontend tests (19/19 passed) utilize in-memory mock isolation.
  - **Live MongoDB persistence has NOT been verified** due to the absence of a running MongoDB instance in the test environment.
  - Testing against a live database must be performed in an environment with a running MongoDB service using `npm run seed:store`, `npm run seed:catalogue`, `npm run seed:promotions`, and `npm run provision:owner`.

## Release readiness & known limitations

- **Live MongoDB Verification**: Needs execution in an environment with a running MongoDB instance before production deployment.
- **Ordering & Checkout**: Intentionally excluded from the current scope; the site functions as a local supermarket showcase, enquiry, and review platform.
- **Fictional Content**: All sample products, promotions, opening hours, and store details are fictional templates and must be replaced with genuine business details by the store owner.
- **Production Deployment Prerequisites**:
  - Set strong random `SESSION_SECRET` (at least 32 characters).
  - Configure production `MONGODB_URI` with TLS.
  - Configure HTTPS `CLIENT_ORIGIN`.
  - Provision owner account via interactive `npm run provision:owner`.
  - Populate catalogue, store settings, and opening hours via seed scripts or owner dashboard.

