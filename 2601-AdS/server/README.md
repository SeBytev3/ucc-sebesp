# Server - Services Marketplace API

Backend API for the Services Marketplace Platform built with Node.js, Express.js, TypeScript, and PostgreSQL.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and fill in your database credentials and other config

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (creates admin user and service categories)
npm run db:seed

# Start development server with hot reload
npm run dev
```

The API will be available at `http://localhost:4000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run test` | Run all tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Run database migrations (development) |
| `npm run db:migrate:prod` | Run database migrations (production) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:generate` | Generate Prisma client |

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration (env, i18n, etc.)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware (auth, validation, etc.)
│   ├── models/         # Data models and types
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Database migrations (auto-generated)
│   └── seed.ts         # Database seeding script
├── tests/
│   ├── setup.ts        # Jest setup
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── locales/            # i18n translation files
│   ├── es.json         # Spanish translations
│   └── en.json         # English translations
├── .env.example        # Environment variables template
├── jest.config.js      # Jest configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Environment Variables

See `.env.example` for all available configuration options.

**Required variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)

**Optional variables:**
- `PORT` - Server port (default: 4000)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:3000)
- `AWS_*` - S3 configuration for file uploads

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- tests/setup.test.ts
```

## API Documentation

API documentation will be available at `/api-docs` when implemented (Swagger/OpenAPI).

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript 5+
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Authentication:** JWT (HTTP-only cookies)
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **File Upload:** Multer + AWS S3
