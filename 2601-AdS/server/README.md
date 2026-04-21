# Server - Services Marketplace API

Backend API for the Services Marketplace Platform built with Node.js, Express.js, TypeScript, and PostgreSQL.

This document outlines the setup, execution, and deployment of the backend server, including comprehensive instructions for spinning up the environment from scratch using Docker Compose.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Spinning Up from Scratch (Docker Compose)](#spinning-up-from-scratch-docker-compose)
3. [Local Development (Without Docker for Backend)](#local-development-without-docker-for-backend)
4. [Environment Variables](#environment-variables)
5. [Available Scripts](#available-scripts)
6. [Testing](#testing)
7. [API Documentation](#api-documentation)
8. [Project Structure](#project-structure)

---

## Prerequisites

To run this project, you will need the following installed on your machine:
- **Docker** and **Docker Compose** (Highly recommended for the complete local environment)
- **Node.js** (v18 or higher) - *If running outside of Docker*
- **npm** (v9 or higher) - *If running outside of Docker*

---

## Spinning Up from Scratch (Docker Compose)

The easiest and recommended way to get the entire backend environment (Database + Node.js API) running is via Docker Compose.

1. **Clone the repository and navigate to the project root:**
   ```bash
   cd 2601-AdS
   ```

2. **Set up your environment variables:**
   The `docker-compose.yml` uses the `.env` file at the root of the `server/` directory.
   ```bash
   cd server
   cp .env.example .env
   # Open .env and adjust any necessary variables (see Environment Variables section below).
   cd ..
   ```

3. **Start the containers:**
   From the project root, run Docker Compose in detached mode:
   ```bash
   docker-compose up -d --build
   ```
   *This command will pull the Postgres image, build the Node.js backend image, and start both containers (`services-marketplace-db` and `services-marketplace-backend`).*

4. **Initialize the Database (Migrations & Seeding):**
   Once the containers are up and running, you need to apply the Prisma migrations and seed the database with the default Admin user and Categories.
   ```bash
   # Run migrations
   docker exec -it services-marketplace-backend npx prisma migrate deploy
   
   # Run the seed script
   docker exec -it services-marketplace-backend npm run db:seed
   ```

5. **Verify the API:**
   The backend should now be accessible. Check the health endpoint:
   ```bash
   curl http://localhost:4000/health
   # Expected response: {"status":"ok","timestamp":"..."}
   ```

---

## Local Development (Without Docker for Backend)

If you prefer to run the Postgres database in Docker but run the Node.js application locally for easier debugging:

1. **Start only the database container:**
   ```bash
   # From the project root
   docker-compose up -d db
   ```

2. **Navigate to the server directory and install dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Set up the `.env` file:**
   ```bash
   cp .env.example .env
   ```
   *Ensure your `DATABASE_URL` in `.env` points to `localhost` instead of `db` if running the Node process locally:*
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/services_marketplace?schema=public"`

4. **Generate Prisma Client and initialize DB:**
   ```bash
   npx prisma generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## Environment Variables

The project requires several environment variables to function correctly. A template is provided in `server/.env.example`.

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| **Server Config** | | |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `PORT` | The port the Express server will listen on | `4000` |
| `API_URL` | Base URL of the API | `http://localhost:4000` |
| **Database** | | |
| `DATABASE_URL` | Prisma connection string for PostgreSQL | `postgresql://postgres:postgres@localhost:5432/services_marketplace?schema=public` |
| **Authentication** | | |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-super-secret-jwt-key` |
| `JWT_EXPIRATION` | Token expiration time | `24h` |
| `JWT_COOKIE_EXPIRATION` | Cookie expiration time in days | `1` |
| **File Upload (Local/S3)** | | |
| `AWS_ACCESS_KEY_ID` | AWS Key (if using S3) | `your-aws-access-key` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret (if using S3) | `your-aws-secret-key` |
| `AWS_REGION` | AWS Region (if using S3) | `us-east-1` |
| `AWS_S3_BUCKET` | AWS Bucket name (if using S3) | `services-marketplace-portfolio` |
| `MAX_FILE_SIZE` | Max file upload size in bytes | `5242880` (5MB) |
| `MAX_PORTFOLIO_IMAGES` | Max images per provider portfolio | `10` |
| **Default Admin (Seeding)** | | |
| `ADMIN_EMAIL` | Default admin email created on seed | `admin@marketplace.com` |
| `ADMIN_PASSWORD` | Default admin password created on seed | `Admin123!` |
| **Security & Rate Limiting**| | |
| `CORS_ORIGIN` | Allowed origin for frontend requests | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Global rate limit window (ms) | `900000` (15m) |
| `RATE_LIMIT_MAX_REQUESTS` | Max global requests per window | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per window | `10` |
| `MESSAGE_THROTTLE_MAX` | Max messages sent per window | `50` |

---

## Available Scripts

From the `server/` directory, you can run the following npm scripts:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript source code to `dist/` |
| `npm run start` | Start the compiled production server |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm test` | Run all tests with coverage report |
| `npm run test:watch` | Run Jest tests in watch mode |
| `npm run db:generate` | Generate Prisma client based on schema |
| `npm run db:migrate` | Run Prisma migrations to update DB schema |
| `npm run db:seed` | Run the seed script to populate initial data |
| `npm run db:studio` | Open Prisma Studio (Database GUI) at `localhost:5555` |

---

## Testing

The project uses **Jest** and **Supertest** for comprehensive testing.

```bash
# Run the entire test suite (Unit, Integration, E2E) with coverage
npm test

# Run a specific test file
npx jest tests/e2e/request-review.e2e.test.ts

# Run tests continuously during development
npm run test:watch
```

*Note: The test suite runs entirely in memory using `jest-mock-extended` for Prisma. You do not need a running PostgreSQL database to execute `npm test`.*

---

## API Documentation

Swagger API documentation is integrated and available automatically when the server is running.
Navigate to: **`http://localhost:4000/api-docs`**

---

## Project Structure

```text
server/
├── src/
│   ├── config/         # DB, environment, i18n, swagger configuration
│   ├── controllers/    # Express route handlers
│   ├── locales/        # i18n JSON files (en, es)
│   ├── middleware/     # Auth, Validation, Error Handling, Rate Limiting
│   ├── routes/         # Express router definitions
│   ├── services/       # Core business logic
│   ├── utils/          # Utility functions and Zod validators
│   ├── index.ts        # Express app initialization
│   └── server.ts       # Server entry point (app.listen)
├── prisma/
│   ├── migrations/     # Auto-generated SQL migrations
│   ├── schema.prisma   # Prisma schema definitions
│   └── seed.ts         # Database seed script
├── tests/
│   ├── e2e/            # End-to-End workflow tests
│   ├── integration/    # API endpoint tests (Supertest)
│   ├── unit/           # Business logic and service tests
│   └── prisma.mock.ts  # Global Prisma Client mock
├── .env.example        # Environment variables template
├── eslint.config.mjs   # Linter configuration
├── jest.config.js      # Testing configuration
└── package.json        # Dependencies and scripts
```
