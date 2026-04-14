# Spec: Services Marketplace Platform

A bilingual web platform connecting service providers (plumbers, electricians, locksmiths) with customers who need their services, featuring admin-approved provider registrations, rich provider profiles, in-app messaging, and a commission-based business model.

## Background

**Problem**: Finding reliable tradespeople (plumbers, electricians, locksmiths) is currently a fragmented process relying on word-of-mouth, social media posts, or scattered online directories. Customers struggle to verify provider quality, and providers lack a centralized platform to showcase their work and reach customers.

**Current State**: No unified platform exists in the local market that combines provider verification, portfolio display, service request management, and customer reviews in one place.

**Trigger**: Local demand for a trusted, curated marketplace where providers must be vetted by administrators before offering services, ensuring quality and trust for customers.

**Related Work**: Traditional directories and classifieds platforms exist but lack the verification workflow, review system, and structured service request flow proposed here.

## Goals

**Primary Goal**:
- Enable customers to discover, evaluate, and request services from verified providers (plumbers, electricians, locksmiths) through a trusted platform with admin-approved registrations

**Secondary Goals**:
- Allow providers to showcase their work through rich profiles with portfolios, certifications, and availability
- Implement a rating and review system to build trust and quality signals
- Provide in-app messaging for provider-customer communication
- Support service request workflow (customer sends request → provider accepts/declines)
- Enable extensible service category management (admin can add new categories)
- Support bilingual interface (Spanish/English) with auto-detection and manual override

## Non-Goals

- **Payment processing**: Commission tracking will be implemented, but actual payment gateway integration (Stripe, PayPal) is deferred to a future phase
- **Real-time GPS tracking**: Map visualization is optional; no live tracking of providers
- **Calendar-based booking**: Simple request/accept workflow only; no time-slot scheduling in v1
- **Provider subscription management**: Platform uses commission model, not subscription-based
- **Mobile native apps**: Web-only responsive application
- **Advanced analytics dashboard**: Basic stats only; no complex reporting in v1

## Design

### Technical Approach

**Architecture**: Client-server SPA with RESTful API

- **Frontend**: React 18+ with TypeScript, React Router for navigation, context API/Redux for state management
- **Backend**: Node.js with Express.js, RESTful API design
- **Database**: PostgreSQL for relational data (users, services, reviews, requests, messages)
- **Authentication**: JWT in HTTP-only cookies + OAuth 2.0 for social login (Google, Facebook)
- **File Storage**: Cloud storage (AWS S3 or equivalent) for provider portfolio images
- **Internationalization**: `react-intl` or `i18next` for bilingual support (Spanish/English)

**Key Components**:

| Component | Responsibility |
|-----------|----------------|
| Auth Service | User registration, login, JWT management, OAuth integration |
| Provider Service | Registration submission, profile management, admin approval workflow |
| Search Service | Provider discovery by category, location, rating |
| Request Service | Service request creation, status tracking, accept/decline flow |
| Messaging Service | In-app messaging between customers and providers |
| Review Service | Star ratings and written reviews for completed services |
| Admin Dashboard | Provider approval/rejection, category management, user moderation |
| Notification Service | In-app notifications for key events (approval, new message, request status) |

**Rationale**: React + Node.js + PostgreSQL provides a full-stack JavaScript ecosystem with strong community support, type safety via TypeScript, and relational data modeling that fits the domain (users → providers → services → requests → reviews).

### Data Model

**Users Table**:
```
id: UUID (PK)
email: VARCHAR(255) UNIQUE NOT NULL
password_hash: VARCHAR(255) NULL (NULL for OAuth-only users)
first_name: VARCHAR(100) NOT NULL
last_name: VARCHAR(100) NOT NULL
phone: VARCHAR(20)
role: ENUM('customer', 'provider', 'admin') NOT NULL
language_pref: ENUM('es', 'en') DEFAULT 'es'
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Provider_Profiles Table**:
```
id: UUID (PK)
user_id: UUID (FK → Users.id) UNIQUE NOT NULL
service_category_id: UUID (FK → Service_Categories.id) NOT NULL
bio: TEXT
location_city: VARCHAR(100)
location_region: VARCHAR(100)
location_lat: DECIMAL(10, 8) NULL
location_lng: DECIMAL(11, 8) NULL
certifications: TEXT [] (array of certification descriptions)
availability_notes: TEXT
status: ENUM('pending', 'approved', 'rejected', 'deactivated') DEFAULT 'pending'
rejection_reason: TEXT NULL
commission_rate: DECIMAL(5, 2) DEFAULT platform_default
average_rating: DECIMAL(3, 2) DEFAULT 0.00
total_reviews: INT DEFAULT 0
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Provider_Portfolio Table**:
```
id: UUID (PK)
provider_id: UUID (FK → Provider_Profiles.id) NOT NULL
image_url: VARCHAR(500) NOT NULL
caption: VARCHAR(255) NULL
display_order: INT DEFAULT 0
created_at: TIMESTAMP
```

**Service_Categories Table**:
```
id: UUID (PK)
name_es: VARCHAR(100) NOT NULL
name_en: VARCHAR(100) NOT NULL
description_es: TEXT
description_en: TEXT
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP
```

**Service_Requests Table**:
```
id: UUID (PK)
customer_id: UUID (FK → Users.id) NOT NULL
provider_id: UUID (FK → Provider_Profiles.id) NOT NULL
category_id: UUID (FK → Service_Categories.id) NOT NULL
description: TEXT NOT NULL
status: ENUM('pending', 'accepted', 'declined', 'completed', 'cancelled') DEFAULT 'pending'
provider_response_notes: TEXT NULL
requested_at: TIMESTAMP
responded_at: TIMESTAMP NULL
completed_at: TIMESTAMP NULL
```

**Reviews Table**:
```
id: UUID (PK)
request_id: UUID (FK → Service_Requests.id) UNIQUE NOT NULL
customer_id: UUID (FK → Users.id) NOT NULL
provider_id: UUID (FK → Provider_Profiles.id) NOT NULL
rating: INT (1-5) NOT NULL
comment: TEXT NULL
created_at: TIMESTAMP
```

**Messages Table**:
```
id: UUID (PK)
request_id: UUID (FK → Service_Requests.id) NULL
sender_id: UUID (FK → Users.id) NOT NULL
receiver_id: UUID (FK → Users.id) NOT NULL
content: TEXT NOT NULL
is_read: BOOLEAN DEFAULT false
created_at: TIMESTAMP
```

**Notifications Table**:
```
id: UUID (PK)
user_id: UUID (FK → Users.id) NOT NULL
type: ENUM('provider_approved', 'provider_rejected', 'new_message', 'request_received', 'request_accepted', 'request_declined', 'new_review') NOT NULL
message_es: VARCHAR(500) NOT NULL
message_en: VARCHAR(500) NOT NULL
is_read: BOOLEAN DEFAULT false
link_url: VARCHAR(255) NULL
created_at: TIMESTAMP
```

**Relationships**:
- Users 1→1 Provider_Profiles (for providers)
- Users 1→N Service_Requests (as customer)
- Provider_Profiles 1→N Service_Requests (as provider)
- Service_Requests 1→1 Reviews
- Users 1→N Messages (as sender or receiver)
- Service_Categories 1→N Provider_Profiles

**Migration Strategy**: Initial schema creation via migration tool (e.g., Prisma, Knex, or Sequelize migrations). Seed data for initial service categories (Plumber/Plomero, Electrician/Electricista, Locksmith/Cerrajero).

### API

**Authentication Endpoints**:
```
POST /api/auth/register
  - Body: { email, password, firstName, lastName, phone, role }
  - Creates user account, sends verification email (optional)
  
POST /api/auth/login
  - Body: { email, password }
  - Response: { user: { id, email, role, languagePref } }
  - Sets JWT in HTTP-only cookie

POST /api/auth/oauth/:provider
  - OAuth flow initiation (Google, Facebook)
  - Redirects to provider, handles callback, creates/logs in user

POST /api/auth/logout
  - Clears JWT cookie

GET /api/auth/me
  - Returns current user profile
  - Requires authentication
```

**Provider Endpoints**:
```
POST /api/providers/register
  - Body: { categoryId, bio, locationCity, locationRegion, certifications, availabilityNotes }
  - Creates provider profile with 'pending' status
  - Requires authentication (user role = 'provider')
  - Creates notification for admins

GET /api/providers/:id
  - Returns public provider profile (portfolio, rating, services)
  - Only returns 'approved' providers to public
  - Returns 'pending'/'rejected' to owning user and admins

PUT /api/providers/:id
  - Updates provider profile
  - Pending/rejected providers can edit and resubmit
  - Approved providers can update (no re-review needed)

POST /api/providers/:id/resubmit
  - Submits edited profile for admin review after rejection
  - Changes status back to 'pending'

GET /api/providers
  - Query: { category?, city?, minRating?, sort? }
  - Returns paginated list of approved providers
  - Public endpoint
```

**Admin Endpoints**:
```
GET /api/admin/providers/pending
  - Returns all pending provider registrations
  - Requires admin role

PATCH /api/admin/providers/:id/approve
  - Body: { } (no body needed)
  - Approves provider, sends notification

PATCH /api/admin/providers/:id/reject
  - Body: { reason: string }
  - Rejects provider with reason, sends notification

PATCH /api/admin/providers/:id/deactivate
  - Soft-deactivates provider (hides from search, disables new requests)

GET /api/admin/categories
  - Returns all service categories

POST /api/admin/categories
  - Body: { nameEs, nameEn, descriptionEs, descriptionEn }
  - Creates new service category

PATCH /api/admin/providers/:id/commission
  - Body: { commissionRate: number }
  - Sets custom commission rate for provider
```

**Service Request Endpoints**:
```
POST /api/requests
  - Body: { providerId, categoryId, description }
  - Creates service request with 'pending' status
  - Requires verified customer (see Open Questions)
  - Notifies provider

GET /api/requests
  - Query: { role?: 'sent' | 'received', status? }
  - Returns requests filtered by user's role (customer or provider)

PATCH /api/requests/:id/respond
  - Body: { action: 'accept' | 'decline', notes? }
  - Provider responds to request
  - Notifies customer

PATCH /api/requests/:id/complete
  - Marks request as completed (by customer or provider)
  - Enables review submission

PATCH /api/requests/:id/cancel
  - Cancels request (by customer)
```

**Review Endpoints**:
```
POST /api/reviews
  - Body: { requestId, rating, comment }
  - Creates review for completed request
  - Only allowed once per request
  - Updates provider's averageRating

GET /api/reviews/provider/:providerId
  - Returns paginated reviews for provider
  - Public endpoint
```

**Messaging Endpoints**:
```
POST /api/messages
  - Body: { receiverId, requestId?, content }
  - Sends message to provider or customer
  - Creates notification for receiver

GET /api/messages/conversation/:userId
  - Returns messages between current user and specified user
  - Optional requestId filter

PATCH /api/messages/:id/read
  - Marks message as read
```

**Notification Endpoints**:
```
GET /api/notifications
  - Returns user's notifications, paginated
  - Query: { unread?: boolean }

PATCH /api/notifications/:id/read
  - Marks notification as read

PATCH /api/notifications/read-all
  - Marks all user's notifications as read
```

**Error Responses** (all endpoints):
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT",
    "message": "Human-readable error description",
    "details": {} // Optional field-level validation errors
  }
}
```

### UI/UX

**Key User Flows**:

**1. Provider Registration**:
```
Landing page → Click "Offer Services" → 
Choose service category → Fill registration form (bio, location, certifications, availability, upload portfolio photos) → 
Submit → "Pending Approval" screen → Wait for admin review
```

**2. Admin Approval Workflow**:
```
Admin login → Dashboard shows pending providers count → 
Click pending list → Review provider profile (bio, portfolio, certifications) → 
Click "Approve" or "Reject" → If reject, enter reason → 
Confirmation modal → Provider notified
```

**3. Customer Finding Provider**:
```
Landing page → Browse categories or search → 
Filter by location, rating → View provider list → 
Click provider profile → View portfolio, reviews → 
Click "Request Service" → Fill request form (description of need) → 
Submit → Wait for provider response
```

**4. Provider Responding to Request**:
```
Provider login → Notification badge shows new request → 
View request details → Click "Accept" or "Decline" → 
Optional: add response notes → Customer notified
```

**5. Customer Leaving Review**:
```
After request marked complete → Prompt to review → 
Select star rating (1-5) → Write optional comment → 
Submit review → Provider profile updated
```

**UI States**:

| State | Behavior |
|-------|----------|
| Loading | Skeleton loaders for profiles, lists, forms |
| Empty | Friendly illustration + CTA (e.g., "No providers yet—be the first!") |
| Error | Clear error message with retry action |
| Success | Confirmation toast/notification, redirect to relevant page |
| Pending approval | Banner: "Your registration is under review" |
| Rejected | Banner with rejection reason, "Edit and Resubmit" button |

**Responsive Design**:
- Mobile-first approach (providers and customers likely to use mobile devices)
- Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly buttons and navigation
- Collapsible navigation on mobile

**Accessibility**:
- WCAG 2.1 AA compliance target
- Semantic HTML, ARIA labels for interactive elements
- Keyboard navigation support
- Sufficient color contrast (4.5:1 minimum)
- Alt text for portfolio images
- Form labels and error messages

## Edge Cases & Error Handling

**Invalid Inputs**:
- Email validation (RFC 5322 regex) on registration
- Phone number format validation (flexible, international support)
- Star rating must be 1-5 integer
- Portfolio images: max 5MB, JPG/PNG/WebP only, server-side validation
- Description fields: max length limits (bio: 2000 chars, message: 1000 chars)

**Race Conditions**:
- Provider approval while already approved by another admin: idempotent operation, check status before update
- Multiple reviews for same request: unique constraint on `request_id` in Reviews table
- Message sending to deactivated provider: block with error message
- Service request to deactivated provider: prevent creation

**Network Failures**:
- API request retries (3 attempts with exponential backoff) for critical operations
- Optimistic UI updates with rollback on failure
- Form data preserved on submission failure (don't clear inputs)

**Partial Failures**:
- Image upload fails but profile created: allow retry without re-submitting profile
- Notification fails but primary action succeeds: log error, don't block user action
- Review submission fails after request completed: retry mechanism, preserve comment

**Resource Limits**:
- Portfolio images: max 10 per provider
- Pagination on all list endpoints (default 20, max 100 per page)
- Rate limiting on authentication endpoints (10 requests/minute)
- Message throttling (max 50 messages/hour to prevent spam)

**Provider Rejection & Resubmission**:
- Rejected provider edits profile: changes saved but status remains 'pending' until explicitly resubmitted
- Admin rejects again: new rejection reason overwrites previous
- Provider account deleted while pending: cascade delete profile and notifications

## Security & Privacy

**Data Sensitivity**:
- **PII**: Email, phone, name, location stored for all users; encrypted at rest
- **Passwords**: Bcrypt hashing (cost factor 12+), never stored in plaintext
- **JWT**: HTTP-only, Secure, SameSite=Strict cookies; 24-hour expiration
- **OAuth tokens**: Not stored server-side; only user identity from provider
- **Portfolio images**: May contain provider's home/work location; providers informed during upload

**Attack Vectors**:
- **XSS**: React's automatic escaping + Content Security Policy headers; no `dangerouslySetInnerHTML` without sanitization
- **CSRF**: SameSite cookies + CSRF token on state-changing mutations
- **SQL Injection**: Parameterized queries via ORM (Prisma/Sequelize); no raw queries
- **File Upload**: Image validation (magic number check, not just extension); scan for malware if possible; store in cloud bucket with restricted access
- **Rate Limiting**: Express-rate-limit on auth endpoints; message throttling
- **IDOR**: All endpoints check user ownership/role before returning data

**Authorization Model**:
```
Public:
  - Browse approved providers
  - View provider profiles (public info only)
  - Register new account

Customer (authenticated):
  - All public actions
  - Send service requests (if verified)
  - Message providers
  - Leave reviews for completed requests

Provider (authenticated, approved):
  - All customer actions
  - Receive and respond to requests
  - Update own profile
  - Upload portfolio images

Admin (authenticated):
  - All provider actions
  - Approve/reject provider registrations
  - Deactivate providers
  - Manage service categories
  - View platform stats
```

**Audit & Logging**:
- All admin actions logged (approve, reject, deactivate, category changes)
- Audit log: `{ adminId, action, targetId, timestamp, metadata }`
- Failed login attempts logged (rate limit trigger)
- No sensitive data (passwords, tokens) in logs

**Privacy Considerations**:
- Users can delete their accounts (soft delete with 30-day grace period)
- Provider profiles visible only when approved
- Customer contact info not exposed to providers (communication via in-app messaging only)
- GDPR-style data export/deletion requests (manual process in v1)

## Testing Strategy

**Unit Tests**:
- Authentication service: registration, login, OAuth flow, JWT generation/validation
- Provider service: approval/rejection logic, status transitions, resubmission
- Review service: rating calculation, unique constraint enforcement
- Validation logic: email format, phone format, image upload constraints
- Authorization middleware: role-based access checks

**Integration Tests**:
- API endpoints: request/response validation, error handling, pagination
- Database operations: transactions, constraints (unique reviews, foreign keys)
- File upload: image validation, storage integration (mock S3)
- Notification creation: triggered by approval, rejection, messages, requests

**E2E Tests (Critical Flows)**:
1. Provider registration → admin approval → profile visible in search
2. Provider rejection → edit → resubmit → approval
3. Customer registration → search provider → send request → provider accepts → mark complete → leave review
4. Admin adds new category → provider registers under new category
5. In-app messaging between customer and provider
6. Deactivated provider hidden from search, cannot receive new requests

**Manual Testing**:
- Responsive design across mobile (320px), tablet (768px), desktop (1024px+)
- Language toggle (Spanish/English) on all pages
- Accessibility audit (keyboard navigation, screen reader compatibility)
- Image upload edge cases (wrong format, oversized, corrupted files)
- Concurrent admin approvals (race condition testing)

**Test Coverage Target**: 80%+ line coverage on backend, 70%+ on frontend

## Success Criteria

**Functional**:
- [ ] Users can register/login with email/password or OAuth (Google, Facebook)
- [ ] Providers can submit registration with profile, portfolio, and certifications
- [ ] Admins can view pending providers and approve/reject with reason
- [ ] Approved providers appear in searchable, filterable list
- [ ] Customers can send service requests to providers
- [ ] Providers can accept/decline requests with optional notes
- [ ] Customers can leave star ratings + written reviews for completed services
- [ ] In-app messaging works between customers and providers
- [ ] Providers can upload portfolio images (up to 10)
- [ ] Admins can add new service categories
- [ ] Admins can soft-deactivate providers
- [ ] Rejected providers can edit and resubmit applications
- [ ] Interface switches between Spanish and English
- [ ] Language auto-detected from browser with manual override
- [ ] In-app notifications for key events (approval, messages, requests, reviews)

**Performance**:
- [ ] Provider search returns results in < 500ms (with 1000 providers in DB)
- [ ] Page load time < 2 seconds on 3G connection (Lighthouse score > 80)
- [ ] Image uploads complete within 5 seconds (5MB image)

**Quality**:
- [ ] 80%+ backend test coverage, 70%+ frontend
- [ ] All E2E critical flows pass
- [ ] Zero critical security vulnerabilities (OWASP Top 10)
- [ ] WCAG 2.1 AA audit passes (no critical accessibility issues)

## Open Questions

- [ ] **Customer verification requirement**: Spec states "verified customers only" can send requests. What constitutes "verified"? Email verification? Phone verification? Admin approval? Admin approval seems excessive for customers; email verification recommended.
- [ ] **Commission tracking & billing**: How is the commission collected? Platform sends monthly invoice to providers? Automatic deduction? Manual tracking by admin? This is deferred but the mechanism should be defined.
- [ ] **Dispute resolution**: What happens if a customer and provider disagree on service quality, pricing, or completion? No dispute workflow is defined.
- [ ] **Data retention**: How long are completed requests, reviews, and messages retained? Indefinitely? Archival policy?
- [ ] **Portfolio image moderation**: Should admins review portfolio images before they're visible, or is post-publication reporting sufficient?
- [ ] **Provider capacity management**: Can providers set a maximum number of concurrent requests? Or is availability purely informational?
- [ ] **Email notifications**: Spec says "in-app only" for notifications, but what about password reset, account verification, or critical security alerts? Email still needed for auth flows?

## Decisions Log

> **Q: Which technology stack?**
> **A: React + Node.js + PostgreSQL** — Full-stack JavaScript ecosystem with strong community support, TypeScript for type safety, and relational data modeling that fits the domain well. Team familiarity and hiring pool also favor this choice.

> **Q: Authentication approach?**
> **A: Email/password + OAuth (Google, Facebook)** — Maximizes accessibility for users who prefer quick social login while supporting traditional email/password for those without accounts or who prefer it. JWT in HTTP-only cookies for security.

> **Q: Provider registration workflow?**
> **A: Immediate pending status, admin reviews and approves/rejects with optional reason** — Ensures quality control and trust in the marketplace. Providers can edit and resubmit if rejected, creating a feedback loop.

> **Q: How should customers contact providers?**
> **A: In-app messaging system only** — Protects user privacy, keeps communication on-platform for moderation and record-keeping, and builds engagement. Direct contact info deferred to prevent off-platform transactions.

> **Q: Rating and review system?**
> **A: Star ratings (1-5) + written reviews** — Combines quick quantitative signal (average rating) with qualitative feedback. Only allowed for completed service requests to prevent fake reviews.

> **Q: Booking/scheduling complexity?**
> **A: Simple request/accept workflow in v1** — Full calendar integration is complex and requires provider availability management. Simple workflow validated the concept first; can iterate later.

> **Q: Location handling?**
> **A: Text-based (city/region) with optional map visualization** — Avoids GPS permission requirements and battery drain. Map can be added later for visual browsing without being core to functionality.

> **Q: Provider profiles—basic or rich?**
> **A: Rich profiles with portfolio, bio, certifications, availability** — Differentiates this platform from simple directories. Portfolio images build trust and showcase quality of work.

> **Q: Bilingual support approach?**
> **A: Auto-detect from browser with manual override** — Respects user preference while reducing friction. Translation keys stored in JSON files for easy updates.

> **Q: Commission-based pricing—how to track?**
> **A: Commission rate stored per provider, calculated on request completion** — Flexible (can set platform default or custom rates). Actual billing/collection deferred; v1 only tracks the rate for future invoicing.

> **Q: Multiple admins or single admin?**
> **A: Multiple admins with same permissions** — Reduces bottleneck and allows team collaboration. Audit log tracks who did what. Role hierarchy deferred until needed.

> **Q: Admin can deactivate providers—soft or hard delete?**
> **A: Soft deactivation** — Preserves data (reviews, messages, requests) and allows reactivation. Hard delete would lose historical context and break referential integrity.

> **Q: Service categories extensible?**
> **A: Yes, admin-managed with hybrid suggestion** — Start with 3 (plumber, electrician, locksmith) but allow admin to add new ones as market demands evolve. Providers can suggest via support channel.
