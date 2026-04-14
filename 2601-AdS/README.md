# Services Marketplace Platform

A bilingual web platform connecting service providers (plumbers, electricians, locksmiths) with customers who need their services, featuring admin-approved provider registrations, rich provider profiles, in-app messaging, and a commission-based business model.

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers (both backend and frontend)
npm run dev

# Or run individually
npm run dev:server  # Backend API only
npm run dev:client  # Frontend only
```

## Project Structure

```
services-marketplace/
├── server/          # Backend API (Node.js + Express + PostgreSQL)
├── client/          # Frontend application (React + TypeScript)
├── plans/           # Project plans and specs
└── package.json     # Root workspace configuration
```

## Documentation

- [SPEC.md](plans/0000-services-marketplace/SPEC.md) - Full specification document
- [PLAN.md](plans/0000-services-marketplace/PLAN.md) - Implementation plan (Phase 1: Backend)

## Tech Stack

**Backend (Phase 1)**:
- Node.js 18+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Frontend (Phase 2)**:
- React 18+
- TypeScript
- React Router
- i18next (bilingual support)

## License

Private - All rights reserved
