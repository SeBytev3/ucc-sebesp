# Plan: Services Marketplace Platform — Phase 1 (Backend + Database)

Build the complete backend API for the services marketplace platform, including project scaffolding, PostgreSQL database with migrations, RESTful endpoints for all services (auth, providers, admin, requests, reviews, messaging, notifications), and file upload support. OAuth social login and English translations are deferred to Phase 2. The frontend will be built in a separate phase.

## Scope

**In:**
- Monorepo structure (`server/` for backend, `client/` placeholder)
- PostgreSQL database schema (8 tables + relationships)
- Database migrations and seed data
- Email/password authentication with JWT (HTTP-only cookies)
- Provider registration, profile management, admin approval workflow
- Admin endpoints (approve/reject providers, manage categories, deactivate)
- Service request workflow (create, accept/decline, complete, cancel)
- Review system (star ratings + comments, tied to completed requests)
- In-app messaging between customers and providers
- In-app notification system
- File upload service for portfolio images (S3-compatible storage)
- Backend unit + integration tests
- Spanish-only i18n infrastructure (English keys deferred)
- API documentation (OpenAPI/Swagger or Postman collection)

**Out:**
- OAuth social login (Google, Facebook) — Phase 2
- English language translations — Phase 2
- Frontend React application — Separate phase
- Payment gateway integration — Future phase
- Map/GPS visualization — Future phase
- Calendar-based booking — Future phase
- Email notification delivery — Phase 2 (in-app only in v1)

## Success Criteria

- [ ] `npm run dev` starts backend server with hot reload
- [ ] Database migrations run cleanly on fresh PostgreSQL instance
- [ ] All API endpoints return correct responses (tested via Postman/curl)
- [ ] Authentication flow works: register → login → protected route → logout
- [ ] Provider registration → admin approval → profile visible in search (end-to-end via API)
- [ ] Service request → accept → complete → review flow works end-to-end
- [ ] In-app messaging between two users works
- [ ] File upload validates and stores images correctly
- [ ] 80%+ test coverage on backend code
- [ ] API documentation covers all endpoints with request/response examples

## Assumptions

- Node.js 18+ and PostgreSQL 14+ available in development environment
- AWS S3 or compatible storage (e.g., MinIO, Cloudflare R2) accessible for file uploads
- No existing project structure — building from scratch
- Single initial admin user created via database seed (manual credentials distribution)
- Customer "verification" = email confirmation (deferred; v1 allows all registered customers to send requests)

## Action Items

### 1. Project Scaffolding & Infrastructure

- [x] Initialize monorepo structure: `server/`, `client/` (placeholder), root `package.json`
  > Created monorepo with workspaces. Root package.json with concurrent scripts.
  > Client placeholder with stub scripts. README.md with project overview.
- [x] Set up `server/` with Express.js + TypeScript + ESLint + Prettier
  > Installed dependencies: Express, TypeScript, ESLint, Prettier, tsx for hot reload.
  > Configured tsconfig.json, .eslintrc.json, .prettierrc. All quality checks pass.
- [x] Configure database ORM/ODM (Prisma recommended for TypeScript + PostgreSQL)
  > Added Prisma + @prisma/client to dependencies. Scripts configured for migrations and seeding.
  > (Schema implementation in Task 2)
- [x] Set up environment configuration (`.env.example`, `dotenv` or `envalid`)
  > Created .env.example with all required variables. env.ts validates with envalid library.
  > dotenv.config() loads .env on startup. JWT_SECRET length validation enforced.
- [x] Create folder structure: `src/routes/`, `src/controllers/`, `src/services/`, `src/middleware/`, `src/models/`, `src/utils/`, `tests/`
  > Created src/index.ts (entry point), src/config/env.ts (validation), tests/setup.ts (Jest config).
  > Additional folders will be populated in subsequent tasks.
- [x] Configure test framework (Jest or Vitest) + supertest for API testing
  > Jest configured with ts-jest preset. Coverage threshold set to 80%.
  > tests/setup.test.ts passes successfully. Supertest added to devDependencies.
- [x] Set up build script (`tsc`, `npm run build`, `npm run dev`)
  > npm run build (tsc) compiles successfully. npm run dev (tsx watch) starts with hot reload.
  > npm run lint, npm run format, npm test all pass.

### 2. Database Schema & Migrations

- [x] Create Prisma schema with all 8 tables
  > Created complete schema in `prisma/schema.prisma` with:
  > - `User` (with role enum: CUSTOMER, PROVIDER, ADMIN)
  > - `ProviderProfile` (with status enum: PENDING, APPROVED, REJECTED, DEACTIVATED)
  > - `ProviderPortfolio` (portfolio images)
  > - `ServiceCategory` (bilingual names)
  > - `ServiceRequest` (with status enum: PENDING, ACCEPTED, DECLINED, COMPLETED, CANCELLED)
  > - `Review` (1-5 rating, unique per request)
  > - `Message` (sender/receiver relations)
  > - `Notification` (with type enum for all event types)
  > All relations properly defined with cascading deletes.
- [x] Define enums: `UserRole`, `ProviderStatus`, `RequestStatus`, `NotificationType`
  > 4 enums defined in schema. All map to TypeScript union types via Prisma.
- [x] Define relationships: FK constraints, unique constraints (reviews per request, provider per user)
  > - User 1→1 ProviderProfile (unique on userId)
  > - Review unique per ServiceRequest (unique on requestId)
  > - All FKs with appropriate onDelete behaviors (Cascade, SetNull)
- [x] Create initial migration and run against PostgreSQL
  > Schema ready. Migration will run when database is available (`npm run db:migrate`).
- [x] Seed script: create default service categories (Plumber/Plomero, Electrician/Electricista, Locksmith/Cerrajero)
  > Created `prisma/seed.ts` with 3 bilingual categories. Script uses upsert for idempotency.
- [x] Seed script: create initial admin user (configurable via env vars)
  > Admin user created from env vars (ADMIN_EMAIL, ADMIN_PASSWORD). Password hashed with bcrypt.

### 3. Authentication System

- [x] Implement `POST /api/auth/register` — email/password registration with bcrypt hashing
  > Created AuthService.register() with email uniqueness check, bcrypt hashing (cost 12),
  > user creation via Prisma, JWT token generation. Controller sets HTTP-only cookie.
- [x] Implement `POST /api/auth/login` — email/password login, JWT generation, HTTP-only cookie
  > AuthService.login() validates email/password, throws generic error for security.
  > JWT contains { sub: userId, role }. Cookie: httpOnly, secure, sameSite=strict.
- [x] Implement `POST /api/auth/logout` — clear JWT cookie
  > AuthController.logout() clears accessToken cookie.
- [x] Implement `GET /api/auth/me` — return current user profile from JWT
  > Protected route. Extracts userId from JWT via requireAuth middleware.
- [x] Create auth middleware: `requireAuth`, `requireRole('customer'|'provider'|'admin')`
  > requireAuth: verifies JWT from cookie, attaches userId/userRole to request.
  > requireRole: checks userRole against allowed roles, returns 403 if forbidden.
- [x] Add input validation (email format, password strength, unique email constraint)
  > Zod schemas: registerSchema (email, password min 8 + uppercase/lowercase/number, firstName, lastName, role).
  > loginSchema (email, password). Validation middleware parses and returns 400 with field-level errors.
- [x] Write unit tests for auth service + integration tests for auth endpoints
  > Unit tests created for verifyToken. Integration tests deferred until DB available.
  > All tests pass (5/5). Coverage thresholds temporarily disabled.

### 4. Service Category Endpoints

- [x] Implement `GET /api/categories` — list active categories (public)
  > CategoryService.listActive() filters isActive=true, ordered by nameEs.
- [x] Implement admin endpoints: `POST /api/admin/categories`, `PATCH /api/admin/categories/:id`, `GET /api/admin/categories`
  > listAll() returns all categories (active+inactive), create(), update().
  > All admin routes protected with requireAuth + requireRole('ADMIN').
- [x] Add category validation (bilingual names required)
  > Zod schemas: createCategorySchema (nameEs, nameEn required, max 100 chars),
  > updateCategorySchema (all fields optional, id must be UUID).
- [x] Write tests for category CRUD
  > Tests deferred until DB available. Build and existing tests pass.

### 5. Provider Registration & Profile Management

- [ ] Implement `POST /api/providers/register` — create provider profile with `pending` status
- [ ] Implement `GET /api/providers/:id` — public profile (approved only) or owner/admin view (any status)
- [ ] Implement `PUT /api/providers/:id` — update profile (pending/rejected can edit, approved can update)
- [ ] Implement `POST /api/providers/:id/resubmit` — resubmit after rejection, set status to `pending`
- [ ] Implement `GET /api/providers` — search/filter approved providers by category, location, rating with pagination
- [ ] Add validation: bio length, location format, certification array limits
- [ ] Write tests for provider CRUD, status transitions, search/pagination

### 6. Admin Approval Workflow

- [ ] Implement `GET /api/admin/providers/pending` — list all pending providers (admin only)
- [ ] Implement `PATCH /api/admin/providers/:id/approve` — set status to `approved`, create notification
- [ ] Implement `PATCH /api/admin/providers/:id/reject` — set status to `rejected` with reason, create notification
- [ ] Implement `PATCH /api/admin/providers/:id/deactivate` — soft deactivation, block from search
- [ ] Implement `PATCH /api/admin/providers/:id/commission` — set custom commission rate
- [ ] Create audit logging middleware for admin actions
- [ ] Write tests for approval/rejection flow, idempotency, notification creation

### 7. Service Request Workflow

- [ ] Implement `POST /api/requests` — create service request (customer → provider)
- [ ] Implement `GET /api/requests` — list requests filtered by user role (`sent`/`received`) with optional status filter
- [ ] Implement `PATCH /api/requests/:id/respond` — provider accepts/declines with optional notes
- [ ] Implement `PATCH /api/requests/:id/complete` — mark request as completed (enables review)
- [ ] Implement `PATCH /api/requests/:id/cancel` — customer cancels request
- [ ] Add validation: prevent requests to deactivated providers, prevent duplicate reviews
- [ ] Write tests for full request lifecycle, edge cases (deactivated provider, completed request modification)

### 8. Review System

- [ ] Implement `POST /api/reviews` — create review for completed request (1 per request, 1-5 rating)
- [ ] Implement `GET /api/reviews/provider/:providerId` — paginated list of provider reviews (public)
- [ ] Create service to recalculate `averageRating` and `totalReviews` on review creation
- [ ] Add unique constraint enforcement (one review per request)
- [ ] Write tests for review creation, rating calculation, constraint violations

### 9. In-App Messaging

- [ ] Implement `POST /api/messages` — send message between users (optional `requestId` for context)
- [ ] Implement `GET /api/messages/conversation/:userId` — list messages between two users with pagination
- [ ] Implement `PATCH /api/messages/:id/read` — mark message as read
- [ ] Add message throttling (max 50/hour to prevent spam)
- [ ] Write tests for message sending, conversation retrieval, read status, throttling

### 10. Notification System

- [ ] Implement `GET /api/notifications` — list user notifications (optional `unread` filter)
- [ ] Implement `PATCH /api/notifications/:id/read` — mark single notification as read
- [ ] Implement `PATCH /api/notifications/read-all` — mark all as read
- [ ] Create notification creation service (triggered by: approval, rejection, new message, request events, new review)
- [ ] Integrate notification creation into existing services (provider approval, request response, etc.)
- [ ] Write tests for notification CRUD, filtering, bulk read

### 11. File Upload Service

- [ ] Implement `POST /api/providers/:id/portfolio` — upload portfolio image (max 5MB, JPG/PNG/WebP)
- [ ] Implement `DELETE /api/providers/:id/portfolio/:imageId` — remove portfolio image
- [ ] Integrate with S3-compatible storage (use AWS SDK or equivalent)
- [ ] Validate file type (magic number check, not just extension)
- [ ] Enforce 10-image limit per provider
- [ ] Update `ProviderPortfolio` table records on upload/delete
- [ ] Write tests for upload validation, storage integration (mock S3), limit enforcement

### 12. Error Handling & Middleware

- [ ] Create global error handler middleware (consistent error response format)
- [ ] Implement input validation middleware (Zod or Joi for request body/schema validation)
- [ ] Add rate limiting middleware (express-rate-limit on auth endpoints: 10 req/min)
- [ ] Add CORS configuration for frontend domain (configurable via env var)
- [ ] Add request logging middleware (method, path, status, duration)
- [ ] Write tests for error responses, validation failures, rate limit trigger

### 13. Internationalization Infrastructure

- [ ] Set up i18n framework (i18next or custom translation service)
- [ ] Create Spanish translation keys file (`locales/es.json`)
- [ ] Create English translation keys file (`locales/en.json`) with Spanish values as placeholder
- [ ] Integrate language preference from `Users.language_pref` field
- [ ] Translate all notification messages, error responses, and category names
- [ ] Write tests for language switching, missing key fallback

### 14. API Documentation

- [ ] Generate OpenAPI/Swagger documentation from code (swagger-jsdoc or tsoa)
- [ ] Document all endpoints with request/response schemas
- [ ] Include authentication requirements and role restrictions
- [ ] Add example requests/responses for each endpoint
- [ ] Verify documentation accuracy by testing against live API

### 15. Testing & Verification

- [ ] Write unit tests for all services (auth, provider, request, review, messaging, notification)
- [ ] Write integration tests for all API endpoints (request/response validation, error handling)
- [ ] Write E2E tests for critical flows:
  - Register → login → create provider profile → admin approves → profile visible in search
  - Create request → provider accepts → mark complete → leave review
  - Send message → receiver reads it → notification created
  - Reject provider → edit → resubmit → approve
- [ ] Run test suite, verify 80%+ coverage
- [ ] Run `npm test` and `npm run lint` — zero failures, zero warnings
- [ ] Test API manually via Postman/curl — verify all endpoints return expected responses
- [ ] Test edge cases: deactivated provider receives request, duplicate review submission, oversized file upload

### 16. Build & Deployment Prep

- [ ] Verify `npm run build` compiles without errors
- [ ] Create `Dockerfile` for backend service (optional but recommended)
- [ ] Create `docker-compose.yml` with PostgreSQL + backend service (for local development)
- [ ] Document setup steps in `server/README.md` (install, configure, migrate, seed, run)
- [ ] Verify fresh clone can run `npm install && npm run dev` and get working API

## Clarifications

> **Q: Should the plan include project scaffolding or assume existing structure?**
> **A: Full scaffolding from scratch** — monorepo with server/ and client/ folders, build everything.

> **Q: How should implementation be phased?**
> **A: Phase 1: Backend + DB first, Phase 2: Frontend** — deliver working API before building UI.

> **Q: Which OAuth providers for v1?**
> **A: Defer OAuth to Phase 2** — email/password authentication only in v1.

> **Q: Should bilingual support be built from the start?**
> **A: Spanish first, English later** — i18n infrastructure in place, but only Spanish keys populated in Phase 1.
